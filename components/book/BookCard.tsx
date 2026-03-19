"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Book = {
  id: number;
  title: string;
  slug: string;
  image: string;
  product_type: "ebook" | "physical" | "both";
  stock: number;
  price: number;
  sell_price: number;
  ebook_price?: number;
  ebook_sell_price?: number;
  badge?: string;
  category?: string;
  author?: string;
};

type BookCardProps = {
  book: Book;
  visibleCount: number;
  forceFormat?: "ebook" | "paperback";
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const CARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  .agc-card-wrap { box-sizing: border-box; }
  .agc-card-wrap *, .agc-card-wrap *::before, .agc-card-wrap *::after { box-sizing: border-box; }

  @keyframes agcShimmer { from{left:-60%} to{left:140%} }

  .agc-add-btn { position:relative; overflow:hidden; }
  .agc-add-btn::after {
    content:''; position:absolute; top:0;
    width:45%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
  }
  .agc-add-btn:hover:not(:disabled)::after { animation:agcShimmer 0.5s ease; }

  .agc-card-inner:hover .agc-cover-img { transform: scale(1.05); }

  @keyframes agcWlPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
  .agc-wl-pulse { animation: agcWlPulse 0.35s ease; }
`;

const BookCard = ({ book, visibleCount, forceFormat }: BookCardProps) => {
  const [liked, setLiked]             = useState(false);
  const [wlAnimating, setWlAnimating] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wlLoading, setWlLoading]     = useState(false);

  /* ─────────────────────────────────────────────
     WISHLIST CHECK ON MOUNT
     Uses GET /api/ag-classics/wishlist/ids which
     returns { ids: number[] }. We check if this
     book's id is in that array.
  ───────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLiked(false); return; }

    fetch(`${API_URL}/api/ag-classics/wishlist/ids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ids && Array.isArray(d.ids))
          setLiked(d.ids.includes(book.id));
      })
      .catch(() => {});
  }, [book.id]);

  /* ─────────────────────────────────────────────
     WISHLIST TOGGLE
     Backend routes:
       POST   /api/ag-classics/wishlist   body: { product_id }  → add
       DELETE /api/ag-classics/wishlist   body: { product_id }  → remove
  ───────────────────────────────────────────── */
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wlLoading) return;

    const token = localStorage.getItem("token");
    if (!token) { window.dispatchEvent(new Event("open-account-slider")); return; }

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setWlAnimating(true);
    setTimeout(() => setWlAnimating(false), 350);

    setWlLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        // ✅ POST to add, DELETE to remove — both accept { product_id } in body
        method: wasLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: book.id }),
      });

      if (!res.ok) {
        // Roll back optimistic update on failure
        setLiked(wasLiked);
      } else {
        window.dispatchEvent(new Event("wishlist-change"));
      }
    } catch {
      setLiked(wasLiked); // roll back on network error
    } finally {
      setWlLoading(false);
    }
  };

  /* ─────────────────────────────────────────────
     CART FORMAT
  ───────────────────────────────────────────── */
  const getCartFormat = (): "ebook" | "paperback" => {
    if (forceFormat) return forceFormat;
    if (book.product_type === "ebook") return "ebook";
    if (book.product_type === "physical") return "paperback";
    return book.stock > 0 ? "paperback" : "ebook";
  };

  /* ─────────────────────────────────────────────
     ADD TO CART
     Backend route:
       POST /api/ag-classics/cart   body: { product_id, format, quantity }
     NOTE: The backend is mounted at /api/ag-classics/cart and the handler
     is router.post("/", ...) — NOT router.post("/add", ...).
     So the correct URL is /api/ag-classics/cart (no /add suffix).
  ───────────────────────────────────────────── */
  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartLoading || addedToCart) return;

    const token = localStorage.getItem("token");
    if (!token) { window.dispatchEvent(new Event("open-account-slider")); return; }

    const format = getCartFormat();
    setCartLoading(true);
    try {
      const res = await fetch(
        // ✅ Correct endpoint: /api/ag-classics/cart  (no /add)
        `${API_URL}/api/ag-classics/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: book.id, format, quantity: 1 }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // 409 = already in cart — treat as success (item is there)
        if (res.status === 409) {
          window.dispatchEvent(new Event("cart-change"));
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 1800);
          return;
        }
        // Other errors — silent fail
        console.warn("Add to cart failed:", data?.message);
        return;
      }

      window.dispatchEvent(new Event("cart-change"));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setCartLoading(false);
    }
  };

  /* ─────────────────────────────────────────────
     PRICING
  ───────────────────────────────────────────── */
  const isEbookOnly      = book.product_type === "ebook";
  const displaySellPrice = isEbookOnly ? (book.ebook_sell_price ?? 0) : book.sell_price;
  const displayMrp       = isEbookOnly ? (book.ebook_price ?? 0)      : book.price;
  const showDiscount     = displayMrp > 0 && displayMrp > displaySellPrice;
  const discountPercent  = showDiscount
    ? Math.round(((displayMrp - displaySellPrice) / displayMrp) * 100)
    : 0;
  const isOutOfStock = book.product_type === "physical" && book.stock === 0;
  const isDisabled   = cartLoading || addedToCart || isOutOfStock;

  return (
    <div
      className="agc-card-wrap flex-shrink-0 px-1 my-2"
      style={{ width: `${100 / visibleCount}%` }}
    >
      <style>{CARD_STYLES}</style>

      <div className="agc-card-inner group relative bg-[#111113] border border-[rgba(201,168,76,0.08)] overflow-hidden flex flex-col transition-all duration-300 hover:border-[rgba(201,168,76,0.25)] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]">

        {/* ── COVER ── */}
        <Link href={`/product/${book.slug}`} className="block">
          <div
            className="relative overflow-hidden flex items-center justify-center"
            style={{ minHeight: 220, background: "linear-gradient(160deg,#161618,#111113)" }}
          >
            {/* Wishlist button */}
            <button
              onClick={toggleWishlist}
              disabled={wlLoading}
              className={`absolute right-2.5 top-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                liked
                  ? "bg-[rgba(201,168,76,0.15)] border-[rgba(201,168,76,0.5)]"
                  : "bg-[rgba(12,12,14,0.75)] border-[rgba(201,168,76,0.18)] hover:border-[rgba(201,168,76,0.4)]"
              } ${wlAnimating ? "agc-wl-pulse" : ""} ${wlLoading ? "opacity-60" : ""}`}
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            >
              {wlLoading ? (
                /* Spinner while toggling */
                <svg
                  width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="#c9a84c" strokeWidth="2"
                  style={{ animation: "agcWlPulse 0.7s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg
                  width="12" height="12" viewBox="0 0 24 24"
                  fill={liked ? "#c9a84c" : "none"}
                  stroke="#c9a84c" strokeWidth="1.5"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>

            {/* Badge */}
            {book.badge && (
              <span
                className="absolute top-2.5 left-2.5 z-10 bg-[#7a2e2e] px-2 py-0.5 text-[7px] tracking-[2px] uppercase text-[#f5d5d5]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {book.badge}
              </span>
            )}

            {/* Discount pill */}
            {discountPercent > 5 && (
              <span
                className="absolute bottom-2.5 left-2.5 z-10 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] px-2 py-0.5 text-[7px] tracking-[2px] uppercase"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {discountPercent}% Off
              </span>
            )}

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-[rgba(12,12,14,0.65)] flex items-center justify-center z-10">
                <span className="text-[8px] tracking-[3px] uppercase text-[#8a8a8e]" style={{ fontFamily: "'Cinzel', serif" }}>
                  Out of Stock
                </span>
              </div>
            )}

            {/* Cover image */}
            <div className="agc-cover-img transition-transform duration-700 py-6">
              <Image
                src={book.image}
                alt={book.title}
                width={140}
                height={200}
                className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                style={{ maxHeight: 240 }}
                unoptimized
              />
            </div>
          </div>

          {/* ── TEXT ── */}
          <div className="px-4 pt-3.5 pb-2">
            <p
              className="text-[9px] tracking-[2px] uppercase text-[#8a6f2e] truncate mb-1"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {book.category ?? (isEbookOnly ? "Digital Edition" : "Paperback")}
            </p>

            <h3
              className="text-[14px] italic text-[#f5f0e8] leading-[1.25] line-clamp-2 mb-1 group-hover:text-[#c9a84c] transition-colors duration-300"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {book.title}
            </h3>

            {book.author && (
              <p
                className="text-[11px] text-[#4a4a4d] truncate mb-1.5"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {book.author}
              </p>
            )}

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[15px] font-medium text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>
                ₹{parseFloat(String(displaySellPrice)).toFixed(0)}
              </span>
              {showDiscount && (
                <span className="text-[11px] text-[#3a3a3d] line-through" style={{ fontFamily: "'Jost', sans-serif" }}>
                  ₹{parseFloat(String(displayMrp)).toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* ── ADD TO CART ── */}
        <div className="px-4 pb-4 pt-1 mt-auto">
          <button
            onClick={addToCart}
            disabled={isDisabled}
            className={`agc-add-btn w-full py-2.5 text-[9px] tracking-[2.5px] uppercase border-none transition-all duration-300 ${
              isOutOfStock
                ? "bg-[#1e1e20] text-[#4a4a4d] cursor-not-allowed"
                : addedToCart
                ? "bg-[rgba(201,168,76,0.12)] text-[#c9a84c] border border-[#c9a84c] cursor-default"
                : cartLoading
                ? "bg-[#c9a84c] text-[#0c0c0e] opacity-70 cursor-wait"
                : "bg-[#c9a84c] text-[#0c0c0e] hover:bg-[#e4be54] cursor-pointer"
            }`}
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {isOutOfStock ? (
              "Out of Stock"
            ) : cartLoading ? (
              <span className="flex items-center justify-center gap-1.5">
                {/* Spinner */}
                <svg
                  width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "agcWlPulse 0.7s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Adding…
              </span>
            ) : addedToCart ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;