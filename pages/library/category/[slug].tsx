"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LibraryBookCard from "@/components/mylibrary/LibraryBookCard";
import LibraryFooter from "@/components/mylibrary/LibraryFooter";
import LibrarySidebar from "@/components/mylibrary/LibrarySidebar";
import LibraryHeader from "@/components/mylibrary/LibraryHeader";
import "../../../app/globals.css";

type Book = {
  id: number;
  title: string;
  slug: string;
  main_image: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  .cat-page-bg {
    background: #0f0f10;
    min-height: 100vh;
  }

  /* Loading screen */
  .cat-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 60vh;
  }
  .cat-loading-ring {
    width: 32px;
    height: 32px;
    border: 1px solid rgba(201,168,76,0.15);
    border-top-color: #c9a84c;
    border-radius: 50%;
    animation: catSpin 0.9s linear infinite;
  }
  @keyframes catSpin {
    to { transform: rotate(360deg); }
  }
  .cat-loading-text {
    font-family: 'Cinzel', serif;
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #6b6b70;
  }

  /* Page header */
  .cat-page-header {
    padding: 36px 32px 0;
    position: relative;
    overflow: hidden;
  }
  .cat-page-header::after {
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
  .cat-page-eyebrow {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #8a6f2e;
    display: block;
    margin-bottom: 6px;
  }
  .cat-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
    line-height: 1.1;
    margin-bottom: 8px;
  }

  /* Count badge */
  .cat-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    color: #6b6b70;
  }
  .cat-count-badge span {
    display: inline-block;
    background: rgba(201,168,76,0.1);
    color: #c9a84c;
    font-size: 10px;
    padding: 2px 8px;
    letter-spacing: 1px;
  }

  /* Divider */
  .cat-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 24px 0 32px;
  }
  .cat-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(201,168,76,0.1);
  }
  .cat-divider-diamond {
    width: 4px;
    height: 4px;
    transform: rotate(45deg);
    background: #8a6f2e;
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* Book grid */
  .cat-book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 3px;
  }

  /* Empty state */
  .cat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 20px;
    text-align: center;
  }
  .cat-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
  }
  .cat-empty-sub {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    max-width: 280px;
    line-height: 1.6;
  }

  /* Scrollbar */
  .cat-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,168,76,0.12) transparent;
  }
  .cat-scroll::-webkit-scrollbar { width: 4px; }
  .cat-scroll::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.12);
    border-radius: 2px;
  }

  /* Skeleton shimmer */
  @keyframes catShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .cat-skeleton {
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: catShimmer 1.8s infinite;
    aspect-ratio: 2/3;
  }

  @keyframes catFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cat-book-item {
    animation: catFadeUp 0.5s ease both;
  }
`;

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  const [books, setBooks] = useState<Book[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_URL}/api/mylibrary/category/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${API_URL}/api/mylibrary/category/${slug}/meta`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([booksData, meta]) => {
        setBooks(booksData || []);
        setCategoryName(meta?.name || "");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <style>{pageStyles}</style>

      <div className="cat-page-bg flex">
        <LibrarySidebar />

        <div className="flex flex-1 flex-col" style={{ background: "#0f0f10" }}>
          <LibraryHeader />

          <div className="cat-scroll flex-1">
            {/* ── PAGE HEADER ── */}
            <div className="cat-page-header">
              <span className="cat-page-eyebrow">Genre</span>

              <h1 className="cat-page-title">
                {loading ? (
                  <span style={{ color: "#3a3a3d" }}>Loading…</span>
                ) : (
                  categoryName || slug
                )}
              </h1>

              {!loading && (
                <div className="cat-count-badge">
                  <span>{books.length}</span>
                  {books.length === 1 ? "title" : "titles"} in this collection
                </div>
              )}

              {/* Ornament divider */}
              <div className="cat-divider" style={{ paddingRight: 32 }}>
                <div className="cat-divider-line" />
                <div className="cat-divider-diamond" />
                <div className="cat-divider-line" />
              </div>
            </div>

            {/* ── CONTENT ── */}
            <div style={{ padding: "0 32px 48px" }}>

              {/* LOADING skeleton grid */}
              {loading && (
                <div className="cat-book-grid">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="cat-skeleton" />
                  ))}
                </div>
              )}

              {/* EMPTY state */}
              {!loading && books.length === 0 && (
                <div className="cat-empty">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" opacity={0.5}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <p className="cat-empty-title">The shelves are empty</p>
                  <p className="cat-empty-sub">
                    No books found in this collection. Check back soon.
                  </p>
                </div>
              )}

              {/* BOOK GRID */}
              {!loading && books.length > 0 && (
                <div className="cat-book-grid">
                  {books.map((book, i) => (
                    <div
                      key={book.id}
                      className="cat-book-item"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <LibraryBookCard book={book} visibleCount={1} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <LibraryFooter />
        </div>
      </div>
    </>
  );
}