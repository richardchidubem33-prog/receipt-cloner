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
  opay: `<svg width="85" height="32" viewBox="0 0 85 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m65.34 11.904-2.891 1.669c-1.525-1.174-3.086-1.725-5.139-1.725a8.517 8.517 0 0 0-8.349 6.824 8.511 8.511 0 0 0 8.84 10.188 8.516 8.516 0 0 0 3.701-1.09v.883a.223.223 0 0 0 .224.22h3.74a.223.223 0 0 0 .223-.22v-16.56a.223.223 0 0 0-.348-.183v-.006Zm-8.03 12.953a4.5 4.5 0 0 1-4.413-5.374 4.498 4.498 0 1 1 4.413 5.374Z" fill="#210F60"/><path d="M14.137 6a11.475 11.475 0 0 0-6.802 2.203 11.38 11.38 0 0 0-4.156 5.792.211.211 0 0 0 .107.252c.03.015.063.023.096.023h4.399a.212.212 0 0 0 .19-.114 6.945 6.945 0 0 1 2.632-2.727 6.993 6.993 0 0 1 3.68-.946c3.72.067 6.6 3.112 6.735 6.62a6.869 6.869 0 0 1-1.347 4.352 6.93 6.93 0 0 1-3.78 2.566 6.96 6.96 0 0 1-4.564-.338 6.914 6.914 0 0 1-3.356-3.096.211.211 0 0 0-.188-.114h-4.4a.213.213 0 0 0-.204.275 11.368 11.368 0 0 0 3.391 5.186 11.455 11.455 0 0 0 5.618 2.652c2.083.351 4.222.12 6.182-.665a11.424 11.424 0 0 0 4.917-3.787A11.324 11.324 0 0 0 24.31 12.27a11.395 11.395 0 0 0-4.197-4.566A11.474 11.474 0 0 0 14.137 6" fill="#1DCF9F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.62 19.517H2.229a.226.226 0 0 1-.211-.145.235.235 0 0 1-.017-.089v-3.692a.235.235 0 0 1 .14-.216.226.226 0 0 1 .088-.018h5.393a.226.226 0 0 1 .211.145.235.235 0 0 1 .017.089v3.692a.235.235 0 0 1-.14.216.226.226 0 0 1-.088.018" fill="#210F60"/><path d="M46.842 15.592c0-4.44-3.564-8.21-7.99-8.291h-8.308a.209.209 0 0 0-.209.209v21.028a.208.208 0 0 0 .209.209h3.748a.21.21 0 0 0 .209-.209V24.05h4.292c4.454-.048 8.049-3.394 8.049-8.453v-.005Zm-8.141 4.299H34.5v-8.427h4.2c2.196 0 3.975 1.944 3.975 4.132 0 2.722-1.779 4.294-3.974 4.294m45.758-8.042h-3.824a.533.533 0 0 0-.491.325l-4.069 9.418-4.01-9.418a.537.537 0 0 0-.493-.325l-3.86.02a.206.206 0 0 0-.203.19.208.208 0 0 0 .016.1l6.302 14.799-2.612 6.048a.208.208 0 0 0 .092.264.2.2 0 0 0 .099.025h3.822a.535.535 0 0 0 .492-.326l8.928-20.831a.207.207 0 0 0-.19-.29Z" fill="#210F60"/></svg>`,
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
.theme-toggle{display:none!important}
`;

export function buildReceiptHTML(data: ReceiptData, clean: boolean): string {
  const p = (data.platform || "opay").toLowerCase();
  const now = new Date();
  const ts = data.timestamp || now.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
  const dark = !!data.dark;
  const wm = clean
    ? ""
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:50;overflow:hidden">
        <div style="transform:rotate(-28deg);color:rgba(220,40,40,0.26);font-size:17px;font-weight:700;letter-spacing:0.5px;white-space:nowrap">
          UNLICENSED — Pay $2 USDT to remove
        </div>
      </div>`;

  const themeScript = `<script>
(function(){if(${dark})document.body.classList.add('dark');})();
</script>`;

  if (p === "kuda") {
    const amt = money(data.amount, data.currency || "NGN");
    const ref = data.remark || ("0" + Date.now().toString() + Math.floor(Math.random()*900+100) + "PP");
    const acct = data.toAccount || "—";
    const toName = (data.toName || "RECIPIENT").toUpperCase();
    const bank = (data.bank || "PALMPAY").toUpperCase();
    const d = new Date();
    const fmt = (x: Date) => x.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " · " + x.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const t0 = fmt(d);
    const t1 = fmt(d);
    const t2 = fmt(new Date(d.getTime() + 60000));
    const headerDate = "On " + d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " at " + d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#f7f4ef;color:#1a1a1a;min-height:100vh}
body.dark{background:#12100e;color:#f0ebe3}
body.dark .card{background:#1c1916}
body.dark .share{background:#4a1d8a}
.wrap{max-width:420px;margin:0 auto;padding:16px 20px 40px;position:relative;min-height:100vh}
.nav{display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:28px;padding-top:8px}
.back{position:absolute;left:0;width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
body.dark .back{background:#1c1916;color:#f0ebe3}
.title{font-size:17px;font-weight:600}
.amt{text-align:center;font-size:32px;font-weight:700;margin-bottom:6px;letter-spacing:-0.5px}
.name{text-align:center;font-size:13px;font-weight:600;letter-spacing:0.3px;margin-bottom:4px}
.date{text-align:center;font-size:12px;color:#8a8578;margin-bottom:18px}
body.dark .date{color:#9a9080}
.badge{display:inline-flex;align-items:center;gap:6px;background:#f0ebe3;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:600;margin:0 auto 28px;width:fit-content}
body.dark .badge{background:#2a2520}
.badge-icon{width:22px;height:22px;background:#a78bfa;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px}
.timeline{padding:0 8px;margin-bottom:20px}
.tl-item{display:flex;gap:14px;position:relative;padding-bottom:22px}
.tl-item:last-child{padding-bottom:0}
.tl-item:not(:last-child)::before{content:"";position:absolute;left:13px;top:28px;bottom:0;width:2px;background:#c4e8d4}
.tl-dot{width:28px;height:28px;border-radius:50%;background:#e8f8ef;border:2px solid #1DBF73;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:#1DBF73}
.tl-body{flex:1;padding-top:2px}
.tl-title{font-size:14px;font-weight:700}
.tl-time{font-size:12px;color:#8a8578;font-weight:400;margin-left:6px}
body.dark .tl-time{color:#9a9080}
.tl-sub{font-size:12px;color:#8a8578;margin-top:2px}
body.dark .tl-sub{color:#9a9080}
.view-btn{display:inline-block;background:#e9d5ff;color:#6b21a8;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:600;margin:16px 0 24px 42px}
body.dark .view-btn{background:#3b1f5e;color:#d8b4fe}
.card{background:#f0ebe3;border-radius:16px;padding:18px 18px 14px;margin-bottom:20px}
body.dark .card{background:#1c1916}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.card-label{font-size:12px;color:#8a8578;margin-bottom:2px}
body.dark .card-label{color:#9a9080}
.card-val{font-size:15px;font-weight:700}
.bank-icon{width:36px;height:36px;border-radius:50%;background:#e9d5ff;display:flex;align-items:center;justify-content:center}
.field{margin-bottom:14px}
.field-l{font-size:12px;color:#8a8578;margin-bottom:2px}
body.dark .field-l{color:#9a9080}
.field-v{font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:space-between}
.copy{color:#a78bfa;font-size:14px}
.share{width:100%;background:#3b0764;color:#fff;border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:700;margin-top:8px}
</style></head><body>
<div class="wrap">${wm}
  <div class="nav anim"><div class="back">←</div><div class="title">Transaction</div></div>
  <div class="amt anim anim-d1">-${amt}</div>
  <div class="name anim anim-d1">${toName}</div>
  <div class="date anim anim-d1">${headerDate}</div>
  <div class="badge anim anim-d1"><span class="badge-icon">✈</span> Transfer ▾</div>
  <div class="timeline anim anim-d2">
    <div class="tl-item"><div class="tl-dot">↑</div><div class="tl-body"><div class="tl-title">Initiated<span class="tl-time">${t0}</span></div><div class="tl-sub">You made this transaction</div></div></div>
    <div class="tl-item"><div class="tl-dot">→</div><div class="tl-body"><div class="tl-title">In Progress<span class="tl-time">${t1}</span></div><div class="tl-sub">Your transaction is on its way.</div></div></div>
    <div class="tl-item"><div class="tl-dot">✓</div><div class="tl-body"><div class="tl-title">Completed<span class="tl-time">${t2}</span></div><div class="tl-sub">${bank} received your transaction.</div></div></div>
  </div>
  <button class="view-btn anim anim-d2">View Details</button>
  <div class="card anim anim-d3">
    <div class="card-top"><div><div class="card-label">To</div><div class="card-val">${bank}</div></div><div class="bank-icon">⬡</div></div>
    <div class="field"><div class="field-l">Description</div><div class="field-v">${data.remark && !/^[0-9]/.test(data.remark) ? data.remark : "····"}</div></div>
    <div class="field"><div class="field-l">Payment Method</div><div class="field-v">Outward Transfer</div></div>
    <div class="field"><div class="field-l">Account number</div><div class="field-v">${acct}<span class="copy">⧉</span></div></div>
    <div class="field" style="margin-bottom:0"><div class="field-l">Transaction Reference</div><div class="field-v" style="font-size:12px;word-break:break-all">${ref}<span class="copy">⧉</span></div></div>
  </div>
  <button class="share anim anim-d3">Share</button>
</div>
${themeScript}</body></html>`;
  }

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
<div class="wrap">${wm}
  <div class="holes"><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span><span class="hole"></span></div>
  <div class="top anim">
    <div class="logo-row">${LOGOS.opay}</div>
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

  if (p === "binance") {
    const cur = (data.currency || "USDT").toUpperCase();
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#181a20;color:#eaecef;min-height:100vh}
.wrap{max-width:420px;margin:0 auto;padding:40px 20px 48px;position:relative}
.logo-row{display:flex;justify-content:center;margin-bottom:12px}
.icon{width:68px;height:68px;background:#0ecb81;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:34px;color:#fff}
.t{text-align:center;font-size:18px;font-weight:600;margin-bottom:26px}
.box{background:#1e2026;border-radius:12px;padding:8px 16px;margin-bottom:18px}
.row{display:flex;justify-content:space-between;padding:13px 0;font-size:14px;border-bottom:1px solid #2b2f36}
.row:last-child{border:none}
.l{color:#848e9c}.r{color:#eaecef;text-align:right;max-width:62%;word-break:break-all;font-weight:500}
.note{color:#848e9c;font-size:12px;line-height:1.55;margin-bottom:22px}
.btns{display:flex;gap:12px}
.b1{flex:1;background:#2b2f36;color:#eaecef;border:none;padding:14px;border-radius:8px;font-weight:600;font-size:14px}
.b2{flex:1;background:#f0b90b;color:#181a20;border:none;padding:14px;border-radius:8px;font-weight:700;font-size:14px}
</style></head><body>
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
  <div class="note anim anim-d3">Crypto transferred out of Binance.</div>
  <div class="btns anim anim-d3"><button class="b1">Save Address</button><button class="b2">View History</button></div>
</div>
${themeScript}</body></html>`;
  }

  if (p === "cashapp") {
    const cur = (data.currency || "USD").toUpperCase();
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#00d632;min-height:100vh}
.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:56px 24px 40px;text-align:center;color:#fff;position:relative}
.check{width:76px;height:76px;border:3px solid #fff;border-radius:50%;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;font-size:38px}
.t{font-size:18px;font-weight:600;margin-bottom:22px}
.amt{font-size:46px;font-weight:700;margin-bottom:10px}
.to{font-size:14px;opacity:0.95;margin-bottom:28px;line-height:1.5;word-break:break-all}
.btn{background:#fff;color:#00d632;border:none;border-radius:28px;padding:16px;width:100%;font-size:16px;font-weight:700}
</style></head><body>
<div class="wrap">${wm}
  <div class="check check-anim">✓</div>
  <div class="t anim anim-d1">Payment Sent!</div>
  <div class="amt anim anim-d1">${money(data.amount, cur)}</div>
  <div class="to anim anim-d2">Your payment has been sent to<br/><strong>${data.toName || data.toAddress || "recipient"}</strong></div>
  <button class="btn anim anim-d3">Close</button>
</div>
${themeScript}</body></html>`;
  }

  // generic / zelle / apple / trust / coinbase fallback
  const cur = (data.currency || "USD").toUpperCase();
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${baseCSS}
body{background:#f5f5f7;min-height:100vh}
body.dark{background:#0d0d12;color:#e8e8f0}
.wrap{max-width:420px;margin:0 auto;padding:28px 22px;position:relative}
.card{background:#fff;border-radius:16px;padding:22px;box-shadow:0 2px 16px rgba(0,0,0,0.07)}
body.dark .card{background:#1a1a24}
.t{text-align:center;font-size:15px;font-weight:600;margin-bottom:12px}
.amt{text-align:center;font-size:28px;font-weight:700;margin-bottom:18px}
.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
body.dark .row{border-color:#2a2a38}
.l{color:#888}.r{color:#111;font-weight:500;text-align:right;max-width:60%;word-break:break-all}
body.dark .r{color:#e8e8f0}
</style></head><body>
<div class="wrap">${wm}
  <div class="card">
    <div class="t anim">${(data.platform || "Receipt").toUpperCase()}</div>
    <div class="amt anim anim-d1">${money(data.amount, cur)}</div>
    <div class="row anim anim-d2"><span class="l">To</span><span class="r">${data.toName || data.toAddress || "—"}</span></div>
    <div class="row anim anim-d2"><span class="l">From</span><span class="r">${data.fromName || "—"}</span></div>
    <div class="row anim anim-d2"><span class="l">Date</span><span class="r">${ts}</span></div>
    <div class="row anim anim-d3"><span class="l">Status</span><span class="r">Completed</span></div>
  </div>
</div>
${themeScript}</body></html>`;
}
