"use client";

import { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from "react";

interface SpringRef {
  setTarget: (x: number, y: number) => void;
  subscribe: (fn: (x: number, y: number) => void) => () => void;
  val: React.MutableRefObject<{ x: number; y: number }>;
}

interface MotionContextType {
  slow: SpringRef;   // stiffness 3.5 — for deep bg layers
  med: SpringRef;    // stiffness 6   — for mid parallax
  fast: SpringRef;   // stiffness 12  — for cursor ring
  rawMouse: React.MutableRefObject<{ x: number; y: number }>;
}

const MotionContext = createContext<MotionContextType | null>(null);

function makeSpring(stiffness: number): SpringRef {
  const val = { current: { x: 0.5, y: 0.5 } };
  const target = { current: { x: 0.5, y: 0.5 } };
  const listeners: ((x: number, y: number) => void)[] = [];
  let raf = 0;
  let lastTime = performance.now();

  const setTarget = (x: number, y: number) => { target.current = { x, y }; };
  const subscribe = (fn: (x: number, y: number) => void) => {
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); };
  };

  const tick = (now: number) => {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const k = 1 - Math.exp(-stiffness * dt);
    val.current.x += (target.current.x - val.current.x) * k;
    val.current.y += (target.current.y - val.current.y) * k;
    listeners.forEach(fn => fn(val.current.x, val.current.y));
    raf = requestAnimationFrame(tick);
  };

  // Start loop
  if (typeof window !== "undefined") raf = requestAnimationFrame(tick);

  return { setTarget, subscribe, val: val as any };
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const slow = useRef(makeSpring(3.5));
  const med  = useRef(makeSpring(6));
  const fast = useRef(makeSpring(12));
  const rawMouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      rawMouse.current = { x, y };
      slow.current.setTarget(x, y);
      med.current.setTarget(x, y);
      fast.current.setTarget(x, y);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <MotionContext.Provider value={{
      slow: slow.current,
      med: med.current,
      fast: fast.current,
      rawMouse,
    }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used inside MotionProvider");
  return ctx;
}