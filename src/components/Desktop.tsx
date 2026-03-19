"use client";

import React, { useState, useEffect } from "react";
import TerminalApp from "./TerminalApp";
import FolderExplorer from "./FolderExplorer";
import SettingsApp from "./SettingsApp";
import TextEditorApp from "./TextEditorApp";
import AnimatedBackground from "./AnimatedBackground";
import CalculatorApp from "./CalculatorApp";
import TicTacToeApp from "./TicTacToeApp";
import FeedbackWidget from "./FeedbackApp";
import BootScreen from "./BootScreen";
import FullScreenPrompt from "./FullScreenPrompt";
import { loadFs } from "@/lib/MockFs";

function TopBar({ onLogout, onReboot, onSleep, activeName }: { onLogout: () => void, onReboot: () => void, onSleep: () => void, activeName?: string }) {
    const [now, setNow] = useState(new Date());
    const [powerMenuOpen, setPowerMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setPowerMenuOpen(false);
        if (powerMenuOpen) {
            window.addEventListener("click", handleClickOutside);
        }
        return () => window.removeEventListener("click", handleClickOutside);
    }, [powerMenuOpen]);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    return (
        <div style={{
            width: "100%", height: "32px", flexShrink: 0,
            background: "rgba(15, 15, 20, 0.82)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center",
            padding: "0 8px",
            fontFamily: "'Inter', 'Ubuntu', 'Segoe UI', sans-serif",
            fontSize: "13px", color: "rgba(255,255,255,0.92)",
            userSelect: "none", zIndex: 200,
            boxShadow: "0 1px 20px rgba(0,0,0,0.4)",
        }}>
            {/* Left: Logo + Activities */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/ubuntulite.png" alt="UbuntuLite" style={{ width: "18px", height: "18px", filter: "drop-shadow(0 0 5px rgba(233,84,32,0.7))" }} />
                <span style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.03em", color: "rgba(255,255,255,0.9)", display: typeof window !== 'undefined' && window.innerWidth < 480 ? 'none' : 'inline' }}>
                    {activeName ? `${activeName} Workspace` : "Activities"}
                </span>
            </div>

            {/* Center: date + clock pill */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                {isMounted ? (
                    <>
                        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: 500 }}>
                            {dayName}, {monthName} {date}
                        </span>
                        <span style={{
                            fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em",
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            padding: "2px 12px", borderRadius: "20px",
                            color: "white",
                        }}>
                            {hours}:{minutes}
                        </span>
                    </>
                ) : (
                    <span style={{ color: "transparent" }}>Loading...</span>
                )}
            </div>

            {/* Right: system tray icons & Power */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
                {/* Wifi */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                </svg>
                {/* Battery */}
                <svg width="18" height="12" viewBox="0 0 24 14" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8">
                    <rect x="1" y="2" width="18" height="10" rx="2" /><path d="M20 5.5v3" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="2.5" y="3.5" width="12" height="7" rx="1" fill="rgba(150,255,150,0.7)" stroke="none" />
                </svg>
                {/* Volume */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
                
                {/* Power button */}
                <div 
                    onClick={(e) => { e.stopPropagation(); setPowerMenuOpen(!powerMenuOpen); }}
                    style={{ 
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "4px", borderRadius: "4px", transition: "background 0.2s",
                        background: powerMenuOpen ? "rgba(255,255,255,0.1)" : "transparent"
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff5f57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
                    </svg>
                </div>

                {/* Power Menu Dropdown */}
                {powerMenuOpen && (
                    <div style={{
                        position: "absolute", top: "35px", right: "0",
                        width: "180px", background: "rgba(30, 30, 35, 0.95)",
                        backdropFilter: "blur(20px)", borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        padding: "8px 0", zIndex: 300,
                        overflow: "hidden", animation: "powerMenuFade 0.15s ease-out"
                    }}>
                        <style>{`
                            @keyframes powerMenuFade {
                                from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                                to { opacity: 1; transform: translateY(0) scale(1); }
                            }
                            .power-item:hover { background: rgba(233, 84, 32, 0.2) !important; color: #fff !important; }
                        `}</style>
                        <button 
                            className="power-item"
                            onClick={() => {
                                setPowerMenuOpen(false);
                                onLogout(); // Directly to login page
                            }}
                            style={{
                                width: "100%", padding: "10px 16px", background: "none", border: "none",
                                color: "rgba(255,255,255,0.8)", textAlign: "left", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "10px", fontSize: "13px",
                                fontWeight: 500, transition: "all 0.2s"
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Sleep (Lock)
                        </button>
                        <button 
                            className="power-item"
                            onClick={() => {
                                setPowerMenuOpen(false);
                                onReboot(); // Directly to login page
                            }}
                            style={{
                                width: "100%", padding: "10px 16px", background: "none", border: "none",
                                color: "rgba(255,255,255,0.8)", textAlign: "left", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "10px", fontSize: "13px",
                                fontWeight: 500, transition: "all 0.2s"
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff5f57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" /></svg>
                            Power Off
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ScreenSaver({ onWake }: { onWake: () => void }) {
    const [time, setTime] = useState(new Date());
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const id = setInterval(() => setTime(new Date()), 1000);
        const handleWake = () => onWake();
        window.addEventListener("click", handleWake);
        window.addEventListener("keydown", handleWake);
        return () => {
            clearInterval(id);
            window.removeEventListener("click", handleWake);
            window.removeEventListener("keydown", handleWake);
        };
    }, [onWake]);

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "#000", zIndex: 999999, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "none"
        }}>
            <div style={{ 
                fontSize: "120px", fontWeight: 800, color: "rgba(255,255,255,0.1)", 
                letterSpacing: "-0.05em", fontFamily: "'Inter', sans-serif",
                display: "flex", gap: "20px", animation: "floatTime 10s ease-in-out infinite"
            }}>
                <style>{`
                    @keyframes floatTime {
                        0%, 100% { transform: translateY(0) scale(1.0); }
                        50% { transform: translateY(-30px) scale(1.05); }
                    }
                `}</style>
                {isMounted ? (
                    <>
                        <span>{hours}</span>
                        <span style={{ color: "#E95420" }}>:</span>
                        <span>{minutes}</span>
                        <span style={{ fontSize: "40px", alignSelf: "flex-end", marginBottom: "30px", opacity: 0.5 }}>{seconds}</span>
                    </>
                ) : (
                    <span style={{ color: "transparent" }}>00:00:00</span>
                )}
            </div>
            <div style={{ 
                marginTop: "40px", color: "rgba(255,255,255,0.3)", fontSize: "18px", 
                letterSpacing: "0.2em", fontWeight: 500, textTransform: "uppercase" 
            }}>
                UbuntuLite Sleep Mode
            </div>
            <div style={{ 
                position: "absolute", bottom: "40px", color: "rgba(255,255,255,0.2)", fontSize: "14px" 
            }}>
                Click any key to wake up
            </div>
        </div>
    );
}

type DesktopAction = "open-terminal" | "open-home" | "toggle-icons" | "open-settings" | "toggle-fullscreen";

export default function Desktop({ initialUser = "root", onLogout, onReboot }: { initialUser?: string, onLogout: () => void, onReboot: () => void }) {
    const [terminalState, setTerminalState] = useState({ open: false, minimized: false, maximized: false, zIndex: 10 });
    const [folderState, setFolderState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [settingsState, setSettingsState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [editorState, setEditorState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [ticTacToeState, setTicTacToeState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [calculatorState, setCalculatorState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [editorFilePath, setEditorFilePath] = useState("");
    const [desktopBg, setDesktopBg] = useState("linear-gradient(135deg, #dd4814, #2c001e)");
    const [terminalUser, setTerminalUser] = useState(initialUser);
    const [terminalHost, setTerminalHost] = useState("ubuntu");
    const [terminalTextColor, setTerminalTextColor] = useState("#ffffff");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isBooting, setIsBooting] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [desktopCtx, setDesktopCtx] = useState<{ x: number, y: number } | null>(null);
    const [showDesktopIcons, setShowDesktopIcons] = useState(true);
    const [activeName, setActiveName] = useState("");

    useEffect(() => {
        const updateName = () => {
            const name = localStorage.getItem("ubuntulite_terminal_name");
            if (name) setActiveName(name);
        };
        updateName();
        window.addEventListener("ubuntulite_name_update", updateName);
        return () => window.removeEventListener("ubuntulite_name_update", updateName);
    }, []);

    React.useEffect(() => {
        const closeCtx = () => setDesktopCtx(null);
        window.addEventListener("click", closeCtx);
        return () => window.removeEventListener("click", closeCtx);
    }, []);

    React.useEffect(() => {
        loadFs();
        const savedBg = localStorage.getItem("ubuntu_desktopBg");
        const savedUser = localStorage.getItem("ubuntu_terminalUser");
        const savedHost = localStorage.getItem("ubuntu_terminalHost");
        const savedColor = localStorage.getItem("ubuntu_terminalTextColor");
        const savedShowIcons = localStorage.getItem("ubuntu_showDesktopIcons");
        if (savedBg) setDesktopBg(savedBg);
        if (savedUser) setTerminalUser(savedUser);
        if (savedHost) setTerminalHost(savedHost);
        if (savedColor) setTerminalTextColor(savedColor);
        if (savedShowIcons !== null) setShowDesktopIcons(savedShowIcons === "true");
        setIsLoaded(true);
    }, []);

    React.useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("ubuntu_desktopBg", desktopBg);
            localStorage.setItem("ubuntu_terminalUser", terminalUser);
            localStorage.setItem("ubuntu_terminalHost", terminalHost);
            localStorage.setItem("ubuntu_terminalTextColor", terminalTextColor);
            localStorage.setItem("ubuntu_showDesktopIcons", String(showDesktopIcons));
        }
    }, [desktopBg, terminalUser, terminalHost, terminalTextColor, showDesktopIcons, isLoaded]);

    const handleDesktopContextAction = (action: DesktopAction) => {
        setDesktopCtx(null);
        switch (action) {
            case "open-terminal":
                if (!terminalState.open || terminalState.minimized) {
                    setTerminalState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
                    bringToFront("terminal");
                }
                break;
            case "open-home":
                if (!folderState.open || folderState.minimized) {
                    setFolderState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
                    bringToFront("folder");
                }
                break;
            case "toggle-icons":
                setShowDesktopIcons(prev => !prev);
                break;
            case "open-settings":
                if (!settingsState.open || settingsState.minimized) {
                    setSettingsState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
                    bringToFront("settings");
                }
                break;
            case "toggle-fullscreen":
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
                break;
        }
    };

    const bringToFront = (app: 'terminal' | 'folder' | 'settings' | 'editor' | 'tictactoe' | 'calculator') => {
        const reset = { terminal: 10, folder: 10, settings: 10, editor: 10, tictactoe: 10, calculator: 10 };
        reset[app] = 20;
        setTerminalState(s => ({ ...s, zIndex: reset.terminal }));
        setFolderState(s => ({ ...s, zIndex: reset.folder }));
        setSettingsState(s => ({ ...s, zIndex: reset.settings }));
        setEditorState(s => ({ ...s, zIndex: reset.editor }));
        setTicTacToeState(s => ({ ...s, zIndex: reset.tictactoe }));
        setCalculatorState(s => ({ ...s, zIndex: reset.calculator }));
    };

    const toggleTerminal = () => {
        if (!terminalState.open) {
            setTerminalState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
            bringToFront('terminal');
        } else if (terminalState.minimized) {
            setTerminalState(s => ({ ...s, minimized: false, zIndex: 20 }));
            bringToFront('terminal');
        } else {
            setTerminalState(s => ({ ...s, minimized: true }));
        }
    };

    const toggleFolder = () => {
        if (!folderState.open) {
            setFolderState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
            bringToFront('folder');
        } else if (folderState.minimized) {
            setFolderState(s => ({ ...s, minimized: false, zIndex: 20 }));
            bringToFront('folder');
        } else {
            setFolderState(s => ({ ...s, minimized: true }));
        }
    };

    const toggleSettings = () => {
        if (!settingsState.open) {
            setSettingsState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
            bringToFront('settings');
        } else if (settingsState.minimized) {
            setSettingsState(s => ({ ...s, minimized: false, zIndex: 20 }));
            bringToFront('settings');
        } else {
            setSettingsState(s => ({ ...s, minimized: true }));
        }
    };

    const toggleEditor = () => {
        if (!editorState.open) {
            setEditorFilePath("");
            setEditorState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
            bringToFront('editor');
        } else if (editorState.minimized) {
            setEditorState(s => ({ ...s, minimized: false, zIndex: 20 }));
            bringToFront('editor');
        } else {
            setEditorState(s => ({ ...s, minimized: true }));
        }
    };

    const toggleTicTacToe = () => {
        if (!ticTacToeState.open) {
            setTicTacToeState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
            bringToFront('tictactoe');
        } else if (ticTacToeState.minimized) {
            setTicTacToeState(s => ({ ...s, minimized: false, zIndex: 20 }));
            bringToFront('tictactoe');
        } else {
            setTicTacToeState(s => ({ ...s, minimized: true }));
        }
    };



    const toggleCalculator = () => {
        if (!calculatorState.open) {
            setCalculatorState(s => ({ ...s, open: true, minimized: false, zIndex: 20 }));
            bringToFront('calculator');
        } else if (calculatorState.minimized) {
            setCalculatorState(s => ({ ...s, minimized: false, zIndex: 20 }));
            bringToFront('calculator');
        } else {
            setCalculatorState(s => ({ ...s, minimized: true }));
        }
    };

    // Opens a specific file in the editor (called from FolderExplorer)
    const openFileInEditor = (filePath: string) => {
        setEditorFilePath(filePath);
        setEditorState({ open: true, minimized: false, maximized: false, zIndex: 20 });
        bringToFront('editor');
    };

    const handlePowerOff = () => {
        setIsShuttingDown(true);
        setTimeout(() => {
            onReboot();
        }, 1500);
    };

    if (!isLoaded) return null;

    const isAnimated = desktopBg.startsWith("ANIMATED_");
    const isSolidColor = isAnimated || desktopBg.startsWith('#') || desktopBg.startsWith('rgb');
    const bgStyle: React.CSSProperties = {
        backgroundColor: isSolidColor ? (isAnimated ? "#000" : desktopBg) : undefined,
        backgroundImage: !isSolidColor ? desktopBg : undefined,
        backgroundSize: desktopBg.includes('url') ? 'cover' : 'auto',
        backgroundPosition: 'center',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Boot Screen */}
            {(isBooting || isShuttingDown) && <BootScreen onComplete={() => setIsBooting(false)} />}

            {/* Full Screen Prompt (appears after boot) */}
            {!isBooting && <FullScreenPrompt />}

            {/* ── Top Bar ── */}
            <TopBar onLogout={onLogout} onReboot={onReboot} onSleep={onLogout} activeName={activeName} />

            {/* ── Workspace (everything below the bar) ── */}
            <div
                className="desktop-view"
                id="desktop-view"
                onContextMenu={(e) => {
                    e.preventDefault();
                    if (e.target === e.currentTarget || (e.target as HTMLElement).id === "desktop-view") {
                        setDesktopCtx({ x: e.clientX, y: e.clientY });
                    }
                }}
                style={{
                    ...bgStyle,
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {isAnimated && <AnimatedBackground type={desktopBg} />}

                {desktopCtx && (
                    <div
                        style={{
                            position: "absolute",
                            top: desktopCtx.y,
                            left: desktopCtx.x,
                            zIndex: 1000,
                            backgroundColor: "rgba(32,32,36,0.96)",
                            borderRadius: "6px",
                            padding: "6px 0",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            minWidth: "200px",
                            backdropFilter: "blur(18px)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => handleDesktopContextAction("open-terminal")}
                            style={{
                                width: "100%",
                                padding: "6px 14px",
                                background: "none",
                                border: "none",
                                color: "#f5f5f5",
                                textAlign: "left",
                                fontSize: "13px",
                                cursor: "pointer",
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            Open Terminal Here
                        </button>
                        <button
                            onClick={() => handleDesktopContextAction("open-home")}
                            style={{
                                width: "100%",
                                padding: "6px 14px",
                                background: "none",
                                border: "none",
                                color: "#f5f5f5",
                                textAlign: "left",
                                fontSize: "13px",
                                cursor: "pointer",
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            Open Home Folder
                        </button>
                        <div
                            style={{
                                margin: "4px 0",
                                borderTop: "1px solid rgba(255,255,255,0.08)",
                            }}
                        />
                        <button
                            onClick={() => handleDesktopContextAction("toggle-icons")}
                            style={{
                                width: "100%",
                                padding: "6px 14px",
                                background: "none",
                                border: "none",
                                color: "#f5f5f5",
                                textAlign: "left",
                                fontSize: "13px",
                                cursor: "pointer",
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {showDesktopIcons ? "Hide Desktop Icons" : "Show Desktop Icons"}
                        </button>
                        <button
                            onClick={() => handleDesktopContextAction("open-settings")}
                            style={{
                                width: "100%",
                                padding: "6px 14px",
                                background: "none",
                                border: "none",
                                color: "#f5f5f5",
                                textAlign: "left",
                                fontSize: "13px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Desktop Settings
                        </button>
                        <div style={{ margin: "4px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                        <button
                            onClick={() => handleDesktopContextAction("toggle-fullscreen")}
                            style={{
                                width: "100%",
                                padding: "8px 14px",
                                background: "rgba(233, 84, 32, 0.1)",
                                border: "none",
                                color: "#E95420",
                                textAlign: "left",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                            {typeof document !== 'undefined' && document.fullscreenElement ? "Exit Full Screen" : "Enter Full Screen"}
                        </button>
                    </div>
                )}

                <div className="desktop-dock" style={{ zIndex: 50 }}>
                    <div className="dock-icon" id="dock-home" title="Home Folder" onClick={toggleFolder} style={{ position: "relative" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        {folderState.open && <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", backgroundColor: "#e95420", borderRadius: "50%", boxShadow: "0 0 4px #e95420" }} />}
                    </div>
                    <div className="dock-icon" id="dock-terminal" title="Terminal" onClick={toggleTerminal} style={{ position: "relative" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                        {terminalState.open && <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", backgroundColor: "#e95420", borderRadius: "50%", boxShadow: "0 0 4px #e95420" }} />}
                    </div>
                    <div className="dock-icon" id="dock-editor" title="Text Editor" onClick={toggleEditor} style={{ position: "relative" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        {editorState.open && <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", backgroundColor: "#e95420", borderRadius: "50%", boxShadow: "0 0 4px #e95420" }} />}
                    </div>

                    <div className="dock-icon" id="dock-tictactoe" title="Tic Tac Toe" onClick={toggleTicTacToe} style={{ position: "relative" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line>
                        </svg>
                        {ticTacToeState.open && <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", backgroundColor: "#e95420", borderRadius: "50%", boxShadow: "0 0 4px #e95420" }} />}
                    </div>
                    <div className="dock-icon" id="dock-calculator" title="Calculator" onClick={toggleCalculator} style={{ position: "relative" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                            <line x1="8" y1="6" x2="16" y2="6"></line>
                            <line x1="16" y1="14" x2="16" y2="14"></line>
                            <line x1="16" y1="18" x2="16" y2="18"></line>
                            <line x1="16" y1="10" x2="16" y2="10"></line>
                            <line x1="8" y1="10" x2="8" y2="10"></line>
                            <line x1="8" y1="14" x2="8" y2="14"></line>
                            <line x1="8" y1="18" x2="8" y2="18"></line>
                            <line x1="12" y1="10" x2="12" y2="10"></line>
                            <line x1="12" y1="14" x2="12" y2="14"></line>
                            <line x1="12" y1="18" x2="12" y2="18"></line>
                        </svg>
                        {calculatorState.open && <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", backgroundColor: "#e95420", borderRadius: "50%", boxShadow: "0 0 4px #e95420" }} />}
                    </div>
                    <div className="dock-icon" id="dock-settings" title="Settings" onClick={toggleSettings} style={{ position: "relative" }}>
                        <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        {settingsState.open && <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", backgroundColor: "#e95420", borderRadius: "50%", boxShadow: "0 0 4px #e95420" }} />}
                    </div>
                </div>

                {showDesktopIcons && (
                <div className="desktop-icons" style={{ zIndex: 1 }}>
                    <div className="desktop-icon" id="desktop-home-icon" onClick={toggleFolder} style={{ cursor: 'pointer' }}>
                        <svg className="file-icon folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        <span>Home</span>
                    </div>
                    <div className="desktop-icon" id="desktop-editor-icon" onClick={toggleEditor} style={{ cursor: 'pointer' }}>
                        <svg style={{ width: 40, height: 40 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e0c97a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>Text Editor</span>
                    </div>

                    <div className="desktop-icon" id="desktop-tictactoe-icon" onClick={toggleTicTacToe} style={{ cursor: 'pointer' }}>
                        <svg style={{ width: 40, height: 40 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00ffcc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line>
                        </svg>
                        <span>Tic Tac Toe</span>
                    </div>
                    <div className="desktop-icon" id="desktop-calculator-icon" onClick={toggleCalculator} style={{ cursor: 'pointer' }}>
                        <svg style={{ width: 40, height: 40 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e95420" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                            <line x1="8" y1="6" x2="16" y2="6"></line>
                            <line x1="16" y1="14" x2="16" y2="14"></line>
                            <line x1="16" y1="18" x2="16" y2="18"></line>
                            <line x1="16" y1="10" x2="16" y2="10"></line>
                            <line x1="8" y1="10" x2="8" y2="10"></line>
                            <line x1="8" y1="14" x2="8" y2="14"></line>
                            <line x1="8" y1="18" x2="8" y2="18"></line>
                            <line x1="12" y1="10" x2="12" y2="10"></line>
                            <line x1="12" y1="14" x2="12" y2="14"></line>
                            <line x1="12" y1="18" x2="12" y2="18"></line>
                        </svg>
                        <span>Calculator</span>
                    </div>
                    <div className="desktop-icon" id="desktop-settings-icon" onClick={toggleSettings} style={{ cursor: 'pointer' }}>
                        <svg style={{ width: 40, height: 40 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>Settings</span>
                    </div>
                </div>
                )}

                {terminalState.open && (
                    <TerminalApp
                        onClose={() => setTerminalState(s => ({ ...s, open: false }))}
                        onMinimize={() => setTerminalState(s => ({ ...s, minimized: true }))}
                        onMaximize={() => setTerminalState(s => ({ ...s, maximized: !s.maximized }))}
                        onFocus={() => bringToFront('terminal')}
                        isMaximized={terminalState.maximized}
                        isMinimized={terminalState.minimized}
                        zIndex={terminalState.zIndex}
                        terminalUser={terminalUser}
                        terminalHost={terminalHost}
                        terminalTextColor={terminalTextColor}
                    />
                )}

                {folderState.open && (
                    <FolderExplorer
                        onClose={() => setFolderState(s => ({ ...s, open: false }))}
                        onMinimize={() => setFolderState(s => ({ ...s, minimized: true }))}
                        onMaximize={() => setFolderState(s => ({ ...s, maximized: !s.maximized }))}
                        onFocus={() => bringToFront('folder')}
                        isMaximized={folderState.maximized}
                        isMinimized={folderState.minimized}
                        zIndex={folderState.zIndex}
                        onOpenFile={openFileInEditor}
                    />
                )}

                {settingsState.open && (
                    <SettingsApp
                        onClose={() => setSettingsState(s => ({ ...s, open: false }))}
                        onMinimize={() => setSettingsState(s => ({ ...s, minimized: true }))}
                        onMaximize={() => setSettingsState(s => ({ ...s, maximized: !s.maximized }))}
                        onFocus={() => bringToFront('settings')}
                        isMaximized={settingsState.maximized}
                        isMinimized={settingsState.minimized}
                        zIndex={settingsState.zIndex}
                        currentBg={desktopBg}
                        onBgChange={setDesktopBg}
                        terminalUser={terminalUser}
                        setTerminalUser={setTerminalUser}
                        terminalHost={terminalHost}
                        setTerminalHost={setTerminalHost}
                        terminalTextColor={terminalTextColor}
                        setTerminalTextColor={setTerminalTextColor}
                    />
                )}

                {editorState.open && (
                    <TextEditorApp
                        onClose={() => setEditorState(s => ({ ...s, open: false }))}
                        onMinimize={() => setEditorState(s => ({ ...s, minimized: true }))}
                        onMaximize={() => setEditorState(s => ({ ...s, maximized: !s.maximized }))}
                        onFocus={() => bringToFront('editor')}
                        isMaximized={editorState.maximized}
                        isMinimized={editorState.minimized}
                        zIndex={editorState.zIndex}
                        filePath={editorFilePath}
                    />
                )}

                {ticTacToeState.open && (
                    <TicTacToeApp
                        onClose={() => setTicTacToeState(s => ({ ...s, open: false }))}
                        onMinimize={() => setTicTacToeState(s => ({ ...s, minimized: true }))}
                        onMaximize={() => setTicTacToeState(s => ({ ...s, maximized: !s.maximized }))}
                        onFocus={() => bringToFront('tictactoe')}
                        isMaximized={ticTacToeState.maximized}
                        isMinimized={ticTacToeState.minimized}
                        zIndex={ticTacToeState.zIndex}
                    />
                )}



                {calculatorState.open && (
                    <CalculatorApp
                        onClose={() => setCalculatorState(s => ({ ...s, open: false }))}
                        onMinimize={() => setCalculatorState(s => ({ ...s, minimized: true }))}
                        onMaximize={() => setCalculatorState(s => ({ ...s, maximized: !s.maximized }))}
                        onFocus={() => bringToFront('calculator')}
                        isMaximized={calculatorState.maximized}
                        isMinimized={calculatorState.minimized}
                        zIndex={calculatorState.zIndex}
                    />
                )}


                <FeedbackWidget />
            </div>
        </div>
    );
}
