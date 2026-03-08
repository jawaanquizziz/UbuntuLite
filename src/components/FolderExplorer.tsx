"use client";

import React, { useState, useEffect, useRef } from "react";
import { fs, fileContents, saveFs } from "@/lib/MockFs";
import { useDraggable } from "@/hooks/useDraggable";

const FolderIcon = ({ color = "#e8a838" }: { color?: string }) => (
    <svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "48px", height: "48px", display: "block" }}>
        <path d="M2 8C2 5.79086 3.79086 4 6 4H22L28 10H50C52.2091 10 54 11.7909 54 14V40C54 42.2091 52.2091 44 50 44H6C3.79086 44 2 42.2091 2 40V8Z" fill={color} opacity="0.9" />
        <path d="M2 16H54V40C54 42.2091 52.2091 44 50 44H6C3.79086 44 2 42.2091 2 40V16Z" fill={color} />
    </svg>
);

const FileIcon = () => (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "40px", height: "48px", display: "block" }}>
        <path d="M4 4C4 1.79086 5.79086 0 8 0H32L44 12V52C44 54.2091 42.2091 56 40 56H8C5.79086 56 4 54.2091 4 52V4Z" fill="#e2eaf5" />
        <path d="M32 0L44 12H34C32.8954 12 32 11.1046 32 10V0Z" fill="#c0cfe0" />
        <line x1="12" y1="22" x2="36" y2="22" stroke="#9fb1c9" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="28" x2="36" y2="28" stroke="#9fb1c9" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="34" x2="28" y2="34" stroke="#9fb1c9" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

type CtxMenu = { x: number; y: number; item: string | null; isDir: boolean } | null;
type Clipboard = { action: "copy" | "cut"; path: string; name: string } | null;
type RenameState = { path: string; value: string } | null;

export default function FolderExplorer({ onClose, onMinimize, onMaximize, isMaximized, isMinimized, zIndex, onFocus, onOpenFile }: any) {
    const [currentPath, setCurrentPath] = useState("/root");
    const [history, setHistory] = useState<string[]>(["/root"]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);
    const [clipboard, setClipboard] = useState<Clipboard>(null);
    const [renaming, setRenaming] = useState<RenameState>(null);
    const [showNewModal, setShowNewModal] = useState<"file" | "folder" | null>(null);
    const [newName, setNewName] = useState("");
    const [showProps, setShowProps] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { position, handleMouseDown, isDragging } = useDraggable(isMaximized);

    // Close context menu on outside click
    useEffect(() => {
        const close = () => setCtxMenu(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, []);

    const pathParts = currentPath.split("/").filter(p => p !== "");
    const breadcrumbs = [
        { label: "Root", path: "/" },
        ...pathParts.map((p, i) => ({
            label: p.charAt(0).toUpperCase() + p.slice(1),
            path: "/" + pathParts.slice(0, i + 1).join("/")
        }))
    ];

    const items = fs[currentPath] || [];

    const handleNavigate = (targetPath: string) => {
        if (fs[targetPath] !== undefined) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(targetPath);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setCurrentPath(targetPath);
            setSelectedItem(null);
            setPreviewContent(null);
        }
    };

    const handleItemClick = (item: string) => {
        const itemFullPath = currentPath === "/" ? `/${item}` : `${currentPath}/${item}`;
        const isDir = fs[itemFullPath] !== undefined;
        setSelectedItem(item);
        if (!isDir) setPreviewContent(fileContents[itemFullPath] ?? null);
        else setPreviewContent(null);
    };

    const handleItemDoubleClick = (item: string) => {
        const itemFullPath = currentPath === "/" ? `/${item}` : `${currentPath}/${item}`;
        if (fs[itemFullPath] !== undefined) handleNavigate(itemFullPath);
        else if (fileContents[itemFullPath] !== undefined && onOpenFile) onOpenFile(itemFullPath);
    };

    const handleBack = () => {
        if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setCurrentPath(history[historyIndex - 1]); setSelectedItem(null); setPreviewContent(null); }
    };
    const handleForward = () => {
        if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setCurrentPath(history[historyIndex + 1]); setSelectedItem(null); setPreviewContent(null); }
    };

    // ── Context menu handlers ──
    const openCtxMenu = (e: React.MouseEvent, item: string | null, isDir: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setCtxMenu({ x: e.clientX, y: e.clientY, item, isDir });
        if (item) setSelectedItem(item);
    };

    const ctxItemPath = ctxMenu?.item ? (currentPath === "/" ? `/${ctxMenu.item}` : `${currentPath}/${ctxMenu.item}`) : null;

    const ctxActions = {
        open: () => {
            if (!ctxMenu?.item) return;
            handleItemDoubleClick(ctxMenu.item);
            setCtxMenu(null);
        },
        openInEditor: () => {
            if (ctxItemPath && fileContents[ctxItemPath] !== undefined && onOpenFile) onOpenFile(ctxItemPath);
            setCtxMenu(null);
        },
        copy: () => {
            if (!ctxMenu?.item || !ctxItemPath) return;
            setClipboard({ action: "copy", path: ctxItemPath, name: ctxMenu.item });
            setCtxMenu(null);
        },
        cut: () => {
            if (!ctxMenu?.item || !ctxItemPath) return;
            setClipboard({ action: "cut", path: ctxItemPath, name: ctxMenu.item });
            setCtxMenu(null);
        },
        paste: () => {
            if (!clipboard) return;
            const destName = clipboard.name;
            const destPath = (currentPath === "/" ? "" : currentPath) + "/" + destName;
            if (fileContents[clipboard.path] !== undefined) {
                fileContents[destPath] = fileContents[clipboard.path];
                if (!fs[currentPath].includes(destName)) fs[currentPath].push(destName);
                if (clipboard.action === "cut") {
                    delete fileContents[clipboard.path];
                    const srcParts = clipboard.path.split("/");
                    const srcName = srcParts.pop()!;
                    const srcParent = srcParts.join("/") || "/";
                    if (fs[srcParent]) fs[srcParent] = fs[srcParent].filter((f: string) => f !== srcName);
                }
            }
            saveFs();
            if (clipboard.action === "cut") setClipboard(null);
            setCtxMenu(null);
        },
        rename: () => {
            if (!ctxItemPath || !ctxMenu?.item) return;
            setRenaming({ path: ctxItemPath, value: ctxMenu.item });
            setCtxMenu(null);
        },
        delete: () => {
            if (!ctxMenu?.item || !ctxItemPath) return;
            if (ctxMenu.isDir) {
                const toDel = Object.keys(fs).filter(p => p === ctxItemPath || p.startsWith(ctxItemPath + "/"));
                toDel.forEach(p => delete fs[p]);
            } else {
                delete fileContents[ctxItemPath];
            }
            fs[currentPath] = fs[currentPath].filter((f: string) => f !== ctxMenu.item);
            saveFs();
            setSelectedItem(null);
            setCtxMenu(null);
        },
        newFile: () => { setShowNewModal("file"); setNewName(""); setCtxMenu(null); },
        newFolder: () => { setShowNewModal("folder"); setNewName(""); setCtxMenu(null); },
        properties: () => { setShowProps(ctxItemPath); setCtxMenu(null); },
    };

    // Keyboard Delete key handler
    const deleteSelectedItem = () => {
        if (!selectedItem || renaming || showNewModal) return;
        const itemPath = currentPath === "/" ? `/${selectedItem}` : `${currentPath}/${selectedItem}`;
        const isDir = fs[itemPath] !== undefined;
        if (isDir) {
            const toDel = Object.keys(fs).filter(p => p === itemPath || p.startsWith(itemPath + "/"));
            toDel.forEach(p => delete fs[p]);
        } else {
            delete fileContents[itemPath];
        }
        fs[currentPath] = fs[currentPath].filter((f: string) => f !== selectedItem);
        saveFs();
        setSelectedItem(null);
        setPreviewContent(null);
    };

    const commitRename = () => {
        if (!renaming || !renaming.value.trim()) { setRenaming(null); return; }
        const oldPath = renaming.path;
        const parts = oldPath.split("/");
        const oldName = parts.pop()!;
        const parentDir = parts.join("/") || "/";
        const newPath = (parentDir === "/" ? "" : parentDir) + "/" + renaming.value.trim();
        if (fileContents[oldPath] !== undefined) {
            fileContents[newPath] = fileContents[oldPath];
            delete fileContents[oldPath];
        }
        if (fs[parentDir]) fs[parentDir] = fs[parentDir].map((f: string) => f === oldName ? renaming.value.trim() : f);
        saveFs();
        setRenaming(null);
    };

    const commitNew = () => {
        const name = newName.trim();
        if (!name) { setShowNewModal(null); return; }
        const newPath = (currentPath === "/" ? "" : currentPath) + "/" + name;
        if (showNewModal === "folder") { fs[newPath] = []; if (!fs[currentPath].includes(name)) fs[currentPath].push(name); }
        else { fileContents[newPath] = ""; if (!fs[currentPath].includes(name)) fs[currentPath].push(name); }
        saveFs();
        setShowNewModal(null);
        setNewName("");
    };

    const sidebarItems = [
        { label: "Home", path: "/root", emoji: "🏠" },
        { label: "Documents", path: "/root/Documents", emoji: "📄" },
        { label: "Downloads", path: "/root/Downloads", emoji: "⬇️" },
        { label: "Desktop", path: "/root/Desktop", emoji: "🖥️" },
        { label: "etc", path: "/etc", emoji: "⚙️" },
        { label: "var/log", path: "/var/log", emoji: "📋" },
    ];

    const windowStyle: React.CSSProperties = isMaximized
        ? { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 0, border: "none", transform: "none", zIndex: zIndex || 10 }
        : {
            position: "absolute",
            width: "720px",
            height: "480px",
            zIndex: zIndex || 10,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.1s"
        };

    const menuItemStyle: React.CSSProperties = { padding: "7px 16px", fontSize: "13px", color: "rgba(255,255,255,0.85)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" };
    const sepStyle: React.CSSProperties = { borderTop: "1px solid rgba(255,255,255,0.08)", margin: "4px 0" };

    // Props info
    const propsItem = showProps;
    const propsIsDir = propsItem ? fs[propsItem] !== undefined : false;
    const propsContent = propsItem && !propsIsDir ? (fileContents[propsItem] ?? "") : "";
    const propsName = propsItem ? propsItem.split("/").pop() : "";
    const propsSize = propsIsDir ? `${(fs[propsItem!] || []).length} item(s)` : `${new TextEncoder().encode(propsContent).length} bytes`;

    return (
        <div
            ref={containerRef}
            onClick={onFocus}
            tabIndex={0}
            onKeyDown={(e) => {
                // Don't fire if user is typing in an input inside the component
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                if (e.key === "Delete" || e.key === "Backspace" && e.metaKey) {
                    e.preventDefault();
                    deleteSelectedItem();
                }
                if (e.key === "Escape") setCtxMenu(null);
            }}
            onContextMenu={(e) => { e.preventDefault(); openCtxMenu(e, null, false); }}
            style={{
                ...windowStyle,
                opacity: isMinimized ? 0 : 1,
                pointerEvents: isMinimized ? "none" : "auto",
                display: "flex", flexDirection: "column",
                background: "#1e1e2e", borderRadius: isMaximized ? 0 : "12px", overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                animation: "folderOpen 0.18s cubic-bezier(0.2, 0, 0, 1)",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
        >
            <style>{`
                @keyframes folderOpen { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .fe-item:hover { background: rgba(255,255,255,0.08) !important; }
                .fe-item.selected { background: rgba(127,166,255,0.18) !important; outline: 1px solid rgba(127,166,255,0.4); }
                .fe-sidebar-item:hover { background: rgba(255,255,255,0.1) !important; }
                .fe-sidebar-item.active { background: rgba(127,166,255,0.2) !important; }
                .fe-nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12) !important; }
                .fe-crumb:hover { color: #a0b4ff !important; }
                .ctx-item:hover { background: rgba(255,255,255,0.1) !important; }
                .ctx-item-danger:hover { background: rgba(255,80,80,0.15) !important; color: #ff7070 !important; }
            `}</style>

            {/* Title Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#17172a", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "7px" }}>
                    <span onClick={onClose} style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", cursor: "pointer", display: "block" }} />
                    <span onClick={onMinimize} style={{ width: 13, height: 13, borderRadius: "50%", background: "#ffbd2e", cursor: "pointer", display: "block" }} />
                    <span onClick={onMaximize} style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840", cursor: "pointer", display: "block" }} />
                </div>
                <button className="fe-nav-btn" onClick={handleBack} disabled={historyIndex === 0} style={{ background: "transparent", border: "none", color: historyIndex === 0 ? "rgba(255,255,255,0.2)" : "#ccc", cursor: historyIndex === 0 ? "not-allowed" : "pointer", borderRadius: "6px", padding: "4px 6px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="fe-nav-btn" onClick={handleForward} disabled={historyIndex >= history.length - 1} style={{ background: "transparent", border: "none", color: historyIndex >= history.length - 1 ? "rgba(255,255,255,0.2)" : "#ccc", cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer", borderRadius: "6px", padding: "4px 6px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, overflow: "hidden" }}>
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={crumb.path}>
                            {i > 0 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>›</span>}
                            <span className="fe-crumb" onClick={() => handleNavigate(crumb.path)} style={{ color: i === breadcrumbs.length - 1 ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: i === breadcrumbs.length - 1 ? 600 : 400, transition: "color 0.15s" }}>{crumb.label}</span>
                        </React.Fragment>
                    ))}
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Sidebar */}
                <div style={{ width: "155px", background: "#14141f", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "10px 6px", flexShrink: 0, overflowY: "auto" }}>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 6px", marginBottom: "6px" }}>Favorites</p>
                    {sidebarItems.map(si => (
                        <div key={si.path} className={`fe-sidebar-item ${currentPath === si.path ? "active" : ""}`} onClick={() => handleNavigate(si.path)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "7px", cursor: "pointer", color: "rgba(255,255,255,0.75)", fontSize: "13px", background: "transparent", transition: "background 0.12s" }}>
                            <span style={{ fontSize: "15px" }}>{si.emoji}</span>
                            <span>{si.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div
                        style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexWrap: "wrap", alignContent: "flex-start", gap: "6px" }}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); openCtxMenu(e, null, false); }}
                    >
                        {items.length === 0 ? (
                            <div style={{ width: "100%", textAlign: "center", color: "rgba(255,255,255,0.3)", paddingTop: "60px", fontSize: "14px" }}>
                                <span style={{ fontSize: "40px", display: "block", marginBottom: "10px", opacity: 0.4 }}>📂</span>
                                This folder is empty
                            </div>
                        ) : items.map((item: string) => {
                            const itemFullPath = currentPath === "/" ? `/${item}` : `${currentPath}/${item}`;
                            const isDir = fs[itemFullPath] !== undefined;
                            const isSelected = selectedItem === item;
                            const isCut = clipboard?.action === "cut" && clipboard.path === itemFullPath;
                            const isRenaming = renaming?.path === itemFullPath;

                            return (
                                <div
                                    key={item}
                                    className={`fe-item${isSelected ? " selected" : ""}`}
                                    onClick={() => handleItemClick(item)}
                                    onDoubleClick={() => handleItemDoubleClick(item)}
                                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); openCtxMenu(e, item, isDir); }}
                                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer", width: "90px", background: "transparent", transition: "background 0.12s, opacity 0.15s", userSelect: "none", opacity: isCut ? 0.45 : 1 }}
                                >
                                    {isDir ? <FolderIcon /> : <FileIcon />}
                                    {isRenaming ? (
                                        <input
                                            autoFocus
                                            value={renaming.value}
                                            onChange={e => setRenaming({ ...renaming, value: e.target.value })}
                                            onBlur={commitRename}
                                            onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(null); }}
                                            onClick={e => e.stopPropagation()}
                                            style={{ width: "80px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(122,162,247,0.5)", borderRadius: "4px", color: "#c0caf5", fontSize: "11px", textAlign: "center", outline: "none", padding: "2px 4px" }}
                                        />
                                    ) : (
                                        <span style={{ color: "#e0e0f0", fontSize: "11px", textAlign: "center", wordBreak: "break-all", lineHeight: 1.3 }}>{item}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Preview panel */}
                    {previewContent !== null && (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "#15151f", padding: "12px 16px", maxHeight: "120px", overflowY: "auto" }}>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Preview — {selectedItem}</p>
                            <pre style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0, fontFamily: "monospace" }}>{previewContent || "(empty file)"}</pre>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Context Menu ── */}
            {ctxMenu && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{ position: "fixed", top: ctxMenu.y, left: ctxMenu.x, zIndex: 9999, background: "#1a1b2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "5px 0", minWidth: "190px", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", fontSize: "13px" }}
                >
                    {ctxMenu.item ? (
                        <>
                            {/* Item-specific menu */}
                            <div className="ctx-item" onClick={ctxActions.open} style={menuItemStyle}><span>📂</span> Open</div>
                            {!ctxMenu.isDir && <div className="ctx-item" onClick={ctxActions.openInEditor} style={menuItemStyle}><span>✏️</span> Open with Text Editor</div>}
                            <div style={sepStyle} />
                            <div className="ctx-item" onClick={ctxActions.copy} style={menuItemStyle}><span>📋</span> Copy</div>
                            <div className="ctx-item" onClick={ctxActions.cut} style={menuItemStyle}><span>✂️</span> Cut</div>
                            {clipboard && <div className="ctx-item" onClick={ctxActions.paste} style={menuItemStyle}><span>📌</span> Paste</div>}
                            <div style={sepStyle} />
                            <div className="ctx-item" onClick={ctxActions.rename} style={menuItemStyle}><span>✏️</span> Rename</div>
                            <div className="ctx-item ctx-item-danger" onClick={ctxActions.delete} style={{ ...menuItemStyle, color: "rgba(255,120,120,0.9)" }}><span>🗑️</span> Delete</div>
                            <div style={sepStyle} />
                            <div className="ctx-item" onClick={ctxActions.properties} style={menuItemStyle}><span>ℹ️</span> Properties</div>
                        </>
                    ) : (
                        <>
                            {/* Background (empty space) menu */}
                            <div className="ctx-item" onClick={ctxActions.newFolder} style={menuItemStyle}><span>📁</span> New Folder</div>
                            <div className="ctx-item" onClick={ctxActions.newFile} style={menuItemStyle}><span>📄</span> New File</div>
                            {clipboard && (
                                <>
                                    <div style={sepStyle} />
                                    <div className="ctx-item" onClick={ctxActions.paste} style={menuItemStyle}><span>📌</span> Paste "{clipboard.name}"</div>
                                </>
                            )}

                            <div style={sepStyle} />
                            <div className="ctx-item" onClick={() => { setCtxMenu(null); }} style={{ ...menuItemStyle, color: "rgba(255,255,255,0.4)", cursor: "default" }}><span>📂</span> {currentPath}</div>
                        </>
                    )}
                </div>
            )}

            {/* ── New File / Folder Modal ── */}
            {showNewModal && (
                <div onClick={() => setShowNewModal(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#1e1f2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "22px", width: "300px", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                        <h3 style={{ color: "#c0caf5", margin: "0 0 14px", fontSize: "14px", fontWeight: 600 }}>{showNewModal === "folder" ? "📁 New Folder" : "📄 New File"}</h3>
                        <input
                            autoFocus
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") commitNew(); if (e.key === "Escape") setShowNewModal(null); }}
                            placeholder={showNewModal === "folder" ? "folder-name" : "file.txt"}
                            style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(122,162,247,0.4)", borderRadius: "8px", color: "#c0caf5", fontSize: "13px", padding: "8px 12px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                        />
                        <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowNewModal(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "7px", color: "rgba(255,255,255,0.5)", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                            <button onClick={commitNew} style={{ background: "#7aa2f7", border: "none", borderRadius: "7px", color: "#0d0e1a", fontWeight: 700, padding: "6px 16px", cursor: "pointer", fontSize: "12px" }}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Properties Modal ── */}
            {showProps && (
                <div onClick={() => setShowProps(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#1e1f2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "22px", width: "300px", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                        <h3 style={{ color: "#c0caf5", margin: "0 0 14px", fontSize: "14px", fontWeight: 600 }}>ℹ️ Properties</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.4)" }}>Name</span><span style={{ color: "#c0caf5", fontFamily: "monospace" }}>{propsName}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.4)" }}>Type</span><span style={{ color: "#c0caf5" }}>{propsIsDir ? "Folder" : "Text File"}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.4)" }}>Location</span><span style={{ color: "#c0caf5", fontFamily: "monospace", fontSize: "11px" }}>{showProps.split("/").slice(0, -1).join("/") || "/"}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.4)" }}>Size</span><span style={{ color: "#c0caf5" }}>{propsSize}</span></div>
                            {!propsIsDir && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.4)" }}>Full path</span><span style={{ color: "#c0caf5", fontFamily: "monospace", fontSize: "11px" }}>{showProps}</span></div>}
                        </div>
                        <button onClick={() => setShowProps(null)} style={{ marginTop: "16px", background: "#7aa2f7", border: "none", borderRadius: "7px", color: "#0d0e1a", fontWeight: 700, padding: "6px 16px", cursor: "pointer", fontSize: "12px", width: "100%" }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
