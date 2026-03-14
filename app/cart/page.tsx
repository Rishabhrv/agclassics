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
  stock: number;
  product_type: string;
}

const fmt  = (n: number) => `₹${parseFloat(String(n)).toFixed(0)}`;
const disc = (price: number, sell: number) =>
  price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

/** Ebooks have unlimited stock — stock check only applies to paperback */
const isPaperback = (item: CartItem) => item.format === "paperback";
/** True when a physical item has no stock left */
const isOutOfStock = (item: CartItem) =>
  isPaperback(item) && item.stock === 0;

export default function CartPage() {
  const [items, setItems]         = useState<CartItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [coupon, setCoupon]         = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  /* ── fetch cart ── */
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

  /* ── update quantity ──
     For paperback: enforce stock ceiling.
     For ebook: no upper bound.  */
  const updateQty = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return removeItem(item.id);

    // Don't exceed stock for physical items
    if (isPaperback(item) && newQty > item.stock) return;

    setUpdatingId(item.id);
    try {
      await fetch(`${API_URL}/api/ag-classics/cart/${item.id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ quantity: newQty }),
      });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i));
    } finally { setUpdatingId(null); }
  };

  /* ── remove item ── */
  const removeItem = async (id: number) => {
    setRemovingId(id);
    try {
      await fetch(`${API_URL}/api/ag-classics/cart/${id}`, { method: "DELETE", headers });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally { setRemovingId(null); }
  };

  /* ── clear cart ── */
  const clearCart = async () => {
    await fetch(`${API_URL}/api/ag-classics/cart`, { method: "DELETE", headers });
    setItems([]);
  };

  /* ── totals ── */
  const subtotal = items.reduce((s, i) => s + i.sell_price * i.quantity, 0);
  const savings  = items.reduce((s, i) => s + (i.price - i.sell_price) * i.quantity, 0);
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const total    = subtotal + shipping;

  /* ── skeleton ── */
  if (loading) {
    return (
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
  }

  if (error) {
    return (
      <PageWrap>
        <div className="flex flex-col items-center gap-4 py-32 text-center">
          <p className="text-[28px] font-light italic"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
            Something went wrong
          </p>
          <p className="text-sm" style={{ color: "#6b6b70" }}>{error}</p>
          <GoldBtn onClick={fetchCart}>Retry</GoldBtn>
        </div>
      </PageWrap>
    );
  }

  if (items.length === 0) {
    return (
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
            style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
            Discover our curated collection of timeless literature and add your favourites.
          </p>
          <GoldBtn onClick={() => (window.location.href = "/")}>Browse Collection</GoldBtn>
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <style>{`
        @keyframes slideOut {
          to { opacity: 0; transform: translateX(20px); max-height: 0; padding: 0; }
        }
        .removing { animation: slideOut 0.3s ease forwards; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease both; }
      `}</style>

      <Header count={items.length} onClear={clearCart} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0.5 items-start">

        {/* ── Left: Items ── */}
        <div className="flex flex-col gap-0.5">
          {items.map((item, idx) => {
            const d          = disc(item.price, item.sell_price);
            const oos        = isOutOfStock(item);
            const isRemoving = removingId === item.id;
            /* Ebook: qty+ is always allowed. Paperback: cap at stock */
            const maxedOut   = isPaperback(item) && item.quantity >= item.stock;

            return (
              <div
                key={item.id}
                className={`fade-in group flex gap-5 p-6 transition-colors duration-300 max-sm:flex-col max-sm:gap-4 ${isRemoving ? "removing" : ""}`}
                style={{ background: "#1c1c1e", animationDelay: `${idx * 60}ms` }}
              >
                {/* Thumbnail */}
                <a href={`/product/${item.slug}`}
                  className="flex-shrink-0 relative overflow-hidden block"
                  style={{ width: 80, height: 112, background: "#2a2a2d" }}>
                  {item.main_image ? (
                    <img
                      src={`${API_URL}${item.main_image}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: "brightness(0.9)" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                  )}
                  {d > 5 && (
                    <div className="absolute top-0 right-0 px-[6px] py-[3px] text-[7px] tracking-[1px] uppercase"
                      style={{ background: "#8b3a3a", color: "#f5f0e8", fontFamily: "'Jost', sans-serif" }}>
                      {d}%
                    </div>
                  )}
                </a>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <a href={`/product/${item.slug}`}
                      className="block text-[17px] font-semibold leading-[1.3] mb-1 hover:text-[#c9a84c] transition-colors duration-200"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
                      {item.title}
                    </a>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {/* Format badge */}
                      <span className="inline-block text-[9px] tracking-[2px] uppercase px-[8px] py-[3px]"
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          color: item.format === "ebook" ? "#c9a84c" : "#6b6b70",
                          background: item.format === "ebook" ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${item.format === "ebook" ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)"}`,
                        }}>
                        {item.format}
                      </span>

                      {/* Out-of-stock warning — paperback only */}
                      {oos && (
                        <span className="inline-block text-[9px] tracking-[2px] uppercase px-[8px] py-[3px]"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            color: "#d4756a",
                            background: "rgba(139,58,58,.12)",
                            border: "1px solid rgba(139,58,58,.3)",
                          }}>
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Qty control */}
                    <div className="flex items-center gap-0" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <button
                        onClick={() => updateQty(item, -1)}
                        disabled={updatingId === item.id}
                        className="w-8 h-8 flex items-center justify-center text-[16px] transition-colors duration-200 disabled:opacity-40"
                        style={{ color: "#6b6b70", fontFamily: "'Jost', sans-serif" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b70")}
                      >
                        {item.quantity === 1 ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        ) : "−"}
                      </button>

                      <span className="w-9 text-center text-[13px]"
                        style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>
                        {updatingId === item.id ? (
                          <span className="inline-block w-3 h-3 border border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
                        ) : item.quantity}
                      </span>

                      {/* + button: disabled for paperback when at stock limit or OOS */}
                      <button
                        onClick={() => updateQty(item, 1)}
                        disabled={updatingId === item.id || oos || maxedOut}
                        className="w-8 h-8 flex items-center justify-center text-[18px] transition-colors duration-200 disabled:opacity-40"
                        style={{ color: "#6b6b70", fontFamily: "'Jost', sans-serif" }}
                        onMouseEnter={(e) => { if (!oos && !maxedOut) e.currentTarget.style.color = "#c9a84c"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b70")}
                      >+</button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      {d > 0 && (
                        <span className="text-[12px] line-through"
                          style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                          {fmt(item.price * item.quantity)}
                        </span>
                      )}
                      <span className="text-[16px] font-medium"
                        style={{ fontFamily: "'Jost', sans-serif", color: oos ? "#6b6b70" : "#c9a84c" }}>
                        {fmt(item.sell_price * item.quantity)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[9px] tracking-[2px] uppercase transition-colors duration-200"
                      style={{ fontFamily: "'Jost', sans-serif", color: "#3a3a3e" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#8b3a3a")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3e")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right: Summary ── */}
        <div className="flex flex-col gap-0.5 lg:sticky lg:top-6">

          {/* Order summary */}
          <div className="p-6" style={{ background: "#1c1c1e" }}>
            <p className="text-[9px] tracking-[3px] uppercase mb-5"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>Order Summary</p>

            <div className="flex flex-col gap-3 mb-5">
              <SummaryRow label="Subtotal" value={fmt(subtotal)} />
              {savings > 0 && <SummaryRow label="You save" value={`−${fmt(savings)}`} accent />}
            </div>

            {/* Divider */}
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

            <button
              className="w-full py-[14px] text-[10px] tracking-[3px] uppercase font-medium transition-colors duration-300"
              style={{ fontFamily: "'Jost', sans-serif", background: "#c9a84c", color: "#0a0a0b", border: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
              onClick={() => (window.location.href = "/checkout")}
            >
              Proceed to Checkout
            </button>

            <div className="flex items-center justify-center gap-4 mt-4">
              {["Secure Payment", "Easy Returns"].map((t) => (
                <span key={t} className="text-[9px] tracking-[1px]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#3a3a3e" }}>{t}</span>
              ))}
            </div>
          </div>

          <button
            className="py-4 text-[9px] tracking-[3px] uppercase transition-colors duration-300"
            style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70", background: "transparent", border: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b70")}
            onClick={() => (window.location.href = "/")}
          >← Continue Shopping</button>
        </div>
      </div>

      <Ornament />
    </PageWrap>
  );
}

/* ═══════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════ */
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
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 56px)", color: "#f5f0e8" }}>
          Cart
          {!loading && count > 0 && (
            <sup className="text-[14px] ml-2 not-italic"
              style={{ color: "#c9a84c", fontFamily: "'Jost', sans-serif" }}>{count}</sup>
          )}
        </h1>
        {onClear && count > 0 && (
          <button className="text-[9px] tracking-[2px] uppercase mb-2 transition-colors duration-200"
            style={{ fontFamily: "'Jost', sans-serif", color: "#3a3a3e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8b3a3a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3e")}
            onClick={onClear}>Clear All</button>
        )}
      </div>
      <div className="flex items-center gap-3 mt-4 mb-8">
        <div className="flex-1 h-px"
          style={{ background: "linear-gradient(to right, rgba(201,168,76,0.3), transparent)" }} />
        <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.3)" }} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] tracking-[1px]"
        style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>{label}</span>
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
      <div className="flex-1 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }} />
      <div className="w-[5px] h-[5px] rotate-45 flex-shrink-0" style={{ background: "rgba(201,168,76,0.25)" }} />
      <div className="flex-1 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }} />
    </div>
  );
}