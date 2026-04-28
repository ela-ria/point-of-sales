import React, { useState, useEffect } from "react";
import { CATEGORIES, formatPHP } from "../constants";
import { S, btn, badge } from "../styles";
import { fetchProducts, createProduct, updateProduct, deactivateProduct } from "../api";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: "", barcode: "", price: "", stock_quantity: "", category: "Groceries" });
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function notify(msg, type) {
    setNotification({ msg, type: type || "success" });
    setTimeout(() => setNotification(null), 2800);
  }

  function handleEdit(p) {
    setEditProduct(p);
    setProductForm({
      name: p.name,
      barcode: p.barcode,
      price: p.price,
      stock_quantity: p.stock_quantity,
      category: p.category,
    });
  }

  function handleCancelEdit() {
    setEditProduct(null);
    setProductForm({ name: "", barcode: "", price: "", stock_quantity: "", category: "Groceries" });
  }

  function handleChange(field, value) {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveProduct() {
    try {
      if (!productForm.name || !productForm.barcode || !productForm.price || productForm.stock_quantity === "") {
        notify("Please fill all fields", "error");
        return;
      }

      const payload = {
        name: productForm.name,
        barcode: productForm.barcode,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity),
        category: productForm.category,
        is_active: true, // New products are active by default
      };

      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        setProducts(products.map(p => p.id === editProduct.id ? { ...editProduct, ...payload } : p));
        notify("Product updated successfully", "success");
      } else {
        const newProduct = await createProduct(payload);
        setProducts([...products, newProduct]);
        notify("Product created successfully", "success");
      }

      handleCancelEdit();
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to save product:", err);
    }
  }

  async function toggleProductActive(id) {
    try {
      const product = products.find(p => p.id === id);
      if (product.is_active) {
        // Deactivate
        await deactivateProduct(id);
        setProducts(products.map(p => p.id === id ? { ...p, is_active: false } : p));
        notify("Product deactivated successfully", "success");
      } else {
        // Activate - use update endpoint to set is_active to true
        await updateProduct(id, { is_active: true });
        setProducts(products.map(p => p.id === id ? { ...p, is_active: true } : p));
        notify("Product activated successfully", "success");
      }
    } catch (err) {
      notify(err.message, "error");
      console.error("Failed to toggle product status:", err);
    }
  }

  if (loading) {
    return <div style={{ color: "#f1f5f9", textAlign: "center", paddingTop: 40 }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ color: "#ef4444", textAlign: "center", paddingTop: 40 }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
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

      {/* Product Table */}
      <div>
        <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
          PRODUCT MANAGEMENT
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
          {products.length} total products &bull;{" "}
          {products.filter((p) => p.is_active).length} active
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #334155" }}>
                {["Barcode", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        color: "#64748b",
                        fontWeight: "normal",
                        letterSpacing: 1,
                        fontSize: 11,
                      }}
                    >
                      {h.toUpperCase()}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid #1e293b",
                    background:
                      editProduct && editProduct.id === p.id ? "#f59e0b08" : "transparent",
                    opacity: p.is_active ? 1 : 0.6,
                  }}
                >
                  <td style={{ padding: "10px 10px", color: "#64748b", fontFamily: "monospace" }}>
                    {p.barcode}
                  </td>
                  <td style={{ padding: "10px 10px", color: "#f1f5f9", fontWeight: "bold" }}>
                    {p.name}
                  </td>
                  <td style={{ padding: "10px 10px", color: "#94a3b8" }}>{p.category}</td>
                  <td style={{ padding: "10px 10px", color: "#f59e0b", fontWeight: "bold" }}>
                    {formatPHP(p.price)}
                  </td>
                  <td
                    style={{
                      padding: "10px 10px",
                      color: p.stock_quantity <= 5 ? "#ef4444" : "#10b981",
                      fontWeight: "bold",
                    }}
                  >
                    {p.stock_quantity}
                  </td>
                  <td style={{ padding: "10px 10px" }}>
                    <span style={badge(p.is_active ? "#10b981" : "#ef4444")}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 10px" }}>
                    <button
                      style={{ ...btn("#334155", "#f1f5f9"), marginRight: 6, fontSize: 11 }}
                      onClick={() => handleEdit(p)}
                    >
                      EDIT
                    </button>
                    <button
                      style={btn(
                        p.is_active ? "#7f1d1d" : "#14532d",
                        p.is_active ? "#fca5a5" : "#86efac"
                      )}
                      onClick={() => toggleProductActive(p.id)}
                    >
                      {p.is_active ? "DEACTIVATE" : "ACTIVATE"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form */}
      <div style={S.card}>
        <h3 style={{ color: "#f59e0b", margin: "0 0 4px", fontSize: 16 }}>
          {editProduct ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}
        </h3>
        <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px" }}>
          {editProduct ? "Update product details below." : "Fill in details to add a product."}
        </p>

        <label style={S.label}>PRODUCT NAME</label>
        <input
          style={{ ...S.input, marginBottom: 14 }}
          value={productForm.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g. Lucky Me Pancit Canton"
        />

        <label style={S.label}>BARCODE</label>
        <input
          style={{ ...S.input, marginBottom: 14 }}
          value={productForm.barcode}
          onChange={(e) => handleChange("barcode", e.target.value)}
          placeholder="e.g. 001"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={S.label}>PRICE (₱)</label>
            <input
              style={S.input}
              type="number"
              value={productForm.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={S.label}>STOCK QTY</label>
            <input
              style={S.input}
              type="number"
              value={productForm.stock_quantity}
              onChange={(e) => handleChange("stock_quantity", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <label style={S.label}>CATEGORY</label>
        <select
          style={{ ...S.input, marginBottom: 20 }}
          value={productForm.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...btn(), flex: 1 }} onClick={saveProduct}>
            {editProduct ? "UPDATE PRODUCT" : "ADD PRODUCT"}
          </button>
          {editProduct && (
            <button style={btn("#334155", "#94a3b8")} onClick={handleCancelEdit}>
              CANCEL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;