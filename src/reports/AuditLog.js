import React, { useState, useEffect } from "react";
import { S, badge, formatPHP } from "../styles";
import { fetchVoidedSales, fetchCancelledSales } from "../api";
import { formatPHP as fmtPHP } from "../constants";

function AuditLog() {
  const [voidedSales, setVoidedSales] = useState([]);
  const [cancelledSales, setCancelledSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [voided, cancelled] = await Promise.all([
          fetchVoidedSales(),
          fetchCancelledSales(),
        ]);
        setVoidedSales(voided);
        setCancelledSales(cancelled);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div style={{ color: "#f1f5f9", textAlign: "center", paddingTop: 40 }}>Loading audit logs...</div>;
  }

  if (error) {
    return <div style={{ color: "#ef4444", textAlign: "center", paddingTop: 40 }}>Error: {error}</div>;
  }

  const allLogs = [
    ...voidedSales.map((v) => ({
      ...v,
      _type: "Post-Void",
      logId: `voided_${v.id}`,
    })),
    ...cancelledSales.map((c) => ({
      ...c,
      _type: "Cancel Sale",
      logId: `cancelled_${c.id}`,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  function getColor(type) {
    if (type === "Cancel Sale") return "#f59e0b";
    return "#ef4444"; // Post-Void
  }

  return (
    <div>
      <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
        AUDIT LOG
      </h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
        Complete record of voided and cancelled transactions.
      </p>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          {
            label: "Cancelled Sales",
            count: cancelledSales.length,
            color: "#f59e0b",
          },
          {
            label: "Post-Voids",
            count: voidedSales.length,
            color: "#ef4444",
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
            key={a.logId}
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
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={badge(color)}>{a._type.toUpperCase()}</span>
                  <span style={{ fontWeight: "bold", color: "#f59e0b", fontSize: 14 }}>
                    {a.receiptNo}
                  </span>
                </div>

                {a._type === "Cancel Sale" && (
                  <div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
                      Cashier: <strong style={{ color: "#f1f5f9" }}>{a.cashier}</strong> &bull;{" "}
                      {a.items ? a.items.length : 0} items
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
                      Items: {a.items && a.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                    </div>
                    {a.cancelReason && (
                      <div style={{ fontSize: 12, color: "#f59e0b", background: "#f59e0b10", padding: "6px 10px", borderRadius: 4 }}>
                        Reason: {a.cancelReason}
                      </div>
                    )}
                  </div>
                )}

                {a._type === "Post-Void" && (
                  <div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
                      Cashier: <strong style={{ color: "#f1f5f9" }}>{a.cashier}</strong> &bull;{" "}
                      {a.items ? a.items.length : 0} items
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
                      Items: {a.items && a.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                    </div>
                    <div style={{ fontSize: 12, color: "#ef4444", background: "#ef444410", padding: "6px 10px", borderRadius: 4, marginBottom: 6 }}>
                      Void Reason: {a.voidReason}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      Approved by: <strong style={{ color: "#f1f5f9" }}>{a.approvedBy}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 11, color: "#475569", textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                <div>{fmtPHP(a.total)}</div>
                <div style={{ fontSize: 10, marginTop: 6 }}>
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AuditLog;