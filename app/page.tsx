"use client";

import { useEffect, useState, useRef } from "react";
import ProductSlider from "@/components/home/Productslider";
import { RevealText } from "@/components/motion/Motionutils";
import EbookSection from "@/components/home/EbookSection";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Book {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  main_image: string;
  stock: number;
  created_at: string;
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scrollDrop {
    0%, 100% { opacity: 0.4; transform: scaleY(0.7); }
    50%       { opacity: 1;   transform: scaleY(1); }
  }
  @keyframes marqueeRun {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes shimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  @keyframes shimmerSweep {
    from { left: -50%; }
    to   { left: 150%; }
  }

  /* ── Infinite scroll rows ────────────────────────── */
  @keyframes scrollRight {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes scrollLeft {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }

  .row-scroll-right {
    animation: scrollRight 35s linear infinite;
  }
  .row-scroll-left {
    animation: scrollLeft 35s linear infinite;
  }
  /* Pause both rows when parent is hovered */
  .books-marquee:hover .row-scroll-right,
  .books-marquee:hover .row-scroll-left {
    animation-play-state: paused;
  }
  /* ─────────────────────────────────────────────────── */

  .anim-fade-0 { animation: fadeUp 0.8s ease 0.0s both; }
  .anim-fade-2 { animation: fadeUp 1.0s ease 0.2s both; }
  .anim-fade-5 { animation: fadeUp 1.0s ease 0.5s both; }
  .anim-marquee { animation: marqueeRun 25s linear infinite; }
  .anim-scroll  { animation: scrollDrop 2s ease infinite; }
  .anim-shimmer {
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite;
  }

  .hero-eyebrow::before,
  .hero-eyebrow::after {
    content: '';
    display: block;
    width: 40px;
    height: 1px;
    background: #8a6f2e;
    flex-shrink: 0;
  }

  .quote-banner::before {
    content: '\u201C';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Cormorant Garamond', serif;
    font-size: 280px;
    color: rgba(201,168,76,0.04);
    line-height: 1;
    pointer-events: none;
  }

  /* Book card hover */
  .book-card {
    transition: transform 350ms ease, box-shadow 350ms ease;
    flex-shrink: 0;
  }
  .book-card:hover {
    transform: scale(1.03);
    z-index: 2;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7);
  }
  .book-card:hover .book-img {
    filter: brightness(0.65) saturate(0.55);
    transform: scale(1.06);
  }
  .book-card:hover .book-overlay {
    background: linear-gradient(
      to top,
      rgba(10,10,11,0.99) 0%,
      rgba(10,10,11,0.80) 60%,
      rgba(10,10,11,0.30) 100%
    );
  }
  .book-card:hover .book-info    { transform: translateY(0) !important; }
  .book-card:hover .book-actions { opacity: 1 !important; transform: translateY(0) !important; }

  .mag-cta { position: relative; overflow: hidden; }
  .mag-cta::after {
    content: '';
    position: absolute;
    top: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  }
  .mag-cta:hover::after { animation: shimmerSweep 0.55s ease; }

  /* Edge fade masks on marquee rows */
  .books-marquee {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 6%,
      black 94%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 6%,
      black 94%,
      transparent 100%
    );
  }
`;

export default function MainBody() {
  const [books, setBooks]     = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Only fetch 16 books — enough to fill 2 rows with duplicates for infinite scroll
        const res = await fetch(`${API_URL}/api/ag-classics?limit=16`);
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        if (data.success) setBooks(data.products);
        else throw new Error(data.message || "Unknown error");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calcDiscount = (price: number, sell: number) =>
    price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

  // Split books into 2 rows; if fewer than 2 just duplicate
  const half   = Math.max(1, Math.ceil(books.length / 2));
  const row1   = books.slice(0, half);
  const row2   = books.slice(half);
  // Pad row2 if it ended up shorter
  const row2Padded = row2.length > 0 ? row2 : row1;

  // Render a single book card (reused in both rows)
  const BookCard = ({ book }: { book: Book }) => {
    const disc  = calcDiscount(book.price, book.sell_price);
    const isNew = new Date(book.created_at) > new Date(Date.now() - 30 * 86400000);
    const isOos = book.stock === 0;

    return (
      <div
        className="book-card relative overflow-hidden cursor-pointer"
        style={{
          width: 250,
          height: 350,
          background: "#1c1c1e",
          borderRadius: 2,
        }}
        onClick={() => (window.location.href = `/product/${book.slug}`)}
      >
        {/* Badge */}
        {isOos ? (
          <span style={{ position: "absolute", top: 10, left: 10, zIndex: 10, fontFamily: "'Jost', sans-serif", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500, padding: "4px 8px", background: "rgba(255,255,255,0.12)", color: "#9a9aa0", backdropFilter: "blur(8px)" }}>
            Out of Stock
          </span>
        ) : disc > 5 ? (
          <span style={{ position: "absolute", top: 10, left: 10, zIndex: 10, fontFamily: "'Jost', sans-serif", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500, padding: "4px 8px", background: "#8b3a3a", color: "#f5f0e8" }}>
            {disc}% Off
          </span>
        ) : isNew ? (
          <span style={{ position: "absolute", top: 10, left: 10, zIndex: 10, fontFamily: "'Jost', sans-serif", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500, padding: "4px 8px", background: "#c9a84c", color: "#0a0a0b" }}>
            New
          </span>
        ) : null}

        {/* Cover */}
        {book.main_image ? (
          <img
            src={`${API_URL}${book.main_image}`}
            alt={book.title}
            className="book-img"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 600ms ease, filter 600ms ease", filter: "brightness(0.88) saturate(0.85)" }}
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #222226, #1c1c1e)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" opacity={0.4}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div
          className="book-overlay"
          style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "0 14px 16px",
            background: "linear-gradient(to top, rgba(10,10,11,0.97) 0%, rgba(10,10,11,0.55) 45%, transparent 75%)",
            transition: "background 400ms",
          }}
        >
          <div className="book-info" style={{ transform: "translateY(6px)", transition: "transform 400ms ease" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600, lineHeight: 1.25, marginBottom: 5, color: "#f0ece4" }}>
              {book.title}
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 500, color: "#c9a84c" }}>
                ₹{parseFloat(String(book.sell_price)).toFixed(0)}
              </span>
              {disc > 0 && (
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, textDecoration: "line-through", color: "#555259" }}>
                  ₹{parseFloat(String(book.price)).toFixed(0)}
                </span>
              )}
            </div>

            <div className="book-actions" style={{ display: "flex", gap: 6, opacity: 0, transform: "translateY(8px)", transition: "opacity 400ms ease, transform 400ms ease" }}>
              <button
                style={{
                  flex: 1,
                  fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: "2px",
                  textTransform: "uppercase", fontWeight: 500, padding: "8px 10px",
                  border: "none", cursor: isOos ? "not-allowed" : "pointer",
                  background: isOos ? "rgba(255,255,255,0.07)" : "#c9a84c",
                  color: isOos ? "#555259" : "#0a0a0b",
                  transition: "background 300ms",
                }}
                disabled={isOos}
                onClick={(e) => e.stopPropagation()}
              >
                {isOos ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "8px 10px", cursor: "pointer",
                  color: "#8a8790", background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.08)", transition: "color 300ms, border-color 300ms",
                }}
                aria-label="Wishlist"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen pt-[130px] pb-10 text-[#e8e0d0]"
        style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* ════════════════════════════
            HERO
        ════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden text-center px-6 pb-28 pt-[30px]">
          <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 70%)" }} />

          <p className="hero-eyebrow anim-fade-0 flex items-center gap-4 mb-5 text-[10px] tracking-[6px] uppercase text-[#c9a84c]"
            style={{ fontFamily: "'Jost', sans-serif" }}>
            Curated · Timeless · Rare
          </p>

          <h1
            className="font-light leading-none tracking-[-1px] mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(52px, 9vw, 110px)", color: "#f5f0e8" }}
          >
            <RevealText text="The" delay={0.3} />
            {" "}
            <em className="italic text-[#c9a84c]">
              <RevealText text="AG Classics" delay={0.42} />
            </em>
            <br />
            <RevealText text="Collection" delay={0.65} />
          </h1>

          <p
            className="anim-fade-2 italic mt-[18px] mb-11 max-w-[540px] leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(16px, 2.5vw, 22px)", color: "#9a9aa8" }}
          >
            Literature that endures. Stories that shaped worlds.
            <br />Collected for those who read with intention.
          </p>

          <div className="relative z-10 flex flex-wrap justify-center gap-4">
            <button
              className="mag-cta text-[11px] tracking-[3px] uppercase font-medium px-9 py-[14px] bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer transition-colors duration-300 hover:bg-[#f5f0e8]"
              style={{ fontFamily: "'Jost', sans-serif" }}
              onClick={() => document.getElementById("books")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Collection
            </button>
            <button
              className="mag-cta text-[11px] tracking-[3px] uppercase font-[300] px-9 py-[14px] bg-transparent border border-[rgba(201,168,76,0.25)] text-[#9a9aa8] cursor-pointer transition-[border-color,color] duration-300 hover:border-[#c9a84c] hover:text-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif" }}
              onClick={() => { window.location.href = "/ebooks"; }}
            >
              Browse E-Books
            </button>
          </div>

          <div className="anim-fade-5 absolute bottom-0.5 z-10 flex flex-col items-center gap-2">
            <span className="text-[9px] tracking-[3px] uppercase text-[#6b6b70]" style={{ fontFamily: "'Jost', sans-serif" }}>Scroll</span>
            <div className="anim-scroll w-px h-10" style={{ background: "linear-gradient(to bottom, #8a6f2e, transparent)" }} />
          </div>
        </section>

        {/* ════════════════════════════
            MARQUEE STRIP
        ════════════════════════════ */}
        <div className="overflow-hidden py-[14px] bg-[#141416] border-t border-b border-[rgba(201,168,76,0.1)]">
          <div className="anim-marquee flex gap-12 w-max">
            {[...Array(2)].map((_, i) =>
              ["AG Classics", "Curated Literature", "Timeless Works", "First Editions",
                "Rare Finds", "Signed Copies", "Gift Ready", "Free Shipping"].map((text, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center gap-12 whitespace-nowrap text-[10px] tracking-[4px] uppercase text-[#8a8790]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <span>{text}</span>
                  <div className="w-1 h-1 rotate-45 shrink-0 bg-[#8a6f2e]" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ════════════════════════════
            BOOKS SECTION — 2-row infinite scroll
        ════════════════════════════ */}
        <section id="books">

          {/* Section heading */}
          <div className="text-center px-12 pt-20 pb-12 max-md:px-6 max-md:pt-[60px] max-md:pb-9">
            <span
              className="inline-flex items-center gap-2 mb-5 text-[10px] tracking-[4px] uppercase text-[#c9a84c] px-[14px] py-[4px]"
              style={{ fontFamily: "'Jost', sans-serif", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 999, background: "rgba(201,168,76,0.06)" }}>
              The Collection
            </span>
            <h2
              className="font-light italic leading-[1.1] mt-4 mb-4 text-[#f5f0e8]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 58px)" }}
            >
              AG Classics
            </h2>
            <p className="text-sm max-w-[480px] mx-auto leading-[1.8] tracking-[0.3px] text-[#8a8790]"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Every volume in our AG Classics line is chosen for its enduring significance and the worlds it opens.
            </p>
            <div className="flex items-center justify-center gap-[14px] mt-7">
              <div className="w-[60px] h-px bg-[rgba(201,168,76,0.3)]" />
              <div className="w-[6px] h-[6px] rotate-45 bg-[#8a6f2e]" />
              <div className="w-[60px] h-px bg-[rgba(201,168,76,0.3)]" />
            </div>
          </div>

          {/* ── Loading skeleton rows ── */}
          {loading ? (
            <div className="space-y-3 overflow-hidden px-0">
              {[0, 1].map((row) => (
                <div key={row} className="flex gap-3 px-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden flex-shrink-0 rounded-sm"
                      style={{ width: 220, height: 300, background: "#1c1c1e" }}
                    >
                      <div className="anim-shimmer absolute inset-0"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.05) 50%, transparent 100%)" }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center px-6 py-24">
              <h3 className="text-[28px] font-light italic text-[#f5f0e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Could not load collection
              </h3>
              <p className="text-[13px] max-w-[320px] leading-[1.7] text-[#8a8790]" style={{ fontFamily: "'Jost', sans-serif" }}>
                {error}
              </p>
              <button
                className="mag-cta mt-2 text-[11px] tracking-[3px] uppercase font-medium px-9 py-[14px] bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer"
                style={{ fontFamily: "'Jost', sans-serif" }}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>

          ) : books.length === 0 ? (
            <div className="flex flex-col items-center gap-4 text-center px-6 py-24">
              <h3 className="text-[28px] font-light italic text-[#f5f0e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                The shelves await
              </h3>
              <p className="text-[13px] max-w-[320px] leading-[1.7] text-[#8a8790]" style={{ fontFamily: "'Jost', sans-serif" }}>
                No books yet. Check back soon.
              </p>
            </div>

          ) : (
            /* ── 2-row infinite scroll ── */
            <div className="books-marquee overflow-hidden" style={{ paddingBottom: 4 }}>

              {/* Row 1 — scrolls LEFT (→) */}
              <div className="flex gap-3 mb-3" style={{ width: "max-content" }}>
                <div className="row-scroll-right flex gap-3">
                  {/* Duplicate for seamless loop */}
                  {[...row1, ...row1].map((book, i) => (
                    <BookCard key={`r1-${i}`} book={book} />
                  ))}
                </div>
              </div>

              {/* Row 2 — scrolls RIGHT (←) */}
              <div className="flex gap-3" style={{ width: "max-content" }}>
                <div className="row-scroll-left flex gap-3">
                  {/* Duplicate for seamless loop */}
                  {[...row2Padded, ...row2Padded].map((book, i) => (
                    <BookCard key={`r2-${i}`} book={book} />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* View all link */}
          {books.length > 0 && !loading && !error && (
            <div className="text-center mt-10">
              <a
                href="/ag-classics"
                className="mag-cta inline-block text-[11px] tracking-[3px] uppercase font-medium px-9 py-[13px] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] transition-[background,color] duration-300 hover:bg-[#c9a84c] hover:text-[#0a0a0b]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                View Full Collection
              </a>
            </div>
          )}
        </section>

        {/* ════════════════════════════
            QUOTE BANNER
        ════════════════════════════ */}
        <section
          className="quote-banner relative text-center overflow-hidden mt-16 px-12 py-28 max-md:px-6 max-md:py-20"
          style={{ background: "#141416", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)" }} />
          <p
            className="relative font-light italic max-w-[780px] mx-auto mb-5 leading-[1.5] text-[#f5f0e8]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 3.5vw, 38px)" }}
          >
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </p>
          <span className="text-[11px] tracking-[3px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>
            — George R.R. Martin
          </span>
        </section>

        {/* ════════════════════════════
            PRODUCT SLIDERS
        ════════════════════════════ */}
        <ProductSlider categorySlug="business-professional-skills" eyebrow="Genre" title="Business & Professional Skills" description="Master communication, leadership, and professional etiquette with timeless business classics." visibleCount={5} />
        <ProductSlider categorySlug="finance-wealth" eyebrow="Genre" title="Finance & Wealth" description="Discover proven principles of money, investing, and financial success from legendary authors." visibleCount={5} />
        <ProductSlider categorySlug="self-development" eyebrow="Genre" title="Self Development" description="Build powerful habits, improve mindset, and unlock your full potential with inspiring books." visibleCount={5} />
        <ProductSlider categorySlug="strategy-philosophy" eyebrow="Genre" title="Strategy & Philosophy" description="Explore timeless wisdom on strategy, leadership, and philosophical thinking." visibleCount={5} />
        <ProductSlider categorySlug="classic-literature" eyebrow="Genre" title="Classic Literature" description="Enjoy timeless stories and literary masterpieces that have shaped generations." visibleCount={5} />

        <EbookSection />

        {/* ════════════════════════════
            FEATURES GRID
        ════════════════════════════ */}
        <div
          className="grid gap-px mx-12 mt-10 max-md:grid-cols-2 max-md:mx-6 max-md:mt-[60px] max-sm:grid-cols-1 max-sm:mx-0 max-sm:mt-10"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          {[
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
              title: "Instant Access",
              desc: "Download your eBook immediately after purchase. Start reading in seconds.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></svg>),
              title: "Device Compatible",
              desc: "Compatible with all major devices — mobile, tablet, desktop & e-readers.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
              title: "Secure Digital Payments",
              desc: "Encrypted checkout powered by Razorpay. 100% safe transactions.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
              title: "Cloud Sync Reading",
              desc: "Track progress, bookmarks & highlights across all your devices.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-[18px] p-9 transition-colors duration-300"
              style={{ background: "#141416" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1c1c1f")}
              onMouseLeave={e => (e.currentTarget.style.background = "#141416")}
            >
              <div
                className="shrink-0 mt-0.5 flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.18)" }}
              >
                {f.icon}
              </div>
              <div>
                <h4 className="text-[11px] tracking-[2px] uppercase font-normal mb-[8px] text-[#f0ece4]" style={{ fontFamily: "'Cinzel', serif" }}>
                  {f.title}
                </h4>
                <p className="text-xs leading-[1.7] text-[#8a8790]" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}