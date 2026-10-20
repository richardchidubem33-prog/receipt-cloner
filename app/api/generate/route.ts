import { NextRequest, NextResponse } from "next/server";
import { generateReceiptPDF } from "@/lib/pdf";
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

    const pdfBytes = await generateReceiptPDF(body, clean);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt_${body.platform || "gen"}.pdf"`,
        "X-Clean": clean ? "1" : "0",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
