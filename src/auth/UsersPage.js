import React from "react";
import { S, btn, badge } from "../styles";

function UsersPage({
    users,
    userForm,
    setUserForm,
    editUser,
    setEditUser,
    saveUser,
    toggleActive,
}) {
    function handleEdit(u) {
        setEditUser(u);
        setUserForm({
            name: u.name,
            username: u.username,
            password: u.password,
            role: u.role,
        });
    }

    function handleCancelEdit() {
        setEditUser(null);
        setUserForm({ name: "", username: "", password: "", role: "Cashier" });
    }

    function handleChange(field, value) {
        setUserForm((prev) => ({ ...prev, [field]: value }));
    }

    const roleColor = (role) =>
        role === "Administrator" ? "#f59e0b" : role === "Supervisor" ? "#a855f7" : "#3b82f6";

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
            {/* Users List */}
            <div>
                <h2 style={{ color: "#f59e0b", margin: "0 0 6px", fontSize: 20, letterSpacing: 1 }}>
                    USER MANAGEMENT
                </h2>
                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>
                    {users.length} total users &bull; {users.filter((u) => u.active).length} active
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
                                    @{u.username} &bull;{" "}
                                    <span style={{ color: roleColor(u.role) }}>{u.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={badge(u.active ? "#10b981" : "#ef4444")}>
                                {u.active ? "Active" : "Inactive"}
                            </span>
                            <button
                                style={{ ...btn("#334155", "#f1f5f9"), fontSize: 11 }}
                                onClick={() => handleEdit(u)}
                            >
                                EDIT
                            </button>
                            <button
                                style={btn(
                                    u.active ? "#7f1d1d" : "#14532d",
                                    u.active ? "#fca5a5" : "#86efac"
                                )}
                                onClick={() => toggleActive(u.id)}
                            >
                                {u.active ? "DEACTIVATE" : "ACTIVATE"}
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

                <label style={S.label}>USERNAME</label>
                <input
                    style={{ ...S.input, marginBottom: 14 }}
                    value={userForm.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    placeholder="e.g. cashier2"
                />

                <label style={S.label}>PASSWORD</label>
                <input
                    style={{ ...S.input, marginBottom: 14 }}
                    type="password"
                    value={userForm.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Enter password"
                />

                <label style={S.label}>ROLE</label>
                <select
                    style={{ ...S.input, marginBottom: 20 }}
                    value={userForm.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                >
                    <option value="Cashier">Cashier</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Administrator">Administrator</option>
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