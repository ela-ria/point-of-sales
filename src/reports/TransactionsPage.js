import React, { useState, useEffect } from "react";
import { formatPHP } from "../constants";
import { S, btn, badge } from "../styles";
import { fetchSales, fetchVoidedSales, postVoidSale } from "../api";

function TransactionsPage({ currentUser }) {
  const [completedSales, setCompletedSales] = useState([]);
  const [voidedSales, setVoidedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showPostVoidModal, setShowPostVoidModal] = useState(false);
  const [postVoidTarget, setPostVoidTarget] = useState(null);
  const [postVoidReason, setPostVoidReason] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [completed, voided] = await Promise.all([
          fetchSales(),
          fetchVoidedSales(),
        ]);
        setCompletedSales(completed);
        setVoidedSales(voided);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function notify(msg, type) {
    setNotification({ msg, type: type || "success" });
    setTimeout(() => setNotification(null), 2800);
  }

  function initiatePostVoid(sale) {
    setPostVoidTarget(sale);
    setPostVoidReason("");
    setShowPostVoidModal(true);
  }

  async function confirmPostVoid() {
    if (!postVoidReason.trim()) {
      notify("Please provide a reason for post-void", "error");
      return;
    }

    try {
      await postVoidSale(postVoidTarget.id, postVoidReason);
      // Remove from completed, add to voided
      setCompletedSales(completedSales.filter(s => s.id !== postVoidTarget.id));
      setVoidedSales([
        { ...postVoidTarget, voided: true, voidReason: postVoidReason },
        ...voidedSales
      ]);
      setShowPostVoidModal(false);
      setPostVoidTarget(null);
      setPostVoidReason("");
      notify("Sale post-voided successfully", "success");
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to post-void:", err);
    }
  }

  if (loading) {
    return <div style={{ color: "#f1f5f9", textAlign: "center", paddingTop: 40 }}>Loading transactions...</div>;
  }

  if (error) {
    return <div style={{ color: "#ef4444", textAlign: "center", paddingTop: 40 }}>Error: {error}</div>;
  }

  const allTransactions = [...completedSales, ...voidedSales]
    // Filter by cashier if current user is a cashier
    .filter(t => {
      if (currentUser.role === "cashier") {
        // Compare by cashier ID (from cashier_id field or cashier.id in relationship)
        return (t.cashier_id === currentUser.id) || (t.cashier?.id === currentUser.id);
      }
      return true; // Show all for supervisor/admin
    })
    .sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

  return (
    <div>
      {notification && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          padding: "12px 20px",
          borderRadius: 4,
          background: notification.type === "error" ? "#ef4444" : "#10b981",
          color: "#fff",
          zIndex: 1000,
          fontSize: 13,
        }}>
          {notification.msg}
        </div>
      )}

      <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
        {currentUser?.role === "cashier" ? "MY TRANSACTION HISTORY" : "TRANSACTION HISTORY"}
      </h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
        {allTransactions.filter(t => t.status === "completed").length} completed &bull; {allTransactions.filter(t => t.status === "voided" || t.voided).length} voided
        {currentUser?.role === "cashier" && ` (Your transactions only)`}
      </p>

      {allTransactions.length === 0 && (
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

      {allTransactions.map((t) => (
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
              </div>

              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                {new Date(t.created_at).toLocaleString()} &bull; Cashier: {t.cashier?.name || "Unknown"}
              </div>

              {/* Items */}
              <div
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  marginBottom: t.voided ? 6 : 0,
                }}
              >
                {t.items && t.items.map((i) => `${i.product?.name || i.name || "Unknown"} x${i.quantity}`).join(", ")}
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
              {!t.voided && currentUser && (currentUser.role === "supervisor" || currentUser.role === "admin") && (
                <button
                  style={{ ...btn("#7f1d1d", "#fca5a5"), fontSize: 11, marginTop: 8 }}
                  onClick={() => initiatePostVoid(t)}
                >
                  POST-VOID
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Post-Void Modal */}
      {showPostVoidModal && postVoidTarget && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "#00000080",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}>
          <div style={{ ...S.card, maxWidth: 400, padding: 24 }}>
            <h3 style={{ color: "#f59e0b", margin: "0 0 4px", fontSize: 16 }}>
              POST-VOID SALE
            </h3>
            <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px" }}>
              {postVoidTarget.receiptNo} - {formatPHP(postVoidTarget.total)}
            </p>

            <label style={{ ...{ color: "#94a3b8", fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginBottom: 6, display: "block" } }}>
              REASON FOR VOID
            </label>
            <textarea
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 4,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#f1f5f9",
                fontFamily: "monospace",
                fontSize: 13,
                marginBottom: 20,
                boxSizing: "border-box",
                minHeight: 80,
              }}
              value={postVoidReason}
              onChange={(e) => setPostVoidReason(e.target.value)}
              placeholder="Enter reason for post-void..."
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ ...btn("#ef4444", "#fca5a5"), flex: 1 }}
                onClick={confirmPostVoid}
              >
                CONFIRM VOID
              </button>
              <button
                style={{ ...btn("#334155", "#94a3b8"), flex: 1 }}
                onClick={() => {
                  setShowPostVoidModal(false);
                  setPostVoidTarget(null);
                  setPostVoidReason("");
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;