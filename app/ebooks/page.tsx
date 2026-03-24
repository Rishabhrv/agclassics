"use client";

import { useEffect, useState, useRef } from "react";
import FeaturedEbookSpotlight from "@/components/home/FeaturedEbookSpotlight";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ─── Types ─────────────────────────────────────────────────────── */
interface Book {
  id: number;
  title: string;
  slug: string;
  main_image: string;
  product_type: string;
  stock: number;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  author_name: string | null;
  avg_rating: number | null;
  review_count: number;
}
interface Category {
  category_id: number;
  category_name: string;
  category_slug: string;
  books: Book[];
}

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function ebookPrice(book: Book): { display: number; original: number } {
  const eSell = book.ebook_sell_price !== null ? Number(book.ebook_sell_price) : null;
  const ePr   = book.ebook_price      !== null ? Number(book.ebook_price)      : null;
  return { display: eSell ?? Number(book.sell_price), original: ePr ?? Number(book.price) };
}

const F_CORMORANT = { fontFamily: "'Cormorant Garamond', serif" } as const;
const F_CINZEL    = { fontFamily: "'Cinzel', serif" } as const;
const F_JOST      = { fontFamily: "'Jost', sans-serif" } as const;

/* ═══════════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════════ */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] flex items-center gap-3 px-4 sm:px-5 py-3 uppercase tracking-[2px]"
      style={{
        transform: "translateX(-50%)",
        background: "#1c1c1e",
        border: "1px solid rgba(201,168,76,0.3)",
        color: "#c9a84c",
        fontFamily: "'Cinzel', serif",
        fontSize: "10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        animation: "toastIn 0.3s ease both",
        maxWidth: "calc(100vw - 32px)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <div className="w-[6px] h-[6px] rotate-45 bg-[#c9a84c] shrink-0" />
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO CAROUSEL
═══════════════════════════════════════════════════════════════════ */
const HeroCarousel = ({ books, loading }: { books: Book[]; loading: boolean }) => {
  const [progress, setProgress] = useState(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    let id: number;
    const animate = () => {
      if (!isPausedRef.current) setProgress((p) => p + 0.005);
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  let displayBooks = [...books];
  if (!loading && displayBooks.length > 0) {
    while (displayBooks.length < 8) displayBooks = [...displayBooks, ...books];
  } else if (loading) {
    displayBooks = Array(7).fill(null);
  }

  const total = displayBooks.length;

  return (
    <div
      className="anim-fadeUp-3 relative w-full max-w-[1400px] py-22 sm:py-16 md:py-35 mb-6 sm:mb-8 flex justify-center items-center z-10"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
      onTouchStart={() => (isPausedRef.current = true)}
      onTouchEnd={() => (isPausedRef.current = false)}
    >
      {displayBooks.map((book, i) => {
        let d = (i - progress) % total;
        if (d > total / 2) d -= total;
        if (d < -total / 2) d += total;
        const absD = Math.abs(d);
        const opacity = Math.max(0, Math.min(1, 3.7 - absD));
        if (opacity <= 0) return null;
        const translateX = d * 100;
        const scale = 0.85 + absD * 0.12;
        const zIndex = Math.round(50 + absD * 10);

        return (
          <div
            key={book ? `${book.id}-${i}` : `skel-${i}`}
            className="absolute rounded-sm overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-[rgba(201,168,76,0.15)] bg-[#131316] cursor-pointer"
            style={{
              width: "clamp(80px, 15vw, 180px)",
              transform: `translateX(${translateX}%) scale(${scale})`,
              zIndex,
              opacity,
              pointerEvents: opacity > 0.5 ? "auto" : "none",
            }}
            onClick={() => { if (book) window.location.href = `/product/${book.slug}`; }}
          >
            {book ? (
              <div className="w-full h-full relative group">
                <img
                  src={`${API_URL}${book.main_image}`}
                  alt={book.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  style={{ filter: absD < 0.8 ? "brightness(1.09)" : "brightness(0.9) saturate(0.7)" }}
                />
                {absD >= 0.8 && <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />}
                {absD < 0.8 && <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(201,168,76,0.3)] pointer-events-none" />}
              </div>
            ) : (
              <div className="w-full h-full anim-shimmer" style={{ aspectRatio: "3/4" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function EbooksPage() {
  const [categories, setCategories]         = useState<Category[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [featuredBook, setFeaturedBook]     = useState<Book | null>(null);

  /* ── Cart / Wishlist state ── */
  const [cartId,  setCartId]  = useState<number | null>(null);
  const [wish,    setWish]    = useState<Set<number>>(new Set());
  const [toast,   setToast]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/ag-classics/ebooks/categories`)
      .then(r => r.json())
      .then(d => {
        const cats: Category[] = d.categories ?? [];
        setCategories(cats);
        if (cats.length > 0) {
          setActiveCategory(cats[0].category_id);
          const allBooks = cats.flatMap(c => c.books);
          setFeaturedBook(allBooks.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))[0] ?? null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Add to cart (ebook only) ── */
  const addCart = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to add to cart"); return; }
    if (cartId === book.id) return;
    setCartId(book.id);
    try {
      const r = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: book.id, format: "ebook", quantity: 1 }),
      });
      if (!r.ok) throw new Error();
      window.dispatchEvent(new Event("cart-change"));
      setToast("Added to cart");
    } catch {
      setToast("Could not add to cart");
    } finally {
      setCartId(null);
    }
  };

  /* ── Toggle wishlist ── */
  const toggleWish = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setToast("Please log in to save to wishlist"); return; }
    const was = wish.has(book.id);
    try {
      await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        method: was ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: book.id }),
      });
      setWish(prev => { const n = new Set(prev); was ? n.delete(book.id) : n.add(book.id); return n; });
      setToast(was ? "Removed from wishlist" : "Saved to wishlist");
    } catch {
      setToast("Could not update wishlist");
    }
  };

  const activeCat = categories.find(c => c.category_id === activeCategory);
  const allBooks  = categories.flatMap(c => c.books);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;500;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes ep-fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ep-shimmer { from{background-position:-400% 0} to{background-position:400% 0} }
        @keyframes toastIn    { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

        .anim-fadeUp-0 { animation:ep-fadeUp .9s ease both; }
        .anim-fadeUp-1 { animation:ep-fadeUp .9s ease .12s both; }
        .anim-fadeUp-2 { animation:ep-fadeUp .9s ease .24s both; }
        .anim-fadeUp-3 { animation:ep-fadeUp .9s ease .36s both; }
        .anim-fadeUp-4 { animation:ep-fadeUp .9s ease .48s both; }
        .anim-shimmer {
          background:linear-gradient(90deg,#131316 0%,#1f1f23 50%,#131316 100%);
          background-size:400% 100%;
          animation:ep-shimmer 1.6s ease infinite;
        }

        .hero-grid-bg {
          background-image:linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px);
          background-size:4rem 4rem;
          -webkit-mask-image:radial-gradient(ellipse 60% 60% at 50% 40%,#000 20%,transparent 100%);
        }
        .clamp-2 {
          display:-webkit-box; -webkit-line-clamp:2;
          -webkit-box-orient:vertical; overflow:hidden;
        }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { scrollbar-width:none; }
        .test-source::before,.test-source::after {
          content:''; width:40px; height:1px; background:#8a6f2e; display:block;
        }
        .scard:hover .scard-img img  { transform:scale(1.05); filter:brightness(.8); }
        .scard:hover .scard-overlay  { opacity:1; }
        .ep-card:hover .ep-card-img img { transform:scale(1.05); filter:brightness(.75); }
        .ep-card:hover .ep-card-overlay { opacity:1; }
        .scard-img img, .ep-card-img img { transition:transform .4s ease,filter .4s ease; }
        .scard-overlay, .ep-card-overlay { transition:opacity .3s; }

        /* wish button active state */
        .wish-btn-active { color:#c9a84c !important; border-color:rgba(201,168,76,0.5) !important; background:rgba(201,168,76,0.1) !important; }
      `}</style>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div className="bg-[#080809] min-h-screen text-[#f5f0e8] overflow-x-hidden" style={F_JOST}>

        {/* ════════ HERO ════════ */}
        <section className="relative  flex flex-col items-center justify-center text-center overflow-hidden bg-[#080809] pt-[110px] sm:pt-[130px] md:pt-[140px] pb-14 sm:pb-20">

          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1000px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_60%)] blur-3xl pointer-events-none" />
          <div className="hero-grid-bg absolute inset-0 pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 mt-6 sm:mt-10">

            <h1
              className="anim-fadeUp-1 font-light leading-[1.05] text-[#f5f0e8] max-w-[900px] m-0"
              style={{ ...F_CORMORANT, fontSize: "clamp(32px,6vw,75px)" }}
            >
              Build a Digital Library of{" "}
              <br className="hidden sm:block" />
              <em className="italic text-[#c9a84c]">Timeless Classics</em>
            </h1>

            <p
              className="anim-fadeUp-2 text-white leading-[1.6] max-w-[600px] mt-3 px-2"
              style={{ ...F_JOST, fontSize: "clamp(12px,1.5vw,17px)" }}
            >
              Experience the world's greatest literature, flawlessly formatted for your
              favorite device. Access our premium eBooks instantly.
            </p>

            <HeroCarousel books={allBooks} loading={loading} />

            <div className="anim-fadeUp-4 relative mt-2 sm:mt-4 md:mt-8 flex justify-center items-center w-full z-20">
              <button
                className="text-[11px] sm:text-[13px] tracking-[2px] uppercase font-bold bg-[#c9a84c] text-[#080809]
                  px-8 py-3.5 sm:px-10 sm:py-4 md:px-14 md:py-5 rounded-full
                  shadow-[0_0_30px_rgba(201,168,76,0.25)] transition-all duration-300 hover:scale-105 hover:bg-[#f5f0e8]"
                style={F_JOST}
                onClick={() => document.getElementById("ep-genres")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse by Genre
              </button>
            </div>
          </div>
        </section>

        {/* ════════ FEATURED SPOTLIGHT ════════ */}
        <FeaturedEbookSpotlight book={featuredBook} loading={loading} />

        {/* ════════ NEW ARRIVALS ════════ */}
        {!loading && allBooks.length > 0 && (
          <section className="pt-14 sm:pt-20">
            <div className="flex items-end justify-between mb-6 sm:mb-9 px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)]">
              <h2
                className="font-light leading-[1.05] text-[#f5f0e8]"
                style={{ ...F_CORMORANT, fontSize: "clamp(22px,3.5vw,40px)" }}
              >
                Fresh to the <em className="italic text-[#c9a84c]">Collection</em>
              </h2>
              <button
                className="text-[8px] tracking-[3px] uppercase text-white bg-transparent border border-[rgba(201,168,76,.20)]
                  px-3 sm:px-5 py-2 sm:py-2.5 cursor-pointer transition-colors duration-200 hover:text-[#c9a84c] hover:border-[#c9a84c] shrink-0 ml-4"
                style={F_CINZEL}
                onClick={() => (window.location.href = "/ebooks")}
              >
                View All
              </button>
            </div>

            <div className="no-scrollbar flex gap-0.5 overflow-x-auto pb-6 px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)]">
              {allBooks.slice(0, 12).map((book, idx) => {
                const { display, original } = ebookPrice(book);
                const disc = original > display ? Math.round(((original - display) / original) * 100) : 0;
                const isWL = wish.has(book.id);
                return (
                  <div
                    key={book.id}
                    className="scard flex-none bg-[#1a1a1d] cursor-pointer transition-colors duration-200 hover:bg-[#1f1f23]"
                    style={{
                      width: "clamp(150px, calc((100vw - 32px) / 2.2), calc((100% - 4px) / 5))",
                      animationDelay: `${idx * 0.05}s`,
                    }}
                    onClick={() => (window.location.href = `/product/${book.slug}`)}
                  >
                    <div className="scard-img relative overflow-hidden bg-[#0f0f11]" style={{ aspectRatio: "3/4" }}>
                      {book.main_image ? (
                        <img
                          src={`${API_URL}${book.main_image}`}
                          alt={book.title}
                          loading="lazy"
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#131316]">
                          <BookIconSm />
                        </div>
                      )}
                      <span
                        className="absolute top-2 left-2 text-[6.5px] tracking-[1.5px] uppercase text-[#080809] bg-[#c9a84c] px-[6px] py-[3px]"
                        style={F_CINZEL}
                      >
                        eBook
                      </span>
                      {disc > 0 && (
                        <span className="absolute top-2 right-2 text-[8px] font-medium text-white bg-[#4a9a5a] px-1.5 py-[3px]" style={F_JOST}>
                          −{disc}%
                        </span>
                      )}
                      {/* ── Overlay with View + Cart + Wish ── */}
                      <div
                        className="scard-overlay absolute inset-0 opacity-0 flex flex-col items-center justify-end gap-1.5 p-2.5 sm:p-3"
                        style={{ background: "linear-gradient(to top,rgba(8,8,9,.9) 0%,transparent 55%)" }}
                      >
      
                        <div className="flex gap-1.5 w-full">
                          {/* Add to Cart */}
                          <button
                            className="flex-1 flex items-center justify-center gap-1 text-[7px] tracking-[1.5px] uppercase font-medium text-[#080809] bg-[#c9a84c] py-[6px] border-none cursor-pointer transition-colors duration-200 hover:bg-[#f5f0e8]"
                            style={F_JOST}
                            onClick={e => addCart(e, book)}
                            disabled={cartId === book.id}
                          >
                            {cartId === book.id
                              ? <span className="w-[8px] h-[8px] border border-[rgba(5,4,10,.4)] border-t-[#05040a] rounded-full animate-spin" />
                              : <>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                  </svg>
                                  Cart
                                </>
                            }
                          </button>
                          {/* Wishlist */}
                          <button
                            className={`w-[28px] flex items-center justify-center border cursor-pointer transition-all duration-200 ${isWL ? "wish-btn-active" : "text-[#8a8a8e] border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.4)]"}`}
                            onClick={e => toggleWish(e, book)}
                            aria-label="Wishlist"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill={isWL ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5 p-[10px_10px_12px] sm:p-[14px_13px_16px]">
                      {book.author_name && (
                        <p className="text-[7px] sm:text-[7.5px] tracking-[1.5px] uppercase text-[#8a6f2e] truncate" style={F_CINZEL}>
                          {book.author_name}
                        </p>
                      )}
                      <h3 className="clamp-2 text-[13px] sm:text-sm text-[#f5f0e8] leading-[1.25]" style={F_CORMORANT}>
                        {book.title}
                      </h3>
                      <div className="flex items-baseline gap-[6px] mt-0.5 sm:mt-1">
                        <span className="text-[12px] sm:text-[13px] font-medium text-[#c9a84c]" style={F_JOST}>{fmt(display)}</span>
                        {disc > 0 && (
                          <span className="text-[9px] sm:text-[10px] text-white line-through" style={F_JOST}>{fmt(original)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ════════ GENRE TABS + GRID ════════ */}
        <section id="ep-genres" className="pt-14 sm:pt-20">
          <div className="px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)]">
            <h2
              className="font-light leading-[1.05] text-[#f5f0e8]"
              style={{ ...F_CORMORANT, fontSize: "clamp(26px,4.5vw,52px)" }}
            >
              The <em className="italic text-[#c9a84c]">Complete</em> Collection
            </h2>
            <p className="text-[13px] text-white leading-[1.8] max-w-[480px] mt-2 sm:mt-3" style={F_JOST}>
              Every classic, organised by the genre that defines it.
            </p>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <>
              <div className="flex px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)] mt-6 sm:mt-8 border-b border-[rgba(201,168,76,0.10)] mb-8 sm:mb-12">
                {[90, 110, 75, 95, 120].map((w, i) => (
                  <div key={i} className="anim-shimmer h-[11px] mx-3 sm:mx-[26px] mb-4 rounded-sm" style={{ width: w }} />
                ))}
              </div>
              <div className="px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)]">
                <div className="grid gap-0.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-[#1a1a1d]">
                      <div className="anim-shimmer" style={{ aspectRatio: "3/4" }} />
                      <div className="flex flex-col gap-2 p-[12px_10px_14px] sm:p-[16px_14px_18px]">
                        <div className="anim-shimmer h-2 w-1/2 rounded-sm" />
                        <div className="anim-shimmer h-[13px] w-4/5 rounded-sm" />
                        <div className="anim-shimmer h-[13px] w-3/5 rounded-sm" />
                        <div className="anim-shimmer h-3.5 w-[35%] rounded-sm mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!loading && categories.length > 0 && (
            <>
              {/* Tab bar */}
              <div className="no-scrollbar flex overflow-x-auto px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)] border-b border-[rgba(201,168,76,0.10)] mt-6 sm:mt-8 mb-8 sm:mb-12">
                {categories.map(cat => (
                  <button
                    key={cat.category_id}
                    style={{ ...F_CINZEL, marginBottom: -1 }}
                    className={[
                      "text-[10px] sm:text-xs tracking-[2px] sm:tracking-[3px] uppercase px-3 sm:px-[26px] py-[12px] sm:py-[15px]",
                      "border-none bg-transparent cursor-pointer whitespace-nowrap transition-colors duration-200 border-b-2",
                      activeCategory === cat.category_id
                        ? "text-[#c9a84c] border-[#c9a84c]"
                        : "text-white border-transparent hover:text-[#e8dfd0]",
                    ].join(" ")}
                    onClick={() => setActiveCategory(cat.category_id)}
                  >
                    {cat.category_name}
                    <span className="ml-1 text-[10px] sm:text-xs" style={F_JOST}>({cat.books.length})</span>
                  </button>
                ))}
              </div>

              {activeCat && (
                <div className="px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)]" key={activeCat.category_id}>
                  <div className="grid gap-0.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {activeCat.books.map((book, idx) => {
                      const { display, original } = ebookPrice(book);
                      const hasD = original > display;
                      const disc = hasD ? Math.round(((original - display) / original) * 100) : 0;
                      const stars = book.avg_rating
                        ? Array.from({ length: 5 }, (_, i) => i < Math.round(book.avg_rating!) ? "★" : "☆").join("")
                        : null;
                      const isWL = wish.has(book.id);
                      return (
                        <div
                          key={book.id}
                          className="ep-card flex flex-col bg-[#1a1a1d] cursor-pointer transition-colors duration-200 hover:bg-[#1f1f23]"
                          style={{ animationDelay: `${idx * 0.04}s` }}
                          onClick={() => (window.location.href = `/product/${book.slug}`)}
                        >
                          <div className="ep-card-img relative overflow-hidden bg-[#131316]" style={{ aspectRatio: "3/4" }}>
                            {book.main_image ? (
                              <img
                                src={`${API_URL}${book.main_image}`}
                                alt={book.title}
                                loading="lazy"
                                className="w-full h-full object-cover block"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#0f0f11,#1a1a1d)" }}
                              >
                                <BookIcon />
                              </div>
                            )}
                            <span
                              className="absolute top-2 left-2 text-[7px] tracking-[2px] uppercase text-[#080809] bg-[#c9a84c] px-1.5 sm:px-2 py-[3px] sm:py-1"
                              style={F_CINZEL}
                            >
                              eBook
                            </span>
                            {disc > 0 && (
                              <span className="absolute top-2 right-2 text-[8px] font-medium text-white bg-[#4a9a5a] px-1.5 py-[3px]" style={F_JOST}>
                                −{disc}%
                              </span>
                            )}
                            {/* ── Overlay with View Details + Cart + Wish ── */}
                            <div
                              className="ep-card-overlay absolute inset-0 opacity-0 flex flex-col items-center justify-end gap-1.5 p-2.5 sm:p-3.5"
                              style={{ background: "linear-gradient(to top,rgba(8,8,9,.92) 0%,transparent 55%)" }}
                            >
   
                              <div className="flex gap-1.5 w-full">
                                {/* Add to Cart */}
                                <button
                                  className="flex-1 flex items-center justify-center gap-1 text-[7px] sm:text-[8px] tracking-[1.5px] uppercase font-medium text-[#080809] bg-[#c9a84c] py-[6px] sm:py-2 border-none cursor-pointer transition-colors duration-200 hover:bg-[#f5f0e8]"
                                  style={F_JOST}
                                  onClick={e => addCart(e, book)}
                                  disabled={cartId === book.id}
                                >
                                  {cartId === book.id
                                    ? <span className="w-[8px] h-[8px] border border-[rgba(5,4,10,.4)] border-t-[#05040a] rounded-full animate-spin" />
                                    : <>
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                        </svg>
                                        Add to Cart
                                      </>
                                  }
                                </button>
                                {/* Wishlist */}
                                <button
                                  className={`w-[30px] sm:w-[34px] flex items-center justify-center border cursor-pointer transition-all duration-200 ${isWL ? "wish-btn-active" : "text-[#8a8a8e] border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.4)]"}`}
                                  onClick={e => toggleWish(e, book)}
                                  aria-label="Wishlist"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill={isWL ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-[4px] sm:gap-[5px] p-[10px_10px_12px] sm:p-[16px_14px_18px] flex-1">
                            {book.author_name && (
                              <p className="text-[7px] sm:text-[7.5px] tracking-[1.5px] sm:tracking-[2px] uppercase text-[#8a6f2e] truncate" style={F_CINZEL}>
                                {book.author_name}
                              </p>
                            )}
                            <h3 className="clamp-2 text-[13px] sm:text-[15px] text-[#f5f0e8] leading-[1.28]" style={F_CORMORANT}>
                              {book.title}
                            </h3>
                            {stars && (
                              <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-white" style={F_JOST}>
                                <span className="text-[#c9a84c]">{stars}</span>
                                <span>{book.avg_rating?.toFixed(1)}</span>
                                {book.review_count > 0 && <span>({book.review_count})</span>}
                              </div>
                            )}
                            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto pt-1.5 sm:pt-2">
                              <span className="text-[13px] sm:text-[14px] font-medium text-[#c9a84c]" style={F_JOST}>{fmt(display)}</span>
                              {hasD && (
                                <span className="text-[10px] sm:text-[11px] text-white line-through" style={F_JOST}>{fmt(original)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* View all row */}
                  <div className="flex items-center gap-3 sm:gap-4 pt-8 sm:pt-10">
                    <div className="flex-1 h-[2px] bg-[rgba(201,168,76,0.6)]" />
                    <button
                      className="group flex items-center gap-2 sm:gap-2.5 text-[8px] tracking-[2px] sm:tracking-[3px] uppercase text-white bg-transparent border-2 border-[rgba(201,168,76,0.6)]
                        px-4 sm:px-6 py-2.5 sm:py-3 cursor-pointer whitespace-nowrap transition-colors duration-200 hover:text-[#c9a84c] hover:border-[#c9a84c]"
                      style={F_CINZEL}
                      onClick={() => (window.location.href = `/ebooks?category=${activeCat.category_slug}`)}
                    >
                      All {activeCat.category_name} eBooks
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </button>
                    <div className="flex-1 h-[2px] bg-[rgba(201,168,76,0.6)]" />
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ════════ WHY DIGITAL ════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 mx-4 sm:mx-8 md:mx-[clamp(20px,5vw,80px)] mt-14 sm:mt-20">
          <div className="bg-[#c9a84c] flex flex-col justify-center gap-4 p-8 sm:p-12 md:p-[clamp(40px,6vw,72px)_clamp(28px,4vw,56px)]">
            <h3
              className="font-light italic leading-[1.1] text-[#080809]"
              style={{ ...F_CORMORANT, fontSize: "clamp(28px,4vw,52px)" }}
            >
              A Library in Your Pocket
            </h3>
            <p className="text-[13px] text-[rgba(10,10,11,0.65)] leading-[1.8] max-w-[340px]" style={F_JOST}>
              No waiting for delivery. No shelf space needed. No damaged pages.
              Just pure, immersive reading anywhere, any time, on any screen.
            </p>
          </div>

          <div
            className="bg-[#131316] flex flex-col gap-5 sm:gap-6 border border-l-0 border-[rgba(201,168,76,0.10)]
              p-7 sm:p-10 md:p-[clamp(32px,5vw,64px)_clamp(24px,4vw,52px)]"
          >
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, title: "Any Device", desc: "Phone, tablet, laptop — your library syncs everywhere." },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: "Instant Access", desc: "Delivered the moment payment clears. No delays." },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>, title: "Lifetime Ownership", desc: "Pay once. It's yours forever. No renewals." },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: "Beautiful Typography", desc: "Professionally typeset for optimal readability." },
            ].map((w, i) => (
              <div key={i} className="flex gap-4 sm:gap-5 items-start">
                <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center border border-[rgba(201,168,76,.20)] text-[#c9a84c]">
                  {w.icon}
                </div>
                <div>
                  <h4 className="text-[9px] tracking-[2px] uppercase text-[#f5f0e8] mb-1 sm:mb-1.5" style={F_CINZEL}>{w.title}</h4>
                  <p className="text-[12px] text-white leading-[1.7]" style={F_JOST}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════ TESTIMONIAL ════════ */}
        <div
          className="bg-[#131316] border border-[rgba(201,168,76,0.10)] text-center mx-4 sm:mx-8 md:mx-[clamp(20px,5vw,80px)] mt-14 sm:mt-20
            p-8 sm:p-12 md:p-[clamp(40px,6vw,72px)_clamp(28px,5vw,80px)]"
        >
          <span className="block mb-5 sm:mb-7 opacity-50 leading-[.5] text-[#8a6f2e]"
            style={{ ...F_CORMORANT, fontSize: "clamp(48px,8vw,72px)" }}>
            "
          </span>
          <p
            className="font-light italic leading-[1.45] text-[#f5f0e8] max-w-[720px] mx-auto mb-5 sm:mb-7"
            style={{ ...F_CORMORANT, fontSize: "clamp(18px,3vw,38px)" }}
          >
            Reading is to the mind what exercise is to the body — and a library
            that fits in your pocket removes every excuse not to begin.
          </p>
          <span className="test-source flex items-center justify-center gap-3 text-[8px] tracking-[4px] uppercase text-[#c9a84c]" style={F_CINZEL}>
            AG Classics · Digital Edition
          </span>
        </div>

        {/* ════════ FEATURES GRID ════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 mx-4 sm:mx-8 md:mx-[clamp(20px,5vw,80px)] mt-14 sm:mt-20">
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>, title: "Instant Access", desc: "Available the second payment clears. Start reading immediately." },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, title: "All Devices", desc: "Phone, tablet, or laptop. Your books follow you." },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "Secure Payment", desc: "Bank-grade encryption via Razorpay on every transaction." },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: "Lifetime Access", desc: "Buy it today, keep it for life." },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-[#131316] p-7 sm:p-[32px_28px] border border-[rgba(201,168,76,0.10)] transition-colors duration-200 hover:bg-[#1a1a1d]"
            >
              <div className="text-[#c9a84c] mb-3 sm:mb-4">{f.icon}</div>
              <h4 className="text-base sm:text-lg tracking-[2px] uppercase text-[#f5f0e8] mb-1.5 sm:mb-2" style={F_CINZEL}>{f.title}</h4>
              <p className="text-sm text-white leading-[1.75]" style={F_JOST}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ════════ ORNAMENT ════════ */}
        <div className="flex items-center gap-3 px-4 sm:px-8 md:px-[clamp(20px,5vw,80px)] py-12 sm:py-16">
          <div className="flex-1 h-[2px]"
            style={{ background: "linear-gradient(to right,transparent,rgba(201,168,76,0.6),transparent)" }} />
          <div className="w-1.5 h-1.5 rotate-45 bg-[rgba(201,168,76,0.6)] flex-shrink-0" />
          <div className="flex-1 h-[2px]"
            style={{ background: "linear-gradient(to right,transparent,rgba(201,168,76,0.6),transparent)" }} />
        </div>

      </div>
    </>
  );
}

function BookIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function BookIconSm() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}