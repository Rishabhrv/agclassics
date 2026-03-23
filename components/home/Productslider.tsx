"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Book {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  main_image: string;
  stock: number;
  product_type: "ebook" | "physical" | "both";
  created_at: string;
}

interface ProductSliderProps {
  categorySlug: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  visibleCount?: 3 | 4 | 5 | 6;
  onAddToCart?: (book: Book) => void;
  onWishlist?: (book: Book) => void;
}

function resolvePrice(book: Book): {
  displayPrice:  number;
  originalPrice: number | null;
  discount:      number;
  format:        "ebook" | "paperback";
  label:         string | null;
  soldOut:       boolean;
} {
  const price      = Number(book.price);
  const sellPrice  = Number(book.sell_price);
  const ebookPrice = book.ebook_price      !== null ? Number(book.ebook_price)      : null;
  const ebookSell  = book.ebook_sell_price !== null ? Number(book.ebook_sell_price) : null;

  const disc = (orig: number, sell: number) =>
    orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0;

  if (book.product_type === "ebook") {
    const sell = ebookSell  ?? sellPrice;
    const orig = ebookPrice ?? price;
    return {
      displayPrice:  sell,
      originalPrice: orig > sell ? orig : null,
      discount:      disc(orig, sell),
      format:        "ebook",
      label:         "e-book",
      soldOut:       false,
    };
  }

  if (book.product_type === "physical") {
    return {
      displayPrice:  sellPrice,
      originalPrice: price > sellPrice ? price : null,
      discount:      disc(price, sellPrice),
      format:        "paperback",
      label:         null,
      soldOut:       book.stock === 0,
    };
  }

  if (book.stock > 0) {
    return {
      displayPrice:  sellPrice,
      originalPrice: price > sellPrice ? price : null,
      discount:      disc(price, sellPrice),
      format:        "paperback",
      label:         "Paperback",
      soldOut:       false,
    };
  }

  if (ebookSell !== null) {
    const orig = ebookPrice ?? price;
    return {
      displayPrice:  ebookSell,
      originalPrice: orig > ebookSell ? orig : null,
      discount:      disc(orig, ebookSell),
      format:        "ebook",
      label:         "e-book",
      soldOut:       false,
    };
  }

  return {
    displayPrice:  sellPrice,
    originalPrice: price > sellPrice ? price : null,
    discount:      disc(price, sellPrice),
    format:        "paperback",
    label:         "Paperback",
    soldOut:       true,
  };
}

const GAP      = 2;
const TRACK_PX = 96; // desktop padding (px-12 × 2)

/* ─── Toast notification ─── */
function SliderToast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[200] flex items-center gap-3 px-4 sm:px-5 py-3
        text-[10px] sm:text-[11px] tracking-[2px] uppercase"
      style={{
        transform: "translateX(-50%)",
        background: "#1c1c1e",
        border: "1px solid rgba(201,168,76,0.25)",
        color: "#c9a84c",
        fontFamily: "'Jost', sans-serif",
        animation: "ps-toast-in 0.3s ease both",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        whiteSpace: "nowrap",
      }}
    >
      <style>{`@keyframes ps-toast-in { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }`}</style>
      <div className="w-[6px] h-[6px] rotate-45 bg-[#c9a84c] shrink-0" />
      {msg}
    </div>
  );
}

/** Returns effective visible card count based on viewport width */
function useResponsiveVisibleCount(desktopCount: number) {
  const [count, setCount] = useState(desktopCount);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480)       setCount(2);
      else if (w < 768)  setCount(3);
      else if (w < 1024) setCount(Math.min(desktopCount, 4));
      else               setCount(desktopCount);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [desktopCount]);

  return count;
}

/** Returns the horizontal padding used on the track (mirrors Tailwind responsive px) */
function useTrackPadding() {
  const [pad, setPad] = useState(TRACK_PX);
  useEffect(() => {
    const update = () => setPad(window.innerWidth < 768 ? 48 : TRACK_PX); // px-6 × 2 = 48
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return pad;
}



export default function ProductSlider({
  categorySlug,
  title        = "Collection",
  eyebrow      = "Featured",
  visibleCount = 5,
  onAddToCart,
  onWishlist,
}: ProductSliderProps) {
  const [books, setBooks]           = useState<Book[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const trackRef                              = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft]     = useState(false);
  const [canScrollRight, setCanScrollRight]   = useState(true);
  const [activeIndex, setActiveIndex]         = useState(0);
  const [loadingCart, setLoadingCart]         = useState<number | null>(null);
  const [loadingWishlist, setLoadingWishlist] = useState<number | null>(null);
  const [wishlistedIds, setWishlistedIds]     = useState<Set<number>>(new Set());
  const [toast, setToast]                     = useState<string | null>(null);

  // Responsive values
  const effectiveCount = useResponsiveVisibleCount(visibleCount);
  const trackPad       = useTrackPadding();

  // Mouse drag
  const isDragging    = useRef(false);
  const dragStartX    = useRef(0);
  const scrollStartX  = useRef(0);
  const hasDragged    = useRef(false);

  // Touch drag
  const touchStartX   = useRef(0);
  const touchScrollX  = useRef(0);

  const CARDS_PER_PAGE = effectiveCount;
  const cardWidth      = `calc((100% - ${trackPad}px - ${(effectiveCount - 1) * GAP}px) / ${effectiveCount})`;
  const minWidthMap: Record<number, string> = {
    2: "140px", 3: "160px", 4: "175px", 5: "155px", 6: "130px",
  };
  const minWidth = minWidthMap[effectiveCount] ?? "140px";

  /* ── fetch ── */
  useEffect(() => {
    if (!categorySlug) return;
    let cancelled = false;
    setLoading(true); setFetchError(null); setBooks([]);

    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/ag-classics/products?category=${encodeURIComponent(categorySlug)}&limit=24&sort=newest`
        );
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.success) setBooks(data.products ?? []);
          else throw new Error(data.message || "Unknown error");
        }
      } catch (err: any) {
        if (!cancelled) setFetchError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [categorySlug]);

  /* ── scroll sync ── */
  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    const cardW = el.scrollWidth / Math.max(books.length, 1);
    setActiveIndex(Math.round(el.scrollLeft / cardW));
  }, [books.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    setTimeout(checkScroll, 80);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll, books.length]);

  const scrollByCards = (n: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: (el.scrollWidth / Math.max(books.length, 1)) * n, behavior: "smooth" });
  };
  const scrollToPage = (p: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / Math.max(books.length, 1)) * p * CARDS_PER_PAGE, behavior: "smooth" });
  };

  /* ── Mouse drag ── */
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true; hasDragged.current = false;
    dragStartX.current = e.pageX; scrollStartX.current = trackRef.current?.scrollLeft ?? 0;
    if (trackRef.current) trackRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const d = e.pageX - dragStartX.current;
    if (Math.abs(d) > 4) hasDragged.current = true;
    trackRef.current.scrollLeft = scrollStartX.current - d;
  };
  const stopDrag = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };

  /* ── Touch drag (mobile swipe) ── */
  const onTouchStart = (e: React.TouchEvent) => {
    hasDragged.current  = false;
    touchStartX.current = e.touches[0].pageX;
    touchScrollX.current = trackRef.current?.scrollLeft ?? 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    const d = e.touches[0].pageX - touchStartX.current;
    if (Math.abs(d) > 6) {
      hasDragged.current = true;
      // Prevent vertical scroll only when clearly horizontal
      e.preventDefault();
    }
    trackRef.current.scrollLeft = touchScrollX.current - d;
  };
  const onTouchEnd = () => {
    // nothing extra needed — native momentum scroll takes over
  };

  /* ── cart ── */
  const handleAddToCart = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to add to cart"); return; }
    const { format, soldOut } = resolvePrice(book);
    if (soldOut || loadingCart === book.id) return;
    setLoadingCart(book.id);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: book.id, format, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed");
      window.dispatchEvent(new Event("cart-change"));
      onAddToCart?.(book);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setLoadingCart(null);
    }
  };

  /* ── wishlist ── */
  const handleWishlist = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to save to wishlist"); return; }
    if (loadingWishlist === book.id) return;
    setLoadingWishlist(book.id);
    const already = wishlistedIds.has(book.id);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        method: already ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: book.id }),
      });
      if (!res.ok) throw new Error("Failed");
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        already ? next.delete(book.id) : next.add(book.id);
        return next;
      });
      onWishlist?.(book);
    } catch (err) {
      console.error("Wishlist failed:", err);
    } finally {
      setLoadingWishlist(null);
    }
  };

  const totalPages  = Math.ceil(books.length / CARDS_PER_PAGE);
  const currentPage = Math.floor(activeIndex / CARDS_PER_PAGE);

  /* ─── Type badge (top-right) ─── */
  function TypeBadge({ book }: { book: Book }) {
    const { format, soldOut } = resolvePrice(book);

    if (book.product_type === "both" && book.stock === 0 && !soldOut) {
      return (
        <span
          className="absolute top-3 right-3 z-10 flex items-center gap-[5px] text-[7px] tracking-[1.5px] uppercase font-medium px-[8px] py-[4px]"
          style={{ background: "rgba(201,168,76,0.75)", color: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="4" width="16" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
          </svg>
          E-Book Only
        </span>
      );
    }
    if (book.product_type === "ebook") {
      return (
        <span
          className="absolute top-3 right-3 z-10 flex items-center gap-[5px] text-[7px] tracking-[1.5px] uppercase font-medium px-[8px] py-[4px]"
          style={{ background: "rgba(201,168,76,0.85)", color: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="4" width="16" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
          </svg>
          E-Book
        </span>
      );
    }
    return null;
  }

  /* ─────────── LOADING SKELETON ─────────── */
  if (loading) return (
    <section className="relative w-full">
      <style>{`
        @keyframes ps-shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        .ps-skeleton-shimmer { animation: ps-shimmer 1.8s infinite; background-size: 200% 100%; }
      `}</style>
      <div className="px-4 sm:px-12 pt-12 sm:pt-16 pb-6 sm:pb-8 max-md:px-6">
        <div className="w-20 h-3 mb-3 rounded-sm bg-[rgba(201,168,76,0.15)]" />
        <div className="w-48 h-8 mb-2 rounded-sm bg-[rgba(245,240,232,0.06)]" />
        <div className="w-72 h-3 rounded-sm bg-[rgba(107,107,112,0.2)]" />
      </div>
      <div className="flex gap-0.5 px-4 sm:px-12 overflow-hidden max-md:px-6">
        {[...Array(effectiveCount)].map((_, i) => (
          <div key={i} className="flex-shrink-0 relative overflow-hidden bg-[#1c1c1e]"
            style={{ width: cardWidth, minWidth, height: "300px" }}>
            <div className="ps-skeleton-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.05)] to-transparent"
              style={{ animationDelay: `${i * 0.12}s` }} />
          </div>
        ))}
      </div>
    </section>
  );

  /* ─────────── ERROR ─────────── */
  if (fetchError) return (
    <section className="relative w-full px-4 sm:px-12 py-12 sm:py-16 text-center max-md:px-6">
      <p className="text-sm text-white">
        Could not load <em className="not-italic text-[#c9a84c]">{title}</em> — {fetchError}
      </p>
    </section>
  );

  if (!books.length) return null;

  /* ─────────── MAIN ─────────── */
  return (
    <>
      {toast && <SliderToast msg={toast} onDone={() => setToast(null)} />}
      <style>{`
        @keyframes ps-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (hover: hover) {
          .ps-card:hover .ps-img   { transform:scale(1.03); filter:brightness(0.62) saturate(0.5); }
          .ps-card:hover .ps-overlay {
            background: linear-gradient(
              to top, rgba(10,10,11,1) 0%, rgba(10,10,11,0.78) 55%, rgba(10,10,11,0.22) 100%
            ) !important;
          }
          .ps-card:hover .ps-info    { transform: translateY(0) !important; }
          .ps-card:hover .ps-actions { opacity: 1 !important; transform: translateY(0) !important; }
          .ps-card:hover .ps-title   { color: #c9a84c !important; }
        }
        /* On touch devices always show info & actions */
        @media (hover: none) {
          .ps-info    { transform: translateY(0) !important; }
          .ps-actions { opacity: 1 !important; transform: translateY(0) !important; }
        }
        .ps-track { scrollbar-width:none; -ms-overflow-style:none; }
        .ps-track::-webkit-scrollbar { display:none; }
        @keyframes ps-spin { to { transform: rotate(360deg); } }
        .ps-spinner {
          width:10px; height:10px;
          border:1.5px solid rgba(10,10,11,0.3); border-top-color:#0a0a0b;
          border-radius:50%; animation:ps-spin 0.6s linear infinite;
          display:inline-block; flex-shrink:0;
        }
      `}</style>

      <section className="relative w-full">

        {/* ── Header ── */}
        <div className="flex items-end justify-between px-4 sm:px-12 pt-10 sm:pt-16 pb-5 sm:pb-8 max-md:flex-col max-md:items-start max-md:gap-4 max-md:px-6">
          <div>
            <span className="block mb-2 sm:mb-3 text-[10px] tracking-[5px] uppercase text-[#c9a84c]">{eyebrow}</span>
            <h2 className="font-light italic leading-[1.1] mb-2 text-[#f5f0e8]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px,4vw,50px)" }}>
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="hidden sm:block text-[11px] tracking-[2px] tabular-nums mr-1 text-white">
              {String(activeIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(books.length).padStart(2, "0")}
            </span>
            {(["left", "right"] as const).map((dir) => {
              const active = dir === "left" ? canScrollLeft : canScrollRight;
              return (
                <button key={dir}
                  onClick={() => scrollByCards(dir === "left" ? -CARDS_PER_PAGE : CARDS_PER_PAGE)}
                  disabled={!active} aria-label={dir === "left" ? "Previous" : "Next"}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-300
                    disabled:opacity-100 disabled:cursor-not-allowed
                    ${active
                      ? "bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.35)] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0b]"
                      : "bg-transparent border border-[rgba(255,255,255,0.07)] text-white"}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {dir === "left"
                      ? <polyline points="15 18 9 12 15 6" />
                      : <polyline points="9 18 15 12 9 6" />}
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Viewport ── */}
        <div className="relative overflow-hidden">
          <div className={`absolute left-0 top-0 bottom-0 w-8 sm:w-14 z-10 pointer-events-none
            bg-gradient-to-r from-[#0a0a0b] to-transparent transition-opacity duration-300
            ${canScrollLeft ? "opacity-100" : "opacity-0"}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-8 sm:w-14 z-10 pointer-events-none
            bg-gradient-to-l from-[#0a0a0b] to-transparent transition-opacity duration-300
            ${canScrollRight ? "opacity-100" : "opacity-0"}`} />

          <div ref={trackRef}
            className="ps-track flex gap-0.5 overflow-x-auto px-4 sm:px-12 pb-4 sm:pb-5 select-none cursor-grab max-md:px-6"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {books.map((book) => {
              const { displayPrice, originalPrice, discount, format, label, soldOut } = resolvePrice(book);
              const isWishlisted = wishlistedIds.has(book.id);

              const cartLabel = soldOut
                ? "Sold Out"
                : format === "ebook"
                ? "Add E-Book"
                : "Add to Cart";

              return (
                <div key={book.id}
                  className="ps-card relative overflow-hidden flex-shrink-0 hover:z-10 cursor-pointer
                    transition-[transform,box-shadow] duration-[400ms] ease-in-out bg-[#1c1c1e]"
                  style={{
                    width: cardWidth,
                    minWidth,
                    height: "clamp(220px, 30vw, 360px)",
                    scrollSnapAlign: "start",
                  }}
                  onClick={() => { if (!hasDragged.current) window.location.href = `/product/${book.slug}`; }}
                >
                  {/* ── Left badge ── */}
                  {soldOut ? (
                    <span className="absolute top-2 left-2 z-10 text-[7px] sm:text-[8px] tracking-[2px] uppercase
                      font-medium px-[7px] sm:px-[9px] py-[3px] sm:py-[4px] bg-gray-300 text-gray-700"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      Out of Stock
                    </span>
                  ) : discount > 5 ? (
                    <span className="absolute top-2 left-2 z-10 text-[7px] sm:text-[8px] tracking-[2px] uppercase
                      font-medium px-[7px] sm:px-[9px] py-[3px] sm:py-[4px] bg-[#8b3a3a] text-[#f5f0e8]"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      {discount}% Off
                    </span>
                  ) : null}

                  <TypeBadge book={book} />

                  {/* ── Cover ── */}
                  {book.main_image ? (
                    <img src={`${API_URL}${book.main_image}`} alt={book.title} draggable={false}
                      className="ps-img absolute inset-0 object-cover brightness-[0.83]
                        saturate-[0.75] w-full h-full transition-[transform,filter] duration-[560ms] ease-in-out"
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2a2d] to-[#1c1c1e]">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                  )}

                  {/* ── Overlay + info ── */}
                  <div className="ps-overlay absolute inset-0 flex flex-col justify-end px-3 sm:px-4 pb-3 sm:pb-4
                    transition-[background] duration-[380ms]"
                    style={{ background: "linear-gradient(to top, rgba(10,10,11,0.97) 0%, rgba(10,10,11,0.46) 42%, transparent 68%)" }}>
                    <div className="ps-info transition-transform duration-[380ms] ease-in-out translate-y-[6px]">

                      <h3 className="ps-title font-semibold leading-[1.2] mb-[4px] sm:mb-[5px] transition-colors
                        duration-300 text-[#f5f0e8] line-clamp-2"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(12px,1.1vw,16px)" }}>
                        {book.title}
                      </h3>

                      {/* Price row */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-2 sm:mb-3">
                        <span className="text-[13px] sm:text-[14px] font-medium text-[#c9a84c]"
                          style={{ fontFamily: "'Jost', sans-serif" }}>
                          ₹{displayPrice.toFixed(0)}
                        </span>
                        {originalPrice && (
                          <span className="text-[10px] sm:text-[11px] line-through text-white"
                            style={{ fontFamily: "'Jost', sans-serif" }}>
                            ₹{originalPrice.toFixed(0)}
                          </span>
                        )}
                        {label && (
                          <span className="text-[7px] sm:text-[8px] tracking-[1px] uppercase text-white"
                            style={{ fontFamily: "'Jost', sans-serif" }}>
                            {label}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="ps-actions flex gap-[4px] sm:gap-[5px] opacity-0 translate-y-2
                        transition-[opacity,transform] duration-[360ms] ease-in-out">

                        <button
                          disabled={soldOut || loadingCart === book.id}
                          onClick={(e) => handleAddToCart(e, book)}
                          className={`flex-1 text-[8px] sm:text-[9px] tracking-[2px] uppercase font-medium
                            py-2 px-1 sm:px-2 border-none flex items-center justify-center gap-1
                            transition-colors duration-300
                            ${soldOut
                              ? "bg-[#2a2a2d] text-white cursor-not-allowed"
                              : loadingCart === book.id
                              ? "bg-[#c9a84c] text-[#0a0a0b] opacity-80 cursor-not-allowed"
                              : "bg-[#c9a84c] text-[#0a0a0b] hover:bg-[#f5f0e8] cursor-pointer"}`}
                          style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                          {loadingCart === book.id ? (
                            <span className="ps-spinner" />
                          ) : (
                            cartLabel
                          )}
                        </button>

                        <button
                          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                          onClick={(e) => handleWishlist(e, book)}
                          className={`w-8 h-8 flex-shrink-0 flex items-center justify-center
                            transition-all duration-300
                            ${isWishlisted
                              ? "text-[#c9a84c] bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.4)]"
                              : "text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] hover:text-[#c9a84c] hover:border-[rgba(201,168,76,0.4)]"}
                            ${loadingWishlist === book.id ? "cursor-wait opacity-60" : "cursor-pointer"}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24"
                            fill={isWishlisted ? "currentColor" : "none"}
                            stroke="currentColor" strokeWidth="1.5">
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
        </div>

        {/* ── Dot Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1 pb-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => scrollToPage(i)} aria-label={`Page ${i + 1}`}
                className="transition-all duration-300 border-none p-0 cursor-pointer"
                style={{
                  width: i === currentPage ? "22px" : "6px", height: "6px",
                  borderRadius: 0,
                  background: i === currentPage ? "#c9a84c" : "rgba(201,168,76,0.22)",
                }} />
            ))}
          </div>
        )}

        {/* ── Ornament ── */}
        <div className="flex items-center gap-3 px-4 sm:px-12 pt-3 pb-2 max-md:px-6">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.5)] to-transparent" />
          <div className="w-[6px] h-[6px] rotate-45 flex-shrink-0 bg-[rgba(201,168,76,0.8)]" />
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.5)] to-transparent" />
        </div>
      </section>
    </>
  );
}