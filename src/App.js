import React, { useState, useEffect } from "react";
import { login, getCurrentUser } from "./api";

import LoginPage from "./auth/LoginPage";
import Sidebar from "./components/Sidebar";
import POSPage from "./pages/POSPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./auth/UsersPage";
import TransactionsPage from "./reports/TransactionsPage";
import AuditLog from "./reports/AuditLog";

var appStyle = {
  fontFamily: "'Courier New', monospace",
  height: "100vh",
  width: "100vw",
  background: "#0f172a",
  color: "#f1f5f9",
  display: "flex",
  overflow: "hidden",
  position: "fixed",
  top: 0,
  left: 0,
};

var mainStyle = {
  flex: 1,
  overflowY: "auto",
  padding: 24,
  height: "100vh",
  boxSizing: "border-box",
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  function notify(msg, type) {
    setNotification({ msg: msg, type: type || "success" });
    setTimeout(function () { setNotification(null); }, 2800);
  }

  // Restore session on app mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      (async () => {
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
          
          // Route based on role from backend
          if (user.role === "cashier") setPage("pos");
          else if (user.role === "supervisor") setPage("supervisor");
          else if (user.role === "admin") setPage("admin");
        } catch (error) {
          // Token invalid or expired, clear it
          localStorage.removeItem("authToken");
          setPage("login");
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setIsLoading(false);
    }
  }, []);

  function handleLogin(email, password) {
    (async () => {
      try {
        const response = await login(email, password);
        const user = response.user;
        setCurrentUser(user);
        
        // Route based on role from backend (cashier, supervisor, admin)
        if (user.role === "cashier") setPage("pos");
        else if (user.role === "supervisor") setPage("supervisor");
        else if (user.role === "admin") setPage("admin");
        
        notify("Login successful!", "success");
      } catch (error) {
        notify(error.message || "Invalid email or password.", "error");
      }
    })();
  }

  function handleLogout() {
    (async () => {
      try {
        const { logout } = await import("./api");
        await logout();
      } catch (error) {
        console.error("Logout error:", error);
      }
    })();
    setCurrentUser(null);
    setPage("login");
  }

  const notifStyle = {
    position: "fixed", top: 20, right: 20, padding: "12px 20px", borderRadius: 4,
    background: notification?.type === "error" ? "#ef4444" : "#10b981", color: "#fff", zIndex: 1000,
    fontWeight: "bold", fontSize: 13, fontFamily: "'Courier New', monospace",
  };

  // Loading screen
  if (isLoading) {
    var loadingStyle = {
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
    };

    var spinnerStyle = {
      textAlign: "center",
    };

    var logoStyle = {
      fontSize: 40,
      fontWeight: "bold",
      color: "#f59e0b",
      letterSpacing: 6,
      marginBottom: 32,
    };

    var spinnerCircleStyle = {
      width: 60,
      height: 60,
      border: "3px solid #334155",
      borderTop: "3px solid #f59e0b",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 24px",
    };

    var textStyle = {
      fontSize: 14,
      color: "#94a3b8",
      letterSpacing: 2,
    };

    return React.createElement("div", { style: loadingStyle },
      React.createElement("style", null, `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `),
      React.createElement("div", { style: spinnerStyle },
        React.createElement("div", { style: logoStyle }, "SARIPH"),
        React.createElement("div", { style: spinnerCircleStyle }),
        React.createElement("div", { style: textStyle }, "INITIALIZING...")
      )
    );
  }

  if (page === "login") {
    return React.createElement(LoginPage, { onLogin: handleLogin, notification: notification });
  }

  return React.createElement("div", { style: appStyle },
    React.createElement(Sidebar, { currentUser: currentUser, page: page, setPage: setPage, onLogout: handleLogout }),

    React.createElement("div", { style: mainStyle },
      notification ? React.createElement("div", { style: notifStyle }, notification.msg) : null,

      page === "pos" ? React.createElement(POSPage, {}) : null,

      page === "admin" ? React.createElement(AdminDashboard, {}) : null,

      page === "products" ? React.createElement(ProductsPage, {}) : null,

      page === "usersmgmt" ? React.createElement(UsersPage, {}) : null,

      page === "history" ? React.createElement(TransactionsPage, { currentUser: currentUser }) : null,

      page === "supervisor" ? React.createElement(AuditLog, {}) : null,

      page === "auditlog" ? React.createElement(AuditLog, {}) : null
    )
  );
}

export default App;