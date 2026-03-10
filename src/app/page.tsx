"use client";

import React, { useState, useEffect } from "react";
import Desktop from "@/components/Desktop";
import Login from "@/components/Login";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("root");

  useEffect(() => {
    // Log a visit when the application initially loads
    fetch("/api/visits", { method: "POST" }).catch(console.error);
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  return (
    <main>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Desktop initialUser={username} />
      )}
    </main>
  );
}
