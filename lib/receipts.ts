import { buildBankReceipt } from "./banks";
import { buildOpayHTML } from "./opay";
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
  if (c === "NGN" || c === "₦") return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (["BTC", "ETH", "BNB"].includes(c)) return `${n} ${c}`;
  if (["USDT", "USDC"].includes(c)) return `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${c}`;
  if (c === "EUR" || c === "€") return `€${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  if (c === "GBP" || c === "£") return `£${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
function antiLink(s: string) { return String(s || "").replace(/(\d)/g, "$1\u200B"); }

export function buildReceiptHTML(data: ReceiptData, clean: boolean): string {
  const p = (data.platform || "opay").toLowerCase();
  const dark = !!data.dark;
  const themeScript = `<script>(function(){if(${dark})document.body.classList.add('dark');})();</script>`;
  const wm = clean ? "" : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:50"><div style="transform:rotate(-28deg);color:rgba(220,40,40,0.22);font-size:16px;font-weight:700">UNLICENSED — Pay $2 USDT to remove</div></div>`;
  const cur = ["opay","opay2","kuda","firstbank","gtbank","fidelity","uba","uba2"].includes(p)
    ? (["NGN","USD","EUR","GBP"].includes((data.currency||"").toUpperCase()) ? data.currency! : "NGN")
    : (data.currency || "USD");

  const bankHtml = buildBankReceipt(p, data, clean, wm, themeScript);
  if (bankHtml) return bankHtml;

  if (p === "opay" || p === "opay2") {
    return buildOpayHTML(data, clean, wm, themeScript, money, antiLink, p === "opay2" ? "opay2" : "opay");
  }

  // PAYPAL
  if (p === "paypal") {
    const d = new Date();
    const dateTop = data.timestamp || d.toLocaleString("en-US",{month:"short",day:"2-digit",year:"numeric"});
    const dateFull = d.toLocaleString("en-US",{month:"long",day:"numeric",year:"numeric"});
    const timeUTC = d.toLocaleString("en-US",{hour:"numeric",minute:"2-digit",hour12:true})+" UTC";
    const txid = data.remark || Math.random().toString(16).slice(2,10);
    const email = data.toAccount || "";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}a{color:#0070ba}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f7fa;color:#111;min-height:100vh}.wrap{max-width:420px;margin:0 auto;min-height:100vh;position:relative}.header{background:linear-gradient(180deg,#e8f4fc 0%,#f5f7fa 100%);padding:20px 20px 0}.logo-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.logo{font-size:22px;font-weight:700;color:#003087}.logo span{color:#009cde}.receipt-label{font-size:13px;color:#666;text-align:right}.banner{background:#e8f8ef;border-left:4px solid #1a7a3a;padding:14px 16px;border-radius:0 8px 8px 0}.banner-title{color:#1a7a3a;font-weight:600;font-size:15px}.banner-sub{color:#1a7a3a;font-size:13px;margin-top:2px}.body{padding:20px}.amt-card{background:#fff;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}.amt-label{font-size:13px;color:#888;margin-bottom:6px}.amt{font-size:32px;font-weight:700}.amt span{font-size:14px;font-weight:500;color:#666}.section{font-size:16px;font-weight:600;margin-bottom:12px}.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #eee;font-size:14px}.l{color:#666}.r{color:#111;font-weight:500;text-align:right;max-width:58%}.badge{display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;padding:4px 12px;border-radius:16px;font-weight:600}.breakdown{background:#eef6fc;border-radius:12px;padding:16px;margin-top:20px}.breakdown h4{font-size:14px;margin-bottom:12px}.bd-row{display:flex;justify-content:space-between;font-size:13px;padding:6px 0}</style></head><body>
<div class="wrap">${wm}<div class="header"><div class="logo-row"><div class="logo">Pay<span>Pal</span></div><div class="receipt-label">Receipt<br/>${dateTop}</div></div>
<div class="banner"><div class="banner-title">✓ Payment sent</div><div class="banner-sub">You sent a payment</div></div></div>
<div class="body"><div class="amt-card"><div class="amt-label">You sent</div><div class="amt">${money(data.amount,data.currency||"USD")} <span>${(data.currency||"USD").toUpperCase()}</span></div></div>
<div class="section">Transaction details</div>
<div class="row"><span class="l">To</span><span class="r">${data.toName||"—"}${email?`<br/><a href="#">${email}</a>`:""}</span></div>
<div class="row"><span class="l">Transaction ID</span><span class="r">${txid}</span></div>
<div class="row"><span class="l">Date</span><span class="r">${dateFull}<br/><span style="font-size:12px;color:#888">${timeUTC}</span></span></div>
<div class="row"><span class="l">Payment method</span><span class="r">PayPal balance</span></div>
<div class="row"><span class="l">Status</span><span class="r"><span class="badge">⏱ Pending</span></span></div>
<div class="breakdown"><h4>Amount breakdown</h4><div class="bd-row"><span>Payment amount</span><span>${money(data.amount,data.currency||"USD")} ${(data.currency||"USD").toUpperCase()}</span></div><div class="bd-row"><span>Fee</span><span>$0.00</span></div></div>
</div></div>${themeScript}</body></html>`;
  }

  // ZELLE
  if (p === "zelle") {
    const d = new Date();
    const dateStr = data.timestamp || d.toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true})+" CT";
    const sentDay = d.toLocaleString("en-US",{weekday:"long",month:"long",day:"numeric"});
    const conf = data.remark || ("USB"+Math.random().toString(36).slice(2,10).toUpperCase());
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1a1a2e;min-height:100vh}.wrap{max-width:420px;margin:0 auto;padding:40px 28px;position:relative;text-align:center}.hdr{font-size:11px;letter-spacing:1.5px;color:#888;margin-bottom:16px}.title{font-size:26px;font-weight:700;color:#1a237e;margin-bottom:12px}.sub{font-size:13px;color:#555;line-height:1.5;margin-bottom:28px}.table{text-align:left;width:100%;border-top:1px solid #ddd}.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #eee;font-size:14px}.l{color:#555;font-weight:600;letter-spacing:0.5px;font-size:12px}.r{color:#1a1a2e;font-weight:500;text-align:right}.logos{margin-top:36px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:18px;font-weight:700}.us{color:#c41230}.z{color:#6d1ed4}</style></head><body>
<div class="wrap">${wm}
<div class="hdr">ZELLE® TRANSACTION DETAILS</div>
<div class="title">Payment sent.</div>
<div class="sub">These details are as of ${dateStr}.<br/>View your Zelle® activity to see the current status.</div>
<div class="table">
<div class="row"><span class="l">TO</span><span class="r">${data.toName||"—"}<br/><span style="font-size:12px;color:#666">${data.toAccount||""}</span></span></div>
<div class="row"><span class="l">AMOUNT</span><span class="r">${money(data.amount,data.currency||"USD")}</span></div>
<div class="row"><span class="l">FROM</span><span class="r">${data.fromName||"Checking ...3212"}</span></div>
<div class="row"><span class="l">SENT</span><span class="r">${sentDay}</span></div>
<div class="row"><span class="l">MEMO</span><span class="r">${data.remark||"Transfer"}</span></div>
<div class="row"><span class="l">CONFIRMATION CODE</span><span class="r">${conf}</span></div>
</div>
<div class="logos"><span class="us">USbank</span><span style="color:#ccc">|</span><span class="z">Zelle®</span></div>
</div>${themeScript}</body></html>`;
  }

  // BINANCE
  if (p === "binance") {
    const c = (data.currency||"USDT").toUpperCase();
    const addr = data.toAddress || "TC496YaImECWc6KeGPwQEKUT2dRdFQNg8C";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0b0e11;color:#eaecef;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}.wrap{max-width:420px;margin:0 auto;padding:24px 20px 40px;position:relative;min-height:100vh;display:flex;flex-direction:column}.top{margin-bottom:40px}.back{font-size:22px}.hero{text-align:center;margin-bottom:32px}.check{width:80px;height:80px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#2ee59d,#0ecb81);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:40px;color:#fff;box-shadow:0 0 0 8px rgba(14,203,129,0.15)}.t{font-size:20px;font-weight:600;margin-bottom:28px}.box{background:#1e2026;border-radius:12px;padding:8px 16px;margin-bottom:20px}.row{display:flex;justify-content:space-between;padding:14px 0;font-size:14px;border-bottom:1px solid #2b2f36}.row:last-child{border:none}.l{color:#848e9c}.r{color:#eaecef;text-align:right;max-width:62%;word-break:break-all;font-weight:500}.note{color:#848e9c;font-size:13px;line-height:1.55}.note a{color:#f0b90b;text-decoration:none}.btns{display:flex;gap:12px;margin-top:auto;padding-top:24px}.b1{flex:1;background:#2b2f36;color:#eaecef;border:none;padding:16px;border-radius:8px;font-weight:600}.b2{flex:1;background:#f0b90b;color:#181a20;border:none;padding:16px;border-radius:8px;font-weight:700}</style></head><body>
<div class="wrap">${wm}<div class="top"><span class="back">‹</span></div>
<div class="hero"><div class="check">✓</div><div class="t">Withdrawal Request Successful</div></div>
<div class="box">
<div class="row"><span class="l">Amount</span><span class="r">${money(data.amount,c).replace(" ","")}</span></div>
<div class="row"><span class="l">Network</span><span class="r">${data.network||"TRX"}</span></div>
<div class="row"><span class="l">Source</span><span class="r">Spot Wallet</span></div>
<div class="row"><span class="l">Address</span><span class="r">${addr}</span></div>
<div class="row"><span class="l">Network fee</span><span class="r">${data.remark||(c==="USDT"?"1 USDT":"—")}</span></div>
</div>
<div class="note">Crypto transferred out of Binance. Please contact the recipient platform for your transaction receipt.<br/><a href="#">Why hasn't my withdrawal arrived?</a></div>
<div class="btns"><button class="b1">Save Address</button><button class="b2">View History</button></div>
</div>${themeScript}</body></html>`;
  }

  // APPLE PAY
  if (p === "applepay") {
    const bal = money(data.amount, data.currency||"USD");
    const name = data.toName || "Transfer";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f2f2f7;color:#111;min-height:100vh}.wrap{max-width:420px;margin:0 auto;padding:20px 16px 40px;position:relative}.card{background:#000;border-radius:16px;padding:20px;color:#fff;margin-bottom:20px;min-height:180px;position:relative;overflow:hidden}.card-logo{font-size:17px;font-weight:500;margin-bottom:8px}.dots{position:absolute;right:-20px;top:10px;width:220px;height:160px;background:repeating-radial-gradient(circle at 50% 100%,#5eead4 0 2px,transparent 2px 14px);opacity:0.7}.bal-section{background:#fff;border-radius:14px;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.bal-l{font-size:13px;color:#888}.bal{font-size:22px;font-weight:700;margin-top:2px}.btn-send{background:#111;color:#fff;border:none;border-radius:20px;padding:10px 16px;font-size:13px;font-weight:600}.h{font-size:20px;font-weight:700;margin-bottom:12px}.tx-list{background:#fff;border-radius:12px;overflow:hidden;padding:0 14px}.tx{display:flex;align-items:center;padding:14px 0;border-bottom:1px solid #e5e5ea}.icon{width:36px;height:36px;background:#111;border-radius:8px;margin-right:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px}.tx-name{font-size:15px;font-weight:600}.tx-sub{font-size:12px;color:#8e8e93}.tx-amt{font-size:15px;font-weight:600;margin-left:auto}</style></head><body>
<div class="wrap">${wm}<div class="card"><div class="card-logo"> Cash</div><div class="dots"></div></div>
<div class="bal-section"><div><div class="bal-l">Balance</div><div class="bal">${bal}</div></div><button class="btn-send">Send or Request</button></div>
<div class="h">Latest Transactions</div>
<div class="tx-list"><div class="tx"><div class="icon">$</div><div><div class="tx-name">${name}</div><div class="tx-sub">Added to Balance · just now</div></div><div class="tx-amt">+${bal}</div></div></div>
</div>${themeScript}</body></html>`;
  }

  // KUDA
  if (p === "kuda") {
    const d = new Date();
    const dateStr = data.timestamp || d.toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric"})+" at "+d.toLocaleString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
    const toName = data.toName || data.bank || "Recipient";
    const acct = data.toAccount || "—";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#faf8f5;color:#1a1a1a;min-height:100vh}.wrap{max-width:420px;margin:0 auto;padding:16px 20px 40px;position:relative}.top{display:flex;align-items:center;justify-content:center;position:relative;padding:12px 0 24px}.back{position:absolute;left:0;width:36px;height:36px;border-radius:50%;background:#f0eeea;display:flex;align-items:center;justify-content:center;font-size:18px}.title{font-size:17px;font-weight:600}.amt{text-align:center;font-size:36px;font-weight:700;margin:20px 0 8px}.who{text-align:center;font-size:15px;color:#333;margin-bottom:4px}.when{text-align:center;font-size:13px;color:#888;margin-bottom:20px}.tag{display:flex;align-items:center;gap:6px;background:#f3f0e8;border-radius:8px;padding:8px 14px;font-size:13px;margin:0 auto 28px;width:fit-content}.timeline{padding:0 8px;margin-bottom:24px}.step{display:flex;gap:12px;margin-bottom:20px}.dot{width:28px;height:28px;border-radius:50%;background:#e8f5e9;color:#2e7d32;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}.s-title{font-size:14px;font-weight:600}.s-time{font-size:12px;color:#888}.s-desc{font-size:12px;color:#999;margin-top:2px}.btn-v{background:#e8d5f5;color:#5b2c8a;border:none;border-radius:8px;padding:10px 18px;font-size:14px;font-weight:600;margin-bottom:20px}.card{background:#f5f2ec;border-radius:16px;padding:20px;margin-bottom:20px}.field{margin-bottom:16px}.field-l{font-size:12px;color:#888;margin-bottom:4px}.field-v{font-size:15px;font-weight:600}.share{display:block;width:100%;background:#2d1b4e;color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:600;text-align:center}</style></head><body>
<div class="wrap">${wm}
<div class="top"><div class="back">‹</div><div class="title">Transaction</div></div>
<div class="amt">-${money(data.amount,"NGN")}</div>
<div class="who">${toName}</div>
<div class="when">On ${dateStr}</div>
<div class="tag">✈ Transfer</div>
<div class="timeline">
<div class="step"><div class="dot">↑</div><div><div class="s-title">Initiated <span class="s-time">${dateStr}</span></div><div class="s-desc">You made this transaction</div></div></div>
<div class="step"><div class="dot">→</div><div><div class="s-title">In Progress <span class="s-time">${dateStr}</span></div><div class="s-desc">Your transaction is on its way.</div></div></div>
<div class="step"><div class="dot">✓</div><div><div class="s-title">Completed <span class="s-time">${dateStr}</span></div><div class="s-desc">${toName} received your transaction.</div></div></div>
</div>
<button class="btn-v">View Details</button>
<div class="card">
<div class="field"><div class="field-l">To</div><div class="field-v">${toName}</div></div>
<div class="field"><div class="field-l">Description</div><div class="field-v">${data.remark||"Transfer"}</div></div>
<div class="field"><div class="field-l">Payment Method</div><div class="field-v">Outward Transfer</div></div>
<div class="field"><div class="field-l">Account number</div><div class="field-v">${antiLink(acct)}</div></div>
</div>
<button class="share">Share</button>
</div>${themeScript}</body></html>`;
  }

  // CASH APP
  if (p === "cashapp") {
    const name = data.toName || "Recipient";
    const handle = data.toAccount || data.remark || ("$"+name.replace(/\s+/g,"").slice(0,12));
    const handleClean = handle.startsWith("$") ? handle : "$"+handle;
    const d = new Date();
    const dateStr = data.timestamp || d.toLocaleString("en-US",{month:"short",day:"numeric"})+" at "+d.toLocaleString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
    const initial = name.charAt(0).toUpperCase();
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#111;min-height:100vh}.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:16px 24px 40px;display:flex;flex-direction:column}.top{display:flex;justify-content:space-between;padding:8px 0 24px}.avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#00d632,#00a028);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff}.profile{text-align:center}.name{font-size:18px;font-weight:600}.handle{font-size:14px;color:#888}.amt-block{text-align:center;margin:48px 0 12px}.amt{font-size:48px;font-weight:700}.date{text-align:center;color:#999;font-size:14px;margin-bottom:auto;padding-bottom:40px}.actions{margin-top:auto}.btn-green{display:block;width:100%;background:#00d632;color:#fff;border:none;border-radius:28px;padding:16px;font-size:16px;font-weight:600;margin-bottom:12px;text-align:center}.btn-outline{display:block;width:100%;background:#fff;color:#111;border:1.5px solid #ddd;border-radius:28px;padding:16px;font-size:16px;font-weight:500;text-align:center}</style></head><body>
<div class="wrap">${wm}<div class="top"><span>‹</span><span>···</span></div>
<div class="profile"><div class="avatar">${initial}</div><div class="name">${name}</div><div class="handle">Payment to ${handleClean}</div></div>
<div class="amt-block"><div class="amt">${money(data.amount,data.currency||"USD")}</div></div>
<div class="date">${dateStr}</div>
<div class="actions"><div class="btn-green">Replied ♥</div><div class="btn-outline">Web Receipt</div></div>
</div>${themeScript}</body></html>`;
  }

  // TRUST / COINBASE
  if (p === "trustwallet" || p === "coinbase") {
    const c = (data.currency||"USDT").toUpperCase();
    const isTW = p === "trustwallet";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:${isTW?"#1a1f2e":"#0052FF"};color:#fff;min-height:100vh}.wrap{max-width:420px;margin:0 auto;padding:28px 20px 40px;position:relative;min-height:100vh}.hdr{text-align:center;font-size:14px;opacity:0.8;margin-bottom:32px}.amt{text-align:center;font-size:40px;font-weight:700;margin-bottom:8px}.status{text-align:center;color:#4ade80;font-size:15px;margin-bottom:32px}.box{background:rgba(255,255,255,0.08);border-radius:14px;padding:16px 18px}.row{display:flex;justify-content:space-between;padding:12px 0;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.08)}.row:last-child{border:none}.l{opacity:0.7}.r{font-weight:500;text-align:right;max-width:60%;word-break:break-all}</style></head><body>
<div class="wrap">${wm}
<div class="hdr">${isTW?"Trust Wallet":"Coinbase"} · Send</div>
<div class="amt">${money(data.amount,c)}</div>
<div class="status">✓ Completed</div>
<div class="box">
<div class="row"><span class="l">To</span><span class="r">${data.toAddress||data.toName||"—"}</span></div>
<div class="row"><span class="l">Network</span><span class="r">${data.network||"TRX"}</span></div>
<div class="row"><span class="l">Asset</span><span class="r">${c}</span></div>
<div class="row"><span class="l">Date</span><span class="r">${data.timestamp||new Date().toLocaleString()}</span></div>
</div>
</div>${themeScript}</body></html>`;
  }

  const ts = data.timestamp || new Date().toLocaleString();
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="font-family:sans-serif;padding:24px;background:#111;color:#eee">
<div style="max-width:400px;margin:0 auto;background:#1a1a1a;border-radius:12px;padding:24px;position:relative">${wm}
<div style="text-align:center;font-weight:600;margin-bottom:12px">${(data.platform||"Receipt").toUpperCase()}</div>
<div style="text-align:center;font-size:28px;font-weight:700;margin-bottom:16px">${money(data.amount,cur)}</div>
<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333"><span style="color:#888">To</span><span>${data.toName||data.toAddress||"—"}</span></div>
<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:#888">Date</span><span>${ts}</span></div>
</div>${themeScript}</body></html>`;
}
