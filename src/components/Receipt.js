import React from "react";
import { formatPHP } from "../constants";
import { S, btn } from "../styles";

function Receipt({ txn, onClose, onReprint }) {
  const lineStyle = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 2,
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...S.modal,
          width: 320,
          fontFamily: "'Courier New', monospace",
        }}
      >
        {/* Reprint Banner */}
        {txn.reprinted && (
          <div
            style={{
              background: "#ef444420",
              color: "#ef4444",
              fontWeight: "bold",
              textAlign: "center",
              padding: "4px 0",
              marginBottom: 10,
              borderRadius: 4,
              fontSize: 13,
              border: "1px dashed #ef4444",
            }}
          >
            *** REPRINT ***
          </div>
        )}

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            borderBottom: "1px dashed #475569",
            paddingBottom: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: 17, color: "#f59e0b" }}>
            SARIPH RETAIL STORE
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            Katapatan Mutual, Cabuyao, Laguna
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
            OR No: {txn.receiptNo}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{txn.time}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            Cashier: {txn.cashier}
          </div>
        </div>

        {/* Items */}
        {txn.items.map((item, idx) => (
          <div key={idx} style={lineStyle}>
            <span style={{ color: "#d1d5db" }}>
              {item.name} x{item.qty}
            </span>
            <span style={{ color: "#f1f5f9" }}>
              {formatPHP(item.price * item.qty)}
            </span>
          </div>
        ))}

        {/* Totals */}
        <div
          style={{
            borderTop: "1px dashed #475569",
            marginTop: 10,
            paddingTop: 10,
          }}
        >
          <div style={lineStyle}>
            <span style={{ color: "#94a3b8" }}>Subtotal</span>
            <span style={{ color: "#f1f5f9" }}>{formatPHP(txn.subtotal)}</span>
          </div>

          {txn.discount && (
            <div style={lineStyle}>
              <span style={{ color: "#10b981" }}>
                Discount ({txn.discount.label})
              </span>
              <span style={{ color: "#10b981" }}>
                -{formatPHP(txn.discountAmount)}
              </span>
            </div>
          )}

          <div
            style={{
              ...lineStyle,
              fontWeight: "bold",
              color: "#f59e0b",
              fontSize: 17,
              marginTop: 6,
            }}
          >
            <span>TOTAL</span>
            <span>{formatPHP(txn.total)}</span>
          </div>

          <div style={lineStyle}>
            <span style={{ color: "#94a3b8" }}>Cash</span>
            <span style={{ color: "#f1f5f9" }}>{formatPHP(txn.cash)}</span>
          </div>
          <div style={lineStyle}>
            <span style={{ color: "#94a3b8" }}>Change</span>
            <span style={{ color: "#10b981", fontWeight: "bold" }}>
              {formatPHP(txn.change)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 11,
            color: "#64748b",
            borderTop: "1px dashed #475569",
            paddingTop: 10,
          }}
        >
          Thank you for shopping at SariPh!
        </div>

        {/* Voided stamp */}
        {txn.voided && (
          <div
            style={{
              textAlign: "center",
              color: "#ef4444",
              fontWeight: "bold",
              marginTop: 10,
              fontSize: 16,
              border: "2px solid #ef4444",
              borderRadius: 6,
              padding: "4px 0",
            }}
          >
            *** VOIDED ***
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            style={{ ...btn(), flex: 1 }}
            onClick={onReprint}
          >
            REPRINT
          </button>
          <button
            style={{ ...btn("#334155", "#f1f5f9"), flex: 1 }}
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

export default Receipt;