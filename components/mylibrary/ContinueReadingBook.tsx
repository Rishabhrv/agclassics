"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

type Book = {
  id: number;
  title: string;
  slug: string;
  main_image: string;
  updated_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  /* ── PAGE HEADER ── */
  .cr-header {
    padding: 36px 32px 0;
    position: relative;
    overflow: hidden;
  }
  .cr-header::after {
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
  .cr-eyebrow {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #8a6f2e;
    display: block;
    margin-bottom: 6px;
  }
  .cr-title {
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
  .cr-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    color: #6b6b70;
    margin-top: 8px;
  }
  .cr-count-badge span {
    display: inline-block;
    background: rgba(201,168,76,0.1);
    color: #c9a84c;
    font-size: 10px;
    padding: 2px 8px;
    letter-spacing: 1px;
  }

  /* ── DIVIDER ── */
  .cr-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 24px 0 32px;
  }
  .cr-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(201,168,76,0.1);
  }
  .cr-divider-diamond {
    width: 4px;
    height: 4px;
    transform: rotate(45deg);
    background: #8a6f2e;
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* ── BOOK CARD ── */
  .cr-card {
    display: block;
    text-decoration: none;
    position: relative;
  }

  .cr-card-inner {
    position: relative;
    overflow: hidden;
    background: #1a1a1c;
    aspect-ratio: 2 / 3;
    transition: transform 0.4s ease;
  }
  .cr-card:hover .cr-card-inner { transform: scale(1.02); z-index: 2; }

  .cr-card-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease, filter 0.6s ease;
    filter: brightness(0.88) saturate(0.85);
  }
  .cr-card:hover .cr-card-inner img {
    transform: scale(1.07);
    filter: brightness(0.6) saturate(0.6);
  }

  .cr-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10,10,11,0.97) 0%,
      rgba(10,10,11,0.45) 45%,
      transparent 70%
    );
    transition: background 0.4s;
  }
  .cr-card:hover .cr-card-overlay {
    background: linear-gradient(
      to top,
      rgba(10,10,11,0.99) 0%,
      rgba(10,10,11,0.72) 55%,
      rgba(10,10,11,0.28) 100%
    );
  }

  /* Progress bar */
  .cr-progress-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: rgba(201,168,76,0.12);
    z-index: 5;
  }
  .cr-progress-fill {
    height: 100%;
    background: linear-gradient(to right, #8a6f2e, #c9a84c);
  }

  .cr-card-info {
    position: absolute;
    bottom: 4px; left: 0; right: 0;
    padding: 12px 12px 16px;
    transform: translateY(4px);
    transition: transform 0.4s ease;
    z-index: 4;
  }
  .cr-card:hover .cr-card-info { transform: translateY(0); }

  .cr-card-book-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.35;
    color: #f5f0e8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 5px;
  }

  .cr-card-date {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #8a6f2e;
    opacity: 0.8;
    margin-bottom: 8px;
    display: block;
  }

  .cr-card-cta {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 6px 12px;
    background: #c9a84c;
    color: #0a0a0b;
    border: none;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.35s ease, transform 0.35s ease, background 0.3s;
    display: inline-block;
  }
  .cr-card:hover .cr-card-cta {
    opacity: 1;
    transform: translateY(0);
  }
  .cr-card-cta:hover { background: #f5f0e8; }

  /* Clock badge top-right */
  .cr-clock-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    width: 28px;
    height: 28px;
    background: rgba(10,10,11,0.75);
    border: 1px solid rgba(201,168,76,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s;
  }
  .cr-card:hover .cr-clock-badge {
    border-color: rgba(201,168,76,0.5);
  }

  /* Placeholder */
  .cr-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1c1c1e, #2a2a2d);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── EMPTY STATE ── */
  .cr-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 20px;
    text-align: center;
  }
  .cr-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
  }
  .cr-empty-sub {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    max-width: 300px;
    line-height: 1.7;
  }
  .cr-empty-cta {
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
  .cr-empty-cta:hover { background: #f5f0e8; }

  /* ── SKELETON ── */
  @keyframes crShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .cr-skeleton {
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: crShimmer 1.8s infinite;
    aspect-ratio: 2 / 3;
  }

  @keyframes crFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cr-card-item {
    animation: crFadeUp 0.5s ease both;
  }

  /* scrollbar */
  .cr-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,168,76,0.12) transparent;
  }
  .cr-scroll::-webkit-scrollbar { width: 4px; }
  .cr-scroll::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.12);
    border-radius: 2px;
  }
`;

export default function ContinueReadingBook() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/api/ag-classics/my-books/continue`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setBooks)
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

      <div className="cr-scroll flex-1" style={{ background: "#0f0f10", minHeight: "60vh" }}>

        {/* ── PAGE HEADER ── */}
        <div className="cr-header">
          <span className="cr-eyebrow">Pick Up Where You Left Off</span>
          <h1 className="cr-title">
            Continue Reading
            <Clock size={22} style={{ color: "#c9a84c", opacity: 0.85 }} strokeWidth={1.5} />
          </h1>

          {!loading && (
            <div className="cr-count-badge">
              <span>{books.length}</span>
              {books.length === 1 ? "book" : "books"} in progress
            </div>
          )}

          <div className="cr-divider" style={{ paddingRight: 32 }}>
            <div className="cr-divider-line" />
            <div className="cr-divider-diamond" />
            <div className="cr-divider-line" />
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "0 32px 48px" }}>

          {/* SKELETON */}
          {loading && (
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="cr-skeleton" />
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading && books.length === 0 && (
            <div className="cr-empty">
              <Clock size={40} style={{ color: "#8a6f2e", opacity: 0.35 }} strokeWidth={1} />
              <p className="cr-empty-title">Nothing in progress</p>
              <p className="cr-empty-sub">
                Open any book from your library to start reading.
                Your progress will appear here automatically.
              </p>
              <Link href="/library/MyLibrary" className="cr-empty-cta">
                Browse Library
              </Link>
            </div>
          )}

          {/* GRID */}
          {!loading && books.length > 0 && (
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
            >
              {books.map((book, i) => (
                <div
                  key={book.id}
                  className="cr-card-item"
                  style={{ animationDelay: `${i * 0.045}s` }}
                >
                  <Link href={`/my-books/${book.slug}`} className="cr-card">

                    <div className="cr-card-inner">

                      {/* Clock badge */}
                      <div className="cr-clock-badge">
                        <Clock size={13} strokeWidth={1.5} style={{ color: "#c9a84c" }} />
                      </div>

                      {/* Cover image */}
                      {book.main_image ? (
                        <Image
                          src={`${API_URL}${book.main_image}`}
                          alt={book.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="cr-placeholder">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" opacity={0.5}>
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="cr-card-overlay" />

                      {/* Progress bar at very bottom */}
                      <div className="cr-progress-bar">
                        <div className="cr-progress-fill" style={{ width: "40%" }} />
                      </div>

                      {/* Info */}
                      <div className="cr-card-info">
                        <p className="cr-card-book-title">{book.title}</p>
                        <span className="cr-card-date">
                          Last read · {formatDate(book.updated_at)}
                        </span>
                        <span className="cr-card-cta">Resume</span>
                      </div>
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