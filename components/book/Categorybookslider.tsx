"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ─── Types ─────────────────────────────────────────────────────── */
export interface SliderBook {
  id: number;
  title: string;
  slug: string;
  main_image?: string | null;
  price: number;
  sell_price: number;
  ebook_price?: number | null;
  ebook_sell_price?: number | null;
  author_name?: string | null;
  avg_rating?: number | null;
  review_count?: number;
  created_at?: string;
  stock?: number;
}

export interface CategoryBookSliderProps {
  books: SliderBook[];
  eyebrow?: string;
  title: string;
  description?: string;
  apiUrl?: string;
  hrefPrefix?: string;
  /** cart endpoint path — default: /api/ag-classics/cart */
  cartEndpoint?: string;
  /** wishlist endpoint path — default: /api/ag-classics/wishlist */
  wishlistEndpoint?: string;
  /** format to send with cart request — "paperback" | "ebook" */
  cartFormat?: "paperback" | "ebook";
  onAddToCart?: (book: SliderBook) => void;
  onWishlist?: (book: SliderBook) => void;
  viewAllHref?: string;
  showTopDivider?: boolean;
}

/* ─── Toast type ─────────────────────────────────────────────────── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

/* ─── Helpers ────────────────────────────────────────────────────── */
const effectivePrice = (b: SliderBook) =>
  b.ebook_sell_price ?? b.sell_price ?? b.price;

const originalPrice = (b: SliderBook) =>
  b.ebook_price ?? b.price;

const discountPct = (b: SliderBook) => {
  const orig = originalPrice(b);
  const eff  = effectivePrice(b);
  if (!orig || orig <= eff) return 0;
  return Math.round(((orig - eff) / orig) * 100);
};

const isNewBook = (created_at?: string) =>
  created_at ? new Date(created_at) > new Date(Date.now() - 30 * 86400000) : false;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

/* ─── Stars ──────────────────────────────────────────────────────── */
const Stars = ({ rating }: { rating: number }) => (
  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="9" height="9" viewBox="0 0 24 24"
        fill={s <= Math.round(rating) ? "#c9a84c" : "none"}
        stroke="#c9a84c" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

/* ─── Toast component ────────────────────────────────────────────── */
const ToastList = ({ toasts }: { toasts: Toast[] }) => (
  <div style={{
    position: "fixed", bottom: 24, right: 24,
    zIndex: 9999, display: "flex", flexDirection: "column", gap: 8,
    pointerEvents: "none",
  }}>
    {toasts.map((t) => (
      <div key={t.id} style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase",
        padding: "11px 18px",
        background: t.type === "success" ? "rgba(201,168,76,.15)"
          : t.type === "error"   ? "rgba(139,58,58,.18)"
          : "rgba(28,28,30,.95)",
        border: `1px solid ${
          t.type === "success" ? "rgba(201,168,76,.35)"
          : t.type === "error" ? "rgba(139,58,58,.4)"
          : "rgba(255,255,255,.1)"
        }`,
        color: t.type === "success" ? "#c9a84c"
          : t.type === "error"   ? "#d4756a"
          : "#e8e0d0",
        backdropFilter: "blur(8px)",
        animation: "cbs-toast-in .3s ease both",
        maxWidth: 280,
      }}>
        {t.message}
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function CategoryBookSlider({
  books,
  eyebrow,
  title,
  description,
  apiUrl = "",
  hrefPrefix = "/product",
  cartEndpoint = "/api/ag-classics/cart",
  wishlistEndpoint = "/api/ag-classics/wishlist",
  cartFormat = "paperback",
  onAddToCart,
  onWishlist,
  viewAllHref,
  showTopDivider = false,
}: CategoryBookSliderProps) {
  /* ── slider state ── */
  const sliderRef               = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev]   = useState(false);
  const [canNext, setCanNext]   = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart               = useRef({ x: 0, scrollLeft: 0 });
  const didDrag                 = useRef(false);
  const toastCounter            = useRef(0);

  /* ── cart / wishlist state ── */
  const [loadingCart, setLoadingCart]         = useState<number | null>(null);
  const [loadingWishlist, setLoadingWishlist] = useState<number | null>(null);
  const [wishlistedIds, setWishlistedIds]     = useState<Set<number>>(new Set());
  const [toasts, setToasts]                   = useState<Toast[]>([]);

  const MAX          = 10;
  const visibleBooks = books.slice(0, MAX);

  /* ── toast helper ── */
  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  /* ── fetch wishlist IDs on mount so heart state is accurate ── */
  useEffect(() => {
    const token = getToken();
    if (!token) return; // not logged in — hearts stay empty, that's fine

    fetch(`${API_URL}${wishlistEndpoint}/ids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.ids && Array.isArray(d.ids)) {
          setWishlistedIds(new Set<number>(d.ids));
        }
      })
      .catch(() => {}); // silent — not critical
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── arrow sync ── */
  const syncArrows = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    syncArrows();
    el.addEventListener("scroll", syncArrows, { passive: true });
    const ro = new ResizeObserver(syncArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", syncArrows); ro.disconnect(); };
  }, [syncArrows, visibleBooks.length]);

  const scroll = (dir: "prev" | "next") => {
    const el = sliderRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-book-card]");
    const step = card ? (card.offsetWidth + 20) * 3 : 720;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  /* ── drag-to-scroll ── */
  const onPointerDown = (e: React.PointerEvent) => {
    const el = sliderRef.current;
    if (!el) return;
    didDrag.current = false;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
    el.style.scrollBehavior = "auto";
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const el = sliderRef.current;
    if (!el) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 4) didDrag.current = true;
    el.scrollLeft = dragStart.current.scrollLeft - dx;
  };
  const onPointerUp = () => {
    setIsDragging(false);
    if (sliderRef.current) sliderRef.current.style.scrollBehavior = "";
  };

  const handleCardClick = (slug: string) => {
    if (didDrag.current) return;
    window.location.href = `${hrefPrefix}/${slug}`;
  };

  /* ── Add to Cart ── */
  const handleAddToCart = async (e: React.MouseEvent, book: SliderBook) => {
    e.stopPropagation();
    if ((book.stock ?? 1) === 0 || loadingCart === book.id) return;

    const token = getToken();
    if (!token) {
      showToast("Please log in to add items to cart", "info");
      return;
    }

    setLoadingCart(book.id);
    try {
      const res = await fetch(`${API_URL}${cartEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: book.id, format: cartFormat, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 401 = not logged in / token expired
        if (res.status === 401) {
          showToast("Please log in to add items to cart", "info");
          return;
        }
        showToast(data?.message || "Could not add to cart", "error");
        return;
      }

      // notify header cart badge
      window.dispatchEvent(new Event("cart-change"));
      showToast(`"${book.title}" added to cart`, "success");
      onAddToCart?.(book);
    } catch {
      showToast("Network error — please try again", "error");
    } finally {
      setLoadingCart(null);
    }
  };

  /* ── Wishlist toggle ── */
  const handleWishlist = async (e: React.MouseEvent, book: SliderBook) => {
    e.stopPropagation();
    if (loadingWishlist === book.id) return;

    const token = getToken();
    if (!token) {
      showToast("Please log in to save to wishlist", "info");
      return;
    }

    const isWishlisted = wishlistedIds.has(book.id);

    // ── optimistic update ──
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      isWishlisted ? next.delete(book.id) : next.add(book.id);
      return next;
    });

    setLoadingWishlist(book.id);
    try {
      const res = await fetch(`${API_URL}${wishlistEndpoint}`, {
        method: isWishlisted ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: book.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ── roll back optimistic update ──
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          isWishlisted ? next.add(book.id) : next.delete(book.id);
          return next;
        });

        if (res.status === 401) {
          showToast("Please log in to save to wishlist", "info");
          return;
        }
        showToast(data?.message || "Wishlist update failed", "error");
        return;
      }

      showToast(
        isWishlisted ? "Removed from wishlist" : `"${book.title}" saved`,
        isWishlisted ? "info" : "success",
      );
      onWishlist?.(book);
    } catch {
      // ── roll back ──
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        isWishlisted ? next.add(book.id) : next.delete(book.id);
        return next;
      });
      showToast("Network error — please try again", "error");
    } finally {
      setLoadingWishlist(null);
    }
  };

  if (!visibleBooks.length) return null;

  return (
    <>
      <style>{`
        .cbs-track {
          display:flex; gap:20px; overflow-x:auto;
          padding:4px 2px 16px;
          scroll-snap-type:x mandatory;
          -webkit-overflow-scrolling:touch;
          cursor:grab; user-select:none;
        }
        .cbs-track::-webkit-scrollbar { display:none; }
        .cbs-track { scrollbar-width:none; }
        .cbs-track.is-dragging { cursor:grabbing; }

        .cbs-card {
          flex:0 0 200px; scroll-snap-align:start;
          background:#1c1c1e; position:relative;
          transition:transform .35s ease, box-shadow .35s ease;
        }
        @media (max-width:640px) { .cbs-card { flex:0 0 155px; } }

        .cbs-card:hover {
          transform:translateY(-5px);
          box-shadow:0 20px 52px rgba(0,0,0,.55);
          z-index:2;
        }
        .cbs-card:hover .cbs-img {
          transform:scale(1.06);
          filter:brightness(.68) saturate(.5);
        }
        .cbs-card:hover .cbs-gradient {
          background:linear-gradient(to top,
            rgba(10,10,11,.99) 0%,
            rgba(10,10,11,.78) 55%,
            rgba(10,10,11,.25) 100%);
        }
        .cbs-card:hover .cbs-actions { opacity:1; transform:translateY(0); }

        .cbs-img {
          width:100%; height:100%; object-fit:cover; display:block;
          filter:brightness(.88) saturate(.75);
          transition:transform .55s ease, filter .55s ease;
        }
        .cbs-gradient {
          position:absolute; inset:0;
          display:flex; flex-direction:column; justify-content:flex-end;
          padding:0 14px 14px;
          background:linear-gradient(to top,
            rgba(10,10,11,.96) 0%,
            rgba(10,10,11,.45) 45%,
            transparent 70%);
          transition:background .35s ease;
        }
        .cbs-actions {
          display:flex; gap:6px; margin-top:8px;
          opacity:0; transform:translateY(8px);
          transition:opacity .35s ease, transform .35s ease;
        }

        .cbs-arrow {
          width:40px; height:40px;
          display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(201,168,76,.22);
          background:rgba(10,10,11,.85); color:#6b6b70;
          cursor:pointer; transition:all .25s ease; flex-shrink:0;
        }
        .cbs-arrow:hover:not(:disabled) {
          border-color:#c9a84c; color:#c9a84c; background:rgba(10,10,11,.95);
        }
        .cbs-arrow:disabled { opacity:.22; cursor:not-allowed; }

        .cbs-add-btn {
          flex:1; font-size:9px; letter-spacing:2px; text-transform:uppercase;
          font-weight:500; padding:8px 6px; border:none; cursor:pointer;
          font-family:'Jost',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:4px;
          background:#c9a84c; color:#0a0a0b;
          transition:background .25s ease;
        }
        .cbs-add-btn:hover:not(:disabled) { background:#f5f0e8; }
        .cbs-add-btn:disabled { background:#2a2a2d; color:#6b6b70; cursor:not-allowed; }
        .cbs-add-btn.loading { opacity:.8; cursor:not-allowed; }

        .cbs-wish-btn {
          width:34px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
          color:#6b6b70; cursor:pointer;
          transition:all .25s ease;
        }
        .cbs-wish-btn:hover:not(.loading) { color:#c9a84c; border-color:rgba(201,168,76,.4); }
        .cbs-wish-btn.wishlisted {
          color:#c9a84c;
          background:rgba(201,168,76,.12);
          border-color:rgba(201,168,76,.4);
        }
        .cbs-wish-btn.loading { opacity:.6; cursor:wait; }

        @keyframes cbs-spin { to { transform:rotate(360deg); } }
        .cbs-spinner {
          width:10px; height:10px;
          border:1.5px solid rgba(10,10,11,.3);
          border-top-color:#0a0a0b;
          border-radius:50%;
          animation:cbs-spin .6s linear infinite;
          flex-shrink:0;
        }

        @keyframes cbs-toast-in {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── Toast notifications ── */}
      <ToastList toasts={toasts} />

      <section
        style={{
          padding: "52px 0 0",
          borderTop: showTopDivider ? "1px solid rgba(201,168,76,.1)" : "none",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
          paddingLeft: "clamp(16px,3.5vw,48px)",
          paddingRight: "clamp(16px,3.5vw,48px)",
          marginBottom: 28,
        }}>
          <div>
            {eyebrow && (
              <span style={{
                display: "block", marginBottom: 8,
                fontFamily: "'Jost',sans-serif",
                fontSize: 10, letterSpacing: "5px", textTransform: "uppercase",
                color: "#c9a84c",
              }}>
                {eyebrow}
              </span>
            )}
            <h2 style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(26px,3.5vw,40px)",
              fontWeight: 300, fontStyle: "italic",
              color: "#f5f0e8", lineHeight: 1.1, margin: 0,
            }}>
              {title}
            </h2>
            {description && (
              <p style={{
                fontFamily: "'Jost',sans-serif", fontSize: 12,
                color: "#6b6b70", marginTop: 8, lineHeight: 1.65, maxWidth: 420,
              }}>
                {description}
              </p>
            )}
          </div>

          {/* arrows + view all */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {viewAllHref && (
              <a href={viewAllHref} style={{
                fontFamily: "'Jost',sans-serif",
                fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase",
                color: "#6b6b70", textDecoration: "none",
                borderBottom: "1px solid rgba(201,168,76,.25)",
                paddingBottom: 2, marginRight: 4,
                transition: "color .25s, border-color .25s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#c9a84c"; e.currentTarget.style.borderBottomColor = "#c9a84c"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b70"; e.currentTarget.style.borderBottomColor = "rgba(201,168,76,.25)"; }}
              >
                View All
              </a>
            )}
            <button className="cbs-arrow" disabled={!canPrev} onClick={() => scroll("prev")} aria-label="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="cbs-arrow" disabled={!canNext} onClick={() => scroll("next")} aria-label="Next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>

        {/* Ornament */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          paddingLeft: "clamp(16px,3.5vw,48px)", marginBottom: 24,
        }}>
          <div style={{ width: 40, height: 1, background: "rgba(201,168,76,.3)" }} />
          <div style={{ width: 5, height: 5, background: "#8a6f2e", transform: "rotate(45deg)", flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,.08)" }} />
        </div>

        {/* ── Track ── */}
        <div
          ref={sliderRef}
          className={`cbs-track${isDragging ? " is-dragging" : ""}`}
          style={{
            paddingLeft: "clamp(16px,3.5vw,48px)",
            paddingRight: "clamp(16px,3.5vw,48px)",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {visibleBooks.map((book) => {
            const disc         = discountPct(book);
            const price        = effectivePrice(book);
            const origP        = originalPrice(book);
            const isNew        = isNewBook(book.created_at);
            const isOos        = (book.stock ?? 1) === 0;
            const isWishlisted = wishlistedIds.has(book.id);
            const cartLoading  = loadingCart === book.id;
            const wishLoading  = loadingWishlist === book.id;

            return (
              <div
                key={book.id}
                className="cbs-card"
                data-book-card
                onClick={() => handleCardClick(book.slug)}
              >
                {/* Image area */}
                <div style={{ position: "relative", overflow: "hidden" }}>

                  {/* Badge */}
                  <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "flex", flexDirection: "column", gap: 5 }}>
                    {isOos ? (
                      <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", padding: "3px 7px", background: "rgba(100,100,100,.55)", color: "#6b6b70" }}>
                        Out of Stock
                      </span>
                    ) : disc > 5 ? (
                      <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", padding: "3px 7px", background: "#8b3a3a", color: "#f5f0e8" }}>
                        {disc}% Off
                      </span>
                    ) :  null}
                  </div>

                  {/* Cover */}
                  {book.main_image ? (
                    <img
                      className="cbs-img"
                      src={`${apiUrl}${book.main_image}`}
                      alt={book.title}
                      loading="lazy"
                      draggable={false}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(135deg,#2a2a2d 0%,#1c1c1e 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" style={{ opacity: 0.4 }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient + actions */}
                  <div className="cbs-gradient">
                    <div className="cbs-actions">
                      {/* Add to Cart */}
                      <button
                        className={`cbs-add-btn${cartLoading ? " loading" : ""}`}
                        disabled={isOos || cartLoading}
                        onClick={(e) => handleAddToCart(e, book)}
                      >
                        {cartLoading ? <span className="cbs-spinner" /> : isOos ? "Sold Out" : "Add to Cart"}
                      </button>

                      {/* Wishlist */}
                      <button
                        className={`cbs-wish-btn${isWishlisted ? " wishlisted" : ""}${wishLoading ? " loading" : ""}`}
                        aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        onClick={(e) => handleWishlist(e, book)}
                      >
                        {wishLoading ? (
                          /* small grey spinner while toggling */
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ animation: "cbs-spin .7s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24"
                            fill={isWishlisted ? "currentColor" : "none"}
                            stroke="currentColor" strokeWidth="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Text block */}
                <div style={{ padding: "14px 14px 16px", borderTop: "1px solid rgba(201,168,76,.07)" }}>
                  {book.author_name && (
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", color: "#8a6f2e", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {book.author_name}
                    </p>
                  )}
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
                    fontWeight: 600, color: "#f5f0e8", lineHeight: 1.25, marginBottom: 8,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {book.title}
                  </h3>

                  {book.avg_rating && (book.review_count ?? 0) > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <Stars rating={book.avg_rating} />
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 14, fontWeight: 500, color: "#c9a84c" }}>
                      ₹{parseFloat(String(price)).toFixed(0)}
                    </span>
                    {disc > 0 && (
                      <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, color: "#6b6b70", textDecoration: "line-through" }}>
                        ₹{parseFloat(String(origP)).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}