"use client";

import React, { useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";

interface AppProps {
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
    isMaximized?: boolean;
    isMinimized?: boolean;
    zIndex?: number;
    onFocus?: () => void;
}

export default function TicTacToeApp({ onClose, onMinimize, onMaximize, isMaximized, isMinimized, zIndex, onFocus }: AppProps) {
    const { position, handleMouseDown, isDragging, isSnapped } = useDraggable(isMaximized || false);
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    const checkWinner = (squares: (string | null)[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const getBestMove = (squares: (string | null)[]) => {
        // Very basic AI: pick first available spot
        // Can be improved with minimax, but random/first available works for now
        const available = squares.map((sq, i) => sq === null ? i : null).filter(val => val !== null) as number[];
        if (available.length === 0) return -1;
        // Pick random available
        return available[Math.floor(Math.random() * available.length)];
    };

    const handleClick = (index: number) => {
        if (board[index] || checkWinner(board) || !isXNext) return;

        const newBoard = [...board];
        newBoard[index] = "X";
        setBoard(newBoard);
        setIsXNext(false);
    };

    React.useEffect(() => {
        if (!isXNext && !checkWinner(board) && board.includes(null)) {
            const timer = setTimeout(() => {
                const aiMove = getBestMove(board);
                if (aiMove !== -1) {
                    const newBoard = [...board];
                    newBoard[aiMove] = "O";
                    setBoard(newBoard);
                    setIsXNext(true);
                }
            }, 500 + Math.random() * 500); // 0.5 - 1s delay
            return () => clearTimeout(timer);
        }
    }, [isXNext, board]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };

    const winner = checkWinner(board);
    const isDraw = !winner && board.every(square => square !== null);
    const status = winner
        ? (winner === "X" ? "You Won!" : "Computer Won!")
        : isDraw
            ? "Draw!"
            : (isXNext ? "Your Turn (X)" : "Computer's Turn (O)...");

    return (
        <div
            className={`tictactoe-window dark-mode ${isMaximized ? "maximized" : ""} ${isSnapped === 'left' ? 'snapped-left' : isSnapped === 'right' ? 'snapped-right' : ''}`}
            style={{
                ...(isMaximized || isSnapped !== "none")
                    ? { position: "absolute", transform: "none", borderRadius: 0, zIndex: zIndex || 10 }
                    : {
                        position: "absolute",
                        top: "15%", left: "auto",
                        width: "min(400px, 95%)", height: "min(520px, 85%)",
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        zIndex: zIndex || 10,
                        transition: isDragging ? "none" : "transform 0.1s",
                        borderRadius: "12px",
                    },
                opacity: isMinimized ? 0 : 1,
                pointerEvents: isMinimized ? "none" : "auto",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                display: "flex", flexDirection: "column", overflow: "hidden",
                background: "linear-gradient(135deg, #1e1e24, #121214)",
                fontFamily: "'Inter', sans-serif"
            }}
            onClick={onFocus}
        >
            <div
                className="terminal-header"
                style={{ flexShrink: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: isMaximized ? "default" : "grab" }}
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
                <div className="terminal-title" style={{ color: "#eee", fontWeight: 600 }}>Tic Tac Toe Neon</div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                <h2 style={{
                    color: "#fff",
                    textShadow: "0 0 10px rgba(255,255,255,0.8)",
                    marginBottom: "20px",
                    fontSize: "24px",
                    fontWeight: 300,
                    letterSpacing: "2px"
                }}>{status}</h2>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    background: "rgba(0,0,0,0.2)",
                    padding: "15px",
                    borderRadius: "16px",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
                }}>
                    {board.map((square, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            style={{
                                width: "90px",
                                height: "90px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                fontSize: "48px",
                                fontWeight: "bold",
                                color: square === "X" ? "#00ffcc" : square === "O" ? "#ff00ff" : "transparent",
                                textShadow: square === "X" ? "0 0 15px #00ffcc" : square === "O" ? "0 0 15px #ff00ff" : "none",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0
                            }}
                            onMouseEnter={e => {
                                if (!board[i] && !winner) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                }
                            }}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        >
                            {square}
                        </button>
                    ))}
                </div>

                <button
                    onClick={resetGame}
                    style={{
                        marginTop: "30px",
                        padding: "12px 30px",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "30px",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                        e.currentTarget.style.boxShadow = "0 0 15px rgba(255,255,255,0.5)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                    }}
                >
                    Restart Game
                </button>
            </div>
        </div >
    );
}
