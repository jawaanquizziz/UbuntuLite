"use client";

import React, { useEffect, useState } from "react";

const bootLines = [
    "[ OK ] Started Show Plymouth Boot Screen.",
    "[ OK ] Reached target Paths.",
    "[ OK ] Reached target Basic System.",
    "       Starting System Initialization...",
    "[ OK ] Started D-Bus System Message Bus.",
    "[ OK ] Started Network Manager.",
    "[ OK ] Reached target Network.",
    "       Starting Initialize hardware monitoring sensors...",
    "[ OK ] Started Authorization Manager.",
    "[ OK ] Started Light Display Manager.",
    "[ OK ] Reached target Graphical Interface.",
    "Welcome to Web OS Simulator!"
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
    const [lines, setLines] = useState<string[]>([]);
    const [showLogo, setShowLogo] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        let index = 0;

        // Rapidly print lines
        const printInterval = setInterval(() => {
            if (index < bootLines.length) {
                setLines(prev => [...prev, bootLines[index]]);
                index++;
            } else {
                clearInterval(printInterval);
                // Show logo after text is done
                setTimeout(() => {
                    setShowLogo(true);

                    // Fade out screen after showing logo for a bit
                    setTimeout(() => {
                        setFadeOut(true);

                        // Call complete after fade
                        setTimeout(() => {
                            onComplete();
                        }, 800);
                    }, 1500);
                }, 500);
            }
        }, 120);

        return () => clearInterval(printInterval);
    }, [onComplete]);

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "#000",
            color: "#ccc",
            fontFamily: "monospace",
            fontSize: "14px",
            zIndex: 999999,
            padding: "20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.8s ease-in-out",
            pointerEvents: "none"
        }}>
            {/* Terminal output */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                {!showLogo && lines.map((line, i) => (
                    <div key={i} style={{
                        margin: "2px 0",
                        color: line?.includes("[ OK ]") ? "#fff" : "#ccc"
                    }}>
                        {line?.replace("[ OK ]", "") || ""}
                        {line?.includes("[ OK ]") && (
                            <span style={{ color: "#4ade80", float: "left", marginRight: "10px" }}>[  OK  ]</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Centered Logo Transition */}
            {showLogo && (
                <div style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                    animation: "fadeIn 0.5s ease"
                }}>
                    <svg
                        viewBox="0 0 24 24"
                        width="80"
                        height="80"
                        fill="#e95420"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10C22 6.48 17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8 4.41 0 8 3.59 8 8 0 4.41-3.59 8-8 8zm-1-13h2v4h-2zm0 6h2v2h-2z" />
                    </svg>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", backgroundColor: "#fff", borderRadius: "50%", animation: "pulse 1s infinite alternate" }}></div>
                        <div style={{ width: "8px", height: "8px", backgroundColor: "#fff", borderRadius: "50%", animation: "pulse 1s infinite alternate 0.2s" }}></div>
                        <div style={{ width: "8px", height: "8px", backgroundColor: "#fff", borderRadius: "50%", animation: "pulse 1s infinite alternate 0.4s" }}></div>
                        <div style={{ width: "8px", height: "8px", backgroundColor: "#fff", borderRadius: "50%", animation: "pulse 1s infinite alternate 0.6s" }}></div>
                        <div style={{ width: "8px", height: "8px", backgroundColor: "#fff", borderRadius: "50%", animation: "pulse 1s infinite alternate 0.8s" }}></div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from {opacity: 0; transform: translate(-50%, -40%); }
                    to {opacity: 1; transform: translate(-50%, -50%); }
                }
                @keyframes pulse {
                    from {opacity: 0.3; transform: scale(0.8); }
                    to {opacity: 1; transform: scale(1.2); }
                }
            `}} />
        </div>
    );
}
