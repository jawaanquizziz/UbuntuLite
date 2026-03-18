"use client";

import React, { useState, useEffect } from "react";

export default function FullScreenPrompt() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show after a small delay once the component mounts (which is after boot)
        const timer = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    const enterFullScreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
        setShow(false);
    };

    if (!show || (typeof document !== 'undefined' && document.fullscreenElement)) return null;

    return (
        <div style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000000,
            background: "rgba(20, 20, 25, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "16px 24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            animation: "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            fontFamily: "'Inter', sans-serif"
        }}>
            <style>{`
                @keyframes slideDown {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E95420" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
                <span style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>
                    Enable immersive full screen mode?
                </span>
            </div>

            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button 
                    onClick={enterFullScreen}
                    style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #E95420, #C94010)",
                        color: "white",
                        border: "none",
                        padding: "10px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                    Enable
                </button>
                <button 
                    onClick={() => setShow(false)}
                    style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "10px",
                        borderRadius: "10px",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
}
