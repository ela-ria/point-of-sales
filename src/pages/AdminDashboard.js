import React, { useState, useEffect } from "react";
import { getDashboardStats } from "../api";
import { formatPHP } from "../constants";
import { S, badge } from "../styles";

function AdminDashboard({ products, users, transactions }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
        Loading dashboard data...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>
        Error loading dashboard stats.
      </div>
    );
  }

  const metrics = [
    { label: "Total Products", value: stats.totalProducts, sub: stats.activeProducts + " active", color: "#f59e0b" },
    { label: "Active Users", value: stats.activeUsers, sub: stats.totalUsers + " total", color: "#10b981" },
    { label: "Total Sales", value: stats.totalSalesCount, sub: "completed sales", color: "#3b82f6" },
    { label: "Total Revenue", value: formatPHP(stats.totalRevenue), sub: "from completed sales", color: "#a855f7" },
  ];

  const lowStockItems = stats.lowStockItems || [];

  return (
    <div>
      <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>ADMIN DASHBOARD</h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>SariPh Retail Store — System Overview</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ background: "#1e293b", borderRadius: 10, padding: 20, border: "1px solid #334155", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, letterSpacing: 1 }}>{m.label.toUpperCase()}</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <div style={{ background: "#ef444410", border: "1px solid #ef444444", borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <div style={{ color: "#ef4444", fontWeight: "bold", marginBottom: 8 }}>⚠ LOW STOCK — {lowStockItems.length} item(s) need restocking</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {lowStockItems.map((p) => (
              <span key={p.id} style={{ background: "#ef444420", color: "#ef4444", padding: "3px 10px", borderRadius: 100, fontSize: 12 }}>
                {p.name} ({p.stock_quantity} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ color: "#f59e0b", margin: "0 0 16px", fontSize: 14, letterSpacing: 1 }}>RECENT TRANSACTIONS</h3>
          {stats.recentTransactions.length === 0 && <div style={{ color: "#475569", fontSize: 13 }}>No transactions yet.</div>}
          {stats.recentTransactions.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e3a5f22", fontSize: 13 }}>
              <div>
                <span style={{ color: t.voided ? "#ef4444" : "#f1f5f9", fontWeight: "bold" }}>{t.receiptNo}</span>
                {t.voided && <span style={{ ...badge("#ef4444"), marginLeft: 6, fontSize: 10 }}>VOIDED</span>}
                <div style={{ fontSize: 11, color: "#64748b" }}>{t.cashier}</div>
              </div>
              <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{formatPHP(t.total)}</span>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <h3 style={{ color: "#f59e0b", margin: "0 0 16px", fontSize: 14, letterSpacing: 1 }}>PRODUCTS BY CATEGORY</h3>
          {stats.productsByCategory.map((cat) => {
            const totalCount = stats.productsByCategory.reduce((sum, c) => sum + c.count, 0);
            const pct = totalCount > 0 ? (cat.count / totalCount) * 100 : 0;
            return (
              <div key={cat.category} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "#d1d5db" }}>{cat.category}</span>
                  <span style={{ color: "#94a3b8" }}>{cat.count} items</span>
                </div>
                <div style={{ background: "#0f172a", borderRadius: 100, height: 6, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: "#f59e0b", borderRadius: 100 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;