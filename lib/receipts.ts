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
  if (["BTC", "ETH", "BNB"].includes(c))
    return `${n} ${c}`;
  if (["USDT", "USDC"].includes(c))
    return `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${c}`;
  if (c === "EUR" || c === "€")
    return `€${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  if (c === "GBP" || c === "£")
    return `£${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function isCrypto(c: string) {
  return ["BTC", "ETH", "USDT", "USDC", "BNB"].includes((c || "").toUpperCase());
}

const LOGOS: Record<string, string> = {
  opay: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#1DBF73"/><path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="14" cy="14" r="2.2" fill="#fff"/></svg>`,
  paypal: `<svg width="90" height="24" viewBox="0 0 90 24"><text x="0" y="18" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="20" fill="#003087">Pay</text><text x="38" y="18" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="20" fill="#009cde">Pal</text></svg>`,
  zelle: `<svg width="70" height="24" viewBox="0 0 70 24"><text x="0" y="18" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="18" fill="#6c1eb0">Zelle</text><text x="52" y="12" font-size="10" fill="#6c1eb0">®</text></svg>`,
  cashapp: `<svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#00D632"/><text x="16" y="22" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="800" font-size="18" fill="#fff">$</text></svg>`,
  applepay: `<svg width="100" height="24" viewBox="0 0 100 24"><text x="0" y="18" font-family="Helvetica,Arial,sans-serif" font-weight="600" font-size="16" fill="#fff"> Apple Cash</text></svg>`,
  binance: `<svg width="28" height="28" viewBox="0 0 28 28"><path d="M14 2l3.5 3.5-3.5 3.5-3.5-3.5L14 2zm0 17l3.5 3.5L14 26l-3.5-3.5L14 19zm8.5-8.5L26 14l-3.5 3.5L19 14l3.5-3.5zM2 14l3.5-3.5L9 14l-3.5 3.5L2 14zm8.5 0l3.5-3.5 3.5 3.5-3.5 3.5L10.5 14z" fill="#F0B90B"/></svg>`,
  coinbase: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#0052FF"/><rect x="9" y="12" width="10" height="4" rx="1" fill="#fff"/></svg>`,
  trustwallet: `<svg width="28" height="28" viewBox="0 0 28 28"><path d="M14 2C8 2 4 5 4 5v8c0 7 10 13 10 13s10-6 10-13V5s-4-3-10-3z" fill="#3375BB"/><path d="M10 13l3 3 6-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
};

const baseCSS = `
*{box-sizing:border-box;margin:0;padding:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
.anim{animation:fadeUp 0.45s ease both}
.anim-d1{animation-delay:0.08s}.anim-d2{animation-delay:0.16s}.anim-d3{animation-delay:0.24s}
.check-anim{animation:checkPop 0.5s cubic-bezier(.2,1.4,.4,1) both}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.theme-toggle{position:fixed;top:12px;right:12px;z-index:100;background:rgba(0,0,0,0.55);color:#fff;border:none;border-radius:20px;padding:8px 14px;font-size:12px;cursor:pointer}
`;

export function buildReceiptHTML(data: ReceiptData, clean: boolean): string {
  const p = (data.platform || "opay").toLowerCase();
  const ts = data.timestamp || new Date().toLocaleString();
  const dark = !!data.dark;
  const wm = clean
    ? ""
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:50;overflow:hidden">
        <div style="transform:rotate(-28deg);color:rgba(220,40,40,0.26);font-size:17px;font-weight:700;letter-spacing:0.5px;white-space:nowrap">
          UNLICENSED — Pay $2 USDT to remove
        </div>
      </div>`;

  const themeScript = `<script>
function toggleTheme(){
  const b=document.body;
  b.classList.toggle('dark');
  localStorage.setItem('rc_theme', b.classList.contains('dark')?'dark':'light');
}
(function(){if(localStorage.getItem('rc_theme')==='dark'||${dark})document.body.classList.add('dark');})();
</script>`;

  if (p === "opay") {
    const txNo = data.remark || `${Date.now()}${Math.floor(Math.random()*900+100)}`;
    const session = `10000${String(Date.now()).slice(-18)}${Math.floor(Math.random()*90+10)}`;
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#f5f5f5}
body.dark{background:#0f1419}
body.dark .wrap{background:#1a222c;color:#e8eaed;border-color:#2a3540}
body.dark .sl{color:#8b9aab}
body.dark .sv{color:#e8eaed}
body.dark .ok{color:#e8eaed}
body.dark .date{color:#8b9aab}
body.dark .foot{color:#6b7c8c}
body.dark .row{border-color:#2a3540}
.wrap{max-width:400px;margin:16px auto;background:#fff;padding:22px 20px 36px;position:relative;
  border:10px solid #1a1a1a;border-radius:0 0 28px 28px;border-top:none;
  border-bottom:12px dashed #1a1a1a;min-height:92vh}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
.logo-row{display:flex;align-items:center;gap:8px}
.logo-text{color:#1DBF73;font-size:20px;font-weight:800}
.title{color:#888;font-size:13px;font-weight:500}
.amt{text-align:center;color:#12b76a;font-size:36px;font-weight:800;margin:10px 0 8px}
.ok{text-align:center;font-size:17px;font-weight:700;color:#111;margin-bottom:4px}
.date{text-align:center;color:#999;font-size:12px;margin-bottom:26px}
.row{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:1px solid #f0f0f0}
.sl{color:#999;font-size:12px;flex-shrink:0;max-width:38%}
.sv{color:#111;font-size:13px;font-weight:600;text-align:right;max-width:60%;line-height:1.4}
.foot{margin-top:28px;color:#aaa;font-size:11px;line-height:1.65;text-align:center;padding:0 4px}
.holes{display:flex;justify-content:space-between;padding:0 8px 10px}
.hole{width:14px;height:14px;background:#f5f5f5;border-radius:50%;border:2px solid #ddd}
body.dark .hole{background:#0f1419;border-color:#2a3540}
</style></head><body>
<button class="theme-toggle" onclick="toggleTheme()">Dark / Light</button>
<div class="wrap">${wm}
  <div class="holes"><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span></div>
  <div class="top anim">
    <div class="logo-row">${LOGOS.opay}<span class="logo-text">OPay</span></div>
    <div class="title">Transaction Receipt</div>
  </div>
  <div class="amt anim anim-d1">${money(data.amount, data.currency || "NGN")}</div>
  <div class="ok anim anim-d1">Successful</div>
  <div class="date anim anim-d1">${ts}</div>
  <div class="row anim anim-d2"><div class="sl">Recipient Details</div><div class="sv">${data.toName || "—"}<br/><span style="font-weight:400;color:#888;font-size:12px">${data.bank || "Bank"} | ${data.toAccount || "—"}</span></div></div>
  <div class="row anim anim-d2"><div class="sl">Sender Details</div><div class="sv">${data.fromName || "—"}<br/><span style="font-weight:400;color:#888;font-size:12px">OPay | ${data.toAccount ? String(data.toAccount).slice(0,3)+"***"+String(data.toAccount).slice(-3) : "****"}</span></div></div>
  <div class="row anim anim-d2"><div class="sl">Transaction Type</div><div class="sv">Transfer to Bank Account</div></div>
  <div class="row anim anim-d3"><div class="sl">Transaction No.</div><div class="sv" style="font-size:11px;word-break:break-all">${txNo}</div></div>
  <div class="row anim anim-d3"><div class="sl">Session ID</div><div class="sv" style="font-size:11px;word-break:break-all">${session}</div></div>
  <div class="foot anim anim-d3">
    Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest on your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.
  </div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "paypal") {
    const txid = data.remark || Math.random().toString(16).slice(2, 10);
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#f5f7fa}
body.dark{background:#0d1117}
body.dark .wrap{background:#161b22;color:#e6edf3}
body.dark .card{background:#21262d}
body.dark .l{color:#8b949e}
body.dark .r{color:#e6edf3}
body.dark .row{border-color:#30363d}
body.dark .amt{color:#e6edf3}
.wrap{max-width:420px;margin:0 auto;background:#fff;min-height:100vh;padding:28px 22px 48px;position:relative}
.logo{margin-bottom:26px}
.status{color:#1a7a3a;font-size:15px;font-weight:600;margin-bottom:4px}
body.dark .status{color:#3fb950}
.sub{color:#6b6b6b;font-size:13px;margin-bottom:20px}
body.dark .sub{color:#8b949e}
.amt{font-size:32px;font-weight:700;color:#111;margin-bottom:24px}
.card{background:#f8f9fb;border-radius:12px;padding:6px 16px;margin-bottom:20px}
.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #eee;font-size:14px}
.row:last-child{border:none}
.l{color:#888}.r{color:#111;font-weight:500;text-align:right;max-width:58%;word-break:break-word}
.badge{display:inline-block;background:#dcfce7;color:#166534;font-size:12px;padding:4px 10px;border-radius:20px;font-weight:600}
body.dark .badge{background:#12261e;color:#3fb950}
</style></head><body>
<button class="theme-toggle" onclick="toggleTheme()">Dark / Light</button>
<div class="wrap">${wm}
  <div class="logo anim">${LOGOS.paypal}</div>
  <div class="status anim anim-d1">✓ Payment sent</div>
  <div class="sub anim anim-d1">You sent a payment</div>
  <div class="amt anim anim-d1">${money(data.amount, data.currency || "USD")} <span style="font-size:15px;font-weight:500;color:#666">${(data.currency||"USD").toUpperCase()}</span></div>
  <div class="card anim anim-d2">
    <div class="row"><span class="l">To</span><span class="r">${data.toName || "—"}${data.toAccount ? `<br/><span style="font-size:12px;color:#0070ba">${data.toAccount}</span>` : ""}</span></div>
    <div class="row"><span class="l">Transaction ID</span><span class="r">${txid}</span></div>
    <div class="row"><span class="l">Date</span><span class="r">${ts}</span></div>
    <div class="row"><span class="l">Payment method</span><span class="r">PayPal balance</span></div>
    <div class="row"><span class="l">Status</span><span class="r"><span class="badge">Completed</span></span></div>
  </div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "zelle") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#fff;font-family:Georgia,"Times New Roman",serif}
body.dark{background:#121018}
body.dark .wrap{color:#e8e6f0}
body.dark .l{color:#c4b8e0}
body.dark .r{color:#e8e6f0}
body.dark .row{border-color:#2a2438}
body.dark .t{color:#d4c8f0}
body.dark .h,.sub{color:#9a90b0}
.wrap{max-width:420px;margin:0 auto;padding:36px 28px 48px;position:relative}
.h{text-align:center;font-size:11px;letter-spacing:1.2px;color:#555;margin-bottom:14px;font-family:-apple-system,sans-serif}
.t{text-align:center;font-size:24px;font-weight:700;color:#1a1450;margin-bottom:10px}
.sub{text-align:center;font-size:12px;color:#666;margin-bottom:28px;line-height:1.55}
.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #e8e8e8;font-size:14px;font-family:-apple-system,sans-serif}
.l{color:#333;font-weight:700;letter-spacing:0.4px;font-size:12px}
.r{color:#111;text-align:right;max-width:58%}
.logos{text-align:center;margin-top:40px;font-size:17px;font-weight:700;font-family:-apple-system,sans-serif}
.logos .z{color:#6c1eb0}
</style></head><body>
<button class="theme-toggle" onclick="toggleTheme()">Dark / Light</button>
<div class="wrap">${wm}
  <div class="h anim">ZELLE® TRANSACTION DETAILS</div>
  <div class="t anim anim-d1">Payment sent.</div>
  <div class="sub anim anim-d1">These details are as of ${ts}.<br/>View your Zelle® activity to see the current status.</div>
  <div class="row anim anim-d2"><span class="l">TO</span><span class="r">${data.toName || "—"}${data.toAccount ? "<br/>"+data.toAccount : ""}</span></div>
  <div class="row anim anim-d2"><span class="l">AMOUNT</span><span class="r">${money(data.amount, data.currency || "USD")}</span></div>
  <div class="row anim anim-d2"><span class="l">FROM</span><span class="r">${data.fromName || "Checking"}</span></div>
  <div class="row anim anim-d3"><span class="l">SENT</span><span class="r">${ts}</span></div>
  <div class="row anim anim-d3"><span class="l">MEMO</span><span class="r">${data.remark || "—"}</span></div>
  <div class="row anim anim-d3"><span class="l">CONFIRMATION CODE</span><span class="r">${Math.random().toString(36).slice(2, 12).toUpperCase()}</span></div>
  <div class="logos anim anim-d3">USbank &nbsp;|&nbsp; <span class="z">Zelle®</span></div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "cashapp") {
    const cur = (data.currency || "USD").toUpperCase();
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#00d632;min-height:100vh}
body.dark{background:#0a3d14}
.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:56px 24px 40px;text-align:center;color:#fff;position:relative}
.logo-c{margin:0 auto 16px}
.check{width:76px;height:76px;border:3px solid #fff;border-radius:50%;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;font-size:38px}
.t{font-size:18px;font-weight:600;margin-bottom:22px}
.amt{font-size:46px;font-weight:700;margin-bottom:10px;letter-spacing:-1px}
.to{font-size:14px;opacity:0.95;margin-bottom:28px;line-height:1.5;word-break:break-all}
.share{font-size:13px;letter-spacing:1.5px;margin-bottom:36px;opacity:0.9}
.btn{background:#fff;color:#00d632;border:none;border-radius:28px;padding:16px;width:100%;font-size:16px;font-weight:700}
body.dark .btn{color:#0a3d14}
</style></head><body>
<button class="theme-toggle" onclick="toggleTheme()">Dark / Light</button>
<div class="wrap">${wm}
  <div class="logo-c anim">${LOGOS.cashapp}</div>
  <div class="check check-anim">✓</div>
  <div class="t anim anim-d1">Payment Sent!</div>
  <div class="amt anim anim-d1">${money(data.amount, cur)}</div>
  <div class="to anim anim-d2">Your payment has been sent to<br/><strong>${data.toName || data.toAddress || "recipient"}</strong></div>
  <div class="share anim anim-d2">↗ SHARE</div>
  <button class="btn anim anim-d3">Close</button>
</div>
${themeScript}</body></html>`;
  }

  if (p === "binance") {
    const cur = (data.currency || "USDT").toUpperCase();
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#181a20;color:#eaecef;min-height:100vh}
body.dark{background:#0b0e11}
.wrap{max-width:420px;margin:0 auto;padding:40px 20px 48px;position:relative}
.logo-row{display:flex;justify-content:center;margin-bottom:12px}
.icon{width:68px;height:68px;background:#0ecb81;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:34px;color:#fff}
.t{text-align:center;font-size:18px;font-weight:600;margin-bottom:26px}
.box{background:#1e2026;border-radius:12px;padding:8px 16px;margin-bottom:18px}
body.dark .box{background:#14171c}
.row{display:flex;justify-content:space-between;padding:13px 0;font-size:14px;border-bottom:1px solid #2b2f36}
.row:last-child{border:none}
.l{color:#848e9c}.r{color:#eaecef;text-align:right;max-width:62%;word-break:break-all;font-weight:500}
.note{color:#848e9c;font-size:12px;line-height:1.55;margin-bottom:22px}
.btns{display:flex;gap:12px}
.b1{flex:1;background:#2b2f36;color:#eaecef;border:none;padding:14px;border-radius:8px;font-weight:600;font-size:14px}
.b2{flex:1;background:#f0b90b;color:#181a20;border:none;padding:14px;border-radius:8px;font-weight:700;font-size:14px}
</style></head><body>
<button class="theme-toggle" onclick="toggleTheme()">Dark / Light</button>
<div class="wrap">${wm}
  <div class="logo-row anim">${LOGOS.binance}</div>
  <div class="icon check-anim">✓</div>
  <div class="t anim anim-d1">Withdrawal Request Successful</div>
  <div class="box anim anim-d2">
    <div class="row"><span class="l">Amount</span><span class="r">${money(data.amount, cur)}</span></div>
    <div class="row"><span class="l">Network</span><span class="r">${data.network || "TRX"}</span></div>
    <div class="row"><span class="l">Source</span><span class="r">Spot Wallet</span></div>
    <div class="row"><span class="l">Address</span><span class="r">${data.toAddress || "—"}</span></div>
    <div class="row"><span class="l">Network fee</span><span class="r">${data.remark || (cur === "USDT" ? "1 USDT" : "—")}</span></div>
  </div>
  <div class="note anim anim-d3">Crypto transferred out of Binance. Please contact the recipient platform for your transaction receipt.<br/><span style="color:#f0b90b">Why hasn't my withdrawal arrived?</span></div>
  <div class="btns anim anim-d3"><button class="b1">Save Address</button><button class="b2">View History</button></div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "applepay") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#f2f2f7}
body.dark{background:#000}
body.dark .h,body.dark .tx-name{color:#fff}
body.dark .tx{border-color:#222}
body.dark .tx-sub{color:#8e8e93}
.wrap{max-width:420px;margin:0 auto;padding:20px;position:relative}
.card{background:linear-gradient(160deg,#1c1c1e 0%,#0a0a0a 100%);border-radius:18px;padding:22px;color:#fff;margin-bottom:20px;min-height:190px;position:relative;overflow:hidden}
.card::after{content:"";position:absolute;right:-30px;top:10px;width:200px;height:200px;background:radial-gradient(circle,rgba(80,180,255,0.22),transparent 70%);border-radius:50%}
.logo{font-size:17px;font-weight:600;margin-bottom:44px}
.bal-l{font-size:13px;color:#aaa}.bal{font-size:30px;font-weight:700;margin-top:4px}
.btn{position:absolute;right:16px;bottom:20px;background:#fff;color:#111;border:none;border-radius:20px;padding:10px 16px;font-size:13px;font-weight:600}
.h{font-size:17px;font-weight:700;margin:16px 0 12px;color:#111}
.tx{display:flex;align-items:center;padding:14px 0;border-bottom:1px solid #e5e5ea}
.icon{width:38px;height:38px;background:#111;border-radius:10px;margin-right:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px}
.tx-name{font-size:15px;font-weight:600;color:#111}.tx-sub{font-size:12px;color:#8e8e93}
.tx-amt{font-size:15px;font-weight:600;color:#34c759;margin-left:auto}
</style></head><body>
<button class="theme-toggle" onclick="toggleTheme()">Dark / Light</button>
<div class="wrap">${wm}
  <div class="card anim">
    <div class="logo"> Apple Cash</div>
    <div class="bal-l">Balance</div>
    <div class="bal">${money(data.amount, data.currency || "USD")}</div>
    <button class="btn">Send or Request</button>
  </div>
  <div class="h anim anim-d1">Latest Transactions</div>
  <div class="tx anim anim-d2"><div class="icon">$</div><div><div class="tx-name">${data.toName || "Transfer"}</div><div class="tx-sub">${ts}</div></div><div class="tx-amt">+${money(data.amount, data.currency || "USD")}</div></div>
</div>
${themeScript}</body></html>`;
  }

  const cur = (data.currency || "BTC").toUpperCase();
  const brand = p === "coinbase" ? "Coinbase" : p === "trustwallet" ? "Trust Wallet" : "Wallet";
  const logo = LOGOS[p] || LOGOS.trustwallet;
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#f5f5f7}
body.dark{background:#0d0d12}
body.dark .card{background:#1a1a24;color:#e8e8f0}
body.dark .l{color:#9a9ab0}
body.dark .r{color:#e8e8f0}
body.dark .row{border-color:#2a2a38}
body.dark .t,.amt{color:#e8e8f0}
.wrap{max-width:420px;margin:0 auto;padding:24px;position:relative}
.card{background:#fff;border-radius:16px;padding:22px;box-shadow:0 2px 16px rgba(0,0,0,0.07)}
.logo-row{display:flex;justify-content:center;margin-bottom:10px}
.t{text-align:center;font-size:15px;font-weight:600;margin-bottom:12px;color:#333}
.amt{text-align:center;font-size:28px;font-weight:700;margin-bottom:6px;color:#111}
.sub{text-align:center;color:#888;font-size:13px;margin-bottom:18px}
.row{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
.l{color:#888}.r{color:#111;font-weight:500;text-align:right;max-width:60%;word-break:break-all}
.status{color:#0a0;background:#e8f8e8;padding:3px 10px;border-radius:8px;font-size:12px;font-weight:600}
body.dark .status{background:#12261e;color:#3fb950}
.btn{display:block;width:100%;margin-top:20px;background:${p==="coinbase"?"#0052FF":"#3375BB"};color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600}
</style></head><body>
<button class="theme-toggle" onclick="toggleTheme()">Dark / Light</button>
<div class="wrap">${wm}
  <div class="card">
    <div class="logo-row anim">${logo}</div>
    <div class="t anim anim-d1">Sent ${cur} · ${brand}</div>
    <div class="amt anim anim-d1">${money(data.amount, cur)}</div>
    <div class="sub anim anim-d1">${isCrypto(cur) ? cur + " transfer" : ""}</div>
    <div class="row anim anim-d2"><span class="l">Network</span><span class="r">${data.network || (cur==="BTC"?"Bitcoin":cur==="ETH"?"Ethereum":"BNB Smart Chain")}</span></div>
    <div class="row anim anim-d2"><span class="l">Status</span><span class="r"><span class="status">Completed</span></span></div>
    <div class="row anim anim-d2"><span class="l">Time</span><span class="r">${ts}</span></div>
    <div class="row anim anim-d3"><span class="l">To</span><span class="r">${data.toAddress || data.toName || "—"}</span></div>
    <div class="row anim anim-d3"><span class="l">Tx ID</span><span class="r">${(data.remark || Math.random().toString(16).slice(2,14)) + "..."}</span></div>
    <button class="btn anim anim-d3">View on Explorer</button>
  </div>
</div>
${themeScript}</body></html>`;
}
