"use client";

import React, { useState, useEffect } from "react";
import Desktop from "@/components/Desktop";
import Login from "@/components/Login";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("root");

  useEffect(() => {
    // Log a visit
    fetch("/api/visits", { method: "POST" }).catch(console.error);
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("ubuntulite_isLoggedIn");
  };

  const handleReboot = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("ubuntulite_isLoggedIn");
  };

  return (
    <main>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Desktop initialUser={username} onLogout={handleLogout} onReboot={handleReboot} />
      )}
    </main>
  );
}
