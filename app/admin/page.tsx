"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function login() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-code": code },
      });
      if (!res.ok) {
        setMsg("Wrong code");
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setTickets(data);
      setAuthed(true);
      sessionStorage.setItem("admin_code", code);
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    const c = sessionStorage.getItem("admin_code") || code;
    const res = await fetch("/api/admin", { headers: { "x-admin-code": c } });
    if (res.ok) setTickets(await res.json());
  }

  async function act(ticketId: string, action: "approve" | "reject") {
    const c = sessionStorage.getItem("admin_code") || code;
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": c,
        },
        body: JSON.stringify({ ticketId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed");
        return;
      }
      if (action === "approve" && data.accessKey) {
        alert(`Approved!\nAccess Key: ${data.accessKey.key}\nGive this to the user.`);
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_code");
    if (saved) {
      setCode(saved);
      fetch("/api/admin", { headers: { "x-admin-code": saved } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            setTickets(d);
            setAuthed(true);
          }
        });
    }
  }, []);

  if (!authed) {
    return (
      <div style={{ maxWidth: 360, margin: "80px auto", padding: 16 }}>
        <h1 style={{ fontSize: 20 }}>Admin Login</h1>
        <div className="field" style={{ marginTop: 20 }}>
          <label>Access Code</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>
        {msg && <p style={{ color: "#f55", fontSize: 13 }}>{msg}</p>}
        <button
          className="btn"
          onClick={login}
          disabled={loading}
          style={{ width: "100%", background: "#333", color: "#fff" }}
        >
          {loading ? "..." : "Login"}
        </button>
        <div style={{ marginTop: 16 }}>
          <Link href="/" style={{ color: "#666", fontSize: 13 }}>← Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Admin Panel</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={refresh} style={{ background: "none", border: "none", color: "#888", fontSize: 13 }}>
            Refresh
          </button>
          <Link href="/" style={{ color: "#666", fontSize: 13 }}>Home</Link>
        </div>
      </div>

      <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
        {tickets.length} tickets · Approve to generate access key
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        {tickets.length === 0 && (
          <div className="card" style={{ color: "#666" }}>No tickets yet</div>
        )}
        {tickets.map((t) => (
          <div key={t.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    t.status === "approved"
                      ? "#1DBF73"
                      : t.status === "rejected"
                      ? "#f55"
                      : "#f0b90b",
                }}
              >
                {t.status.toUpperCase()}
              </span>
              <span style={{ fontSize: 11, color: "#666" }}>
                {new Date(t.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <div>
                <strong>{t.network}</strong> · ${t.amount} ·{" "}
                {t.plan === "days" ? `${t.quantity} days` : `${t.quantity} receipts`}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", color: "#aaa" }}>
                {t.txHash}
              </div>
              {t.email && <div style={{ color: "#888" }}>Email: {t.email}</div>}
              {t.accessKey && (
                <div style={{ marginTop: 6, color: "#1DBF73", fontFamily: "monospace" }}>
                  Key: {t.accessKey}
                </div>
              )}
            </div>
            {t.status === "pending" && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  className="btn"
                  disabled={loading}
                  onClick={() => act(t.id, "approve")}
                  style={{ background: "#1DBF73", color: "#fff", flex: 1 }}
                >
                  Approve
                </button>
                <button
                  className="btn"
                  disabled={loading}
                  onClick={() => act(t.id, "reject")}
                  style={{ background: "#333", color: "#fff", flex: 1 }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
