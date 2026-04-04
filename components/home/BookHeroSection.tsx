"use client";

import { useEffect, useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ─── Types ─────────────────────────────────────────── */
interface Author {
  id: number;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
}
interface Product {
  id: number;
  title: string;
  slug: string;
  main_image: string;
  description: string;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  product_type: "ebook" | "physical" | "both";
  avg_rating: number | null;
  review_count: number;
  authors: Author[];
}
interface BookHeroSectionProps { slug: string; }

/* ─── Styles ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Cinzel:wght@400;500;600;700;900&family=Jost:wght@200;300;400;500&display=swap');

  .bh-mega-title {
    font-family: 'Cinzel', serif;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -1px;
    color: #f5f0e8;
    font-size: clamp(28px, 6vw, 60px);
    text-transform: uppercase;
    user-select: none;
  }
  .bh-mega-title .outlined {
    -webkit-text-stroke: 1.5px rgba(201,168,76,0.55);
    color: transparent;
  }

  @keyframes bh-fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bh-coverFloat {
    0%,100% { transform: translateY(0px) rotate(-1.5deg); }
    50%     { transform: translateY(-10px) rotate(-1.5deg); }
  }
  @keyframes bh-shimmer {
    from { background-position: -400% 0; }
    to   { background-position:  400% 0; }
  }
  @keyframes bh-goldPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
    50%     { box-shadow: 0 0 28px 4px rgba(201,168,76,0.18); }
  }
  @keyframes bh-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .bh-content-switch { animation: bh-fadeIn 0.55s ease both; }

  .bh-shimmer {
    background: linear-gradient(90deg, #1a1a1d 0%, #252525 50%, #1a1a1d 100%);
    background-size: 400% 100%;
    animation: bh-shimmer 1.6s ease infinite;
  }

  .bh-cover-float { animation: bh-coverFloat 6s ease-in-out infinite; }

  .bh-star       { color: #c9a84c; font-size: 13px; }
  .bh-star.empty { color: rgba(201,168,76,0.25); }

  .bh-author-ring {
    border-radius: 50%;
    border: 2px solid rgba(201,168,76,0.55);
    padding: 3px;
    background: rgba(201,168,76,0.05);
    animation: bh-goldPulse 5s ease-in-out infinite;
  }

  .bh-vertical-text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(201,168,76,0.35);
    user-select: none;
  }

  /* Mobile: on small screens stop the float so layout doesn't jitter */
  @media (max-width: 639px) {
    .bh-cover-float {
      animation: none;
      transform: none !important;
    }
  }
`;

/* ─── Helpers ─────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);

const Stars = ({ rating }: { rating: number | null }) => {
  const r = Math.round(rating ?? 0);
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`bh-star${s > r ? " empty" : ""}`}>★</span>
      ))}
    </span>
  );
};

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const MegaTitle = ({ title }: { title: string }) => {
  const words = title.split(" ");
  return (
    <h2 className="bh-mega-title" aria-label={title}>
      {words.map((word, i) => (
        <span key={i} className={i % 2 === 1 ? "outlined" : ""}>
          {word}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
};

/* ─── Skeleton ─────────────────────────────────────────── */
const Skeleton = () => (
  <section className="bg-[#06060a] min-h-svh flex flex-col pt-20">
    <div className="bh-shimmer mx-4 sm:mx-8 mt-4 h-[60px] sm:h-[90px] rounded-sm" />
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 px-4 sm:px-8 mt-8 sm:mt-10 flex-1">
      <div className="bh-shimmer w-full sm:flex-1 h-[200px] sm:h-[260px] rounded-sm" />
      <div className="bh-shimmer w-[140px] sm:w-[180px] h-[200px] sm:h-[260px] rounded-sm mx-auto sm:mx-0" />
      <div className="bh-shimmer w-full sm:flex-1 h-[200px] sm:h-[260px] rounded-sm" />
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function BookHeroSection({ slug }: BookHeroSectionProps) {
  const [displayed, setDisplayed]   = useState<Product | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [animKey, setAnimKey]       = useState(0);
  const isFirstFetch                = useRef(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`${API_URL}/api/ag-classics/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.success && d.product) {
          setDisplayed(d.product);
          setAnimKey((k) => k + 1);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled && isFirstFetch.current) {
          isFirstFetch.current = false;
          setInitialLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (initialLoading) return <Skeleton />;
  if (!displayed) return null;

  const product      = displayed;
  const author       = product.authors?.[0] ?? null;
  const hasEbook     = product.product_type === "ebook" || product.product_type === "both";
  const displayPrice = hasEbook && product.ebook_sell_price != null
    ? product.ebook_sell_price : product.sell_price;
  const originalPrice = hasEbook && product.ebook_price != null
    ? product.ebook_price : product.price;
  const discountPct  = originalPrice > 0
    ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;

  return (
    <>
      <style>{STYLES}</style>

      <section aria-label={`Featured book: ${product.title}`} className="relative overflow-hidden my-6 sm:my-10">

        <div key={animKey} className="relative z-10 bh-content-switch">

          {/*
           * ── LAYOUT STRATEGY ──────────────────────────────────────────────
           * Mobile  (<640px)  : single column, cover centred at top, then
           *                     title → author → description → price/buttons
           * Tablet  (640-1023): two-col: cover left, rest right
           * Desktop (1024px+) : three-col as original design
           * ─────────────────────────────────────────────────────────────────
           */}

          {/* ─── MOBILE LAYOUT (< sm) ──────────────────────────────────── */}
          <div className="flex flex-col gap-0 sm:hidden px-4 pb-6 pt-6">

            {/* 1. Title */}
            <MegaTitle title={product.title} />

            {/* 2. Author — image + name only, no bio, no link */}
            {author && (
              <div className="flex items-center gap-3 mt-4">
                <div className="bh-author-ring flex-shrink-0">
                  {author.profile_image ? (
                    <img
                      src={`${API_URL}${author.profile_image}`}
                      alt={author.name}
                      className="w-[44px] h-[44px] rounded-full object-cover object-top block"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-[44px] h-[44px] rounded-full bg-[rgba(201,168,76,0.10)] flex items-center justify-center font-['Cinzel'] text-[15px] text-[#c9a84c]">
                      {initials(author.name)}
                    </div>
                  )}
                </div>
                <p className="font-['Cinzel'] text-[12px] tracking-[1.5px] uppercase text-[#c9a84c] m-0">
                  {author.name}
                </p>
              </div>
            )}

            {/* Divider */}

            {/* 3. Book cover centred + format badges */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="bh-cover-float relative">
                <div className="absolute top-[2px] -right-2 -bottom-[6px] left-2 bg-black/55 blur-[12px] z-0" aria-hidden="true" />
                <img
                  src={`${API_URL}${product.main_image}`}
                  alt={product.title}
                  className="block relative z-10 border border-[rgba(201,168,76,0.22)]"
                  style={{
                    width: "clamp(140px, 48vw, 220px)",
                    boxShadow: "-4px 0 0 rgba(0,0,0,0.4), 4px 0 0 rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.7), inset -2px 0 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
              <div className="flex gap-2">
                {(product.product_type === "ebook" || product.product_type === "both") && (
                  <span className="font-['Jost'] text-[9px] tracking-[2.5px] uppercase text-[#c9a84c] border border-[rgba(201,168,76,0.30)] px-[10px] py-1 bg-[rgba(201,168,76,0.06)]">
                    eBook
                  </span>
                )}
                {(product.product_type === "physical" || product.product_type === "both") && (
                  <span className="font-['Jost'] text-[9px] tracking-[2.5px] uppercase text-[rgba(245,240,232,0.45)] border border-[rgba(245,240,232,0.10)] px-[10px] py-1">
                    Paperback
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[rgba(201,168,76,0.10)] mb-5" />

            {/* Description */}
            {product.description && (
              <div className="mb-4">
                <p className="font-['Jost'] text-[9px] tracking-[4px] uppercase text-[rgba(201,168,76,0.45)] mt-0 mb-2">
                  About This Book
                </p>
                <p
                  className="line-clamp-3 font-['Cormorant_Garamond'] text-[15px] leading-[1.80] text-[rgba(255, 255, 255, 0.89)] m-0"
                  dangerouslySetInnerHTML={{
                    __html: product.description.replace(/<[^>]*>/g, "").slice(0, 280) + "…",
                  }}
                />
              </div>
            )}

            {/* Price */}
            <div className="flex flex-col gap-2 mb-4">
              <p className="font-['Jost'] text-[9px] tracking-[4px] uppercase text-[rgba(201,168,76,0.45)] m-0">
                {hasEbook ? "eBook Price" : "Price"}
              </p>
              <div className="inline-flex items-baseline gap-[6px] bg-[rgba(201,168,76,0.10)] border border-[rgba(201,168,76,0.28)] pt-[6px] pb-[7px] px-[14px] self-start">
                <span className="font-['Cinzel'] font-semibold text-[#c9a84c] leading-none text-[24px]">
                  {fmt(displayPrice)}
                </span>
                {discountPct > 0 && (
                  <>
                    <span className="font-['Jost'] text-xs text-[rgba(245,240,232,0.30)] line-through">
                      {fmt(originalPrice)}
                    </span>
                    <span className="font-['Jost'] text-[10px] tracking-[1.5px] text-[#6bbd6b] font-medium">
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Ratings */}
            {product.avg_rating !== null && (
              <div className="flex items-center gap-3 mb-4">
                <Stars rating={product.avg_rating} />
                <p className="font-['Jost'] text-[10px] tracking-[1.5px] text-[rgba(138,111,46,0.65)] m-0 uppercase">
                  {product.avg_rating?.toFixed(1)} · {product.review_count} Reviews
                </p>
              </div>
            )}

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["Instant Access", "Any Device", "Lifetime Access"].map((t) => (
                <span
                  key={t}
                  className="font-['Jost'] text-[8px] tracking-[2px] uppercase text-[rgba(201,168,76,0.50)] border border-[rgba(201,168,76,0.14)] px-[9px] py-1"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-[10px]">
              <button
                className="w-full font-['Jost'] text-[11px] tracking-[2.5px] uppercase font-medium bg-[#c9a84c] text-[#06060a] border-0 cursor-pointer px-7 py-[14px] transition-all duration-200 ease-out active:scale-[0.98]"
                onClick={() => (window.location.href = `/product/${product.slug}`)}
              >
                {hasEbook ? "Buy eBook Now" : "Buy Now"}
              </button>
              <button
                className="w-full font-['Jost'] text-[11px] tracking-[2.5px] uppercase font-light bg-transparent text-[rgba(245,240,232,0.80)] border border-[rgba(201,168,76,0.28)] cursor-pointer px-7 py-[14px] transition-all duration-200 ease-out active:scale-[0.98]"
                onClick={() => (window.location.href = `/product/${product.slug}`)}
              >
                View Full Details
              </button>
            </div>

            <p className="font-['Jost'] text-[9px] tracking-[1.5px] text-[rgba(138,111,46,0.40)] uppercase mt-3 text-center">
              Secure checkout · Razorpay
            </p>
          </div>

          {/* ─── TABLET LAYOUT (sm → lg) ───────────────────────────────── */}
          <div className="hidden sm:flex lg:hidden gap-6 px-6 py-8 items-start">

            {/* Left: Cover + badges + ratings */}
            <div className="flex flex-col items-center gap-4 flex-shrink-0" style={{ width: "clamp(160px, 30vw, 220px)" }}>
              <div className="bh-cover-float relative">
                <div className="absolute top-[2px] -right-2 -bottom-[6px] left-2 bg-black/55 blur-[12px] z-0" aria-hidden="true" />
                <img
                  src={`${API_URL}${product.main_image}`}
                  alt={product.title}
                  className="block relative z-10 border border-[rgba(201,168,76,0.22)] w-full"
                  style={{
                    boxShadow: "-4px 0 0 rgba(0,0,0,0.4), 4px 0 0 rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.7), inset -2px 0 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
              <div className="flex gap-2">
                {(product.product_type === "ebook" || product.product_type === "both") && (
                  <span className="font-['Jost'] text-[8px] tracking-[2px] uppercase text-[#c9a84c] border border-[rgba(201,168,76,0.30)] px-2 py-1 bg-[rgba(201,168,76,0.06)]">
                    eBook
                  </span>
                )}
                {(product.product_type === "physical" || product.product_type === "both") && (
                  <span className="font-['Jost'] text-[8px] tracking-[2px] uppercase text-[rgba(245,240,232,0.45)] border border-[rgba(245,240,232,0.10)] px-2 py-1">
                    Paperback
                  </span>
                )}
              </div>
              {product.avg_rating !== null && (
                <div className="flex flex-col items-center gap-1 border-t border-[rgba(201,168,76,0.10)] pt-3 w-full">
                  <Stars rating={product.avg_rating} />
                  <p className="font-['Jost'] text-[9px] tracking-[1px] text-[rgba(138,111,46,0.65)] m-0 uppercase text-center">
                    {product.avg_rating?.toFixed(1)} · {product.review_count} Reviews
                  </p>
                </div>
              )}
            </div>

            {/* Right: All text content */}
            <div className="flex flex-col gap-5 flex-1 min-w-0">
              <MegaTitle title={product.title} />

              {author && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bh-author-ring">
                      {author.profile_image ? (
                        <img
                          src={`${API_URL}${author.profile_image}`}
                          alt={author.name}
                          className="w-[56px] h-[56px] rounded-full object-cover object-top block"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-[56px] h-[56px] rounded-full bg-[rgba(201,168,76,0.10)] flex items-center justify-center font-['Cinzel'] text-[18px] text-[#c9a84c]">
                          {initials(author.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-['Cinzel'] text-[12px] tracking-[1.5px] uppercase text-[#c9a84c] m-0">{author.name}</p>
                      <p className="font-['Jost'] text-[9px] tracking-[2.5px] uppercase text-[rgba(138,111,46,0.7)] mt-1 mb-0">Author</p>
                    </div>
                  </div>
                  {author.bio && (
                    <p className="line-clamp-2 font-['Cormorant_Garamond'] text-[14px] italic leading-[1.75] text-[rgba(255, 255, 255, 0.9)] m-0">
                      {author.bio}
                    </p>
                  )}
                  <a href={`/author/${author.slug}`} className="font-['Jost'] text-[9px] tracking-[3px] uppercase text-[rgba(201,168,76,0.55)] no-underline flex items-center gap-[6px] hover:text-[#c9a84c]">
                    View Author Page <span className="text-[11px]">→</span>
                  </a>
                </div>
              )}

              {product.description && (
                <div>
                  <p className="font-['Jost'] text-[9px] tracking-[4px] uppercase text-[rgba(201,168,76,0.45)] mt-0 mb-2">About This Book</p>
                  <p
                    className="line-clamp-3 font-['Cormorant_Garamond'] text-[15px] leading-[1.80] text-[rgba(255, 255, 255, 0.89)] m-0"
                    dangerouslySetInnerHTML={{
                      __html: product.description.replace(/<[^>]*>/g, "").slice(0, 280) + "…",
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className="font-['Jost'] text-[9px] tracking-[4px] uppercase text-[rgba(201,168,76,0.45)] m-0">
                  {hasEbook ? "eBook Price" : "Price"}
                </p>
                <div className="inline-flex items-baseline gap-[6px] bg-[rgba(201,168,76,0.10)] border border-[rgba(201,168,76,0.28)] pt-[6px] pb-[7px] px-[14px] self-start">
                  <span className="font-['Cinzel'] font-semibold text-[#c9a84c] leading-none" style={{ fontSize: "clamp(20px, 2.5vw, 28px)" }}>
                    {fmt(displayPrice)}
                  </span>
                  {discountPct > 0 && (
                    <>
                      <span className="font-['Jost'] text-xs text-[rgba(245,240,232,0.30)] line-through">{fmt(originalPrice)}</span>
                      <span className="font-['Jost'] text-[10px] tracking-[1.5px] text-[#6bbd6b] font-medium">{discountPct}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Instant Access", "Any Device", "Lifetime Access"].map((t) => (
                  <span key={t} className="font-['Jost'] text-[8px] tracking-[2px] uppercase text-[rgba(201,168,76,0.50)] border border-[rgba(201,168,76,0.14)] px-[9px] py-1">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  className="font-['Jost'] text-[11px] tracking-[2.5px] uppercase font-medium bg-[#c9a84c] text-[#06060a] border-0 cursor-pointer px-6 py-[13px] transition-all duration-200 hover:bg-[#f5f0e8] hover:-translate-y-px"
                  onClick={() => (window.location.href = `/product/${product.slug}`)}
                >
                  {hasEbook ? "Buy eBook Now" : "Buy Now"}
                </button>
                <button
                  className="font-['Jost'] text-[11px] tracking-[2.5px] uppercase font-light bg-transparent text-[rgba(245,240,232,0.80)] border border-[rgba(201,168,76,0.28)] cursor-pointer px-6 py-[13px] transition-all duration-200 hover:border-[#c9a84c] hover:text-[#c9a84c] hover:-translate-y-px"
                  onClick={() => (window.location.href = `/product/${product.slug}`)}
                >
                  View Full Details
                </button>
              </div>

              <p className="font-['Jost'] text-[9px] tracking-[1.5px] text-[rgba(138,111,46,0.40)] uppercase m-0">
                Secure checkout · Razorpay
              </p>
            </div>
          </div>

          {/* ─── DESKTOP LAYOUT (lg+) ──────────────────────────────────── */}
          <div className="hidden lg:flex gap-0 min-h-[calc(100svh-220px)] items-stretch">

            {/* LEFT — Author */}
            <div className="w-[35%] pl-10 pr-9 py-12 flex flex-col gap-7">
              <div className="flex">
                <div className="bh-vertical-text self-start mb-2" aria-hidden="true" />
                <div className="pt-3 overflow-hidden max-w-[36rem]">
                  <MegaTitle title={product.title} />
                </div>
              </div>

              {author && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="bh-author-ring">
                      {author.profile_image ? (
                        <img
                          src={`${API_URL}${author.profile_image}`}
                          alt={author.name}
                          className="w-[72px] h-[72px] rounded-full object-cover object-top block"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-[72px] h-[72px] rounded-full bg-[rgba(201,168,76,0.10)] flex items-center justify-center font-['Cinzel'] text-[22px] text-[#c9a84c]">
                          {initials(author.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-['Cinzel'] text-[13px] tracking-[1.5px] uppercase text-[#c9a84c] m-0">{author.name}</p>
                      <p className="font-['Jost'] text-[10px] tracking-[2.5px] uppercase text-[rgba(138,111,46,0.7)] mt-1 mb-0">Author</p>
                    </div>
                  </div>
                  {author.bio && (
                    <p className="line-clamp-4 font-['Cormorant_Garamond'] text-[15px] italic leading-[1.75] text-[rgba(255, 255, 255, 0.8)] m-0">
                      {author.bio}
                    </p>
                  )}
                  <a href={`/author/${author.slug}`} className="font-['Jost'] text-[9px] tracking-[3px] uppercase text-[rgba(201,168,76,0.55)] no-underline flex items-center gap-[6px] transition-colors duration-200 hover:text-[#c9a84c]">
                    View Author Page <span className="text-[11px]">→</span>
                  </a>
                </div>
              )}

              {product.avg_rating !== null && (
                <div className="mt-auto border-t border-[rgba(201,168,76,0.10)] pt-6 flex flex-col gap-[6px]">
                  <Stars rating={product.avg_rating} />
                  <p className="font-['Jost'] text-[10px] tracking-[1.5px] text-[rgba(138,111,46,0.65)] m-0 uppercase">
                    {product.avg_rating?.toFixed(1)} · {product.review_count} Reviews
                  </p>
                </div>
              )}
            </div>

            {/* CENTER — Book Cover */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative gap-5">
              <div className="bh-cover-float relative">
                <div className="absolute top-[2px] -right-2 -bottom-[6px] left-2 bg-black/55 blur-[12px] z-0" aria-hidden="true" />
                <img
                  src={`${API_URL}${product.main_image}`}
                  alt={product.title}
                  className="block relative z-10 border border-[rgba(201,168,76,0.22)]"
                  style={{
                    width: "clamp(160px, 22vw, 280px)",
                    boxShadow: "-4px 0 0 rgba(0,0,0,0.4), 4px 0 0 rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.7), inset -2px 0 4px rgba(0,0,0,0.3)",
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 left-0 w-[10%] z-20 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)" }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex gap-2 z-20">
                {(product.product_type === "ebook" || product.product_type === "both") && (
                  <span className="font-['Jost'] text-[9px] tracking-[2.5px] uppercase text-[#c9a84c] border border-[rgba(201,168,76,0.30)] px-[10px] py-1 bg-[rgba(201,168,76,0.06)]">
                    eBook
                  </span>
                )}
                {(product.product_type === "physical" || product.product_type === "both") && (
                  <span className="font-['Jost'] text-[9px] tracking-[2.5px] uppercase text-[rgba(245,240,232,0.45)] border border-[rgba(245,240,232,0.10)] px-[10px] py-1">
                    Paperback
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT — Product Details */}
            <div className="w-[32%] pl-9 pr-10 py-4 flex flex-col gap-3">

              {product.description && (
                <div>
                  <p className="font-['Jost'] text-[9px] tracking-[4px] uppercase text-[rgba(201,168,76,0.45)] mt-0 mb-3">About This Book</p>
                  <p
                    className="line-clamp-4 font-['Cormorant_Garamond'] text-[15px] leading-[1.80] text-[rgba(255, 255, 255, 0.89)] m-0"
                    dangerouslySetInnerHTML={{
                      __html: product.description.replace(/<[^>]*>/g, "").slice(0, 280) + "…",
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <p className="font-['Jost'] text-[9px] tracking-[4px] uppercase text-[rgba(201,168,76,0.45)] m-0">
                  {hasEbook ? "eBook Price" : "Price"}
                </p>
                <div className="inline-flex items-baseline gap-[6px] bg-[rgba(201,168,76,0.10)] border border-[rgba(201,168,76,0.28)] pt-[6px] pb-[7px] px-[14px]">
                  <span className="font-['Cinzel'] font-semibold text-[#c9a84c] leading-none" style={{ fontSize: "clamp(22px, 3vw, 32px)" }}>
                    {fmt(displayPrice)}
                  </span>
                  {discountPct > 0 && (
                    <>
                      <span className="font-['Jost'] text-xs text-[rgba(245,240,232,0.30)] line-through">{fmt(originalPrice)}</span>
                      <span className="font-['Jost'] text-[10px] tracking-[1.5px] text-[#6bbd6b] font-medium">{discountPct}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Instant Access", "Any Device", "Lifetime Access"].map((t) => (
                  <span key={t} className="font-['Jost'] text-[8px] tracking-[2px] uppercase text-[rgba(201,168,76,0.50)] border border-[rgba(201,168,76,0.14)] px-[9px] py-1">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-[10px] mt-auto">
                <button
                  className="font-['Jost'] text-[11px] tracking-[2.5px] uppercase font-medium bg-[#c9a84c] text-[#06060a] border-0 cursor-pointer px-7 py-[14px] transition-all duration-200 ease-out hover:bg-[#f5f0e8] hover:-translate-y-px"
                  onClick={() => (window.location.href = `/product/${product.slug}`)}
                >
                  {hasEbook ? "Buy eBook Now" : "Buy Now"}
                </button>
                <button
                  className="font-['Jost'] text-[11px] tracking-[2.5px] uppercase font-light bg-transparent text-[rgba(245,240,232,0.80)] border border-[rgba(201,168,76,0.28)] cursor-pointer px-7 py-[14px] transition-all duration-200 ease-out hover:border-[#c9a84c] hover:text-[#c9a84c] hover:-translate-y-px"
                  onClick={() => (window.location.href = `/product/${product.slug}`)}
                >
                  View Full Details
                </button>
              </div>

              <p className="font-['Jost'] text-[9px] tracking-[1.5px] text-[rgba(138,111,46,0.40)] uppercase m-0 text-center">
                Secure checkout · Razorpay
              </p>
            </div>
          </div>

          {/* Bottom ornament bar */}
          <div className="flex items-center gap-3 px-4 sm:px-10 py-4" aria-hidden="true">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.20), transparent)" }} />
            <div className="w-[5px] h-[5px] bg-[rgba(201,168,76,0.45)] rotate-45" />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.20))" }} />
          </div>

        </div>
      </section>
    </>
  );
}