"use client";

import { useEffect, useState } from "react";
import ProductSlider from "@/components/home/Productslider";
import { ParallaxLayer, MagneticBtn, RevealText } from "@/components/motion/Motionutils";
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

export default function MainBody() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ag-classics`);
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        if (data.success) setBooks(data.products);
        else throw new Error(data.message || "Unknown error");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const discount = (price: number, sell: number) =>
    price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

  return (
    <>
      <style>{`
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
        @keyframes rotateSlow {
          from { transform: rotate(45deg); }
          to   { transform: rotate(405deg); }
        }
        @keyframes shimmerSweep {
          from { left: -50%; }
          to   { left: 150%; }
        }

        .anim-fade-0 { animation: fadeUp 0.8s ease 0.0s both; }
        .anim-fade-2 { animation: fadeUp 1.0s ease 0.2s both; }
        .anim-fade-5 { animation: fadeUp 1.0s ease 0.5s both; }
        .anim-marquee { animation: marqueeRun 25s linear infinite; }
        .anim-scroll  { animation: scrollDrop 2s ease infinite; }
        .anim-shimmer {
          animation: shimmer 1.8s infinite;
          background-size: 200% 100%;
        }

        /* Hero eyebrow side lines */
        .hero-eyebrow::before,
        .hero-eyebrow::after {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: #8a6f2e;
          flex-shrink: 0;
        }

        /* Rotating hero rings */
        .hero-ring-outer { animation: rotateSlow 40s linear infinite; }
        .hero-ring-inner { animation: rotateSlow 28s linear infinite reverse; }

        /* Quote section decorative mark */
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

        /* Book card hover chain effects */
        .book-card:hover { transform: scale(1.01); z-index: 2; }
        .book-card:hover .book-img {
          transform: scale(1.06);
          filter: brightness(0.7) saturate(0.6);
        }
        .book-card:hover .book-overlay {
          background: linear-gradient(
            to top,
            rgba(10,10,11,0.99) 0%,
            rgba(10,10,11,0.75) 60%,
            rgba(10,10,11,0.3)  100%
          );
        }
        .book-card:hover .book-info    { transform: translateY(0); }
        .book-card:hover .book-actions { opacity: 1; transform: translateY(0); }

        /* CTA button shimmer sweep on hover */
        .mag-cta { position: relative; overflow: hidden; }
        .mag-cta::after {
          content: '';
          position: absolute;
          top: 0; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }
        .mag-cta:hover::after { animation: shimmerSweep 0.55s ease; }
      `}</style>

      {/* ══════════════════════════════════════════
          WRAPPER
          — background is transparent so the fixed
            MotionBackground (particles/glow/beams)
            shows through from layout.tsx
      ══════════════════════════════════════════ */}
      <div
        className="min-h-screen pt-[130px] pb-10"
        style={{ color: "#e8e0d0", fontFamily: "'Jost', sans-serif" }}
      >

        {/* ════════════════════════════
            HERO SECTION
        ════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden text-center px-6 pb-28 pt-[30px]">

          {/* Eyebrow label */}
            <p
              className="hero-eyebrow anim-fade-0 flex items-center gap-4 mb-5 text-[10px] tracking-[6px] uppercase"
              style={{ color: "#c9a84c", fontFamily: "'Jost', sans-serif" }}
            >
              Curated · Timeless · Rare
            </p>

          {/* Main title — deepest parallax + word reveal animation */}
            <h1
              className="font-light leading-none tracking-[-1px] mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(52px, 9vw, 110px)",
                color: "#f5f0e8",
              }}
            >
              <RevealText text="The" delay={0.3} />
              {" "}
              <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                <RevealText text="AG Classics" delay={0.42} />
              </em>
              <br />
              <RevealText text="Collection" delay={0.65} />
            </h1>

          {/* Subtitle */}
            <p
              className="anim-fade-2 italic mt-[18px] mb-11 max-w-[540px] leading-relaxed"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(16px, 2.5vw, 22px)",
                color: "#6b6b70",
              }}
            >
              Literature that endures. Stories that shaped worlds.
              <br />Collected for those who read with intention.
            </p>

          {/* CTA buttons — wrapped in ParallaxLayer + MagneticBtn for full motion */}
          <ParallaxLayer
            depth={10}
            style={{
              position: "relative", zIndex: 10,
              display: "flex", flexWrap: "wrap",
              justifyContent: "center", gap: 16,
            }}
          >
            <MagneticBtn
              className="mag-cta"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: "#0a0a0b",
                background: "#c9a84c",
                fontSize: 11,
                letterSpacing: "3px",
                textTransform: "uppercase",
                padding: "14px 36px",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
              onClick={() => document.getElementById("books")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Collection
            </MagneticBtn>

            <MagneticBtn
              className="mag-cta"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: "#6b6b70",
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.25)",
                fontSize: 11,
                letterSpacing: "3px",
                textTransform: "uppercase",
                padding: "14px 36px",
                fontWeight: 300,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c9a84c";
                e.currentTarget.style.color = "#c9a84c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                e.currentTarget.style.color = "#6b6b70";
              }}
              onClick={() => { window.location.href = "/ebooks"; }}
            >
              Browse E-Books
            </MagneticBtn>
          </ParallaxLayer>

          {/* Scroll indicator */}
          <div className="anim-fade-5 absolute bottom-0.5 flex flex-col items-center gap-2" style={{ zIndex: 10 }}>
            <span
              className="text-[9px] tracking-[3px] uppercase"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
            >
              Scroll
            </span>
            <div
              className="anim-scroll w-px h-10"
              style={{ background: "linear-gradient(to bottom, #8a6f2e, transparent)" }}
            />
          </div>
        </section>

        {/* ════════════════════════════
            MARQUEE STRIP
        ════════════════════════════ */}
        <div
          className="overflow-hidden py-[14px]"
          style={{
            background: "#1c1c1e",
            borderTop: "1px solid rgba(201,168,76,0.1)",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
          }}
        >
          <div className="anim-marquee flex gap-12 w-max">
            {[...Array(2)].map((_, i) =>
              ["AG Classics", "Curated Literature", "Timeless Works", "First Editions",
                "Rare Finds", "Signed Copies", "Gift Ready", "Free Shipping"].map((text, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center gap-12 whitespace-nowrap text-[10px] tracking-[4px] uppercase"
                  style={{ fontFamily: "'Cinzel', serif", color: "#6b6b70" }}
                >
                  <span>{text}</span>
                  <div className="w-1 h-1 rotate-45 flex-shrink-0" style={{ background: "#8a6f2e" }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ════════════════════════════
            BOOKS SECTION
        ════════════════════════════ */}
        <section id="books">

          {/* Section heading with shallow parallax */}
          <div className="text-center px-12 pt-20 pb-12 max-md:px-6 max-md:pt-[60px] max-md:pb-9">
            <ParallaxLayer depth={8}>
              <span
                className="block mb-[14px] text-[10px] tracking-[5px] uppercase"
                style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
              >
                The Collection
              </span>
              <h2
                className="font-light italic leading-[1.1] mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(36px, 5vw, 58px)",
                  color: "#f5f0e8",
                }}
              >
                AG Classics
              </h2>
              <p
                className="text-sm max-w-[480px] mx-auto leading-[1.7] tracking-[0.3px]"
                style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
              >
                Every volume in our AG Classics line is chosen for its enduring significance and the worlds it opens.
              </p>
            </ParallaxLayer>

            {/* Ornament divider */}
            <div className="flex items-center justify-center gap-[14px] mt-7">
              <div className="w-[60px] h-px" style={{ background: "rgba(201,168,76,0.3)" }} />
              <div className="w-[6px] h-[6px] rotate-45" style={{ background: "#8a6f2e" }} />
              <div className="w-[60px] h-px" style={{ background: "rgba(201,168,76,0.3)" }} />
            </div>
          </div>

          {/* ── Loading skeleton ── */}
          {loading ? (
            <div
              className="grid gap-0.5 px-0.5 max-w-[1400px] mx-auto"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative overflow-hidden aspect-[3/4]" style={{ background: "#1c1c1e" }}>
                  <div
                    className="anim-shimmer absolute inset-0"
                    style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.04) 50%, transparent 100%)" }}
                  />
                </div>
              ))}
            </div>

          ) : error ? (
            /* ── Error state ── */
            <div className="flex flex-col items-center gap-4 text-center px-6 py-24">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5" className="opacity-50 mb-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <h3 className="text-[28px] font-light italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
                Could not load collection
              </h3>
              <p className="text-[13px] max-w-[320px] leading-[1.7]" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                {error}
              </p>
              <MagneticBtn
                className="mag-cta mt-2"
                style={{
                  fontFamily: "'Jost', sans-serif", color: "#0a0a0b", background: "#c9a84c",
                  fontSize: 11, letterSpacing: "3px", textTransform: "uppercase",
                  padding: "14px 36px", fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
                onClick={() => window.location.reload()}
              >
                Try Again
              </MagneticBtn>
            </div>

          ) : books.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center gap-4 text-center px-6 py-24">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5" className="opacity-50 mb-2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <h3 className="text-[28px] font-light italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
                The shelves await
              </h3>
              <p className="text-[13px] max-w-[320px] leading-[1.7]" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                No books in the AG Classics collection yet. Check back soon.
              </p>
            </div>

          ) : (
            /* ── Book grid ── */
            <div
              className="grid gap-0.5 px-0.5  mx-auto max-sm:grid-cols-2 max-sm:px-0 max-sm:gap-px"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {books.map((book) => {
                const disc = discount(book.price, book.sell_price);
                const isNew = new Date(book.created_at) > new Date(Date.now() - 30 * 86400000);
                const isOos = book.stock === 0;

                return (
                  <div
                    key={book.id}
                    className="book-card relative overflow-hidden cursor-none transition-transform duration-[400ms] ease-in-out"
                    style={{ background: "#1c1c1e" }}
                    onMouseEnter={() => setHoveredId(book.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => (window.location.href = `/product/${book.slug}`)}
                    data-magnetic
                  >
                    {/* Badge */}
                    {isOos ? (
                      <span className="absolute top-[14px] left-[14px] z-10 text-[9px] tracking-[2px] uppercase font-medium px-[10px] py-[5px]"
                        style={{ fontFamily: "'Jost', sans-serif", background: "rgba(100,100,100,0.6)", color: "#6b6b70" }}>
                        Out of Stock
                      </span>
                    ) : disc > 5 ? (
                      <span className="absolute top-[14px] left-[14px] z-10 text-[9px] tracking-[2px] uppercase font-medium px-[10px] py-[5px]"
                        style={{ fontFamily: "'Jost', sans-serif", background: "#8b3a3a", color: "#f5f0e8" }}>
                        {disc}% Off
                      </span>
                    ) : isNew ? (
                      <span className="absolute top-[14px] left-[14px] z-10 text-[9px] tracking-[2px] uppercase font-medium px-[10px] py-[5px]"
                        style={{ fontFamily: "'Jost', sans-serif", background: "#c9a84c", color: "#0a0a0b" }}>
                        New
                      </span>
                    ) : null}

                    {/* Book image */}
                    {book.main_image ? (
                      <img
                        src={`${API_URL}${book.main_image}`}
                        alt={book.title}
                        className="book-img w-full h-full object-cover block transition-[transform,filter] duration-[600ms] ease-in-out"
                        style={{ filter: "brightness(0.85) saturate(0.8)" }}
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #2a2a2d 0%, #1c1c1e 100%)" }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-50">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div
                      className="book-overlay absolute inset-0 flex flex-col justify-end px-5 pb-6 transition-[background] duration-[400ms]"
                      style={{ background: "linear-gradient(to top, rgba(10,10,11,0.96) 0%, rgba(10,10,11,0.5) 40%, transparent 70%)" }}
                    >
                      <div className="book-info transition-transform duration-[400ms] ease-in-out" style={{ transform: "translateY(8px)" }}>

                        <h3 className="text-[18px] font-semibold leading-[1.25] mb-[6px]"
                          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
                          {book.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-[10px] mb-[14px] flex-wrap">
                          <span className="text-[16px] font-medium" style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }} />
                          {disc > 0 && (
                            <>
                              <span className="text-[13px] line-through" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                                ₹{parseFloat(String(book.price)).toFixed(0)}
                              </span>
                              <span className="text-[10px] tracking-[1px] px-[7px] py-[2px]"
                                style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a", background: "rgba(139,58,58,0.15)" }}>
                                {disc}% off
                              </span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="book-actions flex gap-2 transition-[opacity,transform] duration-[400ms] ease-in-out"
                          style={{ opacity: 0, transform: "translateY(10px)" }}>
                          <button
                            className="flex-1 text-[10px] tracking-[2px] uppercase font-medium px-3 py-[10px] transition-[background] duration-300 disabled:cursor-not-allowed"
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              color: isOos ? "#6b6b70" : "#0a0a0b",
                              background: isOos ? "#2a2a2d" : "#c9a84c",
                              border: "none",
                            }}
                            disabled={isOos}
                            onMouseEnter={(e) => { if (!isOos) e.currentTarget.style.background = "#f5f0e8"; }}
                            onMouseLeave={(e) => { if (!isOos) e.currentTarget.style.background = "#c9a84c"; }}
                            onClick={(e) => { e.stopPropagation(); /* add cart logic here */ }}
                          >
                            {isOos ? "Out of Stock" : "Add to Cart"}
                          </button>

                          <button
                            className="flex items-center justify-center px-3 py-[10px] transition-all duration-300"
                            style={{ color: "#6b6b70", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                            aria-label="Add to wishlist"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#c9a84c";
                              e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#6b6b70";
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ════════════════════════════
            QUOTE BANNER
        ════════════════════════════ */}
        <section className="quote-banner relative text-center overflow-hidden px-12 py-28 max-md:px-6 max-md:py-20">
          <ParallaxLayer depth={20}>
            <p
              className="relative font-light italic max-w-[780px] mx-auto mb-5 leading-[1.5]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(22px, 3.5vw, 38px)",
                color: "#f5f0e8",
              }}
            >
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </p>
          </ParallaxLayer>
          <span className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
            — George R.R. Martin
          </span>
        </section>

        {/* ════════════════════════════
            PRODUCT SLIDER
        ════════════════════════════ */}
          <ProductSlider
            categorySlug="friction"
            eyebrow="Genre"
            title="Friction"
            description="Edge-of-your-seat reads from our Friction imprint."
            visibleCount={5}
          />

          <ProductSlider
            categorySlug="non-friction"
            eyebrow="Genre"
            title="Non Friction"
            description="Real stories. Real impact."
            visibleCount={4}
          />

        {/* ════════════════════════════
            FEATURES GRID
        ════════════════════════════ */}
        <div
          className="grid gap-px mx-12 mt-20 border
            max-md:grid-cols-2 max-md:mx-6 max-md:mt-[60px]
            max-sm:grid-cols-1 max-sm:mx-0 max-sm:mt-10"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            background: "rgba(201,168,76,0.08)",
            borderColor: "rgba(201,168,76,0.08)",
          }}
        >
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              ),
              title: "Instant Access",
              desc: "Download your eBook immediately after purchase. Start reading in seconds.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="8" y1="8" x2="16" y2="8" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="8" y1="16" x2="13" y2="16" />
                </svg>
              ),
              title: "EPUB & PDF Formats",
              desc: "Compatible with all major devices — mobile, tablet, desktop & e-readers.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: "Secure Digital Payments",
              desc: "Encrypted checkout powered by Razorpay. 100% safe transactions.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              title: "Cloud Sync Reading",
              desc: "Track progress, bookmarks & highlights across all your devices.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-[18px] p-9 transition-colors duration-300"
              style={{ background: "#1c1c1e" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#222222")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1c1c1e")}
              data-magnetic
            >
              <div className="flex-shrink-0 mt-0.5" style={{ color: "#c9a84c" }}>{f.icon}</div>
              <div>
                <h4 className="text-[11px] tracking-[2px] uppercase font-normal mb-[7px]"
                  style={{ fontFamily: "'Cinzel', serif", color: "#e8e0d0" }}>
                  {f.title}
                </h4>
                <p className="text-xs leading-[1.6]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
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