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

  @keyframes agcFadeUp { 
    from { opacity: 0; transform: translateX(-50%) translateY(8px); } 
    to   { opacity: 1; transform: translateX(-50%) translateY(0); } 
  }
`;

const BookCard = ({ book, visibleCount, forceFormat }: BookCardProps) => {
  const [liked, setLiked]             = useState(false);
  const [wlAnimating, setWlAnimating] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wlLoading, setWlLoading]     = useState(false);
  const [localToast, setLocalToast]   = useState<string | null>(null);

  const showToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 2400);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLiked(false); return; }
    fetch(`${API_URL}/api/ag-classics/wishlist/ids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ids && Array.isArray(d.ids)) setLiked(d.ids.includes(book.id));
      })
      .catch(() => {});
  }, [book.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (wlLoading) return;
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please log in to save to wishlist");
      window.dispatchEvent(new Event("open-account-slider"));
      return;
    }
    const wasLiked = liked;
    setLiked(!wasLiked); setWlAnimating(true);
    setTimeout(() => setWlAnimating(false), 350);
    setWlLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        method: wasLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: book.id }),
      });
      if (!res.ok) setLiked(wasLiked);
      else window.dispatchEvent(new Event("wishlist-change"));
    } catch { setLiked(wasLiked); }
    finally { setWlLoading(false); }
  };

  const getCartFormat = (): "ebook" | "paperback" => {
    if (forceFormat) return forceFormat;
    if (book.product_type === "ebook") return "ebook";
    if (book.product_type === "physical") return "paperback";
    return book.stock > 0 ? "paperback" : "ebook";
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (cartLoading || addedToCart) return;
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please log in to add to cart");
      window.dispatchEvent(new Event("open-account-slider"));
      return;
    }
    const format = getCartFormat();
    setCartLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: book.id, format, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          window.dispatchEvent(new Event("cart-change"));
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 1800);
          return;
        }
        console.warn("Add to cart failed:", data?.message);
        return;
      }
      window.dispatchEvent(new Event("cart-change"));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    } catch (err) { console.error("Add to cart error:", err); }
    finally { setCartLoading(false); }
  };

  const isEbookOnly      = book.product_type === "ebook";
  const displaySellPrice = isEbookOnly ? (book.ebook_sell_price ?? 0) : book.sell_price;
  const displayMrp       = isEbookOnly ? (book.ebook_price ?? 0)      : book.price;
  const showDiscount     = displayMrp > 0 && displayMrp > displaySellPrice;
  const discountPercent  = showDiscount
    ? Math.round(((displayMrp - displaySellPrice) / displayMrp) * 100) : 0;
  const isOutOfStock = book.product_type === "physical" && book.stock === 0;
  const isDisabled   = cartLoading || addedToCart || isOutOfStock;

  // Responsive sizes derived from visibleCount passed from the parent
  // When used inside ProductSlider, visibleCount=1 (card fills its container cell)
  // so we use Tailwind responsive classes for internal sizing instead.

  return (
    <>
      {localToast && (
        <div
          role="status" aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[200] flex items-center gap-3 px-4 sm:px-5 py-3
            text-[10px] sm:text-[11px] tracking-[2px] uppercase"
          style={{
            transform: "translateX(-50%)",
            background: "#1c1c1e",
            border: "1px solid rgba(201,168,76,0.25)",
            color: "#c9a84c",
            fontFamily: "'Jost', sans-serif",
            animation: "agcFadeUp 0.3s ease both",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          <div className="w-[6px] h-[6px] rotate-45 bg-[#c9a84c] shrink-0" aria-hidden="true" />
          {localToast}
        </div>
      )}

      <div className="agc-card-wrap flex-shrink-0 px-[3px] sm:px-1 my-1.5 sm:my-2 w-full">
        <style>{CARD_STYLES}</style>

        <div className="agc-card-inner group relative bg-[#111113] border border-[rgba(201,168,76,0.08)]
          overflow-hidden flex flex-col transition-all duration-300
          hover:border-[rgba(201,168,76,0.25)] hover:-translate-y-0.5
          hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]">

          {/* ── COVER ── */}
          <Link href={`/product/${book.slug}`} className="block">
            <div
              className="relative overflow-hidden flex items-center justify-center
                min-h-[160px] sm:min-h-[200px] md:min-h-[220px]"
              style={{ background: "linear-gradient(160deg,#161618,#111113)" }}
            >
              {/* Wishlist button */}
              <button
                onClick={toggleWishlist}
                disabled={wlLoading}
                className={`absolute right-2 top-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full
                  flex items-center justify-center border transition-all duration-300 cursor-pointer
                  ${liked
                    ? "bg-[rgba(201,168,76,0.15)] border-[rgba(201,168,76,0.5)]"
                    : "bg-[rgba(12,12,14,0.75)] border-[rgba(201,168,76,0.18)] hover:border-[rgba(201,168,76,0.4)]"
                  } ${wlAnimating ? "agc-wl-pulse" : ""} ${wlLoading ? "opacity-60" : ""}`}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wlLoading ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"
                    style={{ animation: "agcWlPulse 0.7s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24"
                    fill={liked ? "#c9a84c" : "none"} stroke="#c9a84c" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </button>

              {/* Badge */}
              {book.badge && (
                <span
                  className="absolute top-2 left-2 z-10 bg-[#7a2e2e] px-1.5 py-0.5
                    text-[7px] tracking-[2px] uppercase text-[#f5d5d5]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {book.badge}
                </span>
              )}

              {/* Discount pill */}
              {discountPercent > 5 && (
                <span
                  className="absolute bottom-2 left-2 z-10 bg-[rgba(201,168,76,0.15)]
                    border border-[rgba(201,168,76,0.3)] text-[#c9a84c] px-1.5 py-0.5
                    text-[7px] tracking-[2px] uppercase"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {discountPercent}% Off
                </span>
              )}

              {/* Out of stock overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-[rgba(12,12,14,0.65)] flex items-center justify-center z-10">
                  <span className="text-[8px] tracking-[3px] uppercase text-[#8a8a8e]"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Cover image — responsive size */}
              <div className="agc-cover-img transition-transform duration-700 py-4 sm:py-6 pb-0">
                <Image
                  src={book.image}
                  alt={book.title}
                  width={120}
                  height={175}
                  className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]
                    max-h-[160px] sm:max-h-[200px] md:max-h-[230px] w-auto"
                  unoptimized
                />
              </div>
            </div>

            {/* ── TEXT ── */}
            <div className="px-2.5 sm:px-4 pt-2.5 sm:pt-3.5 pb-1.5 sm:pb-2">
              <p
                className="text-[8px] sm:text-[9px] tracking-[2px] uppercase text-[#8a6f2e] truncate mb-0.5 sm:mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {book.category ?? (isEbookOnly ? "Digital Edition" : "Paperback")}
              </p>

              <h3
                className="text-[12px] sm:text-sm text-[#f5f0e8] leading-[1.25] line-clamp-2
                  mb-0.5 sm:mb-1 group-hover:text-[#c9a84c] transition-colors duration-300"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {book.title}
              </h3>

              {book.author && (
                <p
                  className="text-[10px] sm:text-[11px] text-[#4a4a4d] truncate mb-1 sm:mb-1.5"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {book.author}
                </p>
              )}

              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <span
                  className="text-[13px] sm:text-[15px] font-medium text-[#c9a84c]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  ₹{parseFloat(String(displaySellPrice)).toFixed(0)}
                </span>
                {showDiscount && (
                  <span
                    className="text-[10px] sm:text-[11px] text-[#3a3a3d] line-through"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    ₹{parseFloat(String(displayMrp)).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* ── ADD TO CART ── */}
          <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 pt-1 mt-auto">
            <button
              onClick={addToCart}
              disabled={isDisabled}
              className={`agc-add-btn w-full py-2 sm:py-2.5 text-[8px] sm:text-[9px]
                tracking-[2px] sm:tracking-[2.5px] uppercase border-none transition-all duration-300
                ${isOutOfStock
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
                <span className="flex items-center justify-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "agcWlPulse 0.7s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="hidden xs:inline">Adding…</span>
                </span>
              ) : addedToCart ? (
                <span className="flex items-center justify-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {/* On very narrow cards (2-col mobile) show shorter label */}
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default BookCard;