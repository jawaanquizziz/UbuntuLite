"use client";

import React from "react";

export default function SystemCoreWidget() {
    return (
        <div style={{
            position: "absolute",
            top: "80px",
            right: "50px",
            width: "80px",
            height: "80px",
            perspective: "800px",
            zIndex: 1,
            pointerEvents: "none"
        }}>
            <style>{`
                @keyframes spin3D {
                    from { transform: rotateX(0deg) rotateY(0deg); }
                    to { transform: rotateX(360deg) rotateY(360deg); }
                }
                .core-cube {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    animation: spin3D 10s infinite linear;
                }
                .core-face {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background: rgba(0, 255, 204, 0.05);
                    border: 1px solid rgba(0, 255, 204, 0.8);
                    box-shadow: 0 0 15px rgba(0,255,204,0.3), inset 0 0 15px rgba(0,255,204,0.3);
                }
                .front  { transform: translateZ(40px); }
                .back   { transform: rotateY(180deg) translateZ(40px); }
                .right  { transform: rotateY(90deg) translateZ(40px); }
                .left   { transform: rotateY(-90deg) translateZ(40px); }
                .top    { transform: rotateX(90deg) translateZ(40px); }
                .bottom { transform: rotateX(-90deg) translateZ(40px); }
            `}</style>
            <div className="core-cube">
                <div className="core-face front" />
                <div className="core-face back" />
                <div className="core-face right" />
                <div className="core-face left" />
                <div className="core-face top" />
                <div className="core-face bottom" />
            </div>

            <div style={{
                position: "absolute",
                bottom: "-30px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "#00ffcc",
                fontSize: "11px",
                fontFamily: "monospace",
                letterSpacing: "2px",
                textShadow: "0 0 8px #00ffcc",
                whiteSpace: "nowrap"
            }}>SYS.CORE</div>
        </div>
    );
}
