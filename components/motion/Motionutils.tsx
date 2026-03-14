"use client";

import { useRef, useEffect, CSSProperties, ReactNode } from "react";
import { useMotion } from "./Motionprovider";

/* ─────────────────────────────────────
   MAGNETIC BUTTON
   Pulls slightly toward cursor when nearby.
   Wrap any CTA or nav icon with this.
───────────────────────────────────── */
interface MagneticBtnProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function MagneticBtn({
  children,
  style,
  className,
  disabled,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: MagneticBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.38;
    const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.38;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
    onMouseLeave?.(e);
  };

  return (
    <button
      ref={ref}
      data-magnetic
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        transition: "transform 0.45s cubic-bezier(0.23,1,0.32,1), background 0.3s, color 0.3s, border-color 0.3s",
        cursor: "none",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────
   PARALLAX LAYER
   Wraps content and shifts it based on
   mouse position at a given depth.
   depth=10 → subtle, depth=50 → dramatic
───────────────────────────────────── */
interface ParallaxLayerProps {
  children: ReactNode;
  depth: number;
  style?: CSSProperties;
  className?: string;
  /** "med" (default) or "slow" spring */
  spring?: "med" | "slow";
}

export function ParallaxLayer({
  children,
  depth,
  style,
  className,
  spring = "med",
}: ParallaxLayerProps) {
  const motion = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const springRef = spring === "slow" ? motion.slow : motion.med;

  useEffect(() => {
    return springRef.subscribe((sx, sy) => {
      if (!ref.current) return;
      const dx = (sx - 0.5) * depth * -1;
      const dy = (sy - 0.5) * depth * -0.6;
      ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }, [depth, springRef]);

  return (
    <div ref={ref} style={{ willChange: "transform", ...style }} className={className}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────
   REVEAL TEXT
   Staggered word-by-word entrance animation.
   Usage: <RevealText text="The AG Classics" delay={0.3} />
───────────────────────────────────── */
interface RevealTextProps {
  text: string;
  delay?: number;
  stagger?: number;
}

export function RevealText({ text, delay = 0, stagger = 0.07 }: RevealTextProps) {
  return (
    <>
      <style>{`
        @keyframes wordReveal {
          from { transform: translateY(110%) skewY(8deg); opacity: 0; }
          to   { transform: translateY(0) skewY(0deg); opacity: 1; }
        }
      `}</style>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.25em" }}>
          <span style={{
            display: "inline-block",
            animation: `wordReveal 0.9s cubic-bezier(0.16,1,0.3,1) both`,
            animationDelay: `${delay + i * stagger}s`,
          }}>
            {word}
          </span>
        </span>
      ))}
    </>
  );
}