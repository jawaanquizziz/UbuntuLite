"use client";

import React, { useState } from "react";

interface FeedbackInfo {
    id: number;
    name: string;
    message: string;
    time: string;
}

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    // Unique message instead of duplicated ones
    const [feedbacks, setFeedbacks] = useState<FeedbackInfo[]>([
        { id: 1, name: "System", message: "Welcome to this OS! Drop us a quick note.", time: "Just now" }
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const newFeedback: FeedbackInfo = {
            id: Date.now(),
            name: "You",
            message: newMessage,
            time: "Just now"
        };

        setFeedbacks([...feedbacks, newFeedback]);
        setNewMessage("");
    };

    return (
        <div style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            zIndex: 9999, // Float above applications
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
        }}>
            {/* Pop-up feedback pane */}
            {isOpen && (
                <div style={{
                    width: "320px",
                    height: "400px",
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
                        <span>Feedback / Chat</span>
                        <span onClick={() => setIsOpen(false)} style={{ cursor: "pointer", opacity: 0.8 }}>✕</span>
                    </div>

                    <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {feedbacks.map((fb) => (
                            <div key={fb.id} style={{
                                alignSelf: fb.name === "You" ? "flex-end" : "flex-start",
                                background: fb.name === "You" ? "linear-gradient(135deg, #ff007f, #7f00ff)" : "rgba(255,255,255,0.1)",
                                color: "white",
                                padding: "10px 14px",
                                borderRadius: fb.name === "You" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", // Circular/bubble corners
                                maxWidth: "85%",
                                fontSize: "13px",
                                lineHeight: "1.4",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                            }}>
                                {fb.name !== "You" && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", marginBottom: "4px", fontWeight: 600 }}>{fb.name}</div>}
                                <div>{fb.message}</div>
                                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", marginTop: "4px", textAlign: "right" }}>{fb.time}</div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{
                        padding: "12px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        gap: "8px",
                        background: "rgba(0,0,0,0.2)"
                    }}>
                        <input
                            type="text"
                            placeholder="Type something..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "20px",
                                padding: "8px 14px",
                                color: "white",
                                fontSize: "13px",
                                outline: "none"
                            }}
                        />
                        <button type="submit" style={{
                            background: "linear-gradient(135deg, #ff007f, #7f00ff)",
                            border: "none",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            opacity: newMessage ? 1 : 0.5,
                            transition: "all 0.2s"
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Circular trigger in the bottom right */}
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
