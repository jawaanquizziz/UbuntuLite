"use client";

import React, { useState } from "react";

export default function Login({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);

    const handleLogin = () => {
        if (password === "root123") {
            onLogin();
        } else {
            setError(true);
            setPassword("");
            // In a real app we'd trigger a shake animation via ref/class
        }
    };

    return (
        <div className="login-screen-overlay" id="login-screen">
            <div className="login-container">
                <div className="user-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <h2 className="user-name">root</h2>
                <div className={`password-box ${error ? 'shake' : ''}`}>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        placeholder="Password"
                        autoFocus
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button id="toggle-password" type="button" title="Show Password" onClick={() => setShowPassword(!showPassword)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={`eye-icon ${!showPassword ? 'crossed' : ''}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button id="login-btn" title="Log in" onClick={handleLogin}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
                <div className={`login-error ${error ? 'show' : ''}`} id="login-error">Incorrect password, please try again.</div>
                <div className="login-copyright" style={{ position: "absolute", bottom: "30px", fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", textAlign: "center", width: "100%", fontWeight: 500, letterSpacing: "1px", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                    &copy; 2026 UbuntuLite &bull; Created by <strong>Jawaan</strong>
                </div>
            </div>
            {error && (
                <style dangerouslySetInnerHTML={{
                    __html: `
               .shake {
                   animation: shake 0.4s;
               }
               @keyframes shake {
                   0% { transform: translateX(0); }
                   20% { transform: translateX(-10px); }
                   40% { transform: translateX(10px); }
                   60% { transform: translateX(-10px); }
                   80% { transform: translateX(10px); }
                   100% { transform: translateX(0); }
               }
               `}} />
            )}
        </div>
    );
}
