"use client";

import { useState, useEffect, useRef } from "react";

export function useDraggable(isMaximized: boolean) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isSnapped, setIsSnapped] = useState<'none' | 'left' | 'right'>('none');
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        setIsDragging(true);
        if (isSnapped !== 'none') {
            setIsSnapped('none');
            // When unsnapping by dragging the header, smoothly restore position under cursor
            setPosition({ x: e.clientX - 200, y: e.clientY - 20 });
            dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: e.clientX - 200, initialY: e.clientY - 20 };
            return;
        }
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPosition({
                x: dragRef.current.initialX + dx,
                y: dragRef.current.initialY + dy
            });
        };

        const handleMouseUp = (e: MouseEvent) => {
            setIsDragging(false);
            if (e.clientX < 20) {
                setIsSnapped('left');
            } else if (e.clientX > window.innerWidth - 20) {
                setIsSnapped('right');
            }
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    return { position, handleMouseDown, isDragging, isSnapped };
}
