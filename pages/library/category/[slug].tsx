"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LibraryBookCard from "@/components/mylibrary/LibraryBookCard";
import LibraryFooter from "@/components/mylibrary/LibraryFooter";
import LibrarySidebar from "@/components/mylibrary/LibrarySidebar";
import LibraryHeader from "@/components/mylibrary/LibraryHeader";
import "../../../app/globals.css";

type Book = { id: number; title: string; slug: string; main_image: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* Only what Tailwind can't express */
const minimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes catSpin {
    to { transform: rotate(360deg); }
  }
  .cat-spin { animation: catSpin 0.9s linear infinite; }

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
  .cat-book-item { animation: catFadeUp 0.5s ease both; }

  /* Radial glow on header */
  .cat-header-glow::after {
    content: '';
    position: absolute;
    right: -20px; top: -40px;
    width: 260px; height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Thin scrollbar */
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
      <style>{minimalStyles}</style>

      <div className="bg-[#0f0f10] min-h-screen flex">
        <LibrarySidebar />

        <div className="flex flex-1 flex-col min-w-0 bg-[#0f0f10]">
          <LibraryHeader />

          <div className="cat-scroll flex-1">

            {/* ── PAGE HEADER ── */}
            <div className="cat-header-glow relative overflow-hidden px-4 sm:px-8 pt-8 sm:pt-9">

              <span
                className="text-[8px] tracking-[5px] uppercase text-[#8a6f2e] block mb-1.5"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Genre
              </span>

              <h1
                className="text-[clamp(26px,4vw,44px)] font-light italic text-[#f5f0e8] leading-[1.1] mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {loading ? (
                  <span className="text-[#3a3a3d]">Loading…</span>
                ) : (
                  categoryName || slug
                )}
              </h1>

              {/* Count badge */}
              {!loading && (
                <div
                  className="inline-flex items-center gap-2 text-[11px] tracking-[1px] text-[#6b6b70]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  <span className="inline-block bg-[rgba(201,168,76,0.1)] text-[#c9a84c] text-[10px] px-2 py-0.5 tracking-[1px]">
                    {books.length}
                  </span>
                  {books.length === 1 ? "title" : "titles"} in this collection
                </div>
              )}

              {/* Ornament divider */}
              <div className="flex items-center gap-3.5 mt-6 mb-8 pr-0">
                <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
                <div className="w-1 h-1 rotate-45 bg-[#8a6f2e] opacity-50 shrink-0" />
                <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
              </div>
            </div>

            {/* ── CONTENT ── */}
            {/* Extra bottom padding on mobile to clear the bottom nav */}
            <div className="px-4 sm:px-8 pb-24 md:pb-12">

              {/* LOADING spinner + skeleton grid */}
              {loading && (
                <>
                  {/* Spinner */}
                  <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <div
                      className="cat-spin w-8 h-8 rounded-full border border-[rgba(201,168,76,0.15)] border-t-[#c9a84c]"
                      style={{ borderTopColor: "#c9a84c" }}
                    />
                    <span
                      className="text-[9px] tracking-[4px] uppercase text-[#6b6b70]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Loading
                    </span>
                  </div>

                  {/* Skeleton grid */}
                  <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="cat-skeleton rounded-[1px]" />
                    ))}
                  </div>
                </>
              )}

              {/* EMPTY state */}
              {!loading && books.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <svg
                    width="36" height="36" viewBox="0 0 24 24"
                    fill="none" stroke="#8a6f2e" strokeWidth="1" opacity={0.5}
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <p
                    className="text-[26px] font-light italic text-[#f5f0e8]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    The shelves are empty
                  </p>
                  <p
                    className="text-[12px] text-[#6b6b70] max-w-[280px] leading-[1.6]"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    No books found in this collection. Check back soon.
                  </p>
                </div>
              )}

              {/* BOOK GRID */}
              {!loading && books.length > 0 && (
                <div
                  className="grid gap-[3px]"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
                >
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