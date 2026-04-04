"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Author {
  id: number;
  name: string;
  slug: string;
  profile_image: string | null;
}

interface Book {
  id: number;
  title: string;
  slug: string;
  main_image: string;
  authors?: Author[];
}

interface HeroSliderProps {
  books: Book[];
  loading: boolean;
}

// ─── Keyframe & complex-hover CSS that Tailwind can't express ───────────────
const CAROUSEL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;0,700;1,300;1,700&family=Jost:wght@300;400&display=swap');

  @keyframes hc-shimmer {
    from { background-position: -400% 0; }
    to   { background-position:  400% 0; }
  }
  .hc-shimmer {
    background: linear-gradient(90deg, #1a1a1d 0%, #262628 50%, #1a1a1d 100%);
    background-size: 400% 100%;
    animation: hc-shimmer 1.6s ease infinite;
  }

  @keyframes hc-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-fadeUp-1 {
    animation: hc-fadeUp 0.7s ease both;
  }
  .anim-fadeUp-2 {
    animation: hc-fadeUp 0.9s 0.18s ease both;
  }

  .hc-book-wrap { position: relative; overflow: hidden; }

  .hc-cover-img {
    display: block;
    width: 100%;
    object-fit: cover;
    transition: filter 0.38s ease, transform 0.42s ease;
  }
  .hc-book-wrap:hover .hc-cover-img {
    filter: brightness(0.42) saturate(0.5) !important;
    transform: scale(1.05);
  }

  .hc-author-panel {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    transform: translateY(101%);
    opacity: 0;
    transition:
      transform 0.40s cubic-bezier(0.34, 1.05, 0.64, 1),
      opacity   0.30s ease;
  }
  .hc-book-wrap:hover .hc-author-panel {
    transform: translateY(0%);
    opacity: 1;
  }

  .hc-author-img,
  .hc-author-initial {
    width:  clamp(30px, 4.5vw, 150px);
    height: clamp(30px, 4.5vw, 150px);
    border-radius: 50%;
    border: 1.5px solid rgba(201,168,76,0.70);
    flex-shrink: 0;
  }
  .hc-author-img   { background: #111; }
  .hc-author-initial {
    background: rgba(201,168,76,0.09);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', serif;
    font-size: clamp(10px, 1.6vw, 15px);
    color: #c9a84c;
    letter-spacing: 1px;
  }
`;

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ─── Value strip items ───────────────────────────────────────────────────────
const VALUE_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round">
        {/* Book / Library */}
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    stat: "Curated",
    label: "Timeless Classics Only",
  },

{
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round">
      {/* Pillar / Classical */}
      <path d="M4 22h16"/>
      <path d="M6 18h12"/>
      <path d="M8 6h8"/>
      <path d="M10 6v12"/>
      <path d="M14 6v12"/>
    </svg>
  ),
  stat: "Legacy",
  label: "Built on Timeless Thought",
},
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round">
        {/* Infinity / Lifetime */}
        <path d="M18 8c-1.5-2-5-2-6.5 0L10 10l-1.5-2C7 6 3.5 6 2 8s0 5 2 6 5 0 6.5-2L12 10l1.5 2c1.5 2 5 2 6.5 0s0-5-2-6z"/>
      </svg>
    ),
    stat: "Lifetime",
    label: "Access Without Limits",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function HeroSlider({ books, loading }: HeroSliderProps) {
  const [progress, setProgress]  = useState(0);
  const isPausedRef               = useRef(false);
  const rafRef                    = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      if (!isPausedRef.current) setProgress((p) => p + 0.005);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Pad or skeleton-fill to at least 8 entries
  let displayBooks: (Book | null)[] = [...books];
  if (!loading && displayBooks.length > 0) {
    while (displayBooks.length < 8) displayBooks = [...displayBooks, ...books];
  } else if (loading) {
    displayBooks = Array(8).fill(null);
  }
  const total = displayBooks.length;

  return (
    <>
      <style>{CAROUSEL_STYLES}</style>

      {/* ══ HERO WRAPPER ══ */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* Ambient top light leak */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: -60, left: "50%", transform: "translateX(-50%)",
            width: "70vw", maxWidth: 700, height: 280,
            background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)",
          }}
        />

        {/* ── Vertical rotated stamp — top-left (lg+) ── */}
        <div
          aria-hidden="true"
          className="hidden lg:flex absolute pointer-events-none items-center gap-2"
          style={{
            top: "14%", left: "1.5%",
            transform: "rotate(-90deg) translateX(-50%)",
            transformOrigin: "left center",
          }}
        >
          <div className="w-5 h-px bg-[rgba(201,168,76,0.3)]" />
          <span
            className="whitespace-nowrap uppercase tracking-[4px] text-[11px] text-[rgb(255,187,0)]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Lost Titles Preserved
          </span>
          <div className="w-5 h-px bg-[rgba(201,168,76,0.3)]" />
        </div>

       

        {/* ── Eyebrow stamp ── */}
        <div className="anim-fadeUp-1 flex items-center gap-3 mt-8 sm:mt-1 mb-5 sm:mb-6 opacity-90">
          <div
            className="w-10 h-px "
            style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.6))" }}
          />
          <div
            className="flex items-center gap-2 border border-[rgba(201,168,76,0.2)] px-3.5 py-[10px]  rounded-sm bg-[rgba(201,168,76,0.04)]"
          >
            <div className="w-[5px] h-[5px] bg-[#c9a84c] rotate-45 flex-shrink-0 opacity-70" />
            <span
              className="text-[7px] sm:text-[10px] tracking-[4px] uppercase text-[rgba(201,168,76,0.8)]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              AG Classics · A Digital Library
            </span>
            <div className="w-[5px] h-[5px] bg-[#c9a84c] rotate-45 flex-shrink-0 opacity-70" />
          </div>
          <div
            className="w-10 h-px"
            style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,0.6))" }}
          />
        </div>

        {/* ── Headline ── */}
        <h1
          className="anim-fadeUp-1 text-center m-0 px-4 font-bold text-[#f5f0e8] max-w-[820px]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(34px, 6.5vw, 72px)",
            lineHeight: 0.90,
            letterSpacing: "-0.5px",
          }}
        >
          The World's Greatest
          <br />
          <em
            className="not-italic"
            style={{
              background: "linear-gradient(90deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Authors. One Library.
          </em>
        </h1>

        {/* ── Subheading ── */}
        <p
          className="anim-fadeUp-1 text-center mt-2 mb-0 px-4 font-light italic text-white max-w-[720px] leading-[1.65]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(13px, 1.7vw, 20px)",
          }}
        >
          We continue the legacy of literary works by authors of the past, ensuring their voices remain
          relevant and their contributions continue to inspire future generations.
        </p>

        {/* ══ CAROUSEL ══ */}
        <div
          className="relative w-full overflow-hidden py-26 sm:py-25 md:py-40 mb-4 sm:mb-6 flex justify-center items-center z-10"
          style={{ perspective: "1000px" }}
          onMouseEnter={() => (isPausedRef.current = true)}
          onMouseLeave={() => (isPausedRef.current = false)}
          onTouchStart={() => (isPausedRef.current = true)}
          onTouchEnd={() => (isPausedRef.current = false)}
        >
          {displayBooks.map((book, i) => {
            let d = (i - progress) % total;
            if (d >  total / 2) d -= total;
            if (d < -total / 2) d += total;
            const absD = Math.abs(d);

            // Fewer visible books + tighter spread on mobile to stay within viewport
            const isMobile   = typeof window !== "undefined" && window.innerWidth < 640;
            const visibleRange = isMobile ? 3.0 : 3.7;
            const spread       = isMobile ? 65  : 80;

            const opacity = Math.max(0, Math.min(1, visibleRange - absD));
            if (opacity <= 0) return null;

            const scale      = Math.max(0.45, 1 - absD * 0.18);
            const zIndex     = Math.round(100 - absD * 10);
            const translateX = d * spread;
            const brightness = absD < 0.8 ? 1.09 : Math.max(0.65, 0.9 - absD * 0.06);
            const saturation = absD < 0.8 ? 1    : Math.max(0.5,  0.8 - absD * 0.08);
            const author     = book?.authors?.[0] ?? null;

            return (
              <div
                key={book ? `${book.id}-${i}` : `skel-${i}`}
                className="absolute rounded-sm overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-[rgba(201,168,76,0.15)] bg-[#131316] cursor-pointer"
                style={{
                  width: "clamp(120px, 13vw, 220px)",
                  transform: `translateX(${translateX}%) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: "box-shadow 0.3s ease",
                  pointerEvents: opacity > 0.5 ? "auto" : "none",
                }}
                onClick={() => { if (book) window.location.href = `/product/${book.slug}`; }}
              >
                {book ? (
                  <div className="hc-book-wrap">

                    {/* Cover */}
                    <img
                      src={`${API_URL}${book.main_image}`}
                      alt={book.title}
                      className="hc-cover-img"
                      style={{ filter: `brightness(${brightness}) saturate(${saturation})` }}
                    />

                    {/* Side-item dim veil */}
                    {absD >= 0.8 && (
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                        style={{ background: `rgba(0,0,0,${Math.min(0.55, absD * 0.14)})` }}
                      />
                    )}

                    {/* Center gold glow */}
                    {absD < 0.8 && (
                      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(201,168,76,0.3)] pointer-events-none" />
                    )}

                    {/* Author hover panel */}
                    {author && (
                      <div className="hc-author-panel">
                        <div
                          className="flex flex-col items-center"
                          style={{
                            background: "linear-gradient(to top, rgba(6,6,10,0.98) 0%, rgba(6,6,10,0.90) 65%, transparent 100%)",
                            padding: "clamp(10px,2vw,18px) clamp(8px,1.4vw,12px) clamp(12px,2vw,18px)",
                            gap: "clamp(5px,0.9vw,9px)",
                          }}
                        >
                          {author.profile_image ? (
                            <img
                              src={`${API_URL}${author.profile_image}`}
                              alt={author.name}
                              className="hc-author-img"
                              onError={(e) => {
                                const el   = e.currentTarget as HTMLImageElement;
                                const wrap = el.parentElement;
                                if (!wrap) return;
                                const div  = document.createElement("div");
                                div.className = "hc-author-initial";
                                div.textContent = initials(author.name);
                                wrap.replaceChild(div, el);
                              }}
                            />
                          ) : (
                            <div className="hc-author-initial">{initials(author.name)}</div>
                          )}

                          <span
                            className="uppercase text-center text-[#c9a84c] tracking-[1.5px] leading-[1.35] max-w-[92%] overflow-hidden text-ellipsis whitespace-nowrap"
                            style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(7px, 1vw, 10px)" }}
                          >
                            {author.name}
                          </span>

                          <div
                            className="h-px"
                            style={{
                              width: "38%",
                              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.55), transparent)",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hc-shimmer w-full" style={{ aspectRatio: "2/3" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ══ VALUE STRIP ══ */}
        <div className="anim-fadeUp-2 w-full flex items-stretch justify-center mt-3 mb-6 sm:mb-8 ">
          {VALUE_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 ${i > 0 ? "border-l border-[rgba(201,168,76,0.09)]" : ""}`}
            >
              <div className="mb-1.5">{item.icon}</div>
              <span
                className="text-[#c9a84c] tracking-[1px] leading-none mb-1"
                style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(12px, 1.8vw, 16px)" }}
              >
                {item.stat}
              </span>
              <span
                className="text-[9px] tracking-[2.5px] uppercase text-white"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}