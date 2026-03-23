"use client";

import { useEffect, useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Ebook {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  main_image: string;
  stock: number;
  created_at: string;
  authors?: { id: number; name: string; slug: string }[];
  avg_rating?: number | null;
  review_count?: number;
}

const ebookStyles = `
  @keyframes ebookFadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scanLine {
    from { top: 0%; }
    to   { top: 100%; }
  }
  @keyframes digitalFlicker {
    0%, 95%, 100% { opacity: 1; }
    96%           { opacity: 0.7; }
    97%           { opacity: 1; }
    98%           { opacity: 0.6; }
  }
  @keyframes heartPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.35); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  @keyframes cartBounce {
    0%   { transform: translateY(0); }
    40%  { transform: translateY(-4px); }
    70%  { transform: translateY(1px); }
    100% { transform: translateY(0); }
  }

  .ebook-reveal   { animation: ebookFadeUp 0.8s ease both; }
  .ebook-reveal-1 { animation: ebookFadeUp 0.8s ease 0.15s both; }
  .ebook-reveal-2 { animation: ebookFadeUp 0.8s ease 0.30s both; }
  .ebook-reveal-3 { animation: ebookFadeUp 0.8s ease 0.45s both; }

  .ebook-cover-wrap { position: relative; overflow: hidden; }
  .ebook-cover-wrap::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
    z-index: 2; pointer-events: none;
  }
  @media (hover: hover) {
    .ebook-card:hover .ebook-cover-wrap::before { transform: translateX(100%); }
  }

  .device-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px;
    border: 1px solid rgba(201,168,76,0.2);
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: #8a6f2e; background: rgba(201,168,76,0.04); white-space: nowrap;
  }

  .eb-cta { position: relative; overflow: hidden; }
  .eb-cta::after {
    content: ''; position: absolute; top: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  }
  .eb-cta:hover::after { animation: shimmerSweep 0.55s ease; }

  .ebook-screen-line {
    height: 1px; background: rgba(201,168,76,0.12);
    animation: digitalFlicker 4s ease infinite;
  }

  .heart-pop   { animation: heartPop   0.4s ease; }
  .cart-bounce { animation: cartBounce 0.35s ease; }

  /* Stats responsive */
  @media (max-width: 480px) {
    .ebook-stats { gap: 16px !important; }
    .ebook-stat-num { font-size: 20px !important; }
  }
`;

/* ─── helpers ─── */
function getEbookPrices(book: Ebook): { displayPrice: number; originalPrice: number | null } {
  if (book.ebook_sell_price !== null) {
    return {
      displayPrice:  book.ebook_sell_price,
      originalPrice: (book.ebook_price && book.ebook_price > book.ebook_sell_price)
        ? book.ebook_price
        : null,
    };
  }
  return {
    displayPrice:  book.sell_price,
    originalPrice: book.price > book.sell_price ? book.price : null,
  };
}

function calcDiscount(original: number | null, sell: number): number {
  if (!original || original <= sell) return 0;
  return Math.round(((original - sell) / original) * 100);
}

/* ─── Star rating ─── */
function StarRating({ rating }: { rating: number | null }) {
  const r = Math.round((rating ?? 0) * 2) / 2;
  return (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
          fill={s <= r ? "#c9a84c" : "none"}
          stroke={s <= r ? "#c9a84c" : "#3a3a3c"} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const DeviceIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18.01" />
  </svg>
);

/* ─── Toast ─── */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 text-[10px] sm:text-[11px] tracking-[2px] uppercase mx-4"
      style={{
        transform: "translateX(-50%)",
        background: "#1c1c1e",
        border: "1px solid rgba(201,168,76,0.25)",
        color: "#c9a84c",
        fontFamily: "'Jost', sans-serif",
        animation: "ebookFadeUp 0.35s ease both",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        whiteSpace: "nowrap",
      }}
    >
      <div className="w-[6px] h-[6px] rotate-45 bg-[#c9a84c] shrink-0" />
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function EbookSection() {
  const [ebooks, setEbooks]   = useState<Ebook[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const sectionRef            = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const [cartLoading, setCartLoading] = useState<Record<number, boolean>>({});
  const [wishLoading, setWishLoading] = useState<Record<number, boolean>>({});
  const [wishlisted, setWishlisted]   = useState<Record<number, boolean>>({});
  const [cartAnim, setCartAnim]       = useState<Record<number, boolean>>({});
  const [heartAnim, setHeartAnim]     = useState<Record<number, boolean>>({});
  const [toast, setToast]             = useState<string | null>(null);

  /* Intersection observer */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  /* Fetch ebooks */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/ag-classics?format=ebook&limit=8`);
        if (!res.ok) throw new Error("Failed to fetch e-books");
        const data = await res.json();
        if (data.success) {
          setEbooks(data.products);
          setTotal(data.total ?? data.products.length);
        } else throw new Error(data.message || "Unknown error");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Pre-load wishlist ids */
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(`${API_URL}/api/ag-classics/wishlist/ids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const map: Record<number, boolean> = {};
          (d.ids as number[]).forEach((id) => { map[id] = true; });
          setWishlisted(map);
        }
      })
      .catch(() => {});
  }, []);

  const totalReviews = ebooks.reduce((acc, b) => acc + (b.review_count ?? 0), 0);

  /* ─── Add to cart ─── */
  const handleCart = async (e: React.MouseEvent, book: Ebook) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to add to cart"); return; }

    setCartLoading((p) => ({ ...p, [book.id]: true }));
    setCartAnim((p) => ({ ...p, [book.id]: true }));
    setTimeout(() => setCartAnim((p) => ({ ...p, [book.id]: false })), 400);

    try {
      const res = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: book.id, format: "ebook", quantity: 1 }),
      });
      const data = await res.json();
      setToast(data.success ? "Added to cart ✓" : (data.message || "Failed to add"));
      window.dispatchEvent(new Event("cart-change"));
    } catch {
      setToast("Something went wrong");
    } finally {
      setCartLoading((p) => ({ ...p, [book.id]: false }));
    }
  };

  /* ─── Toggle wishlist ─── */
  const handleWishlist = async (e: React.MouseEvent, book: Ebook) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to save to wishlist"); return; }

    const already = !!wishlisted[book.id];
    setWishLoading((p) => ({ ...p, [book.id]: true }));
    setHeartAnim((p) => ({ ...p, [book.id]: true }));
    setTimeout(() => setHeartAnim((p) => ({ ...p, [book.id]: false })), 450);

    try {
      const res = await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        method: already ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: book.id }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlisted((p) => ({ ...p, [book.id]: !already }));
        setToast(already ? "Removed from wishlist" : "Saved to wishlist ✓");
      } else setToast(data.message || "Failed");
    } catch {
      setToast("Something went wrong");
    } finally {
      setWishLoading((p) => ({ ...p, [book.id]: false }));
    }
  };

  if (!loading && (error || ebooks.length === 0)) return null;

  return (
    <>
      <style>{ebookStyles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <section
        ref={sectionRef}
        className="relative overflow-hidden mt-12 sm:mt-16 mb-4"
        style={{ background: "linear-gradient(180deg, #111113 0%, #1a1a1c 100%)" }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)",
          }}
        />

        {/* ═══ HEADER ═══ */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8 px-4 sm:px-12 pt-12 sm:pt-20 pb-8 sm:pb-12 max-md:px-6 max-md:pt-14 max-md:pb-8">
          <div>
            {/* Eyebrow */}
            <div className={`flex items-center gap-3 mb-4 ${visible ? "ebook-reveal" : "opacity-0"}`}>
              <div
                className="flex items-center justify-center w-8 h-8 border border-[rgba(201,168,76,0.25)]"
                style={{ background: "rgba(201,168,76,0.06)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                  <rect x="4" y="4" width="16" height="12" rx="2" />
                  <path d="M8 20h8M12 16v4" />
                </svg>
              </div>
              <span className="text-[10px] tracking-[5px] uppercase text-[#c9a84c]"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                Digital Library
              </span>
            </div>

            <h2
              className={`font-light leading-[1.05] text-[#f5f0e8] ${visible ? "ebook-reveal-1" : "opacity-0"}`}
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 58px)" }}
            >
              Read Anywhere.{" "}
              <em className="italic text-[#c9a84c]">Instantly.</em>
            </h2>

            <p
              className={`mt-3 max-w-[460px] text-sm leading-[1.8] text-white ${visible ? "ebook-reveal-2" : "opacity-0"}`}
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Timeless literature delivered to your screen the moment you purchase.
              Beautifully formatted for every device — phone, tablet, e-reader, desktop.
            </p>

            <div className={`flex flex-wrap gap-2 mt-4 sm:mt-5 ${visible ? "ebook-reveal-3" : "opacity-0"}`}>
              {["Desktop", "Tablet", "Mobile"].map((d) => (
                <span key={d} className="device-pill" style={{ fontFamily: "'Jost', sans-serif" }}>
                  <DeviceIcon /> {d}
                </span>
              ))}
            </div>
          </div>

          {/* Right: stats + CTA */}
          <div className={`flex flex-col items-start md:items-end gap-5 shrink-0 ${visible ? "ebook-reveal-2" : "opacity-0"}`}>
            <div className="flex gap-5 sm:gap-8 ebook-stats">
              {[
                {
                  num:   loading ? "—" : `${total}+`,
                  label: "E-Book Titles",
                },
                {
                  num:   loading ? "—" : totalReviews > 0 ? `${totalReviews.toLocaleString()}+` : "Many",
                  label: "Happy Readers",
                },
                {
                  num:   "Instant",
                  label: "Read on Any Device",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className="ebook-stat-num text-xl sm:text-2xl font-light text-[#c9a84c] leading-none"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {s.num}
                  </div>
                  <div className="text-[8px] sm:text-[9px] tracking-[2px] uppercase text-white mt-1"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="eb-cta w-full md:w-auto text-center text-[10px] tracking-[3px] uppercase font-medium px-8 py-[13px]
                bg-transparent border border-[rgba(201,168,76,0.35)] text-[#c9a84c] cursor-pointer
                transition-all duration-300 hover:bg-[#c9a84c] hover:text-[#0a0a0b] hover:border-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif" }}
              onClick={() => { window.location.href = "/ebooks"; }}
            >
              Browse All E-Books →
            </button>
          </div>
        </div>

        {/* Ornament */}
        <div className="flex items-center px-4 sm:px-12 mb-6 sm:mb-10 max-md:px-6">
          <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
          <div className="w-[5px] h-[5px] rotate-45 bg-[#8a6f2e] mx-3 shrink-0" />
          <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
        </div>

        {/* ═══ GRID ═══ */}
        <div className="relative z-10 px-4 sm:px-12 pb-12 sm:pb-20 max-md:px-6 max-md:pb-14">

          {loading ? (
            /* Loading skeleton — single column on mobile */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(201,168,76,0.06)]">
                  <div className="w-[70px] sm:w-[80px] h-[100px] sm:h-[110px] shrink-0 bg-[#222224] animate-pulse rounded-sm" />
                  <div className="flex-1 flex flex-col gap-2 pt-1">
                    <div className="h-3 bg-[#222224] animate-pulse rounded w-4/5" />
                    <div className="h-2 bg-[#1a1a1c] animate-pulse rounded w-3/5" />
                    <div className="h-2 bg-[#1a1a1c] animate-pulse rounded w-2/5 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Main grid — 1 col on mobile, 2 on sm, 3 on md */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ebooks.map((book) => {
                const { displayPrice, originalPrice } = getEbookPrices(book);
                const disc   = calcDiscount(originalPrice, displayPrice);
                const inWish = !!wishlisted[book.id];

                return (
                  <div
                    key={book.id}
                    className="ebook-card relative flex flex-col bg-[#161618] border border-[rgba(201,168,76,0.08)] cursor-pointer overflow-hidden active:opacity-90 transition-opacity"
                    onClick={() => (window.location.href = `/product/${book.slug}`)}
                  >
                    {/* Cover + info row */}
                    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">

                      {/* Cover — slightly smaller on mobile */}
                      <div className="ebook-cover-wrap shrink-0 bg-[#1c1c1e] relative"
                        style={{ width: "clamp(70px,22vw,120px)", height: "clamp(100px,32vw,180px)" }}>
                        {book.main_image ? (
                          <img
                            src={`${API_URL}${book.main_image}`}
                            alt={book.title}
                            className="w-full h-full object-cover block"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
                              <rect x="4" y="4" width="16" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
                            </svg>
                          </div>
                        )}
                        <div
                          className="absolute bottom-0 left-0 right-0 py-[3px] text-center text-[7px] tracking-[1.5px] uppercase font-medium"
                          style={{ fontFamily: "'Jost', sans-serif", background: "rgba(201,168,76,0.85)", color: "#0a0a0b" }}
                        >
                          E-Book
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col min-w-0 pt-[2px]">
                        {/* Discount badge */}
                        {disc > 5 && (
                          <div className="flex gap-[6px] mb-[5px]">
                            <span className="text-[7px] tracking-[1.5px] uppercase px-[7px] py-[3px] bg-[rgba(139,58,58,0.18)] text-[#d47070]"
                              style={{ fontFamily: "'Jost', sans-serif" }}>{disc}% Off</span>
                          </div>
                        )}

                        <h3 className="text-[13px] sm:text-[15px] font-semibold leading-[1.25] text-[#f0ece4] line-clamp-2 mb-[4px] sm:mb-[5px]"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {book.title}
                        </h3>

                        {book.authors && book.authors.length > 0 && (
                          <p className="text-[9px] sm:text-[10px] text-white mb-[6px] sm:mb-[8px] truncate"
                            style={{ fontFamily: "'Jost', sans-serif" }}>
                            {book.authors.map((a) => a.name).join(", ")}
                          </p>
                        )}

                        {book.avg_rating && (
                          <div className="flex items-center gap-[6px] mb-[6px] sm:mb-[8px]">
                            <StarRating rating={book.avg_rating} />
                            <span className="text-[9px] text-white" style={{ fontFamily: "'Jost', sans-serif" }}>
                              ({book.review_count})
                            </span>
                          </div>
                        )}

                        {/* Price block */}
                        <div className="flex items-baseline gap-[6px] sm:gap-[8px] mt-auto flex-wrap">
                          <span className="text-[13px] sm:text-[15px] font-medium text-[#c9a84c]"
                            style={{ fontFamily: "'Jost', sans-serif" }}>
                            ₹{displayPrice.toFixed(0)}
                          </span>
                          {originalPrice && (
                            <span className="text-[10px] sm:text-[11px] line-through text-[#4a4a4f]"
                              style={{ fontFamily: "'Jost', sans-serif" }}>
                              ₹{originalPrice.toFixed(0)}
                            </span>
                          )}
                          <span className="text-[7px] sm:text-[8px] tracking-[1px] uppercase text-white"
                            style={{ fontFamily: "'Jost', sans-serif" }}>
                            e-book
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex mt-2">
                          {/* Add to Cart */}
                          <button
                            disabled={cartLoading[book.id]}
                            className={[
                              "flex-1 flex items-center justify-center gap-[5px] py-[10px] sm:py-3",
                              "text-[8px] sm:text-[9px] tracking-[2px] uppercase border-none bg-[rgba(201,168,76,0.06)] cursor-pointer",
                              "transition-colors duration-200",
                              cartLoading[book.id]
                                ? "text-white"
                                : "text-[#8a6f2e] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,0.1)]",
                            ].join(" ")}
                            style={{ fontFamily: "'Jost', sans-serif" }}
                            onClick={(e) => handleCart(e, book)}
                          >
                            <svg
                              width="10" height="10" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="1.5"
                              className={cartAnim[book.id] ? "cart-bounce" : ""}
                            >
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {cartLoading[book.id] ? "Adding…" : "Add to Cart"}
                          </button>

                          <div className="w-px bg-[rgba(201,168,76,0.08)]" />

                          {/* Wishlist */}
                          <button
                            disabled={wishLoading[book.id]}
                            className={[
                              "flex items-center justify-center px-3 sm:px-4 py-[10px] sm:py-3",
                              "border-none bg-transparent cursor-pointer transition-colors duration-200",
                              wishLoading[book.id]
                                ? "text-white"
                                : inWish
                                ? "text-[#c9a84c] hover:bg-[rgba(201,168,76,0.06)]"
                                : "text-[#8a6f2e] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,0.06)]",
                            ].join(" ")}
                            aria-label={inWish ? "Remove from wishlist" : "Add to wishlist"}
                            onClick={(e) => handleWishlist(e, book)}
                          >
                            <svg
                              width="13" height="13" viewBox="0 0 24 24"
                              fill={inWish ? "currentColor" : "none"}
                              stroke="currentColor" strokeWidth="1.5"
                              className={heartAnim[book.id] ? "heart-pop" : ""}
                            >
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

          {/* Bottom CTA banner */}
          {!loading && ebooks.length > 0 && (
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mt-8 sm:mt-10 px-5 sm:px-8 py-5 sm:py-6
                border border-[rgba(201,168,76,0.12)]"
              style={{ background: "rgba(201,168,76,0.03)" }}
            >
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col gap-[3px] w-9 shrink-0">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="ebook-screen-line" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[14px] sm:text-[15px] font-light italic text-[#f5f0e8] leading-snug"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Discover our complete digital library
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-white mt-[3px]" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {total}+ titles · Instant download · All formats included
                  </p>
                </div>
              </div>

              <button
                className="eb-cta w-full sm:w-auto shrink-0 text-[10px] tracking-[3px] uppercase font-medium px-7 sm:px-9 py-[13px]
                  bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer
                  transition-colors duration-300 hover:bg-[#f5f0e8]"
                style={{ fontFamily: "'Jost', sans-serif" }}
                onClick={() => { window.location.href = "/ebooks"; }}
              >
                View All E-Books
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}