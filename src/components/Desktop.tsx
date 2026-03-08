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
import SystemCoreWidget from "./SystemCoreWidget";
import { loadFs } from "@/lib/MockFs";

function TopBar() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    return (
        <div style={{
            width: "100%",
            height: "30px", flexShrink: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center",
            padding: "0 16px",
            fontFamily: "'Ubuntu', 'Inter', 'Segoe UI', sans-serif",
            fontSize: "13px",
            color: "rgba(255,255,255,0.92)",
            userSelect: "none",
            zIndex: 100,
        }}>
            {/* Left: Activities label */}
            <span style={{ fontWeight: 600, letterSpacing: "0.03em", opacity: 0.85 }}>Activities</span>

            {/* Center: clock */}
            <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span style={{ fontWeight: 500 }}>
                    {dayName} {monthName} {date}
                </span>
                <span style={{
                    fontWeight: 700, fontSize: "14px",
                    background: "rgba(255,255,255,0.1)",
                    padding: "1px 10px", borderRadius: "6px",
                    letterSpacing: "0.05em",
                }}>
                    {hours}:{minutes}:{seconds}
                </span>
            </div>

            {/* Right: system indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", opacity: 0.85 }}>
                {/* Network icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                </svg>
                {/* System Core Widget */}
                <SystemCoreWidget />
                <FeedbackWidget />

                {/* Animated Background Canvas */}
                <svg width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                    <line x1="23" y1="13" x2="23" y2="11" strokeWidth="3" />
                    <rect x="3" y="8" width="12" height="8" rx="1" fill="currentColor" opacity="0.5" />
                </svg>
                {/* Volume icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
            </div>
        </div>
    );
}

export default function Desktop() {
    const [terminalState, setTerminalState] = useState({ open: false, minimized: false, maximized: false, zIndex: 10 });
    const [folderState, setFolderState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [settingsState, setSettingsState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [editorState, setEditorState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [ticTacToeState, setTicTacToeState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [calculatorState, setCalculatorState] = useState({ open: false, minimized: false, maximized: false, zIndex: 5 });
    const [editorFilePath, setEditorFilePath] = useState("");
    const [desktopBg, setDesktopBg] = useState("linear-gradient(135deg, #dd4814, #2c001e)");
    const [terminalUser, setTerminalUser] = useState("root");
    const [terminalHost, setTerminalHost] = useState("ubuntu");
    const [isLoaded, setIsLoaded] = useState(false);
    const [desktopCtx, setDesktopCtx] = useState<{ x: number, y: number } | null>(null);

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
        if (savedBg) setDesktopBg(savedBg);
        if (savedUser) setTerminalUser(savedUser);
        if (savedHost) setTerminalHost(savedHost);
        setIsLoaded(true);
    }, []);

    React.useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("ubuntu_desktopBg", desktopBg);
            localStorage.setItem("ubuntu_terminalUser", terminalUser);
            localStorage.setItem("ubuntu_terminalHost", terminalHost);
        }
    }, [desktopBg, terminalUser, terminalHost, isLoaded]);

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
            {/* â”€â”€ Top Bar â”€â”€ */}
            <TopBar />

            {/* â”€â”€ Workspace (everything below the bar) â”€â”€ */}
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

                <div className="desktop-dock" style={{ zIndex: 50 }}>
                    <div className="dock-icon" id="dock-home" title="Home Folder" onClick={toggleFolder}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </div>
                    <div className="dock-icon" id="dock-terminal" title="Terminal" onClick={toggleTerminal}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                    </div>
                    <div className="dock-icon" id="dock-editor" title="Text Editor" onClick={toggleEditor}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </div>

                    <div className="dock-icon" id="dock-tictactoe" title="Tic Tac Toe" onClick={toggleTicTacToe}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line>
                        </svg>
                    </div>
                    <div className="dock-icon" id="dock-calculator" title="Calculator" onClick={toggleCalculator}>
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
                    </div>
                    <div className="dock-icon" id="dock-settings" title="Settings" onClick={toggleSettings}>
                        <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </div>
                </div>

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

                {/* Desktop Copyright Watermark */}
                <div style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "90px", // Just right of the dock
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8rem",
                    pointerEvents: "none",
                    zIndex: 0,
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                }}>
                    UbuntuLite 2026 &copy; Jawaan
                </div>

                <FeedbackWidget />
            </div>
        </div>
    );
}
