import React from "react";
import { btn } from "../styles";

function Sidebar({ currentUser, page, setPage, onLogout }) {
  var navItems =
    currentUser.role === "Cashier"
      ? [
          { id: "pos", label: "POS Terminal" },
          { id: "history", label: "My Transactions" },
        ]
      : currentUser.role === "Supervisor"
      ? [
          { id: "supervisor", label: "Supervisor Panel" },
          { id: "history", label: "Transactions" },
          { id: "auditlog", label: "Audit Log" },
        ]
      : [
          { id: "admin", label: "Dashboard" },
          { id: "products", label: "Products" },
          { id: "usersmgmt", label: "Users" },
          { id: "history", label: "Transactions" },
          { id: "auditlog", label: "Audit Log" },
        ];

  var roleColor =
    currentUser.role === "Administrator"
      ? "#f59e0b"
      : currentUser.role === "Supervisor"
      ? "#a855f7"
      : "#3b82f6";

  var sidebarStyle = {
    width: 220,
    background: "#1e293b",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #334155",
    flexShrink: 0,
    height: "100vh",
    boxSizing: "border-box",
  };

  var brandStyle = {
    padding: "20px 20px 16px",
    borderBottom: "1px solid #334155",
    flexShrink: 0,
  };

  var navStyle = {
    padding: "16px 12px",
    flex: 1,
    overflowY: "auto",
  };

  var userStyle = {
    padding: "14px 20px",
    borderTop: "1px solid #334155",
    flexShrink: 0,
  };

  return (
    <div style={sidebarStyle}>
      {/* Brand */}
      <div style={brandStyle}>
        <div style={{ fontSize: 22, fontWeight: "bold", color: "#f59e0b", letterSpacing: 3 }}>
          SARIPH
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 2 }}>
          POS SYSTEM v1.0
        </div>
      </div>

      {/* Nav Items */}
      <div style={navStyle}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, padding: "0 8px 10px" }}>
          NAVIGATION
        </div>
        {navItems.map(function(n) {
          var isActive = page === n.id;
          return (
            <div
              key={n.id}
              onClick={function() { setPage(n.id); }}
              style={{
                padding: "10px 12px",
                borderRadius: 6,
                cursor: "pointer",
                marginBottom: 4,
                fontSize: 13,
                fontWeight: isActive ? "bold" : "normal",
                background: isActive ? "#f59e0b22" : "transparent",
                color: isActive ? "#f59e0b" : "#94a3b8",
                borderLeft: isActive ? "3px solid #f59e0b" : "3px solid transparent",
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>

      {/* User Info + Logout — pinned to bottom */}
      <div style={userStyle}>
        <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: "bold", marginBottom: 2 }}>
          {currentUser.name}
        </div>
        <div style={{ fontSize: 11, color: roleColor, marginBottom: 10, letterSpacing: 1 }}>
          {currentUser.role.toUpperCase()}
        </div>
        <button
          onClick={onLogout}
          style={Object.assign({}, btn("#334155", "#94a3b8"), { width: "100%", fontSize: 12 })}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}

export default Sidebar;