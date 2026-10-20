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

export function buildReceiptHTML(data: ReceiptData, clean: boolean): string {
  const p = (data.platform || "opay").toLowerCase();
  const now = new Date();
  const dark = !!data.dark;
  const themeScript = `<script>(function(){if(${dark})document.body.classList.add('dark');})();</script>`;
  const wm = clean ? "" : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:50"><div style="transform:rotate(-28deg);color:rgba(220,40,40,0.22);font-size:16px;font-weight:700">UNLICENSED — Pay $2 USDT to remove</div></div>`;

  const cur =
    p === "opay" || p === "kuda"
      ? (["NGN", "USD", "EUR", "GBP"].includes((data.currency || "").toUpperCase()) ? data.currency! : "NGN")
      : (data.currency || "USD");

  if (p === "opay") {
    const txNo = data.remark || `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
    const session = `10000${String(Date.now()).slice(-20)}`;
    const d = new Date();
    const day = d.getDate();
    const ord = (n: number) => { const s = ["th","st","nd","rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; };
    const dateStr = data.timestamp || `${d.toLocaleString("en-US", { month: "short" })} ${day}${ord(day)}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    const senderPhone = "706****493";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
a,a:link,a:visited{color:inherit!important;text-decoration:none!important}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#fff;color:#1a1a1a}
.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:28px 24px 40px;position:relative;overflow:hidden}
.bgmark{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.055;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='80'%3E%3Ctext x='10' y='50' font-family='Arial' font-size='28' font-weight='700' fill='%231DCF9F'%3EOPay%3C/text%3E%3C/svg%3E");background-repeat:repeat;background-size:140px 70px}
.content{position:relative;z-index:1}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:36px}
.logo svg{height:28px;width:auto}
.hdr-title{color:#9ca3af;font-size:14px;font-weight:500}
.amt{text-align:center;color:#12b76a;font-size:40px;font-weight:700;margin-bottom:10px}
.status{text-align:center;font-size:18px;font-weight:600;color:#111;margin-bottom:8px}
.date{text-align:center;color:#9ca3af;font-size:13px;margin-bottom:28px}
.divider{border:none;border-top:1px dashed #e5e7eb;margin:0 0 22px}
.row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}
.label{color:#9ca3af;font-size:13px;width:38%}
.value{text-align:right;flex:1;font-size:14px;font-weight:600;color:#111;line-height:1.45}
.value .sub{font-weight:400;color:#6b7280;font-size:13px;margin-top:2px}
.foot{margin-top:8px;color:#9ca3af;font-size:12px;line-height:1.65}
</style></head><body>
<div class="wrap">
  <div class="bgmark"></div>
  ${wm}
  <div class="content">
    <div class="header"><div class="logo">${OPAY_LOGO}</div><div class="hdr-title">Transaction Receipt</div></div>
    <div class="amt">${money(data.amount, cur)}</div>
    <div class="status">Successful</div>
    <div class="date">${dateStr}</div>
    <hr class="divider"/>
    <div class="row"><div class="label">Recipient Details</div><div class="value">${data.toName || "—"}<div class="sub">${data.bank || "Bank"} | ${antiLink(data.toAccount || "—")}</div></div></div>
    <div class="row"><div class="label">Sender Details</div><div class="value">${data.fromName || "—"}<div class="sub">OPay | ${antiLink(senderPhone)}</div></div></div>
    <div class="row"><div class="label">Transaction No.</div><div class="value" style="font-size:13px;word-break:break-all">${txNo}</div></div>
    <div class="row"><div class="label">Session ID</div><div class="value" style="font-size:12px;word-break:break-all">${session}</div></div>
    <hr class="divider"/>
    <div class="foot">Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.</div>
  </div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "binance") {
    const c = (data.currency || "USDT").toUpperCase();
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#181a20;color:#eaecef;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:420px;margin:0 auto;padding:40px 20px;position:relative}
.icon{width:68px;height:68px;background:#0ecb81;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:34px;color:#fff}
.t{text-align:center;font-size:18px;font-weight:600;margin-bottom:26px}
.box{background:#1e2026;border-radius:12px;padding:8px 16px;margin-bottom:18px}
.row{display:flex;justify-content:space-between;padding:13px 0;font-size:14px;border-bottom:1px solid #2b2f36}
.row:last-child{border:none}
.l{color:#848e9c}.r{color:#eaecef;text-align:right;max-width:62%;word-break:break-all;font-weight:500}
.note{color:#848e9c;font-size:12px;margin-bottom:22px}
.btns{display:flex;gap:12px}
.b1{flex:1;background:#2b2f36;color:#eaecef;border:none;padding:14px;border-radius:8px;font-weight:600}
.b2{flex:1;background:#f0b90b;color:#181a20;border:none;padding:14px;border-radius:8px;font-weight:700}
</style></head><body>
<div class="wrap">${wm}
  <div class="icon">✓</div>
  <div class="t">Withdrawal Request Successful</div>
  <div class="box">
    <div class="row"><span class="l">Amount</span><span class="r">${money(data.amount, c)}</span></div>
    <div class="row"><span class="l">Network</span><span class="r">${data.network || "TRX"}</span></div>
    <div class="row"><span class="l">Source</span><span class="r">Spot Wallet</span></div>
    <div class="row"><span class="l">Address</span><span class="r">${data.toAddress || "—"}</span></div>
    <div class="row"><span class="l">Network fee</span><span class="r">${data.remark || (c === "USDT" ? "1 USDT" : "—")}</span></div>
  </div>
  <div class="note">Crypto transferred out of Binance.</div>
  <div class="btns"><button class="b1">Save Address</button><button class="b2">View History</button></div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "trustwallet" || p === "coinbase") {
    const c = (data.currency || "USDT").toUpperCase();
    const brand = p === "coinbase" ? "Coinbase" : "Trust Wallet";
    const accent = p === "coinbase" ? "#0052FF" : "#3375BB";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d12;color:#e8e8f0;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:420px;margin:0 auto;padding:28px 20px;position:relative}
.card{background:#1a1a24;border-radius:16px;padding:22px}
.t{text-align:center;font-size:15px;font-weight:600;margin-bottom:10px;color:#aaa}
.amt{text-align:center;font-size:28px;font-weight:700;margin-bottom:18px}
.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #2a2a38;font-size:14px}
.l{color:#9a9ab0}.r{color:#e8e8f0;text-align:right;max-width:60%;word-break:break-all}
.status{color:#3fb950;background:#12261e;padding:3px 10px;border-radius:8px;font-size:12px}
.btn{display:block;width:100%;margin-top:20px;background:${accent};color:#fff;border:none;border-radius:12px;padding:14px;font-weight:600}
</style></head><body>
<div class="wrap">${wm}
  <div class="card">
    <div class="t">Sent ${c} · ${brand}</div>
    <div class="amt">${money(data.amount, c)}</div>
    <div class="row"><span class="l">Network</span><span class="r">${data.network || (c==="BTC"?"Bitcoin":c==="ETH"?"Ethereum":"BNB Smart Chain")}</span></div>
    <div class="row"><span class="l">Status</span><span class="r"><span class="status">Completed</span></span></div>
    <div class="row"><span class="l">To</span><span class="r">${data.toAddress || data.toName || "—"}</span></div>
    <button class="btn">View on Explorer</button>
  </div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "kuda") {
    const amt = money(data.amount, cur);
    const ref = data.remark || ("0" + Date.now() + "PP");
    const acct = antiLink(data.toAccount || "—");
    const toName = (data.toName || "RECIPIENT").toUpperCase();
    const bank = (data.bank || "PALMPAY").toUpperCase();
    const d = new Date();
    const fmt = (x: Date) => x.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " · " + x.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const headerDate = "On " + d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " at " + d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
a{color:inherit!important;text-decoration:none!important}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f7f4ef;color:#1a1a1a;min-height:100vh}
.wrap{max-width:420px;margin:0 auto;padding:16px 20px 40px;position:relative;min-height:100vh}
.nav{display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:28px}
.back{position:absolute;left:0;width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center}
.title{font-size:17px;font-weight:600}
.amt{text-align:center;font-size:32px;font-weight:700;margin-bottom:6px}
.name{text-align:center;font-size:13px;font-weight:600;margin-bottom:4px}
.date{text-align:center;font-size:12px;color:#8a8578;margin-bottom:18px}
.badge{display:flex;align-items:center;gap:6px;background:#f0ebe3;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:600;margin:0 auto 28px;width:fit-content}
.timeline{padding:0 8px;margin-bottom:20px}
.tl-item{display:flex;gap:14px;padding-bottom:22px}
.tl-dot{width:28px;height:28px;border-radius:50%;background:#e8f8ef;border:2px solid #1DBF73;display:flex;align-items:center;justify-content:center;color:#1DBF73;font-size:12px;flex-shrink:0}
.tl-title{font-size:14px;font-weight:700}
.tl-time{font-size:12px;color:#8a8578;margin-left:6px}
.tl-sub{font-size:12px;color:#8a8578}
.view-btn{background:#e9d5ff;color:#6b21a8;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:600;margin:0 0 24px 42px}
.card{background:#f0ebe3;border-radius:16px;padding:18px;margin-bottom:20px}
.card-label{font-size:12px;color:#8a8578}
.card-val{font-size:15px;font-weight:700}
.field{margin-bottom:14px}
.field-l{font-size:12px;color:#8a8578}
.field-v{font-size:14px;font-weight:600}
.share{width:100%;background:#3b0764;color:#fff;border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:700}
</style></head><body>
<div class="wrap">${wm}
  <div class="nav"><div class="back">←</div><div class="title">Transaction</div></div>
  <div class="amt">-${amt}</div>
  <div class="name">${toName}</div>
  <div class="date">${headerDate}</div>
  <div class="badge">✈ Transfer ▾</div>
  <div class="timeline">
    <div class="tl-item"><div class="tl-dot">↑</div><div><div class="tl-title">Initiated<span class="tl-time">${fmt(d)}</span></div><div class="tl-sub">You made this transaction</div></div></div>
    <div class="tl-item"><div class="tl-dot">→</div><div><div class="tl-title">In Progress<span class="tl-time">${fmt(d)}</span></div><div class="tl-sub">Your transaction is on its way.</div></div></div>
    <div class="tl-item"><div class="tl-dot">✓</div><div><div class="tl-title">Completed<span class="tl-time">${fmt(new Date(d.getTime()+60000))}</span></div><div class="tl-sub">${bank} received your transaction.</div></div></div>
  </div>
  <button class="view-btn">View Details</button>
  <div class="card">
    <div class="field"><div class="card-label">To</div><div class="card-val">${bank}</div></div>
    <div class="field"><div class="field-l">Payment Method</div><div class="field-v">Outward Transfer</div></div>
    <div class="field"><div class="field-l">Account number</div><div class="field-v">${acct}</div></div>
    <div class="field"><div class="field-l">Transaction Reference</div><div class="field-v" style="font-size:12px;word-break:break-all">${ref}</div></div>
  </div>
  <button class="share">Share</button>
</div>
${themeScript}</body></html>`;
  }

  const ts = data.timestamp || now.toLocaleString();
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
a{color:inherit!important;text-decoration:none!important}
body{font-family:-apple-system,sans-serif;background:#f5f5f7;min-height:100vh;padding:24px}
.card{max-width:400px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;position:relative}
.amt{font-size:28px;font-weight:700;text-align:center;margin:16px 0}
.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;font-size:14px}
.l{color:#888}
</style></head><body>
<div class="card">${wm}
  <div style="text-align:center;font-weight:600">${(data.platform || "Receipt").toUpperCase()}</div>
  <div class="amt">${money(data.amount, cur)}</div>
  <div class="row"><span class="l">To</span><span>${data.toName || data.toAddress || "—"}</span></div>
  <div class="row"><span class="l">Date</span><span>${ts}</span></div>
  <div class="row"><span class="l">Status</span><span>Completed</span></div>
</div>
${themeScript}</body></html>`;
}
