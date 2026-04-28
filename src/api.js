// API Service for backend communication
const API_BASE_URL = "http://localhost:8000/api";

let authToken = localStorage.getItem("authToken");

function setAuthToken(token) {
    authToken = token;
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
}

function getAuthToken() {
    return authToken || localStorage.getItem("authToken");
}

async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

// Auth
export async function login(email, password) {
    const data = await apiCall("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    if (data.token) setAuthToken(data.token);
    return data;
}

export async function logout() {
    await apiCall("/logout", { method: "POST" });
    setAuthToken(null);
}

export async function getCurrentUser() {
    return await apiCall("/me");
}

// Products
export async function fetchProducts() {
    return await apiCall("/products");
}

export async function searchProducts(query) {
    return await apiCall(`/products/search?q=${encodeURIComponent(query)}`);
}

export async function createProduct(product) {
    return await apiCall("/products", {
        method: "POST",
        body: JSON.stringify(product),
    });
}

export async function updateProduct(id, product) {
    return await apiCall(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product),
    });
}

export async function deactivateProduct(id) {
    return await apiCall(`/products/${id}/deactivate`, {
        method: "PATCH",
    });
}

// Users
export async function fetchUsers() {
    return await apiCall("/users");
}

export async function createUser(user) {
    return await apiCall("/users", {
        method: "POST",
        body: JSON.stringify(user),
    });
}

export async function updateUser(id, user) {
    return await apiCall(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(user),
    });
}

export async function deleteUser(id) {
    return await apiCall(`/users/${id}`, {
        method: "DELETE",
    });
}

// Sales
export async function fetchSales() {
    return await apiCall("/sales");
}

export async function createSale(sale) {
    return await apiCall("/sales", {
        method: "POST",
        body: JSON.stringify(sale),
    });
}

export async function getSale(saleId) {
    return await apiCall(`/sales/${saleId}`, {
        method: "GET",
    });
}

export async function addSaleItem(saleId, productId, quantity) {
    return await apiCall(`/sales/${saleId}/items`, {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity: quantity }),
    });
}

export async function completeSale(saleId) {
    return await apiCall(`/sales/${saleId}/complete`, {
        method: "POST",
    });
}

export async function applyDiscount(saleId, discountType) {
    return await apiCall(`/sales/${saleId}/discount`, {
        method: "POST",
        body: JSON.stringify({ discount_type: discountType }),
    });
}

export async function cancelSale(saleId) {
    return await apiCall(`/sales/${saleId}/cancel`, {
        method: "POST",
    });
}

export async function postVoidSale(saleId, reason) {
    return await apiCall(`/sales/${saleId}/post-void`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}

export async function voidSaleItem(saleId, itemId) {
    return await apiCall(`/sales/${saleId}/items/${itemId}`, {
        method: "DELETE",
    });
}

export async function fetchVoidedSales() {
    return await apiCall("/voided-sales");
}

export async function fetchCancelledSales() {
    return await apiCall("/cancelled-sales");
}

// Dashboard
export async function getDashboardStats() {
    return await apiCall("/dashboard/stats");
}

export { getAuthToken, setAuthToken };
