"use client";

import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CartItem {
  id: number;
  product_id: number;
  format: "paperback" | "ebook";
  quantity: number;
  title: string;
  slug: string;
  main_image: string;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  stock: number;
  product_type: "physical" | "ebook" | "both";
}

const fmt = (n: number) => `₹${parseFloat(String(n)).toFixed(0)}`;

/* ─── Price resolution ───────────────────────────────────
   "ebook"     → ebook_price / ebook_sell_price
   "paperback" → product price / sell_price
───────────────────────────────────────────────────────── */
function resolveCartPrice(item: CartItem): {
  displayPrice:  number;
  originalPrice: number | null;
  discount:      number;
} {
  const price  = Number(item.price);
  const sell   = Number(item.sell_price);
  const ePr    = item.ebook_price      !== null ? Number(item.ebook_price)      : null;
  const eSell  = item.ebook_sell_price !== null ? Number(item.ebook_sell_price) : null;
  const disc   = (o: number, s: number) => o > s ? Math.round(((o - s) / o) * 100) : 0;

  if (item.format === "ebook") {
    const s = eSell ?? sell;
    const o = ePr   ?? price;
    return { displayPrice: s, originalPrice: o > s ? o : null, discount: disc(o, s) };
  }
  return { displayPrice: sell, originalPrice: price > sell ? price : null, discount: disc(price, sell) };
}

/** OOS only applies to paperback */
const isOutOfStock = (item: CartItem) => item.format === "paperback" && item.stock === 0;

export default function CartPage() {
  const [items, setItems]           = useState<CartItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removingOos, setRemovingOos] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/ag-classics/cart`, { headers });
      const data = await res.json();
      if (data.success) setItems(data.cart);
      else throw new Error(data.message);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  /* ── update quantity (paperback only) ── */
  const updateQty = async (item: CartItem, delta: number) => {
    if (item.format === "ebook") return;             // ebooks are single-license
    const newQty = item.quantity + delta;
    if (newQty < 1) return removeItem(item.id);
    if (newQty > item.stock) return;                 // cap at stock

    setUpdatingId(item.id);
    try {
      await fetch(`${API_URL}/api/ag-classics/cart/${item.id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ quantity: newQty }),
      });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i));
    } finally { setUpdatingId(null); }
  };

  /* ── remove single item ── */
  const removeItem = async (id: number) => {
    setRemovingId(id);
    try {
      await fetch(`${API_URL}/api/ag-classics/cart/${id}`, { method: "DELETE", headers });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally { setRemovingId(null); }
  };

  /* ── remove ALL out-of-stock items at once ── */
  const removeOosItems = async () => {
    setRemovingOos(true);
    const oosItems = items.filter(isOutOfStock);
    try {
      await Promise.all(
        oosItems.map((i) =>
          fetch(`${API_URL}/api/ag-classics/cart/${i.id}`, { method: "DELETE", headers })
        )
      );
      setItems((prev) => prev.filter((i) => !isOutOfStock(i)));
    } finally { setRemovingOos(false); }
  };

  const clearCart = async () => {
    await fetch(`${API_URL}/api/ag-classics/cart`, { method: "DELETE", headers });
    setItems([]);
  };

  /* ── totals ── */
  const subtotal  = items.reduce((s, i) => s + resolveCartPrice(i).displayPrice * i.quantity, 0);
  const savings   = items.reduce((s, i) => {
    const { displayPrice, originalPrice } = resolveCartPrice(i);
    return s + ((originalPrice ?? displayPrice) - displayPrice) * i.quantity;
  }, 0);
  const total     = subtotal;

  const oosItems     = items.filter(isOutOfStock);
  const hasOos       = oosItems.length > 0;
  const canCheckout  = !hasOos && items.length > 0;

  /* ── skeleton ── */
  if (loading) return (
    <PageWrap>
      <Header count={0} loading />
      <div className="grid gap-0.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-5 p-6 animate-pulse" style={{ background: "#1c1c1e" }}>
            <div className="w-20 h-28 flex-shrink-0" style={{ background: "#2a2a2d" }} />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-4 w-3/4" style={{ background: "#2a2a2d" }} />
              <div className="h-3 w-1/3" style={{ background: "#2a2a2d" }} />
              <div className="h-3 w-1/4 mt-6" style={{ background: "#2a2a2d" }} />
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
        <p className="text-sm" style={{ color: "white" }}>{error}</p>
        <GoldBtn onClick={fetchCart}>Retry</GoldBtn>
      </div>
    </PageWrap>
  );

  if (items.length === 0) return (
    <PageWrap>
      <Header count={0} />
      <div className="flex flex-col items-center gap-6 py-32 text-center">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2 className="text-[32px] font-light italic"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
          Your cart is empty
        </h2>
        <p className="text-[13px] max-w-xs leading-relaxed"
          style={{ fontFamily: "'Jost', sans-serif", color: "white" }}>
          Discover our curated collection of timeless literature and add your favourites.
        </p>
        <GoldBtn onClick={() => (window.location.href = "/")}>Browse Collection</GoldBtn>
      </div>
    </PageWrap>
  );

  return (
    <PageWrap>
      <style>{`
        @keyframes slideOut { to { opacity:0; transform:translateX(20px); max-height:0; padding:0; margin:0; border:0; } }
        .removing { animation: slideOut 0.3s ease forwards; overflow:hidden; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease both; }
        @keyframes oosShake {
          0%,100%{ transform:translateX(0); }
          20%    { transform:translateX(-4px); }
          40%    { transform:translateX(4px); }
          60%    { transform:translateX(-3px); }
          80%    { transform:translateX(3px); }
        }
        .oos-shake { animation: oosShake 0.45s ease; }
      `}</style>

      <Header count={items.length} onClear={clearCart} />

      {/* ── OOS warning banner ── */}
      {hasOos && (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 px-5 py-4"
          style={{
            background: "rgba(139,58,58,0.10)",
            border: "1px solid rgba(139,58,58,0.35)",
          }}
        >
          <div className="flex items-start gap-3">
            {/* Warning icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4756a"
              strokeWidth="1.5" className="shrink-0 mt-[1px]">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p className="text-[12px] font-medium mb-[3px]"
                style={{ fontFamily: "'Jost', sans-serif", color: "#d4756a" }}>
                {oosItems.length === 1
                  ? `1 item is out of stock`
                  : `${oosItems.length} items are out of stock`}
              </p>
              <p className="text-[11px] leading-[1.5]"
                style={{ fontFamily: "'Jost', sans-serif", color: "#8a6f2e" }}>
                Remove {oosItems.length === 1 ? "it" : "them"} before proceeding to checkout.
              </p>
            </div>
          </div>

          <button
            onClick={removeOosItems}
            disabled={removingOos}
            className="shrink-0 flex items-center gap-2 px-4 py-[9px] text-[9px] tracking-[2px] uppercase transition-all duration-200"
            style={{
              fontFamily: "'Jost', sans-serif",
              color: removingOos ? "white" : "#d4756a",
              background: "rgba(139,58,58,0.12)",
              border: "1px solid rgba(139,58,58,0.3)",
              cursor: removingOos ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!removingOos) { e.currentTarget.style.background = "rgba(139,58,58,0.22)"; e.currentTarget.style.borderColor = "rgba(139,58,58,0.5)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,58,58,0.12)"; e.currentTarget.style.borderColor = "rgba(139,58,58,0.3)"; }}
          >
            {removingOos ? (
              <span className="inline-block w-3 h-3 border border-[#d4756a] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            )}
            Remove {oosItems.length === 1 ? "Item" : `All ${oosItems.length} Items`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0.5 items-start">

        {/* ── Left: Items ── */}
        <div className="flex flex-col gap-0.5">
          {items.map((item, idx) => {
            const { displayPrice, originalPrice, discount } = resolveCartPrice(item);
            const oos        = isOutOfStock(item);
            const isRemoving = removingId === item.id;
            /* paperback: qty+ capped at stock; ebook: no qty controls shown at all */
            const maxedOut   = item.format === "paperback" && item.quantity >= item.stock;
            const isEbook    = item.format === "ebook";

            return (
              <div key={item.id}
                className={`fade-in group flex gap-5 p-6 transition-colors duration-300 max-sm:flex-col max-sm:gap-4 ${isRemoving ? "removing" : ""}`}
                style={{
                  background: oos ? "rgba(28,28,30,0.7)" : "#1c1c1e",
                  animationDelay: `${idx * 60}ms`,
                  outline: oos ? "1px solid rgba(139,58,58,0.2)" : "none",
                }}
              >
                {/* Thumbnail */}
                <a href={`/product/${item.slug}`}
                  className="flex-shrink-0 relative overflow-hidden block"
                  style={{ width: 80, height: 112, background: "#2a2a2d", opacity: oos ? 0.5 : 1 }}>
                  {item.main_image ? (
<div className=" w-full overflow-hidden">
  <img 
    src={`${API_URL}${item.main_image}`} 
    alt={item.title}
    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
    style={{
      filter: oos ? "brightness(0.5) grayscale(0.8)" : "brightness(0.95)",
      imageRendering: "auto"
    }}
  />
</div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                  )}
                  {discount > 5 && !oos && (
                    <div className="absolute top-0 right-0 px-[6px] py-[3px] text-[7px] tracking-[1px] uppercase"
                      style={{ background: "#8b3a3a", color: "#f5f0e8", fontFamily: "'Jost', sans-serif" }}>
                      {discount}%
                    </div>
                  )}
                </a>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <a href={`/product/${item.slug}`}
                      className="block text-[17px] font-semibold leading-[1.3] mb-1 hover:text-[#c9a84c] transition-colors duration-200"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: oos ? "white" : "#f5f0e8" }}>
                      {item.title}
                    </a>

                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {/* Format badge */}
                      <span className="inline-block text-[9px] tracking-[2px] uppercase px-[8px] py-[3px]"
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          color:      isEbook ? "#c9a84c" : "white",
                          background: isEbook ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)",
                          border:     `1px solid ${isEbook ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)"}`,
                        }}>
                        {isEbook ? "E-Book" : "Paperback"}
                      </span>

                      {/* OOS badge — paperback only */}
                      {oos && (
                        <span className="inline-block text-[9px] tracking-[2px] uppercase px-[8px] py-[3px]"
                          style={{ fontFamily: "'Jost', sans-serif", color: "#d4756a",
                                   background: "rgba(139,58,58,.12)", border: "1px solid rgba(139,58,58,.3)" }}>
                          Out of Stock
                        </span>
                      )}


                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">

                    {/* ── Qty control: paperback only — hidden for ebook ── */}
                    {!isEbook ? (
                      <div className="flex items-center" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                        <button
                          onClick={() => updateQty(item, -1)}
                          disabled={updatingId === item.id || oos}
                          className="w-8 h-8 flex items-center justify-center transition-colors duration-200 disabled:opacity-40"
                          style={{ color: "white" }}
                          onMouseEnter={(e) => { if (!oos) e.currentTarget.style.color = "#c9a84c"; }}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                        >
                          {item.quantity === 1 ? (
                            /* trash icon when qty would go to 0 */
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4h6v2"/>
                            </svg>
                          ) : "−"}
                        </button>

                        <span className="w-9 text-center text-[13px]"
                          style={{ fontFamily: "'Jost', sans-serif", color: oos ? "white" : "#f5f0e8" }}>
                          {updatingId === item.id ? (
                            <span className="inline-block w-3 h-3 border border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
                          ) : item.quantity}
                        </span>

                        <button
                          onClick={() => updateQty(item, 1)}
                          disabled={updatingId === item.id || oos || maxedOut}
                          className="w-8 h-8 flex items-center justify-center text-[18px] transition-colors duration-200 disabled:opacity-40"
                          style={{ color: "white" }}
                          onMouseEnter={(e) => { if (!oos && !maxedOut) e.currentTarget.style.color = "#c9a84c"; }}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                        >+</button>
                      </div>
                    ) : (
                      /* Ebook: show a static "Qty: 1" pill instead of controls */
                      <div className="flex items-center px-3 py-1 text-[9px] tracking-[2px] uppercase"
                        style={{
                          fontFamily: "'Jost', sans-serif", color: "white",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="1.5" className="mr-[5px]">
                          <rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>
                        </svg>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      {originalPrice && (
                        <span className="text-[12px] line-through"
                          style={{ fontFamily: "'Jost', sans-serif", color: "white" }}>
                          {fmt(originalPrice * item.quantity)}
                        </span>
                      )}
                      <span className="text-[16px] font-medium"
                        style={{ fontFamily: "'Jost', sans-serif", color: oos ? "white" : "#c9a84c" }}>
                        {fmt(displayPrice * item.quantity)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={removingId === item.id}
                      className="text-[9px] tracking-[2px] uppercase transition-colors duration-200 disabled:opacity-40"
                      style={{ fontFamily: "'Jost', sans-serif", color: "#ffffff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#8b3a3a")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff")}
                    >
                      {removingId === item.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right: Summary ── */}
        <div className="flex flex-col gap-0.5 lg:sticky lg:top-6">
          <div className="p-6" style={{ background: "#1c1c1e" }}>
            <p className="text-[9px] tracking-[3px] uppercase mb-5"
              style={{ fontFamily: "'Jost', sans-serif", color: "white" }}>Order Summary</p>

            <div className="flex flex-col gap-3 mb-5">
              <SummaryRow label="Subtotal" value={fmt(subtotal)} />
              {savings > 0 && <SummaryRow label="You save" value={`−${fmt(savings)}`} accent />}
            </div>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.1)" }} />
              <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.3)" }} />
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.1)" }} />
            </div>

            <div className="flex items-baseline justify-between mb-6">
              <span className="text-[11px] tracking-[3px] uppercase"
                style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>Total</span>
              <span className="text-[22px] font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>{fmt(total)}</span>
            </div>

            {/* ── Checkout button: locked when OOS items exist ── */}
            {hasOos ? (
              <div>
                <button
                  disabled
                  className="w-full py-[14px] text-[10px] tracking-[3px] uppercase font-medium cursor-not-allowed"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    background: "rgba(80,80,80,0.25)",
                    color: "white",
                    border: "1px solid rgba(80,80,80,0.2)",
                  }}
                >
                  Checkout Unavailable
                </button>
                {/* Inline nudge under the locked button */}
                <div className="flex items-start gap-2 mt-3 px-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b3a3a"
                    strokeWidth="1.5" className="shrink-0 mt-[1px]">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[10px] leading-[1.6]"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a" }}>
                    {oosItems.length === 1
                      ? `Remove the out-of-stock item above to continue.`
                      : `Remove ${oosItems.length} out-of-stock items above to continue.`}
                  </p>
                </div>
              </div>
            ) : (
              <button
                className="w-full py-[14px] text-[10px] tracking-[3px] uppercase font-medium transition-colors duration-300"
                style={{ fontFamily: "'Jost', sans-serif", background: "#c9a84c", color: "#0a0a0b", border: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
                onClick={() => (window.location.href = "/checkout")}
              >
                Proceed to Checkout
              </button>
            )}

            <div className="flex items-center justify-center gap-4 mt-4">
              {["Secure Payment"].map((t) => (
                <span key={t} className="text-[9px] tracking-[1px]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#ffffff" }}>{t}</span>
              ))}
            </div>
          </div>

          <button
            className="py-4 text-[9px] tracking-[3px] uppercase transition-colors duration-300"
            style={{ fontFamily: "'Jost', sans-serif", color: "white", background: "transparent", border: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            onClick={() => (window.location.href = "/")}
          >← Continue Shopping</button>
        </div>
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
      <div className="max-w-[1100px] mx-auto">{children}</div>
    </div>
  );
}

function Header({ count, loading, onClear }: { count: number; loading?: boolean; onClear?: () => void }) {
  return (
    <div className="mb-8">
      <span className="block mb-2 text-[10px] tracking-[5px] uppercase"
        style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>Your Selections</span>
      <div className="flex items-end justify-between">
        <h1 className="font-light italic leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,56px)", color: "#f5f0e8" }}>
          Cart
          {!loading && count > 0 && (
            <sup className="text-[14px] ml-2 not-italic"
              style={{ color: "#c9a84c", fontFamily: "'Jost', sans-serif" }}>{count}</sup>
          )}
        </h1>
        {onClear && count > 0 && (
          <button className="text-[9px] tracking-[2px] uppercase mb-2 transition-colors duration-200"
            style={{ fontFamily: "'Jost', sans-serif", color: "#ffffff" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8b3a3a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff")}
            onClick={onClear}>Clear All</button>
        )}
      </div>
      <div className="flex items-center gap-3 mt-4 mb-8">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.3), transparent)" }} />
        <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.3)" }} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] tracking-[1px]"
        style={{ fontFamily: "'Jost', sans-serif", color: "white" }}>{label}</span>
      <span className="text-[13px]"
        style={{ fontFamily: "'Jost', sans-serif", color: accent ? "#4a9a5a" : "#f5f0e8" }}>{value}</span>
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