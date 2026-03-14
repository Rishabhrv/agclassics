"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "./Motionprovider";
export default function CustomCursor() {
  const { fast, rawMouse } = useMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const hoveredRef = useRef(false);

  // Outer ring: follows spring position
  useEffect(() => {
    return fast.subscribe((sx, sy) => {
      if (!outerRef.current) return;
      const x = sx * window.innerWidth;
      const y = sy * window.innerHeight;
      const scale = hoveredRef.current ? 2.1 : 1;
      outerRef.current.style.transform = `translate(${x - 22}px, ${y - 22}px) scale(${scale})`;
    });
  }, [fast]);

  // Inner dot: follows raw mouse exactly
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!innerRef.current) return;
      innerRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Hover + click detection
  useEffect(() => {
    const over = (e: MouseEvent) => {
      const isHoverable = (e.target as Element)?.closest?.("button, a, [data-magnetic]") !== null;
      hoveredRef.current = isHoverable;
      setHovered(isHoverable);
    };
    const down = () => setClicked(true);
    const up   = () => setClicked(false);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup",   up);
    return () => {
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup",   up);
    };
  }, []);

  return (
    <>
      <style>{`
        html, html * { cursor: none !important; }
      `}</style>

      {/* Outer ring */}
      <div
        ref={outerRef}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 9999,
          width: 44, height: 44,
          border: `1px solid rgba(201,168,76,${hovered ? 0.75 : 0.5})`,
          borderRadius: "50%",
          pointerEvents: "none",
          transition: "transform 0.12s cubic-bezier(0.23,1,0.32,1), border-color 0.3s, background 0.3s",
          background: hovered ? "rgba(201,168,76,0.07)" : clicked ? "rgba(201,168,76,0.04)" : "transparent",
          mixBlendMode: "normal",
        }}
      />

      {/* Inner dot */}
      <div
        ref={innerRef}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 10000,
          width: 6, height: 6,
          background: "#c9a84c",
          borderRadius: "50%",
          pointerEvents: "none",
          transition: "width 0.2s, height 0.2s, margin 0.2s",
        }}
      />
    </>
  );
}