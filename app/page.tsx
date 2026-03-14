"use client";

import { useEffect, useState } from "react";
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

/* ── Only keyframes that have no Tailwind equivalent stay here ── */
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

  .anim-fade-0 { animation: fadeUp 0.8s ease 0.0s both; }
  .anim-fade-2 { animation: fadeUp 1.0s ease 0.2s both; }
  .anim-fade-5 { animation: fadeUp 1.0s ease 0.5s both; }
  .anim-marquee { animation: marqueeRun 25s linear infinite; }
  .anim-scroll  { animation: scrollDrop 2s ease infinite; }
  .anim-shimmer {
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite;
  }

  /* Side lines on eyebrow label */
  .hero-eyebrow::before,
  .hero-eyebrow::after {
    content: '';
    display: block;
    width: 40px;
    height: 1px;
    background: #8a6f2e;
    flex-shrink: 0;
  }

  /* Decorative opening-quote watermark */
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

  /* Book card hover chain — these cascade through 4 child selectors
     and can't be expressed with Tailwind group-hover alone */
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

  /* CTA shimmer sweep — requires ::after pseudo + animation on hover */
  .mag-cta { position: relative; overflow: hidden; }
  .mag-cta::after {
    content: '';
    position: absolute;
    top: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  }
  .mag-cta:hover::after { animation: shimmerSweep 0.55s ease; }
`;

export default function MainBody() {
  const [books, setBooks]     = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const calcDiscount = (price: number, sell: number) =>
    price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen pt-[130px] pb-10 text-[#e8e0d0]"
        style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* ════════════════════════════
            HERO
        ════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden text-center px-6 pb-28 pt-[30px]">

          {/* Eyebrow */}
          <p className="hero-eyebrow anim-fade-0 flex items-center gap-4 mb-5 text-[10px] tracking-[6px] uppercase text-[#c9a84c]"
            style={{ fontFamily: "'Jost', sans-serif" }}>
            Curated · Timeless · Rare
          </p>

          {/* Title */}
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
            <em className="italic text-[#c9a84c]">
              <RevealText text="AG Classics" delay={0.42} />
            </em>
            <br />
            <RevealText text="Collection" delay={0.65} />
          </h1>

          {/* Subtitle */}
          <p
            className="anim-fade-2 italic mt-[18px] mb-11 max-w-[540px] leading-relaxed text-[#6b6b70]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(16px, 2.5vw, 22px)",
            }}
          >
            Literature that endures. Stories that shaped worlds.
            <br />Collected for those who read with intention.
          </p>

          {/* CTA buttons */}
          <div className="relative z-10 flex flex-wrap justify-center gap-4">
            <button
              className="mag-cta text-[11px] tracking-[3px] uppercase font-medium px-9 py-[14px]
                bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer
                transition-colors duration-300 hover:bg-[#f5f0e8]"
              style={{ fontFamily: "'Jost', sans-serif" }}
              onClick={() => document.getElementById("books")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Collection
            </button>

            <button
              className="mag-cta text-[11px] tracking-[3px] uppercase font-[300] px-9 py-[14px]
                bg-transparent border border-[rgba(201,168,76,0.25)] text-[#6b6b70] cursor-pointer
                transition-[border-color,color] duration-300
                hover:border-[#c9a84c] hover:text-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif" }}
              onClick={() => { window.location.href = "/ebooks"; }}
            >
              Browse E-Books
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="anim-fade-5 absolute bottom-0.5 z-10 flex flex-col items-center gap-2">
            <span className="text-[9px] tracking-[3px] uppercase text-[#6b6b70]"
              style={{ fontFamily: "'Jost', sans-serif" }}>
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
        <div className="overflow-hidden py-[14px] bg-[#1c1c1e] border-t border-b border-[rgba(201,168,76,0.1)]">
          <div className="anim-marquee flex gap-12 w-max">
            {[...Array(2)].map((_, i) =>
              ["AG Classics", "Curated Literature", "Timeless Works", "First Editions",
                "Rare Finds", "Signed Copies", "Gift Ready", "Free Shipping"].map((text, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center gap-12 whitespace-nowrap text-[10px] tracking-[4px] uppercase text-[#6b6b70]"
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
            BOOKS SECTION
        ════════════════════════════ */}
        <section id="books">

          {/* Section heading */}
          <div className="text-center px-12 pt-20 pb-12 max-md:px-6 max-md:pt-[60px] max-md:pb-9">
            <span className="block mb-[14px] text-[10px] tracking-[5px] uppercase text-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              The Collection
            </span>
            <h2
              className="font-light italic leading-[1.1] mb-3 text-[#f5f0e8]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 5vw, 58px)",
              }}
            >
              AG Classics
            </h2>
            <p className="text-sm max-w-[480px] mx-auto leading-[1.7] tracking-[0.3px] text-[#6b6b70]"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Every volume in our AG Classics line is chosen for its enduring significance and the worlds it opens.
            </p>

            {/* Ornament divider */}
            <div className="flex items-center justify-center gap-[14px] mt-7">
              <div className="w-[60px] h-px bg-[rgba(201,168,76,0.3)]" />
              <div className="w-[6px] h-[6px] rotate-45 bg-[#8a6f2e]" />
              <div className="w-[60px] h-px bg-[rgba(201,168,76,0.3)]" />
            </div>
          </div>

          {/* ── Loading skeleton ── */}
          {loading ? (
            <div
              className="grid gap-0.5 px-0.5 max-w-[1400px] mx-auto"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative overflow-hidden aspect-[3/4] bg-[#1c1c1e]">
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
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5"
                className="opacity-50 mb-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <h3 className="text-[28px] font-light italic text-[#f5f0e8]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Could not load collection
              </h3>
              <p className="text-[13px] max-w-[320px] leading-[1.7] text-[#6b6b70]"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                {error}
              </p>
              <button
                className="mag-cta mt-2 text-[11px] tracking-[3px] uppercase font-medium px-9 py-[14px]
                  bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer
                  transition-colors duration-300 hover:bg-[#f5f0e8]"
                style={{ fontFamily: "'Jost', sans-serif" }}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>

          ) : books.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center gap-4 text-center px-6 py-24">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5"
                className="opacity-50 mb-2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <h3 className="text-[28px] font-light italic text-[#f5f0e8]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                The shelves await
              </h3>
              <p className="text-[13px] max-w-[320px] leading-[1.7] text-[#6b6b70]"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                No books in the AG Classics collection yet. Check back soon.
              </p>
            </div>

          ) : (
            /* ── Book grid ── */
            <div
              className="grid gap-0.5 px-0.5 mx-auto max-sm:grid-cols-2 max-sm:px-0 max-sm:gap-px"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {books.map((book) => {
                const disc  = calcDiscount(book.price, book.sell_price);
                const isNew = new Date(book.created_at) > new Date(Date.now() - 30 * 86400000);
                const isOos = book.stock === 0;

                return (
                  <div
                    key={book.id}
                    className="book-card relative overflow-hidden cursor-pointer transition-transform duration-[400ms] ease-in-out bg-[#1c1c1e]"
                    onClick={() => (window.location.href = `/product/${book.slug}`)}
                    data-magnetic
                  >
                    {/* Badge */}
                    {isOos ? (
                      <span
                        className="absolute top-[14px] left-[14px] z-10 text-[9px] tracking-[2px] uppercase font-medium px-[10px] py-[5px] bg-gray-300 text-[#6b6b70]"
                        style={{ fontFamily: "'Jost', sans-serif" }}>
                        Out of Stock
                      </span>
                    ) : disc > 5 ? (
                      <span
                        className="absolute top-[14px] left-[14px] z-10 text-[9px] tracking-[2px] uppercase font-medium px-[10px] py-[5px] bg-[#8b3a3a] text-[#f5f0e8]"
                        style={{ fontFamily: "'Jost', sans-serif" }}>
                        {disc}% Off
                      </span>
                    ) : isNew ? (
                      <span
                        className="absolute top-[14px] left-[14px] z-10 text-[9px] tracking-[2px] uppercase font-medium px-[10px] py-[5px] bg-[#c9a84c] text-[#0a0a0b]"
                        style={{ fontFamily: "'Jost', sans-serif" }}>
                        New
                      </span>
                    ) : null}

                    {/* Cover image */}
                    {book.main_image ? (
                      <img
                        src={`${API_URL}${book.main_image}`}
                        alt={book.title}
                        className="book-img w-full h-full object-cover block transition-[transform,filter] duration-[600ms] ease-in-out brightness-[.85] saturate-[.8]"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2a2d] to-[#1c1c1e]">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-50">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Gradient overlay + info */}
                    <div
                      className="book-overlay absolute inset-0 flex flex-col justify-end px-5 pb-6 transition-[background] duration-[400ms]"
                      style={{ background: "linear-gradient(to top, rgba(10,10,11,0.96) 0%, rgba(10,10,11,0.5) 40%, transparent 70%)" }}
                    >
                      <div
                        className="book-info transition-transform duration-[400ms] ease-in-out"
                        style={{ transform: "translateY(8px)" }}
                      >
                        <h3
                          className="text-[18px] font-semibold leading-[1.25] mb-[6px] text-[#f5f0e8]"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {book.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-[10px] mb-[14px] flex-wrap">
                          <span className="text-[16px] font-medium text-[#c9a84c]"
                            style={{ fontFamily: "'Jost', sans-serif" }} />
                          {disc > 0 && (
                            <>
                              <span className="text-[13px] line-through text-[#6b6b70]"
                                style={{ fontFamily: "'Jost', sans-serif" }}>
                                ₹{parseFloat(String(book.price)).toFixed(0)}
                              </span>
                              <span
                                className="text-[10px] tracking-[1px] px-[7px] py-[2px] text-[#8b3a3a] bg-[rgba(139,58,58,0.15)]"
                                style={{ fontFamily: "'Jost', sans-serif" }}>
                                {disc}% off
                              </span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div
                          className="book-actions flex gap-2 transition-[opacity,transform] duration-[400ms] ease-in-out"
                          style={{ opacity: 0, transform: "translateY(10px)" }}
                        >
                          <button
                            className={[
                              "flex-1 text-[10px] tracking-[2px] uppercase font-medium px-3 py-[10px]",
                              "border-none transition-colors duration-300",
                              isOos
                                ? "bg-[#2a2a2d] text-[#6b6b70] cursor-not-allowed"
                                : "bg-[#c9a84c] text-[#0a0a0b] cursor-pointer hover:bg-[#f5f0e8]",
                            ].join(" ")}
                            style={{ fontFamily: "'Jost', sans-serif" }}
                            disabled={isOos}
                            onClick={(e) => { e.stopPropagation(); /* add cart logic here */ }}
                          >
                            {isOos ? "Out of Stock" : "Add to Cart"}
                          </button>

                          <button
                            className="flex items-center justify-center px-3 py-[10px]
                              text-[#6b6b70] bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.1)]
                              transition-all duration-300 hover:text-[#c9a84c] hover:border-[rgba(201,168,76,0.4)]"
                            aria-label="Add to wishlist"
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
        <section className="quote-banner relative text-center overflow-hidden mt-10 px-12 py-28 max-md:px-6 max-md:py-20">
          <p
            className="relative font-light italic max-w-[780px] mx-auto mb-5 leading-[1.5] text-[#f5f0e8]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(22px, 3.5vw, 38px)",
            }}
          >
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </p>
          <span
            className="text-[11px] tracking-[3px] uppercase text-[#c9a84c]"
            style={{ fontFamily: "'Jost', sans-serif" }}>
            — George R.R. Martin
          </span>
        </section>

        {/* ════════════════════════════
            PRODUCT SLIDERS
        ════════════════════════════ */}
        <ProductSlider categorySlug="business-professional-skills" eyebrow="Genre"
          title="Business & Professional Skills"
          description="Master communication, leadership, and professional etiquette with timeless business classics."
          visibleCount={5} />
        <ProductSlider categorySlug="finance-wealth" eyebrow="Genre"
          title="Finance & Wealth"
          description="Discover proven principles of money, investing, and financial success from legendary authors."
          visibleCount={5} />
        <ProductSlider categorySlug="self-development" eyebrow="Genre"
          title="Self Development"
          description="Build powerful habits, improve mindset, and unlock your full potential with inspiring books."
          visibleCount={5} />
        <ProductSlider categorySlug="strategy-philosophy" eyebrow="Genre"
          title="Strategy & Philosophy"
          description="Explore timeless wisdom on strategy, leadership, and philosophical thinking."
          visibleCount={5} />
        <ProductSlider categorySlug="classic-literature" eyebrow="Genre"
          title="Classic Literature"
          description="Enjoy timeless stories and literary masterpieces that have shaped generations."
          visibleCount={5} />



          <EbookSection />

        {/* ════════════════════════════
            FEATURES GRID
        ════════════════════════════ */}
        <div
          className="grid gap-px mx-12 mt-10 border border-[rgba(201,168,76,0.08)] bg-[rgba(201,168,76,0.08)]
            max-md:grid-cols-2 max-md:mx-6 max-md:mt-[60px]
            max-sm:grid-cols-1 max-sm:mx-0 max-sm:mt-10"
          style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
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
              title: "Device Compatible",
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
              className="flex items-start gap-[18px] p-9 bg-[#1c1c1e] transition-colors duration-300 hover:bg-[#222222]"
              data-magnetic
            >
              <div className="shrink-0 mt-0.5 text-[#c9a84c]">{f.icon}</div>
              <div>
                <h4
                  className="text-[11px] tracking-[2px] uppercase font-normal mb-[7px] text-[#e8e0d0]"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {f.title}
                </h4>
                <p className="text-xs leading-[1.6] text-[#6b6b70]"
                  style={{ fontFamily: "'Jost', sans-serif" }}>
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