"use client";

import React, { useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";

export default function SettingsApp({ onClose, onMinimize, onMaximize, isMaximized, isMinimized, zIndex, onFocus, currentBg, onBgChange, terminalUser, setTerminalUser, terminalHost, setTerminalHost }: any) {
    const [activeTab, setActiveTab] = useState("appearance");
    const { position, handleMouseDown, isDragging } = useDraggable(isMaximized);

    const backgrounds = [
        { id: "bg1", name: "Ubuntu Default", value: "linear-gradient(135deg, #dd4814, #2c001e)" },
        { id: "bg2", name: "Ocean Dark", value: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)" },
        { id: "bg3", name: "Purple Rain", value: "linear-gradient(135deg, #4b1248, #f0c27b)" },
        { id: "bg4", name: "Mint Leaf", value: "linear-gradient(135deg, #00b09b, #96c93d)" },
        { id: "bg5", name: "Deep Space", value: "#111111" },
        { id: "bg6", name: "3D Matrix", value: "ANIMATED_MATRIX" },
        { id: "bg7", name: "3D Particles", value: "ANIMATED_PARTICLES" }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onBgChange(`url(${event.target.result})`);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            className={`settings - window dark - mode ${isMaximized ? "maximized" : ""} `}
            style={{
                opacity: isMinimized ? 0 : 1,
                pointerEvents: isMinimized ? "none" : "auto",
                zIndex: zIndex || 10,
                display: "flex",
                flexDirection: "column",
                position: "absolute",
                width: isMaximized ? "100%" : "600px",
                height: isMaximized ? "100%" : "450px",
                backgroundColor: "#222",
                borderRadius: isMaximized ? "0" : "8px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                overflow: "hidden",
                border: "1px solid #444",
                top: isMaximized ? "0" : "auto",
                left: isMaximized ? "0" : "auto",
                transform: isMaximized ? "none" : `translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? "none" : "transform 0.1s"
            }}
            onClick={onFocus}
        >
            <div
                className="terminal-header"
                style={{ flexShrink: 0, cursor: isMaximized ? "default" : "grab" }}
                onMouseDown={handleMouseDown}
            >
                <div className="terminal-buttons">
                    <span className="close" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#600" strokeWidth="3" style={{ width: '8px', opacity: 0 }} className="hover:opacity-100"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                    <span className="minimize" onClick={onMinimize} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#864" strokeWidth="3" style={{ width: '8px', opacity: 0 }} className="hover:opacity-100"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </span>
                    <span className="maximize" onClick={onMaximize} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#151" strokeWidth="3" style={{ width: '8px', opacity: 0 }} className="hover:opacity-100"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                    </span>
                </div>
                <div className="terminal-title">Settings</div>
            </div>

            <div style={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
                {/* Apps sidebar */}
                <div style={{ width: "200px", backgroundColor: "#333", borderRight: "1px solid #444", padding: "10px 0" }}>
                    <div
                        style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: activeTab === "appearance" ? "#e95420" : "transparent", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}
                        onClick={() => setActiveTab("appearance")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.94-5.94M2 12h10M12 2v10M12 12l8.66 5"></path></svg>
                        Appearance
                    </div>
                    <div
                        style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: activeTab === "terminal" ? "#e95420" : "transparent", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}
                        onClick={() => setActiveTab("terminal")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                        Terminal Output
                    </div>
                    <div
                        style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: activeTab === "network" ? "#e95420" : "transparent", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}
                        onClick={() => setActiveTab("network")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                        Network
                    </div>
                    <div
                        style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: activeTab === "about" ? "#e95420" : "transparent", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}
                        onClick={() => setActiveTab("about")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        About Node
                    </div>
                </div>

                {/* Main Content Pane */}
                <div style={{ flexGrow: 1, padding: "20px", color: "white", overflowY: "auto" }}>
                    {activeTab === "appearance" && (
                        <div>
                            <h2 style={{ borderBottom: "1px solid #555", paddingBottom: "10px", marginBottom: "20px" }}>Background</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "15px" }}>
                                {backgrounds.map(bg => (
                                    <div
                                        key={bg.id}
                                        onClick={() => onBgChange(bg.value)}
                                        style={{
                                            height: "80px",
                                            borderRadius: "6px",
                                            background: bg.value,
                                            cursor: "pointer",
                                            border: currentBg === bg.value ? "2px solid #fff" : "2px solid transparent",
                                            boxShadow: currentBg === bg.value ? "0 0 10px rgba(255,255,255,0.3)" : "none",
                                            position: "relative"
                                        }}
                                        title={bg.name}
                                    >
                                        <div style={{ position: "absolute", bottom: "5px", left: "5px", fontSize: "0.75rem", backgroundColor: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: "4px" }}>
                                            {bg.name}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ marginTop: "30px", marginBottom: "10px", fontSize: "1.1rem", borderBottom: "1px solid #555", paddingBottom: "5px" }}>Upload Custom Wallpaper</h3>
                            <div style={{ backgroundColor: "#111", padding: "15px", borderRadius: "6px", border: "1px solid #444" }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ color: "#fff", width: "100%" }}
                                />
                                <p style={{ margin: "10px 0 0 0", color: "#aaa", fontSize: "0.85rem" }}>
                                    Select an image from your computer to set it as your desktop background.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "terminal" && (
                        <div>
                            <h2 style={{ borderBottom: "1px solid #555", paddingBottom: "10px", marginBottom: "20px" }}>Terminal Customization</h2>
                            <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "5px", color: "#ccc" }}>Username</label>
                                    <input
                                        type="text"
                                        value={terminalUser}
                                        onChange={(e) => setTerminalUser(e.target.value)}
                                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#111", color: "#fff" }}
                                        placeholder="e.g. root"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "5px", color: "#ccc" }}>Hostname</label>
                                    <input
                                        type="text"
                                        value={terminalHost}
                                        onChange={(e) => setTerminalHost(e.target.value)}
                                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#111", color: "#fff" }}
                                        placeholder="e.g. ubuntu"
                                    />
                                </div>
                            </div>
                            <div style={{ backgroundColor: "#111", padding: "15px", borderRadius: "6px", border: "1px solid #444" }}>
                                <p style={{ margin: "0 0 10px 0", color: "#ccc", fontSize: "0.9rem" }}>Preview:</p>
                                <span style={{ color: "#4ade80", fontWeight: "bold" }}>{terminalUser}@{terminalHost}</span>:<span style={{ color: "#60a5fa", fontWeight: "bold" }}>~</span>$
                            </div>
                        </div>
                    )}

                    {activeTab === "network" && (
                        <div>
                            <h2 style={{ borderBottom: "1px solid #555", paddingBottom: "10px", marginBottom: "20px" }}>Network Status</h2>
                            <div style={{ backgroundColor: "#111", padding: "15px", borderRadius: "6px", fontFamily: "monospace" }}>
                                <p><strong style={{ color: "#0f0" }}>Status:</strong> Connected</p>
                                <p><strong style={{ color: "#e95420" }}>IP Address:</strong> 192.168.1.104</p>
                                <p><strong style={{ color: "#e95420" }}>Subnet Mask:</strong> 255.255.255.0</p>
                                <p><strong style={{ color: "#e95420" }}>Router:</strong> 192.168.1.1</p>
                                <p><strong style={{ color: "#e95420" }}>DNS:</strong> 8.8.8.8, 1.1.1.1</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "about" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e95420" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "20px" }}>
                                <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
                            </svg>
                            <h2 style={{ margin: "0 0 10px 0" }}>UbuntuLite Simulator</h2>
                            <p style={{ color: "#aaa", marginBottom: "5px" }}>Version 2.0 (Next.js Edition)</p>
                            <p style={{ color: "#aaa", textAlign: "center", maxWidth: "80%" }}>
                                A simulated web terminal environment designed for practicing Linux commands and navigating a mocked file system seamlessly using React and Next.js.
                            </p>
                            <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #444", width: "80%", textAlign: "center" }}>
                                <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "1px", marginBottom: "4px" }}>
                                    &copy; 2026 UbuntuLite <span style={{ color: "#e95420" }}>|</span> Jawaan
                                </p>
                                <p style={{ color: "#888", fontSize: "0.8rem" }}>All Rights Reserved. Professional Edition.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
