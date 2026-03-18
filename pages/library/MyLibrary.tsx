"use client";

import React, { useEffect, useState } from "react";
import LibraryFooter from "@/components/mylibrary/LibraryFooter";
import LibrarySidebar from "@/components/mylibrary/LibrarySidebar";
import LibraryHeader from "@/components/mylibrary/LibraryHeader";
import LibraryCategorySection from "@/components/mylibrary/LibraryCategorySection";
import "../../app/globals.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Category = {
  id: number;
  name: string;
  slug: string;
};

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Cinzel:wght@400&family=Jost:wght@300;400&display=swap');

  .lib-page-bg {
    background: #0f0f10;
    min-height: 100vh;
  }
  .lib-main-content {
    background: #0f0f10;
    position: relative;
  }
  .lib-main-content::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  .lib-welcome-banner {
    position: relative;
    padding: 36px 32px 0;
    overflow: hidden;
  }
  .lib-welcome-banner::after {
    content: '\u201C';
    position: absolute;
    right: 20px;
    top: -30px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 200px;
    color: rgba(201,168,76,0.03);
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }
  .lib-welcome-eyebrow {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #8a6f2e;
    display: block;
    margin-bottom: 6px;
  }
  .lib-welcome-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .lib-welcome-subtitle {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    letter-spacing: 0.3px;
    line-height: 1.6;
    max-width: 420px;
  }
  .lib-welcome-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 24px;
  }
  .lib-welcome-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(201,168,76,0.1);
  }
  .lib-welcome-divider-text {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(201,168,76,0.3);
  }

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

  /* Skeleton shimmer for category rows */
  @keyframes libCatShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .lib-skel-row { padding: 40px 32px 0; }
  .lib-skel-title {
    height: 12px;
    width: 140px;
    margin-bottom: 8px;
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: libCatShimmer 1.8s infinite;
  }
  .lib-skel-subtitle {
    height: 28px;
    width: 220px;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: libCatShimmer 1.8s infinite;
  }
  .lib-skel-cards {
    display: flex;
    gap: 3px;
  }
  .lib-skel-card {
    flex: 1;
    aspect-ratio: 2/3;
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: libCatShimmer 1.8s infinite;
  }

  /* Empty state */
  .lib-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 80px 20px;
    text-align: center;
  }
  .lib-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
  }
  .lib-empty-sub {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    max-width: 280px;
    line-height: 1.7;
  }
`;

const MyLibrary = () => {
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
      <style>{pageStyles}</style>

      <div className="lib-page-bg flex">
        <LibrarySidebar />

        <div className="lib-main-content flex flex-1 flex-col" style={{ position: "relative", zIndex: 1 }}>
          <LibraryHeader />

          <div className="lib-scroll-area flex-1">

            {/* ── WELCOME BANNER ── */}
            <div className="lib-welcome-banner">
              <span className="lib-welcome-eyebrow">Your Reading Space</span>
              <h1 className="lib-welcome-title">Welcome to My Library</h1>
              <p className="lib-welcome-subtitle">
                Explore curated collections, pick up where you left off, and
                discover new titles chosen for those who read with intention.
              </p>
              <div className="lib-welcome-divider">
                <div className="lib-welcome-divider-line" />
                <span className="lib-welcome-divider-text">Collections</span>
                <div className="lib-welcome-divider-line" />
              </div>
            </div>

            {/* ── LOADING: skeleton rows ── */}
            {loadingCats && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="lib-skel-row">
                    <div className="lib-skel-title" style={{ animationDelay: `${i * 0.1}s` }} />
                    <div className="lib-skel-subtitle" style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
                    <div className="lib-skel-cards">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className="lib-skel-card"
                          style={{ animationDelay: `${j * 0.06}s` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── DYNAMIC CATEGORY SECTIONS ── */}
            {!loadingCats && categories.map((cat) => (
              <LibraryCategorySection
                key={cat.slug}
                title={cat.name}
                categorySlug={cat.slug}
                visibleCount={6}
              />
            ))}

            {/* ── EMPTY STATE ── */}
            {!loadingCats && categories.length === 0 && (
              <div className="lib-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" opacity={0.4}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <p className="lib-empty-title">No collections yet</p>
                <p className="lib-empty-sub">
                  Collections will appear here once categories are added to the library.
                </p>
              </div>
            )}

            <div style={{ height: 40 }} />
          </div>

          <LibraryFooter />
        </div>
      </div>
    </>
  );
};

export default MyLibrary;