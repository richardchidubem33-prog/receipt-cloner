"use client";

import { useState } from "react";
import Link from "next/link";

const PLATFORMS = [
  { id: "opay", name: "OPay", color: "#1DBF73" },
  { id: "opay2", name: "OPay 2", color: "#12b76a" },
  { id: "paypal", name: "PayPal", color: "#0070BA" },
  { id: "zelle", name: "Zelle", color: "#6D1ED4" },
  { id: "cashapp", name: "Cash App", color: "#00D632" },
  { id: "applepay", name: "Apple Pay", color: "#111111" },
  { id: "trustwallet", name: "Trust Wallet", color: "#3375BB" },
  { id: "coinbase", name: "Coinbase", color: "#0052FF" },
  { id: "binance", name: "Binance", color: "#F0B90B" },
  { id: "kuda", name: "Kuda", color: "#40196D" },
  { id: "firstbank", name: "FirstBank", color: "#1a237e" },
  { id: "gtbank", name: "GTBank", color: "#e85d04" },
  { id: "fidelity", name: "Fidelity", color: "#1a5fb4" },
  { id: "uba", name: "UBA", color: "#d32f2f" },
  { id: "uba2", name: "UBA 2", color: "#c41e3a" },
];

const BANK_IDS = ["opay", "opay2", "kuda", "firstbank", "gtbank", "fidelity", "uba", "uba2"];

export default function Home() {
  const [platform, setPlatform] = useState("opay");
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [form, setForm] = useState<any>({
    amount: "",
    currency: "NGN",
    toName: "",
    toAccount: "",
    toAddress: "",
    fromName: "",
    bank: "",
    network: "",
    remark: "",
  });

  const p = PLATFORMS.find((x) => x.id === platform)!;

  function update(key: string, val: string) {
    setForm((f: any) => ({ ...f, [key]: val }));
  }

  function selectPlatform(id: string) {
    setPlatform(id);
    if (BANK_IDS.includes(id)) update("currency", "NGN");
    if (id === "binance" || id === "trustwallet" || id === "coinbase") update("currency", "USDT");
  }

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          ...form,
          amount: parseFloat(form.amount) || 0,
          accessKey: accessKey || null,
          dark,
        }),
      });
      if (!res.ok) throw new Error("Generate failed");
      const html = await res.text();
      const clean = res.headers.get("X-Clean") === "1";
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
      } else {
        const blob = new Blob([html], { type: "text/html" });
        window.location.href = URL.createObjectURL(blob);
      }
      if (!clean) {
        setTimeout(() => alert("Watermarked. Pay $2 USDT + ticket to unlock clean receipts."), 400);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Receipt Cloner</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/pay" style={{ color: "#aaa", fontSize: 13 }}>Pay / Unlock</Link>
          <Link href="/admin" style={{ color: "#666", fontSize: 13 }}>Admin</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 28 }}>
        {PLATFORMS.map((pl) => (
          <button
            key={pl.id}
            onClick={() => selectPlatform(pl.id)}
            style={{
              padding: "12px 6px",
              borderRadius: 12,
              border: platform === pl.id ? `2px solid ${pl.color}` : "1px solid #333",
              background: platform === pl.id ? pl.color + "22" : "#1a1a1a",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {pl.name}
          </button>
        ))}
      </div>

      <div className="card" style={{ borderTop: `4px solid ${p.color}`, background: platform === "applepay" ? "#111" : "#161616" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: p.color }}>{p.name}</div>
        </div>

        <div className="field">
          <label>Amount</label>
          <input type="number" placeholder="0.00" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
        </div>

        {(BANK_IDS.includes(platform) || platform === "paypal" || platform === "zelle" || platform === "cashapp" || platform === "applepay") && (
          <div className="field">
            <label>Currency</label>
            <select value={form.currency} onChange={(e) => update("currency", e.target.value)}>
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        )}

        {(platform === "trustwallet" || platform === "coinbase" || platform === "binance") && (
          <>
            <div className="field">
              <label>Asset</label>
              <select value={form.currency} onChange={(e) => update("currency", e.target.value)}>
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="BNB">BNB</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            <div className="field">
              <label>Network</label>
              <input placeholder="e.g. TRX / BEP20" value={form.network} onChange={(e) => update("network", e.target.value)} />
            </div>
            <div className="field">
              <label>To Address</label>
              <input placeholder="0x... or T..." value={form.toAddress} onChange={(e) => update("toAddress", e.target.value)} />
            </div>
          </>
        )}

        {(platform === "opay" || platform === "opay2") && (
          <>
            <div className="field"><label>Account Name (Recipient)</label><input value={form.toName} onChange={(e) => update("toName", e.target.value)} /></div>
            <div className="field"><label>Account Number</label><input value={form.toAccount} onChange={(e) => update("toAccount", e.target.value)} /></div>
            <div className="field"><label>Bank</label><input placeholder="e.g. United Bank For Africa" value={form.bank} onChange={(e) => update("bank", e.target.value)} /></div>
            <div className="field"><label>From (Sender)</label><input value={form.fromName} onChange={(e) => update("fromName", e.target.value)} /></div>
          </>
        )}

        {platform === "kuda" && (
          <>
            <div className="field"><label>Recipient Name</label><input value={form.toName} onChange={(e) => update("toName", e.target.value)} /></div>
            <div className="field"><label>Account Number</label><input value={form.toAccount} onChange={(e) => update("toAccount", e.target.value)} /></div>
            <div className="field"><label>Bank / To</label><input placeholder="e.g. PALMPAY" value={form.bank} onChange={(e) => update("bank", e.target.value)} /></div>
            <div className="field"><label>Transaction Ref (optional)</label><input value={form.remark} onChange={(e) => update("remark", e.target.value)} /></div>
          </>
        )}

        {(platform === "firstbank" || platform === "gtbank" || platform === "fidelity" || platform === "uba" || platform === "uba2") && (
          <>
            <div className="field"><label>Beneficiary / Receiver Name</label><input value={form.toName} onChange={(e) => update("toName", e.target.value)} /></div>
            <div className="field"><label>Account Number</label><input value={form.toAccount} onChange={(e) => update("toAccount", e.target.value)} /></div>
            <div className="field"><label>Bank</label><input placeholder="e.g. GTB / Access" value={form.bank} onChange={(e) => update("bank", e.target.value)} /></div>
            <div className="field"><label>Sender Name</label><input value={form.fromName} onChange={(e) => update("fromName", e.target.value)} /></div>
            <div className="field"><label>Narration / Reference</label><input value={form.remark} onChange={(e) => update("remark", e.target.value)} /></div>
          </>
        )}

        {(platform === "paypal" || platform === "zelle" || platform === "cashapp") && (
          <>
            <div className="field"><label>To (Name / Handle)</label><input value={form.toName} onChange={(e) => update("toName", e.target.value)} /></div>
            <div className="field"><label>From</label><input value={form.fromName} onChange={(e) => update("fromName", e.target.value)} /></div>
          </>
        )}

        {platform === "applepay" && (
          <div className="field"><label>Name / Merchant</label><input value={form.toName} onChange={(e) => update("toName", e.target.value)} /></div>
        )}

        <div className="field"><label>Note / Remark / Tx No (optional)</label><input value={form.remark} onChange={(e) => update("remark", e.target.value)} /></div>

        <div className="field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="dark" checked={dark} onChange={(e) => setDark(e.target.checked)} style={{ width: 18, height: 18 }} />
          <label htmlFor="dark" style={{ margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 14, color: "#ccc" }}>Dark theme receipt</label>
        </div>

        <div className="field">
          <label>Access Key (optional — removes watermark)</label>
          <input placeholder="RC-XXXXXXXXXXXXXXXX" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} />
        </div>

        <button
          className="btn"
          onClick={generate}
          disabled={loading || !form.amount}
          style={{
            width: "100%",
            background: p.color,
            color: platform === "binance" || platform === "cashapp" ? "#111" : "#fff",
            marginTop: 8,
          }}
        >
          {loading ? "Generating..." : "Open Receipt UI"}
        </button>
      </div>

      <p style={{ textAlign: "center", color: "#666", fontSize: 12, marginTop: 20 }}>
        Full mobile receipt UI · logos · animations.{" "}
        <Link href="/pay" style={{ color: "#aaa" }}>Pay $2 USDT</Link> to unlock clean.
      </p>
    </div>
  );
}
