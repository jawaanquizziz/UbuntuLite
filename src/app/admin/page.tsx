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

    useEffect(() => {
        if (isAuthenticated) {
            fetchFeedbacks();
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
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e", fontFamily: "'Inter', sans-serif" }}>
                <form onSubmit={handleLogin} style={{
                    background: "rgba(25, 25, 35, 0.9)",
                    padding: "40px",
                    borderRadius: "20px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    width: "350px",
                    border: "1px solid rgba(255,255,255,0.05)"
                }}>
                    <h2 style={{ color: "white", textAlign: "center", margin: 0 }}>Admin Login</h2>
                    <input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "12px",
                            borderRadius: "10px",
                            color: "white",
                            outline: "none"
                        }}
                    />
                    <button type="submit" style={{
                        background: "linear-gradient(135deg, #ff007f, #7f00ff)",
                        color: "white",
                        padding: "12px",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}>
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "white", fontFamily: "'Inter', sans-serif", padding: "40px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h1 style={{ margin: 0, fontSize: "28px", background: "linear-gradient(135deg, #ff007f, #7f00ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Feedback Management Dashboard
                    </h1>
                    <button onClick={() => setIsAuthenticated(false)} style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600
                    }}>
                        Logout
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {feedbacks.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                            No feedbacks available.
                        </div>
                    ) : (
                        feedbacks.map((fb) => (
                            <div key={fb.id} style={{
                                background: "rgba(25, 25, 35, 0.9)",
                                padding: "20px",
                                borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,0.05)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                        <strong style={{ fontSize: "16px" }}>{fb.name}</strong>
                                        <span style={{ color: "#FFD700", fontSize: "14px" }}>
                                            {"★".repeat(fb.rating || 5)}{"☆".repeat(5 - (fb.rating || 5))}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{fb.time}</span>
                                        <button onClick={() => handleDelete(fb.id)} style={{
                                            background: "rgba(255, 77, 77, 0.1)",
                                            color: "#ff4d4d",
                                            border: "1px solid rgba(255, 77, 77, 0.3)",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                            transition: "all 0.2s"
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 77, 77, 0.2)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 77, 77, 0.1)"}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "8px", fontSize: "14px", lineHeight: "1.5" }}>
                                    {fb.message}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
