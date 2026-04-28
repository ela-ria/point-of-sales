import React, { useState, useEffect } from "react";
import { S, btn, badge } from "../styles";
import { fetchUsers, createUser, updateUser, deleteUser } from "../api";

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "cashier" });
    const [editUser, setEditUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Fetch users on mount
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await fetchUsers();
                setUsers(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function notify(msg, type) {
        setNotification({ msg, type: type || "success" });
        setTimeout(() => setNotification(null), 2800);
    }

    function handleEdit(u) {
        setEditUser(u);
        setUserForm({
            name: u.name,
            email: u.email,
            password: "",
            role: u.role,
        });
    }

    function handleCancelEdit() {
        setEditUser(null);
        setUserForm({ name: "", email: "", password: "", role: "cashier" });
    }

    function handleChange(field, value) {
        setUserForm((prev) => ({ ...prev, [field]: value }));
    }

    async function saveUser() {
        try {
            if (!userForm.name || !userForm.email || (editUser && !userForm.password && !editUser.id)) {
                notify("Please fill all required fields", "error");
                return;
            }

            if (editUser) {
                // Update existing user
                const payload = {
                    name: userForm.name,
                    email: userForm.email,
                    role: userForm.role,
                };
                if (userForm.password) {
                    payload.password = userForm.password;
                }
                await updateUser(editUser.id, payload);
                setUsers(users.map(u => u.id === editUser.id ? { ...editUser, ...payload } : u));
                notify("User updated successfully", "success");
            } else {
                // Create new user
                if (!userForm.password) {
                    notify("Password is required for new users", "error");
                    return;
                }
                const newUser = await createUser({
                    name: userForm.name,
                    email: userForm.email,
                    password: userForm.password,
                    role: userForm.role,
                    is_active: true, // New users are active by default
                });
                setUsers([...users, newUser]);
                notify("User created successfully", "success");
            }

            handleCancelEdit();
        } catch (err) {
            notify(err.message, "error");
            console.error("Failed to save user:", err);
        }
    }

    async function toggleActive(id) {
        try {
            const user = users.find(u => u.id === id);
            if (user.is_active) {
                // Deactivate
                await deleteUser(id);
                setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u));
                notify("User deactivated successfully", "success");
            } else {
                // Activate
                await updateUser(id, { is_active: true });
                setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u));
                notify("User activated successfully", "success");
            }
        } catch (err) {
            notify(err.message, "error");
            console.error("Failed to toggle user status:", err);
        }
    }

    const roleColor = (role) =>
        role === "admin" ? "#f59e0b" : role === "supervisor" ? "#a855f7" : "#3b82f6";

    if (loading) {
        return <div style={{ color: "#f1f5f9", textAlign: "center", paddingTop: 40 }}>Loading users...</div>;
    }

    if (error) {
        return <div style={{ color: "#ef4444", textAlign: "center", paddingTop: 40 }}>Error: {error}</div>;
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
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

            {/* Users List */}
            <div>
                <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
                    USER MANAGEMENT
                </h2>
                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
                    {users.length} total users &bull; {users.filter((u) => u.is_active).length} active
                </p>

                {users.map((u) => (
                    <div
                        key={u.id}
                        style={{
                            ...S.card,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 20px",
                            borderLeft:
                                editUser && editUser.id === u.id
                                    ? "3px solid #f59e0b"
                                    : "3px solid transparent",
                            opacity: u.is_active ? 1 : 0.6,
                        }}
                    >
                        {/* Avatar + Info */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    background: roleColor(u.role) + "22",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: 15,
                                    color: roleColor(u.role),
                                    flexShrink: 0,
                                }}
                            >
                                {u.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: "bold", color: "#f1f5f9", fontSize: 14 }}>
                                    {u.name}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                    {u.email} &bull;{" "}
                                    <span style={{ color: roleColor(u.role) }}>{u.role.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={badge(u.is_active ? "#10b981" : "#ef4444")}>
                                {u.is_active ? "Active" : "Inactive"}
                            </span>
                            <button
                                style={{ ...btn("#334155", "#f1f5f9"), fontSize: 11 }}
                                onClick={() => handleEdit(u)}
                            >
                                EDIT
                            </button>
                            <button
                                style={btn(
                                    u.is_active ? "#7f1d1d" : "#14532d",
                                    u.is_active ? "#fca5a5" : "#86efac"
                                )}
                                onClick={() => toggleActive(u.id)}
                            >
                                {u.is_active ? "DEACTIVATE" : "ACTIVATE"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div style={S.card}>
                <h3 style={{ color: "#f59e0b", margin: "0 0 4px", fontSize: 16 }}>
                    {editUser ? "EDIT USER" : "CREATE USER"}
                </h3>
                <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px" }}>
                    {editUser ? "Update user information." : "Add a new system user."}
                </p>

                <label style={S.label}>FULL NAME</label>
                <input
                    style={{ ...S.input, marginBottom: 14 }}
                    value={userForm.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Juan dela Cruz"
                />

                <label style={S.label}>EMAIL</label>
                <input
                    style={{ ...S.input, marginBottom: 14 }}
                    type="email"
                    value={userForm.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="e.g. user@sariph.com"
                />

                <label style={S.label}>PASSWORD {editUser && "(leave empty to keep)"}</label>
                <input
                    style={{ ...S.input, marginBottom: 14 }}
                    type="password"
                    value={userForm.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder={editUser ? "Leave empty to keep current password" : "Enter password"}
                />

                <label style={S.label}>ROLE</label>
                <select
                    style={{ ...S.input, marginBottom: 20 }}
                    value={userForm.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                >
                    <option value="cashier">Cashier</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                </select>

                <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...btn(), flex: 1 }} onClick={saveUser}>
                        {editUser ? "UPDATE USER" : "CREATE USER"}
                    </button>
                    {editUser && (
                        <button style={btn("#334155", "#94a3b8")} onClick={handleCancelEdit}>
                            CANCEL
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UsersPage;