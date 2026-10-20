// Simple file-based store (works on Vercel with /tmp or switch to KV later)
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const TICKETS_FILE = path.join(DATA_DIR, "tickets.json");
const KEYS_FILE = path.join(DATA_DIR, "access_keys.json");

export type Ticket = {
  id: string;
  txHash: string;
  network: "TRON" | "BSC";
  amount: string;
  plan: "days" | "receipts";
  quantity: number;
  email?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  accessKey?: string;
  expiresAt?: string;
};

export type AccessKey = {
  key: string;
  plan: "days" | "receipts";
  remaining: number;
  expiresAt?: string;
  createdAt: string;
  ticketId: string;
};

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: any) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export async function listTickets(): Promise<Ticket[]> {
  return readJson<Ticket[]>(TICKETS_FILE, []);
}

export async function createTicket(
  data: Omit<Ticket, "id" | "status" | "createdAt">
): Promise<Ticket> {
  const tickets = await listTickets();
  const ticket: Ticket = {
    ...data,
    id: uuidv4(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  tickets.unshift(ticket);
  await writeJson(TICKETS_FILE, tickets);
  return ticket;
}

export async function updateTicket(
  id: string,
  patch: Partial<Ticket>
): Promise<Ticket | null> {
  const tickets = await listTickets();
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tickets[idx] = { ...tickets[idx], ...patch };
  await writeJson(TICKETS_FILE, tickets);
  return tickets[idx];
}

export async function listKeys(): Promise<AccessKey[]> {
  return readJson<AccessKey[]>(KEYS_FILE, []);
}

export async function createAccessKey(
  ticket: Ticket
): Promise<AccessKey> {
  const keys = await listKeys();
  const key = "RC-" + uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase();
  const now = new Date();
  let expiresAt: string | undefined;
  let remaining = ticket.quantity;

  if (ticket.plan === "days") {
    const exp = new Date(now.getTime() + ticket.quantity * 24 * 60 * 60 * 1000);
    expiresAt = exp.toISOString();
    remaining = ticket.quantity;
  }

  const accessKey: AccessKey = {
    key,
    plan: ticket.plan,
    remaining,
    expiresAt,
    createdAt: now.toISOString(),
    ticketId: ticket.id,
  };
  keys.push(accessKey);
  await writeJson(KEYS_FILE, keys);

  await updateTicket(ticket.id, {
    status: "approved",
    accessKey: key,
    expiresAt,
  });

  return accessKey;
}

export async function validateKey(key: string): Promise<AccessKey | null> {
  const keys = await listKeys();
  const found = keys.find((k) => k.key === key);
  if (!found) return null;
  if (found.expiresAt && new Date(found.expiresAt) < new Date()) return null;
  if (found.plan === "receipts" && found.remaining <= 0) return null;
  return found;
}

export async function consumeKey(key: string): Promise<boolean> {
  const keys = await listKeys();
  const idx = keys.findIndex((k) => k.key === key);
  if (idx === -1) return false;
  const k = keys[idx];
  if (k.plan === "receipts") {
    if (k.remaining <= 0) return false;
    k.remaining -= 1;
    keys[idx] = k;
    await writeJson(KEYS_FILE, keys);
  }
  return true;
}
