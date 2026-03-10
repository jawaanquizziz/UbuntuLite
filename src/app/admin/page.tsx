"use client";

import React, { useState, useEffect } from "react";

interface FeedbackInfo {
    id: string;
    name: string;
    message: string;
    rating: number;
    time: string;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [feedbacks, setFeedbacks] = useState<FeedbackInfo[]>([]);
    const [totalVisits, setTotalVisits] = useState<number>(0);

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

    useEffect(() => {
        if (isAuthenticated) {
            fetchFeedbacks();
            fetchVisits();
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
                height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(45deg, #1f0128, #E95420, #0a0a0a)", animation: "gradientBG 15s ease infinite", backgroundSize: "400% 400%",
                fontFamily: "'Inter', sans-serif"
            }}>
                <form onSubmit={handleLogin} style={{
                    background: "rgba(20, 20, 25, 0.45)", backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)",
                    padding: "40px", borderRadius: "24px", boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)",
                    display: "flex", flexDirection: "column", gap: "25px", width: "380px"
                }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <img src="/ubuntulite.png" alt="Logo" style={{ width: "60px", height: "60px", filter: "drop-shadow(0 4px 10px rgba(255,255,255,0.2))" }} />
                        <h2 style={{ color: "white", margin: 0, fontSize: "24px", fontWeight: 600 }}>Admin Access</h2>
                    </div>
                    <input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255,255,255,0.15)",
                            padding: "15px", borderRadius: "12px", color: "white", outline: "none",
                            fontSize: "16px", transition: "all 0.3s ease", boxShadow: "inset 0 2px 5px rgba(0,0,0,0.5)"
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#E95420"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(0,0,0,0.3)"; }}
                    />
                    <button type="submit" style={{
                        background: "#E95420", color: "white", padding: "15px", border: "none", borderRadius: "12px",
                        cursor: "pointer", fontWeight: "bold", fontSize: "16px", transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(233,84,32,0.4)"
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(233,84,32,0.6)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(233,84,32,0.4)"; }}
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0f0f13", color: "white", fontFamily: "'Inter', sans-serif", display: "flex" }}>
            
            {/* Sidebar */}
            <div style={{ 
                width: "260px", 
                background: "rgba(20, 20, 25, 0.95)", 
                borderRight: "1px solid rgba(255,255,255,0.05)",
                display: "flex", 
                flexDirection: "column",
                padding: "30px 20px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "50px" }}>
                    <img src="/ubuntulite.png" alt="UbuntuLite" style={{ width: "40px", height: "40px", filter: "drop-shadow(0 2px 8px rgba(255,255,255,0.2))" }} />
                    <span style={{ fontSize: "20px", fontWeight: "bold", background: "linear-gradient(135deg, #fff, #aaa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Admin Center</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <div style={{ 
                        padding: "12px 16px", borderRadius: "10px", background: "rgba(233, 84, 32, 0.15)", 
                        color: "#E95420", display: "flex", alignItems: "center", gap: "12px", fontWeight: 600, cursor: "pointer"
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </div>
                </div>

                <button onClick={() => setIsAuthenticated(false)} style={{
                    background: "rgba(255, 60, 60, 0.1)", color: "#ff4d4d", border: "1px solid rgba(255, 60, 60, 0.2)",
                    padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 60, 60, 0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 60, 60, 0.1)"}
                >
                    Sign Out
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "40px 60px", overflowY: "auto" }}>
                <h1 style={{ margin: "0 0 30px 0", fontSize: "32px", fontWeight: 700 }}>Overview</h1>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginBottom: "40px" }}>
                    
                    {/* Visitor Widget */}
                    <div style={{ 
                        background: "linear-gradient(145deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 25, 0.9))", 
                        padding: "25px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", 
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)", position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(0, 201, 255, 0.1)", filter: "blur(20px)", borderRadius: "50%" }}></div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}>TOTAL VISITORS</div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C9FF" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div style={{ fontSize: "42px", fontWeight: "bold", background: "linear-gradient(135deg, #00C9FF, #92FE9D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            {totalVisits}
                        </div>
                    </div>

                    {/* Feedback Widget */}
                    <div style={{ 
                        background: "linear-gradient(145deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 25, 0.9))", 
                        padding: "25px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", 
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)", position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255, 183, 94, 0.1)", filter: "blur(20px)", borderRadius: "50%" }}></div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}>TOTAL FEEDBACKS</div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFB75E" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div style={{ fontSize: "42px", fontWeight: "bold", background: "linear-gradient(135deg, #FFB75E, #ED8F03)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            {feedbacks.length}
                        </div>
                    </div>
                </div>

                <h2 style={{ margin: "0 0 20px 0", fontSize: "22px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Recent Feedbacks</h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
                    {feedbacks.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", gridColumn: "1 / -1" }}>
                            No feedbacks available yet.
                        </div>
                    ) : (
                        feedbacks.map((fb) => (
                            <div key={fb.id} style={{
                                background: "rgba(25, 25, 30, 0.6)",
                                padding: "25px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                display: "flex", flexDirection: "column", gap: "15px"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.4)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <strong style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>{fb.name}</strong>
                                        <span style={{ color: "#FFD700", fontSize: "14px", letterSpacing: "2px" }}>
                                            {"★".repeat(fb.rating || 5)}{"☆".repeat(5 - (fb.rating || 5))}
                                        </span>
                                    </div>
                                    <button onClick={() => handleDelete(fb.id)} style={{
                                        background: "transparent", color: "rgba(255, 77, 77, 0.6)", border: "none",
                                        cursor: "pointer", transition: "color 0.2s", padding: "5px"
                                    }}
                                        title="Delete Feedback"
                                        onMouseEnter={e => e.currentTarget.style.color = "#ff4d4d"}
                                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255, 77, 77, 0.6)"}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                                <div style={{ background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "10px", fontSize: "14px", lineHeight: "1.6", color: "rgba(255,255,255,0.85)", flex: 1 }}>
                                    "{fb.message}"
                                </div>
                                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textAlign: "right", marginTop: "auto" }}>
                                    {fb.time}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
