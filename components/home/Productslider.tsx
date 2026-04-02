"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import BookCard from "../book/BookCard";

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
    return { displayPrice: sell, originalPrice: orig > sell ? orig : null, discount: disc(orig, sell), format: "ebook", label: "e-book", soldOut: false };
  }
  if (book.product_type === "physical") {
    return { displayPrice: sellPrice, originalPrice: price > sellPrice ? price : null, discount: disc(price, sellPrice), format: "paperback", label: null, soldOut: book.stock === 0 };
  }
  if (book.stock > 0) {
    return { displayPrice: sellPrice, originalPrice: price > sellPrice ? price : null, discount: disc(price, sellPrice), format: "paperback", label: "Paperback", soldOut: false };
  }
  if (ebookSell !== null) {
    const orig = ebookPrice ?? price;
    return { displayPrice: ebookSell, originalPrice: orig > ebookSell ? orig : null, discount: disc(orig, ebookSell), format: "ebook", label: "e-book", soldOut: false };
  }
  return { displayPrice: sellPrice, originalPrice: price > sellPrice ? price : null, discount: disc(price, sellPrice), format: "paperback", label: "Paperback", soldOut: true };
}

// Gap between cards in px (gap-0.5 = 2px)
const GAP = 2;

/* ─── Toast ─────────────────────────────────────────── */
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

/* ─── Responsive visible card count ─────────────────── */
function useResponsiveVisibleCount(desktopCount: number) {
  const [count, setCount] = useState(desktopCount);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if      (w < 400)  setCount(2);
      else if (w < 640)  setCount(2);
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

/* ─── Track padding (mirrors Tailwind px classes) ───── */
function useTrackPadding() {
  const [pad, setPad] = useState(96); // px-12 × 2
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if      (w < 640)  setPad(24); // px-3 × 2
      else if (w < 1024) setPad(48); // px-6 × 2
      else               setPad(96); // px-12 × 2
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return pad;
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
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
  const [toast, setToast]                     = useState<string | null>(null);

  const effectiveCount = useResponsiveVisibleCount(visibleCount);
  const trackPad       = useTrackPadding();

  // Mouse drag
  const isDragging   = useRef(false);
  const dragStartX   = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged   = useRef(false);

  // Touch drag
  const touchStartX  = useRef(0);
  const touchScrollX = useRef(0);

  const CARDS_PER_PAGE = effectiveCount;

  // Card width: fills container minus padding and gaps
  const cardWidth = `calc((100% - ${trackPad}px - ${(effectiveCount - 1) * GAP}px) / ${effectiveCount})`;
  const minWidthMap: Record<number, string> = {
    2: "130px", 3: "150px", 4: "160px", 5: "145px", 6: "120px",
  };
  const minWidth = minWidthMap[effectiveCount] ?? "130px";

  /* ── Fetch ── */
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

  /* ── Scroll sync ── */
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

  /* ── Touch drag ── */
  const onTouchStart = (e: React.TouchEvent) => {
    hasDragged.current   = false;
    touchStartX.current  = e.touches[0].pageX;
    touchScrollX.current = trackRef.current?.scrollLeft ?? 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    const d = e.touches[0].pageX - touchStartX.current;
    if (Math.abs(d) > 6) {
      hasDragged.current = true;
      e.preventDefault();
    }
    trackRef.current.scrollLeft = touchScrollX.current - d;
  };
  const onTouchEnd = () => {};

  const totalPages  = Math.ceil(books.length / CARDS_PER_PAGE);
  const currentPage = Math.floor(activeIndex / CARDS_PER_PAGE);

  /* ── Loading skeleton ── */
  if (loading) return (
    <section className="relative w-full">
      <style>{`
        @keyframes ps-shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        .ps-skeleton-shimmer { animation: ps-shimmer 1.8s infinite; background-size: 200% 100%; }
      `}</style>
      <div className="px-3 sm:px-6 lg:px-12 pt-10 sm:pt-14 lg:pt-16 pb-4 sm:pb-6">
        <div className="w-16 sm:w-20 h-2.5 sm:h-3 mb-2 sm:mb-3 rounded-sm bg-[rgba(201,168,76,0.15)]" />
        <div className="w-36 sm:w-48 h-6 sm:h-8 mb-1.5 sm:mb-2 rounded-sm bg-[rgba(245,240,232,0.06)]" />
        <div className="w-48 sm:w-72 h-2.5 sm:h-3 rounded-sm bg-[rgba(107,107,112,0.2)]" />
      </div>
      <div className="flex gap-0.5 px-3 sm:px-6 lg:px-12 overflow-hidden">
        {[...Array(effectiveCount)].map((_, i) => (
          <div key={i} className="flex-shrink-0 relative overflow-hidden bg-[#1c1c1e]"
            style={{ width: cardWidth, minWidth, height: "260px" }}>
            <div className="ps-skeleton-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.05)] to-transparent"
              style={{ animationDelay: `${i * 0.12}s` }} />
          </div>
        ))}
      </div>
    </section>
  );

  /* ── Error ── */
  if (fetchError) return (
    <section className="relative w-full px-3 sm:px-6 lg:px-12 py-10 sm:py-16 text-center">
      <p className="text-sm text-white">
        Could not load <em className="not-italic text-[#c9a84c]">{title}</em> — {fetchError}
      </p>
    </section>
  );

  if (!books.length) return null;

  /* ── Main render ── */
  return (
    <>
      {toast && <SliderToast msg={toast} onDone={() => setToast(null)} />}
      <style>{`
        @keyframes ps-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
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
        <div className="flex items-end justify-between
          px-3 sm:px-6 lg:px-12
          pt-8 sm:pt-12 lg:pt-16
          pb-4 sm:pb-6 lg:pb-8
          gap-3 sm:gap-0
          flex-wrap sm:flex-nowrap">

          {/* Left: eyebrow + title */}
          <div className="min-w-0">
            <span
              className="block mb-1.5 sm:mb-2 text-[9px] sm:text-[10px] tracking-[4px] sm:tracking-[5px] uppercase text-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {eyebrow}
            </span>
            <h2
              className="font-light italic leading-[1.1] mb-0 text-[#f5f0e8] truncate max-w-[70vw] sm:max-w-none"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(20px, 5vw, 50px)",
              }}
            >
              {title}
            </h2>
          </div>

          {/* Right: counter + nav arrows */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="hidden sm:block text-[11px] tracking-[2px] tabular-nums mr-1 text-white"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {String(activeIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(books.length).padStart(2, "0")}
            </span>
            {(["left", "right"] as const).map((dir) => {
              const active = dir === "left" ? canScrollLeft : canScrollRight;
              return (
                <button
                  key={dir}
                  onClick={() => scrollByCards(dir === "left" ? -CARDS_PER_PAGE : CARDS_PER_PAGE)}
                  disabled={!active}
                  aria-label={dir === "left" ? "Previous" : "Next"}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center
                    transition-all duration-300 disabled:opacity-100 disabled:cursor-not-allowed
                    ${active
                      ? "bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.35)] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0b]"
                      : "bg-transparent border border-[rgba(255,255,255,0.07)] text-white"
                    }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    {dir === "left"
                      ? <polyline points="15 18 9 12 15 6" />
                      : <polyline points="9 18 15 12 9 6" />}
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Scroll viewport ── */}
        <div className="relative overflow-hidden">
          {/* Edge fade — left */}
          <div className={`absolute left-0 top-0 bottom-0 w-6 sm:w-10 lg:w-14 z-10 pointer-events-none
            bg-gradient-to-r from-[#0a0a0b] to-transparent transition-opacity duration-300
            ${canScrollLeft ? "opacity-100" : "opacity-0"}`} />
          {/* Edge fade — right */}
          <div className={`absolute right-0 top-0 bottom-0 w-6 sm:w-10 lg:w-14 z-10 pointer-events-none
            bg-gradient-to-l from-[#0a0a0b] to-transparent transition-opacity duration-300
            ${canScrollRight ? "opacity-100" : "opacity-0"}`} />

          <div
            ref={trackRef}
            className="ps-track flex gap-0.5 overflow-x-auto select-none cursor-grab
              px-3 sm:px-6 lg:px-12
              pb-3 sm:pb-4 lg:pb-5"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {books.map((book) => (
              <div
                key={book.id}
                className="flex-shrink-0"
                style={{ width: cardWidth, minWidth, scrollSnapAlign: "start" }}
              >
                <BookCard
                  visibleCount={1}
                  book={{
                    id:               book.id,
                    title:            book.title,
                    slug:             book.slug,
                    image:            book.main_image.startsWith("http")
                                        ? book.main_image
                                        : `${API_URL}${book.main_image}`,
                    product_type:     book.product_type,
                    stock:            book.stock,
                    price:            book.price,
                    sell_price:       book.sell_price,
                    ebook_price:      book.ebook_price ?? undefined,
                    ebook_sell_price: book.ebook_sell_price ?? undefined,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Dot pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1 pb-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                aria-label={`Page ${i + 1}`}
                className="transition-all duration-300 border-none p-0 cursor-pointer"
                style={{
                  width: i === currentPage ? "18px" : "5px",
                  height: "5px",
                  borderRadius: 0,
                  background: i === currentPage ? "#c9a84c" : "rgba(201,168,76,0.22)",
                }}
              />
            ))}
          </div>
        )}

        {/* ── Bottom ornament ── */}
        <div className="flex items-center gap-3 px-3 sm:px-6 lg:px-12 pt-2 pb-2">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.5)] to-transparent" />
          <div className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rotate-45 flex-shrink-0 bg-[rgba(201,168,76,0.8)]" />
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.5)] to-transparent" />
        </div>

      </section>
    </>
  );
}