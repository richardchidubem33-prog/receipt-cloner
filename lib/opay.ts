// OPay + OPay2 full templates
export function buildOpayHTML(
  data: {
    amount: number;
    toName?: string;
    toAccount?: string;
    fromName?: string;
    bank?: string;
    remark?: string;
    timestamp?: string;
  },
  clean: boolean,
  wm: string,
  themeScript: string,
  money: (a: number, c: string) => string,
  antiLink: (s: string) => string,
  variant: "opay" | "opay2"
): string {
  const OPAY_LOGO = `<svg width="85" height="32" viewBox="0 0 85 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.137 6a11.475 11.475 0 0 0-6.802 2.203 11.38 11.38 0 0 0-4.156 5.792.211.211 0 0 0 .107.252c.03.015.063.023.096.023h4.399a.212.212 0 0 0 .19-.114 6.945 6.945 0 0 1 2.632-2.727 6.993 6.993 0 0 1 3.68-.946c3.72.067 6.6 3.112 6.735 6.62a6.869 6.869 0 0 1-1.347 4.352 6.93 6.93 0 0 1-3.78 2.566 6.96 6.96 0 0 1-4.564-.338 6.914 6.914 0 0 1-3.356-3.096.211.211 0 0 0-.188-.114h-4.4a.213.213 0 0 0-.204.275 11.368 11.368 0 0 0 3.391 5.186 11.455 11.455 0 0 0 5.618 2.652c2.083.351 4.222.12 6.182-.665a11.424 11.424 0 0 0 4.917-3.787A11.324 11.324 0 0 0 24.31 12.27a11.395 11.395 0 0 0-4.197-4.566A11.474 11.474 0 0 0 14.137 6" fill="#1DCF9F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.62 19.517H2.229a.226.226 0 0 1-.211-.145.235.235 0 0 1-.017-.089v-3.692a.235.235 0 0 1 .14-.216.226.226 0 0 1 .088-.018h5.393a.226.226 0 0 1 .211.145.235.235 0 0 1 .017.089v3.692a.235.235 0 0 1-.14.216.226.226 0 0 1-.088.018" fill="#210F60"/></svg>`;
  const OPAY2_LOGO = `<svg width="108" height="34" viewBox="0 0 108 34" xmlns="http://www.w3.org/2000/svg"><circle cx="17" cy="17" r="13" fill="none" stroke="#00D9A5" stroke-width="4.5"/><rect x="1" y="14" width="13" height="6" rx="3" fill="#ffffff"/><text x="38" y="24" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="22" font-weight="700" fill="#ffffff">Pay</text></svg>`;

  const txNo = data.remark || `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
  const session = `10000${String(Date.now()).slice(-22)}`;
  const d = new Date();
  const day = d.getDate();
  const ord = (n: number) => { const s = ["th","st","nd","rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; };
  const dateStr = data.timestamp || `${d.toLocaleString("en-US", { month: "short" })} ${day}${ord(day)}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  if (variant === "opay") {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1a1a1a}.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:28px 24px 40px;position:relative;overflow:hidden}.bgmark{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.055;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='80'%3E%3Ctext x='10' y='50' font-family='Arial' font-size='28' font-weight='700' fill='%231DCF9F'%3EOPay%3C/text%3E%3C/svg%3E");background-repeat:repeat;background-size:140px 70px}.content{position:relative;z-index:1}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:36px}.logo svg{height:28px}.hdr-title{color:#9ca3af;font-size:14px}.amt{text-align:center;color:#12b76a;font-size:40px;font-weight:700;margin-bottom:10px}.status{text-align:center;font-size:18px;font-weight:600;margin-bottom:8px}.date{text-align:center;color:#9ca3af;font-size:13px;margin-bottom:28px}.divider{border:none;border-top:1px dashed #e5e7eb;margin:0 0 22px}.row{display:flex;justify-content:space-between;margin-bottom:22px}.label{color:#9ca3af;font-size:13px;width:38%}.value{text-align:right;flex:1;font-size:14px;font-weight:600;line-height:1.45}.value .sub{font-weight:400;color:#6b7280;font-size:13px}.foot{color:#9ca3af;font-size:12px;line-height:1.65}</style></head><body>
<div class="wrap"><div class="bgmark"></div>${wm}<div class="content">
<div class="header"><div class="logo">${OPAY_LOGO}</div><div class="hdr-title">Transaction Receipt</div></div>
<div class="amt">${money(data.amount, "NGN")}</div><div class="status">Successful</div><div class="date">${dateStr}</div><hr class="divider"/>
<div class="row"><div class="label">Recipient Details</div><div class="value">${data.toName || "—"}<div class="sub">${data.bank || "Bank"} | ${antiLink(data.toAccount || "—")}</div></div></div>
<div class="row"><div class="label">Sender Details</div><div class="value">${data.fromName || "—"}<div class="sub">OPay | ${antiLink("706****493")}</div></div></div>
<div class="row"><div class="label">Transaction No.</div><div class="value" style="font-size:13px;word-break:break-all">${txNo}</div></div>
<div class="row"><div class="label">Session ID</div><div class="value" style="font-size:12px;word-break:break-all">${session}</div></div>
<hr class="divider"/><div class="foot">Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.</div>
</div></div>${themeScript}</body></html>`;
  }

  const toName = (data.toName || "RECIPIENT").toUpperCase();
  const fromName = (data.fromName || "SENDER").toUpperCase();
  const bank = data.bank || "United Bank For Africa";
  const toAcct = data.toAccount || "—";
  const fromMask = "905****" + String(Math.floor(Math.random() * 900 + 100));
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#2b2b2b;color:#e8e8e8;min-height:100vh}.wrap{max-width:420px;margin:0 auto;min-height:100vh;padding:32px 22px 36px;position:relative;overflow:hidden;background:#2b2b2b}.wrap::before,.wrap::after{content:"";position:absolute;left:0;right:0;height:14px;background:radial-gradient(circle at 12px 0,#1a1a1a 7px,transparent 7.5px);background-size:24px 14px;background-repeat:repeat-x;z-index:2}.wrap::before{top:0;transform:rotate(180deg)}.wrap::after{bottom:0}.bgmark{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.06;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='70'%3E%3Ctext x='6' y='48' font-family='Arial' font-size='28' font-weight='700' fill='%23fff'%3EOPay%3C/text%3E%3C/svg%3E");background-repeat:repeat;background-size:140px 68px}.content{position:relative;z-index:1;padding-top:8px}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}.logo svg{height:30px}.hdr-title{color:#a3a3a3;font-size:14px}.amt{text-align:center;color:#00D9A5;font-size:38px;font-weight:700;margin-bottom:10px}.status{text-align:center;font-size:18px;font-weight:600;color:#f0f0f0;margin-bottom:6px}.date{text-align:center;color:#9a9a9a;font-size:13px;margin-bottom:28px}.row{display:flex;justify-content:space-between;margin-bottom:22px;gap:12px}.label{color:#9a9a9a;font-size:13px;width:36%}.value{text-align:right;flex:1;font-size:14px;font-weight:600;color:#f0f0f0;line-height:1.45}.value .sub{display:block;font-weight:400;color:#9a9a9a;font-size:12px;margin-top:3px}.tx{display:flex;justify-content:space-between;margin-bottom:14px;font-size:13px;gap:10px}.tx .l{color:#9a9a9a}.tx .r{color:#e0e0e0;text-align:right;word-break:break-all}.divider{border:none;border-top:1px dashed #4a4a4a;margin:20px 0 18px}.foot{color:#9a9a9a;font-size:11.5px;line-height:1.65}</style></head><body>
<div class="wrap"><div class="bgmark"></div>${wm}<div class="content">
<div class="header"><div class="logo">${OPAY2_LOGO}</div><div class="hdr-title">Transaction Receipt</div></div>
<div class="amt">₦${Number(data.amount).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="status">Successful</div><div class="date">${dateStr}</div>
<div class="row"><div class="label">Recipient Details</div><div class="value">${toName}<span class="sub">${bank} | ${toAcct}</span></div></div>
<div class="row"><div class="label">Sender Details</div><div class="value">${fromName}<span class="sub">OPay | ${fromMask}</span></div></div>
<div class="tx"><span class="l">Transaction No.</span><span class="r">${txNo}</span></div>
<div class="tx"><span class="l">Session ID</span><span class="r">${session}</span></div>
<hr class="divider"/><div class="foot">Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.</div>
</div></div>${themeScript}</body></html>`;
}
