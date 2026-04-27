import React from "react";
import { S, badge } from "../styles";

function AuditLog({ voidLog, cancelLog }) {
  const allLogs = [
    ...voidLog.map((v) => ({
      ...v,
      _type:
        v.type === "post_void"
          ? "Post-Void"
          : v.type === "reprint"
          ? "Reprint"
          : "Item Void",
    })),
    ...cancelLog.map((c) => ({
      ...c,
      _type: "Cancel Sale",
    })),
  ].sort((a, b) => b.id - a.id);

  function getColor(type) {
    if (type === "Cancel Sale") return "#f59e0b";
    if (type === "Item Void")   return "#3b82f6";
    if (type === "Reprint")     return "#a855f7";
    return "#ef4444";
  }

  return (
    <div>
      <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
        AUDIT LOG
      </h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
        Complete record of cancellations, item voids, post-void approvals, and reprints.
      </p>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          {
            label: "Cancel Sales",
            count: cancelLog.length,
            color: "#f59e0b",
          },
          {
            label: "Item Voids",
            count: voidLog.filter((v) => v.type === "void_item").length,
            color: "#3b82f6",
          },
          {
            label: "Post-Voids",
            count: voidLog.filter((v) => v.type === "post_void").length,
            color: "#ef4444",
          },
          {
            label: "Reprints",
            count: voidLog.filter((v) => v.type === "reprint").length,
            color: "#a855f7",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.color + "15",
              border: "1px solid " + s.color + "44",
              borderRadius: 8,
              padding: "12px 20px",
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: s.color }}>
              {s.count}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {allLogs.length === 0 && (
        <div
          style={{
            color: "#475569",
            textAlign: "center",
            padding: 60,
            border: "1px dashed #334155",
            borderRadius: 8,
          }}
        >
          No audit records yet. Cancellations and voids will appear here.
        </div>
      )}

      {allLogs.map((a) => {
        const color = getColor(a._type);
        return (
          <div
            key={a.id + "_" + a._type}
            style={{
              ...S.card,
              borderLeft: "4px solid " + color,
              padding: "14px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={badge(color)}>{a._type.toUpperCase()}</span>
                </div>

                {a._type === "Cancel Sale" && (
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Cashier: <strong style={{ color: "#f1f5f9" }}>{a.cashier}</strong> &bull;{" "}
                    {a.items ? a.items.length : 0} items in cart
                    {a.discount && (
                      <span style={{ color: "#10b981" }}>
                        {" "}
                        &bull; Had discount: {a.discount.label}
                      </span>
                    )}
                  </div>
                )}

                {a._type === "Item Void" && (
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Cashier: <strong style={{ color: "#f1f5f9" }}>{a.cashier}</strong> &bull;
                    Item removed:{" "}
                    <strong style={{ color: "#3b82f6" }}>
                      {a.item ? a.item.name : "Unknown"}
                    </strong>
                  </div>
                )}

                {a._type === "Post-Void" && (
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Receipt:{" "}
                    <strong style={{ color: "#f59e0b" }}>{a.receiptNo}</strong> &bull;
                    Cashier: {a.cashier}
                    <br />
                    Reason:{" "}
                    <span style={{ color: "#f1f5f9" }}>{a.reason}</span> &bull; Approved by:{" "}
                    <strong style={{ color: "#ef4444" }}>{a.approvedBy}</strong>
                  </div>
                )}

                {a._type === "Reprint" && (
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Cashier: <strong style={{ color: "#f1f5f9" }}>{a.cashier}</strong> &bull;
                    Receipt: <strong style={{ color: "#a855f7" }}>{a.receiptNo}</strong>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 11, color: "#475569", textAlign: "right", flexShrink: 0 }}>
                {a.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AuditLog;