import React from "react";
import { formatPHP } from "../constants";
import { S, btn } from "../styles";

function POSPage({
  cart,
  products,
  barcodeInput,
  setBarcodeInput,
  handleBarcodeSearch,
  addToCart,
  updateQty,
  initiateVoidItem,
  appliedDiscount,
  subtotal,
  discountAmount,
  total,
  cancelSale,
  reprintReceipt,
  lastReceipt,
  setShowDiscountModal,
  setShowPayModal,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 20,
        height: "calc(100vh - 48px)",
      }}
    >
      {/* LEFT: Product Search + Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Barcode input */}
        <div style={S.card}>
          <h2 style={{ margin: "0 0 12px", color: "#f59e0b", fontSize: 15, letterSpacing: 1 }}>
            SCAN / SEARCH PRODUCT
          </h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              style={{ ...S.input, flex: 1 }}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
              placeholder="Scan barcode then press Enter..."
            />
            <button style={btn()} onClick={handleBarcodeSearch}>
              ADD
            </button>
          </div>
          <input
            style={S.input}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name..."
          />
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
              gap: 10,
            }}
          >
            {products.map((p) => {
              const disabled = !p.active || p.stock <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !disabled && addToCart(p)}
                  style={{
                    background: "#1e293b",
                    border: "1px solid " + (disabled ? "#ef444433" : "#334155"),
                    borderRadius: 8,
                    padding: 14,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.45 : 1,
                  }}
                >
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                    {p.barcode}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#f1f5f9",
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 15 }}>
                    {formatPHP(p.price)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: p.stock > 5 ? "#10b981" : "#ef4444",
                      marginTop: 4,
                    }}
                  >
                    Stock: {p.stock}
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>
              No products found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart + Totals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Cart Items */}
        <div style={{ ...S.card, flex: 1, overflowY: "auto" }}>
          <h2 style={{ margin: "0 0 12px", color: "#f59e0b", fontSize: 15, letterSpacing: 1 }}>
            CART ({cart.length} {cart.length === 1 ? "item" : "items"})
          </h2>

          {cart.length === 0 && (
            <div
              style={{
                color: "#475569",
                textAlign: "center",
                padding: 40,
                fontSize: 13,
              }}
            >
              No items in cart.
              <br />
              Scan a barcode or click a product.
            </div>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid #334155",
                paddingBottom: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: "#f1f5f9",
                  marginBottom: 6,
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Qty controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    style={{ ...btn("#334155", "#f1f5f9"), padding: "2px 10px" }}
                    onClick={() => updateQty(item.id, -1)}
                  >
                    -
                  </button>
                  <span
                    style={{
                      minWidth: 24,
                      textAlign: "center",
                      fontSize: 14,
                      color: "#f1f5f9",
                    }}
                  >
                    {item.qty}
                  </span>
                  <button
                    style={{ ...btn("#334155", "#f1f5f9"), padding: "2px 10px" }}
                    onClick={() => updateQty(item.id, 1)}
                  >
                    +
                  </button>
                </div>

                <span
                  style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 14 }}
                >
                  {formatPHP(item.price * item.qty)}
                </span>

                <button
                  style={{
                    ...btn("#ef444420", "#ef4444"),
                    padding: "3px 10px",
                    fontSize: 11,
                  }}
                  onClick={() => initiateVoidItem(item)}
                >
                  VOID
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
                {formatPHP(item.price)} each
              </div>
            </div>
          ))}
        </div>

        {/* Summary + Actions */}
        <div style={S.card}>
          {/* Subtotal */}
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

          {/* Discount row */}
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
              <span>
                {appliedDiscount.label} ({(appliedDiscount.rate * 100).toFixed(0)}%)
              </span>
              <span>-{formatPHP(discountAmount)}</span>
            </div>
          )}

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: 24,
              color: "#f59e0b",
              margin: "10px 0 14px",
              borderTop: "1px solid #334155",
              paddingTop: 10,
            }}
          >
            <span>TOTAL</span>
            <span>{formatPHP(total)}</span>
          </div>

          {/* Discount + Cancel row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <button
              style={{ ...btn("#1e40af", "#93c5fd"), fontSize: 12 }}
              onClick={() => setShowDiscountModal(true)}
            >
              {appliedDiscount ? "CHANGE DISCOUNT" : "APPLY DISCOUNT"}
            </button>
            <button
              style={{ ...btn("#7f1d1d", "#fca5a5"), fontSize: 12 }}
              onClick={cancelSale}
            >
              CANCEL SALE
            </button>
          </div>

          {/* Pay Button */}
          <button
            style={{
              ...btn(cart.length > 0 ? "#f59e0b" : "#334155", cart.length > 0 ? "#0f172a" : "#475569"),
              width: "100%",
              fontSize: 17,
              padding: 14,
              letterSpacing: 2,
            }}
            onClick={() => cart.length > 0 && setShowPayModal(true)}
          >
            PAY NOW
          </button>

          {/* Reprint */}
          {lastReceipt && (
            <button
              style={{ ...S.outlineBtn, width: "100%", marginTop: 8, textAlign: "center" }}
              onClick={reprintReceipt}
            >
              REPRINT LAST RECEIPT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default POSPage;