import { buildBankReceipt } from "./banks";
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
  dark?: boolean;
};

function money(amount: number, currency: string) {
  const c = (currency || "USD").toUpperCase();
  const n = Number(amount);
  if (c === "NGN" || c === "₦")
    return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (["BTC", "ETH", "BNB"].includes(c)) return `${n} ${c}`;
  if (["USDT", "USDC"].includes(c))
    return `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${c}`;
  if (c === "EUR" || c === "€") return `€${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  if (c === "GBP" || c === "£") return `£${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function antiLink(s: string) {
  return String(s || "").replace(/(\d)/g, "$1\u200B");
}

const OPAY_LOGO = `<svg width="85" height="32" viewBox="0 0 85 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m65.34 11.904-2.891 1.669c-1.525-1.174-3.086-1.725-5.139-1.725a8.517 8.517 0 0 0-8.349 6.824 8.511 8.511 0 0 0 8.84 10.188 8.516 8.516 0 0 0 3.701-1.09v.883a.223.223 0 0 0 .224.22h3.74a.223.223 0 0 0 .223-.22v-16.56a.223.223 0 0 0-.348-.183v-.006Zm-8.03 12.953a4.5 4.5 0 0 1-4.413-5.374 4.498 4.498 0 1 1 4.413 5.374Z" fill="#210F60"/><path d="M14.137 6a11.475 11.475 0 0 0-6.802 2.203 11.38 11.38 0 0 0-4.156 5.792.211.211 0 0 0 .107.252c.03.015.063.023.096.023h4.399a.212.212 0 0 0 .19-.114 6.945 6.945 0 0 1 2.632-2.727 6.993 6.993 0 0 1 3.68-.946c3.72.067 6.6 3.112 6.735 6.62a6.869 6.869 0 0 1-1.347 4.352 6.93 6.93 0 0 1-3.78 2.566 6.96 6.96 0 0 1-4.564-.338 6.914 6.914 0 0 1-3.356-3.096.211.211 0 0 0-.188-.114h-4.4a.213.213 0 0 0-.204.275 11.368 11.368 0 0 0 3.391 5.186 11.455 11.455 0 0 0 5.618 2.652c2.083.351 4.222.12 6.182-.665a11.424 11.424 0 0 0 4.917-3.787A11.324 11.324 0 0 0 24.31 12.27a11.395 11.395 0 0 0-4.197-4.566A11.474 11.474 0 0 0 14.137 6" fill="#1DCF9F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.62 19.517H2.229a.226.226 0 0 1-.211-.145.235.235 0 0 1-.017-.089v-3.692a.235.235 0 0 1 .14-.216.226.226 0 0 1 .088-.018h5.393a.226.226 0 0 1 .211.145.235.235 0 0 1 .017.089v3.692a.235.235 0 0 1-.14.216.226.226 0 0 1-.088.018" fill="#210F60"/><path d="M46.842 15.592c0-4.44-3.564-8.21-7.99-8.291h-8.308a.209.209 0 0 0-.209.209v21.028a.208.208 0 0 0 .209.209h3.748a.21.21 0 0 0 .209-.209V24.05h4.292c4.454-.048 8.049-3.394 8.049-8.453v-.005Zm-8.141 4.299H34.5v-8.427h4.2c2.196 0 3.975 1.944 3.975 4.132 0 2.722-1.779 4.294-3.974 4.294m45.758-8.042h-3.824a.533.533 0 0 0-.491.325l-4.069 9.418-4.01-9.418a.537.537 0 0 0-.493-.325l-3.86.02a.206.206 0 0 0-.203.19.208.208 0 0 0 .016.1l6.302 14.799-2.612 6.048a.208.208 0 0 0 .092.264.2.2 0 0 0 .099.025h3.822a.535.535 0 0 0 .492-.326l8.928-20.831a.207.207 0 0 0-.19-.29Z" fill="#210F60"/></svg>`;

// Official-style: teal ring + WHITE bar through left of O + white Pay
const OPAY2_LOGO = `<svg width="108" height="34" viewBox="0 0 108 34" xmlns="http://www.w3.org/2000/svg"><circle cx="17" cy="17" r="13" fill="none" stroke="#00D9A5" stroke-width="4.5"/><rect x="1" y="14" width="13" height="6" rx="3" fill="#ffffff"/><text x="38" y="24" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#ffffff">Pay</text></svg>`;

export function buildReceiptHTML(data: ReceiptData, clean: boolean): string {
  const p = (data.platform || "opay").toLowerCase();
  const dark = !!data.dark;
  const themeScript = `<script>(function(){if(${dark})document.body.classList.add('dark');})();</script>`;
  const wm = clean ? "" : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:50"><div style="transform:rotate(-28deg);color:rgba(220,40,40,0.22);font-size:16px;font-weight:700">UNLICENSED — Pay $2 USDT to remove</div></div>`;
  const cur = ["opay","opay2","kuda","firstbank","gtbank","fidelity","uba","uba2"].includes(p)
    ? (["NGN", "USD", "EUR", "GBP"].includes((data.currency || "").toUpperCase()) ? data.currency! : "NGN")
    : (data.currency || "USD");

  const bankHtml = buildBankReceipt(p, data, clean, wm, themeScript);
  if (bankHtml) return bankHtml;

  if (p === "opay") {
    const txNo = data.remark || `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
    const session = `10000${String(Date.now()).slice(-20)}`;
    const d = new Date();
    const day = d.getDate();
    const ord = (n: number) => { const s = ["th","st","nd","rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; };
    const dateStr = data.timestamp || `${d.toLocaleString("en-US", { month: "short" })} ${day}${ord(day)}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>*{box-sizing:border-box;margin:0;padding:0}a{color:inherit!important;text-decoration:none!important}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1a1a1a}.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:28px 24px 40px;position:relative;overflow:hidden}.bgmark{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.055;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='80'%3E%3Ctext x='10' y='50' font-family='Arial' font-size='28' font-weight='700' fill='%231DCF9F'%3EOPay%3C/text%3E%3C/svg%3E");background-repeat:repeat;background-size:140px 70px}.content{position:relative;z-index:1}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:36px}.logo svg{height:28px}.hdr-title{color:#9ca3af;font-size:14px}.amt{text-align:center;color:#12b76a;font-size:40px;font-weight:700;margin-bottom:10px}.status{text-align:center;font-size:18px;font-weight:600;margin-bottom:8px}.date{text-align:center;color:#9ca3af;font-size:13px;margin-bottom:28px}.divider{border:none;border-top:1px dashed #e5e7eb;margin:0 0 22px}.row{display:flex;justify-content:space-between;margin-bottom:22px}.label{color:#9ca3af;font-size:13px;width:38%}.value{text-align:right;flex:1;font-size:14px;font-weight:600;line-height:1.45}.value .sub{font-weight:400;color:#6b7280;font-size:13px}.foot{color:#9ca3af;font-size:12px;line-height:1.65}</style></head><body>
<div class="wrap"><div class="bgmark"></div>${wm}<div class="content">
<div class="header"><div class="logo">${OPAY_LOGO}</div><div class="hdr-title">Transaction Receipt</div></div>
<div class="amt">${money(data.amount, cur)}</div><div class="status">Successful</div><div class="date">${dateStr}</div><hr class="divider"/>
<div class="row"><div class="label">Recipient Details</div><div class="value">${data.toName || "—"}<div class="sub">${data.bank || "Bank"} | ${antiLink(data.toAccount || "—")}</div></div></div>
<div class="row"><div class="label">Sender Details</div><div class="value">${data.fromName || "—"}<div class="sub">OPay | ${antiLink("706****493")}</div></div></div>
<div class="row"><div class="label">Transaction No.</div><div class="value" style="font-size:13px;word-break:break-all">${txNo}</div></div>
<div class="row"><div class="label">Session ID</div><div class="value" style="font-size:12px;word-break:break-all">${session}</div></div>
<hr class="divider"/><div class="foot">Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.</div>
</div></div>${themeScript}</body></html>`;
  }

  if (p === "opay2") {
    const txNo = data.remark || `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
    const session = `10000${String(Date.now()).slice(-22)}`;
    const d = new Date();
    const day = d.getDate();
    const ord = (n: number) => { const s = ["th","st","nd","rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; };
    const dateStr = data.timestamp || `${d.toLocaleString("en-US", { month: "short" })} ${day}${ord(day)}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    const toName = (data.toName || "RECIPIENT").toUpperCase();
    const fromName = (data.fromName || "SENDER").toUpperCase();
    const bank = data.bank || "United Bank For Africa";
    const toAcct = data.toAccount || "—";
    const fromMask = "905****" + String(Math.floor(Math.random()*900+100));
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#2b2b2b;color:#e8e8e8;min-height:100vh}
.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:32px 22px 36px;position:relative;overflow:hidden;background:#2b2b2b}
.wrap::before,.wrap::after{content:"";position:absolute;left:0;right:0;height:14px;background:radial-gradient(circle at 12px 0,#1a1a1a 7px,transparent 7.5px);background-size:24px 14px;background-repeat:repeat-x;z-index:2}
.wrap::before{top:0;transform:rotate(180deg)}
.wrap::after{bottom:0}
.bgmark{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.06;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='70'%3E%3Ctext x='6' y='48' font-family='Arial,sans-serif' font-size='28' font-weight='700' fill='%23ffffff'%3EOPay%3C/text%3E%3C/svg%3E");background-repeat:repeat;background-size:140px 68px}
.content{position:relative;z-index:1;padding-top:8px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
.logo svg{height:30px;width:auto;display:block}
.hdr-title{color:#a3a3a3;font-size:14px;font-weight:500}
.amt{text-align:center;color:#00D9A5;font-size:38px;font-weight:700;margin-bottom:10px;letter-spacing:-0.5px}
.status{text-align:center;font-size:18px;font-weight:600;color:#f0f0f0;margin-bottom:6px}
.date{text-align:center;color:#9a9a9a;font-size:13px;margin-bottom:28px}
.row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;gap:12px}
.label{color:#9a9a9a;font-size:13px;flex-shrink:0;width:36%}
.value{text-align:right;flex:1;font-size:14px;font-weight:600;color:#f0f0f0;line-height:1.45}
.value .sub{display:block;font-weight:400;color:#9a9a9a;font-size:12px;margin-top:3px}
.tx{display:flex;justify-content:space-between;margin-bottom:14px;font-size:13px;gap:10px}
.tx .l{color:#9a9a9a;flex-shrink:0}
.tx .r{color:#e0e0e0;font-weight:500;text-align:right;word-break:break-all}
.divider{border:none;border-top:1px dashed #4a4a4a;margin:20px 0 18px}
.foot{color:#9a9a9a;font-size:11.5px;line-height:1.65}
</style></head><body>
<div class="wrap"><div class="bgmark"></div>${wm}
  <div class="content">
    <div class="header">
      <div class="logo">${OPAY2_LOGO}</div>
      <div class="hdr-title">Transaction Receipt</div>
    </div>
    <div class="amt">₦${Number(data.amount).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
    <div class="status">Successful</div>
    <div class="date">${dateStr}</div>
    <div class="row"><div class="label">Recipient Details</div><div class="value">${toName}<span class="sub">${bank} | ${toAcct}</span></div></div>
    <div class="row"><div class="label">Sender Details</div><div class="value">${fromName}<span class="sub">OPay | ${fromMask}</span></div></div>
    <div class="tx"><span class="l">Transaction No.</span><span class="r">${txNo}</span></div>
    <div class="tx"><span class="l">Session ID</span><span class="r">${session}</span></div>
    <hr class="divider"/>
    <div class="foot">Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.</div>
  </div>
</div>${themeScript}</body></html>`;
  }

  if (p === "cashapp") {
    const name = data.toName || "Recipient";
    const handle = data.toAccount || data.remark || ("$" + name.replace(/\s+/g, "").slice(0, 12));
    const handleClean = handle.startsWith("$") ? handle : "$" + handle;
    const d = new Date();
    const dateStr = data.timestamp || d.toLocaleString("en-US", { month: "short", day: "numeric" }) + " at " + d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const initial = name.charAt(0).toUpperCase();
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#111;min-height:100vh}.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:16px 24px 40px;display:flex;flex-direction:column}.top{display:flex;justify-content:space-between;padding:8px 0 24px}.avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#00d632,#00a028);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff}.profile{text-align:center}.name{font-size:18px;font-weight:600}.handle{font-size:14px;color:#888}.amt-block{text-align:center;margin:48px 0 12px}.amt{font-size:48px;font-weight:700}.date{text-align:center;color:#999;font-size:14px;margin-bottom:auto;padding-bottom:40px}.actions{margin-top:auto}.btn-green{display:block;width:100%;background:#00d632;color:#fff;border:none;border-radius:28px;padding:16px;font-size:16px;font-weight:600;margin-bottom:12px;text-align:center}.btn-outline{display:block;width:100%;background:#fff;color:#111;border:1.5px solid #ddd;border-radius:28px;padding:16px;font-size:16px;font-weight:500;text-align:center}</style></head><body>
<div class="wrap">${wm}<div class="top"><span>‹</span><span>···</span></div>
<div class="profile"><div class="avatar">${initial}</div><div class="name">${name}</div><div class="handle">Payment to ${handleClean}</div></div>
<div class="amt-block"><div class="amt">${money(data.amount, data.currency || "USD")}</div></div>
<div class="date">${dateStr}</div>
<div class="actions"><div class="btn-green">Replied ♥</div><div class="btn-outline">Web Receipt</div></div>
</div>${themeScript}</body></html>`;
  }

  const ts = data.timestamp || new Date().toLocaleString();
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="font-family:sans-serif;padding:24px;background:#111;color:#eee">
<div style="max-width:400px;margin:0 auto;background:#1a1a1a;border-radius:12px;padding:24px;position:relative">${wm}
<div style="text-align:center;font-weight:600;margin-bottom:12px">${(data.platform||"Receipt").toUpperCase()}</div>
<div style="text-align:center;font-size:28px;font-weight:700;margin-bottom:16px">${money(data.amount, cur)}</div>
<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333"><span style="color:#888">To</span><span>${data.toName||data.toAddress||"—"}</span></div>
<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333"><span style="color:#888">Date</span><span>${ts}</span></div>
<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:#888">Status</span><span>Completed</span></div>
</div>${themeScript}</body></html>`;
}
