"use client";

import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface WishlistItem {
  id: number;
  title: string;
  slug: string;
  main_image: string;
  price: number;
  sell_price: number;
  /* Ebook-specific prices — null when no ebooks row */
  ebook_price: number | null;
  ebook_sell_price: number | null;
  stock: number;
  product_type: "physical" | "ebook" | "both";
  created_at: string;
}

const fmt = (n: number) => `₹${parseFloat(String(n)).toFixed(0)}`;

/* ─────────────────────────────────────────────────────────
   Same resolution rules as ProductSlider.resolvePrice()

   physical            → product price / sell_price  |  paperback  |  OOS when stock=0
   ebook               → ebook_price / ebook_sell_price  |  ebook  |  never OOS
   both (in stock)     → product price / sell_price  |  paperback
   both (OOS) + ebook  → ebook_price / ebook_sell_price  |  ebook   |  never OOS
   both (OOS) no ebook → product price               |  paperback  |  soldOut=true
───────────────────────────────────────────────────────── */
function resolveItem(item: WishlistItem): {
  displayPrice:  number;
  originalPrice: number | null;
  discount:      number;
  format:        "ebook" | "paperback";
  label:         string | null;
  soldOut:       boolean;
} {
  const price      = Number(item.price);
  const sellPrice  = Number(item.sell_price);
  const ebookPrice = item.ebook_price      !== null ? Number(item.ebook_price)      : null;
  const ebookSell  = item.ebook_sell_price !== null ? Number(item.ebook_sell_price) : null;

  const disc = (orig: number, sell: number) =>
    orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0;

  if (item.product_type === "ebook") {
    const sell = ebookSell  ?? sellPrice;
    const orig = ebookPrice ?? price;
    return { displayPrice: sell, originalPrice: orig > sell ? orig : null,
             discount: disc(orig, sell), format: "ebook", label: "e-book", soldOut: false };
  }

  if (item.product_type === "physical") {
    return { displayPrice: sellPrice, originalPrice: price > sellPrice ? price : null,
             discount: disc(price, sellPrice), format: "paperback", label: null,
             soldOut: item.stock === 0 };
  }

  // "both" — in stock
  if (item.stock > 0) {
    return { displayPrice: sellPrice, originalPrice: price > sellPrice ? price : null,
             discount: disc(price, sellPrice), format: "paperback", label: "print", soldOut: false };
  }

  // "both" — physical OOS, ebook fallback available
  if (ebookSell !== null) {
    const orig = ebookPrice ?? price;
    return { displayPrice: ebookSell, originalPrice: orig > ebookSell ? orig : null,
             discount: disc(orig, ebookSell), format: "ebook", label: "e-book", soldOut: false };
  }

  // "both" — physical OOS, no ebook row → truly sold out
  return { displayPrice: sellPrice, originalPrice: price > sellPrice ? price : null,
           discount: disc(price, sellPrice), format: "paperback", label: "print", soldOut: true };
}

export default function WishlistPage() {
  const [items, setItems]                   = useState<WishlistItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [removingId, setRemovingId]         = useState<number | null>(null);
  const [cartLoadingId, setCartLoadingId]   = useState<number | null>(null);
  const [movedToCartIds, setMovedToCartIds] = useState<Set<number>>(new Set());

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/ag-classics/wishlist`, { headers });
      const data = await res.json();
      if (data.success) setItems(data.wishlist);
      else throw new Error(data.message);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  /* ── remove ── */
  const removeItem = async (id: number) => {
    setRemovingId(id);
    try {
      await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        method: "DELETE", headers,
        body: JSON.stringify({ product_id: id }),
      });
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 320);
    } finally { setRemovingId(null); }
  };

  /* ── move to cart ──
     format is resolved by resolveItem() — honours the both+OOS→ebook fallback */
  const moveToCart = async (item: WishlistItem) => {
    const { format, soldOut } = resolveItem(item);
    if (soldOut) return;
    setCartLoadingId(item.id);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST", headers,
        body: JSON.stringify({ product_id: item.id, format, quantity: 1 }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event("cart-change"));
        setMovedToCartIds((prev) => new Set(prev).add(item.id));
        setTimeout(() => removeItem(item.id), 800);
      }
    } finally { setCartLoadingId(null); }
  };

  /* ── move all ── only non-soldOut items, each with their resolved format ── */
  const moveAllToCart = async () => {
    const available = items.filter((i) => !resolveItem(i).soldOut);
    for (const item of available) {
      const { format } = resolveItem(item);
      await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST", headers,
        body: JSON.stringify({ product_id: item.id, format, quantity: 1 }),
      });
    }
    window.dispatchEvent(new Event("cart-change"));
    setItems([]);
  };

  /* ── skeleton ── */
  if (loading) return (
    <PageWrap>
      <Header count={0} loading />
      <div className="grid gap-0.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse" style={{ background: "#1c1c1e" }}>
            <div className="aspect-[3/4] w-full" style={{ background: "#2a2a2d" }} />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4" style={{ background: "#2a2a2d" }} />
              <div className="h-3 w-1/2" style={{ background: "#2a2a2d" }} />
            </div>
          </div>
        ))}
      </div>
    </PageWrap>
  );

  if (error) return (
    <PageWrap>
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <p className="text-[28px] font-light italic"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
          Something went wrong
        </p>
        <p className="text-sm" style={{ color: "#6b6b70" }}>{error}</p>
        <GoldBtn onClick={fetchWishlist}>Retry</GoldBtn>
      </div>
    </PageWrap>
  );

  if (items.length === 0) return (
    <PageWrap>
      <Header count={0} />
      <div className="flex flex-col items-center gap-6 py-32 text-center">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h2 className="text-[32px] font-light italic"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
          Your wishlist is empty
        </h2>

        <GoldBtn onClick={() => (window.location.href = "/")}>Explore Collection</GoldBtn>
      </div>
    </PageWrap>
  );

  const availableCount = items.filter((i) => !resolveItem(i).soldOut).length;

  return (
    <PageWrap>
      <style>{`
        @keyframes wishFadeOut { to { opacity: 0; transform: scale(0.94); } }
        .wl-removing { animation: wishFadeOut 0.32s ease forwards; pointer-events: none; }
        @keyframes wishFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .wl-item { animation: wishFadeIn 0.4s ease both; }
        .wl-card:hover .wl-img     { transform: scale(1.04); filter: brightness(0.6) saturate(0.5); }
        .wl-card:hover .wl-overlay { background: linear-gradient(to top, rgba(10,10,11,0.99) 0%, rgba(10,10,11,0.7) 55%, rgba(10,10,11,0.2) 100%) !important; }
        .wl-card:hover .wl-actions { opacity: 1 !important; transform: translateY(0) !important; }
        .wl-card:hover .wl-title   { color: #c9a84c !important; }
        @keyframes cartPop { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
        .cart-pop { animation: cartPop 0.4s ease; }
        @keyframes checkIn { from { stroke-dashoffset: 30; } to { stroke-dashoffset: 0; } }
        .check-draw { stroke-dasharray: 30; animation: checkIn 0.35s ease 0.1s both; }
      `}</style>

      <Header count={items.length} onMoveAll={availableCount > 1 ? moveAllToCart : undefined} />

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 pb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Stat label="Total Items" value={String(items.length)} />
        <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.06)" }} />
        <Stat label="Available" value={String(availableCount)} accent />
        <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Grid */}
      <div className="grid gap-0.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {items.map((item, idx) => {
          const { displayPrice, originalPrice, discount, format, label, soldOut } = resolveItem(item);
          const isNew        = new Date(item.created_at) > new Date(Date.now() - 30 * 86400000);
          const isRemoving   = removingId === item.id;
          const inCart       = movedToCartIds.has(item.id);
          const cartLoading  = cartLoadingId === item.id;

          /* "both" + OOS fallen back to ebook */
          const ebookFallback = item.product_type === "both" && item.stock === 0 && !soldOut;

          /* Cart button label */
          const cartBtnLabel = soldOut ? "Out of Stock"
            : inCart           ? "Added"
            : format === "ebook" ? "Move E-Book to Cart"
            : "Move to Cart";

          return (
            <div key={item.id}
              className={`m-5 md:m-1 wl-item wl-card relative overflow-hidden cursor-pointer ${isRemoving ? "wl-removing" : ""}`}
              style={{ background: "#1c1c1e", animationDelay: `${idx * 55}ms`, aspectRatio: "3 / 4" }}
              onClick={() => { window.location.href = `/product/${item.slug}`; }}
            >
              {/* ── Left badge: status ── */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-[5px]">
                {soldOut ? (
                  <span className="text-[8px] tracking-[2px] uppercase font-medium px-[9px] py-[4px]"
                    style={{ fontFamily: "'Jost', sans-serif", background: "rgba(80,80,80,0.7)", color: "#6b6b70" }}>
                    Out of Stock
                  </span>
                ) : discount > 5 ? (
                  <span className="text-[8px] tracking-[2px] uppercase font-medium px-[9px] py-[4px]"
                    style={{ fontFamily: "'Jost', sans-serif", background: "#8b3a3a", color: "#f5f0e8" }}>
                    {discount}% Off
                  </span>
                ) : isNew ? (
                  <span className="text-[8px] tracking-[2px] uppercase font-medium px-[9px] py-[4px]"
                    style={{ fontFamily: "'Jost', sans-serif", background: "#c9a84c", color: "#0a0a0b" }}>
                    New
                  </span>
                ) : null}

                {/* Format / type indicator */}
                {(item.product_type !== "physical" || ebookFallback) && (
                  <span className="text-[7px] tracking-[1.5px] uppercase px-[9px] py-[4px]"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      background:  ebookFallback || item.product_type === "ebook"
                        ? "rgba(201,168,76,.18)" : "rgba(255,255,255,.08)",
                      color:       ebookFallback || item.product_type === "ebook"
                        ? "#c9a84c" : "#a0a0a0",
                      border:      ebookFallback || item.product_type === "ebook"
                        ? "1px solid rgba(201,168,76,.3)" : "1px solid rgba(255,255,255,.1)",
                    }}>
                    {item.product_type === "ebook"   ? "E-Book"
                     : ebookFallback                  ? "E-Book Only"
                     : "Print + Digital"}
                  </span>
                )}
              </div>

              {/* ── Remove button ── */}
              <button
                className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center transition-all duration-200"
                style={{ background: "rgba(10,10,11,0.6)", border: "1px solid rgba(255,255,255,0.08)",
                         color: "#6b6b70", backdropFilter: "blur(4px)" }}
                aria-label="Remove from wishlist"
                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b70"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {/* ── Cover ── */}
              {item.main_image ? (
                <img src={`${API_URL}${item.main_image}`} alt={item.title}
                  className="wl-img absolute inset-0 w-full h-full object-cover transition-[transform,filter] duration-[560ms] ease-in-out"
                  style={{ filter: "brightness(0.83) saturate(0.75)" }}
                  loading="lazy" draggable={false} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #2a2a2d 0%, #1c1c1e 100%)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
              )}

              {/* ── Overlay ── */}
              <div className="wl-overlay absolute inset-0 flex flex-col justify-end px-4 pb-4 transition-[background] duration-[380ms]"
                style={{ background: "linear-gradient(to top, rgba(10,10,11,0.97) 0%, rgba(10,10,11,0.46) 42%, transparent 68%)" }}>

                <h3 className="wl-title font-semibold leading-[1.2] mb-[5px] transition-colors duration-300"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(14px,1.2vw,17px)",
                           color: "#f5f0e8", display: "-webkit-box", WebkitLineClamp: 2,
                           WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.title}
                </h3>

                {/* Price row — uses resolved ebook/print pricing */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-[14px] font-medium"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
                    {fmt(displayPrice)}
                  </span>
                  {originalPrice && (
                    <span className="text-[11px] line-through"
                      style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                      {fmt(originalPrice)}
                    </span>
                  )}
                  {label && (
                    <span className="text-[8px] tracking-[1px] uppercase"
                      style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                      {label}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="wl-actions flex gap-[5px] transition-[opacity,transform] duration-[360ms] ease-in-out"
                  style={{ opacity: 0, transform: "translateY(8px)" }}>

                  <button
                    className={`flex-1 text-[9px] tracking-[2px] uppercase font-medium py-2 px-2
                      flex items-center justify-center gap-1 transition-all duration-300
                      ${inCart ? "cart-pop" : ""}`}
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color:      soldOut ? "#6b6b70" : inCart ? "#4a9a5a" : "#0a0a0b",
                      background: soldOut ? "#2a2a2d" : inCart ? "rgba(74,154,90,0.15)" : "#c9a84c",
                      border:     inCart  ? "1px solid rgba(74,154,90,0.4)" : "none",
                      cursor:     soldOut ? "not-allowed" : "pointer",
                    }}
                    disabled={soldOut || cartLoading || inCart}
                    onClick={(e) => { e.stopPropagation(); moveToCart(item); }}
                    onMouseEnter={(e) => { if (!soldOut && !inCart) e.currentTarget.style.background = "#f5f0e8"; }}
                    onMouseLeave={(e) => { if (!soldOut && !inCart) e.currentTarget.style.background = "#c9a84c"; }}
                  >
                    {cartLoading ? (
                      <span className="inline-block w-[10px] h-[10px] border border-[#0a0a0b] border-t-transparent rounded-full animate-spin" />
                    ) : inCart ? (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline className="check-draw" points="20 6 9 17 4 12"/>
                        </svg>
                        Added
                      </>
                    ) : (
                      <>
                        {/* Icon changes by resolved format */}
                        {format === "ebook" ? (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>
                          </svg>
                        ) : (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                          </svg>
                        )}
                        {cartBtnLabel}
                      </>
                    )}
                  </button>

                  <button
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center transition-all duration-300"
                    style={{ color: "#6b6b70", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    aria-label="View product"
                    onClick={(e) => { e.stopPropagation(); window.location.href = `/product/${item.slug}`; }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#c9a84c"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b70"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Ornament />
    </PageWrap>
  );
}

/* ═══════════════════ SUB-COMPONENTS ═══════════════════ */
function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-[130px] pb-20 px-12 max-md:px-6 max-sm:px-4"
      style={{ color: "#e8e0d0", fontFamily: "'Jost', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500&display=swap');`}</style>
      <div className="max-w-[1200px] mx-auto">{children}</div>
    </div>
  );
}

function Header({ count, loading, onMoveAll }: { count: number; loading?: boolean; onMoveAll?: () => void }) {
  return (
    <div className="mb-8">
      <span className="block mb-2 text-[10px] tracking-[5px] uppercase"
        style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>Saved for Later</span>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <h1 className="font-light italic leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,56px)", color: "#f5f0e8" }}>
          Wishlist
          {!loading && count > 0 && (
            <sup className="text-[14px] ml-2 not-italic"
              style={{ color: "#c9a84c", fontFamily: "'Jost', sans-serif" }}>{count}</sup>
          )}
        </h1>
        {onMoveAll && (
          <button className="mb-2 px-5 py-2 text-[9px] tracking-[2px] uppercase transition-all duration-200"
            style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c",
                     background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#c9a84c"; e.currentTarget.style.color = "#0a0a0b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.06)"; e.currentTarget.style.color = "#c9a84c"; }}
            onClick={onMoveAll}>Move All to Cart</button>
        )}
      </div>
      <div className="flex items-center gap-3 mt-4 mb-8">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.3), transparent)" }} />
        <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.3)" }} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs md:text-sm tracking-[2px] uppercase mb-1"
        style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>{label}</p>
      <p className="text-[18px] font-light"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: accent ? "#c9a84c" : "#f5f0e8" }}>{value}</p>
    </div>
  );
}

function GoldBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button className="px-8 py-3 text-[10px] tracking-[3px] uppercase font-medium transition-colors duration-300"
      style={{ fontFamily: "'Jost', sans-serif", background: "#c9a84c", color: "#0a0a0b", border: "none" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
      onClick={onClick}>{children}</button>
  );
}

function Ornament() {
  return (
    <div className="flex items-center gap-3 mt-16">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }} />
      <div className="w-[5px] h-[5px] rotate-45 flex-shrink-0" style={{ background: "rgba(201,168,76,0.25)" }} />
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }} />
    </div>
  );
}