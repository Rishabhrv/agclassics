"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Book = {
  id: number;
  title: string;
  slug: string;
  main_image: string;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  /* ── PAGE HEADER ── */
  .fav-header {
    padding: 36px 32px 0;
    position: relative;
    overflow: hidden;
  }
  .fav-header::after {
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
  .fav-eyebrow {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #8a6f2e;
    display: block;
    margin-bottom: 6px;
  }
  .fav-title {
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
  .fav-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    color: #6b6b70;
    margin-top: 8px;
  }
  .fav-count-badge span {
    display: inline-block;
    background: rgba(201,168,76,0.1);
    color: #c9a84c;
    font-size: 10px;
    padding: 2px 8px;
    letter-spacing: 1px;
  }

  /* ── DIVIDER ── */
  .fav-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 24px 0 32px;
  }
  .fav-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(201,168,76,0.1);
  }
  .fav-divider-diamond {
    width: 4px;
    height: 4px;
    transform: rotate(45deg);
    background: #8a6f2e;
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* ── BOOK CARD ── */
  .fav-book-card {
    position: relative;
    overflow: hidden;
    background: #1a1a1c;
    cursor: pointer;
    transition: transform 0.4s ease;
    aspect-ratio: 2 / 3;
    display: block;
  }
  .fav-book-card:hover { transform: scale(1.02); z-index: 2; }

  .fav-book-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease, filter 0.6s ease;
    filter: brightness(0.88) saturate(0.85);
  }
  .fav-book-card:hover img {
    transform: scale(1.07);
    filter: brightness(0.6) saturate(0.6);
  }

  .fav-book-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10,10,11,0.96) 0%,
      rgba(10,10,11,0.45) 45%,
      transparent 70%
    );
    transition: background 0.4s;
  }
  .fav-book-card:hover .fav-book-overlay {
    background: linear-gradient(
      to top,
      rgba(10,10,11,0.99) 0%,
      rgba(10,10,11,0.72) 55%,
      rgba(10,10,11,0.25) 100%
    );
  }

  .fav-book-info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 12px 12px 14px;
    transform: translateY(4px);
    transition: transform 0.4s ease;
  }
  .fav-book-card:hover .fav-book-info { transform: translateY(0); }

  .fav-book-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.35;
    color: #f5f0e8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .fav-book-read-btn {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 6px 12px;
    background: #c9a84c;
    color: #0a0a0b;
    border: none;
    cursor: pointer;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.35s ease, transform 0.35s ease, background 0.3s;
    display: inline-block;
    text-decoration: none;
  }
  .fav-book-card:hover .fav-book-read-btn {
    opacity: 1;
    transform: translateY(0);
  }
  .fav-book-read-btn:hover { background: #f5f0e8; }

  /* Heart badge top-right */
  .fav-heart-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    width: 28px;
    height: 28px;
    background: rgba(10,10,11,0.75);
    border: 1px solid rgba(201,168,76,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── EMPTY STATE ── */
  .fav-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 20px;
    text-align: center;
  }
  .fav-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
  }
  .fav-empty-sub {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    max-width: 280px;
    line-height: 1.6;
  }
  .fav-empty-cta {
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
  .fav-empty-cta:hover { background: #f5f0e8; }

  /* ── SHIMMER SKELETON ── */
  @keyframes favShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .fav-skeleton {
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: favShimmer 1.8s infinite;
    aspect-ratio: 2/3;
  }

  @keyframes favFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fav-book-item {
    animation: favFadeUp 0.5s ease both;
  }

  /* scrollbar */
  .fav-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,168,76,0.12) transparent;
  }
  .fav-scroll::-webkit-scrollbar { width: 4px; }
  .fav-scroll::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.12);
    border-radius: 2px;
  }
`;

export default function LibraryFavoriteBook() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/my-books/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setBooks)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{styles}</style>

      <div className="fav-scroll flex-1" style={{ background: "#0f0f10", minHeight: "60vh" }}>

        {/* ── PAGE HEADER ── */}
        <div className="fav-header">
          <span className="fav-eyebrow">Your Collection</span>
          <h1 className="fav-title">
            Favorites
            <Heart size={22} style={{ color: "#c9a84c", fill: "rgba(201,168,76,0.2)" }} strokeWidth={1.5} />
          </h1>

          {!loading && (
            <div className="fav-count-badge">
              <span>{books.length}</span>
              {books.length === 1 ? "title" : "titles"} saved
            </div>
          )}

          {/* Ornament divider */}
          <div className="fav-divider" style={{ paddingRight: 32 }}>
            <div className="fav-divider-line" />
            <div className="fav-divider-diamond" />
            <div className="fav-divider-line" />
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
                <div key={i} className="fav-skeleton" />
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading && books.length === 0 && (
            <div className="fav-empty">
              <Heart
                size={40}
                style={{ color: "#8a6f2e", opacity: 0.4 }}
                strokeWidth={1}
              />
              <p className="fav-empty-title">No favorites yet</p>
              <p className="fav-empty-sub">
                Mark books you love with the heart icon and they'll appear here.
              </p>
              <Link href="/library/MyLibrary" className="fav-empty-cta">
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
                  className="fav-book-item"
                  style={{ animationDelay: `${i * 0.045}s` }}
                >
                  <Link href={`/library/read/${book.slug}`} className="fav-book-card">

                    {/* Heart badge */}
                    <div className="fav-heart-badge">
                      <Heart
                        size={13}
                        strokeWidth={1.5}
                        style={{ fill: "#c9a84c", color: "#c9a84c" }}
                      />
                    </div>

                    {/* Cover */}
                    <img
                      src={`${API_URL}${book.main_image}`}
                      alt={book.title}
                    />

                    {/* Overlay + info */}
                    <div className="fav-book-overlay" />
                    <div className="fav-book-info">
                      <p className="fav-book-title">{book.title}</p>
                      <span className="fav-book-read-btn">Read Now</span>
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