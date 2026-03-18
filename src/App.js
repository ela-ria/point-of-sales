import React, { useState } from "react";
import { INITIAL_PRODUCTS, INITIAL_USERS, generateReceiptNo } from "./constants";
import { printReceipt } from "./components/printReceipt";

import LoginPage from "./auth/LoginPage";
import Sidebar from "./components/Sidebar";
import POSPage from "./pages/POSPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./auth/UsersPage";
import TransactionsPage from "./reports/TransactionsPage";
import SupervisorPage from "./reports/SupervisorPage";
import AuditLog from "./reports/AuditLog";
import Receipt from "./components/Receipt";
import { DiscountModal, VoidItemModal, PaymentModal, PostVoidModal } from "./components/modals";

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
  var [currentUser, setCurrentUser] = useState(null);
  var [page, setPage] = useState("login");
  var [products, setProducts] = useState(INITIAL_PRODUCTS);
  var [users, setUsers] = useState(INITIAL_USERS);
  var [transactions, setTransactions] = useState([]);
  var [cancelLog, setCancelLog] = useState([]);
  var [voidLog, setVoidLog] = useState([]);
  var [cart, setCart] = useState([]);
  var [barcodeInput, setBarcodeInput] = useState("");
  var [searchQuery, setSearchQuery] = useState("");
  var [appliedDiscount, setAppliedDiscount] = useState(null);
  var [lastReceipt, setLastReceipt] = useState(null);
  var [cashReceived, setCashReceived] = useState("");
  var [showReceipt, setShowReceipt] = useState(false);
  var [showDiscountModal, setShowDiscountModal] = useState(false);
  var [showVoidItemModal, setShowVoidItemModal] = useState(false);
  var [showPayModal, setShowPayModal] = useState(false);
  var [showPostVoidModal, setShowPostVoidModal] = useState(false);
  var [voidItemTarget, setVoidItemTarget] = useState(null);
  var [postVoidTarget, setPostVoidTarget] = useState(null);
  var [postVoidReason, setPostVoidReason] = useState("");
  var [superUsername, setSuperUsername] = useState("");
  var [superPassword, setSuperPassword] = useState("");
  var [superError, setSuperError] = useState("");
  var [productForm, setProductForm] = useState({ name: "", barcode: "", price: "", stock: "", category: "Groceries" });
  var [editProduct, setEditProduct] = useState(null);
  var [userForm, setUserForm] = useState({ name: "", username: "", password: "", role: "Cashier" });
  var [editUser, setEditUser] = useState(null);
  var [notification, setNotification] = useState(null);

  function notify(msg, type) {
    setNotification({ msg: msg, type: type || "success" });
    setTimeout(function () { setNotification(null); }, 2800);
  }

  function handleLogin(username, password) {
    var user = users.find(function (u) {
      return u.username === username && u.password === password && u.active;
    });
    if (user) {
      setCurrentUser(user);
      if (user.role === "Cashier") setPage("pos");
      else if (user.role === "Supervisor") setPage("supervisor");
      else setPage("admin");
    } else {
      notify("Invalid credentials or account is inactive.", "error");
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setPage("login");
    setCart([]);
    setAppliedDiscount(null);
    setShowReceipt(false);
  }

  var subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  var discountAmount = appliedDiscount ? subtotal * appliedDiscount.rate : 0;
  var total = subtotal - discountAmount;

  function addToCart(product) {
    if (!product.active) { notify("This product is deactivated.", "error"); return; }
    if (product.stock <= 0) { notify("Out of stock.", "error"); return; }
    setCart(function (prev) {
      var existing = prev.find(function (i) { return i.id === product.id; });
      if (existing) {
        if (existing.qty >= product.stock) { notify("Not enough stock.", "error"); return prev; }
        return prev.map(function (i) {
          return i.id === product.id ? Object.assign({}, i, { qty: i.qty + 1 }) : i;
        });
      }
      return prev.concat([Object.assign({}, product, { qty: 1 })]);
    });
    setBarcodeInput("");
  }

  function handleBarcodeSearch() {
    var found = products.find(function (p) { return p.barcode === barcodeInput && p.active; });
    if (found) addToCart(found);
    else notify("Product not found: " + barcodeInput, "error");
    setBarcodeInput("");
  }

  function updateQty(id, delta) {
    setCart(function (prev) {
      return prev.map(function (i) {
        if (i.id !== id) return i;
        var newQty = i.qty + delta;
        if (newQty <= 0) return null;
        return Object.assign({}, i, { qty: newQty });
      }).filter(Boolean);
    });
  }

  function initiateVoidItem(item) {
    setVoidItemTarget(item);
    setShowVoidItemModal(true);
  }

  function confirmVoidItem() {
    setVoidLog(function (prev) {
      return prev.concat([{ id: Date.now(), type: "void_item", item: voidItemTarget, cashier: currentUser.name, time: new Date().toLocaleString() }]);
    });
    setCart(function (prev) { return prev.filter(function (i) { return i.id !== voidItemTarget.id; }); });
    setShowVoidItemModal(false);
    setVoidItemTarget(null);
    notify("Item voided and recorded.");
  }

  function cancelSale() {
    if (cart.length === 0) { notify("No active sale to cancel.", "error"); return; }
    setCancelLog(function (prev) {
      return prev.concat([{ id: Date.now(), items: cart.slice(), cashier: currentUser.name, time: new Date().toLocaleString(), discount: appliedDiscount }]);
    });
    setCart([]);
    setAppliedDiscount(null);
    notify("Sale cancelled and logged.");
  }

  function handlePayment() {
    var cash = parseFloat(cashReceived);
    if (isNaN(cash) || cash < total) { notify("Insufficient cash.", "error"); return; }
    var receiptNo = generateReceiptNo();
    var txn = {
      id: Date.now(), receiptNo: receiptNo, items: cart.slice(),
      cashier: currentUser.name, subtotal: subtotal, discountAmount: discountAmount,
      discount: appliedDiscount, total: total, cash: cash, change: cash - total,
      time: new Date().toLocaleString(), voided: false,
    };
    setTransactions(function (prev) { return prev.concat([txn]); });
    setProducts(function (prev) {
      return prev.map(function (p) {
        var ci = cart.find(function (c) { return c.id === p.id; });
        return ci ? Object.assign({}, p, { stock: p.stock - ci.qty }) : p;
      });
    });
    setLastReceipt(txn);
    setCart([]);
    setAppliedDiscount(null);
    setCashReceived("");
    setShowPayModal(false);
    setShowReceipt(true);
    printReceipt(txn);
    notify("Payment successful!");
  }

  // Single reprint function used by BOTH the POSPage button and the Receipt modal.
  // Marks reprinted, opens receipt modal, prints, and logs to audit — every time.
  function reprintReceipt() {
    if (!lastReceipt) { notify("No recent transaction.", "error"); return; }
    var reprinted = Object.assign({}, lastReceipt, { reprinted: true });
    setLastReceipt(reprinted);
    setShowReceipt(true);
    printReceipt(reprinted);
    setVoidLog(function (prev) {
      return prev.concat([{
        id: Date.now(),
        type: "reprint",
        receiptNo: reprinted.receiptNo,
        cashier: currentUser.name,
        time: new Date().toLocaleString(),
      }]);
    });
    notify("Receipt reprinted and logged.");
  }

  function initiatePostVoid(txn) {
    setPostVoidTarget(txn);
    setSuperUsername(""); setSuperPassword(""); setSuperError(""); setPostVoidReason("");
    setShowPostVoidModal(true);
  }

  function confirmPostVoid() {
    var sup = users.find(function (u) {
      return u.username === superUsername && u.password === superPassword && u.role === "Supervisor" && u.active;
    });
    if (!sup) { setSuperError("Invalid supervisor credentials."); return; }
    if (!postVoidReason.trim()) { setSuperError("Reason is required."); return; }
    setTransactions(function (prev) {
      return prev.map(function (t) {
        return t.id === postVoidTarget.id
          ? Object.assign({}, t, { voided: true, voidReason: postVoidReason, approvedBy: sup.name }) : t;
      });
    });
    setProducts(function (prev) {
      return prev.map(function (p) {
        var vi = postVoidTarget.items.find(function (i) { return i.id === p.id; });
        return vi ? Object.assign({}, p, { stock: p.stock + vi.qty }) : p;
      });
    });
    setVoidLog(function (prev) {
      return prev.concat([{
        id: Date.now(), type: "post_void", receiptNo: postVoidTarget.receiptNo,
        reason: postVoidReason, approvedBy: sup.name, cashier: postVoidTarget.cashier,
        time: new Date().toLocaleString(),
      }]);
    });
    setShowPostVoidModal(false);
    notify("Post-void approved. Inventory restored.");
  }

  function saveProduct() {
    if (!productForm.name || !productForm.barcode || !productForm.price || !productForm.stock) {
      notify("All fields required.", "error"); return;
    }
    if (editProduct) {
      setProducts(function (prev) {
        return prev.map(function (p) {
          return p.id === editProduct.id
            ? Object.assign({}, p, productForm, { price: +productForm.price, stock: +productForm.stock }) : p;
        });
      });
      notify("Product updated.");
    } else {
      var dup = products.find(function (p) { return p.barcode === productForm.barcode; });
      if (dup) { notify("Barcode already exists.", "error"); return; }
      setProducts(function (prev) {
        return prev.concat([Object.assign({}, productForm, { id: Date.now(), price: +productForm.price, stock: +productForm.stock, active: true })]);
      });
      notify("Product added.");
    }
    setProductForm({ name: "", barcode: "", price: "", stock: "", category: "Groceries" });
    setEditProduct(null);
  }

  function toggleProductActive(id) {
    setProducts(function (prev) {
      return prev.map(function (p) { return p.id === id ? Object.assign({}, p, { active: !p.active }) : p; });
    });
  }

  function saveUser() {
    if (!userForm.name || !userForm.username || !userForm.password || !userForm.role) {
      notify("All fields required.", "error"); return;
    }
    if (editUser) {
      setUsers(function (prev) {
        return prev.map(function (u) { return u.id === editUser.id ? Object.assign({}, u, userForm) : u; });
      });
      notify("User updated.");
    } else {
      var dup = users.find(function (u) { return u.username === userForm.username; });
      if (dup) { notify("Username exists.", "error"); return; }
      setUsers(function (prev) {
        return prev.concat([Object.assign({}, userForm, { id: Date.now(), active: true })]);
      });
      notify("User created.");
    }
    setUserForm({ name: "", username: "", password: "", role: "Cashier" });
    setEditUser(null);
  }

  function toggleUserActive(id) {
    setUsers(function (prev) {
      return prev.map(function (u) { return u.id === id ? Object.assign({}, u, { active: !u.active }) : u; });
    });
  }

  var filteredProducts = Array.isArray(products)
    ? products.filter(function (p) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    })
    : [];

  var notifColor = notification && notification.type === "error" ? "#ef4444" : "#10b981";
  var notifStyle = {
    position: "fixed", top: 20, right: 20, zIndex: 9999,
    background: notifColor + "20", border: "1px solid " + notifColor,
    color: notifColor, padding: "10px 20px", borderRadius: 8,
    fontWeight: "bold", fontSize: 13, fontFamily: "'Courier New', monospace",
  };

  if (page === "login") {
    return React.createElement(LoginPage, { onLogin: handleLogin, notification: notification });
  }

  return React.createElement("div", { style: appStyle },
    React.createElement(Sidebar, { currentUser: currentUser, page: page, setPage: setPage, onLogout: handleLogout }),

    React.createElement("div", { style: mainStyle },
      notification ? React.createElement("div", { style: notifStyle }, notification.msg) : null,

      page === "pos" ? React.createElement(POSPage, {
        cart: cart, products: filteredProducts, barcodeInput: barcodeInput,
        setBarcodeInput: setBarcodeInput, handleBarcodeSearch: handleBarcodeSearch,
        addToCart: addToCart, updateQty: updateQty, initiateVoidItem: initiateVoidItem,
        appliedDiscount: appliedDiscount, subtotal: subtotal, discountAmount: discountAmount,
        total: total, cancelSale: cancelSale, reprintReceipt: reprintReceipt,
        lastReceipt: lastReceipt, setShowDiscountModal: setShowDiscountModal,
        setShowPayModal: setShowPayModal, searchQuery: searchQuery, setSearchQuery: setSearchQuery,
      }) : null,

      page === "admin" ? React.createElement(AdminDashboard, { products: products, users: users, transactions: transactions }) : null,

      page === "products" ? React.createElement(ProductsPage, {
        products: products, productForm: productForm, setProductForm: setProductForm,
        editProduct: editProduct, setEditProduct: setEditProduct, saveProduct: saveProduct,
        toggleProductActive: toggleProductActive, notify: notify,
      }) : null,

      page === "usersmgmt" ? React.createElement(UsersPage, {
        users: users, userForm: userForm, setUserForm: setUserForm,
        editUser: editUser, setEditUser: setEditUser, saveUser: saveUser,
        toggleActive: toggleUserActive,
      }) : null,

      page === "history" ? React.createElement(TransactionsPage, {
        transactions: transactions,
        initiatePostVoid: currentUser && currentUser.role !== "Cashier" ? initiatePostVoid : null,
        currentUser: currentUser,
      }) : null,

      page === "supervisor" ? React.createElement(SupervisorPage, {
        transactions: transactions, initiatePostVoid: initiatePostVoid,
        voidLog: voidLog, cancelLog: cancelLog,
      }) : null,

      page === "auditlog" ? React.createElement(AuditLog, { voidLog: voidLog, cancelLog: cancelLog }) : null
    ),

    showReceipt && lastReceipt ? React.createElement(Receipt, {
      txn: lastReceipt,
      onClose: function () { setShowReceipt(false); },
      onReprint: reprintReceipt, // ← was an inline function before, now uses reprintReceipt()
    }) : null,

    showDiscountModal ? React.createElement(DiscountModal, {
      appliedDiscount: appliedDiscount,
      onApply: function (d) { setAppliedDiscount(d); setShowDiscountModal(false); notify(d.label + " discount applied."); },
      onRemove: function () { setAppliedDiscount(null); setShowDiscountModal(false); notify("Discount removed."); },
      onClose: function () { setShowDiscountModal(false); },
    }) : null,

    showVoidItemModal && voidItemTarget ? React.createElement(VoidItemModal, {
      item: voidItemTarget, onConfirm: confirmVoidItem,
      onClose: function () { setShowVoidItemModal(false); },
    }) : null,

    showPayModal ? React.createElement(PaymentModal, {
      total: total, subtotal: subtotal, discountAmount: discountAmount,
      appliedDiscount: appliedDiscount, cashReceived: cashReceived,
      setCashReceived: setCashReceived, onConfirm: handlePayment,
      onClose: function () { setShowPayModal(false); },
    }) : null,

    showPostVoidModal && postVoidTarget ? React.createElement(PostVoidModal, {
      target: postVoidTarget, superUsername: superUsername, setSuperUsername: setSuperUsername,
      superPassword: superPassword, setSuperPassword: setSuperPassword,
      postVoidReason: postVoidReason, setPostVoidReason: setPostVoidReason,
      superError: superError, onConfirm: confirmPostVoid,
      onClose: function () { setShowPostVoidModal(false); },
    }) : null
  );
}

export default App;