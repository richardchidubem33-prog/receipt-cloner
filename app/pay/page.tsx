"use client";

import { useState } from "react";
import Link from "next/link";

const TRON = "TV3mNdgC2sc7EDhsamKcn5tFnpegRtWP1z";
const BSC = "0x2ae5ca7ff7a97427da7e0c9c1467494f419bde80";

export default function PayPage() {
  const [txHash, setTxHash] = useState("");
  const [network, setNetwork] = useState<"TRON" | "BSC">("TRON");
  const [plan, setPlan] = useState<"days" | "receipts">("days");
  const [quantity, setQuantity] = useState("7");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!txHash.trim()) return alert("Paste the transaction hash");
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
          network,
          amount: "2",
          plan,
          quantity: Number(quantity),
          email: email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSubmitted(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 80px" }}>
      <Link href="/" style={{ color: "#888", fontSize: 13 }}>← Back</Link>
      <h1 style={{ fontSize: 22, margin: "16px 0" }}>Unlock Clean Receipts</h1>
      <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5 }}>
        Send exactly <strong style={{ color: "#fff" }}>$2 USDT</strong> to one of the addresses below,
        then submit your transaction hash. Admin will verify and issue your access key.
      </p>

      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>TRON (TRC20) USDT</div>
          <div
            style={{
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: 13,
              background: "#0d0d0d",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #333",
            }}
          >
            {TRON}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Binance Smart Chain (BEP20) USDT</div>
          <div
            style={{
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: 13,
              background: "#0d0d0d",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #333",
            }}
          >
            {BSC}
          </div>
        </div>
      </div>

      {!submitted ? (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="field">
            <label>Network you paid on</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value as any)}>
              <option value="TRON">TRON (TRC20)</option>
              <option value="BSC">BSC (BEP20)</option>
            </select>
          </div>
          <div className="field">
            <label>Transaction Hash</label>
            <input
              placeholder="Paste tx hash here"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as any)}>
              <option value="days">Unlimited for X days</option>
              <option value="receipts">X clean receipts</option>
            </select>
          </div>
          <div className="field">
            <label>{plan === "days" ? "Number of days" : "Number of receipts"}</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Email (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button
            className="btn"
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", background: "#1DBF73", color: "#fff" }}
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 20, borderColor: "#1DBF73" }}>
          <div style={{ color: "#1DBF73", fontWeight: 700, marginBottom: 8 }}>Ticket submitted</div>
          <div style={{ fontSize: 13, color: "#ccc" }}>
            ID: <code>{submitted.id}</code>
          </div>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 12 }}>
            Admin will review the payment and approve. Once approved you will receive an access key.
          </p>
        </div>
      )}
    </div>
  );
}
