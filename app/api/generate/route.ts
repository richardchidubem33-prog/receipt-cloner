import { NextRequest, NextResponse } from "next/server";
import { buildReceiptHTML } from "@/lib/receipts";
import { validateKey, consumeKey } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accessKey = body.accessKey || null;

    let clean = false;
    if (accessKey) {
      const key = await validateKey(accessKey);
      if (key) {
        const ok = await consumeKey(accessKey);
        clean = ok;
      }
    }

    const html = buildReceiptHTML(body, clean);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Clean": clean ? "1" : "0",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
