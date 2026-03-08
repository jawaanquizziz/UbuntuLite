"use client";

import React, { useState, useEffect } from "react";

interface FeedbackInfo {
    id: string;
    name: string;
    message: string;
    rating: number;
    time: string;
}

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbacks, setFeedbacks] = useState<FeedbackInfo[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [rating, setRating] = useState(5);
    const [userNameInput, setUserNameInput] = useState("");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("ubt_feedback_name");
            if (stored && !stored.startsWith("Guest_")) {
                setUserName(stored);
            }
        }
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch("/api/feedbacks");
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data.length ? data : [{
                    id: "1", name: "System", message: "No reviews yet. Be the first to leave one!", rating: 5, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchFeedbacks();
            const interval = setInterval(fetchFeedbacks, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleSetName = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userNameInput.trim()) return;
        setUserName(userNameInput.trim());
        localStorage.setItem("ubt_feedback_name", userNameInput.trim());
    };

    const handleSignOut = () => {
        setUserName("");
        localStorage.removeItem("ubt_feedback_name");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !userName) return;

        // Check for URLs, domains, or IP addresses
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-zA-Z0-9-]+\.(com|org|net|io|edu|gov|uk|co|us)\b)/i;
        if (urlRegex.test(newMessage)) {
            alert("Adding links is not allowed. Please enter text only.");
            return;
        }

        const msg = newMessage;
        const currentRating = rating;

        setNewMessage(""); // Optimistic clear
        setRating(5);

        const newFeedback: FeedbackInfo = {
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            name: userName,
            message: msg,
            rating: currentRating,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setFeedbacks(prev => {
            const updated = prev[0]?.id === "1" ? [] : [...prev];
            return [...updated, newFeedback].slice(-100);
        });

        try {
            await fetch("/api/feedbacks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: userName, message: msg, rating: currentRating })
            });
            fetchFeedbacks();
        } catch (err) {
            console.error("Failed to post feedback", err);
        }
    };

    const renderStars = (count: number) => {
        if (count === undefined) return null;
        return <span style={{ color: "#FFD700" }}>{"★".repeat(count)}{"☆".repeat(5 - count)}</span>;
    };

    return (
        <div style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
        }}>
            {isOpen && (
                <div style={{
                    width: "350px",
                    height: "450px",
                    background: "rgba(20, 20, 25, 0.85)",
                    backdropFilter: "blur(15px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                    marginBottom: "15px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    fontFamily: "'Inter', sans-serif"
                }}>
                    <div style={{
                        padding: "16px 20px",
                        background: "linear-gradient(135deg, #1f1c2c, #928DAB)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "15px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255,255,255,0.1)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span>Reviews & Feedback</span>
                            {userName && (
                                <span
                                    onClick={handleSignOut}
                                    style={{ fontSize: "11px", fontWeight: "normal", background: "rgba(0,0,0,0.2)", padding: "3px 8px", borderRadius: "10px", cursor: "pointer", opacity: 0.8 }}
                                    title="Change Name"
                                >
                                    {userName} ✎
                                </span>
                            )}
                        </div>
                        <span onClick={() => setIsOpen(false)} style={{ cursor: "pointer", opacity: 0.8, fontSize: "16px" }}>✕</span>
                    </div>

                    {!userName ? (
                        <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "15px" }}>
                            <div style={{ color: "white", textAlign: "center", fontSize: "14px", lineHeight: "1.5" }}>
                                Welcome to User Reviews! <br /> Please enter your name to post a review or message.
                            </div>
                            <form onSubmit={handleSetName} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userNameInput}
                                    onChange={e => setUserNameInput(e.target.value)}
                                    style={{
                                        background: "rgba(255,255,255,0.1)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        borderRadius: "10px",
                                        padding: "12px 14px",
                                        color: "white",
                                        fontSize: "14px",
                                        outline: "none",
                                        width: "100%"
                                    }}
                                />
                                <button type="submit" style={{
                                    background: "linear-gradient(135deg, #ff007f, #7f00ff)",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    color: "white",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "opacity 0.2s",
                                    opacity: userNameInput.trim() ? 1 : 0.5
                                }}>
                                    Continue
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                                {feedbacks.map((fb) => (
                                    <div key={fb.id} style={{
                                        alignSelf: fb.name === userName ? "flex-end" : "flex-start",
                                        background: fb.name === userName ? "linear-gradient(135deg, #ff007f, #7f00ff)" : "rgba(255,255,255,0.1)",
                                        color: "white",
                                        padding: "12px 14px",
                                        borderRadius: fb.name === userName ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                        maxWidth: "90%",
                                        fontSize: "13.5px",
                                        lineHeight: "1.4",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
                                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>
                                                {fb.name === userName ? "You" : fb.name}
                                            </span>
                                            {fb.rating !== undefined && (
                                                <span style={{ fontSize: "12px", marginLeft: "8px" }}>
                                                    {renderStars(fb.rating)}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ wordBreak: "break-word" }}>{fb.message}</div>
                                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "6px" }}>
                                            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", textAlign: "right" }}>{fb.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} style={{
                                padding: "12px",
                                borderTop: "1px solid rgba(255,255,255,0.1)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                background: "rgba(0,0,0,0.2)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "5px" }}>
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Your Rating:</span>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                onClick={() => setRating(star)}
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: "18px",
                                                    color: star <= rating ? "#FFD700" : "rgba(255,255,255,0.2)"
                                                }}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        type="text"
                                        placeholder="Write your review or feedback..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        style={{
                                            flex: 1,
                                            background: "rgba(255,255,255,0.1)",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            borderRadius: "20px",
                                            padding: "10px 14px",
                                            color: "white",
                                            fontSize: "13px",
                                            outline: "none"
                                        }}
                                    />
                                    <button type="submit" style={{
                                        background: "linear-gradient(135deg, #ff007f, #7f00ff)",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "38px",
                                        height: "38px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        opacity: newMessage.trim() ? 1 : 0.5,
                                        transition: "all 0.2s"
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "60px",
                    height: "60px",
                    background: "linear-gradient(135deg, #ff007f, #7f00ff)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(255, 0, 127, 0.5)",
                    transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                )}
            </div>
        </div>
    );
}
