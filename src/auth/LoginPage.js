import React, { useState } from "react";

function LoginPage({ onLogin, notification }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    function handleSubmit() {
        onLogin(email, password);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleSubmit();
    }

    const containerStyle = {
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
    };

    const boxStyle = {
        width: 360,
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 40,
    };

    const inputStyle = {
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 6,
        padding: "10px 14px",
        color: "#f1f5f9",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "'Courier New', monospace",
        fontSize: 15,
        marginBottom: 0,
    };

    const labelStyle = {
        fontSize: 12,
        color: "#94a3b8",
        display: "block",
        marginBottom: 6,
        letterSpacing: 1,
    };

    const loginBtnStyle = {
        width: "100%",
        background: "#f59e0b",
        color: "#0f172a",
        border: "none",
        borderRadius: 6,
        padding: "12px",
        fontWeight: "bold",
        fontSize: 15,
        cursor: "pointer",
        fontFamily: "'Courier New', monospace",
        letterSpacing: 2,
    };

    const notifStyle = {
        position: "fixed",
        top: 20,
        right: 20,
        background: "#ef444420",
        border: "1px solid #ef4444",
        color: "#ef4444",
        padding: "10px 20px",
        borderRadius: 8,
        fontWeight: "bold",
        zIndex: 9999,
    };

    return (
        <div style={containerStyle}>
            {notification && (
                <div style={notifStyle}>{notification.msg}</div>
            )}

            <div style={boxStyle}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 40, fontWeight: "bold", color: "#f59e0b", letterSpacing: 6 }}>
                        SARIPH
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 3, marginTop: 4 }}>
                        RETAIL STORE POS SYSTEM
                    </div>
                    <div style={{ width: 60, height: 2, background: "#f59e0b", margin: "12px auto 0" }} />
                </div>

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>EMAIL</label>
                    <input
                        style={inputStyle}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter email"
                        autoFocus
                    />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>PASSWORD</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                            style={inputStyle}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: 10,
                                background: "none",
                                border: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                fontSize: 12,
                                padding: 0,
                            }}
                        >
                            {showPassword ? "HIDE" : "SHOW"}
                        </button>
                    </div>
                </div>

                <button style={loginBtnStyle} onClick={handleSubmit}>
                    LOGIN
                </button>

                {/* Demo credentials */}
                <div style={{ marginTop: 24, borderTop: "1px solid #334155", paddingTop: 16 }}>
                    <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>DEMO ACCOUNTS:</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>admin@sariph.com — Administrator</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>cashier@sariph.com — Cashier</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>supervisor@sariph.com — Supervisor</div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;