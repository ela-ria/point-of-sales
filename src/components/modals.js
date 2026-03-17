import React from "react";
import { DISCOUNTS, formatPHP } from "./constants";
import { S, btn } from "./styles";

/* ─── Discount Modal ─── */
export function DiscountModal({ appliedDiscount, onApply, onRemove, onClose }) {
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <h3 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 17 }}>APPLY DISCOUNT</h3>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
          Select an eligible discount type. Only one discount per sale.
        </p>

        {DISCOUNTS.map((d) => {
          const isSelected = appliedDiscount && appliedDiscount.id === d.id;
          return (
            <div
              key={d.id}
              onClick={() => onApply(d)}
              style={{
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid " + (isSelected ? "#f59e0b" : "#334155"),
                marginBottom: 10,
                cursor: "pointer",
                background: isSelected ? "#f59e0b15" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", color: isSelected ? "#f59e0b" : "#f1f5f9" }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {(d.rate * 100).toFixed(0)}% discount on subtotal
                </div>
              </div>
              {isSelected && (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#0f172a",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {appliedDiscount && (
            <button style={{ ...btn("#7f1d1d", "#fca5a5"), flex: 1 }} onClick={onRemove}>
              REMOVE DISCOUNT
            </button>
          )}
          <button style={{ ...btn("#334155", "#94a3b8"), flex: 1 }} onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Void Item Modal ─── */
export function VoidItemModal({ item, onConfirm, onClose }) {
  if (!item) return null;
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <h3 style={{ color: "#ef4444", margin: "0 0 12px", fontSize: 17 }}>VOID ITEM</h3>
        <p style={{ color: "#94a3b8", marginBottom: 6 }}>
          You are about to remove:
        </p>
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #ef444444",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <div style={{ color: "#f1f5f9", fontWeight: "bold" }}>{item.name}</div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>
            {formatPHP(item.price)} x {item.qty} = {formatPHP(item.price * item.qty)}
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
          This action will be logged in the audit trail and cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btn("#ef4444", "#fff"), flex: 1 }} onClick={onConfirm}>
            CONFIRM VOID
          </button>
          <button style={{ ...btn("#334155", "#94a3b8"), flex: 1 }} onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Payment Modal ─── */
export function PaymentModal({
  total,
  subtotal,
  discountAmount,
  appliedDiscount,
  cashReceived,
  setCashReceived,
  onConfirm,
  onClose,
}) {
  const cash = parseFloat(cashReceived);
  const change = !isNaN(cash) && cash >= total ? cash - total : null;

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <h3 style={{ color: "#f59e0b", margin: "0 0 20px", fontSize: 17 }}>
          PROCESS PAYMENT
        </h3>

        {/* Summary */}
        <div
          style={{
            background: "#0f172a",
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "#94a3b8",
              marginBottom: 4,
            }}
          >
            <span>Subtotal</span>
            <span>{formatPHP(subtotal)}</span>
          </div>
          {appliedDiscount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "#10b981",
                marginBottom: 4,
              }}
            >
              <span>Discount ({appliedDiscount.label})</span>
              <span>-{formatPHP(discountAmount)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              color: "#f59e0b",
              fontSize: 22,
              borderTop: "1px solid #334155",
              paddingTop: 10,
              marginTop: 6,
            }}
          >
            <span>TOTAL DUE</span>
            <span>{formatPHP(total)}</span>
          </div>
        </div>

        <label style={{ ...S.label, letterSpacing: 1 }}>CASH RECEIVED (₱)</label>
        <input
          style={{
            ...S.input,
            fontSize: 28,
            textAlign: "right",
            marginBottom: 12,
            color: "#f59e0b",
            fontWeight: "bold",
          }}
          type="number"
          value={cashReceived}
          onChange={(e) => setCashReceived(e.target.value)}
          placeholder="0.00"
          autoFocus
        />

        {/* Change display */}
        {change !== null ? (
          <div
            style={{
              background: "#10b98115",
              border: "1px solid #10b98144",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#10b981", fontWeight: "bold" }}>CHANGE</span>
            <span style={{ color: "#10b981", fontWeight: "bold", fontSize: 24 }}>
              {formatPHP(change)}
            </span>
          </div>
        ) : (
          cashReceived && (
            <div
              style={{
                background: "#ef444415",
                border: "1px solid #ef444444",
                borderRadius: 8,
                padding: "10px 16px",
                marginBottom: 16,
                color: "#ef4444",
                fontSize: 13,
              }}
            >
              Insufficient cash. Need {formatPHP(total - (isNaN(cash) ? 0 : cash))} more.
            </div>
          )
        )}

        {/* Quick amount buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[20, 50, 100, 200, 500, 1000].map((amt) => (
            <button
              key={amt}
              style={{
                ...btn("#334155", "#94a3b8"),
                fontSize: 12,
                padding: "6px 12px",
              }}
              onClick={() => setCashReceived(String(amt))}
            >
              ₱{amt}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              ...btn(change !== null ? "#f59e0b" : "#334155", change !== null ? "#0f172a" : "#475569"),
              flex: 1,
              fontSize: 15,
              padding: 12,
            }}
            onClick={onConfirm}
          >
            CONFIRM PAYMENT
          </button>
          <button style={btn("#334155", "#94a3b8")} onClick={onClose}>
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Post Void Modal ─── */
export function PostVoidModal({
  target,
  superUsername,
  setSuperUsername,
  superPassword,
  setSuperPassword,
  postVoidReason,
  setPostVoidReason,
  superError,
  onConfirm,
  onClose,
}) {
  if (!target) return null;
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <h3 style={{ color: "#ef4444", margin: "0 0 6px", fontSize: 17 }}>
          POST-VOID SALE
        </h3>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px" }}>
          This action requires supervisor approval. Inventory will be restored.
        </p>

        {/* Target receipt info */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <div style={{ color: "#f59e0b", fontWeight: "bold" }}>{target.receiptNo}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {target.time} &bull; {target.cashier}
          </div>
          <div style={{ fontSize: 13, color: "#f1f5f9", marginTop: 6, fontWeight: "bold" }}>
            {formatPHP(target.total)}
          </div>
        </div>

        <label style={S.label}>SUPERVISOR USERNAME</label>
        <input
          style={{ ...S.input, marginBottom: 12 }}
          value={superUsername}
          onChange={(e) => setSuperUsername(e.target.value)}
          placeholder="Enter supervisor username"
        />

        <label style={S.label}>SUPERVISOR PASSWORD</label>
        <input
          style={{ ...S.input, marginBottom: 12 }}
          type="password"
          value={superPassword}
          onChange={(e) => setSuperPassword(e.target.value)}
          placeholder="Enter supervisor password"
        />

        <label style={S.label}>REASON FOR VOID</label>
        <textarea
          style={{ ...S.input, marginBottom: 16, height: 80, resize: "none" }}
          value={postVoidReason}
          onChange={(e) => setPostVoidReason(e.target.value)}
          placeholder="Explain why this sale is being voided..."
        />

        {superError && (
          <div
            style={{
              background: "#ef444415",
              border: "1px solid #ef444444",
              color: "#ef4444",
              padding: "10px 14px",
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {superError}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btn("#ef4444", "#fff"), flex: 1 }} onClick={onConfirm}>
            APPROVE & VOID
          </button>
          <button style={{ ...btn("#334155", "#94a3b8"), flex: 1 }} onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}