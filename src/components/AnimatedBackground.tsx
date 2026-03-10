"use client";

import React, { useEffect, useRef } from "react";

export default function AnimatedBackground({ type }: { type: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        // ===== MATRIX RAIN =====
        if (type === "ANIMATED_MATRIX") {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
            const fontSize = 14;
            const columns = canvas.width / fontSize;
            const drops: number[] = [];
            for (let x = 0; x < columns; x++) drops[x] = 1;

            const draw = () => {
                ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#0F0";
                ctx.font = fontSize + "px monospace";
                for (let i = 0; i < drops.length; i++) {
                    const text = characters.charAt(Math.floor(Math.random() * characters.length));
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();

            // ===== PARTICLES =====
        } else if (type === "ANIMATED_PARTICLES") {
            const numParticles = 100;
            const particles: any[] = [];
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 1,
                    vy: (Math.random() - 0.5) * 1,
                    size: Math.random() * 2 + 1,
                });
            }
            const draw = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                for (let i = 0; i < numParticles; i++) {
                    const p = particles[i];
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
                    for (let j = i + 1; j < numParticles; j++) {
                        const p2 = particles[j];
                        const dx = p.x - p2.x, dy = p.y - p2.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 100) {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 100})`;
                            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                        }
                    }
                }
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();

            // ===== AURORA =====
        } else if (type === "ANIMATED_AURORA") {
            let t = 0;
            const draw = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#020b18";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const waves = [
                    { color: "rgba(0, 255, 150, 0.18)", speed: 0.008, amp: 120, base: 0.35 },
                    { color: "rgba(0, 180, 255, 0.18)", speed: 0.006, amp: 100, base: 0.45 },
                    { color: "rgba(180, 0, 255, 0.14)", speed: 0.01, amp: 80, base: 0.55 },
                    { color: "rgba(0, 255, 220, 0.12)", speed: 0.005, amp: 140, base: 0.4 },
                ];
                waves.forEach(w => {
                    ctx.beginPath();
                    const baseY = canvas.height * w.base;
                    ctx.moveTo(0, baseY);
                    for (let x = 0; x <= canvas.width; x += 4) {
                        const y = baseY + Math.sin(x * 0.006 + t * w.speed * 100) * w.amp
                            + Math.sin(x * 0.012 + t * w.speed * 70) * (w.amp * 0.5);
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(canvas.width, 0);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.65);
                    grad.addColorStop(0, w.color.replace("0.1", "0.0"));
                    grad.addColorStop(0.5, w.color);
                    grad.addColorStop(1, w.color.replace("0.1", "0.0"));
                    ctx.fillStyle = grad;
                    ctx.fill();
                });
                // Stars
                if (t === 0 || (t | 0) % 300 === 0) {
                    for (let i = 0; i < 2; i++) {
                        const sx = Math.random() * canvas.width;
                        const sy = Math.random() * canvas.height * 0.3;
                        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6 + 0.2})`;
                        ctx.beginPath(); ctx.arc(sx, sy, Math.random() * 1.5 + 0.3, 0, Math.PI * 2); ctx.fill();
                    }
                }
                t++;
                animationFrameId = requestAnimationFrame(draw);
            };
            // Pre-draw stars
            for (let i = 0; i < 120; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.1})`;
                ctx.beginPath(); ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height * 0.5, Math.random() * 1.2 + 0.2, 0, Math.PI * 2); ctx.fill();
            }
            draw();

            // ===== STARFIELD =====
        } else if (type === "ANIMATED_STARFIELD") {
            const stars: any[] = [];
            for (let i = 0; i < 300; i++) {
                stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * canvas.width });
            }
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const draw = () => {
                ctx.fillStyle = "rgba(2, 4, 15, 0.3)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                stars.forEach(s => {
                    s.z -= 3;
                    if (s.z <= 0) { s.x = Math.random() * canvas.width; s.y = Math.random() * canvas.height; s.z = canvas.width; }
                    const sx = (s.x - cx) * (canvas.width / s.z) + cx;
                    const sy = (s.y - cy) * (canvas.width / s.z) + cy;
                    const size = (1 - s.z / canvas.width) * 4;
                    const brightness = Math.floor((1 - s.z / canvas.width) * 255);
                    ctx.fillStyle = `rgb(${brightness},${brightness},${255})`;
                    ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
                });
                animationFrameId = requestAnimationFrame(draw);
            };
            ctx.fillStyle = "#02040f";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            draw();

            // ===== LAVA LAMP =====
        } else if (type === "ANIMATED_LAVA") {
            const blobs: any[] = [];
            for (let i = 0; i < 8; i++) {
                blobs.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
                    r: Math.random() * 100 + 80,
                    hue: Math.random() * 60 + 10,
                });
            }
            const draw = () => {
                ctx.fillStyle = "rgba(5, 2, 15, 1)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                blobs.forEach(b => {
                    b.x += b.vx; b.y += b.vy;
                    if (b.x < -b.r) b.x = canvas.width + b.r;
                    if (b.x > canvas.width + b.r) b.x = -b.r;
                    if (b.y < -b.r) b.y = canvas.height + b.r;
                    if (b.y > canvas.height + b.r) b.y = -b.r;
                    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                    grad.addColorStop(0, `hsla(${b.hue},100%,60%,0.6)`);
                    grad.addColorStop(0.5, `hsla(${b.hue + 20},100%,40%,0.3)`);
                    grad.addColorStop(1, "transparent");
                    ctx.fillStyle = grad;
                    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
                });
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();

            // ===== CYBERPUNK RAIN =====
        } else if (type === "ANIMATED_CYBERPUNK") {
            const fontSize = 16;
            const cols = Math.ceil(canvas.width / fontSize);
            const drops: number[] = Array(cols).fill(0);
            const colors = ["#00fff9", "#ff00c8", "#ffe600", "#ffffff"];
            const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ!@#$%^&*";
            const draw = () => {
                ctx.fillStyle = "rgba(0, 0, 20, 0.08)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < cols; i++) {
                    ctx.font = `bold ${fontSize}px monospace`;
                    const c = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.fillText(c, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) drops[i] = 0;
                    drops[i]++;
                }
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();

            // ===== GEOMETRIC WAVES =====
        } else if (type === "ANIMATED_WAVES") {
            let t = 0;
            const draw = () => {
                ctx.fillStyle = "#070b1a";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const layers = [
                    { color: "rgba(99, 160, 255, 0.25)", offset: 0, speed: 0.02 },
                    { color: "rgba(50, 100, 220, 0.3)", offset: Math.PI / 3, speed: 0.015 },
                    { color: "rgba(30, 60, 180, 0.35)", offset: Math.PI * 2 / 3, speed: 0.025 },
                ];
                layers.forEach(l => {
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height);
                    for (let x = 0; x <= canvas.width; x += 5) {
                        const y = canvas.height * 0.55
                            + Math.sin(x * 0.008 + t * l.speed + l.offset) * 70
                            + Math.sin(x * 0.02 + t * l.speed * 0.7 + l.offset) * 30;
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.closePath();
                    ctx.fillStyle = l.color;
                    ctx.fill();
                });
                t++;
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();
        }

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [type]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                zIndex: 0, pointerEvents: "none"
            }}
        />
    );
}
