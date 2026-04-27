import React from "react";
import { formatPHP } from "../constants";
import { S, btn, badge } from "../styles";

function TransactionsPage({ transactions, initiatePostVoid, currentUser }) {
  const sorted = transactions.slice().reverse();

  return (
    <div>
      <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
        TRANSACTION HISTORY
      </h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
        {transactions.length} total &bull;{" "}
        {transactions.filter((t) => t.voided).length} voided
      </p>

      {sorted.length === 0 && (
        <div
          style={{
            color: "#475569",
            textAlign: "center",
            padding: 60,
            border: "1px dashed #334155",
            borderRadius: 8,
          }}
        >
          No transactions recorded yet.
        </div>
      )}

      {sorted.map((t) => (
        <div
          key={t.id}
          style={{
            ...S.card,
            borderColor: t.voided ? "#ef444433" : "#334155",
            borderLeft: t.voided ? "4px solid #ef4444" : "4px solid #10b98144",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              {/* Receipt header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: "bold", color: "#f59e0b", fontSize: 15 }}>
                  {t.receiptNo}
                </span>
                {t.voided && (
                  <span style={badge("#ef4444")}>VOIDED</span>
                )}
                {t.discount && (
                  <span style={badge("#10b981")}>{t.discount.label}</span>
                )}
              </div>

              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                {t.time} &bull; Cashier: {t.cashier}
              </div>

              {/* Items */}
              <div
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  marginBottom: t.voided ? 6 : 0,
                }}
              >
                {t.items.map((i) => i.name + " x" + i.qty).join(", ")}
              </div>

              {/* Void info */}
              {t.voided && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#ef4444",
                    background: "#ef444410",
                    padding: "6px 10px",
                    borderRadius: 4,
                    marginTop: 6,
                  }}
                >
                  Reason: {t.voidReason} &bull; Approved by: {t.approvedBy}
                </div>
              )}
            </div>

            {/* Right: total + action */}
            <div style={{ textAlign: "right", marginLeft: 20, flexShrink: 0 }}>
              <div
                style={{
                  color: t.voided ? "#ef4444" : "#f59e0b",
                  fontWeight: "bold",
                  fontSize: 20,
                  textDecoration: t.voided ? "line-through" : "none",
                }}
              >
                {formatPHP(t.total)}
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>
                Cash: {formatPHP(t.cash)} &bull; Change: {formatPHP(t.change)}
              </div>
              {!t.voided && initiatePostVoid && (
                <button
                  style={{ ...btn("#7f1d1d", "#fca5a5"), fontSize: 11 }}
                  onClick={() => initiatePostVoid(t)}
                >
                  POST-VOID
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionsPage;