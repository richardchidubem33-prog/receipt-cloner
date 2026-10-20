import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type ReceiptData = {
  platform: string;
  amount: number;
  currency: string;
  toName?: string;
  toAccount?: string;
  toAddress?: string;
  fromName?: string;
  bank?: string;
  network?: string;
  remark?: string;
  timestamp?: string;
  accessKey?: string | null;
};

const WATERMARK = "UNLICENSED — Pay $2 USDT to remove";

export async function generateReceiptPDF(data: ReceiptData, clean: boolean): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const brandColors: Record<string, [number, number, number]> = {
    opay: [0.1, 0.7, 0.3],
    paypal: [0.0, 0.44, 0.73],
    zelle: [0.43, 0.12, 0.83],
    cashapp: [0.0, 0.84, 0.2],
    applepay: [0.1, 0.1, 0.1],
    trustwallet: [0.2, 0.46, 0.73],
    coinbase: [0.0, 0.32, 1.0],
    binance: [0.94, 0.73, 0.04],
  };

  const color = brandColors[data.platform] || [0.2, 0.2, 0.2];
  const [r, g, b] = color;

  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(r, g, b) });
  page.drawText(data.platform.toUpperCase(), {
    x: 40,
    y: height - 50,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("SUCCESSFUL", {
    x: 40,
    y: height - 120,
    size: 14,
    font: fontBold,
    color: rgb(0.05, 0.5, 0.2),
  });

  const amountStr =
    data.currency === "NGN" || data.currency === "₦"
      ? `₦${data.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
      : data.currency.length <= 4 && !["USD", "EUR"].includes(data.currency)
      ? `${data.amount} ${data.currency}`
      : `$${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  page.drawText(amountStr, {
    x: 40,
    y: height - 170,
    size: 28,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const lines: [string, string][] = [
    ["Date", data.timestamp || new Date().toLocaleString()],
    ["From", data.fromName || "—"],
    ["To", data.toName || data.toAddress || data.toAccount || "—"],
  ];
  if (data.bank) lines.push(["Bank", data.bank]);
  if (data.network) lines.push(["Network", data.network]);
  if (data.toAccount) lines.push(["Account", data.toAccount]);
  if (data.remark) lines.push(["Note", data.remark]);
  lines.push(["Status", "Completed"]);
  lines.push(["Platform", data.platform]);

  let y = height - 220;
  for (const [label, value] of lines) {
    page.drawText(label, { x: 40, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(String(value).slice(0, 55), {
      x: 160,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 28;
  }

  page.drawText("This is a system generated receipt. Keep for your records.", {
    x: 40,
    y: 60,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  if (!clean) {
    page.drawText(WATERMARK, {
      x: 80,
      y: height / 2,
      size: 18,
      font: fontBold,
      color: rgb(0.85, 0.15, 0.15),
      rotate: { type: "degrees" as any, angle: 35 },
      opacity: 0.35,
    });
    page.drawText("Pay $2 USDT  ·  TRON or BSC", {
      x: 120,
      y: height / 2 - 30,
      size: 12,
      font,
      color: rgb(0.7, 0.1, 0.1),
      rotate: { type: "degrees" as any, angle: 35 },
      opacity: 0.4,
    });
  }

  return doc.save();
}
