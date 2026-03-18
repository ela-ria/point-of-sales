export const INITIAL_PRODUCTS = [
    { id: 1, barcode: "001", name: "Lucky Me Pancit Canton", price: 14.00, stock: 50, active: true, category: "Groceries" },
    { id: 2, barcode: "002", name: "San Miguel Beer", price: 55.00, stock: 30, active: true, category: "Groceries" },
    { id: 3, barcode: "003", name: "Monggo Seeds 500g", price: 38.00, stock: 40, active: true, category: "Groceries" },
    { id: 4, barcode: "004", name: "Ballpen Blue (Pcs)", price: 7.00, stock: 100, active: true, category: "School Supplies" },
    { id: 5, barcode: "005", name: "Intermediate Pad", price: 25.00, stock: 60, active: true, category: "School Supplies" },
    { id: 6, barcode: "006", name: "Tide Powder 500g", price: 42.00, stock: 35, active: true, category: "Household" },
    { id: 7, barcode: "007", name: "Colgate Toothpaste", price: 59.00, stock: 25, active: true, category: "Household" },
    { id: 8, barcode: "008", name: "Globe Prepaid Load 50", price: 50.00, stock: 200, active: true, category: "Others" },
];

export const INITIAL_USERS = [
    { id: 1, username: "admin", password: "admin123", role: "Administrator", name: "Maria Santos", active: true },
    { id: 2, username: "cashier1", password: "cash123", role: "Cashier", name: "Juan dela Cruz", active: true },
    { id: 3, username: "super1", password: "super123", role: "Supervisor", name: "Ana Reyes", active: true },
];

export const DISCOUNTS = [
    { id: "senior", label: "Senior Citizen", rate: 0.20 },
    { id: "pwd", label: "PWD", rate: 0.20 },
    { id: "athlete", label: "Athlete", rate: 0.10 },
    { id: "solo_parent", label: "Solo Parent", rate: 0.10 },
];

export const CATEGORIES = ["Groceries", "School Supplies", "Household", "Others"];

export function formatPHP(n) {
    return "₱" + Number(n).toFixed(2);
}

export function generateReceiptNo() {
    return "OR-" + Date.now().toString().slice(-6);
}
Eunel Angelo
index.js
Eunel Angelo replied to themself
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
document.documentElement.style.margin = '0';
document.documentElement.style.padding = '0';
document.documentElement.style.overflow = 'hidden';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);