import React, { useState, useEffect } from "react";
import { formatPHP } from "../constants";
import { S, btn, badge } from "../styles";
import { 
  fetchProducts, createSale, addSaleItem, voidSaleItem, 
  applyDiscount, completeSale, cancelSale as cancelSaleApi,
  getSale 
} from "../api";

function POSPage() {
  const [products, setProducts] = useState([]);
  const [currentSale, setCurrentSale] = useState(null);
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [lastReceipt, setLastReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Initialize: load products and create a new sale
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [productsData, newSale] = await Promise.all([
          fetchProducts(),
          createSale(),
        ]);
        setProducts(productsData || []);
        setCurrentSale(newSale || null);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to initialize POS:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function notify(msg, type) {
    setNotification({ msg, type: type || "success" });
    setTimeout(() => setNotification(null), 2800);
  }

  async function handleAddToCart(product) {
    if (!currentSale) {
      notify("No active sale. Please refresh.", "error");
      return;
    }

    try {
      const result = await addSaleItem(currentSale.id, product.id, 1);
      // API returns { item, sale } structure
      const sale = result.sale || result;
      setCart(sale?.items || []);
      setCurrentSale(sale);
      notify(`${product.name} added to cart`, "success");
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to add item:", err);
    }
  }

  async function handleBarcodeSearch() {
    if (!barcodeInput.trim()) return;
    const product = products.find(p => p.barcode === barcodeInput && p.is_active);
    if (product) {
      await handleAddToCart(product);
      setBarcodeInput("");
    } else {
      notify("Product not found or inactive", "error");
    }
    setBarcodeInput("");
  }

  async function updateQty(itemId, delta) {
    if (!currentSale) return;

    try {
      const item = currentSale.items?.find(i => i.id === itemId);
      if (!item) return;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        // Remove item
        await voidSaleItem(currentSale.id, itemId);
      } else {
        // For now, remove and re-add with new quantity
        await voidSaleItem(currentSale.id, itemId);
        await addSaleItem(currentSale.id, item.product_id, newQty);
      }
      
      const updated = await getSale(currentSale.id);
      setCurrentSale(updated || currentSale);
      setCart(updated?.items || []);
      notify("Cart updated", "success");
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to update qty:", err);
    }
  }

  async function handleRemoveItem(itemId) {
    if (!currentSale) return;

    try {
      await voidSaleItem(currentSale.id, itemId);
      const updated = await getSale(currentSale.id);
      setCurrentSale(updated || currentSale);
      setCart(updated?.items || []);
      notify("Item removed from cart", "success");
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to remove item:", err);
    }
  }

  async function handleApplyDiscount(discountType) {
    if (!currentSale) return;

    try {
      const updated = await applyDiscount(currentSale.id, discountType);
      setCurrentSale(updated);
      setAppliedDiscount({
        type: discountType,
        label: discountType.replace(/_/g, " ").toUpperCase(),
      });
      setShowDiscountModal(false);
      notify("Discount applied", "success");
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to apply discount:", err);
    }
  }

  async function handleCancelSale() {
    if (!currentSale || cart.length === 0) {
      notify("No active sale to cancel", "error");
      return;
    }

    try {
      await cancelSaleApi(currentSale.id);
      // Create a new sale
      const newSale = await createSale();
      setCurrentSale(newSale);
      setCart([]);
      setAppliedDiscount(null);
      notify("Sale cancelled", "success");
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to cancel sale:", err);
    }
  }

  async function handleCompleteSale() {
    if (!currentSale || cart.length === 0) {
      notify("Cart is empty", "error");
      return;
    }

    const cash = parseFloat(cashReceived);
    if (isNaN(cash) || cash < currentSale.total) {
      notify("Insufficient payment", "error");
      return;
    }

    try {
      const completed = await completeSale(currentSale.id);
      setLastReceipt({
        ...completed,
        change: cash - completed.total,
        cash: cash,
      });
      setShowReceipt(true);
      setShowPayModal(false);
      setCashReceived("");
      
      // Create a new sale
      const newSale = await createSale();
      setCurrentSale(newSale);
      setCart([]);
      setAppliedDiscount(null);
      notify("Payment successful!", "success");
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to complete sale:", err);
    }
  }

  // Calculate totals
  const subtotal = currentSale ? currentSale.subtotal : 0;
  const discountAmount = currentSale ? currentSale.discount_amount : 0;
  const total = currentSale ? currentSale.total : 0;

  // Filter products based on search
  const filteredProducts = (products || []).filter(p => 
    p && p.is_active && (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
    )
  );

  if (loading) {
    return <div style={{ color: "#f1f5f9", textAlign: "center", paddingTop: 40 }}>Initializing POS...</div>;
  }

  if (error) {
    return <div style={{ color: "#ef4444", textAlign: "center", paddingTop: 40 }}>Error: {error}</div>;
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 20,
        height: "calc(100vh - 48px)",
      }}
    >
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
              autoFocus
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
            {filteredProducts.map((p) => {
              const disabled = !p.is_active || p.stock_quantity <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !disabled && handleAddToCart(p)}
                  style={{
                    background: "#1e293b",
                    border: "1px solid " + (disabled ? "#ef444433" : "#334155"),
                    borderRadius: 8,
                    padding: 14,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.45 : 1,
                    transition: "all 0.2s",
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
                      color: p.stock_quantity > 5 ? "#10b981" : p.stock_quantity > 0 ? "#f59e0b" : "#ef4444",
                      marginTop: 4,
                    }}
                  >
                    Stock: {p.stock_quantity}
                  </div>
                </div>
              );
            })}
          </div>

          {(filteredProducts && filteredProducts.length === 0) && (
            <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>
              No active products found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart + Totals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Cart Items */}
        <div style={{ ...S.card, flex: 1, overflowY: "auto" }}>
          <h2 style={{ margin: "0 0 12px", color: "#f59e0b", fontSize: 15, letterSpacing: 1 }}>
            CART ({(cart && cart.length) || 0} {(cart && cart.length) === 1 ? "item" : "items"})
          </h2>

          {(!cart || cart.length === 0) && (
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

          {cart && cart.map((item) => (
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
                {item.product?.name || "Unknown Product"}
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
                    style={{ ...btn("#334155", "#f1f5f9"), padding: "2px 10px", fontSize: 12 }}
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
                    {item.quantity}
                  </span>
                  <button
                    style={{ ...btn("#334155", "#f1f5f9"), padding: "2px 10px", fontSize: 12 }}
                    onClick={() => updateQty(item.id, 1)}
                  >
                    +
                  </button>
                </div>

                <span
                  style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 14 }}
                >
                  {formatPHP((item.unit_price || item.product?.price || 0) * (item.quantity || 1))}
                </span>

                <button
                  style={{
                    ...btn("#ef444420", "#ef4444"),
                    padding: "3px 10px",
                    fontSize: 11,
                  }}
                  onClick={() => handleRemoveItem(item.id)}
                >
                  VOID
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
                {formatPHP(item.unit_price || item.product?.price || 0)} each
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
              <span>{appliedDiscount.label}</span>
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
              onClick={handleCancelSale}
            >
              CANCEL SALE
            </button>
          </div>

          {/* Pay Button */}
          <button
            style={{
              ...btn((cart && cart.length > 0) ? "#f59e0b" : "#334155", (cart && cart.length > 0) ? "#0f172a" : "#475569"),
              width: "100%",
              fontSize: 17,
              padding: 14,
              letterSpacing: 2,
            }}
            onClick={() => (cart && cart.length > 0) && setShowPayModal(true)}
          >
            PAY NOW
          </button>

          {/* Reprint */}
          {lastReceipt && (
            <button
              style={{
                width: "100%",
                marginTop: 8,
                padding: 10,
                borderRadius: 4,
                border: "1px solid #f59e0b",
                background: "transparent",
                color: "#f59e0b",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: "bold",
              }}
              onClick={() => setShowReceipt(true)}
            >
              REPRINT LAST RECEIPT
            </button>
          )}
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
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
              SELECT DISCOUNT
            </h3>
            <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px" }}>
              Choose a discount type below.
            </p>

            {["none", "senior_citizen", "pwd", "athlete", "solo_parent"].map((type) => (
              <button
                key={type}
                style={{
                  width: "100%",
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 4,
                  border: "1px solid #334155",
                  background: appliedDiscount?.type === type ? "#f59e0b22" : "#0f172a",
                  color: appliedDiscount?.type === type ? "#f59e0b" : "#f1f5f9",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: "bold",
                }}
                onClick={() => handleApplyDiscount(type)}
              >
                {type === "none" ? "No Discount" : type.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}

            <button
              style={{
                width: "100%",
                marginTop: 12,
                ...btn("#334155", "#94a3b8")
              }}
              onClick={() => setShowDiscountModal(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
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
              PAYMENT
            </h3>
            <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px" }}>
              Amount Due: <strong style={{ color: "#f59e0b" }}>{formatPHP(total)}</strong>
            </p>

            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginBottom: 6, display: "block" }}>
              CASH RECEIVED
            </label>
            <input
              style={{ ...S.input, marginBottom: 20 }}
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Enter amount..."
              autoFocus
            />

            {cashReceived && (
              <div style={{
                padding: 12,
                background: "#10b98110",
                borderRadius: 4,
                marginBottom: 20,
                fontSize: 13,
              }}>
                <div style={{ color: "#64748b", marginBottom: 4 }}>Change: <strong style={{ color: "#10b981" }}>{formatPHP(Math.max(0, parseFloat(cashReceived) - total))}</strong></div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ ...btn("#f59e0b", "#0f172a"), flex: 1 }}
                onClick={handleCompleteSale}
              >
                CONFIRM PAYMENT
              </button>
              <button
                style={{ ...btn("#334155", "#94a3b8"), flex: 1 }}
                onClick={() => {
                  setShowPayModal(false);
                  setCashReceived("");
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastReceipt && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "#00000080",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}>
          <div style={{ ...S.card, maxWidth: 350, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ textAlign: "center", color: "#f59e0b", margin: "0 0 20px", fontSize: 14, letterSpacing: 2 }}>
              SariPh Retail Store
            </h3>
            
            <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginBottom: 20, borderBottom: "1px solid #334155", paddingBottom: 14 }}>
              Majayjay, Laguna
            </div>

            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Receipt No.:</span>
                <strong style={{ color: "#f1f5f9" }}>OR-{String(lastReceipt.id).padStart(6, "0")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Cashier:</span>
                <strong style={{ color: "#f1f5f9" }}>{lastReceipt.cashier?.name || "Unknown"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Date:</span>
                <strong style={{ color: "#f1f5f9" }}>{new Date(lastReceipt.created_at).toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #334155", borderBottom: "1px solid #334155", paddingY: 12, marginBottom: 20 }}>
              {lastReceipt.items && lastReceipt.items.map((item) => (
                <div key={item.id} style={{ fontSize: 12, marginBottom: 8 }}>
                  <div style={{ color: "#f1f5f9", fontWeight: "bold" }}>
                    {item.product?.name || "Unknown"} x {item.quantity || 1}
                  </div>
                  <div style={{ color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                    <span>{formatPHP(item.unit_price || item.product?.price || 0)} each</span>
                    <span>{formatPHP(item.subtotal || ((item.unit_price || item.product?.price || 0) * (item.quantity || 1)))}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: 4 }}>
                <span>Subtotal:</span>
                <span>{formatPHP(lastReceipt.subtotal || 0)}</span>
              </div>
              {(lastReceipt.discount_amount || 0) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", marginBottom: 4 }}>
                  <span>Discount:</span>
                  <span>-{formatPHP(lastReceipt.discount_amount || 0)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#f59e0b", fontSize: 15, marginBottom: 12 }}>
                <span>TOTAL:</span>
                <span>{formatPHP(lastReceipt.total || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: 4 }}>
                <span>Cash:</span>
                <span>{formatPHP(lastReceipt.cash || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", fontWeight: "bold" }}>
                <span>Change:</span>
                <span>{formatPHP(lastReceipt.change || 0)}</span>
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 11, color: "#475569", marginBottom: 12 }}>
              Thank you for your purchase!
            </div>

            <button
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 4,
                background: "#f59e0b",
                color: "#0f172a",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 13,
              }}
              onClick={() => {
                window.print();
                setShowReceipt(false);
              }}
            >
              PRINT & CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default POSPage;