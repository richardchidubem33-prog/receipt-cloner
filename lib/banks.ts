import { LOGO_FIRSTBANK, LOGO_FIDELITY, LOGO_GTBANK, LOGO_UBA, UBA2_HERO, QR_PLACEHOLDER } from "./logos";

export type BankData = {
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

function money(amount: number) {
  return "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function antiLink(s: string) {
  return String(s || "").replace(/(\d)/g, "$1\u200B");
}
function numberToWords(n: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const num = Math.floor(Math.abs(n));
  if (num === 0) return "Zero Naira Only";
  function under1000(x: number): string {
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x/10)] + (x%10 ? " " + ones[x%10] : "");
    return ones[Math.floor(x/100)] + " Hundred" + (x%100 ? " and " + under1000(x%100) : "");
  }
  let s = "";
  const mill = Math.floor(num / 1000000);
  const thou = Math.floor((num % 1000000) / 1000);
  const rest = num % 1000;
  if (mill) s += under1000(mill) + " Million ";
  if (thou) s += under1000(thou) + " Thousand ";
  if (rest) s += under1000(rest);
  return s.trim() + " Naira Only";
}

export function buildBankReceipt(p: string, data: BankData, clean: boolean, wm: string, themeScript: string): string | null {
  const d = new Date();
  const amt = money(data.amount);
  const words = numberToWords(data.amount);
  const ref = data.remark || ("REF" + Date.now().toString().slice(-12));

  if (p === "firstbank") {
    const dateStr = data.timestamp || d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" }) + " " + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0") + ":" + String(d.getSeconds()).padStart(2,"0");
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1a1a1a;min-height:100vh}.wrap{max-width:440px;margin:0 auto;padding:28px 24px 40px;position:relative}.logo-row{display:flex;justify-content:flex-end;margin-bottom:28px}.title{text-align:center;font-size:22px;font-weight:700;color:#1a237e;margin-bottom:4px}.status{text-align:center;font-size:18px;font-weight:600;color:#555;margin-bottom:12px}.amt{text-align:center;font-size:28px;font-weight:700;margin-bottom:4px}.words{text-align:center;font-size:13px;color:#888;margin-bottom:8px}.date{text-align:center;font-size:13px;color:#666;margin-bottom:24px}.line{border:none;border-top:2px solid #1a237e;margin:0 0 20px}.row{display:flex;margin-bottom:14px;font-size:14px}.l{color:#c9a227;font-weight:600;width:42%;flex-shrink:0}.r{color:#333;font-weight:500;flex:1;word-break:break-word}.foot{margin-top:28px;font-size:10px;color:#888;line-height:1.5;text-align:center}.promo{margin-top:16px;font-size:12px;color:#1a237e;font-weight:600;text-align:center;line-height:1.5}.legal{margin-top:16px;font-size:9px;color:#aaa;line-height:1.45}</style></head><body>
<div class="wrap">${wm}
  <div class="logo-row"><img src="${LOGO_FIRSTBANK}" alt="FirstBank" style="height:48px;width:auto"/></div>
  <div class="title">Transaction Receipt</div>
  <div class="status">Successful</div>
  <div class="amt">${amt}</div>
  <div class="words">${words}</div>
  <div class="date">${dateStr}</div>
  <hr class="line"/>
  <div class="row"><div class="l">From:</div><div class="r">${antiLink(data.fromName ? "*****" + String(data.fromName).slice(-5) : "*****19504")}</div></div>
  <div class="row"><div class="l">Sender Name:</div><div class="r">${(data.fromName || "SENDER NAME").toUpperCase()}</div></div>
  <div class="row"><div class="l">Beneficiary Name:</div><div class="r">${(data.toName || "BENEFICIARY").toUpperCase()}</div></div>
  <div class="row"><div class="l">Account No:</div><div class="r">${antiLink(data.toAccount || "—")}</div></div>
  <div class="row"><div class="l">Bank:</div><div class="r">${data.bank || "GTB (Guaranty Trust Bank)"}</div></div>
  <div class="row"><div class="l">Transaction Type:</div><div class="r">Interbank Transfer</div></div>
  <div class="row"><div class="l">Reference No:</div><div class="r" style="font-size:12px">${ref}</div></div>
  <div class="row"><div class="l">Narration:</div><div class="r">${data.remark || "Transfer"}</div></div>
  <hr class="line"/>
  <div class="foot">For more information, please contact us: 07014485530, 07080625000 firstcontactcomplaints@firstbanknigeria.com<br/>complaints@firstbanknigeria.com; www.firstbanknigeria.com</div>
  <div class="promo">Get airtime in seconds. Dial*894*amount#. Out of data?<br/>Dial *894*2#. Need an account? Dial *894*0#.</div>
  <div class="legal">Your transfer has been successful and the beneficiary's account will be credited. However, this does not serve as confirmation of credit into the beneficiary's account.</div>
</div>${themeScript}</body></html>`;
  }

  if (p === "gtbank" || p === "gtco") {
    const dateStr = data.timestamp || d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + ", GMT+1";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1a1a1a;min-height:100vh}.wrap{max-width:440px;margin:0 auto;padding:28px 24px 40px;position:relative}.top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}.receipt-label{font-size:22px;font-weight:700}.date-top{font-size:12px;color:#888;margin-top:4px}.amt{font-size:36px;font-weight:700;margin-bottom:6px}.words{font-size:13px;color:#888;margin-bottom:12px}.success{color:#16a34a;font-size:15px;font-weight:600;margin-bottom:28px}.field{margin-bottom:16px}.field-l{font-size:12px;color:#999;margin-bottom:2px}.field-v{font-size:15px;font-weight:600;color:#222}.promo{margin-top:36px;display:flex;justify-content:space-between;align-items:center;gap:16px}.promo-text{font-size:20px;font-weight:700;line-height:1.3}.promo-text span{color:#e85d04}.legal{margin-top:24px;font-size:9px;color:#aaa;line-height:1.45}</style></head><body>
<div class="wrap">${wm}
  <div class="top"><div><div class="receipt-label">Receipt</div><div class="date-top">${dateStr}</div></div><img src="${LOGO_GTBANK}" alt="GTBank" style="height:40px;width:auto"/></div>
  <div class="amt">${amt}</div>
  <div class="words">${words}</div>
  <div class="success">Success</div>
  <div class="field"><div class="field-l">Sender</div><div class="field-v">${data.fromName || "—"}</div></div>
  <div class="field"><div class="field-l">Receiver</div><div class="field-v">${data.toName || "—"}</div></div>
  <div class="field"><div class="field-l">Account number</div><div class="field-v">${antiLink(data.toAccount || "—")}</div></div>
  <div class="field"><div class="field-l">Receiving bank</div><div class="field-v">${data.bank || "Opay"}</div></div>
  <div class="field"><div class="field-l">Reference number</div><div class="field-v" style="font-size:13px">${ref}</div></div>
  <div class="field"><div class="field-l">Remark</div><div class="field-v" style="font-size:13px;font-weight:500">NIBSS Instant Payment Outward ${ref} To ${data.bank || "Opay"}/${data.toName || "—"}</div></div>
  <div class="promo"><div class="promo-text">Download the <span>new GTWorld app</span> using this QR code</div><img src="${QR_PLACEHOLDER}" alt="QR" style="width:100px;height:100px"/></div>
  <div class="legal">Your transfer has been successful and the beneficiary's account will be credited.</div>
</div>${themeScript}</body></html>`;
  }

  if (p === "fidelity") {
    const dateStr = data.timestamp || d.toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric" }) + " at " + d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) + " GMT";
    const amtF = "NGN " + Number(data.amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1a1a1a;min-height:100vh}.wrap{max-width:480px;margin:0 auto;padding:28px 24px 20px;position:relative}.logo-row{display:flex;justify-content:flex-end;margin-bottom:32px}.h1{font-size:22px;font-weight:700;margin-bottom:2px}.h2{font-size:14px;color:#555;margin-bottom:20px}.line{border:none;border-top:1px solid #ccc}.sec{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid #ddd;font-size:13px}.sec-l{color:#333;font-weight:600;width:28%}.sec-r{text-align:right;flex:1;line-height:1.5}.sec-r .sub{color:#666;font-size:12px}.foot-box{display:flex;gap:16px;margin-top:24px;align-items:flex-start}.foot-text{font-size:11px;color:#555;line-height:1.55}.banner{margin-top:28px;background:linear-gradient(90deg,#1a237e,#0d47a1);color:#fff;padding:14px 16px;border-radius:4px;font-size:12px;text-align:center}</style></head><body>
<div class="wrap">${wm}
  <div class="logo-row"><img src="${LOGO_FIDELITY}" alt="Fidelity" style="height:40px;width:auto"/></div>
  <div class="h1">Online Banking</div>
  <div class="h2">Transaction Receipt</div>
  <hr class="line"/>
  <div class="sec"><div class="sec-l">Payer</div><div class="sec-r">${(data.fromName || "PAYER NAME").toUpperCase()}<div class="sub">${antiLink("623****535")}<br/>Fidelity Bank Plc.</div></div></div>
  <div class="sec"><div class="sec-l">Receiver</div><div class="sec-r">${(data.toName || "RECEIVER").toUpperCase()}<div class="sub">${antiLink(data.toAccount ? data.toAccount.slice(0,3)+"****"+data.toAccount.slice(-3) : "001****111")}<br/>${(data.bank || "ACCESS BANK").toUpperCase()}</div></div></div>
  <div class="sec"><div class="sec-l">Transaction</div><div class="sec-r">${amtF}<div class="sub">INTERTRANSFER<br/>${dateStr}</div></div></div>
  <div class="sec"><div class="sec-l">Narration</div><div class="sec-r">${data.remark || "ONB TRF TO " + (data.toName || "RECEIVER").toUpperCase()}</div></div>
  <div class="sec"><div class="sec-l">Reference</div><div class="sec-r">${ref}<div class="sub">SUCCESSFUL</div></div></div>
  <div class="foot-box"><img src="${QR_PLACEHOLDER}" alt="QR" style="width:64px;height:64px"/><div class="foot-text">This is an electronic receipt of a transaction and does not require any signature. The authenticity of transaction can be confirmed with the Bank. For any other assistance, kindly call True Serve on 0700 3233 5489 or email true.serve@fidelitybank.ng</div></div>
  <div class="banner">Fidelity · Save & Win · Terms apply</div>
</div>${themeScript}</body></html>`;
  }

  if (p === "uba") {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const dateStr = data.timestamp || `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
    const timeStr = String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0") + ":" + String(d.getSeconds()).padStart(2,"0");
    const amtU = Number(data.amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " NGN";
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1a1a1a;min-height:100vh}.wrap{max-width:440px;margin:0 auto;padding:0 0 40px;position:relative}.banner{background:#d32f2f;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}.banner-title{font-size:18px;font-weight:700}.body{padding:24px 22px;position:relative}.wm-bg{position:absolute;inset:40px 20px;opacity:0.06;font-size:120px;font-weight:900;color:#d32f2f;display:flex;align-items:center;justify-content:center;pointer-events:none}.h{font-size:16px;font-weight:700;margin-bottom:8px}.line{border:none;border-top:1px solid #ccc;margin:0 0 16px}.row{margin-bottom:10px;font-size:14px;line-height:1.45}.row b{font-weight:700}.note{margin-top:24px;font-size:13px;color:#333;line-height:1.5}</style></head><body>
<div class="wrap">${wm}
  <div class="banner"><span class="banner-title">Transaction Receipt</span><img src="${LOGO_UBA}" alt="UBA" style="height:28px;width:auto;filter:brightness(0) invert(1)" onerror="this.style.display='none'"/></div>
  <div class="body">
    <div class="wm-bg">UBA</div>
    <div class="h">Transaction Details:-</div>
    <hr class="line"/>
    <div class="row"><b>Date:</b> ${dateStr}</div>
    <div class="row"><b>Time:</b> ${timeStr}</div>
    <div class="row"><b>Reference:</b> ${ref}</div>
    <div class="row"><b>Amount:</b> ${amtU}</div>
    <div class="row"><b>Status:</b> SUCCESSFUL</div>
    <div class="row"><b>Type:</b> Debit</div>
    <div class="h" style="margin-top:22px">Accounts Details:-</div>
    <hr class="line"/>
    <div class="row"><b>Sender Name:</b> ${(data.fromName || "SENDER NAME").toUpperCase()}</div>
    <div class="row"><b>Sender Account Number:</b> ${antiLink("*****96378")}</div>
    <div class="row"><b>Receiver Name:</b> ${data.toName || "—"}</div>
    <div class="row"><b>Receiver Account Number:</b> ${antiLink(data.toAccount || "—")}</div>
    <div class="row"><b>Narration:</b> ${data.remark || "MOB/UTO/" + (data.toName || "Transfer")}</div>
    <div class="note">You will be able to dispute this transaction after 24 hours of transaction time.</div>
  </div>
</div>${themeScript}</body></html>`;
  }

  if (p === "uba2") {
    const name = (data.toName || "BENEFICIARY").toUpperCase();
    const bank = data.bank || "Moniepoint MICROFINANCE BANK";
    const acct = antiLink(data.toAccount || "—");
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="format-detection" content="telephone=no"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:rgba(0,0,0,0.45);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}.card{background:#fff;border-radius:20px;max-width:360px;width:100%;padding:28px 22px 20px;position:relative;text-align:center}.close{position:absolute;top:14px;right:16px;font-size:22px;color:#999}.hero{width:110px;height:110px;margin:4px auto 12px;display:flex;align-items:center;justify-content:center;overflow:hidden}.title{font-size:22px;font-weight:700;margin-bottom:14px;color:#111}.msg{font-size:15px;color:#333;line-height:1.55;margin-bottom:8px}.msg b{font-weight:700}.link{color:#1a5fb4;font-size:13px;text-decoration:underline;display:block;margin:12px 0 16px}.alert{border:1.5px solid #e53935;border-radius:10px;padding:12px 14px;text-align:left;font-size:12px;color:#c62828;line-height:1.45;margin-bottom:20px;display:flex;gap:8px}.alert-icon{width:18px;height:18px;border-radius:50%;background:#e53935;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px}.ok{display:block;width:100%;background:#e53935;color:#fff;border:none;border-radius:10px;padding:16px;font-size:16px;font-weight:700;margin-bottom:18px}.share-label{font-size:13px;color:#666;margin-bottom:10px}.share-row{display:flex;justify-content:center;gap:20px}.share-btn{border:1.5px solid #ddd;border-radius:12px;padding:12px 18px;font-size:12px;color:#c62828;display:flex;flex-direction:column;align-items:center;gap:4px}.share-btn span{font-size:22px}.uba-tag{position:absolute;top:14px;left:16px}.uba-tag img{height:22px;width:auto}</style></head><body>
<div class="card">${wm}
  <div class="uba-tag"><img src="${LOGO_UBA}" alt="UBA" onerror="this.style.display='none'"/></div>
  <div class="close">×</div>
  <div class="hero"><img src="${UBA2_HERO}" alt="Success" style="width:100px;height:100px;object-fit:contain"/></div>
  <div class="title">Success</div>
  <div class="msg">Your transfer of <b>${amt}</b> to<br/><b>${name}</b><br/>${bank}<br/>${acct}<br/>was successful.</div>
  <a class="link" href="#">View transaction details</a>
  <div class="alert"><div class="alert-icon">!</div><div>Enable Multi-Factor Authentication (MFA) to secure your account from fraudsters.</div></div>
  <button class="ok">OK</button>
  <div class="share-label">Share receipt</div>
  <div class="share-row">
    <div class="share-btn"><span>📄</span>PDF</div>
    <div class="share-btn"><span>🖼</span>Image</div>
  </div>
</div>${themeScript}</body></html>`;
  }

  return null;
}
