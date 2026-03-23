"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Book {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  main_image: string;
  stock: number;
  created_at: string;
  avg_rating: number | null;
  review_count: number;
  authors: { id: number; name: string; slug: string }[];
}

type FormatFilter = "all" | "ebook" | "physical";
type SortOption   = "bestseller" | "price_asc" | "price_desc" | "newest" | "top_rated";

const calcDisc = (p: number, s: number) => p > 0 ? Math.round(((p - s) / p) * 100) : 0;

/* ══════════════════════════════════════════════
   Toast
══════════════════════════════════════════════ */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] flex items-center gap-3 px-4 sm:px-5 py-3 uppercase tracking-[2px] whitespace-nowrap"
      style={{
        transform: "translateX(-50%)",
        background: "#1c1c1e",
        border: "1px solid rgba(212,170,78,0.3)",
        color: "#d4aa4e",
        fontFamily: "'Space Mono',monospace",
        fontSize: "10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        animation: "toastIn 0.3s ease both",
      }}
    >
      <div className="w-[6px] h-[6px] rotate-45 bg-[#d4aa4e] shrink-0" />
      {msg}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Page
══════════════════════════════════════════════ */
export default function BestSellersPage() {
  const [books,    setBooks]    = useState<Book[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [format,   setFormat]   = useState<FormatFilter>("all");
  const [sort,     setSort]     = useState<SortOption>("bestseller");
  const [cartId,   setCartId]   = useState<number | null>(null);
  const [wish,     setWish]     = useState<Set<number>>(new Set());
  const [reelIdx,  setReelIdx]  = useState(0);
  const [counting, setCounting] = useState(false);
  const [toast,    setToast]    = useState<string | null>(null);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const numbersRef   = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reelBooks    = books.slice(0, 8);

  /* ── Auto-slide ── */
  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setReelIdx(i => (i + 1) % Math.max(reelBooks.length, 1));
    }, 3200);
  }, [reelBooks.length]);

  useEffect(() => {
    if (reelBooks.length > 1) startAutoSlide();
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [reelBooks.length, startAutoSlide]);

  const manualNav = (newIdx: number) => {
    setReelIdx(newIdx);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    setTimeout(startAutoSlide, 6000);
  };

  /* ── Intersection for counters ── */
  useEffect(() => {
    if (!numbersRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !counting) setCounting(true); },
      { threshold: 0.3 }
    );
    obs.observe(numbersRef.current);
    return () => obs.disconnect();
  }, [counting]);

  /* ── Fetch ── */
  useEffect(() => {
    setLoading(true); setError(null);
    const p = new URLSearchParams({ sort, limit: "24", ...(format !== "all" && { format }) });
    fetch(`${API_URL}/api/ag-classics/bestseller?${p}`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(d => { if (d.success) setBooks(d.products ?? []); else throw new Error(d.message); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [format, sort]);

  /* ── Add to cart ── */
  const addCart = async (e: React.MouseEvent, b: Book) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to add to cart"); return; }
    if (b.stock === 0 || cartId === b.id) return;
    setCartId(b.id);
    try {
      const r = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: b.id, format: "paperback", quantity: 1 }),
      });
      if (!r.ok) throw new Error();
      window.dispatchEvent(new Event("cart-change"));
    } catch {} finally { setCartId(null); }
  };

  /* ── Toggle wishlist ── */
  const toggleWish = async (e: React.MouseEvent, b: Book) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to save to wishlist"); return; }
    const was = wish.has(b.id);
    try {
      await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        method: was ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: b.id }),
      });
      setWish(p => { const n = new Set(p); was ? n.delete(b.id) : n.add(b.id); return n; });
    } catch {}
  };

  /* ── Stars ── */
  const Stars = ({ r }: { r: number | null }) => !r ? null : (
    <span className="inline-flex gap-[2px] items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="8" height="8" viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? "#d4aa4e" : "none"} stroke="#d4aa4e" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-[9px] text-[#9a7e3a] ml-[3px]">{r.toFixed(1)}</span>
    </span>
  );

  /* ── CartBtn ── */
  const CartBtn = ({ book, size = "md" }: { book: Book; size?: "sm" | "md" | "lg" }) => {
    const oos    = book.stock === 0;
    const padCls = size === "lg" ? "px-9 py-[14px]" : size === "sm" ? "px-3 py-[7px]" : "px-[22px] py-[10px]";
    return (
      <button
        disabled={oos || cartId === book.id}
        onClick={e => addCart(e, book)}
        className={[
          "text-[8px] tracking-[2px] uppercase border-none flex items-center justify-center gap-[5px] whitespace-nowrap",
          "transition-[filter,transform] duration-200",
          padCls,
          oos ? "bg-white/5 text-[#666] cursor-not-allowed" : "cursor-pointer text-[#05040a]",
        ].join(" ")}
        style={{ fontFamily: "'Space Mono',monospace", ...(oos ? {} : { background: "linear-gradient(135deg,#d4aa4e,#a07c2a)" }) }}
        onMouseEnter={e => { if (!oos) { (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
      >
        {cartId === book.id
          ? <span className="w-[9px] h-[9px] border-[1.5px] border-[rgba(5,4,10,.25)] border-t-[#05040a] rounded-full animate-spin" />
          : oos ? "Sold Out" : "Add to Cart"}
      </button>
    );
  };

  /* ── WishBtn ── */
  const WishBtn = ({ book, sz = 34 }: { book: Book; sz?: number }) => {
    const isWL = wish.has(book.id);
    return (
      <button
        onClick={e => toggleWish(e, book)}
        className="flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-[250ms]"
        style={{
          width: `${sz}px`, height: `${sz}px`,
          background: isWL ? "rgba(212,170,78,.12)" : "rgba(255,255,255,.05)",
          border: `1px solid ${isWL ? "rgba(212,170,78,.5)" : "rgba(255,255,255,.1)"}`,
          color: isWL ? "#d4aa4e" : "#666",
        }}
        onMouseEnter={e => { if (!isWL) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,170,78,.35)"; (e.currentTarget as HTMLElement).style.color = "#d4aa4e"; } }}
        onMouseLeave={e => { if (!isWL) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)"; (e.currentTarget as HTMLElement).style.color = "#666"; } }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24"
          fill={isWL ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        :root {
          --fh:'Bebas Neue',sans-serif;
          --fs:'EB Garamond',serif;
          --fm:'Space Mono',monospace;
        }
        @keyframes heroReveal{from{opacity:0;transform:translateY(60px) skewY(1.5deg)}to{opacity:1;transform:none}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes lineExpand{from{width:0}to{width:100%}}
        @keyframes shimmer{from{background-position:-400% 0}to{background-position:400% 0}}
        @keyframes goldFlicker{0%,100%{text-shadow:0 0 20px rgba(212,170,78,.3)}50%{text-shadow:0 0 60px rgba(212,170,78,.7)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes progressBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}

        .a1{animation:heroReveal .95s cubic-bezier(.16,1,.3,1) .05s both}
        .a2{animation:heroReveal .95s cubic-bezier(.16,1,.3,1) .2s both}
        .a3{animation:heroReveal .95s cubic-bezier(.16,1,.3,1) .35s both}
        .a4{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .5s both}
        .a5{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .65s both}

        body::before{content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)' opacity='.038'/%3E%3C/svg%3E");
          opacity:.48;mix-blend-mode:soft-light;}

        /* Vault bento */
        .vi{position:relative;overflow:hidden;cursor:pointer;transition:transform .4s cubic-bezier(.16,1,.3,1);}
        .vi:hover{transform:scale(1.025);}
        .vi:hover .vi-img{filter:brightness(.42) saturate(.35)!important;}
        .vi:hover .vi-info{opacity:1!important;transform:none!important;}
        .vi-img{transition:filter .4s;filter:brightness(.74) saturate(.62);}
        .vi-info{transition:opacity .3s,transform .35s;}

        /* Rankings */
        .rr{display:grid;grid-template-columns:52px 56px 1fr auto;align-items:center;cursor:pointer;position:relative;transition:background .2s;border-bottom:1px solid rgba(212,170,78,.05);}
        .rr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#a07c2a,#7a5e1a);transform:scaleY(0);transform-origin:bottom;transition:transform .3s;}
        .rr:hover{background:rgba(212,170,78,.04)!important;}
        .rr:hover::before{transform:scaleY(1);}
        .rr:hover .rr-t{color:#d4aa4e!important;}
        .rr:hover .rr-img{filter:brightness(1) saturate(1)!important;}
        .rr:hover .rr-btns{opacity:1!important;}
        .rr-t{transition:color .25s;}
        .rr-img{transition:filter .3s;filter:brightness(.78) saturate(.58);}
        .rr-btns{transition:opacity .25s;}

        .sk{background:linear-gradient(90deg,#0e0c14 0%,rgba(212,170,78,.06) 50%,#0e0c14 100%);background-size:400% 100%;animation:shimmer 2s infinite;}

        /* Responsive */
        @media(max-width:768px){
          .hero-left{display:none!important;}
          .hero-r{padding:48px 20px!important;}
          .sect-inner{padding:0 16px!important;}
          .vault-grid{grid-template-columns:1fr 1fr!important;grid-template-rows:auto!important;}
          .vi.big{grid-column:span 1!important;grid-row:span 1!important;}
          .rr{grid-template-columns:44px 52px 1fr auto!important;}
        }
        @media(max-width:480px){
          .rr{grid-template-columns:38px 0px 1fr auto!important;}
          .rr-thumb{display:none!important;}
          .rr-author{display:none!important;}
        }
      `}</style>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-[1] min-h-screen pt-[90px] sm:pt-[130px] overflow-x-hidden text-[#f0ebe0]"
        style={{ background: "rgba(5,4,10,.9)", fontFamily: "var(--fs)" }}>

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="relative flex overflow-hidden" style={{ minHeight: "90vh" }}>

          {/* LEFT — big BEST text */}
          <div className="hero-left w-[36%] flex-shrink-0 relative flex items-center justify-center border-r border-[rgba(212,170,78,.1)]">
            <div className="absolute top-0 bottom-0 -right-px w-px"
              style={{ background: "linear-gradient(to bottom,transparent,rgba(212,170,78,.35),transparent)" }} />
            <div className="a1 text-center select-none"
              style={{ fontFamily: "var(--fh)", fontSize: "clamp(80px,12vw,180px)", lineHeight: .84, letterSpacing: "6px", color: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.22)", animation: "goldFlicker 5s ease infinite" }}>
              B<br/>E<br/>S<br/>T
            </div>
            <div className="absolute top-0 bottom-0 z-[5] pointer-events-none"
              style={{ right: "-50px", width: "100px", background: "rgba(5,4,10,.9)", clipPath: "polygon(50px 0,100% 0,100% 100%,0 100%)" }} />
          </div>

          {/* RIGHT — editorial */}
          <div className="hero-r flex-1 flex flex-col justify-center relative"
            style={{ padding: "80px 72px 80px 96px" }}>

            <div className="a2 flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-[6px] h-[6px] rotate-45 bg-[#a07c2a] shrink-0" />
              <span className="uppercase text-[#d4aa4e] tracking-[4px]"
                style={{ fontFamily: "var(--fm)", fontSize: "7px" }}>
                AG Classics — Bestsellers
              </span>
              <div className="flex-1 max-w-[72px] h-px hidden sm:block"
                style={{ background: "linear-gradient(to right,#a07c2a,transparent)" }} />
            </div>

            <h1 className="a3 uppercase mb-5 sm:mb-6"
              style={{ fontFamily: "var(--fh)", fontSize: "clamp(52px,10vw,148px)", lineHeight: .86, letterSpacing: "3px", background: "linear-gradient(155deg,#f0ebe0 25%,#d4aa4e 65%,#a07c2a 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              THE<br/>SELLERS<br/>
              <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.4)" }}>VAULT</span>
            </h1>

            <div className="a4 overflow-hidden mb-5">
              <div className="h-px" style={{ background: "linear-gradient(to right,#d4aa4e,#a07c2a,transparent)", animation: "lineExpand 1.2s ease .8s both" }} />
            </div>

            <p className="a4 italic text-[#8a8490] leading-[1.85] max-w-[420px] mb-8 sm:mb-12"
              style={{ fontFamily: "var(--fs)", fontSize: "clamp(13px,1.5vw,19px)" }}>
              Every volume here has earned its place — chosen by thousands of readers who keep coming back.
            </p>

            <div className="a5 flex gap-3 flex-col xs:flex-row flex-wrap items-start sm:items-center">
              <button
                onClick={() => document.getElementById("rankings")?.scrollIntoView({ behavior: "smooth" })}
                className="uppercase tracking-[3px] border-none text-[#05040a] cursor-pointer transition-[transform,filter] duration-200 w-full xs:w-auto"
                style={{ fontFamily: "var(--fm)", fontSize: "8px", padding: "13px 28px", background: "linear-gradient(135deg,#d4aa4e,#a07c2a)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.filter = "none"; }}>
                Explore Rankings
              </button>
              <span className="tracking-[1px] text-[rgba(212,170,78,.4)]"
                style={{ fontFamily: "var(--fm)", fontSize: "8px" }}>
                {books.length || "24"} titles ranked
              </span>
            </div>

            <div className="hidden sm:flex absolute bottom-10 right-[52px] flex-col items-end gap-[5px]">
              {[72, 48, 24, 12].map((w, i) => (
                <div key={i} className="h-px" style={{ width: `${w}px`, background: `rgba(212,170,78,${.05 + i * .07})` }} />
              ))}
            </div>
          </div>
        </section>


        {/* ── Skeleton ── */}
        {loading && (
          <div className="max-w-[1680px] mx-auto px-4 sm:px-16 py-10 sm:py-16">
            <div className="flex justify-center gap-3 mb-10 flex-wrap">
              {[300, 260, 240, 220, 200].map((h, i) => (
                <div key={i} className="sk flex-shrink-0" style={{ width: "clamp(130px,18vw,200px)", height: `${h}px` }} />
              ))}
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sk h-[68px] sm:h-[88px] mb-[2px]" style={{ animationDelay: `${i * .07}s` }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 sm:py-[120px] px-6">
            <p className="text-[#f0ebe0] mb-3 uppercase tracking-[4px]"
              style={{ fontFamily: "var(--fh)", fontSize: "clamp(24px,5vw,48px)" }}>
              SOMETHING BROKE
            </p>
            <p className="text-[#8a8490] mb-7 text-xs">{error}</p>
            <button onClick={() => window.location.reload()}
              className="uppercase tracking-[3px] px-8 py-3 bg-[#d4aa4e] text-[#05040a] border-none cursor-pointer text-[8px]"
              style={{ fontFamily: "var(--fm)" }}>Retry</button>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="text-center py-16 sm:py-[120px] px-6">
            <p className="text-[#8a8490] uppercase tracking-[3px]"
              style={{ fontFamily: "var(--fh)", fontSize: "clamp(24px,5vw,48px)" }}>
              THE VAULT IS EMPTY
            </p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (<>

          {/* ══════════════════════════════════════
              § 02 — CAROUSEL  (auto-slides every 3.2s)
          ══════════════════════════════════════ */}
          {books.length > 1 && (
            <section className="py-12 sm:py-[88px] bg-[#05040a] overflow-hidden">
              <div className="sect-inner max-w-[1680px] mx-auto px-4 sm:px-16">

                {/* Header */}
                <div className="flex items-end justify-between mb-8 sm:mb-12 flex-wrap gap-4">
                  <div>
                    <div className="uppercase text-[#d4aa4e] tracking-[5px] mb-[10px] text-[7px]"
                      style={{ fontFamily: "var(--fm)" }}>§ 02</div>
                    <h2 className="uppercase text-[#f0ebe0] leading-[.88] tracking-[3px]"
                      style={{ fontFamily: "var(--fh)", fontSize: "clamp(32px,7vw,92px)" }}>
                      The Books
                    </h2>
                    <p className="italic text-[#8a8490] mt-2 text-sm" style={{ fontFamily: "var(--fs)" }}>
                      Top picks — auto-scrolling
                    </p>
                  </div>

                  {/* Counter + arrows */}
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-[#8a8490] text-[11px] tracking-[2px] hidden sm:block"
                      style={{ fontFamily: "var(--fm)" }}>
                      {String(reelIdx + 1).padStart(2,"0")} / {String(reelBooks.length).padStart(2,"0")}
                    </span>
                    <button
                      onClick={() => manualNav(reelIdx === 0 ? reelBooks.length - 1 : reelIdx - 1)}
                      className="w-10 h-10 border border-[rgba(212,170,78,.25)] bg-transparent text-[#d4aa4e] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[rgba(212,170,78,.08)] hover:border-[rgba(212,170,78,.6)]"
                      style={{ fontFamily: "var(--fm)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button
                      onClick={() => manualNav(reelIdx === reelBooks.length - 1 ? 0 : reelIdx + 1)}
                      className="w-10 h-10 border border-[rgba(212,170,78,.25)] bg-transparent text-[#d4aa4e] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[rgba(212,170,78,.08)] hover:border-[rgba(212,170,78,.6)]"
                      style={{ fontFamily: "var(--fm)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>

                {/* ── Sliding carousel viewport ── */}
                <div className="relative overflow-hidden">
                  {/* Edge fade masks */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none"
                    style={{ background: "linear-gradient(to right,#05040a,transparent)" }} />
                  <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none"
                    style={{ background: "linear-gradient(to left,#05040a,transparent)" }} />

                  {/* Slide track — translates by card-width * reelIdx */}
                  <div
                    className="flex gap-3 sm:gap-4 pb-2"
                    style={{
                      transform: `translateX(calc(-${reelIdx} * (min(260px, 44vw) + 16px)))`,
                      transition: "transform 0.55s cubic-bezier(.16,1,.3,1)",
                      willChange: "transform",
                    }}
                  >
                    {reelBooks.map((book, i) => {
                      const isActive = i === reelIdx;
                      const d = calcDisc(book.price, book.sell_price);
                      return (
                        <div
                          key={book.id}
                          className="relative flex-shrink-0 overflow-hidden cursor-pointer group"
                          style={{
                            width:  "min(260px, 44vw)",
                            height: "min(380px, 64vw)",
                            border: `1px solid ${isActive ? "rgba(212,170,78,.4)" : "rgba(212,170,78,.08)"}`,
                            background: "#181520",
                            transition: "border-color .4s, transform .4s, box-shadow .4s",
                            transform: isActive ? "scale(1.03)" : "scale(0.97)",
                            boxShadow: isActive ? "0 24px 64px rgba(0,0,0,.7), 0 0 40px rgba(212,170,78,.08)" : "none",
                          }}
                          onClick={() => { if (!isActive) manualNav(i); else window.location.href = `/product/${book.slug}`; }}
                        >
                          {/* Rank badge */}
                          <div
                            className="absolute top-3 left-3 z-[10] leading-none select-none"
                            style={{
                              fontFamily: "var(--fh)",
                              fontSize: "clamp(32px,6vw,56px)",
                              color: "transparent",
                              WebkitTextStroke: `1px rgba(212,170,78,${isActive ? .7 : .25})`,
                              letterSpacing: "-2px",
                              transition: "opacity .4s",
                            }}>
                            {String(i + 1).padStart(2, "0")}
                          </div>

                          {/* Active top-bar accent */}
                          {isActive && (
                            <div className="absolute top-0 left-0 right-0 h-[2px] z-[11]"
                              style={{ background: "linear-gradient(to right,transparent,#d4aa4e,transparent)" }} />
                          )}

                          {/* Cover image */}
                          {book.main_image
                            ? <img
                                src={`${API_URL}${book.main_image}`} alt={book.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                  filter: isActive ? "brightness(.72) saturate(.7)" : "brightness(.5) saturate(.3)",
                                  transition: "filter .5s",
                                }}
                              />
                            : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#221f2c,#181520)" }} />
                          }

                          {/* Gradient overlay + info */}
                          <div
                            className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5"
                            style={{
                              background: "linear-gradient(to top,rgba(5,4,10,.98) 0%,rgba(5,4,10,.6) 50%,rgba(5,4,10,.05) 100%)",
                              opacity: isActive ? 1 : 0,
                              transition: "opacity .4s",
                            }}
                          >
                            {book.authors?.[0] && (
                              <p className="uppercase text-[#a07c2a] tracking-[2px] mb-[5px] truncate"
                                style={{ fontFamily: "var(--fm)", fontSize: "7px" }}>
                                {book.authors[0].name}
                              </p>
                            )}
                            <h3 className="font-bold text-[#f0ebe0] leading-[1.2] mb-2 line-clamp-2"
                              style={{ fontFamily: "var(--fs)", fontSize: "clamp(14px,1.6vw,18px)" }}>
                              {book.title}
                            </h3>
                            <div className="mb-2"><Stars r={book.avg_rating} /></div>
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              <span className="font-bold text-[#d4aa4e]"
                                style={{ fontFamily: "var(--fm)", fontSize: "15px" }}>
                                ₹{parseFloat(String(book.sell_price)).toFixed(0)}
                              </span>
                              {d > 0 && (
                                <>
                                  <span className="text-[10px] line-through text-[#8a8490]"
                                    style={{ fontFamily: "var(--fm)" }}>
                                    ₹{parseFloat(String(book.price)).toFixed(0)}
                                  </span>
                                  <span className="px-[6px] py-[2px] text-[#c07070]"
                                    style={{ fontFamily: "var(--fm)", fontSize: "8px", background: "rgba(139,58,58,.22)" }}>
                                    {d}% Off
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Action buttons — always visible on active card */}
                            <div className="flex gap-2">
                              <CartBtn book={book} size="sm" />
                              <WishBtn book={book} sz={34} />
                            </div>
                          </div>

                          {/* Minimal title overlay for inactive cards */}
                          {!isActive && (
                            <div className="absolute bottom-0 left-0 right-0 p-3"
                              style={{ background: "linear-gradient(to top,rgba(5,4,10,.9),transparent)" }}>
                              <p className="text-[#8a8490] truncate text-[11px]"
                                style={{ fontFamily: "var(--fs)" }}>
                                {book.title}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar + dots */}
                <div className="flex items-center gap-4 mt-6 sm:mt-8">
                  {/* Animated progress bar */}
                  <div className="flex-1 h-px bg-[rgba(212,170,78,.1)] relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#d4aa4e] transition-all duration-[3200ms] ease-linear"
                      style={{
                        width: "100%",
                        transformOrigin: "left",
                        animation: "progressBar 3.2s linear infinite",
                      }}
                    />
                  </div>
                  {/* Dots */}
                  <div className="flex gap-[6px] flex-shrink-0">
                    {reelBooks.map((_, i) => (
                      <button key={i} onClick={() => manualNav(i)}
                        className="h-[5px] border-none cursor-pointer p-0 transition-all duration-300"
                        style={{
                          width: reelIdx === i ? "22px" : "5px",
                          background: reelIdx === i ? "#d4aa4e" : "rgba(212,170,78,.2)",
                        }} />
                    ))}
                  </div>
                </div>

              </div>
            </section>
          )}


          {books.length >= 9 && (
            <section className="py-12 sm:py-[88px] bg-[#0e0c14]">
              <div className="sect-inner max-w-[1680px] mx-auto px-4 sm:px-16">
                <div className="mb-8 sm:mb-12">
                  <div className="uppercase text-[#d4aa4e] tracking-[5px] mb-[10px] text-[7px]"
                    style={{ fontFamily: "var(--fm)" }}>§ 03</div>
                  <h2 className="uppercase text-[#f0ebe0] leading-[.88] tracking-[3px]"
                    style={{ fontFamily: "var(--fh)", fontSize: "clamp(32px,7vw,92px)" }}>
                    The Vault
                  </h2>
                  <p className="italic text-[#8a8490] mt-2 text-sm" style={{ fontFamily: "var(--fs)" }}>
                    Every title worth owning
                  </p>
                </div>

                <div className="vault-grid gap-[5px] sm:gap-[6px]"
                  style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gridTemplateRows: "280px 200px 240px" }}>
                  {books.slice(0, 10).map((book, i) => {
                    const spans = [
                      { cs: 2, rs: 2 }, { cs: 1, rs: 1 }, { cs: 1, rs: 1 },
                      { cs: 1, rs: 1 }, { cs: 1, rs: 1 }, { cs: 1, rs: 1 },
                      { cs: 2, rs: 1 }, { cs: 1, rs: 1 }, { cs: 2, rs: 1 },
                    ];
                    const sp = spans[i] || { cs: 1, rs: 1 };
                    const d  = calcDisc(book.price, book.sell_price);
                    return (
                      <div key={book.id}
                        className="vi big border border-[rgba(212,170,78,.07)] bg-[#181520]"
                        style={{ gridColumn: `span ${sp.cs}`, gridRow: `span ${sp.rs}` }}
                        onClick={() => (window.location.href = `/product/${book.slug}`)}>
                        <div className="absolute top-2 left-[10px] z-[10] leading-none select-none"
                          style={{ fontFamily: "var(--fh)", fontSize: sp.rs > 1 ? "52px" : "32px", color: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.28)" }}>
                          {i + 1}
                        </div>
                        {book.main_image
                          ? <img className="vi-img absolute inset-0 w-full h-full object-cover"
                              src={`${API_URL}${book.main_image}`} alt={book.title} />
                          : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#221f2c,#181520)" }} />
                        }
                        <div className="vi-info absolute inset-0 flex flex-col justify-end p-3 sm:p-[14px]"
                          style={{ opacity: 0, transform: "translateY(6px)", background: "linear-gradient(to top,rgba(5,4,10,.97) 0%,rgba(5,4,10,.65) 50%,rgba(5,4,10,.12) 100%)" }}>
                          {book.authors?.[0] && (
                            <p className="uppercase text-[#a07c2a] tracking-[2px] mb-[3px] truncate text-[7px]"
                              style={{ fontFamily: "var(--fm)" }}>
                              {book.authors[0].name}
                            </p>
                          )}
                          <h3 className="font-bold text-[#f0ebe0] leading-[1.2] mb-[6px] line-clamp-2"
                            style={{ fontFamily: "var(--fs)", fontSize: sp.cs > 1 ? "16px" : "13px" }}>
                            {book.title}
                          </h3>
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                            <span className="font-bold text-[#d4aa4e]"
                              style={{ fontFamily: "var(--fm)", fontSize: "13px" }}>
                              ₹{parseFloat(String(book.sell_price)).toFixed(0)}
                            </span>
                            {d > 0 && (
                              <span className="px-[6px] py-[2px] text-[#c07070] text-[7px]"
                                style={{ fontFamily: "var(--fm)", background: "rgba(139,58,58,.2)" }}>
                                {d}%
                              </span>
                            )}
                          </div>
                          <div className="flex gap-[6px]">
                            <CartBtn book={book} size="sm" />
                            <WishBtn book={book} sz={30} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}


          {/* ══════════════════════════════════════
              § 05 — FULL RANKINGS
          ══════════════════════════════════════ */}
          {books.length > 3 && (
            <section id="rankings" className="py-12 sm:py-[88px] bg-[#0e0c14]">
              <div className="sect-inner max-w-[1680px] mx-auto px-4 sm:px-16">
                <div className="flex items-end justify-between mb-8 sm:mb-12 flex-wrap gap-4">
                  <div>
                    <h2 className="uppercase text-[#f0ebe0] leading-[.88] tracking-[3px]"
                      style={{ fontFamily: "var(--fh)", fontSize: "clamp(32px,7vw,92px)" }}>
                      Full Rankings
                    </h2>
                  </div>
                  <p className="hidden sm:block italic text-white max-w-[260px] text-right text-lg"
                    style={{ fontFamily: "var(--fs)" }}>
                    Ranked by community votes, sales velocity, and editorial merit
                  </p>
                </div>

                {/* Header row */}
                <div className="rr py-[10px] pr-4 border-b border-[rgba(212,170,78,.15)] mb-[2px]"
                  style={{ background: "rgba(212,170,78,.025)" }}>
                  {["Rank", "", "Title", "Price"].map((h, i) => (
                    <div key={i} className="uppercase tracking-[3px] text-[rgba(230, 171, 43, 0.13)] text-xs"
                      style={{ fontFamily: "var(--fm)", textAlign: i === 0 ? "center" : i === 3 ? "right" : "left", paddingLeft: i === 2 ? "10px" : 0, paddingRight: i === 3 ? "10px" : 0 }}>
                      {h}
                    </div>
                  ))}
                </div>

                <div className="border border-[rgba(212,170,78,.08)] border-t-0">
                  {books.map((book, idx) => {
                    const rank  = idx + 1;
                    const d     = calcDisc(book.price, book.sell_price);
                    const oos   = book.stock === 0;
                    const isNew = new Date(book.created_at) > new Date(Date.now() - 30 * 864e5);
                    return (
                      <div key={book.id} className="rr"
                        style={{ background: rank % 2 === 0 ? "rgba(253, 253, 253, 0.01)" : "transparent" }}
                        onClick={() => (window.location.href = `/product/${book.slug}`)}>

                        {/* Rank */}
                        <div className="flex items-center justify-center py-4 sm:py-5 border-r border-[rgba(212,170,78,.06)] relative">
                          <span className="rr-n leading-none select-none"
                            style={{ fontFamily: "var(--fh)", fontSize:  "28px" , color: "rgba(212,170,78,.65)", letterSpacing: "-1px" }}>
                            {String(rank).padStart(2, "0")}
                          </span>
                          {rank <= 3 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[14px] h-px bg-[#d4aa4e] opacity-35" />}
                        </div>

                        {/* Thumbnail */}
                        <div className="rr-thumb py-[10px] pl-2 sm:pl-[14px]">
                          <div className="w-10 sm:w-22 h-[52px] sm:h-34 overflow-hidden">
                            {book.main_image
                              ? <img className="rr-img w-full h-full object-cover" src={`${API_URL}${book.main_image}`} alt={book.title} />
                              : <div className="w-full h-full bg-[#181520]" />
                            }
                          </div>
                        </div>

                        {/* Info */}
                        <div className="py-3 px-10 sm:px-17 min-w-0">
                          {book.authors?.[0] && (
                            <p className="rr-author uppercase text-[#7a5e1a] tracking-[2px] mb-[3px] truncate text-xs"
                              style={{ fontFamily: "var(--fm)" }}>
                              {book.authors[0].name}
                            </p>
                          )}
                          <h3 className="rr-t font-bold text-[#f0ebe0] leading-[1.25] mb-[5px] text-ms truncate"
                            style={{ fontFamily: "var(--fs)" }}>
                            {book.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Stars r={book.avg_rating} />
                            {book.review_count > 0 && (
                              <span className="hidden sm:inline text-[#8a8490] text-[8px]"
                                style={{ fontFamily: "var(--fm)" }}>
                                {book.review_count}r
                              </span>
                            )}

                            {oos && (
                              <span className="uppercase tracking-[2px] px-[6px] py-[2px] text-[#8a8490] text-[6px]"
                                style={{ fontFamily: "var(--fm)", background: "rgba(100,100,105,.2)" }}>Sold Out</span>
                            )}
                          </div>
                        </div>

                        {/* Price + actions */}
                        <div className="py-3 px-2 sm:px-5 flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="font-bold text-[#d4aa4e]"
                              style={{ fontFamily: "var(--fm)", fontSize: "clamp(11px,1vw,15px)" }}>
                              ₹{parseFloat(String(book.sell_price)).toFixed(0)}
                            </div>
                            {d > 0 && (
                              <div className="flex items-center gap-1 justify-end mt-[2px]">
                                <span className="text-[9px] line-through text-[#8a8490]">₹{parseFloat(String(book.price)).toFixed(0)}</span>
                                <span className="px-[5px] py-[1px] text-[#c07070] text-[7px]"
                                  style={{ fontFamily: "var(--fm)", background: "rgba(139,58,58,.15)" }}>
                                  {d}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="rr-btns flex gap-[4px] opacity-0">
                            <CartBtn book={book} size="sm" />
                            <WishBtn book={book} sz={28} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}


          {/* ══════════════════════════════════════
              EDITORIAL CLOSE
          ══════════════════════════════════════ */}
          <section className="relative overflow-hidden px-4 sm:px-16 py-12 sm:py-[88px] bg-[#05040a] border-t border-[rgba(212,170,78,.1)]">
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(to right,transparent,#a07c2a,transparent)" }} />

            <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-8 sm:gap-12 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <div className="leading-[.88] mb-5 uppercase"
                  style={{ fontFamily: "var(--fh)", fontSize: "clamp(26px,5vw,68px)", letterSpacing: "2px", color: "transparent", WebkitTextStroke: "1px rgba(233,171,36,.79)" }}>
                  The Archive<br/>Never Closes
                </div>
                <p className="italic leading-[1.75] max-w-[520px] text-white/90"
                  style={{ fontFamily: "var(--fs)", fontSize: "clamp(14px,1.8vw,22px)" }}>
                  "Not all readers are leaders, but all leaders are readers."
                </p>
                <span className="block mt-3 uppercase tracking-[4px] text-[#7a5e1a] text-[8px]"
                  style={{ fontFamily: "var(--fm)" }}>
                  — Harry S. Truman
                </span>
              </div>

              {/* Diamond ornament */}
              <div className="hidden sm:flex flex-col items-center gap-2">
                <div className="w-px h-[60px]"
                  style={{ background: "linear-gradient(to bottom,transparent,rgba(201,168,76,.6))" }} />
                <div className="w-12 h-12 border border-[rgba(201,168,76,.5)] rotate-45 relative">
                  <div className="absolute inset-2 border border-[rgba(201,168,76,.25)]" />
                </div>
                <div className="w-px h-[60px]"
                  style={{ background: "linear-gradient(to bottom,rgba(201,168,76,.6),transparent)" }} />
              </div>
            </div>

            <div className="max-w-[1680px] mx-auto mt-8 sm:mt-12 flex items-center justify-between border-t border-[rgba(212,170,78,.08)] pt-5 flex-wrap gap-3">
              <span className="uppercase tracking-[2px] text-white/60 text-[7px]"
                style={{ fontFamily: "var(--fm)" }}>
                AG Classics · Best Sellers · Updated Live
              </span>
              <div className="flex gap-[5px]">
                {[.07, .16, .32, .55, .32, .16, .07].map((o, i) => (
                  <div key={i} className="w-1 h-1 rotate-45"
                    style={{ background: `rgba(212,170,78,${o})` }} />
                ))}
              </div>
            </div>
          </section>

        </>)}
      </div>
    </>
  );
}