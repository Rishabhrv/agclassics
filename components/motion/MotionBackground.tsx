"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./Motionprovider";
/* ─────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { rawMouse } = useMotion();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build particles
    const COUNT = 65;
    const particles = Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 0.4,
      opacity: Math.random() * 0.35 + 0.06,
      speedX: (Math.random() - 0.5) * 0.012,
      speedY: -(Math.random() * 0.018 + 0.006),
      drift: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.4 + 0.15,
      isDiamond: i % 5 === 0,
    }));

    let t = 0;
    let raf = 0;

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = rawMouse.current.x * canvas.width;
      const my = rawMouse.current.y * canvas.height;

      particles.forEach(p => {
        const px = (p.x / 100) * canvas.width;
        const py = (p.y / 100) * canvas.height;
        const dx = px - mx, dy = py - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repel = dist < 160 ? (1 - dist / 160) * 0.07 : 0;

        p.x += p.speedX + Math.sin(t * p.driftSpeed + p.drift) * 0.004 + (dx / (dist || 1)) * repel;
        p.y += p.speedY + Math.cos(t * p.driftSpeed + p.drift) * 0.003 + (dy / (dist || 1)) * repel;
        if (p.y < -2)   p.y = 102;
        if (p.x < -2)   p.x = 102;
        if (p.x > 102)  p.x = -2;

        const cx = (p.x / 100) * canvas.width;
        const cy = (p.y / 100) * canvas.height;
        const prox = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
        const glow = prox < 200 ? (1 - prox / 200) * 0.9 + 1 : 1;
        const alpha = Math.min(p.opacity * glow, 0.88);

        ctx.save();
        if (p.isDiamond) {
          ctx.translate(cx, cy);
          ctx.rotate(Math.PI / 4 + t * 0.3);
          ctx.fillStyle = `rgba(201,168,76,${alpha})`;
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,168,76,${alpha})`;
          ctx.fill();
        }
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.85 }}
    />
  );
}

/* ─────────────────────────────────────
   PARALLAX GRID
───────────────────────────────────── */
function ParallaxGrid() {
  const { slow } = useMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return slow.subscribe((sx, sy) => {
      if (!ref.current) return;
      ref.current.style.transform = `translate(${(sx - 0.5) * -22}px, ${(sy - 0.5) * -14}px)`;
    });
  }, [slow]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", inset: "-5%", zIndex: 1, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        transition: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────
   LIGHT BEAMS
───────────────────────────────────── */
const BEAMS = [
  { angle: -35, width: 180, height: "80vh", xPct: 15, delay: 0 },
  { angle: -20, width: 90,  height: "65vh", xPct: 35, delay: 0.3 },
  { angle: -42, width: 130, height: "90vh", xPct: 62, delay: 0.15 },
  { angle: -28, width: 70,  height: "55vh", xPct: 80, delay: 0.5 },
];

function LightBeams() {
  const { med } = useMotion();
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    return med.subscribe((sx, sy) => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const b = BEAMS[i];
        const dx = (sx - 0.5) * (15 + i * 5);
        const dy = (sy - 0.5) * (8  + i * 3);
        const intensify = 1 - Math.abs(sx - b.xPct / 100) * 1.6;
        el.style.transform = `translateX(${dx}px) translateY(${dy}px) rotate(${b.angle}deg)`;
        el.style.opacity   = String(Math.max(0.03, Math.min(0.15, 0.07 + intensify * 0.08)));
      });
    });
  }, [med]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {BEAMS.map((b, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el; }}
          style={{
            position: "absolute",
            top: "-10vh",
            left: `${b.xPct}%`,
            width: b.width,
            height: b.height,
            background: "linear-gradient(to bottom, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 60%, transparent 100%)",
            transform: `rotate(${b.angle}deg)`,
            transformOrigin: "top center",
            opacity: 0.07,
            filter: "blur(14px)",
          }}
        />
      ))}
    </div>
  );
}


/* ─────────────────────────────────────
   FLOATING GEOMETRIC ORNAMENTS
───────────────────────────────────── */
const ORNAMENTS = [
  { x: "8%",  y: "20%", size: 180, depth: 35, opacity: 0.042 },
  { x: "88%", y: "15%", size: 120, depth: 22, opacity: 0.05  },
  { x: "5%",  y: "75%", size: 90,  depth: 50, opacity: 0.038 },
  { x: "92%", y: "70%", size: 150, depth: 28, opacity: 0.032 },
  { x: "50%", y: "4%",  size: 65,  depth: 45, opacity: 0.055 },
];

function FloatingOrnaments() {
  const { med } = useMotion();
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    return med.subscribe((sx, sy) => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const o = ORNAMENTS[i];
        const dx = (sx - 0.5) * o.depth;
        const dy = (sy - 0.5) * o.depth * 0.6;
        el.style.transform = `translate(calc(${o.x} + ${dx}px - 50%), calc(${o.y} + ${dy}px - 50%)) rotate(${45 + dx * 0.3}deg)`;
      });
    });
  }, [med]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
      {ORNAMENTS.map((o, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el; }}
          style={{
            position: "absolute", top: 0, left: 0,
            width: o.size, height: o.size,
            border: `1px solid rgba(201,168,76,${o.opacity})`,
            transform: `translate(calc(${o.x} - 50%), calc(${o.y} - 50%)) rotate(45deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────
   BOKEH DEPTH BLOBS
───────────────────────────────────── */
const BLOBS = [
  { x: 10, y: 30, size: 300, color: "rgba(201,168,76,0.025)", depth: 80 },
  { x: 85, y: 60, size: 250, color: "rgba(139,58,58,0.02)",   depth: 60 },
  { x: 50, y: 80, size: 420, color: "rgba(201,168,76,0.018)", depth: 42 },
];

function BokehLayer() {
  const { slow } = useMotion();
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    return slow.subscribe((sx, sy) => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const b = BLOBS[i];
        el.style.left = `calc(${b.x}% + ${(sx - 0.5) * b.depth}px)`;
        el.style.top  = `calc(${b.y}% + ${(sy - 0.5) * b.depth * 0.7}px)`;
      });
    });
  }, [slow]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none" }}>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el; }}
          style={{
            position: "absolute",
            width: b.size, height: b.size,
            borderRadius: "50%",
            background: b.color,
            filter: "blur(60px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────
   GRAIN + VIGNETTE overlays
───────────────────────────────────── */
function GrainVignette() {
  return (
    <>
      <style>{`
        @keyframes grainDrift {
          0%,100%{transform:translate(0,0)}
          20%{transform:translate(-1%,1%)}
          40%{transform:translate(1%,-1%)}
          60%{transform:translate(-0.5%,0.5%)}
          80%{transform:translate(0.5%,-0.5%)}
        }
        @keyframes vigBreathe {
          0%,100%{opacity:0.55} 50%{opacity:0.72}
        }
      `}</style>

      {/* Grain */}
      <div style={{
        position: "fixed", inset: "-10%", zIndex: 4, pointerEvents: "none",
        width: "120%", height: "120%",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        opacity: 0.03,
        mixBlendMode: "overlay",
        animation: "grainDrift 8s ease-in-out infinite",
      }} />

      {/* Vignette */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 4, pointerEvents: "none",
        background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        animation: "vigBreathe 7s ease-in-out infinite",
      }} />

      {/* Static corner ambers */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 50% 40% at 0% 100%, rgba(201,168,76,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 40% 35% at 100% 0%, rgba(139,58,58,0.03) 0%, transparent 55%)
        `,
      }} />
    </>
  );
}

/* ─────────────────────────────────────
   MAIN EXPORT — drop once in layout
───────────────────────────────────── */
export default function MotionBackground() {
  return (
    <>
      {/* Base bg */}
      <div style={{ position: "fixed", inset: 0, background: "#0a0a0b", zIndex: 0 }} />

      <ParticleCanvas />
      <ParallaxGrid />
      <LightBeams />
      <FloatingOrnaments />
      <BokehLayer />
      <GrainVignette />
    </>
  );
}