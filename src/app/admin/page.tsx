"use client";

import React, { useState, useEffect } from "react";

interface FeedbackInfo {
    id: string;
    name: string;
    message: string;
    rating: number;
    time: string;
}

interface TerminalUserInfo {
    _id: string;
    name: string;
    timestamp: string;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [feedbacks, setFeedbacks] = useState<FeedbackInfo[]>([]);
    const [totalVisits, setTotalVisits] = useState<number>(0);
    const [terminalUsers, setTerminalUsers] = useState<TerminalUserInfo[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch("/api/feedbacks");
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchVisits = async () => {
        try {
            const res = await fetch("/api/visits");
            if (res.ok) {
                const data = await res.json();
                setTotalVisits(data.totalVisits || 0);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchTerminalUsers = async () => {
        try {
            const res = await fetch("/api/terminal-users");
            if (res.ok) {
                const data = await res.json();
                setTerminalUsers(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            // Initial fetch
            fetchFeedbacks();
            fetchVisits();
            fetchTerminalUsers();

            // Polling for real-time-ish updates
            const interval = setInterval(() => {
                fetchVisits();
                fetchTerminalUsers();
            }, 15000); // 15 seconds

            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "Jaws272006") {
            setIsAuthenticated(true);
        } else {
            alert("Incorrect password");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this feedback?")) {
            try {
                await fetch("/api/feedbacks", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                });
                fetchFeedbacks();
            } catch (err) {
                console.error("Failed to delete", err);
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center",
                background: "#08080a",
                fontFamily: "'Inter', sans-serif", overflow: "hidden", position: "relative"
            }}>
                {/* Background Blobs */}
                <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(233, 84, 32, 0.15) 0%, transparent 70%)", filter: "blur(60px)", borderRadius: "50%", animation: "floatBlob 10s ease-in-out infinite" }}></div>
                <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)", filter: "blur(60px)", borderRadius: "50%", animation: "floatBlob 12s ease-in-out infinite reverse" }}></div>
                
                <form onSubmit={handleLogin} style={{
                    background: "rgba(25, 25, 30, 0.5)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
                    padding: "48px", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5)",
                    display: "flex", flexDirection: "column", gap: "28px", width: "100%", maxWidth: "420px",
                    zIndex: 10, animation: "fadeScaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                    <style>{`
                        @keyframes floatBlob { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, 30px); } }
                        @keyframes fadeScaleUp { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                    `}</style>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ background: "linear-gradient(135deg, #E95420, #C94010)", width: "72px", height: "72px", borderRadius: "22px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 25px rgba(233,84,32,0.3)" }}>
                            <img src="/ubuntulite.png" alt="Logo" style={{ width: "40px", height: "40px" }} />
                        </div>
                        <h2 style={{ color: "white", margin: 0, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px" }}>Admin Portal</h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", marginTop: "8px" }}>Secure dashboard for UbuntuLite</p>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", paddingLeft: "4px" }}>Master Password</label>
                        <input
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(255,255,255,0.1)",
                                padding: "16px 20px", borderRadius: "14px", color: "white", outline: "none",
                                fontSize: "16px", transition: "all 0.2s ease", width: "100%",
                                boxShadow: "inset 0 4px 10px rgba(0,0,0,0.2)"
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = "rgba(233,84,32,0.5)"; e.currentTarget.style.background = "rgba(0,0,0,0.3)"; }}
                            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
                        />
                    </div>

                    <button type="submit" style={{
                        background: "linear-gradient(135deg, #E95420, #C94010)", color: "white", padding: "16px", border: "none", borderRadius: "14px",
                        cursor: "pointer", fontWeight: 700, fontSize: "16px", transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        boxShadow: "0 10px 25px rgba(233,84,32,0.3)", marginTop: "10px"
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 15px 35px rgba(233,84,32,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(233,84,32,0.3)"; }}
                    >
                        Access Dashboard
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#08080a", color: "white", fontFamily: "'Inter', sans-serif", display: "flex" }}>
            
            {/* Sidebar */}
            <div style={{ 
                width: sidebarOpen ? "280px" : "80px", 
                background: "rgba(15, 15, 18, 0.8)", 
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                display: "flex", 
                flexDirection: "column",
                padding: "32px 20px",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "sticky", top: 0, height: "100vh"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "48px", overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(135deg, #E95420, #C94010)", minWidth: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(233,84,32,0.2)" }}>
                        <img src="/ubuntulite.png" alt="U" style={{ width: "24px", height: "24px" }} />
                    </div>
                    {sidebarOpen && <span style={{ fontSize: "18px", fontWeight: 700, whiteSpace: "nowrap" }}>Admin Center</span>}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    <div style={{ 
                        padding: "12px 14px", borderRadius: "12px", background: "rgba(233, 84, 32, 0.12)", 
                        color: "#E95420", display: "flex", alignItems: "center", gap: "14px", fontWeight: 600, cursor: "pointer"
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
                        {sidebarOpen && <span>Dashboard</span>}
                    </div>
                </div>

                <button onClick={() => setIsAuthenticated(false)} style={{
                    background: "rgba(255, 255, 255, 0.03)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "14px", borderRadius: "14px", cursor: "pointer", fontWeight: 600, transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: "12px"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 50, 50, 0.1)"; e.currentTarget.style.color = "#ff4d4d"; e.currentTarget.style.borderColor = "rgba(255, 50, 50, 0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    {sidebarOpen && <span>Sign Out</span>}
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "48px 64px", overflowY: "auto", background: "radial-gradient(circle at top right, rgba(233, 84, 32, 0.05), transparent 40%)" }}>
                <header style={{ marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "36px", fontWeight: 800, letterSpacing: "-1px" }}>Overview</h1>
                        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "8px", fontSize: "16px" }}>Real-time statistics for UbuntuLite OS</p>
                    </div>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginBottom: "64px" }}>
                    
                    {/* Visitor Stats Card */}
                    <div style={{ 
                        background: "rgba(20, 20, 25, 0.6)", 
                        backdropFilter: "blur(40px)",
                        padding: "32px", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.06)", 
                        boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(0, 201, 255, 0.1)", filter: "blur(30px)", borderRadius: "50%" }}></div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div style={{ background: "rgba(0, 201, 255, 0.1)", padding: "10px", borderRadius: "12px", display: "flex" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C9FF" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>TOTAL VISITORS</span>
                        </div>
                        <div style={{ fontSize: "56px", fontWeight: 800, color: "white", display: "flex", alignItems: "baseline", gap: "8px" }}>
                            {totalVisits}
                            <span style={{ fontSize: "14px", color: "#00C9FF", fontWeight: 600 }}>Unique Sessions</span>
                        </div>
                    </div>

                    {/* Feedback Stats Card */}
                    <div style={{ 
                        background: "rgba(20, 20, 25, 0.6)", 
                        backdropFilter: "blur(40px)",
                        padding: "32px", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.06)", 
                        boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(255, 183, 94, 0.1)", filter: "blur(30px)", borderRadius: "50%" }}></div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div style={{ background: "rgba(255, 183, 94, 0.1)", borderRadius: "12px", display: "flex", padding: "10px" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFB75E" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>USER FEEDBACKS</span>
                        </div>
                        <div style={{ fontSize: "56px", fontWeight: 800, color: "white", display: "flex", alignItems: "baseline", gap: "8px" }}>
                            {feedbacks.length}
                            <span style={{ fontSize: "14px", color: "#FFB75E", fontWeight: 600 }}>Responses</span>
                        </div>
                    </div>

                    {/* Terminal Users Stats Card */}
                    <div style={{ 
                        background: "rgba(20, 20, 25, 0.6)", 
                        backdropFilter: "blur(40px)",
                        padding: "32px", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.06)", 
                        boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(233, 84, 32, 0.1)", filter: "blur(30px)", borderRadius: "50%" }}></div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div style={{ background: "rgba(233, 84, 32, 0.1)", borderRadius: "12px", display: "flex", padding: "10px" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E95420" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>TERMINAL USERS</span>
                        </div>
                        <div style={{ fontSize: "56px", fontWeight: 800, color: "white", display: "flex", alignItems: "baseline", gap: "8px" }}>
                            {terminalUsers.length}
                            <span style={{ fontSize: "14px", color: "#E95420", fontWeight: 600 }}>Registered Names</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
                    {/* Feedbacks Column */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>Recent Feedbacks</h2>
                            <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{feedbacks.length} total</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {feedbacks.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "64px", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                                    <p style={{ color: "rgba(255,255,255,0.3)" }}>No feedback messages found</p>
                                </div>
                            ) : (
                                feedbacks.map((fb) => (
                                    <div key={fb.id} style={{
                                        background: "rgba(25, 25, 30, 0.4)", backdropFilter: "blur(20px)",
                                        padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)",
                                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                        display: "flex", flexDirection: "column", gap: "16px"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(233,84,32,0.3)"; e.currentTarget.style.background = "rgba(25, 25, 30, 0.6)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(25, 25, 30, 0.4)"; }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(233,84,32,0.2), rgba(233,84,32,0.05))", border: "1px solid rgba(233,84,32,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px", color: "#E95420" }}>
                                                    {fb.name[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: "16px", color: "white" }}>{fb.name}</strong>
                                                    <div style={{ color: "#FFD700", fontSize: "11px", letterSpacing: "1.5px", marginTop: "2px" }}>
                                                        {"★".repeat(fb.rating || 5)}{"☆".repeat(5 - (fb.rating || 5))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(fb.id)} style={{
                                                background: "rgba(255, 60, 60, 0.1)", color: "#ff4d4d", border: "1px solid rgba(255, 60, 60, 0.1)",
                                                cursor: "pointer", transition: "all 0.2s", padding: "8px", borderRadius: "100px"
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.color = "white"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 60, 60, 0.1)"; e.currentTarget.style.color = "#ff4d4d"; }}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                        <p style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "16px", fontSize: "14px", lineHeight: "1.6", color: "rgba(255,255,255,0.8)", margin: 0, fontStyle: "italic" }}>
                                            &ldquo;{fb.message}&rdquo;
                                        </p>
                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textAlign: "right", fontWeight: 600, letterSpacing: "0.5px" }}>
                                            {fb.time}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Terminal Users Column */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>Terminal Active Names</h2>
                                <button 
                                    onClick={fetchTerminalUsers} 
                                    title="Refresh List"
                                    style={{ 
                                        background: "rgba(233, 84, 32, 0.1)", border: "none", 
                                        width: "28px", height: "28px", borderRadius: "8px", 
                                        cursor: "pointer", display: "flex", alignItems: "center", 
                                        justifyContent: "center", color: "#E95420", transition: "all 0.2s" 
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(233, 84, 32, 0.2)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(233, 84, 32, 0.1)"}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                                </button>
                            </div>
                            <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{terminalUsers.length} total</span>
                        </div>
                        <div style={{ 
                            background: "rgba(20, 20, 25, 0.4)", 
                            backdropFilter: "blur(40px)",
                            borderRadius: "28px", border: "1px solid rgba(255,255,255,0.06)",
                            overflow: "hidden"
                        }}>
                            {terminalUsers.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "64px", color: "rgba(255,255,255,0.2)" }}>
                                    <p>No user names recorded</p>
                                </div>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                            <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>USER NAME</th>
                                            <th style={{ textAlign: "right", padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>LOGIN DATE & TIME</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {terminalUsers.map((user, idx) => (
                                            <tr key={user._id} style={{ 
                                                borderBottom: idx === terminalUsers.length - 1 ? "none" : "1px solid rgba(255,255,255,0.03)",
                                                background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
                                            >
                                                <td style={{ padding: "16px 24px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div style={{ 
                                                            width: "32px", height: "32px", borderRadius: "10px", 
                                                            background: "linear-gradient(135deg, #E95420, #C94010)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: "14px", fontWeight: 800, color: "white", boxShadow: "0 4px 10px rgba(233,84,32,0.2)"
                                                        }}>
                                                            {user.name[0]?.toUpperCase() || "?"}
                                                        </div>
                                                        <span style={{ fontWeight: 600, fontSize: "15px", color: "rgba(255,255,255,0.9)" }}>{user.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                                                        {new Date(user.timestamp).toLocaleString(undefined, { 
                                                            month: 'short', 
                                                            day: 'numeric', 
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
