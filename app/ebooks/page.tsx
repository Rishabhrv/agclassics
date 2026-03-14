"use client";

import { useEffect, useState } from "react";
import { ParallaxLayer, MagneticBtn, RevealText } from "@/components/motion/Motionutils";
import CategoryBookSlider, { SliderBook } from "@/components/book/Categorybookslider";
import ProductSlider from "@/components/home/Productslider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ─── Types ─────────────────────────────────────────────────────── */
interface CategoryWithBooks {
  category_id: number;
  category_name: string;
  category_slug: string;
  books: SliderBook[];
}

interface HeroStats {
  total_ebooks: number;
  total_authors: number;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function EbooksPage() {
  const [categories, setCategories]     = useState<CategoryWithBooks[]>([]);
  const [stats, setStats]               = useState<HeroStats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]               = useState<string | null>(null);

  /* fetch hero stats */
  useEffect(() => {
    fetch(`${API_URL}/api/ag-classics/ebooks/hero-stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  /* fetch categories + books */
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/ag-classics/ebooks/categories`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then((d) => setCategories(d.categories ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer     { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes marqueeRun  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes countUp     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerSweep{ from{left:-50%} to{left:150%} }

        .anim-fade-0 { animation: fadeUp .8s ease 0s both; }
        .anim-fade-2 { animation: fadeUp 1s ease .2s both; }
        .anim-fade-4 { animation: fadeUp 1s ease .4s both; }
        .anim-marquee{ animation: marqueeRun 30s linear infinite; }
        .anim-shimmer{ animation: shimmer 1.8s infinite; background-size:200% 100%; }
        .anim-count  { animation: countUp .7s ease .5s both; }

        .hero-eyebrow::before,.hero-eyebrow::after {
          content:''; display:block; width:40px; height:1px; background:#8a6f2e; flex-shrink:0;
        }
        .mag-cta { position:relative; overflow:hidden; }
        .mag-cta::after {
          content:''; position:absolute; top:0; width:40%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);
        }
        .mag-cta:hover::after { animation:shimmerSweep .55s ease; }

        .cat-skeleton-track {
          display:flex; gap:20px;
          padding:4px clamp(16px,3.5vw,48px) 16px;
          overflow:hidden;
        }
        .cat-skeleton-card { flex:0 0 200px; background:#1c1c1e; }
        @media (max-width:640px) { .cat-skeleton-card { flex:0 0 155px; } }
      `}</style>

      <div
        className="min-h-screen pt-[130px] pb-16"
        style={{ color: "#e8e0d0", fontFamily: "'Jost', sans-serif" }}
      >

        {/* ════════════════════════════
            HERO
        ════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pb-20 pt-[30px] overflow-hidden">

          <p
            className="hero-eyebrow anim-fade-0 flex items-center gap-4 mb-5 text-[10px] tracking-[6px] uppercase"
            style={{ color: "#c9a84c", fontFamily: "'Jost', sans-serif" }}
          >
            Digital · Instant · Timeless
          </p>

          <h1
            className="font-light leading-none tracking-[-1px] mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px,8vw,100px)", color: "#f5f0e8" }}
          >
            <RevealText text="The Digital" delay={0.3} />
            {" "}
            <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
              <RevealText text="Library" delay={0.48} />
            </em>
          </h1>

          <p
            className="anim-fade-2 italic mt-5 mb-10 max-w-[520px] leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px,2.2vw,20px)", color: "#6b6b70" }}
          >
            Classic literature organised by genre — beautifully formatted,
            <br />instantly downloadable.
          </p>

          {/* Stats */}
          {!statsLoading && stats && (
            <div
              className="anim-fade-4 flex gap-14 mb-10"
              style={{ borderTop: "1px solid rgba(201,168,76,.12)", paddingTop: 24 }}
            >
              {[
                { num: `${stats.total_ebooks}+`, label: "Titles Available" },
                { num: `${stats.total_authors}+`, label: "Celebrated Authors" },
                { num: "∞", label: "Devices Supported" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="anim-count" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 300, color: "#c9a84c", lineHeight: 1, display: "block" }}>
                    {s.num}
                  </span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#6b6b70" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <ParallaxLayer depth={10} style={{ position: "relative", zIndex: 10, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            <MagneticBtn
              className="mag-cta"
              style={{ fontFamily: "'Jost',sans-serif", color: "#0a0a0b", background: "#c9a84c", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", padding: "14px 36px", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
              onClick={() => document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              Browse by Genre
            </MagneticBtn>
            <MagneticBtn
              className="mag-cta"
              style={{ fontFamily: "'Jost',sans-serif", color: "#6b6b70", background: "transparent", border: "1px solid rgba(201,168,76,.25)", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", padding: "14px 36px", fontWeight: 300 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; e.currentTarget.style.color = "#c9a84c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,.25)"; e.currentTarget.style.color = "#6b6b70"; }}
              onClick={() => { window.location.href = "/"; }}
            >
              View Classics
            </MagneticBtn>
          </ParallaxLayer>
        </section>

        {/* ════════════════════════════
            MARQUEE
        ════════════════════════════ */}
        <div
          className="overflow-hidden py-[13px]"
          style={{ background: "#1c1c1e", borderTop: "1px solid rgba(201,168,76,.1)", borderBottom: "1px solid rgba(201,168,76,.1)" }}
        >
          <div className="anim-marquee flex gap-12 w-max">
            {[...Array(2)].map((_, i) =>
              ["Classic Fiction", "Philosophy", "Poetry", "History", "Drama",
                "Science", "Adventure", "Mythology", "Essays", "Biography"].map((t, j) => (
                <div key={`${i}-${j}`} className="flex items-center gap-12 whitespace-nowrap text-[10px] tracking-[4px] uppercase" style={{ fontFamily: "'Cinzel',serif", color: "#6b6b70" }}>
                  <span>{t}</span>
                  <div className="w-1 h-1 rotate-45 flex-shrink-0" style={{ background: "#8a6f2e" }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ════════════════════════════
            CATEGORIES + SLIDERS
        ════════════════════════════ */}
        <div id="categories-section" style={{ paddingBottom: 48 }}>

          {/* Loading skeleton */}
          {loading && [...Array(3)].map((_, ci) => (
            <section key={ci} style={{ padding: "52px 0 0", borderTop: ci > 0 ? "1px solid rgba(201,168,76,.1)" : "none" }}>
              <div style={{ paddingLeft: "clamp(16px,3.5vw,48px)", marginBottom: 28 }}>
                <div className="anim-shimmer" style={{ height: 10, width: 80, background: "linear-gradient(90deg,#1c1c1e 0%,#2a2a2d 50%,#1c1c1e 100%)", marginBottom: 12 }} />
                <div className="anim-shimmer" style={{ height: 30, width: 240, background: "linear-gradient(90deg,#1c1c1e 0%,#2a2a2d 50%,#1c1c1e 100%)" }} />
              </div>
              <div className="cat-skeleton-track">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="cat-skeleton-card">
                    <div className="anim-shimmer" style={{ aspectRatio: "3/4", background: "linear-gradient(90deg,#1c1c1e 0%,rgba(201,168,76,.04) 50%,#1c1c1e 100%)" }} />
                    <div style={{ padding: "14px 14px 16px" }}>
                      <div className="anim-shimmer" style={{ height: 8, width: "60%", background: "linear-gradient(90deg,#222 0%,#2a2a2d 50%,#222 100%)", marginBottom: 8 }} />
                      <div className="anim-shimmer" style={{ height: 14, width: "85%", background: "linear-gradient(90deg,#222 0%,#2a2a2d 50%,#222 100%)", marginBottom: 8 }} />
                      <div className="anim-shimmer" style={{ height: 12, width: "40%", background: "linear-gradient(90deg,#222 0%,#2a2a2d 50%,#222 100%)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-4 text-center py-24 px-6">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: "italic", color: "#f5f0e8" }}>Could not load the library</h3>
              <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: "#6b6b70", maxWidth: 280 }}>{error}</p>
              <MagneticBtn className="mag-cta mt-2"
                style={{ fontFamily: "'Jost',sans-serif", color: "#0a0a0b", background: "#c9a84c", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", padding: "12px 32px", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
                onClick={() => window.location.reload()}
              >
                Try Again
              </MagneticBtn>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && categories.length === 0 && (
            <div className="flex flex-col items-center gap-4 text-center py-24 px-6">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: "italic", color: "#f5f0e8" }}>The digital shelves await</h3>
              <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: "#6b6b70", maxWidth: 280 }}>No e-books available yet. Check back soon.</p>
            </div>
          )}

          {/* ── Category sliders ── */}
          {!loading && !error && categories.map((cat, idx) => (
                      <ProductSlider
                        categorySlug={cat.category_slug}
                        eyebrow="Genre"
                        title={cat.category_name}
                        description={`Discover the best ${cat.category_name} books from the AG Classics collection.`}
                        visibleCount={5}
                      />
          ))}
        </div>

        {/* ════════════════════════════
            QUOTE BANNER
        ════════════════════════════ */}
        {!loading && !error && categories.length > 0 && (
          <section
            className="relative text-center overflow-hidden px-12 py-24 max-md:px-6 max-md:py-16"
          >
            <ParallaxLayer depth={18}>
              <p
                className="relative font-light italic max-w-[700px] mx-auto mb-5 leading-[1.5]"
                style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,3vw,36px)", color: "#f5f0e8" }}
              >
                "Not all those who wander are lost — but all those who read arrive everywhere."
              </p>
            </ParallaxLayer>
            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: "#c9a84c" }}>
              — AG Classics
            </span>
          </section>
        )}

        {/* ════════════════════════════
            FEATURES STRIP
        ════════════════════════════ */}
        <div
          className="grid gap-px mx-12 mt-16 border max-md:grid-cols-2 max-md:mx-6 max-sm:grid-cols-1 max-sm:mx-0"
          style={{ gridTemplateColumns: "repeat(4,1fr)", background: "rgba(201,168,76,.08)", borderColor: "rgba(201,168,76,.08)" }}
        >
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>, title: "Instant Download", desc: "Available immediately after purchase. Start reading in seconds." },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, title: "All Devices", desc: "Phone, tablet, laptop, Kindle — your library everywhere." },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "Secure Payments", desc: "Encrypted checkout via Razorpay. 100% safe transactions." },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: "Lifetime Access", desc: "Purchase once, read forever. No subscriptions required." },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-[16px] p-8 transition-colors duration-300" style={{ background: "#1c1c1e" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1c1c1e")}
            >
              <div style={{ color: "#c9a84c", flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
              <div>
                <h4 className="text-[11px] tracking-[2px] uppercase font-normal mb-[6px]" style={{ fontFamily: "'Cinzel',serif", color: "#e8e0d0" }}>{f.title}</h4>
                <p className="text-xs leading-[1.6]" style={{ fontFamily: "'Jost',sans-serif", color: "#6b6b70" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}