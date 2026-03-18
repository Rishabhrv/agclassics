"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import LibraryBookCard from "./LibraryBookCard";

type Book = {
  id: number;
  title: string;
  slug: string;
  main_image: string;
};

type Props = {
  title: string;
  categorySlug: string;
  visibleCount?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const sectionStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  .lib-cat-section { padding: 40px 32px 0; }

  .lib-cat-eyebrow {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #8a6f2e;
    display: block;
    margin-bottom: 4px;
  }
  .lib-cat-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
    line-height: 1.1;
  }

  .lib-cat-see-all {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #6b6b70;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.3s;
    padding: 6px 0;
    white-space: nowrap;
  }
  .lib-cat-see-all:hover { color: #c9a84c; }
  .lib-cat-see-all::after {
    content: '';
    display: block;
    width: 18px;
    height: 1px;
    background: currentColor;
    transition: width 0.3s;
  }
  .lib-cat-see-all:hover::after { width: 30px; }

  /* Slider arrows */
  .lib-slider-btn {
    position: absolute;
    top: 50%; transform: translateY(-50%);
    width: 32px; height: 32px;
    background: rgba(10,10,11,0.85);
    border: 1px solid rgba(201,168,76,0.2);
    color: #c9a84c;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.3s, border-color 0.3s;
  }
  .lib-slider-btn:hover { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.5); }
  .lib-slider-btn-prev { left: -14px; }
  .lib-slider-btn-next { right: -14px; }

  /* Dot indicators */
  .lib-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: rgba(201,168,76,0.2);
    cursor: pointer;
    border: none;
    padding: 0;
    transition: background 0.3s, transform 0.3s;
  }
  .lib-dot.active { background: #c9a84c; transform: scale(1.3); }

  /* Edge fades */
  .lib-slider-fade-left, .lib-slider-fade-right {
    position: absolute; top: 0; bottom: 0; width: 40px;
    pointer-events: none; z-index: 5;
  }
  .lib-slider-fade-left  { left: 0;  background: linear-gradient(to right, #0f0f10, transparent); }
  .lib-slider-fade-right { right: 0; background: linear-gradient(to left,  #0f0f10, transparent); }

  /* Bottom divider */
  .lib-section-divider {
    display: flex; align-items: center; gap: 14px;
    margin-top: 32px; padding: 0 4px;
  }
  .lib-section-divider-line { flex: 1; height: 1px; background: rgba(201,168,76,0.08); }
  .lib-section-divider-diamond {
    width: 4px; height: 4px; transform: rotate(45deg);
    background: #8a6f2e; opacity: 0.4; flex-shrink: 0;
  }

  @keyframes libSkeletonShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .lib-skeleton {
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: libSkeletonShimmer 1.8s infinite;
    border-radius: 1px;
  }
`;

// Card width in pixels — gives comfortably large covers at any screen size
const CARD_WIDTH = 180;
const CARD_GAP = 3;

export default function LibraryCategorySection({
  title,
  categorySlug,
  visibleCount = 6,
}: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const maxStart = Math.max(0, books.length - visibleCount);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/mylibrary/category/${categorySlug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setBooks(Array.isArray(d) ? d.slice(0, 12) : []))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  useEffect(() => {
    if (books.length <= visibleCount || isPaused) return;
    intervalRef.current = setInterval(() => {
      setStart((prev) => (prev >= maxStart ? 0 : prev + 1));
    }, 3200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [books, visibleCount, maxStart, isPaused]);

  const prev = () => { setStart((p) => Math.max(0, p - 1)); };
  const next = () => { setStart((p) => Math.min(maxStart, p + 1)); };

  // Pixel offset per step
  const stepPx = CARD_WIDTH + CARD_GAP;

  if (!loading && !books.length) return null;

  return (
    <>
      <style>{sectionStyles}</style>

      <section
        className="lib-cat-section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ── HEADER ── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="lib-cat-eyebrow">Collection</span>
            <h2 className="lib-cat-title">{title}</h2>
          </div>
          <Link href={`/library/category/${categorySlug}`} className="lib-cat-see-all">
            See All
          </Link>
        </div>

        {/* ── SKELETON ── */}
        {loading && (
          <div style={{ display: "flex", gap: CARD_GAP }}>
            {[...Array(visibleCount)].map((_, i) => (
              <div
                key={i}
                className="lib-skeleton"
                style={{ width: CARD_WIDTH, flexShrink: 0, aspectRatio: "2/3" }}
              />
            ))}
          </div>
        )}

        {/* ── SLIDER ── */}
        {!loading && (
          <div className="relative" style={{ paddingBottom: 4 }}>
            {/* Edge fades */}
            {start > 0      && <div className="lib-slider-fade-left" />}
            {start < maxStart && <div className="lib-slider-fade-right" />}

            {/* Prev */}
            {start > 0 && (
              <button className="lib-slider-btn lib-slider-btn-prev" onClick={prev} aria-label="Previous">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Track */}
            <div style={{ overflow: "hidden" }}>
              <div
                ref={trackRef}
                style={{
                  display: "flex",
                  gap: CARD_GAP,
                  transform: `translateX(-${start * stepPx}px)`,
                  transition: "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                {books.map((book) => (
                  <div
                    key={book.id}
                    style={{ width: CARD_WIDTH, flexShrink: 0 }}
                  >
                    {/* LibraryBookCard fills 100% of this 180px wrapper */}
                    <LibraryBookCard book={book} />
                  </div>
                ))}
              </div>
            </div>

            {/* Next */}
            {start < maxStart && (
              <button className="lib-slider-btn lib-slider-btn-next" onClick={next} aria-label="Next">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Dots */}
            {books.length > visibleCount && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                {[...Array(maxStart + 1)].map((_, i) => (
                  <button
                    key={i}
                    className={`lib-dot ${i === start ? "active" : ""}`}
                    onClick={() => setStart(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECTION DIVIDER ── */}
        <div className="lib-section-divider">
          <div className="lib-section-divider-line" />
          <div className="lib-section-divider-diamond" />
          <div className="lib-section-divider-line" />
        </div>
      </section>
    </>
  );
}