"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

type BookmarkItem = {
  title: string;
  slug: string;
  cfi: string;
  label: string;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  /* ── PAGE HEADER ── */
  .bm-header {
    padding: 36px 32px 0;
    position: relative;
    overflow: hidden;
  }
  .bm-header::after {
    content: '';
    position: absolute;
    right: -20px;
    top: -40px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .bm-eyebrow {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #8a6f2e;
    display: block;
    margin-bottom: 6px;
  }
  .bm-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
    line-height: 1.1;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .bm-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    color: #6b6b70;
    margin-top: 8px;
  }
  .bm-count-badge span {
    display: inline-block;
    background: rgba(201,168,76,0.1);
    color: #c9a84c;
    font-size: 10px;
    padding: 2px 8px;
    letter-spacing: 1px;
  }

  /* ── DIVIDER ── */
  .bm-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 24px 0 32px;
  }
  .bm-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(201,168,76,0.1);
  }
  .bm-divider-diamond {
    width: 4px;
    height: 4px;
    transform: rotate(45deg);
    background: #8a6f2e;
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* ── BOOKMARK CARD ── */
  .bm-card {
    display: block;
    background: #1a1a1c;
    border: 1px solid rgba(201,168,76,0.08);
    padding: 20px 22px;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s, background 0.3s;
  }
  .bm-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: transparent;
    transition: background 0.3s;
  }
  .bm-card:hover {
    background: #1e1e20;
    border-color: rgba(201,168,76,0.22);
  }
  .bm-card:hover::before {
    background: #c9a84c;
  }

  .bm-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .bm-card-book-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-weight: 400;
    color: #f5f0e8;
    line-height: 1.3;
    transition: color 0.3s;
  }
  .bm-card:hover .bm-card-book-title { color: #c9a84c; }

  .bm-card-icon {
    flex-shrink: 0;
    opacity: 0.4;
    transition: opacity 0.3s;
  }
  .bm-card:hover .bm-card-icon { opacity: 0.9; }

  .bm-card-label {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    letter-spacing: 0.3px;
    line-height: 1.5;
    margin-bottom: 10px;
  }

  .bm-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .bm-card-date {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #8a6f2e;
    opacity: 0.7;
  }
  .bm-card-cta {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #6b6b70;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.3s;
  }
  .bm-card-cta::after {
    content: '';
    display: block;
    width: 14px;
    height: 1px;
    background: currentColor;
    transition: width 0.3s;
  }
  .bm-card:hover .bm-card-cta {
    color: #c9a84c;
  }
  .bm-card:hover .bm-card-cta::after { width: 22px; }

  /* ── EMPTY STATE ── */
  .bm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 20px;
    text-align: center;
  }
  .bm-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
  }
  .bm-empty-sub {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    max-width: 300px;
    line-height: 1.7;
  }
  .bm-empty-cta {
    font-family: 'Jost', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 11px 28px;
    background: #c9a84c;
    color: #0a0a0b;
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    margin-top: 8px;
    transition: background 0.3s;
  }
  .bm-empty-cta:hover { background: #f5f0e8; }

  /* ── SKELETON ── */
  @keyframes bmShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .bm-skeleton {
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: bmShimmer 1.8s infinite;
    height: 88px;
    border: 1px solid rgba(201,168,76,0.05);
  }

  @keyframes bmFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bm-card-item {
    animation: bmFadeUp 0.45s ease both;
  }

  /* scrollbar */
  .bm-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,168,76,0.12) transparent;
  }
  .bm-scroll::-webkit-scrollbar { width: 4px; }
  .bm-scroll::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.12);
    border-radius: 2px;
  }
`;

export default function BookmarksBook() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/api/ag-classics/my-books/bookmarks/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setBookmarks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <style>{styles}</style>

      <div className="bm-scroll flex-1" style={{ background: "#0f0f10", minHeight: "60vh" }}>

        {/* ── PAGE HEADER ── */}
        <div className="bm-header">
          <span className="bm-eyebrow">Your Reading</span>
          <h1 className="bm-title">
            Bookmarks
            <Bookmark size={22} style={{ color: "#c9a84c", fill: "rgba(201,168,76,0.18)" }} strokeWidth={1.5} />
          </h1>

          {!loading && (
            <div className="bm-count-badge">
              <span>{bookmarks.length}</span>
              {bookmarks.length === 1 ? "bookmark" : "bookmarks"} saved
            </div>
          )}

          <div className="bm-divider" style={{ paddingRight: 32 }}>
            <div className="bm-divider-line" />
            <div className="bm-divider-diamond" />
            <div className="bm-divider-line" />
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "0 32px 48px" }}>

          {/* SKELETON */}
          {loading && (
            <div className="space-y-[3px]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bm-skeleton" />
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading && bookmarks.length === 0 && (
            <div className="bm-empty">
              <Bookmark size={40} style={{ color: "#8a6f2e", opacity: 0.35 }} strokeWidth={1} />
              <p className="bm-empty-title">No bookmarks yet</p>
              <p className="bm-empty-sub">
                While reading, tap the bookmark icon to save your place.
                All your saved spots will appear here.
              </p>
              <Link href="/library/MyLibrary" className="bm-empty-cta">
                Browse Library
              </Link>
            </div>
          )}

          {/* LIST */}
          {!loading && bookmarks.length > 0 && (
            <div className="space-y-[3px]">
              {bookmarks.map((bm, i) => (
                <div
                  key={i}
                  className="bm-card-item"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <Link href={`/my-books/${bm.slug}`} className="bm-card">

                    <div className="bm-card-top">
                      <h3 className="bm-card-book-title">{bm.title}</h3>
                      <Bookmark
                        size={15}
                        strokeWidth={1.5}
                        className="bm-card-icon"
                        style={{ color: "#c9a84c", fill: "rgba(201,168,76,0.25)", marginTop: 2 }}
                      />
                    </div>

                    {bm.label && (
                      <p className="bm-card-label">
                        {bm.label}
                      </p>
                    )}

                    <div className="bm-card-footer">
                      <span className="bm-card-date">{formatDate(bm.created_at)}</span>
                      <span className="bm-card-cta">Continue Reading</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}