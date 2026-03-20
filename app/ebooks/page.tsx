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
interface HeroStats {
  total_ebooks: number;
  total_authors: number;
}

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function ebookPrice(book: Book): { display: number; original: number } {
  const eSell = book.ebook_sell_price !== null ? Number(book.ebook_sell_price) : null;
  const ePr   = book.ebook_price      !== null ? Number(book.ebook_price)      : null;
  return { display: eSell ?? Number(book.sell_price), original: ePr ?? Number(book.price) };
}

/* ─── Font families (used repeatedly) ─── */
const F_CORMORANT = { fontFamily: "'Cormorant Garamond', serif" } as const;
const F_CINZEL    = { fontFamily: "'Cinzel', serif" } as const;
const F_JOST      = { fontFamily: "'Jost', sans-serif" } as const;

/* ═══════════════════════════════════════════════════════════════════
   CONTINUOUS HERO CAROUSEL COMPONENT
═══════════════════════════════════════════════════════════════════ */
const HeroCarousel = ({ books, loading }: { books: Book[], loading: boolean }) => {
  const [progress, setProgress] = useState(0);
  const isPausedRef = useRef(false);

  // 60fps Continuous Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (!isPausedRef.current) {
        // Adjust this number to make it slide faster or slower
        setProgress((prev) => prev + 0.005); 
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Ensure we have enough items to loop seamlessly (at least 8 items for the math)
  let displayBooks = [...books];
  if (!loading && displayBooks.length > 0) {
    while (displayBooks.length < 8) {
      displayBooks = [...displayBooks, ...books];
    }
  } else if (loading) {
    displayBooks = Array(7).fill(null);
  }
  
  const total = displayBooks.length;

  return (
    <div 
      className="anim-fadeUp-3 relative w-full max-w-[1400px] py-40  mb-8 flex justify-center items-center z-10 perspective-1000"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
      onTouchStart={() => (isPausedRef.current = true)}
      onTouchEnd={() => (isPausedRef.current = false)}
    >
      {displayBooks.map((book, i) => {
        // Continuous shortest-path distance calculation
        let d = (i - progress) % total;
        if (d > total / 2) d -= total;
        if (d < -total / 2) d += total;

        const absD = Math.abs(d);
        
        // Fade out smoothly as it reaches the edge to hide the wrap-around teleport
        const opacity = Math.max(0, Math.min(1, 3.7 - absD));
        
        // Performance optimization: don't render invisible items
        if (opacity <= 0) return null; 

        // 3D Math Logic
        const translateX = d * 100; // Horizontal spread
        const translateY = 0; // Moves outer items down slightly
        const scale = 0.85 + (absD * 0.12); // Inverted Scale: outer is larger
        const zIndex = Math.round(50 + absD * 10); // Outer overlaps inner

        return (
          <div 
            key={book ? `${book.id}-${i}` : `skel-${i}`}
            className="absolute w-[20vw] max-w-[180px] rounded-sm overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-[rgba(201,168,76,0.15)] bg-[#131316] cursor-pointer"
            style={{
              // NOTE: No CSS transitions here! It updates instantly every frame via JS.
              transform: `translateX(${translateX}%) translateY(${translateY}%) scale(${scale})`,
              zIndex: zIndex,
              opacity: opacity,
              pointerEvents: opacity > 0.5 ? 'auto' : 'none',
            }}
            onClick={() => {
              if (book) window.location.href = `/product/${book.slug}`;
            }}
          >
            {book ? (
              <div className="w-full h-full relative group">
                <img 
                  src={`${API_URL}${book.main_image}`} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  style={{ filter: absD < 0.8 ? 'brightness(1.09)' : 'brightness(0.9) saturate(0.7)' }}
                />
                {absD >= 0.8 && <div className="absolute inset-0 bg-black/4 group-hover:bg-transparent transition-colors duration-500" />}
                {absD < 0.8 && <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(201,168,76,0.3)] pointer-events-none" />}
              </div>
            ) : (
              <div className="w-full h-full anim-shimmer aspect-[3/4]" />
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
  const [stats, setStats]                   = useState<HeroStats | null>(null);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [featuredBook, setFeaturedBook]     = useState<Book | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/ag-classics/ebooks/hero-stats`)
      .then(r => r.json()).then(setStats).catch(console.error);
  }, []);

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

  const activeCat = categories.find(c => c.category_id === activeCategory);
  const allBooks  = categories.flatMap(c => c.books);

  return (
    <>
      {/* ── Minimal style block: only keyframes, pseudo-elements, webkit-only props ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;500;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes ep-fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ep-fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes ep-marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes ep-shimmer { from{background-position:-400% 0} to{background-position:400% 0} }
        @keyframes ep-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ep-glow    { 0%,100%{box-shadow:0 0 30px rgba(201,168,76,.06)} 50%{box-shadow:0 0 60px rgba(201,168,76,.16)} }
        @keyframes ep-countUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .anim-fadeUp-0 { animation:ep-fadeUp .9s ease both; }
        .anim-fadeUp-1 { animation:ep-fadeUp .9s ease .12s both; }
        .anim-fadeUp-2 { animation:ep-fadeUp .9s ease .24s both; }
        .anim-fadeUp-3 { animation:ep-fadeUp .9s ease .36s both; }
        .anim-fadeUp-4 { animation:ep-fadeUp .9s ease .48s both; }
        .anim-fadeIn   { animation:ep-fadeIn 2s ease 1s both; }
        .anim-countUp  { animation:ep-countUp .8s ease .5s both; }
        .anim-glow     { animation:ep-glow 4s ease infinite; }
        .anim-marquee  { animation:ep-marquee 40s linear infinite; }
        .anim-float    { animation:ep-float 2s ease infinite; }
        .anim-shimmer  {
          background:linear-gradient(90deg,#131316 0%,#1f1f23 50%,#131316 100%);
          background-size:400% 100%;
          animation:ep-shimmer 1.6s ease infinite;
        }

        /* webkit-only / pseudo — no Tailwind equivalent */
        .hero-deco {
          position:absolute; right:-2vw; top:50%; transform:translateY(-50%);
          font-size:clamp(200px,28vw,420px); font-weight:300; line-height:1;
          color:transparent; -webkit-text-stroke:1px rgba(201,168,76,0.05);
          user-select:none; pointer-events:none; letter-spacing:-4px;
        }
        .hero-lines {
          position:absolute; inset:0; pointer-events:none; opacity:.025;
          background-image:repeating-linear-gradient(90deg,rgba(201,168,76,1) 0px,rgba(201,168,76,1) 1px,transparent 1px,transparent 100px);
        }
        .hero-glow {
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 90% 70% at 50% -5%,rgba(201,168,76,.09) 0%,transparent 65%),
            radial-gradient(ellipse 50% 50% at 15% 90%,rgba(201,168,76,.05) 0%,transparent 60%),
            radial-gradient(ellipse 40% 40% at 85% 80%,rgba(138,111,46,.04) 0%,transparent 55%);
        }
        .how-num {
          font-size:64px; font-weight:300; line-height:1; display:block; margin-bottom:20px;
          color:transparent; -webkit-text-stroke:1px rgba(201,168,76,.15);
          transition:-webkit-text-stroke-color .2s;
        }
        .how-step:hover .how-num { -webkit-text-stroke-color:rgba(201,168,76,.35); }

        /* line-clamp (needs -webkit-box) */
        .clamp-2 {
          display:-webkit-box; -webkit-line-clamp:2;
          -webkit-box-orient:vertical; overflow:hidden;
        }

        /* scrollbar hide */
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { scrollbar-width:none; }

        /* spotlight label line */
        .spotlight-label::after { content:''; flex:1; height:1px; background:rgba(201,168,76,.20); }

        /* test-source lines */
        .test-source::before,.test-source::after { content:''; width:40px; height:1px; background:#8a6f2e; display:block; }

        /* eyebrow lines */
        .eyebrow-line-l { width:36px; height:1px; background:linear-gradient(to right,#8a6f2e,transparent); }
        .eyebrow-line-r { width:36px; height:1px; background:linear-gradient(to left,#8a6f2e,transparent); }

        /* how connector arrow */
        @media(min-width:900px){ .how-arrow{ display:block !important; } }

        /* hover states that need group or complex selectors */
        .scard:hover .scard-img img  { transform:scale(1.05); filter:brightness(.8); }
        .scard:hover .scard-overlay  { opacity:1; }
        .ep-card:hover .ep-card-img img { transform:scale(1.05); filter:brightness(.75); }
        .ep-card:hover .ep-card-overlay { opacity:1; }
        .spotlight-cover:hover img   { transform:scale(1.04); filter:brightness(.65) saturate(.9); }

        .scard-img img, .ep-card-img img, .spotlight-cover img {
          transition:transform .4s ease, filter .4s ease;
        }
        .scard-overlay, .ep-card-overlay { transition:opacity .3s; }
      `}</style>

      <div className="bg-[#080809] min-h-screen text-[#f5f0e8] overflow-x-hidden" style={F_JOST}>

        {/* ════════ HERO ════════ */}
        <section 
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-[#080809] pt-[140px] pb-20"
        >
          {/* ── Dynamic Background ── */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1000px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_60%)] blur-3xl pointer-events-none" />
          
          <div className="absolute inset-0 pointer-events-none"
               style={{
                 backgroundImage: `linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)`,
                 backgroundSize: "4rem 4rem",
                 WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, #000 20%, transparent 100%)"
               }} 
          />

          {/* ── Main Content ── */}
          <div className="relative z-10 w-full flex flex-col items-center px-4">


            {/* Headline */}
            <h1 className="anim-fadeUp-1 font-light leading-[1.05] text-[#f5f0e8] max-w-[900px] m-0"
                style={{ ...F_CORMORANT, fontSize: "clamp(44px,7vw,75px)" }}>
              Build a Digital Library of <br className="hidden sm:block" /> 
              <em className="italic text-[#c9a84c]"> Timeless Classics</em>
            </h1>

            {/* Subheadline */}
            <p className="anim-fadeUp-2 text-white leading-[1.6] max-w-[700px] mt-3"
               style={{ ...F_JOST, fontSize: "clamp(12px,1.5vw,17px)" }}>
              Experience the world's greatest literature, flawlessly formatted for your favorite device. 
              Access our premium eBooks instantly and carry a masterfully curated library wherever you go.
            </p>



            {/* ── CONTINUOUS CAROUSEL INSERTED HERE ── */}
            <HeroCarousel books={allBooks} loading={loading} />

            {/* ── Left Annotation Arrow & CTA Bottom ── */}
            <div className="anim-fadeUp-4 relative mt-4 md:mt-8 flex justify-center items-center w-full z-20">
              
              
              <button 
                className="text-[11px] sm:text-[13px] tracking-[2px] uppercase font-bold bg-[#c9a84c] text-[#080809] px-10 py-4 sm:px-14 sm:py-5 rounded-full shadow-[0_0_30px_rgba(201,168,76,0.25)] transition-all duration-300 hover:scale-105 hover:bg-[#f5f0e8]" 
                style={F_JOST} 
                onClick={() => document.getElementById("ep-genres")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse by Genre
              </button>
            </div>

          </div>
        </section>


        <FeaturedEbookSpotlight book={featuredBook} loading={loading} />

        {/* ════════ NEW ARRIVALS STRIP ════════ */}
        {!loading && allBooks.length > 0 && (
          <section className="pt-20">
            <div className="flex items-end justify-between mb-9 px-[clamp(20px,5vw,80px)]">
              <div>
                <h2 className="font-light leading-[1.05] text-[#f5f0e8]"
                    style={{ ...F_CORMORANT, fontSize: "clamp(26px,3.5vw,40px)" }}>
                  Fresh to the <em className="italic text-[#c9a84c]">Collection</em>
                </h2>
              </div>
              <button
                className="text-[8px] tracking-[3px] uppercase text-white bg-transparent border border-[rgba(201,168,76,.20)] px-5 py-2.5 cursor-pointer transition-colors duration-200 hover:text-[#c9a84c] hover:border-[#c9a84c]"
                style={F_CINZEL}
                onClick={() => window.location.href = "/ebooks"}>
                View All
              </button>
            </div>

            <div className="no-scrollbar flex gap-0.5 overflow-x-auto pb-6 px-[clamp(20px,5vw,80px)]">
              {allBooks.slice(0, 12).map((book, idx) => {
                const { display, original } = ebookPrice(book);
                const disc = original > display ? Math.round(((original - display) / original) * 100) : 0;
                return (
                  <div 
                    key={book.id} 
                    className="scard flex-none bg-[#1a1a1d] cursor-pointer transition-colors duration-200 hover:bg-[#1f1f23]"
                    style={{ 
                      width: "max(140px, calc((100% - 8px) / 5))", 
                      animationDelay: `${idx * 0.05}s` 
                    }}
                    onClick={() => window.location.href = `/product/${book.slug}`}
                  >
                    <div className="scard-img relative overflow-hidden bg-[#0f0f11]" >
                      {book.main_image ? (
                        <img src={`${API_URL}${book.main_image}`} alt={book.title} loading="lazy"
                             className="w-full h-full object-cover block p-12" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#131316]">
                          <BookIconSm />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-[6.5px] tracking-[1.5px] uppercase text-[#080809] bg-[#c9a84c] px-[7px] py-[3px]"
                            style={F_CINZEL}>eBook</span>
                      {disc > 0 && (
                        <span className="absolute top-2 right-2 text-[8px] font-medium text-white bg-[#4a9a5a] px-1.5 py-[3px]"
                              style={F_JOST}>−{disc}%</span>
                      )}
                      <div className="scard-overlay absolute inset-0 opacity-0 flex items-end p-3"
                           style={{ background: "linear-gradient(to top,rgba(8,8,9,.9) 0%,transparent 55%)" }}>
                        <button
                          className="w-full text-[8px] tracking-[2px] uppercase font-medium text-[#080809] bg-[#c9a84c] py-[7px] border-none cursor-pointer transition-colors duration-200 hover:bg-[#f5f0e8]"
                          style={F_JOST}
                          onClick={e => { e.stopPropagation(); window.location.href = `/product/${book.slug}`; }}>
                          View
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 p-[14px_13px_16px]">
                      {book.author_name && (
                        <p className="text-[7.5px] tracking-[1.5px] uppercase text-[#8a6f2e] truncate" style={F_CINZEL}>
                          {book.author_name}
                        </p>
                      )}
                      <h3 className="clamp-2 text-sm text-[#f5f0e8] leading-[1.25]" style={F_CORMORANT}>
                        {book.title}
                      </h3>
                      <div className="flex items-baseline gap-[7px] mt-1">
                        <span className="text-[13px] font-medium text-[#c9a84c]" style={F_JOST}>{fmt(display)}</span>
                        {disc > 0 && (
                          <span className="text-[10px] text-white line-through" style={F_JOST}>{fmt(original)}</span>
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
        <section id="ep-genres" className="pt-20">
          <div className="px-[clamp(20px,5vw,80px)]">
            <h2 className="font-light leading-[1.05] text-[#f5f0e8]"
                style={{ ...F_CORMORANT, fontSize: "clamp(30px,4.5vw,52px)" }}>
              The <em className="italic text-[#c9a84c]">Complete</em> Collection
            </h2>
            <p className="text-[13px] text-white leading-[1.8] max-w-[480px] mt-3" style={F_JOST}>
              Every classic, organised by the genre that defines it.
            </p>
          </div>

          {/* Skeleton */}
          {loading && (
            <>
              <div className="flex px-[clamp(20px,5vw,80px)] mt-8 border-b border-[rgba(201,168,76,0.10)] mb-12">
                {[90,110,75,95,120].map((w, i) => (
                  <div key={i} className="anim-shimmer h-[11px] mx-[26px] mb-4 rounded-sm" style={{ width: w }} />
                ))}
              </div>
              <div className="px-[clamp(20px,5vw,80px)]">
                <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))" }}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-[#1a1a1d]">
                      <div className="anim-shimmer" style={{ aspectRatio: "3/4" }} />
                      <div className="flex flex-col gap-2 p-[16px_14px_18px]">
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
              <div className="no-scrollbar flex overflow-x-auto px-[clamp(20px,5vw,80px)] border-b border-[rgba(201,168,76,0.10)] mt-8 mb-12">
                {categories.map(cat => (
                  <button key={cat.category_id}
                    style={{ ...F_CINZEL, marginBottom: -1 }}
                    className={`text-xs tracking-[3px] uppercase px-[26px] py-[15px] border-none bg-transparent cursor-pointer whitespace-nowrap transition-colors duration-200 border-b-2
                      ${activeCategory === cat.category_id
                        ? "text-[#c9a84c] border-[#c9a84c]"
                        : "text-white border-transparent hover:text-[#e8dfd0]"}`}
                    onClick={() => setActiveCategory(cat.category_id)}>
                    {cat.category_name}
                    <span className="ml-1.5 text-xs" style={F_JOST}>({cat.books.length})</span>
                  </button>
                ))}
              </div>

              {activeCat && (
                <div className="px-[clamp(20px,5vw,80px)]" key={activeCat.category_id}>
                  <div className="grid gap-0.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {activeCat.books.map((book, idx) => {
                      const { display, original } = ebookPrice(book);
                      const hasD = original > display;
                      const disc = hasD ? Math.round(((original - display) / original) * 100) : 0;
                      const stars = book.avg_rating
                        ? Array.from({ length: 5 }, (_, i) => i < Math.round(book.avg_rating!) ? "★" : "☆").join("")
                        : null;
                      return (
                        <div key={book.id}
                              className="ep-card flex flex-col bg-[#1a1a1d] cursor-pointer transition-colors duration-200 hover:bg-[#1f1f23]"
                              style={{ animationDelay: `${idx * 0.04}s` }}
                              onClick={() => window.location.href = `/product/${book.slug}`}>
                          <div className="ep-card-img relative overflow-hidden bg-[#131316]" >
                            {book.main_image ? (
                              <img src={`${API_URL}${book.main_image}`} alt={book.title}
                                    loading="lazy" className="w-full h-full object-cover block p-12 py-7" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg,#0f0f11,#1a1a1d)" }}>
                                <BookIcon />
                              </div>
                            )}
                            <span className="absolute top-2.5 left-2.5 text-[7px] tracking-[2px] uppercase text-[#080809] bg-[#c9a84c] px-2 py-1"
                                  style={F_CINZEL}>eBook</span>
                            {disc > 0 && (
                              <span className="absolute top-2.5 right-2.5 text-[8px] font-medium text-white bg-[#4a9a5a] px-1.5 py-[3px]"
                                    style={F_JOST}>−{disc}%</span>
                            )}
                            <div className="ep-card-overlay absolute inset-0 opacity-0 flex items-end p-3.5"
                                  style={{ background: "linear-gradient(to top,rgba(8,8,9,.92) 0%,transparent 55%)" }}>
                              <button
                                className="w-full text-[9px] tracking-[2px] uppercase font-medium text-[#080809] bg-[#c9a84c] py-2.5 border-none cursor-pointer transition-colors duration-200 hover:bg-[#f5f0e8]"
                                style={F_JOST}
                                onClick={e => { e.stopPropagation(); window.location.href = `/product/${book.slug}`; }}>
                                View Details
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-[5px] p-[16px_14px_18px] flex-1">
                            {book.author_name && (
                              <p className="text-[7.5px] tracking-[2px] uppercase text-[#8a6f2e] truncate" style={F_CINZEL}>
                                {book.author_name}
                              </p>
                            )}
                            <h3 className="clamp-2 text-[15px] text-[#f5f0e8] leading-[1.28]" style={F_CORMORANT}>
                              {book.title}
                            </h3>
                            {stars && (
                              <div className="flex items-center gap-1.5 text-[10px] text-white" style={F_JOST}>
                                <span className="text-[#c9a84c]">{stars}</span>
                                <span>{book.avg_rating?.toFixed(1)}</span>
                                {book.review_count > 0 && <span>({book.review_count})</span>}
                              </div>
                            )}
                            <div className="flex items-baseline gap-2 mt-auto pt-2">
                              <span className="text-[14px] font-medium text-[#c9a84c]" style={F_JOST}>{fmt(display)}</span>
                              {hasD && (
                                <span className="text-[11px] text-white line-through" style={F_JOST}>{fmt(original)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* View all row */}
                  <div className="flex items-center gap-4 pt-10">
                    <div className="flex-1 h-[2px] bg-[rgba(201,168,76,0.6)]" />
                    <button
                      className="group flex items-center gap-2.5 text-[8px] tracking-[3px] uppercase text-white bg-transparent border-2 border-[rgba(201,168,76,0.6)] px-6 py-3 cursor-pointer whitespace-nowrap transition-colors duration-200 hover:text-[#c9a84c] hover:border-[#c9a84c]"
                      style={F_CINZEL}
                      onClick={() => window.location.href = `/ebooks?category=${activeCat.category_slug}`}>
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

        {/* ════════ HOW IT WORKS ════════ */}
        <section className="pt-20 px-[clamp(20px,5vw,80px)]">

          <h2 className="font-light leading-[1.05] text-[#f5f0e8]"
              style={{ ...F_CORMORANT, fontSize: "clamp(30px,4.5vw,52px)" }}>
            Start Reading in <em className="italic text-[#c9a84c]">Seconds</em>
          </h2>
          <p className="text-[13px] text-white leading-[1.8] max-w-[480px] mt-3" style={F_JOST}>
            Four simple steps between you and your next great read.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 mt-12">
            {[
              { n:"01", title:"Browse",
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
                desc:"Explore hundreds of timeless classics organised by genre, author, and era." },
              { n:"02", title:"Purchase",
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                desc:"Secure checkout via Razorpay — credit card, UPI, or NetBanking accepted." },
              { n:"03", title:"Access",
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>,
                desc:"Your eBook appears instantly in My Books. Read it Instantly — your choice." },
              { n:"04", title:"Read Forever",
                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
                desc:"No subscriptions. No expiry. Your library lives in your account permanently." },
            ].map((s, i) => (
              <div key={i}
                   className="how-step relative bg-[#131316] p-[40px_32px] border border-r-0 last:border-r border-[rgba(201,168,76,0.10)] transition-colors duration-200 hover:bg-[#1a1a1d]">
                <span className="how-num" style={F_CORMORANT}>{s.n}</span>
                <div className="text-[#c9a84c] mb-4">{s.icon}</div>
                <h4 className="text-[10px] tracking-[2px] uppercase text-[#f5f0e8] mb-2.5" style={F_CINZEL}>
                  {s.title}
                </h4>
                <p className="text-[12px] text-white leading-[1.75]" style={F_JOST}>{s.desc}</p>
                <span className="how-arrow hidden absolute right-[-12px] top-1/2 -translate-y-1/2 text-[#8a6f2e] text-[18px] z-10">
                  ›
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ WHY DIGITAL ════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 mx-[clamp(20px,5vw,80px)] mt-20">
          {/* Left — gold bg */}
          <div className="bg-[#c9a84c] flex flex-col justify-center gap-4"
               style={{ padding: "clamp(40px,6vw,72px) clamp(28px,4vw,56px)" }}>

            <h3 className="font-light italic leading-[1.1] text-[#080809]"
                style={{ ...F_CORMORANT, fontSize: "clamp(32px,4vw,52px)" }}>
              A Library in Your Pocket
            </h3>
            <p className="text-[13px] text-[rgba(10,10,11,0.65)] leading-[1.8] max-w-[340px]" style={F_JOST}>
              No waiting for delivery. No shelf space needed. No damaged pages.
              Just pure, immersive reading anywhere, any time, on any screen.
            </p>
          </div>

          {/* Right — dark bg */}
          <div className="bg-[#131316] flex flex-col gap-6 border border-l-0 border-[rgba(201,168,76,0.10)]"
               style={{ padding: "clamp(32px,5vw,64px) clamp(24px,4vw,52px)" }}>
            {[
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
                title:"Any Device", desc:"Phone, tablet, laptop your library syncs everywhere." },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                title:"Instant Access", desc:"Delivered the moment payment clears. No delays, no waiting." },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
                title:"Lifetime Ownership", desc:"Pay once. It's yours forever. No renewals, no subscriptions." },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
                title:"Beautiful Typography", desc:"Professionally typeset for optimal readability on every screen." },
            ].map((w, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-[rgba(201,168,76,.20)] text-[#c9a84c]">
                  {w.icon}
                </div>
                <div>
                  <h4 className="text-[9px] tracking-[2px] uppercase text-[#f5f0e8] mb-1.5" style={F_CINZEL}>
                    {w.title}
                  </h4>
                  <p className="text-[12px] text-white leading-[1.7]" style={F_JOST}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════ TESTIMONIAL ════════ */}
        <div className="bg-[#131316] border border-[rgba(201,168,76,0.10)] text-center mx-[clamp(20px,5vw,80px)] mt-20"
             style={{ padding: "clamp(40px,6vw,72px) clamp(28px,5vw,80px)" }}>
          <span className="block mb-7 opacity-50 leading-[.5] text-[#8a6f2e]"
                style={{ ...F_CORMORANT, fontSize: 72 }}>
            "
          </span>
          <p className="font-light italic leading-[1.45] text-[#f5f0e8] max-w-[720px] mx-auto mb-7"
             style={{ ...F_CORMORANT, fontSize: "clamp(22px,3.5vw,38px)" }}>
            Reading is to the mind what exercise is to the body and a library
            that fits in your pocket removes every excuse not to begin.
          </p>
          <span className="test-source flex items-center justify-center gap-3 text-[8px] tracking-[4px] uppercase text-[#c9a84c]"
                style={F_CINZEL}>
            AG Classics · Digital Edition
          </span>
        </div>

        {/* ════════ FEATURES ════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 mx-[clamp(20px,5vw,80px)] mt-20">
          {[
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>,
              title:"Instant Access", desc:"Available the second payment clears. Start reading immediately." },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
              title:"All Devices", desc:"Phone, tablet, Kindle, or laptop. Your books follow you." },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              title:"Secure Payment", desc:"Bank-grade encryption via Razorpay on every transaction." },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              title:"Lifetime Access", desc:"No subscription required. Buy once and it's yours forever." },
          ].map((f, i) => (
            <div key={i}
                 className="bg-[#131316] p-[32px_28px] border border-[rgba(201,168,76,0.10)] transition-colors duration-200 hover:bg-[#1a1a1d]">
              <div className="text-[#c9a84c] mb-4">{f.icon}</div>
              <h4 className="text-lg tracking-[2px] uppercase text-[#f5f0e8] mb-2" style={F_CINZEL}>
                {f.title}
              </h4>
              <p className="text-sm text-white leading-[1.75]" style={F_JOST}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ════════ ORNAMENT ════════ */}
        <div className="flex items-center gap-3 px-[clamp(20px,5vw,80px)] py-16">
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

/* ─── Small icon helpers ─── */
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