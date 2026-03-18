"use client";

import React, { useState, useEffect } from "react";
import { fileContents, saveFs, fs } from "@/lib/MockFs";
import { useDraggable } from "@/hooks/useDraggable";

interface TextEditorProps {
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    isMaximized: boolean;
    isMinimized: boolean;
    zIndex: number;
    onFocus: () => void;
    filePath?: string;
}

export default function TextEditorApp({
    onClose, onMinimize, onMaximize,
    isMaximized, isMinimized, zIndex, onFocus,
    filePath = "",
}: TextEditorProps) {
    const [content, setContent] = useState("");
    const [fileName, setFileName] = useState(filePath || "untitled.txt");
    const [saved, setSaved] = useState(true);
    const [saveFlash, setSaveFlash] = useState(false);
    const [showSaveAs, setShowSaveAs] = useState(false);
    const [saveAsDir, setSaveAsDir] = useState("/root");
    const [saveAsName, setSaveAsName] = useState("untitled.txt");

    const { position, isDragging, isSnapped } = useDraggable(isMaximized || false);

    useEffect(() => {
        if (filePath && fileContents[filePath] !== undefined) {
            setContent(fileContents[filePath]);
            setFileName(filePath.split("/").pop() || filePath);
        }
    }, [filePath]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setSaved(false);
    };

    const handleSave = () => {
        if (filePath) {
            fileContents[filePath] = content;
            saveFs();
        }
        setSaved(true);
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 1200);
    };

    const handleSaveAs = () => {
        const name = saveAsName.trim();
        const dir = saveAsDir.trim();
        if (!name) return;
        if (!fs[dir]) { alert(`Directory '${dir}' does not exist in the virtual filesystem.`); return; }
        const fullPath = dir.endsWith("/") ? dir + name : dir + "/" + name;
        fileContents[fullPath] = content;
        if (!fs[dir].includes(name)) fs[dir].push(name);
        saveFs();
        setSaved(true);
        setSaveFlash(true);
        setShowSaveAs(false);
        setTimeout(() => setSaveFlash(false), 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            handleSave();
        }
        // Tab key inserts spaces
        if (e.key === "Tab") {
            e.preventDefault();
            const ta = e.currentTarget;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const newVal = content.substring(0, start) + "    " + content.substring(end);
            setContent(newVal);
            setSaved(false);
            setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; }, 0);
        }
    };

    const lineCount = content.split("\n").length;

    return (
        <div
            className={`text-editor-window ${isMaximized ? "maximized" : ""} ${isSnapped === 'left' ? 'snapped-left' : isSnapped === 'right' ? 'snapped-right' : ''}`}
            style={{
                opacity: isMinimized ? 0 : 1,
                pointerEvents: isMinimized ? "none" : "auto",
                zIndex: zIndex || 10,
                display: "flex",
                flexDirection: "column",
                background: "#1a1b26",
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                animation: "editorOpen 0.18s cubic-bezier(0.2,0,0,1)",
                ...(isMaximized || isSnapped !== 'none') ? {
                    zIndex: zIndex || 10,
                    transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)'
                } : {
                    width: 'min(1000px, 95%)',
                    height: 'min(620px, 85%)',
                    borderRadius: '12px',
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s'
                }
            }}
            onClick={onFocus}
        >
            <style>{`
                @keyframes editorOpen {
                    from { opacity: 0; transform: scale(0.93) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .te-textarea::-webkit-scrollbar { width: 6px; }
                .te-textarea::-webkit-scrollbar-track { background: transparent; }
                .te-textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
                .te-save-btn:hover { background: rgba(255,255,255,0.12) !important; }
            `}</style>

            {/* Title Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#13141f", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                    <span onClick={onClose} style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", cursor: "pointer", display: "block" }} />
                    <span onClick={onMinimize} style={{ width: 13, height: 13, borderRadius: "50%", background: "#ffbd2e", cursor: "pointer", display: "block" }} />
                    <span onClick={onMaximize} style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840", cursor: "pointer", display: "block" }} />
                </div>
                <div style={{ flex: 1, textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                    {saved ? "✓ " : "● "}{fileName} — Text Editor
                </div>
                <button
                    className="te-save-btn"
                    onClick={handleSave}
                    style={{
                        background: saveFlash ? "rgba(80,200,120,0.25)" : "rgba(255,255,255,0.07)",
                        border: "none", borderRadius: "7px", color: saveFlash ? "#4ec97a" : "rgba(255,255,255,0.6)",
                        fontSize: "12px", padding: "4px 12px", cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.2s",
                    }}
                >
                    {saveFlash ? "Saved!" : "Save (Ctrl+S)"}
                </button>
                <button
                    onClick={() => {
                        const existingName = filePath ? filePath.split("/").pop() || "untitled.txt" : "untitled.txt";
                        const existingDir = filePath ? filePath.split("/").slice(0, -1).join("/") || "/root" : "/root";
                        setSaveAsName(existingName);
                        setSaveAsDir(existingDir);
                        setShowSaveAs(true);
                    }}
                    style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "7px", color: "rgba(255,255,255,0.6)", fontSize: "12px", padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                >
                    Save As…
                </button>
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "6px 16px", background: "#16172a", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                    Lines: {lineCount}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                    Chars: {content.length}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
                    {filePath ? `📄 ${filePath}` : "New File"}
                </span>
            </div>

            {/* Editor area */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Line numbers */}
                <div style={{
                    width: "44px", background: "#13141f", borderRight: "1px solid rgba(255,255,255,0.05)",
                    overflowY: "hidden", padding: "12px 0", flexShrink: 0, userSelect: "none",
                }}>
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", lineHeight: "1.6", textAlign: "right", paddingRight: "10px" }}>
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    className="te-textarea"
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoFocus
                    placeholder="Start typing..."
                    style={{
                        flex: 1, background: "#1a1b26", color: "#c0caf5", border: "none", outline: "none",
                        resize: "none", padding: "12px 16px", fontSize: "14px", lineHeight: "1.6",
                        fontFamily: "inherit", overflowY: "auto", caretColor: "#7aa2f7",
                    }}
                />
            </div>

            {/* Status bar */}
            <div style={{ display: "flex", alignItems: "center", padding: "4px 16px", background: "#0f0f1a", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                <span style={{ color: saved ? "#4ec97a" : "#f7768e", fontSize: "11px" }}>
                    {saved ? "● Saved" : "● Unsaved changes"}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>UTF-8 · Plain Text</span>
            </div>

            {/* Save As Modal */}
            {showSaveAs && (
                <div onClick={() => setShowSaveAs(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#1e1f2e", border: "1px solid rgba(255,255,255,0.13)", borderRadius: "14px", padding: "26px", width: "390px", maxWidth: "90%", maxHeight: "90%", overflowY: "auto", fontFamily: "'Inter','Segoe UI',sans-serif", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>
                        <h3 style={{ color: "#c0caf5", margin: "0 0 20px", fontSize: "15px", fontWeight: 600 }}>💾 Save As</h3>

                        {/* Folder picker */}
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "7px" }}>Save in folder</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                            {["/root", "/root/Documents", "/root/Desktop", "/root/Downloads", "/tmp"].map(dir => (
                                <button
                                    key={dir}
                                    onClick={() => setSaveAsDir(dir)}
                                    style={{ background: saveAsDir === dir ? "rgba(122,162,247,0.22)" : "rgba(255,255,255,0.06)", border: saveAsDir === dir ? "1px solid rgba(122,162,247,0.5)" : "1px solid transparent", borderRadius: "7px", color: saveAsDir === dir ? "#7aa2f7" : "rgba(255,255,255,0.5)", fontSize: "11px", padding: "5px 10px", cursor: "pointer", transition: "all 0.15s" }}
                                >
                                    📁 {dir.split("/").pop() || "/"}
                                </button>
                            ))}
                        </div>
                        <input
                            value={saveAsDir}
                            onChange={e => setSaveAsDir(e.target.value)}
                            placeholder="/root"
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", color: "#8090a8", fontSize: "12px", padding: "7px 12px", outline: "none", boxSizing: "border-box", fontFamily: "monospace", marginBottom: "18px" }}
                        />

                        {/* File name */}
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "7px" }}>File name</label>
                        <input
                            autoFocus
                            value={saveAsName}
                            onChange={e => setSaveAsName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleSaveAs(); if (e.key === "Escape") setShowSaveAs(false); }}
                            placeholder="myfile.txt"
                            style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(122,162,247,0.4)", borderRadius: "8px", color: "#c0caf5", fontSize: "14px", padding: "9px 12px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                        />

                        {/* Live path preview */}
                        <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "11px", margin: "8px 0 18px", fontFamily: "monospace" }}>
                            → {saveAsDir.endsWith("/") ? saveAsDir : saveAsDir + "/"}{saveAsName || "untitled.txt"}
                        </p>

                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowSaveAs(false)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "7px", color: "rgba(255,255,255,0.5)", padding: "7px 18px", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
                            <button onClick={handleSaveAs} style={{ background: "#7aa2f7", border: "none", borderRadius: "7px", color: "#0d0e1a", fontWeight: 700, padding: "7px 20px", cursor: "pointer", fontSize: "13px" }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
