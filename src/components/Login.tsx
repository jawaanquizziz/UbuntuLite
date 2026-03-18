"use client";

import React, { useState, useEffect } from "react";

export default function Login({ onLogin }: { onLogin: (username: string) => void }) {
    const [username, setUsername] = useState("root");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [time, setTime] = useState<Date>(new Date());
    const [extraUsers, setExtraUsers] = useState<{ username: string, created: string }[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load users from localStorage (populated by useradd in terminal)
    useEffect(() => {
        const loadUsers = () => {
            try {
                const raw = localStorage.getItem('ubuntu_users');
                setExtraUsers(raw ? JSON.parse(raw) : []);
            } catch { setExtraUsers([]); }
        };
        loadUsers();
        // Re-load when localStorage changes (terminal useradd in another tab)
        window.addEventListener('storage', loadUsers);
        return () => window.removeEventListener('storage', loadUsers);
    }, []);

    const handleLogin = async () => {
        if (!password) { setError(true); return; }
        if (password === "ubuntu2026") {
            setLoading(true);
            await new Promise(r => setTimeout(r, 600));
            setIsExiting(true);
            await new Promise(r => setTimeout(r, 800));
            onLogin(username || "root");
        } else {
            setError(true);
            setPassword("");
        }
    };

    const timeStr = time ? time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";
    const dateStr = time ? time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "";

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "#0a0a0f",
            display: "flex", fontFamily: "'Inter', sans-serif",
            overflow: "hidden",
            opacity: isExiting ? 0 : 1,
            transition: "opacity 0.8s ease-in-out",
            pointerEvents: isExiting ? "none" : "auto"
        }}>
            {/* Animated background orbs */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{
                    position: "absolute", width: "600px", height: "600px",
                    background: "radial-gradient(circle, rgba(233,84,32,0.25) 0%, transparent 70%)",
                    top: "-200px", left: "-200px",
                    animation: "orbFloat1 12s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute", width: "500px", height: "500px",
                    background: "radial-gradient(circle, rgba(100,30,150,0.2) 0%, transparent 70%)",
                    bottom: "-150px", right: "-100px",
                    animation: "orbFloat2 15s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute", width: "300px", height: "300px",
                    background: "radial-gradient(circle, rgba(233,84,32,0.1) 0%, transparent 70%)",
                    top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    animation: "orbFloat1 8s ease-in-out infinite reverse"
                }} />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes orbFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(60px, 40px) scale(1.05); }
                    66% { transform: translate(-30px, 60px) scale(0.95); }
                }
                @keyframes orbFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-50px, -40px) scale(1.1); }
                    66% { transform: translate(30px, -20px) scale(0.9); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-8px); }
                    40%, 80% { transform: translateX(8px); }
                }
                .login-input-group { animation: fadeSlideUp 0.5s ease both; }
                .login-input-group:nth-child(1) { animation-delay: 0.1s; }
                .login-input-group:nth-child(2) { animation-delay: 0.2s; }
                .login-input-group:nth-child(3) { animation-delay: 0.3s; }
                .login-field {
                    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 14px; padding: 14px 18px; color: white; font-size: 15px;
                    outline: none; transition: all 0.3s ease; box-sizing: border-box;
                    font-family: inherit; letter-spacing: 0.3px;
                }
                .login-field:focus { border-color: #E95420; background: rgba(233,84,32,0.06); box-shadow: 0 0 0 3px rgba(233,84,32,0.12); }
                .login-field::placeholder { color: rgba(255,255,255,0.3); }
                .login-field.pw-field { padding-right: 90px; }
                .login-field.error { border-color: #ff4d6d !important; animation: shake 0.4s ease; }
                .login-btn-main {
                    width: 100%; padding: 15px; border: none; border-radius: 14px;
                    background: linear-gradient(135deg, #E95420, #c94010);
                    color: white; font-size: 15px; font-weight: 700; cursor: pointer;
                    transition: all 0.3s ease; letter-spacing: 0.5px;
                    box-shadow: 0 8px 25px rgba(233,84,32,0.35);
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                }
                .login-btn-main:hover:not(:disabled) {
                    transform: translateY(-2px); box-shadow: 0 12px 30px rgba(233,84,32,0.5);
                    background: linear-gradient(135deg, #ff6030, #E95420);
                }
                .login-btn-main:active { transform: translateY(0); }
                .login-btn-main:disabled { opacity: 0.7; cursor: not-allowed; }
                .pw-actions { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 4px; }
                .pw-toggle { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; }
                .pw-toggle:hover { color: white; background: rgba(255,255,255,0.08); }
                @media (max-width: 768px) {
                    .login-main-wrapper { flex-direction: column !important; overflow-y: auto !important; }
                    .login-left-panel { padding: 30px 20px !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; flex: none !important; }
                    .login-right-panel { width: 100% !important; padding: 40px 20px !important; flex: 1 !important; }
                    .login-clock { fontSize: 48px !important; }
                }
            ` }} />

            {/* Main wrapper with responsive class */}
            <div className="login-main-wrapper" style={{
                flex: 1, display: "flex", width: "100%", height: "100%"
            }}>
                {/* Left decorative panel */}
                <div className="login-left-panel" style={{
                    flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between",
                    padding: "50px 60px", position: "relative",
                    borderRight: "1px solid rgba(255,255,255,0.04)"
                }}>
                {/* Logo + Brand */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", animation: "fadeSlideUp 0.5s ease both" }}>
                    <img src="/ubuntulite.png" alt="UbuntuLite" style={{ width: "42px", height: "42px", filter: "drop-shadow(0 2px 10px rgba(233,84,32,0.5))" }} />
                    <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: "18px", lineHeight: 1.2 }}>UbuntuLite</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Web OS Simulator</div>
                    </div>
                </div>

                {/* Center clock */}
                <div style={{ animation: "fadeSlideUp 0.6s ease 0.2s both", minHeight: "100px" }}>
                    {isMounted ? (
                        <>
                            <div style={{ fontSize: "72px", fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-2px" }}>{timeStr}</div>
                            <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", marginTop: "10px" }}>{dateStr}</div>
                        </>
                    ) : (
                        <div style={{ fontSize: "72px", fontWeight: 700, color: "transparent", lineHeight: 1, letterSpacing: "-2px" }}>00:00 AM</div>
                    )}

                    <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            { 
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="4" y="4" width="16" height="16" rx="2" />
                                        <rect x="9" y="9" width="6" height="6" />
                                        <line x1="9" y1="1" x2="9" y2="4" />
                                        <line x1="15" y1="1" x2="15" y2="4" />
                                        <line x1="9" y1="20" x2="9" y2="23" />
                                        <line x1="15" y1="20" x2="15" y2="23" />
                                        <line x1="20" y1="9" x2="23" y2="9" />
                                        <line x1="20" y1="15" x2="23" y2="15" />
                                        <line x1="1" y1="9" x2="4" y2="9" />
                                        <line x1="1" y1="15" x2="4" y2="15" />
                                    </svg>
                                ), 
                                label: "Kernel", 
                                value: "6.8.0-LTS" 
                            },
                            { 
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 19v-3h12v3c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2z" />
                                        <path d="M6 5v3h12V5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2-2z" />
                                        <rect x="6" y="8" width="12" height="8" />
                                        <line x1="9" y1="11" x2="9" y2="13" />
                                        <line x1="12" y1="11" x2="12" y2="13" />
                                        <line x1="15" y1="11" x2="15" y2="13" />
                                    </svg>
                                ), 
                                label: "Memory", 
                                value: "8.0 / 16 GB" 
                            },
                            { 
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                ), 
                                label: "Status", 
                                value: "Online" 
                            },
                        ].map(item => (
                            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ color: "#E95420", display: "flex", alignItems: "center", opacity: 0.8 }}>{item.icon}</span>
                                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", width: "70px" }}>{item.label}</span>
                                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontFamily: "monospace" }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>
                    © 2026 UbuntuLite · Created by <strong style={{ color: "rgba(255,255,255,0.35)" }}>Jawaan Santh</strong>
                </div>
            </div>

            {/* Right login panel */}
            <div className="login-right-panel" style={{
                width: "420px", display: "flex", flexDirection: "column",
                justifyContent: "center", padding: "60px 50px",
                background: "rgba(15,15,20,0.85)", backdropFilter: "blur(30px)",
                flexShrink: 0
            }}>
                <div style={{ marginBottom: "40px", animation: "fadeSlideUp 0.5s ease both" }}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        background: "rgba(233,84,32,0.1)", border: "2px solid rgba(233,84,32,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "24px",
                        boxShadow: "0 0 30px rgba(233,84,32,0.2)"
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E95420" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2 style={{ color: "white", fontSize: "26px", fontWeight: 700, margin: "0 0 6px" }}>Welcome back</h2>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 }}>Sign in to your session</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Username */}
                    <div className="login-input-group">
                        <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Username</label>

                        {/* User avatar cards */}
                        {extraUsers.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                                {[{ username: 'root', created: '' }, ...extraUsers].map(u => (
                                    <button
                                        key={u.username}
                                        type="button"
                                        onClick={() => { setUsername(u.username); setError(false); }}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                            background: username === u.username ? 'rgba(233,84,32,0.15)' : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${username === u.username ? 'rgba(233,84,32,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
                                            transition: 'all 0.2s', minWidth: 70,
                                        }}
                                    >
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: username === u.username ? 'rgba(233,84,32,0.3)' : 'rgba(255,255,255,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16, border: `1.5px solid ${username === u.username ? '#e95420' : 'rgba(255,255,255,0.1)'}`,
                                        }}>
                                            {u.username === 'root' ? '👑' : u.username[0].toUpperCase()}
                                        </div>
                                        <span style={{ color: username === u.username ? '#e95420' : 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, maxWidth: 70, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{u.username}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <input
                            className="login-field"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </div>

                    {/* Password */}
                    <div className="login-input-group">
                        <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                className={`login-field pw-field${error ? " error" : ""}`}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(false); }}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                                placeholder="Enter password"
                                autoFocus
                            />
                            <div className="pw-actions">
                                <button className="pw-toggle" type="button" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Hide" : "Show"}>
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        {error && <p style={{ color: "#ff4d6d", fontSize: "12px", margin: "8px 0 0", display: "flex", alignItems: "center", gap: "5px" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            Incorrect password. Please try again.
                        </p>}
                    </div>

                    {/* Login button */}
                    <div className="login-input-group" style={{ marginTop: "4px" }}>
                        <button className="login-btn-main" onClick={handleLogin} disabled={loading}>
                            {loading ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "4px" }}>
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>💡 Hint: Password is </span>
                        <code style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "6px" }}>ubuntu2026</code>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}
