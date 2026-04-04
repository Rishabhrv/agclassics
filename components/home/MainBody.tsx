"use client";

import { useEffect, useState, useRef } from "react";
import ProductSlider from "@/components/home/Productslider";
import EbookSection from "@/components/home/EbookSection";
import BookCard from "../book/BookCard";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
import  HeroSlider  from "./HeroSlider";
const F_CORMORANT = { fontFamily: "'Cormorant Garamond', serif" } as const;
const F_CINZEL    = { fontFamily: "'Cinzel', serif" } as const;
const F_JOST      = { fontFamily: "'Jost', sans-serif" } as const;
import BookHeroSection from "./BookHeroSection";
import TopBannerAd from "../ads/TopBannerAd";
import BottomBannerAd from "../ads/BottomBannerAd";
import PopupAd from "../ads/PopupAd";
interface Book {
  id:             number;
  title:          string;
  slug:           string;
  price:          number;
  sell_price:     number;
  main_image:     string;
  stock:          number;
  created_at:     string;
  product_type?:  "ebook" | "physical" | "both";
  ebook_price?:   number;
  ebook_sell_price?: number;
  badge?:         string;
  category?:      string;
  author?:        string;
}

const LEGENDS = [
  { name: "Marcus Aurelius",   years: "121 – 180 AD",  quote: "You have power over your mind, not outside events." },
  { name: "Sun Tzu",           years: "544 – 496 BC",  quote: "Know yourself and you will win all battles." },
  { name: "Jane Austen",       years: "1775 – 1817",   quote: "The person who has not felt the power of love." },
  { name: "George Orwell",     years: "1903 – 1950",   quote: "In a time of deceit, telling the truth is revolution." },
  { name: "Napoleon Hill",     years: "1883 – 1970",   quote: "Whatever the mind can conceive, it can achieve." },
  { name: "Dale Carnegie",     years: "1888 – 1955",   quote: "Any fool can criticise. It takes character to forgive." },
  { name: "Fyodor Dostoevsky", years: "1821 – 1881",   quote: "Pain and suffering are always inevitable for great souls." },
  { name: "Adam Smith",        years: "1723 – 1790",   quote: "The real price of everything is the toil to acquire it." },
];
/* ─────────────────────────────────────────────
   GLOBAL STYLES  (only things Tailwind can't do)
───────────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scrollDrop { 0%,100%{ opacity:.4; transform:scaleY(.7); } 50%{ opacity:1; transform:scaleY(1); } }
  @keyframes shimmer  { from { background-position:-200% 0; } to { background-position:200% 0; } }
  @keyframes shimmerSweep { from{ left:-50%; } to{ left:150%; } }
  @keyframes scrollRight  { from{ transform:translateX(0); }    to{ transform:translateX(-50%); } }
  @keyframes scrollLeft   { from{ transform:translateX(-50%); } to{ transform:translateX(0); }    }

  .row-scroll-right { animation: scrollRight 35s linear infinite; }
  .row-scroll-left  { animation: scrollLeft  35s linear infinite; }
  .books-marquee:hover .row-scroll-right,
  .books-marquee:hover .row-scroll-left { animation-play-state: paused; }

  .anim-fade-0   { animation: fadeUp  0.8s ease 0.0s both; }
  .anim-fade-2   { animation: fadeUp  1.0s ease 0.2s both; }
  .anim-fade-5   { animation: fadeUp  1.0s ease 0.5s both; }
  .anim-scroll   { animation: scrollDrop 2s ease infinite; }
  .anim-shimmer  { background-size:200% 100%; animation: shimmer 1.8s infinite; }

  .hero-eyebrow::before, .hero-eyebrow::after {
    content:''; display:block; width:40px; height:1px; background:#8a6f2e; flex-shrink:0;
  }
  @media (max-width:400px) {
    .hero-eyebrow::before, .hero-eyebrow::after { width:20px; }
  }

  .quote-banner::before {
    content:'\u201C'; position:absolute; top:-20px; left:50%;
    transform:translateX(-50%);
    font-family:'Cormorant Garamond',serif; font-size:280px;
    color:rgba(201,168,76,0.04); line-height:1; pointer-events:none;
  }
  @media (max-width:640px) { .quote-banner::before{ font-size:140px; top:-10px; } }

  /* Book card hover — hover media query so touch devices always see info */
  .book-card { transition: transform 350ms ease, box-shadow 350ms ease; flex-shrink:0; }
  @media (hover: hover) {
    .book-card:hover { transform:scale(1.03); z-index:2; box-shadow:0 12px 40px rgba(0,0,0,.7); }
    .book-card:hover .book-img    { filter:brightness(.65) saturate(.55); transform:scale(1.06); }
    .book-card:hover .book-overlay {
      background:linear-gradient(to top,rgba(10,10,11,.99) 0%,rgba(10,10,11,.80) 60%,rgba(10,10,11,.30) 100%);
    }
    .book-card:hover .book-info    { transform:translateY(0) !important; }
    .book-card:hover .book-actions { opacity:1 !important; transform:translateY(0) !important; }
  }
  @media (hover: none) {
    .book-info    { transform:translateY(0) !important; }
    .book-actions { opacity:1 !important; transform:translateY(0) !important; }
  }

  .mag-cta { position:relative; overflow:hidden; }
  .mag-cta::after {
    content:''; position:absolute; top:0; width:40%; height:100%;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
  }
  .mag-cta:hover::after { animation: shimmerSweep 0.55s ease; }

  .books-marquee {
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
    mask-image:         linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
  }

  @media (max-width:640px)  { .book-card-responsive{ width:160px !important; height:230px !important; } }
  @media (min-width:641px) and (max-width:1024px) { .book-card-responsive{ width:200px !important; height:290px !important; } }
`;

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────── */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[200] flex items-center gap-3 px-4 sm:px-5 py-3 text-[10px] sm:text-[11px] tracking-[2px] uppercase"
      style={{
        transform: "translateX(-50%)",
        background: "#1c1c1e",
        border: "1px solid rgba(201,168,76,0.25)",
        color: "#c9a84c",
        fontFamily: "'Jost', sans-serif",
        animation: "fadeUp 0.3s ease both",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        whiteSpace: "nowrap",
      }}
    >
      <div className="w-[6px] h-[6px] rotate-45 bg-[#c9a84c] shrink-0" aria-hidden="true" />
      {msg}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN BODY
───────────────────────────────────────────────── */
export default function MainBody() {
  const [books, setBooks]     = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [toast, setToast]     = useState<string | null>(null);
    const [activeLegend, setActiveLegend]   = useState(0);
    const [featuredIdx, setFeaturedIdx] = useState(0);
const featuredTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
    /* Rotate legend every 3.5 s */
    useEffect(() => {
      timerRef.current = setInterval(() => {
        setActiveLegend((p) => (p + 1) % LEGENDS.length);
      }, 5500);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);
    const legend = LEGENDS[activeLegend];

    useEffect(() => {
  if (!books.length) return;
  featuredTimerRef.current = setInterval(() => {
    setFeaturedIdx((prev) => (prev + 1) % books.length);
  }, 5000);
  return () => {
    if (featuredTimerRef.current) clearInterval(featuredTimerRef.current);
  };
}, [books]);

const featuredSlug = books[featuredIdx]?.slug ?? "autobiography-of-a-yogi";

  useEffect(() => {
    (async () => {
      try {
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

  /* ── Inject dynamic book schema once books load ── */
  useEffect(() => {
    if (!books.length) return;
    const id = "ag-books-schema";
    // Remove any previous injection
    document.getElementById(id)?.remove();

    const schema = {
      "@context":        "https://schema.org",
      "@type":           "ItemList",
      name:              "The AG Classics Collection",
      numberOfItems:     books.length,
      itemListElement:   books.map((b, i) => ({
        "@type":    "ListItem",
        position:   i + 1,
        url:        `${window.location.origin}/product/${b.slug}`,
        name:       b.title,
        item: {
          "@type":       "Book",
          name:          b.title,
          url:           `${window.location.origin}/product/${b.slug}`,
          image:         b.main_image ? `${API_URL}${b.main_image}` : undefined,
          offers: {
            "@type":       "Offer",
            price:         b.sell_price,
            priceCurrency: "INR",
            availability:  b.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url:           `${window.location.origin}/product/${b.slug}`,
          },
        },
      })),
    };

    const script = document.createElement("script");
    script.id   = id;
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => { document.getElementById(id)?.remove(); };
  }, [books]);

  const calcDiscount = (price: number, sell: number) =>
    price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

  const half       = Math.max(1, Math.ceil(books.length / 2));
  const row1       = books.slice(0, half);
  const row2       = books.slice(half);
  const row2Padded = row2.length > 0 ? row2 : row1;


  const toCardBook = (b: Book) => ({
    ...b,
    image:        `${API_URL}${b.main_image}`,
    product_type: b.product_type ?? "physical" as const,
  });
  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <>
      <style>{globalStyles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div
        className="min-h-screen pt-[90px] sm:pt-[130px] pb-10 text-[#e8e0d0]"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >

        <HeroSlider books={books} loading={loading} />


        <BookHeroSection slug={featuredSlug} />
            <TopBannerAd pageType="home" />
            <PopupAd pageType="home" />

            {/* ════════════════════════════
    EBOOK PROMO SECTION
════════════════════════════ */}
<section
  aria-label="eBooks available"
  className="relative overflow-hidden mx-4 sm:mx-12 my-10 sm:my-16"
  style={{ background: "#0f0f11", border: "1px solid rgba(201,168,76,0.15)" }}
>
  {/* Decorative glow */}
  <div
    className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px]"
    style={{
      background: "radial-gradient(circle at top right, rgba(201,168,76,0.08) 0%, transparent 65%)",
    }}
  />
  <div
    className="pointer-events-none absolute bottom-0 left-0 w-[300px] h-[300px]"
    style={{
      background: "radial-gradient(circle at bottom left, rgba(201,168,76,0.05) 0%, transparent 65%)",
    }}
  />

  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0">

    {/* LEFT — text */}
    <div className="flex flex-col justify-center px-7 sm:px-12 py-12 sm:py-16">

      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-6 h-px bg-[#c9a84c]" />
        <span
          className="text-[10px] tracking-[3.5px] uppercase text-[#c9a84c]"
          style={F_JOST}
        >
          Digital Library
        </span>
      </div>

      <h2
        className="font-light leading-[1.1] text-[#f5f0e8] mb-4"
        style={{ ...F_CORMORANT, fontSize: "clamp(28px, 4.5vw, 54px)" }}
      >
        Read Anywhere,{" "}
        <br />
        <em className="italic text-[#c9a84c]">Anytime.</em>
      </h2>

      <p
        className="text-sm leading-[1.9] text-[#8a8790] max-w-sm mb-8"
        style={F_JOST}
      >
        Our entire collection is available as eBooks compatible with every device. 
        No shipping. No waiting. Just reading.
      </p>

      {/* Feature pills */}
      <ul className="flex flex-wrap gap-2 mb-9">
        {[ "Friendly Reader", "All Devices", "Lifetime Access"].map((pill) => (
          <li
            key={pill}
            className="text-[10px] tracking-[1.5px] uppercase px-3 py-1.5"
            style={{
              fontFamily: "'Jost', sans-serif",
              color: "#c9a84c",
              border: "1px solid rgba(201,168,76,0.25)",
              background: "rgba(201,168,76,0.05)",
            }}
          >
            {pill}
          </li>
        ))}
      </ul>

      <a
        href="/ebooks"
        className="mag-cta inline-flex items-center gap-3 w-fit text-[10px] sm:text-[11px] tracking-[3px] uppercase font-medium px-7 py-[13px] bg-[#c9a84c] text-[#0a0a0b] transition-opacity hover:opacity-90"
        style={F_JOST}
      >
        Browse eBooks
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>

    {/* RIGHT — visual */}
    <div
      className="relative flex items-center justify-center py-12 px-8"
      style={{ background: "rgba(201,168,76,0.03)", borderLeft: "1px solid rgba(201,168,76,0.1)" }}
    >

      {/* Stacked mock device */}
      <div className="relative w-[220px] sm:w-[260px]">

        {/* Tablet frame */}
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: "#1a1a1c",
            border: "2px solid rgba(201,168,76,0.2)",
            aspectRatio: "3/4",
          }}
        >
          {/* Screen glare */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
            }}
          />

{/* Auto-scrolling 2x2 book covers */}
<div className="absolute inset-3 overflow-hidden">
  <style>{`
    @keyframes scrollUp {
      from { transform: translateY(0); }
      to   { transform: translateY(-50%); }
    }
    .books-scroll-up {
      animation: scrollUp 15s linear infinite;
    }
    .books-scroll-up:hover {
      animation-play-state: paused;
    }
  `}</style>

  <div className="books-scroll-up grid grid-cols-2 gap-1.5">
    {[
      ...(books.length > 0 ? books : new Array(8).fill({} as Book)),
      ...(books.length > 0 ? books : new Array(8).fill({} as Book)),
    ].map((book, i) => (
      <div
        key={i}
        className="rounded-sm overflow-hidden flex-shrink-0"
        style={{  background: "#1a1a1c" }}
      >
        {(book as Book).main_image ? (
          <img
            src={`${API_URL}${(book as Book).main_image}`}
            alt={(book as Book).title}
            className=" m-1 object-cover rounded-sm"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(145deg, #2a2318, #1a1610)" }}
          />
        )}
      </div>
    ))}
  </div>
</div>

          {/* Bottom bar */}
          <div
            className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between"
            style={{ background: "rgba(10,10,11,0.85)", backdropFilter: "blur(8px)" }}
          >
            <span className="text-[9px] tracking-[2px] uppercase text-[#c9a84c]" style={F_JOST}>
  {books.length > 0 ? `${books.length}+ books` : "eBooks"}
</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#c9a84c]" style={{ opacity: i === 0 ? 1 : 0.35 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Floating badge */}
        <div
          className="absolute -top-4 -right-4 flex flex-col items-center justify-center w-[72px] h-[72px] rounded-full text-center"
          style={{
            background: "#c9a84c",
            color: "#0a0a0b",
            boxShadow: "0 8px 30px rgba(201,168,76,0.35)",
          }}
        >
          <span className="text-[9px] font-bold tracking-[1px] uppercase leading-tight" style={F_JOST}>
            Instant
          </span>
          <span className="text-[9px] font-bold tracking-[1px] uppercase leading-tight" style={F_JOST}>
            Access
          </span>
        </div>

        {/* Floating format pill */}
        <div
          className="absolute -bottom-4 -left-4 px-3 py-1.5 text-[9px] tracking-[2px] uppercase"
          style={{
            background: "#1c1c1f",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "#c9a84c",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          Buy Now
        </div>
      </div>
    </div>
  </div>
</section>


<section id="books" aria-label="AG Classics book collection">

  {/* Section intro */}
  <div className="text-center px-4 sm:px-12 pt-1 pb-4 sm:pb-7">
    <h2
      className="anim-fadeUp-1 font-light text-center leading-[1.05] text-[#f5f0e8] m-0"
      style={{ ...F_CORMORANT, fontSize: "clamp(28px,6vw,75px)" }}
    >
      Continuing the Legacy of{" "}
      <br className="hidden sm:block" />
      <em className="italic text-[#c9a84c]">Timeless Literature</em>
    </h2>

    <p
      className="text-[13px] sm:text-base max-w-[340px] sm:max-w-[480px] mx-auto mt-3 sm:mt-4 leading-[1.8] tracking-[0.3px] text-white"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      Sun Tzu. Jane Austen. Napoleon Hill.
      Their words have outlived empires —
      now they live in your pocket.
    </p>

    <div className="flex items-center justify-center gap-[14px] mt-5 sm:mt-7" aria-hidden="true">
      <div className="w-[32px] sm:w-[60px] h-px bg-[rgba(201,168,76,0.3)]" />
      <div className="w-[6px] h-[6px] rotate-45 bg-[#8a6f2e]" />
      <div className="w-[32px] sm:w-[60px] h-px bg-[rgba(201,168,76,0.3)]" />
    </div>
  </div>

  {/* Loading skeleton */}
  {loading && (
    <div className="space-y-3 overflow-hidden px-0" aria-busy="true" aria-label="Loading books">
      {[0, 1].map((row) => (
        <div key={row} className="flex gap-2 sm:gap-3 px-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden flex-shrink-0 rounded-sm"
              style={{
                width: "clamp(140px, 38vw, 220px)",
                height: "clamp(190px, 52vw, 300px)",
                background: "#1c1c1e",
              }}
            >
              <div
                className="anim-shimmer absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.05) 50%, transparent 100%)",
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )}

  {/* Error */}
  {error && (
    <div
      className="flex flex-col items-center gap-4 text-center px-4 sm:px-6 py-12 sm:py-24"
      role="alert"
    >
      <h2
        className="text-[22px] sm:text-[28px] font-light italic text-[#f5f0e8]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Could not load collection
      </h2>
      <p
        className="text-[12px] sm:text-[13px] max-w-[280px] sm:max-w-[320px] leading-[1.7] text-[#8a8790]"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {error}
      </p>
      <button
        className="mag-cta mt-2 w-full max-w-[240px] sm:w-auto text-[10px] sm:text-[11px] tracking-[3px] uppercase font-medium px-7 sm:px-9 py-[13px] sm:py-[14px] bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer"
        style={{ fontFamily: "'Jost', sans-serif" }}
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  )}

  {/* Empty */}
  {!loading && !error && books.length === 0 && (
    <div className="flex flex-col items-center gap-4 text-center px-6 py-16 sm:py-24">
      <h2
        className="text-[24px] sm:text-[28px] font-light italic text-[#f5f0e8]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        The shelves await
      </h2>
      <p
        className="text-[12px] sm:text-[13px] max-w-[280px] sm:max-w-[320px] leading-[1.7] text-[#8a8790]"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        No books yet. Check back soon.
      </p>
    </div>
  )}

  {/* ════════════════════════════
      BOOKS — 2-row infinite scroll
  ════════════════════════════ */}
  {!loading && !error && books.length > 0 && (
    <div
      className="books-marquee overflow-hidden"
      style={{ paddingBottom: 4 }}
      aria-label="Scrolling preview of AG Classics books — click any book to view details"
    >
      {/* Row 1 — scrolls right */}
      <div className="row-scroll-right flex gap-1.5 sm:gap-2">
        {[...row1, ...row1].map((book, i) => (
          <div
            key={`r1-${i}`}
            className="flex-shrink-0"
            style={{ width: "clamp(160px, 42vw, 300px)" }}
          >
            <BookCard book={toCardBook(book)} visibleCount={1} />
          </div>
        ))}
      </div>

      {/* Row 2 — scrolls left */}
      <div className="row-scroll-left flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
        {[...row2Padded, ...row2Padded].map((book, i) => (
          <div
            key={`r2-${i}`}
            className="flex-shrink-0"
            style={{ width: "clamp(160px, 42vw, 300px)" }}
          >
            <BookCard book={toCardBook(book)} visibleCount={1} />
          </div>
        ))}
      </div>
    </div>
  )}

  {/* View all CTA */}
  {books.length > 0 && !loading && !error && (
    <div className="text-center mt-7 sm:mt-10 px-6 sm:px-0">
      <a
        href="/category/business-professional-skills"
        className="mag-cta inline-block w-full sm:w-auto text-[10px] sm:text-[11px] tracking-[3px] uppercase font-medium px-7 sm:px-9 py-[13px] sm:py-[14px] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] transition-[background,color] duration-300 hover:bg-[#c9a84c] hover:text-[#0a0a0b]"
        style={{ fontFamily: "'Jost', sans-serif" }}
        aria-label="View the full AG Classics book collection"
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
          className="quote-banner relative text-center overflow-hidden mt-12 sm:mt-16 px-4 sm:px-12 py-16 sm:pt-28 max-md:px-6 max-md:py-15"
          style={{ background: "#141416", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          aria-label="Featured reading quote"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <blockquote
            className="relative font-light italic max-w-[780px] mx-auto  leading-[1.5] text-[#f5f0e8]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(18px, 3.5vw, 38px)" }}
          >
            <p>"Every book read is a step ahead in the art of understanding life."</p>
            <footer>
              <cite
                className="text-[10px] sm:text-[11px] tracking-[3px] uppercase not-italic text-[#c9a84c]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                — Sun Tzu
              </cite>
            </footer>
          </blockquote>
        </section>


        {/* ════════════════════════════
            GENRE SLIDERS
        ════════════════════════════ */}
        <section aria-label="Browse books by genre">
          <ProductSlider categorySlug="business-professional-skills" eyebrow="Genre" title="Business & Professional Skills" visibleCount={4} />
          <ProductSlider categorySlug="finance-wealth"               eyebrow="Genre" title="Finance & Wealth"               visibleCount={4} />
          <ProductSlider categorySlug="self-development"             eyebrow="Genre" title="Self Development"               visibleCount={4} />
          <ProductSlider categorySlug="strategy-philosophy"          eyebrow="Genre" title="Strategy & Philosophy"          visibleCount={4} />
          <ProductSlider categorySlug="classic-literature"           eyebrow="Genre" title="Classic Literature"            visibleCount={4} />
        </section>

        <EbookSection />

        


        {/* ════════════════════════════
            FEATURES GRID
        ════════════════════════════ */}
        <section
          aria-label="Why shop at AG Classics"
          className="grid gap-px mx-4 sm:mx-12 mt-10 mb-5 grid-cols-1 xs:grid-cols-2 md:grid-cols-4 max-md:mt-[60px] max-sm:mt-10"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          {[
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
              title: "Instant Access",
              desc:  "Access your eBook immediately after purchase. Start reading in seconds.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></svg>),
              title: "Device Compatible",
              desc:  "Compatible with all major devices — mobile, tablet, desktop & e-readers.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
              title: "Secure Digital Payments",
              desc:  "Encrypted checkout powered by Razorpay. 100% safe transactions.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
              title: "Cloud Sync Reading",
              desc:  "Track progress, bookmarks & highlights across all your devices.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-[14px] sm:gap-[18px] p-6 sm:p-9 transition-colors duration-300"
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
                <h3
                  className="text-[10px] sm:text-[11px] tracking-[2px] uppercase font-normal mb-1.5 sm:mb-2 text-[#f0ece4]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-xs leading-[1.7] text-[#8a8790]" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </section>
        
         <BottomBannerAd pageType="home" />

      </div>
    </>
  );
}