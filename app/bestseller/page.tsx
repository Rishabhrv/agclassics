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

const disc = (p: number, s: number) => p > 0 ? Math.round(((p - s) / p) * 100) : 0;

interface Node { x: number; y: number; vx: number; vy: number; }

export default function BestSellersPage() {
  const [books,    setBooks]    = useState<Book[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [format,   setFormat]   = useState<FormatFilter>("all");
  const [sort,     setSort]     = useState<SortOption>("bestseller");
  const [cartId,   setCartId]   = useState<number | null>(null);
  const [wish,     setWish]     = useState<Set<number>>(new Set());
  const [reelIdx,  setReelIdx]  = useState(0);
  const [counts,   setCounts]   = useState({ titles: 10, reviews: 1000, authors: 2500, readers: 10000 });
  const [counting, setCounting] = useState(false);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const nodesRef   = useRef<Node[]>([]);
  const rafRef     = useRef<number>(0);
  const numbersRef = useRef<HTMLDivElement>(null);




  /* ── intersection observer for counters ── */
  useEffect(() => {
    if (!numbersRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !counting) setCounting(true); }, { threshold: 0.3 });
    obs.observe(numbersRef.current);
    return () => obs.disconnect();
  }, [counting]);

  useEffect(() => {
    if (!counting) return;
    const targets = {
      titles: books.length || 24,
      reviews: Math.floor(books.reduce((a, b) => a + b.review_count, 0)) || 820,
      authors: new Set(books.flatMap(b => b.authors.map(a => a.id))).size || 38,
      readers: 14200,
    };
    const dur = 1800, step = 16; let elapsed = 0;
    const id = setInterval(() => {
      elapsed += step;
      const t = Math.min(elapsed / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCounts({ titles: Math.round(targets.titles * ease), reviews: Math.round(targets.reviews * ease), authors: Math.round(targets.authors * ease), readers: Math.round(targets.readers * ease) });
      if (t >= 1) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [counting, books]);

  /* ── fetch ── */
  useEffect(() => {
    setLoading(true); setError(null);
    const p = new URLSearchParams({ sort, limit: "24", ...(format !== "all" && { format }) });
    fetch(`${API_URL}/api/ag-classics/bestseller?${p}`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(d => { if (d.success) setBooks(d.products ?? []); else throw new Error(d.message); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [format, sort]);

  const addCart = async (e: React.MouseEvent, b: Book) => {
    e.stopPropagation(); if (b.stock === 0 || cartId === b.id) return;
    setCartId(b.id);
    try {
      const r = await fetch(`${API_URL}/api/ag-classics/cart`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify({ product_id: b.id, format: "paperback", quantity: 1 }) });
      if (!r.ok) throw new Error(); window.dispatchEvent(new Event("cart-change"));
    } catch {} finally { setCartId(null); }
  };

  const toggleWish = async (e: React.MouseEvent, b: Book) => {
    e.stopPropagation(); const was = wish.has(b.id);
    try {
      await fetch(`${API_URL}/api/ag-classics/wishlist`, { method: was ? "DELETE" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify({ product_id: b.id }) });
      setWish(p => { const n = new Set(p); was ? n.delete(b.id) : n.add(b.id); return n; });
    } catch {}
  };

  const Stars = ({ r }: { r: number | null }) => !r ? null : (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="8" height="8" viewBox="0 0 24 24" fill={i <= Math.round(r) ? "#d4aa4e" : "none"} stroke="#d4aa4e" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: "9px", color: "#9a7e3a", marginLeft: "3px" }}>{r.toFixed(1)}</span>
    </span>
  );

  const CartBtn = ({ book, size = "md" }: { book: Book; size?: "sm" | "md" | "lg" }) => {
    const oos = book.stock === 0;
    const pad = size === "lg" ? "14px 36px" : size === "sm" ? "8px 14px" : "10px 22px";
    const fs  = size === "sm" ? "7px" : "8px";
    return (
      <button disabled={oos || cartId === book.id} onClick={e => addCart(e, book)}
        style={{ fontFamily: "'Space Mono',monospace", fontSize: fs, letterSpacing: "2px", textTransform: "uppercase", padding: pad, border: "none", background: oos ? "rgba(255,255,255,.05)" : "linear-gradient(135deg,#d4aa4e,#a07c2a)", color: oos ? "#666" : "#05040a", cursor: oos ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "filter .2s, transform .2s", whiteSpace: "nowrap" }}
        onMouseEnter={e => { if (!oos) { (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
        {cartId === book.id ? <span style={{ width: "9px", height: "9px", border: "1.5px solid rgba(5,4,10,.25)", borderTopColor: "#05040a", borderRadius: "50%", animation: "spin .6s linear infinite", display: "inline-block" }} /> : oos ? "Sold Out" : "Add to Cart"}
      </button>
    );
  };

  const WishBtn = ({ book, sz = 36 }: { book: Book; sz?: number }) => {
    const isWL = wish.has(book.id);
    return (
      <button onClick={e => toggleWish(e, book)}
        style={{ width: `${sz}px`, height: `${sz}px`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isWL ? "rgba(212,170,78,.12)" : "rgba(255,255,255,.05)", border: `1px solid ${isWL ? "rgba(212,170,78,.5)" : "rgba(255,255,255,.1)"}`, cursor: "pointer", color: isWL ? "#d4aa4e" : "#666", transition: "all .25s" }}
        onMouseEnter={e => { if (!isWL) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,170,78,.35)"; (e.currentTarget as HTMLElement).style.color = "#d4aa4e"; } }}
        onMouseLeave={e => { if (!isWL) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)"; (e.currentTarget as HTMLElement).style.color = "#666"; } }}>
        <svg width={sz > 40 ? 14 : 11} height={sz > 40 ? 14 : 11} viewBox="0 0 24 24" fill={isWL ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  };

  const reelBooks = books.slice(0, 8);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        :root {
          --void:#05040a; --void2:#0e0c14; --void3:#181520; --void4:#221f2c;
          --gold:#d4aa4e; --gold2:#a07c2a; --gold3:#7a5e1a;
          --cream:#f0ebe0; --fog:#8a8490;
          --fh:'Bebas Neue',sans-serif; --fs:'EB Garamond',serif; --fm:'Space Mono',monospace;
        }
        @keyframes heroReveal{from{opacity:0;transform:translateY(60px) skewY(1.5deg)}to{opacity:1;transform:none}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes lineExpand{from{width:0}to{width:100%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:.9}}
        @keyframes marqueeLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes shimmer{from{background-position:-400% 0}to{background-position:400% 0}}
        @keyframes goldFlicker{0%,100%{text-shadow:0 0 20px rgba(212,170,78,.3)}50%{text-shadow:0 0 60px rgba(212,170,78,.7),0 0 120px rgba(212,170,78,.2)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

        .a1{animation:heroReveal .95s cubic-bezier(.16,1,.3,1) .05s both}
        .a2{animation:heroReveal .95s cubic-bezier(.16,1,.3,1) .2s both}
        .a3{animation:heroReveal .95s cubic-bezier(.16,1,.3,1) .35s both}
        .a4{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .5s both}
        .a5{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .65s both}

        body::before{content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)' opacity='.038'/%3E%3C/svg%3E");
          opacity:.48;mix-blend-mode:soft-light;}

        /* crown */
        .crown-cover{transition:transform .7s cubic-bezier(.16,1,.3,1),filter .6s ease;}
        .crown-wrap:hover .crown-cover{transform:scale(1.04);filter:brightness(.45) saturate(.35)!important;}
        .crown-wrap:hover .crown-reveal{opacity:1!important;}

        /* reel */
        .reel-card{transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .5s ease,filter .5s ease,box-shadow .5s ease;cursor:pointer;flex-shrink:0;position:relative;overflow:hidden;}
        .reel-card.rc{transform:scale(1.09) translateY(-14px);box-shadow:0 44px 88px rgba(0,0,0,.88),0 0 60px rgba(212,170,78,.1);z-index:10;}
        .reel-card.rs1{transform:scale(.9) translateY(10px);opacity:.72;filter:saturate(.45) brightness(.85);}
        .reel-card.rs2{transform:scale(.78) translateY(20px);opacity:.45;filter:saturate(.25) brightness(.7);}
        .reel-card.rh{transform:scale(.65) translateY(30px);opacity:.2;filter:saturate(.1);}
        .reel-card:hover .reel-overlay{opacity:1!important;}
        .reel-card:hover .reel-acts{opacity:1!important;transform:translateY(0)!important;}

        /* vault */
        .vi{position:relative;overflow:hidden;cursor:pointer;transition:transform .4s cubic-bezier(.16,1,.3,1);}
        .vi:hover{transform:scale(1.025);}
        .vi:hover .vi-img{filter:brightness(.42) saturate(.35)!important;}
        .vi:hover .vi-info{opacity:1!important;transform:none!important;}
        .vi-img{transition:filter .4s ease;filter:brightness(.74) saturate(.62);}
        .vi-info{transition:opacity .3s,transform .35s;}

        /* rank rows */
        .rr{display:grid;grid-template-columns:88px 68px 1fr auto;align-items:center;cursor:pointer;position:relative;transition:background .2s;border-bottom:1px solid rgba(212,170,78,.05);}
        .rr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--gold2),var(--gold3));transform:scaleY(0);transform-origin:bottom;transition:transform .3s;}
        .rr:hover{background:rgba(212,170,78,.04)!important;}
        .rr:hover::before{transform:scaleY(1);}
        .rr:hover .rr-t{color:var(--gold)!important;}
        .rr:hover .rr-n{color:rgba(212,170,78,.6)!important;-webkit-text-stroke:1px var(--gold3)!important;}
        .rr:hover .rr-img{filter:brightness(1) saturate(1)!important;}
        .rr:hover .rr-btns{opacity:1!important;}
        .rr-t{transition:color .25s;} .rr-n{transition:color .3s,-webkit-text-stroke .3s;}
        .rr-img{transition:filter .3s;filter:brightness(.78) saturate(.58);}
        .rr-btns{transition:opacity .25s;}

        /* num card */
        .nc{position:relative;overflow:hidden;border:1px solid rgba(212,170,78,.1);transition:border-color .3s,transform .3s;}
        .nc:hover{border-color:rgba(212,170,78,.32);transform:translateY(-3px);}
        .nc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(212,170,78,.04) 0%,transparent 55%);pointer-events:none;}

        /* tabs */
        .ftab{cursor:pointer;border:none;background:transparent;font-family:var(--fm);font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:8px 16px 6px;border-bottom:2px solid transparent;transition:all .2s;}
        .ftab.on{border-bottom-color:var(--gold);color:var(--gold)!important;}
        .ftab:not(.on):hover{color:var(--cream)!important;border-bottom-color:rgba(212,170,78,.28);}

        .ss{-webkit-appearance:none;appearance:none;cursor:pointer;outline:none;}
        .ss option{background:#181520;}
        .mq{animation:marqueeLeft 36s linear infinite;}
        .sk{background:linear-gradient(90deg,var(--void2) 0%,rgba(212,170,78,.06) 50%,var(--void2) 100%);background-size:400% 100%;animation:shimmer 2s infinite;}

        @media(max-width:768px){
          .hero-left{display:none!important;} .hero-r{padding:56px 24px!important;}
          .vault-grid{grid-template-columns:1fr 1fr!important;grid-template-rows:auto!important;}
          .vi.big{grid-column:span 1!important;grid-row:span 1!important;}
          .rr{grid-template-columns:64px 58px 1fr auto!important;}
          .nums-grid{grid-template-columns:1fr 1fr!important;}
          .sect-pad{padding:0 20px!important;}
        }
      `}</style>

      {/* Constellation canvas — fixed bg */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, background: "rgba(5,4,10,.9)", minHeight: "100vh", paddingTop: "130px", fontFamily: "var(--fs)", color: "var(--cream)", overflowX: "hidden" }}>

        {/* ═══════════════════════════════════════════
            HERO — DIAGONAL SPLIT
        ═══════════════════════════════════════════ */}
        <section style={{ position: "relative", minHeight: "94vh", display: "flex", overflow: "hidden" }}>

          {/* LEFT — stacked BEST letters */}
          <div className="hero-left" style={{ width: "36%", flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid rgba(212,170,78,.1)" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, right: "-1px", width: "1px", background: "linear-gradient(to bottom,transparent,rgba(212,170,78,.35),transparent)" }} />
            <div className="a1" style={{ fontFamily: "var(--fh)", fontSize: "clamp(100px,13vw,180px)", lineHeight: .84, letterSpacing: "6px", color: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.22)", userSelect: "none", textAlign: "center", animation: "goldFlicker 5s ease infinite" }}>
              B<br />E<br />S<br />T
            </div>
            <div style={{ position: "absolute", bottom: "52px", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(212,170,78,.35)" }}>2025</div>
              <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom,rgba(212,170,78,.35),transparent)", margin: "8px auto 0" }} />
            </div>
            {/* Diagonal cut */}
            <div style={{ position: "absolute", top: 0, right: "-50px", bottom: 0, width: "100px", background: "rgba(5,4,10,.9)", clipPath: "polygon(50px 0,100% 0,100% 100%,0 100%)", zIndex: 5, pointerEvents: "none" }} />
          </div>

          {/* RIGHT — editorial */}
          <div className="hero-r" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px 80px 96px", position: "relative" }}>
            <div className="a2" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <div style={{ width: "6px", height: "6px", transform: "rotate(45deg)", background: "var(--gold2)" }} />
              <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)" }}>AG Classics — Bestsellers</span>
              <div style={{ flex: 1, maxWidth: "72px", height: "1px", background: "linear-gradient(to right,var(--gold2),transparent)" }} />
            </div>

            <h1 className="a3" style={{ fontFamily: "var(--fh)", fontSize: "clamp(76px,10vw,148px)", lineHeight: .86, letterSpacing: "3px", marginBottom: "24px", background: "linear-gradient(155deg,#f0ebe0 25%,#d4aa4e 65%,#a07c2a 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase" }}>
              THE<br />SELLERS<br /><span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.4)" }}>VAULT</span>
            </h1>

            <div className="a4" style={{ overflow: "hidden", marginBottom: "24px" }}>
              <div style={{ height: "1px", background: "linear-gradient(to right,var(--gold),var(--gold2),transparent)", animation: "lineExpand 1.2s ease .8s both" }} />
            </div>

            <p className="a4" style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "clamp(14px,1.5vw,19px)", color: "var(--fog)", lineHeight: 1.85, maxWidth: "420px", marginBottom: "48px" }}>
              Every volume here has earned its place — chosen by thousands of readers who keep coming back.
            </p>

            <div className="a5" style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => document.getElementById("rankings")?.scrollIntoView({ behavior: "smooth" })}
                style={{ fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", padding: "14px 36px", border: "none", background: "linear-gradient(135deg,#d4aa4e,#a07c2a)", color: "var(--void)", cursor: "pointer", transition: "transform .2s,filter .2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.filter = "none"; }}>
                Explore Rankings
              </button>
              <span style={{ fontFamily: "var(--fm)", fontSize: "8px", color: "rgba(212,170,78,.3)", letterSpacing: "1px" }}>{books.length || "24"} titles ranked</span>
            </div>

            {/* Stat mini-bar */}
            <div className="a5" style={{ display: "flex", gap: "36px", marginTop: "52px", paddingTop: "28px", borderTop: "1px solid rgba(212,170,78,.1)", flexWrap: "wrap" }}>
              {[{ v: books.length || 24, l: "Titles" }, { v: "4.8★", l: "Avg Rating" }, { v: "Free", l: "Shipping ₹599+" }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--fh)", fontSize: "28px", letterSpacing: "1px", color: "var(--gold)", lineHeight: 1 }}>{typeof s.v === "number" ? s.v : s.v}</div>
                  <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--fog)", marginTop: "4px" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Decorative bottom-right corner marks */}
            <div style={{ position: "absolute", bottom: "40px", right: "52px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
              {[72, 48, 24, 12].map((w, i) => <div key={i} style={{ height: "1px", width: `${w}px`, background: `rgba(212,170,78,${.05 + i * .07})` }} />)}
            </div>
          </div>

          <div style={{ position: "absolute", right: "28px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "4px", color: "rgba(212,170,78,.3)", writingMode: "vertical-rl", textTransform: "uppercase" }}>Scroll</div>
            <div style={{ width: "1px", height: "56px", background: "linear-gradient(to bottom,rgba(212,170,78,.4),transparent)", animation: "pulse 2.2s ease infinite" }} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MARQUEE STRIP
        ═══════════════════════════════════════════ */}
        <div style={{ borderTop: "1px solid rgba(212,170,78,.15)", borderBottom: "1px solid rgba(212,170,78,.15)", background: "var(--void2)", padding: "13px 0", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "60px", background: "linear-gradient(to right,var(--void2),transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60px", background: "linear-gradient(to left,var(--void2),transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div className="mq" style={{ display: "flex", width: "max-content" }}>
            {[...Array(2)].map((_, o) =>
              ["The Vault is Open", "Most Loved Titles", "Top Rated 2025", "All-Time Classics", "Community Picks", "Staff Curated", "Most Gifted", "Critically Acclaimed", "Reader Approved", "Premium Editions"].map((t, j) => (
                <div key={`${o}-${j}`} style={{ display: "flex", alignItems: "center", padding: "0 40px", whiteSpace: "nowrap", gap: "20px" }}>
                  <div style={{ width: "3px", height: "3px", background: "rgba(212,170,78,.4)", transform: "rotate(45deg)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(212,170,78,.42)" }}>{t}</span>
                </div>
              ))
            )}
          </div>
        </div>



        {/* ─── skeleton ─── */}
        {loading && (
          <div style={{ maxWidth: "1680px", margin: "0 auto", padding: "64px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "60px", flexWrap: "wrap" }}>
              {[520, 440, 400, 360, 320].map((h, i) => <div key={i} className="sk" style={{ width: "220px", height: `${h}px`, flexShrink: 0 }} />)}
            </div>
            {[...Array(8)].map((_, i) => <div key={i} className="sk" style={{ height: "88px", marginBottom: "2px", animationDelay: `${i * .07}s` }} />)}
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "120px 0" }}>
            <p style={{ fontFamily: "var(--fh)", fontSize: "48px", letterSpacing: "4px", color: "var(--cream)", marginBottom: "12px" }}>SOMETHING BROKE</p>
            <p style={{ fontFamily: "var(--fm)", fontSize: "11px", color: "var(--fog)", marginBottom: "28px" }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", padding: "12px 32px", background: "var(--gold)", color: "var(--void)", border: "none", cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div style={{ textAlign: "center", padding: "120px 0" }}>
            <p style={{ fontFamily: "var(--fh)", fontSize: "48px", letterSpacing: "3px", color: "var(--fog)" }}>THE VAULT IS EMPTY</p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (<>

          {/* ═══════════════════════════════════════════
              § 01 — THE CROWN  (full-bleed #1 feature)
          ═══════════════════════════════════════════ */}
          {books[0] && (
            <section style={{ position: "relative", overflow: "hidden" }}>
              <div className="crown-wrap" style={{ display: "flex", minHeight: "80vh", cursor: "pointer" }} onClick={() => (window.location.href = `/product/${books[0].slug}`)}>

                {/* Cover — 52% */}
                <div style={{ width: "52%", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  {books[0].main_image ? (
                    <img className="crown-cover" src={`${API_URL}${books[0].main_image}`} alt={books[0].title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.78) saturate(.65)" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,var(--void3),var(--void4))" }} />
                  )}
                  {/* Diagonal cut */}
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "130px", background: "rgba(5,4,10,.9)", clipPath: "polygon(65px 0,100% 0,100% 100%,0 100%)", zIndex: 2, pointerEvents: "none" }} />
                  {/* Crown reveal overlay */}
                  <div className="crown-reveal" style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity .5s", background: "rgba(5,4,10,.5)", zIndex: 1, pointerEvents: "none" }} />
                  {/* Rank numeral */}
                  <div style={{ position: "absolute", top: "28px", left: "28px", zIndex: 3, fontFamily: "var(--fh)", fontSize: "clamp(90px,13vw,170px)", color: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.3)", lineHeight: 1, letterSpacing: "-4px", userSelect: "none" }}>1</div>
                  {/* Crown badge */}
                  <div style={{ position: "absolute", top: "28px", right: "96px", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "1px", height: "44px", background: "linear-gradient(to bottom,transparent,var(--gold))" }} />
                    <div style={{ padding: "8px 16px", background: "linear-gradient(135deg,#d4aa4e,#a07c2a)", display: "flex", gap: "8px", alignItems: "center" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--void)"><path d="M5 16L3 5l5.5 5L12 3l3.5 7L21 5l-2 11H5zM5 19a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2H5z" /></svg>
                      <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--void)", fontWeight: 700 }}>#1 Bestseller</span>
                    </div>
                  </div>
                </div>

                {/* Info panel */}
                <div style={{ flex: 1, background: "var(--void2)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 80px", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom,transparent,rgba(212,170,78,.25),transparent)" }} />
                  <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "18px" }}>The Crown — No.1 Title</div>
                  {books[0].authors?.[0] && <p style={{ fontFamily: "var(--fm)", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold2)", marginBottom: "12px" }}>{books[0].authors[0].name}</p>}
                  <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(44px,6vw,84px)", letterSpacing: "2px", lineHeight: .9, color: "var(--cream)", marginBottom: "28px", textTransform: "uppercase" }}>{books[0].title}</h2>
                  <div style={{ marginBottom: "18px" }}><Stars r={books[0].avg_rating} /></div>
                  {books[0].review_count > 0 && <p style={{ fontFamily: "var(--fm)", fontSize: "8px", color: "var(--fog)", marginBottom: "28px" }}>{books[0].review_count.toLocaleString()} verified reviews</p>}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "40px" }}>
                    <span style={{ fontFamily: "var(--fh)", fontSize: "52px", letterSpacing: "2px", color: "var(--gold)", lineHeight: 1 }}>₹{parseFloat(String(books[0].sell_price)).toFixed(0)}</span>
                    {disc(books[0].price, books[0].sell_price) > 0 && (<>
                      <span style={{ fontFamily: "var(--fm)", fontSize: "12px", textDecoration: "line-through", color: "var(--fog)" }}>₹{parseFloat(String(books[0].price)).toFixed(0)}</span>
                      <span style={{ fontFamily: "var(--fm)", fontSize: "8px", padding: "3px 8px", background: "rgba(139,58,58,.2)", color: "#c07070", letterSpacing: "1px" }}>{disc(books[0].price, books[0].sell_price)}% OFF</span>
                    </>)}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <CartBtn book={books[0]} size="lg" />
                    <WishBtn book={books[0]} sz={48} />
                  </div>
                  <div style={{ position: "absolute", bottom: "32px", right: "40px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                    {[64, 44, 28, 14].map((w, i) => <div key={i} style={{ height: "1px", width: `${w}px`, background: `rgba(212,170,78,${.05 + i * .07})` }} />)}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              § 02 — THE REEL  (3D depth carousel)
          ═══════════════════════════════════════════ */}
          {books.length > 1 && (
            <section style={{ background: "var(--void)", padding: "88px 0", overflow: "hidden" }}>
              <div className="sect-pad" style={{ maxWidth: "1680px", margin: "0 auto", padding: "0 64px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "56px", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "10px" }}>§ 02</div>
                    <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(48px,7vw,92px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>The Books</h2>
                    <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "14px", color: "var(--fog)", marginTop: "8px" }}>Swipe through our top picks</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[{ dir: "←", dis: reelIdx === 0, action: () => setReelIdx(i => Math.max(0, i - 1)) }, { dir: "→", dis: reelIdx === reelBooks.length - 1, action: () => setReelIdx(i => Math.min(reelBooks.length - 1, i + 1)) }].map((btn, i) => (
                      <button key={i} onClick={btn.action} disabled={btn.dis}
                        style={{ width: "44px", height: "44px", border: "1px solid rgba(212,170,78,.2)", background: "transparent", color: btn.dis ? "rgba(212,170,78,.2)" : "var(--gold)", cursor: btn.dis ? "not-allowed" : "pointer", fontFamily: "var(--fm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "all .2s" }}>
                        {btn.dir}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "12px", padding: "20px 0 60px", perspective: "1400px", alignItems: "flex-end" }}>
                {reelBooks.map((book, i) => {
                  const offset = i - reelIdx;
                  const cls = offset === 0 ? "rc" : Math.abs(offset) === 1 ? "rs1" : Math.abs(offset) === 2 ? "rs2" : "rh";
                  const bDisc = disc(book.price, book.sell_price);
                  const oos = book.stock === 0;
                  return (
                    <div key={book.id} className={`reel-card ${cls}`}
                      style={{ width: "220px", height: "340px", background: "var(--void3)", border: `1px solid ${offset === 0 ? "rgba(212,170,78,.35)" : "rgba(212,170,78,.07)"}` }}
                      onClick={() => { if (offset !== 0) setReelIdx(i); else window.location.href = `/product/${book.slug}`; }}>
                      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10, fontFamily: "var(--fh)", fontSize: "52px", lineHeight: 1, color: "transparent", WebkitTextStroke: `1px rgba(212,170,78,${offset === 0 ? .65 : .28})`, letterSpacing: "-2px", userSelect: "none" }}>{i + 2}</div>
                      {book.main_image ? (
                        <img src={`${API_URL}${book.main_image}`} alt={book.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.7) saturate(.6)", transition: "filter .4s" }} />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,var(--void4),var(--void3))" }} />
                      )}
                      <div className="reel-overlay" style={{ position: "absolute", inset: 0, opacity: offset === 0 ? 1 : 0, background: "linear-gradient(to top,rgba(5,4,10,.97) 0%,rgba(5,4,10,.55) 55%,rgba(5,4,10,.08) 100%)", transition: "opacity .3s", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "16px" }}>
                        {book.authors?.[0] && <p style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold2)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.authors[0].name}</p>}
                        <h3 style={{ fontFamily: "var(--fs)", fontWeight: 700, fontSize: "15px", color: "var(--cream)", lineHeight: 1.2, marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{book.title}</h3>
                        <div style={{ marginBottom: "8px" }}><Stars r={book.avg_rating} /></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <span style={{ fontFamily: "var(--fm)", fontSize: "14px", fontWeight: 700, color: "var(--gold)" }}>₹{parseFloat(String(book.sell_price)).toFixed(0)}</span>
                          {bDisc > 0 && <span style={{ fontFamily: "var(--fm)", fontSize: "8px", padding: "2px 6px", background: "rgba(139,58,58,.2)", color: "#c07070" }}>{bDisc}%</span>}
                        </div>
                        <div className="reel-acts" style={{ display: "flex", gap: "6px", opacity: 0, transform: "translateY(8px)", transition: "opacity .3s,transform .3s" }}>
                          <CartBtn book={book} size="sm" />
                          <WishBtn book={book} sz={34} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                {reelBooks.map((_, i) => (
                  <button key={i} onClick={() => setReelIdx(i)} style={{ width: reelIdx === i ? "24px" : "6px", height: "6px", borderRadius: "3px", border: "none", background: reelIdx === i ? "var(--gold)" : "rgba(212,170,78,.18)", cursor: "pointer", transition: "all .3s", padding: 0 }} />
                ))}
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              § 03 — THE VAULT  (bento mosaic — NEW)
          ═══════════════════════════════════════════ */}
          {books.length >= 9 && (
            <section style={{ background: "var(--void2)", padding: "88px 0" }}>
              <div className="sect-pad" style={{ maxWidth: "1680px", margin: "0 auto", padding: "0 64px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "10px" }}>§ 03</div>
                    <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(48px,7vw,92px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>The Vault</h2>
                    <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "14px", color: "var(--fog)", marginTop: "8px" }}>Every title worth owning</p>
                  </div>
                </div>

                <div className="vault-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gridTemplateRows: "280px 200px 240px", gap: "6px" }}>
                  {books.slice(1, 10).map((book, i) => {
                    const spans = [{ cs: 2, rs: 2 }, { cs: 1, rs: 1 }, { cs: 1, rs: 1 }, { cs: 1, rs: 1 }, { cs: 1, rs: 1 }, { cs: 1, rs: 1 }, { cs: 2, rs: 1 }, { cs: 1, rs: 1 }, { cs: 2, rs: 1 }];
                    const sp = spans[i] || { cs: 1, rs: 1 };
                    const bDisc = disc(book.price, book.sell_price);
                    const oos = book.stock === 0;
                    return (
                      <div key={book.id} className="vi big" style={{ gridColumn: `span ${sp.cs}`, gridRow: `span ${sp.rs}`, background: "var(--void3)", border: "1px solid rgba(212,170,78,.07)" }} onClick={() => (window.location.href = `/product/${book.slug}`)}>
                        <div style={{ position: "absolute", top: "8px", left: "10px", zIndex: 10, fontFamily: "var(--fh)", fontSize: sp.rs > 1 ? "52px" : "32px", color: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.28)", lineHeight: 1, userSelect: "none" }}>{i + 2}</div>
                        {book.main_image ? <img className="vi-img" src={`${API_URL}${book.main_image}`} alt={book.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,var(--void4),var(--void3))" }} />}
                        <div className="vi-info" style={{ position: "absolute", inset: 0, opacity: 0, transform: "translateY(6px)", background: "linear-gradient(to top,rgba(5,4,10,.97) 0%,rgba(5,4,10,.65) 50%,rgba(5,4,10,.12) 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px" }}>
                          {book.authors?.[0] && <p style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold2)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.authors[0].name}</p>}
                          <h3 style={{ fontFamily: "var(--fs)", fontWeight: 700, fontSize: sp.cs > 1 ? "16px" : "13px", color: "var(--cream)", lineHeight: 1.2, marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{book.title}</h3>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                            <span style={{ fontFamily: "var(--fm)", fontSize: "13px", fontWeight: 700, color: "var(--gold)" }}>₹{parseFloat(String(book.sell_price)).toFixed(0)}</span>
                            {bDisc > 0 && <span style={{ fontFamily: "var(--fm)", fontSize: "7px", padding: "2px 6px", background: "rgba(139,58,58,.2)", color: "#c07070" }}>{bDisc}%</span>}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <CartBtn book={book} size="sm" />
                            <WishBtn book={book} sz={32} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              § 04 — THE NUMBERS  (animated counters — NEW)
          ═══════════════════════════════════════════ */}
          <section ref={numbersRef} style={{ background: "var(--void)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(212,170,78,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(212,170,78,.035) 1px,transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,transparent,rgba(212,170,78,.3),transparent)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,transparent,rgba(212,170,78,.15),transparent)" }} />

            <div className="sect-pad" style={{ maxWidth: "1680px", margin: "0 auto", padding: "0 64px" }}>
              <div style={{ textAlign: "center", marginBottom: "72px" }}>
                <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px" }}>§ 04</div>
                <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(48px,7vw,92px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>The Numbers</h2>
                <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "14px", color: "var(--fog)", marginTop: "12px" }}>What the data says about our community</p>
              </div>

              <div className="nums-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2px" }}>
                {[
                  { val: counts.titles, suf: "", label: "Titles Ranked", sub: "and counting" },
                  { val: counts.reviews, suf: "+", label: "Reader Reviews", sub: "verified purchases" },
                  { val: counts.authors, suf: "", label: "Authors Featured", sub: "across all genres" },
                  { val: counts.readers, suf: "+", label: "Happy Readers", sub: "in our community" },
                ].map((s, i) => (
                  <div key={i} className="nc" style={{ background: "var(--void2)", padding: "52px 44px", textAlign: "center", position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "20px", height: "20px", borderTop: "1px solid rgba(212,170,78,.28)", borderLeft: "1px solid rgba(212,170,78,.28)" }} />
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: "20px", height: "20px", borderBottom: "1px solid rgba(212,170,78,.28)", borderRight: "1px solid rgba(212,170,78,.28)" }} />
                    <div style={{ fontFamily: "var(--fh)", fontSize: "clamp(56px,6vw,84px)", letterSpacing: "-2px", lineHeight: .85, background: "linear-gradient(155deg,#f0ebe0,#d4aa4e)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px" }}>
                      {s.val.toLocaleString()}{s.suf}
                    </div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--cream)", marginBottom: "6px" }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "12px", color: "var(--fog)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              § 05 — FULL RANKINGS  (magazine list)
          ═══════════════════════════════════════════ */}
          {books.length > 3 && (
            <section id="rankings" style={{ background: "var(--void2)", padding: "88px 0" }}>
              <div className="sect-pad" style={{ maxWidth: "1680px", margin: "0 auto", padding: "0 64px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "10px" }}>§ 05</div>
                    <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(48px,7vw,92px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>Full Rankings</h2>
                  </div>
                  <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "14px", color: "var(--fog)", maxWidth: "260px", textAlign: "right" }}>Ranked by community votes, sales velocity, and editorial merit</p>
                </div>

                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "88px 68px 1fr auto", padding: "10px 20px 10px 0", borderBottom: "1px solid rgba(212,170,78,.15)", background: "rgba(212,170,78,.025)", marginBottom: "2px" }}>
                  {["Rank", "", "Title & Author", "Price"].map((h, i) => (
                    <div key={i} style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(212,170,78,.3)", textAlign: i === 0 ? "center" : i === 3 ? "right" : "left", paddingLeft: i === 2 ? "20px" : 0, paddingRight: i === 3 ? "20px" : 0 }}>{h}</div>
                  ))}
                </div>

                <div style={{ border: "1px solid rgba(212,170,78,.08)", borderTop: "none" }}>
                  {books.map((book, idx) => {
                    const rank = idx + 1;
                    const bDisc = disc(book.price, book.sell_price);
                    const oos = book.stock === 0;
                    const isNew = new Date(book.created_at) > new Date(Date.now() - 30 * 864e5);

                    return (
                      <div key={book.id} className="rr" style={{ background: rank % 2 === 0 ? "rgba(255,255,255,.008)" : "transparent" }} onClick={() => (window.location.href = `/product/${book.slug}`)}>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", borderRight: "1px solid rgba(212,170,78,.06)", position: "relative" }}>
                          <span className="rr-n" style={{ fontFamily: "var(--fh)", fontSize: rank <= 3 ? "28px" : "20px", color: rank <= 3 ? "rgba(212,170,78,.65)" : "rgba(212,170,78,.18)", letterSpacing: "-1px", lineHeight: 1 }}>{String(rank).padStart(2, "0")}</span>
                          {rank <= 3 && <div style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", width: "18px", height: "1px", background: "var(--gold)", opacity: .35 }} />}
                        </div>

                        <div style={{ padding: "13px 0 13px 14px" }}>
                          <div style={{ width: "48px", height: "64px", overflow: "hidden", position: "relative" }}>
                            {book.main_image ? <img className="rr-img" src={`${API_URL}${book.main_image}`} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "var(--void3)" }} />}
                          </div>
                        </div>

                        <div style={{ padding: "12px 20px", minWidth: 0 }}>
                          {book.authors?.[0] && <p style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold3)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.authors[0].name}</p>}
                          <h3 className="rr-t" style={{ fontFamily: "var(--fs)", fontWeight: 700, fontSize: "clamp(13px,1.1vw,16px)", color: "var(--cream)", lineHeight: 1.25, marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <Stars r={book.avg_rating} />
                            {book.review_count > 0 && <span style={{ fontFamily: "var(--fm)", fontSize: "8px", color: "var(--fog)" }}>{book.review_count}r</span>}
                            {isNew && <span style={{ fontFamily: "var(--fm)", fontSize: "6px", letterSpacing: "2px", textTransform: "uppercase", padding: "2px 7px", background: "var(--gold)", color: "var(--void)" }}>New</span>}
                            {oos && <span style={{ fontFamily: "var(--fm)", fontSize: "6px", letterSpacing: "2px", textTransform: "uppercase", padding: "2px 7px", background: "rgba(100,100,105,.2)", color: "var(--fog)" }}>Sold Out</span>}
                          </div>
                        </div>

                        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "var(--fm)", fontWeight: 700, fontSize: "15px", color: "var(--gold)" }}>₹{parseFloat(String(book.sell_price)).toFixed(0)}</div>
                            {bDisc > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "flex-end", marginTop: "2px" }}>
                                <span style={{ fontSize: "10px", textDecoration: "line-through", color: "var(--fog)" }}>₹{parseFloat(String(book.price)).toFixed(0)}</span>
                                <span style={{ fontFamily: "var(--fm)", fontSize: "7px", padding: "1px 5px", background: "rgba(139,58,58,.15)", color: "#c07070" }}>{bDisc}%</span>
                              </div>
                            )}
                          </div>
                          <div className="rr-btns" style={{ display: "flex", gap: "5px", opacity: 0 }}>
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

          {/* ═══════════════════════════════════════════
              EDITORIAL CLOSE
          ═══════════════════════════════════════════ */}
          <section style={{ background: "var(--void)", borderTop: "1px solid rgba(212,170,78,.1)", padding: "88px 64px", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,transparent,var(--gold2),transparent)" }} />
            <div style={{ maxWidth: "1680px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "48px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ fontFamily: "var(--fh)", fontSize: "clamp(28px,5vw,68px)", letterSpacing: "2px", color: "transparent", WebkitTextStroke: "1px rgba(212,170,78,.18)", lineHeight: .88, marginBottom: "24px", textTransform: "uppercase" }}>The Archive<br />Never Closes</div>
                <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "clamp(15px,1.8vw,22px)", color: "rgba(240,235,224,.32)", lineHeight: 1.75, maxWidth: "520px" }}>
                  "Not all readers are leaders, but all leaders are readers."
                </p>
                <span style={{ display: "block", marginTop: "12px", fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--gold3)" }}>— Harry S. Truman</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "1px", height: "60px", background: "linear-gradient(to bottom,transparent,rgba(212,170,78,.3))" }} />
                <div style={{ width: "48px", height: "48px", border: "1px solid rgba(212,170,78,.28)", transform: "rotate(45deg)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: "8px", border: "1px solid rgba(212,170,78,.12)" }} />
                </div>
                <div style={{ width: "1px", height: "60px", background: "linear-gradient(to bottom,rgba(212,170,78,.3),transparent)" }} />
              </div>
            </div>
            <div style={{ maxWidth: "1680px", margin: "48px auto 0", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(212,170,78,.08)", paddingTop: "24px", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(138,132,144,.4)" }}>AG Classics · Best Sellers · Updated Live</span>
              <div style={{ display: "flex", gap: "5px" }}>
                {[.07, .16, .32, .55, .32, .16, .07].map((o, i) => <div key={i} style={{ width: "4px", height: "4px", transform: "rotate(45deg)", background: `rgba(212,170,78,${o})` }} />)}
              </div>
            </div>
          </section>

        </>)}
      </div>
    </>
  );
}