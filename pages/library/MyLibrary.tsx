"use client";

import React, { useEffect, useState } from "react";
import LibraryFooter from "@/components/mylibrary/LibraryFooter";
import LibrarySidebar from "@/components/mylibrary/LibrarySidebar";
import LibraryHeader from "@/components/mylibrary/LibraryHeader";
import LibraryCategorySection from "@/components/mylibrary/LibraryCategorySection";
import "../../app/globals.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Category = { id: number; name: string; slug: string };

const minimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Cinzel:wght@400&family=Jost:wght@300;400&display=swap');

  /* Noise texture overlay */
  .lib-noise::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  /* Decorative quote mark on welcome banner */
  .lib-welcome-quote::after {
    content: '\u201C';
    position: absolute;
    right: 20px; top: -30px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 200px;
    color: rgba(201,168,76,0.03);
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }

  /* Shimmer skeleton */
  @keyframes libCatShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .lib-skel {
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: libCatShimmer 1.8s infinite;
  }

  /* Thin scrollbar */
  .lib-scroll-area {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,168,76,0.12) transparent;
  }
  .lib-scroll-area::-webkit-scrollbar { width: 4px; }
  .lib-scroll-area::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.12);
    border-radius: 2px;
  }
`;

export default function MyLibrary() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/mylibrary/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  return (
    <>
      <style>{minimalStyles}</style>

      <div className="lib-noise bg-[#0f0f10] min-h-screen flex">
        <LibrarySidebar />

        {/* Main content — full width on mobile, offset by sidebar on desktop */}
        <div className="relative z-[1] flex flex-1 flex-col min-w-0">
          <LibraryHeader />

          <div className="lib-scroll-area flex-1">

            {/* ── WELCOME BANNER ── */}
            <div className="lib-welcome-quote relative px-4 sm:px-8 pt-8 sm:pt-9 overflow-hidden">
              <span
                className="text-[8px] tracking-[5px] uppercase text-[#ecab13] block mb-1.5"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Your Reading Space
              </span>
              <h1
                className="text-[clamp(26px,4vw,42px)] font-light italic text-[#f5f0e8] leading-[1.15] mb-2.5"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Welcome to My Library
              </h1>
              <p
                className="text-[12px] text-white tracking-[0.3px] leading-[1.6] max-w-[420px]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Explore curated collections, pick up where you left off, and
                discover new titles chosen for those who read with intention.
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3.5 mt-6">
                <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
                <span
                  className="text-ms tracking-[4px] uppercase text-[#ecab13]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Collections
                </span>
                <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
              </div>
            </div>

            {/* ── LOADING: skeleton rows ── */}
            {loadingCats && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="px-4 sm:px-8 pt-8 sm:pt-10">
                    <div
                      className="lib-skel h-3 w-36 mb-2 rounded-[1px]"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                    <div
                      className="lib-skel h-7 w-56 mb-5 rounded-[1px]"
                      style={{ animationDelay: `${i * 0.1 + 0.05}s` }}
                    />
                    <div className="flex gap-[3px]">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className="lib-skel flex-1 rounded-[1px]"
                          style={{
                            aspectRatio: "2/3",
                            animationDelay: `${j * 0.06}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── DYNAMIC CATEGORY SECTIONS ── */}
            {!loadingCats &&
              categories.map((cat) => (
                <LibraryCategorySection
                  key={cat.slug}
                  title={cat.name}
                  categorySlug={cat.slug}
                  visibleCount={6}
                />
              ))}

            {/* ── EMPTY STATE ── */}
            {!loadingCats && categories.length === 0 && (
              <div className="flex flex-col items-center gap-3.5 py-20 px-5 text-center">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8a6f2e"
                  strokeWidth="1"
                  opacity={0.4}
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <p
                  className="text-[24px] font-light italic text-[#f5f0e8]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  No collections yet
                </p>
                <p
                  className="text-[12px] text-[#6b6b70] max-w-[280px] leading-[1.7]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Collections will appear here once categories are added to the library.
                </p>
              </div>
            )}

            {/* Extra bottom padding — accounts for mobile bottom nav */}
            <div className="h-10 md:h-10 pb-16 md:pb-0" />
          </div>

          <LibraryFooter />
        </div>
      </div>
    </>
  );
}