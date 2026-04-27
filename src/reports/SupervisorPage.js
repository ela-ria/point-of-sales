import React, { useState } from "react";
import { formatPHP } from "../constants";
import { S, btn, badge } from "../styles";

function SupervisorPage({ transactions, initiatePostVoid, voidLog, cancelLog }) {
  const [tab, setTab] = useState("active");

  const active = transactions.filter((t) => !t.voided);
  const voided = transactions.filter((t) => t.voided);

  const tabs = [
    { id: "active", label: "Active Transactions", count: active.length },
    { id: "voided", label: "Voided Sales", count: voided.length },
    { id: "cancels", label: "Cancel Log", count: cancelLog.length },
  ];

  return (
    <div>
      <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
        SUPERVISOR PANEL
      </h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
        Review transactions, approve post-voids, and monitor cancellations.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={{
              ...btn(tab === t.id ? "#f59e0b" : "#1e293b", tab === t.id ? "#0f172a" : "#94a3b8"),
              border: "1px solid " + (tab === t.id ? "#f59e0b" : "#334155"),
              fontSize: 12,
              letterSpacing: 1,
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label.toUpperCase()} ({t.count})
          </button>
        ))}
      </div>

      {/* Active Transactions */}
      {tab === "active" && (
        <div>
          {active.length === 0 && (
            <div style={{ color: "#475569", padding: 40, textAlign: "center", border: "1px dashed #334155", borderRadius: 8 }}>
              No active transactions.
            </div>
          )}
          {active.map((t) => (
            <div key={t.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#f59e0b", fontSize: 15, marginBottom: 4 }}>
                    {t.receiptNo}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {t.time} &bull; Cashier: {t.cashier}
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                    {t.items.map((i) => i.name + " x" + i.qty).join(", ")}
                  </div>
                  {t.discount && (
                    <div style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
                      Discount: {t.discount.label} (-{formatPHP(t.discountAmount)})
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 22, marginBottom: 8 }}>
                    {formatPHP(t.total)}
                  </div>
                  <button
                    style={btn("#ef4444", "#fff")}
                    onClick={() => initiatePostVoid(t)}
                  >
                    REQUEST POST-VOID
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voided Transactions */}
      {tab === "voided" && (
        <div>
          {voided.length === 0 && (
            <div style={{ color: "#475569", padding: 40, textAlign: "center", border: "1px dashed #334155", borderRadius: 8 }}>
              No voided transactions.
            </div>
          )}
          {voided.map((t) => (
            <div
              key={t.id}
              style={{ ...S.card, borderColor: "#ef444433", borderLeft: "4px solid #ef4444" }}
            >
              <div style={{ fontWeight: "bold", color: "#ef4444", fontSize: 14, marginBottom: 4 }}>
                {t.receiptNo} — VOIDED
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                Original: {t.time} &bull; Cashier: {t.cashier}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
                {t.items.map((i) => i.name + " x" + i.qty).join(", ")}
              </div>
              <div
                style={{
                  background: "#ef444410",
                  border: "1px solid #ef444433",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#ef4444",
                }}
              >
                Reason: {t.voidReason} &bull; Approved by: <strong>{t.approvedBy}</strong>
              </div>
              <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: "bold", marginTop: 8, textDecoration: "line-through" }}>
                {formatPHP(t.total)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Log */}
      {tab === "cancels" && (
        <div>
          {cancelLog.length === 0 && (
            <div style={{ color: "#475569", padding: 40, textAlign: "center", border: "1px dashed #334155", borderRadius: 8 }}>
              No cancel records found.
            </div>
          )}
          {cancelLog
            .slice()
            .reverse()
            .map((c) => (
              <div key={c.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#f59e0b", marginBottom: 4 }}>
                      Cancelled Sale
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {c.time} &bull; Cashier: {c.cashier}
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                      {c.items.map((i) => i.name + " x" + i.qty).join(", ")}
                    </div>
                    {c.discount && (
                      <div style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
                        Had discount: {c.discount.label}
                      </div>
                    )}
                  </div>
                  <span style={badge("#f59e0b")}>{c.items.length} items</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default SupervisorPage;