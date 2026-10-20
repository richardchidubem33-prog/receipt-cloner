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

function money(amount: number, currency: string) {
  if (currency === "NGN" || currency === "₦")
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  if (["BTC", "ETH", "USDT", "USDC", "BNB"].includes(currency.toUpperCase()))
    return `${amount} ${currency.toUpperCase()}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export async function generateReceiptPDF(data: ReceiptData, clean: boolean): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const p = (data.platform || "opay").toLowerCase();

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });

  if (p === "opay") {
    page.drawText("OPay", { x: 40, y: height - 50, size: 18, font: fontBold, color: rgb(0.05, 0.55, 0.35) });
    page.drawText("Transaction Receipt", { x: width - 160, y: height - 50, size: 11, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(money(data.amount, data.currency || "NGN"), { x: 40, y: height - 120, size: 28, font: fontBold, color: rgb(0.1, 0.7, 0.3) });
    page.drawText("Successful", { x: 40, y: height - 150, size: 14, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
    page.drawText(data.timestamp || new Date().toLocaleString(), { x: 40, y: height - 175, size: 10, font, color: rgb(0.45, 0.45, 0.45) });
    let y = height - 230;
    const rows: [string, string][] = [
      ["Recipient Details", data.toName || "—"],
      ["", `${data.bank || "Bank"} | ${data.toAccount || "—"}`],
      ["Sender Details", data.fromName || "—"],
      ["", "OPay | ****"],
      ["Transaction Type", "Transfer to Bank Account"],
      ["Transaction No.", data.remark || String(Date.now())],
      ["Session ID", "10000" + String(Date.now()).slice(-18)],
    ];
    for (const [label, value] of rows) {
      if (label) page.drawText(label, { x: 40, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
      page.drawText(String(value).slice(0, 50), { x: 220, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 22;
    }
    page.drawText("Enjoy a better life with OPay. Licensed by CBN.", { x: 40, y: 80, size: 8, font, color: rgb(0.55, 0.55, 0.55) });
  } else if (p === "paypal") {
    page.drawText("PayPal", { x: 40, y: height - 50, size: 20, font: fontBold, color: rgb(0, 0.44, 0.73) });
    page.drawText("Payment sent", { x: 40, y: height - 100, size: 14, font: fontBold, color: rgb(0.1, 0.55, 0.25) });
    page.drawText(money(data.amount, data.currency || "USD") + " USD", { x: 40, y: height - 160, size: 26, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    let y = height - 220;
    for (const [l, v] of [["To", data.toName || "—"], ["Transaction ID", data.remark || Math.random().toString(16).slice(2, 10)], ["Date", data.timestamp || new Date().toUTCString()], ["Payment method", "PayPal balance"], ["Status", "Completed"]] as [string, string][]) {
      page.drawText(l, { x: 40, y, size: 10, font, color: rgb(0.45, 0.45, 0.45) });
      page.drawText(String(v).slice(0, 45), { x: 200, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 28;
    }
  } else if (p === "zelle") {
    page.drawText("ZELLE TRANSACTION DETAILS", { x: 40, y: height - 50, size: 10, font, color: rgb(0.3, 0.3, 0.4) });
    page.drawText("Payment sent.", { x: 40, y: height - 90, size: 18, font: fontBold, color: rgb(0.15, 0.1, 0.4) });
    let y = height - 160;
    for (const [l, v] of [["TO", `${data.toName || "—"}`], ["AMOUNT", money(data.amount, data.currency || "USD")], ["FROM", data.fromName || "Checking"], ["SENT", data.timestamp || new Date().toDateString()], ["MEMO", data.remark || ""], ["CONFIRMATION CODE", Math.random().toString(36).slice(2, 12).toUpperCase()]] as [string, string][]) {
      page.drawText(l, { x: 40, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.25) });
      page.drawText(String(v).slice(0, 40), { x: 200, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
      y -= 30;
    }
  } else if (p === "cashapp") {
    page.drawRectangle({ x: 0, y: height - 280, width, height: 280, color: rgb(0, 0.84, 0.2) });
    page.drawText("Payment Sent!", { x: width / 2 - 55, y: height - 80, size: 14, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(money(data.amount, data.currency || "USD"), { x: 40, y: height - 150, size: 36, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(data.toName || data.toAddress || "Recipient", { x: 40, y: height - 200, size: 12, font, color: rgb(1, 1, 1) });
  } else if (p === "binance") {
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.08, 0.09, 0.12) });
    page.drawText("Withdrawal Request Successful", { x: 40, y: height - 100, size: 16, font: fontBold, color: rgb(1, 1, 1) });
    let y = height - 160;
    for (const [l, v] of [["Amount", money(data.amount, data.currency || "USDT")], ["Network", data.network || "TRX"], ["Source", "Spot Wallet"], ["Address", (data.toAddress || "—").slice(0, 36)], ["Network fee", data.remark || "1 USDT"]] as [string, string][]) {
      page.drawText(l, { x: 40, y, size: 10, font, color: rgb(0.6, 0.6, 0.65) });
      page.drawText(String(v), { x: 200, y, size: 11, font: fontBold, color: rgb(0.95, 0.95, 0.95) });
      y -= 28;
    }
  } else if (p === "trustwallet" || p === "coinbase") {
    page.drawText(p === "coinbase" ? "Coinbase" : "Trust Wallet", { x: 40, y: height - 50, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.15) });
    page.drawText(money(data.amount, data.currency || "BTC"), { x: 40, y: height - 120, size: 22, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    let y = height - 180;
    for (const [l, v] of [["Network", data.network || "Bitcoin"], ["Status", "Completed"], ["Time", data.timestamp || new Date().toLocaleString()], ["To", (data.toAddress || "—").slice(0, 40)]] as [string, string][]) {
      page.drawText(l, { x: 40, y, size: 10, font, color: rgb(0.45, 0.45, 0.45) });
      page.drawText(String(v), { x: 180, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 26;
    }
  } else if (p === "applepay") {
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.05, 0.05, 0.05) });
    page.drawText("Apple Cash", { x: 40, y: height - 60, size: 18, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(money(data.amount, data.currency || "USD"), { x: 40, y: height - 140, size: 28, font: fontBold, color: rgb(1, 1, 1) });
  } else {
    page.drawText((data.platform || "RECEIPT").toUpperCase(), { x: 40, y: height - 50, size: 18, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(money(data.amount, data.currency || "USD"), { x: 40, y: height - 120, size: 26, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  }

  if (!clean) {
    page.drawText(WATERMARK, {
      x: 70, y: height / 2, size: 16, font: fontBold,
      color: rgb(0.85, 0.15, 0.15), rotate: { type: "degrees" as any, angle: 32 }, opacity: 0.35,
    });
  }

  return doc.save();
}
