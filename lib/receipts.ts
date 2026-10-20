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
};

function money(amount: number, currency: string) {
  if (currency === "NGN" || currency === "₦")
    return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  if (["BTC", "ETH", "USDT", "USDC", "BNB"].includes((currency || "").toUpperCase()))
    return `${amount} ${(currency || "").toUpperCase()}`;
  return `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function buildReceiptHTML(data: ReceiptData, clean: boolean): string {
  const p = (data.platform || "opay").toLowerCase();
  const ts = data.timestamp || new Date().toLocaleString();
  const wm = clean
    ? ""
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:50">
        <div style="transform:rotate(-28deg);color:rgba(220,40,40,0.28);font-size:18px;font-weight:700;letter-spacing:1px;white-space:nowrap">
          UNLICENSED — Pay $2 USDT to remove
        </div>
      </div>`;

  if (p === "paypal") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f7fa;min-height:100vh}
.wrap{max-width:420px;margin:0 auto;background:#fff;min-height:100vh;padding:28px 22px 40px;position:relative}
.logo{color:#0070ba;font-size:22px;font-weight:700;margin-bottom:28px}
.status{color:#1a7a3a;font-size:15px;font-weight:600;margin-bottom:6px}
.sub{color:#6b6b6b;font-size:13px;margin-bottom:22px}
.amt{font-size:32px;font-weight:700;color:#111;margin-bottom:28px}
.card{background:#f8f9fb;border-radius:12px;padding:18px;margin-bottom:24px}
.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee;font-size:14px}
.row:last-child{border-bottom:none}
.l{color:#888}.r{color:#111;font-weight:500;text-align:right;max-width:60%}
.badge{display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;padding:4px 10px;border-radius:20px}
</style></head><body><div class="wrap">${wm}
  <div class="logo">PayPal</div>
  <div class="status">✓ Payment sent</div>
  <div class="sub">You sent a payment</div>
  <div class="amt">${money(data.amount, data.currency || "USD")} <span style="font-size:16px;font-weight:500;color:#555">USD</span></div>
  <div class="card">
    <div class="row"><span class="l">To</span><span class="r">${data.toName || "—"}<br/><span style="font-size:12px;color:#0070ba">${data.toAccount || ""}</span></span></div>
    <div class="row"><span class="l">Transaction ID</span><span class="r">${data.remark || Math.random().toString(16).slice(2, 10)}</span></div>
    <div class="row"><span class="l">Date</span><span class="r">${ts}</span></div>
    <div class="row"><span class="l">Payment method</span><span class="r">PayPal balance</span></div>
    <div class="row"><span class="l">Status</span><span class="r"><span class="badge">Completed</span></span></div>
  </div>
</div></body></html>`;
  }

  if (p === "opay") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff}
.wrap{max-width:420px;margin:0 auto;padding:20px 20px 48px;position:relative;border:8px solid #111;border-radius:28px;border-top:0;border-bottom-style:dashed}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}
.logo{color:#0a6b3c;font-size:20px;font-weight:800}
.title{color:#666;font-size:13px}
.amt{text-align:center;color:#12b76a;font-size:34px;font-weight:800;margin:8px 0 6px}
.ok{text-align:center;font-size:16px;font-weight:700;color:#111;margin-bottom:4px}
.date{text-align:center;color:#999;font-size:12px;margin-bottom:28px}
.row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f0f0f0}
.sl{color:#999;font-size:12px}.sv{color:#111;font-size:14px;font-weight:600;text-align:right}
.foot{margin-top:28px;color:#aaa;font-size:11px;line-height:1.5;text-align:center}
</style></head><body><div class="wrap">${wm}
  <div class="top"><div class="logo">● OPay</div><div class="title">Transaction Receipt</div></div>
  <div class="amt">${money(data.amount, data.currency || "NGN")}</div>
  <div class="ok">Successful</div>
  <div class="date">${ts}</div>
  <div class="row"><div class="sl">Recipient Details</div><div class="sv">${data.toName || "—"}<br/><span style="font-weight:400;color:#666;font-size:12px">${data.bank || "Bank"} | ${data.toAccount || "—"}</span></div></div>
  <div class="row"><div class="sl">Sender Details</div><div class="sv">${data.fromName || "—"}<br/><span style="font-weight:400;color:#666;font-size:12px">OPay | ****</span></div></div>
  <div class="row"><div class="sl">Transaction Type</div><div class="sv">Transfer to Bank Account</div></div>
  <div class="row"><div class="sl">Transaction No.</div><div class="sv" style="font-size:11px">${data.remark || String(Date.now())}</div></div>
  <div class="row"><div class="sl">Session ID</div><div class="sv" style="font-size:11px">10000${String(Date.now()).slice(-18)}</div></div>
  <div class="foot">Enjoy a better life with OPay. Licensed by the Central Bank of Nigeria and insured by the NDIC.</div>
</div></body></html>`;
  }

  if (p === "zelle") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,"Times New Roman",serif;background:#fff}
.wrap{max-width:420px;margin:0 auto;padding:36px 28px;position:relative}
.h{text-align:center;font-size:11px;letter-spacing:1px;color:#555;margin-bottom:12px}
.t{text-align:center;font-size:22px;font-weight:700;color:#1a1450;margin-bottom:10px}
.sub{text-align:center;font-size:12px;color:#666;margin-bottom:28px;line-height:1.5}
.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #e8e8e8;font-size:14px}
.l{color:#333;font-weight:700;letter-spacing:0.5px;font-size:12px}
.r{color:#111;text-align:right}
.logos{text-align:center;margin-top:40px;font-size:18px;font-weight:700}
.logos span{color:#6c1eb0}
</style></head><body><div class="wrap">${wm}
  <div class="h">ZELLE® TRANSACTION DETAILS</div>
  <div class="t">Payment sent.</div>
  <div class="sub">These details are as of ${ts}.<br/>View your Zelle® activity to see the current status.</div>
  <div class="row"><span class="l">TO</span><span class="r">${data.toName || "—"}<br/>${data.toAccount || ""}</span></div>
  <div class="row"><span class="l">AMOUNT</span><span class="r">${money(data.amount, data.currency || "USD")}</span></div>
  <div class="row"><span class="l">FROM</span><span class="r">${data.fromName || "Checking"}</span></div>
  <div class="row"><span class="l">SENT</span><span class="r">${ts}</span></div>
  <div class="row"><span class="l">MEMO</span><span class="r">${data.remark || ""}</span></div>
  <div class="row"><span class="l">CONFIRMATION CODE</span><span class="r">${Math.random().toString(36).slice(2, 12).toUpperCase()}</span></div>
  <div class="logos">USbank &nbsp;|&nbsp; <span>Zelle®</span></div>
</div></body></html>`;
  }

  if (p === "cashapp") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#00d632;min-height:100vh}
.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:48px 24px;text-align:center;color:#fff;position:relative}
.check{width:72px;height:72px;border:3px solid #fff;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px}
.t{font-size:18px;font-weight:600;margin-bottom:24px}
.amt{font-size:48px;font-weight:700;margin-bottom:8px}
.to{font-size:14px;opacity:0.95;margin-bottom:32px;word-break:break-all}
.share{font-size:13px;letter-spacing:1px;margin-bottom:40px}
.btn{background:#fff;color:#00d632;border:none;border-radius:28px;padding:16px;width:100%;font-size:16px;font-weight:700}
</style></head><body><div class="wrap">${wm}
  <div class="check">✓</div>
  <div class="t">Payment Sent!</div>
  <div class="amt">${money(data.amount, data.currency || "USD")}</div>
  <div class="to">Your payment has been sent to<br/><strong>${data.toName || data.toAddress || "recipient"}</strong></div>
  <div class="share">↗ SHARE</div>
  <button class="btn">Close</button>
</div></body></html>`;
  }

  if (p === "binance") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#181a20;color:#eaecef;min-height:100vh}
.wrap{max-width:420px;margin:0 auto;padding:40px 20px;position:relative}
.icon{width:64px;height:64px;background:#0ecb81;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff}
.t{text-align:center;font-size:18px;font-weight:600;margin-bottom:28px}
.box{background:#1e2026;border-radius:12px;padding:16px;margin-bottom:20px}
.row{display:flex;justify-content:space-between;padding:12px 0;font-size:14px;border-bottom:1px solid #2b2f36}
.row:last-child{border:none}
.l{color:#848e9c}.r{color:#eaecef;text-align:right;max-width:60%;word-break:break-all}
.btns{display:flex;gap:12px;margin-top:16px}
.b1{flex:1;background:#2b2f36;color:#eaecef;border:none;padding:14px;border-radius:8px;font-weight:600}
.b2{flex:1;background:#f0b90b;color:#181a20;border:none;padding:14px;border-radius:8px;font-weight:700}
</style></head><body><div class="wrap">${wm}
  <div class="icon">✓</div>
  <div class="t">Withdrawal Request Successful</div>
  <div class="box">
    <div class="row"><span class="l">Amount</span><span class="r">${money(data.amount, data.currency || "USDT")}</span></div>
    <div class="row"><span class="l">Network</span><span class="r">${data.network || "TRX"}</span></div>
    <div class="row"><span class="l">Source</span><span class="r">Spot Wallet</span></div>
    <div class="row"><span class="l">Address</span><span class="r">${data.toAddress || "—"}</span></div>
    <div class="row"><span class="l">Network fee</span><span class="r">${data.remark || "1 USDT"}</span></div>
  </div>
  <div class="btns"><button class="b1">Save Address</button><button class="b2">View History</button></div>
</div></body></html>`;
  }

  if (p === "applepay") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f2f2f7}
.wrap{max-width:420px;margin:0 auto;padding:20px;position:relative}
.card{background:linear-gradient(145deg,#1a1a1a,#0d0d0d);border-radius:16px;padding:20px;color:#fff;margin-bottom:20px;min-height:180px}
.logo{font-size:18px;font-weight:600;margin-bottom:40px}
.bal-l{font-size:13px;color:#aaa}.bal{font-size:28px;font-weight:700;margin-top:4px}
.h{font-size:17px;font-weight:700;margin:16px 0 12px;color:#111}
.tx{display:flex;align-items:center;padding:12px 0;border-bottom:1px solid #e5e5ea}
.icon{width:36px;height:36px;background:#111;border-radius:8px;margin-right:12px;display:flex;align-items:center;justify-content:center;color:#fff}
.tx-name{font-size:15px;font-weight:600;color:#111}.tx-sub{font-size:12px;color:#8e8e93}
.tx-amt{font-size:15px;font-weight:600;color:#34c759;margin-left:auto}
</style></head><body><div class="wrap">${wm}
  <div class="card"><div class="logo">Apple Cash</div><div class="bal-l">Balance</div><div class="bal">${money(data.amount, data.currency || "USD")}</div></div>
  <div class="h">Latest Transactions</div>
  <div class="tx"><div class="icon">$</div><div><div class="tx-name">${data.toName || "Transfer"}</div><div class="tx-sub">${ts}</div></div><div class="tx-amt">+${money(data.amount, data.currency || "USD")}</div></div>
</div></body></html>`;
  }

  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f7}
.wrap{max-width:420px;margin:0 auto;padding:24px;position:relative}
.card{background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.t{text-align:center;font-size:16px;font-weight:600;margin-bottom:16px}
.amt{text-align:center;font-size:28px;font-weight:700;margin-bottom:20px}
.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
.l{color:#888}.r{color:#111;font-weight:500;text-align:right;max-width:60%;word-break:break-all}
.status{color:#0a0;background:#e8f8e8;padding:2px 8px;border-radius:8px;font-size:12px}
.btn{display:block;width:100%;margin-top:20px;background:#0052ff;color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600}
</style></head><body><div class="wrap">${wm}
  <div class="card">
    <div class="t">Sent ${data.currency || "BTC"}</div>
    <div class="amt">${money(data.amount, data.currency || "BTC")}</div>
    <div class="row"><span class="l">Network</span><span class="r">${data.network || "Bitcoin"}</span></div>
    <div class="row"><span class="l">Status</span><span class="r"><span class="status">Completed</span></span></div>
    <div class="row"><span class="l">Time</span><span class="r">${ts}</span></div>
    <div class="row"><span class="l">To</span><span class="r">${data.toAddress || data.toName || "—"}</span></div>
    <button class="btn">View on Explorer</button>
  </div>
</div></body></html>`;
}
