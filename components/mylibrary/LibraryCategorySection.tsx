"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import LibraryBookCard from "./LibraryBookCard";

type Book = { id: number; title: string; slug: string; main_image: string };
type Props = { title: string; categorySlug: string; visibleCount?: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const minimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Cinzel:wght@400&family=Jost:wght@300;400;500&display=swap');

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

  /* Mobile horizontal scroll: hide scrollbar */
  .lib-mobile-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }
  .lib-mobile-scroll::-webkit-scrollbar { display: none; }
  .lib-mobile-scroll > * { scroll-snap-align: start; }

  /* See All hover arrow extend */
  .lib-see-all::after {
    content: '';
    display: block;
    width: 18px;
    height: 1px;
    background: currentColor;
    transition: width 0.3s;
  }
  .lib-see-all:hover::after { width: 30px; }
`;

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

  /* Auto-scroll on desktop */
  useEffect(() => {
    if (books.length <= visibleCount || isPaused) return;
    intervalRef.current = setInterval(() => {
      setStart((prev) => (prev >= maxStart ? 0 : prev + 1));
    }, 3200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [books, visibleCount, maxStart, isPaused]);

  const prev = () => setStart((p) => Math.max(0, p - 1));
  const next = () => setStart((p) => Math.min(maxStart, p + 1));

  const stepPx = CARD_WIDTH + CARD_GAP;

  if (!loading && !books.length) return null;

  return (
    <>
      <style>{minimalStyles}</style>

      <section
        className="px-4 sm:px-8 pt-8 sm:pt-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ── HEADER ── */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h2
              className="text-[clamp(20px,3vw,30px)] font-light italic text-[#f5f0e8] leading-[1.1]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {title}
            </h2>
          </div>

          <Link
            href={`/library/category/${categorySlug}`}
            className="lib-see-all text-[9px] tracking-[3px] uppercase text-[#6b6b70] no-underline flex items-center gap-1.5 hover:text-[#c9a84c] transition-colors duration-300 pb-1.5 whitespace-nowrap"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            See All
          </Link>
        </div>

        {/* ── SKELETON ── */}
        {loading && (
          <div className="flex gap-[3px]">
            {[...Array(visibleCount)].map((_, i) => (
              <div
                key={i}
                className="lib-skeleton shrink-0"
                style={{ width: CARD_WIDTH, aspectRatio: "2/3" }}
              />
            ))}
          </div>
        )}

        {/* ── MOBILE: native horizontal scroll ── */}
        {!loading && (
          <>
            {/* Mobile scroll (below md) */}
            <div className="md:hidden lib-mobile-scroll -mx-4 px-4">
              <div className="flex gap-[3px]" style={{ width: "max-content" }}>
                {books.map((book) => (
                  <div key={book.id} style={{ width: CARD_WIDTH, flexShrink: 0 }}>
                    <LibraryBookCard book={book} />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: controlled slider (md+) */}
            <div className="hidden md:block">
              <div
                className="relative"
                style={{ paddingBottom: 4 }}
              >
                {/* Edge fades */}
                {start > 0 && (
                  <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-[#0f0f10] to-transparent pointer-events-none z-[5]" />
                )}
                {start < maxStart && (
                  <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-[#0f0f10] to-transparent pointer-events-none z-[5]" />
                )}

                {/* Prev */}
                {start > 0 && (
                  <button
                    className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-8 h-8 bg-[rgba(10,10,11,0.85)] border border-[rgba(201,168,76,0.2)] text-[#c9a84c] flex items-center justify-center cursor-pointer z-10 hover:bg-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.5)] transition-all duration-300"
                    onClick={prev}
                    aria-label="Previous"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                )}

                {/* Track */}
                <div className="overflow-hidden">
                  <div
                    className="flex"
                    style={{
                      gap: CARD_GAP,
                      transform: `translateX(-${start * stepPx}px)`,
                      transition: "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    }}
                  >
                    {books.map((book) => (
                      <div key={book.id} style={{ width: CARD_WIDTH, flexShrink: 0 }}>
                        <LibraryBookCard book={book} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next */}
                {start < maxStart && (
                  <button
                    className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-8 h-8 bg-[rgba(10,10,11,0.85)] border border-[rgba(201,168,76,0.2)] text-[#c9a84c] flex items-center justify-center cursor-pointer z-10 hover:bg-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.5)] transition-all duration-300"
                    onClick={next}
                    aria-label="Next"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}

                {/* Dots */}
                {books.length > visibleCount && (
                  <div className="flex justify-center gap-2 mt-4">
                    {[...Array(maxStart + 1)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setStart(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`w-1 h-1 rounded-full border-none p-0 cursor-pointer transition-all duration-300 ${
                          i === start
                            ? "bg-[#c9a84c] scale-[1.3]"
                            : "bg-[rgba(201,168,76,0.2)]"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── SECTION DIVIDER ── */}
        <div className="flex items-center gap-3.5 mt-8 px-1">
          <div className="flex-1 h-px bg-[rgba(201,168,76,0.08)]" />
          <div className="w-1 h-1 rotate-45 bg-[#8a6f2e] opacity-40 shrink-0" />
          <div className="flex-1 h-px bg-[rgba(201,168,76,0.08)]" />
        </div>
      </section>
    </>
  );
}