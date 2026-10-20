import { NextRequest, NextResponse } from "next/server";
import { createTicket, listTickets } from "@/lib/store";

export async function GET() {
  const tickets = await listTickets();
  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.txHash || !body.network || !body.plan || !body.quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const ticket = await createTicket({
      txHash: body.txHash,
      network: body.network,
      amount: body.amount || "2",
      plan: body.plan,
      quantity: Number(body.quantity),
      email: body.email,
    });
    return NextResponse.json(ticket);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
