"use client";

import React, { useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";

export default function CalculatorApp({ onClose, onMinimize, onMaximize, isMaximized, isMinimized, zIndex, onFocus }: any) {
    const { position, handleMouseDown, isDragging, isSnapped } = useDraggable(isMaximized || false);
    const [display, setDisplay] = useState("0");
    const [equation, setEquation] = useState("");

    const handleNum = (num: string) => {
        if (display === "0" || display === "Error") {
            setDisplay(num);
        } else {
            setDisplay(display + num);
        }
    };

    const handleOp = (op: string) => {
        setEquation(display + " " + op + " ");
        setDisplay("0");
    };

    const calculate = () => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(equation + display);
            setDisplay(String(result));
            setEquation("");
        } catch (e) {
            setDisplay("Error");
            setEquation("");
        }
    };

    const clear = () => {
        setDisplay("0");
        setEquation("");
    };

    return (
        <div
            className={`settings-window dark-mode ${isMaximized ? "maximized" : ""} ${isSnapped === 'left' ? 'snapped-left' : isSnapped === 'right' ? 'snapped-right' : ''}`}
            style={{
                ...(isMaximized || isSnapped !== "none")
                    ? { position: "absolute", transform: "none", borderRadius: 0, zIndex: zIndex || 10 }
                    : {
                        position: "absolute",
                        top: "auto", left: "auto",
                        width: "min(320px, 90%)", height: "min(450px, 80%)",
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        zIndex: zIndex || 10,
                        transition: isDragging ? "none" : "transform 0.1s",
                        borderRadius: "8px",
                    },
                opacity: isMinimized ? 0 : 1,
                pointerEvents: isMinimized ? "none" : "auto",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                display: "flex", flexDirection: "column", overflow: "hidden",
                background: "#222"
            }}
            onClick={onFocus}
        >
            <div
                className="terminal-header"
                style={{ flexShrink: 0, backgroundColor: "#333", borderBottom: "1px solid #444", cursor: isMaximized ? "default" : "grab" }}
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
                <div className="terminal-title">Calculator</div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", gap: "15px", backgroundColor: "#1e1e1e" }}>
                <div style={{
                    backgroundColor: "#111", borderRadius: "6px", padding: "15px",
                    display: "flex", flexDirection: "column", alignItems: "flex-end",
                    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.5)", border: "1px solid #333"
                }}>
                    <div style={{ color: "#888", fontSize: "14px", minHeight: "20px" }}>{equation}</div>
                    <div style={{ color: "#fff", fontSize: "36px", fontWeight: "300", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{display}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", flex: 1 }}>
                    <button onClick={clear} style={btnStyle("#f56565", "#fff", true)}>C</button>
                    <button onClick={() => setDisplay(String(parseFloat(display) * -1))} style={btnStyle("#444", "#fff")}>+/-</button>
                    <button onClick={() => setDisplay(String(parseFloat(display) / 100))} style={btnStyle("#444", "#fff")}>%</button>
                    <button onClick={() => handleOp("/")} style={btnStyle("#e95420", "#fff")}>÷</button>

                    <button onClick={() => handleNum("7")} style={btnStyle("#333", "#fff")}>7</button>
                    <button onClick={() => handleNum("8")} style={btnStyle("#333", "#fff")}>8</button>
                    <button onClick={() => handleNum("9")} style={btnStyle("#333", "#fff")}>9</button>
                    <button onClick={() => handleOp("*")} style={btnStyle("#e95420", "#fff")}>×</button>

                    <button onClick={() => handleNum("4")} style={btnStyle("#333", "#fff")}>4</button>
                    <button onClick={() => handleNum("5")} style={btnStyle("#333", "#fff")}>5</button>
                    <button onClick={() => handleNum("6")} style={btnStyle("#333", "#fff")}>6</button>
                    <button onClick={() => handleOp("-")} style={btnStyle("#e95420", "#fff")}>−</button>

                    <button onClick={() => handleNum("1")} style={btnStyle("#333", "#fff")}>1</button>
                    <button onClick={() => handleNum("2")} style={btnStyle("#333", "#fff")}>2</button>
                    <button onClick={() => handleNum("3")} style={btnStyle("#333", "#fff")}>3</button>
                    <button onClick={() => handleOp("+")} style={btnStyle("#e95420", "#fff")}>+</button>

                    <button onClick={() => handleNum("0")} style={{ ...btnStyle("#333", "#fff"), gridColumn: "span 2" }}>0</button>
                    <button onClick={() => handleNum(".")} style={btnStyle("#333", "#fff")}>.</button>
                    <button onClick={calculate} style={btnStyle("#e95420", "#fff")}>=</button>
                </div>
            </div>
        </div>
    );
}

const btnStyle = (bg: string, color: string, isClear: boolean = false): React.CSSProperties => ({
    backgroundColor: bg,
    color,
    border: "none",
    borderRadius: "6px",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.1s, transform 0.05s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "'Inter', sans-serif"
});
