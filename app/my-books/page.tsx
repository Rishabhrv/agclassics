"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Library, Search, X, LayoutGrid, List } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Book = {
  product_id: number;
  title: string;
  slug: string;
  main_image: string;
  purchased_at: string;
  category_slug: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  status: string;
  imprint?: string;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  /* ── PAGE HEADER ── */
  .mb-page { background: #0f0f10; min-height: 100vh; padding: 40px 32px 60px;padding-top:130px; }

  .mb-eyebrow {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #8a6f2e;
    display: block;
    margin-bottom: 6px;
  }
  .mb-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
    line-height: 1.1;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .mb-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    color: #6b6b70;
    margin-top: 8px;
  }
  .mb-count-badge span {
    display: inline-block;
    background: rgba(201,168,76,0.1);
    color: #c9a84c;
    font-size: 10px;
    padding: 2px 8px;
  }

  /* ── CONTROLS BAR ── */
  .mb-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* Search input */
  .mb-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .mb-search-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.18);
    padding: 9px 36px 9px 38px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: #e8e0d0;
    outline: none;
    transition: border-color 0.3s, background 0.3s;
    border-radius: 0;
  }
  .mb-search-input::placeholder { color: #6b6b70; }
  .mb-search-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(255,255,255,0.06);
  }

  /* View toggle buttons */
  .mb-view-btn {
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.15);
    color: #6b6b70;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s, color 0.3s;
  }
  .mb-view-btn:hover { color: #c9a84c; border-color: rgba(201,168,76,0.4); }
  .mb-view-btn.active {
    background: rgba(201,168,76,0.1);
    border-color: rgba(201,168,76,0.45);
    color: #c9a84c;
  }

  /* ── DIVIDER ── */
  .mb-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 24px 0 32px;
  }
  .mb-divider-line  { flex: 1; height: 1px; background: rgba(201,168,76,0.1); }
  .mb-divider-diamond {
    width: 4px; height: 4px;
    transform: rotate(45deg);
    background: #8a6f2e;
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* ── GRID CARD ── */
  .mb-grid-card {
    position: relative;
    overflow: hidden;
    background: #1a1a1c;
    aspect-ratio: 2 / 3;
    cursor: pointer;
    transition: transform 0.4s ease;
  }
  .mb-grid-card:hover { transform: scale(1.02); z-index: 2; }
  .mb-grid-card img {
    transition: transform 0.6s ease, filter 0.6s ease;
    filter: brightness(0.88) saturate(0.85);
  }
  .mb-grid-card:hover img {
    transform: scale(1.07);
    filter: brightness(0.6) saturate(0.6);
  }
  .mb-grid-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10,10,11,0.97) 0%, rgba(10,10,11,0.45) 45%, transparent 70%);
    transition: background 0.4s;
  }
  .mb-grid-card:hover .mb-grid-overlay {
    background: linear-gradient(to top, rgba(10,10,11,0.99) 0%, rgba(10,10,11,0.72) 55%, rgba(10,10,11,0.28) 100%);
  }
  .mb-grid-info {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 12px 12px 14px;
    transform: translateY(4px);
    transition: transform 0.4s ease;
    z-index: 3;
  }
  .mb-grid-card:hover .mb-grid-info { transform: translateY(0); }
  .mb-grid-book-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    color: #f5f0e8;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 5px;
  }
  .mb-grid-date {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #8a6f2e;
    opacity: 0.8;
    margin-bottom: 8px;
    display: block;
  }
  .mb-grid-cta {
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
    text-decoration: none;
  }
  .mb-grid-card:hover .mb-grid-cta { opacity: 1; transform: translateY(0); }
  .mb-grid-cta:hover { background: #f5f0e8; }

  /* ── LIST CARD ── */
  .mb-list-card {
    display: flex;
    align-items: center;
    gap: 18px;
    background: #1a1a1c;
    border: 1px solid rgba(201,168,76,0.08);
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    transition: background 0.3s, border-color 0.3s;
  }
  .mb-list-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 2px;
    background: transparent;
    transition: background 0.3s;
  }
  .mb-list-card:hover { background: #1e1e20; border-color: rgba(201,168,76,0.22); }
  .mb-list-card:hover::before { background: #c9a84c; }

  .mb-list-cover {
    flex-shrink: 0;
    overflow: hidden;
    width: 56px;
    height: 80px;
    position: relative;
  }
  .mb-list-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease, filter 0.4s ease;
    filter: brightness(0.9) saturate(0.85);
  }
  .mb-list-card:hover .mb-list-cover img {
    transform: scale(1.06);
    filter: brightness(0.75) saturate(0.7);
  }

  .mb-list-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-weight: 400;
    color: #f5f0e8;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 5px;
    transition: color 0.3s;
  }
  .mb-list-card:hover .mb-list-title { color: #c9a84c; }

  .mb-list-date {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #8a6f2e;
    opacity: 0.8;
  }

  .mb-list-read-btn {
    flex-shrink: 0;
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid rgba(201,168,76,0.2);
    color: #6b6b70;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.3s, border-color 0.3s, color 0.3s;
  }
  .mb-list-card:hover .mb-list-read-btn {
    background: rgba(201,168,76,0.1);
    border-color: rgba(201,168,76,0.5);
    color: #c9a84c;
  }

  /* ── QUICK SEARCH CHIPS ── */
  .mb-chip {
    font-family: 'Jost', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 7px 14px;
    background: transparent;
    border: 1px solid rgba(201,168,76,0.15);
    color: #6b6b70;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: background 0.3s, border-color 0.3s, color 0.3s;
  }
  .mb-chip:hover, .mb-chip.active {
    background: rgba(201,168,76,0.1);
    border-color: rgba(201,168,76,0.45);
    color: #c9a84c;
  }

  /* ── EMPTY STATE ── */
  .mb-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 80px 20px;
    text-align: center;
  }
  .mb-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 300;
    font-style: italic;
    color: #f5f0e8;
  }
  .mb-empty-sub {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #6b6b70;
    max-width: 280px;
    line-height: 1.7;
  }

  /* ── SKELETON ── */
  @keyframes mbShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .mb-skeleton {
    background: linear-gradient(90deg, #1c1c1e 0%, #2a2a2d 50%, #1c1c1e 100%);
    background-size: 200% 100%;
    animation: mbShimmer 1.8s infinite;
    aspect-ratio: 2 / 3;
  }

  @keyframes mbFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mb-item { animation: mbFadeUp 0.45s ease both; }

  /* scrollbar */
  html { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,0.12) transparent; }
`;

export default function MyBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  /* FETCH BOOKS */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetch(`${API_URL}/api/ag-classics/my-books`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBooks(data);
        else { setBooks([]); window.location.href = "/login"; }
      })
      .finally(() => setLoading(false));
  }, []);

  /* FETCH CATEGORIES */
  useEffect(() => {
    fetch(`${API_URL}/api/ag-classics/categories`)
      .then((r) => r.json())
      .then((data) => {
        const active = data.filter(
          (c: Category) => c.status !== "inactive" && c.imprint === "agph"
        );
        setCategories(active);
      });
  }, []);

  /* FILTER */
  const filteredBooks = Array.isArray(books)
    ? books.filter((book) => {
        const matchSearch = book.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !activeCategory || book.category_slug === activeCategory;
        return matchSearch && matchCategory;
      })
    : [];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <style>{styles}</style>
      <div className="mb-page">

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 0 }}>
          <span className="mb-eyebrow">Your Collection</span>
          <h1 className="mb-title">
            <Library size={26} strokeWidth={1.2} style={{ color: "#c9a84c", flexShrink: 0 }} />
            My Books
          </h1>
          {!loading && (
            <div className="mb-count-badge">
              <span>{filteredBooks.length}</span>
              {filteredBooks.length === 1 ? "title" : "titles"} in your library
            </div>
          )}
        </div>

        {/* ── DIVIDER ── */}
        <div className="mb-divider">
          <div className="mb-divider-line" />
          <div className="mb-divider-diamond" />
          <div className="mb-divider-line" />
        </div>

        {/* ── CONTROLS ── */}
        <div className="mb-controls" style={{ marginBottom: 28 }}>
          {/* Search */}
          <div className="mb-search-wrap">
            <Search
              size={15}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b6b70" }}
            />
            <input
              type="text"
              placeholder="Search books…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-search-input"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#6b6b70",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <button
            className={`mb-view-btn ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className={`mb-view-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
            title="List view"
          >
            <List size={15} />
          </button>
        </div>

        {/* ── SKELETON ── */}
        {loading && (
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
          >
            {[...Array(10)].map((_, i) => <div key={i} className="mb-skeleton" />)}
          </div>
        )}

        {/* ── EMPTY ── */}
        {!loading && filteredBooks.length === 0 && (
          <div className="mb-empty">
            <Library size={40} style={{ color: "#8a6f2e", opacity: 0.35 }} strokeWidth={1} />
            <p className="mb-empty-title">
              {search ? "No results found" : "Your library is empty"}
            </p>
            <p className="mb-empty-sub">
              {search
                ? `No books match "${search}". Try a different keyword.`
                : "Books you purchase will appear here."}
            </p>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {!loading && view === "grid" && filteredBooks.length > 0 && (
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
          >
            {filteredBooks.map((book, i) => (
              <div
                key={book.product_id}
                className="mb-item"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <Link href={`/my-books/${book.slug}`} style={{ textDecoration: "none" }}>
                  <div className="mb-grid-card">
                    <Image
                      src={`${API_URL}${book.main_image}`}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="mb-grid-overlay" />
                    <div className="mb-grid-info">
                      <p className="mb-grid-book-title">{book.title}</p>
                      <span className="mb-grid-date">{formatDate(book.purchased_at)}</span>
                      <span className="mb-grid-cta">Read Now</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!loading && view === "list" && filteredBooks.length > 0 && (
          <div className="space-y-[3px]">
            {filteredBooks.map((book, i) => (
              <div
                key={book.product_id}
                className="mb-item"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <Link href={`/my-books/${book.slug}`} className="mb-list-card">
                  {/* Cover */}
                  <div className="mb-list-cover">
                    <Image
                      src={`${API_URL}${book.main_image}`}
                      alt={book.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="mb-list-title">{book.title}</p>
                    <span className="mb-list-date">Purchased · {formatDate(book.purchased_at)}</span>
                  </div>

                  {/* CTA */}
                  <span className="mb-list-read-btn">
                    Read
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── QUICK SEARCH ── */}
        {categories.length > 0 && (
          <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid rgba(201,168,76,0.1)" }}>
            <span className="mb-eyebrow" style={{ marginBottom: 14 }}>Browse by Genre</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              <button
                className={`mb-chip ${activeCategory === null ? "active" : ""}`}
                onClick={() => setActiveCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`mb-chip ${activeCategory === cat.slug ? "active" : ""}`}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}