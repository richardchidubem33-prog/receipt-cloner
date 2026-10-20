import { NextRequest, NextResponse } from "next/server";
import { listTickets, updateTicket, createAccessKey, createFreeAccessKey } from "@/lib/store";

const ADMIN_CODE = process.env.ADMIN_CODE || "Richardx9";

function checkAuth(req: NextRequest) {
  const code = req.headers.get("x-admin-code") || "";
  return code === ADMIN_CODE;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tickets = await listTickets();
  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { ticketId, action, generate, plan, quantity } = body;

    if (generate === true) {
      const p = plan === "days" ? "days" : "receipts";
      const q = Math.max(1, Math.min(365, Number(quantity) || 1));
      const key = await createFreeAccessKey(p, q);
      return NextResponse.json({ accessKey: key });
    }

    if (!ticketId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    if (action === "reject") {
      const t = await updateTicket(ticketId, { status: "rejected" });
      return NextResponse.json(t);
    }

    const tickets = await listTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (ticket.status === "approved") {
      return NextResponse.json({ error: "Already approved", ticket });
    }
    const key = await createAccessKey(ticket);
    return NextResponse.json({ ticket, accessKey: key });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
