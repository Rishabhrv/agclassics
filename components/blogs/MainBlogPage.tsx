"use client";

import React, { useState, useEffect, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────

interface BlogPost {
  id: number;
  href: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  accent: string;
  thumbnailType: "image" | "books";
  thumbnailUrl?: string;
  bookCovers?: string[];
  excerpt: string;
  featured: boolean;
}

// ─── Posts Data ───────────────────────────────────────────────────────

const POSTS: BlogPost[] = [
  {
    id: 1,
    href: "/blog/sun-tzu-art-of-war-summary-and-lessons",
    title: "The Art of War: Summary & Core Lessons",
    category: "Strategy & Philosophy",
    date: "June 2026",
    readTime: "8 min read",
    accent: "#D4AF37",
    thumbnailType: "image",
    thumbnailUrl:
      "https://brandongaille.com/wp-content/uploads/2020/02/the-art-of-war-summary-ft.jpg",
    excerpt:
      "Six timeless principles from Sun Tzu's 2,500-year-old masterpiece — translated for the modern executive, entrepreneur, and builder.",
    featured: true,
  },
  {
    id: 2,
    href: "/blog/10-best-business-books",
    title: "10 Best Business Books of All Time",
    category: "Reading List",
    date: "June 2026",
    readTime: "14 min read",
    accent: "#C9A227",
    thumbnailType: "books",
    bookCovers: [
      "https://covers.openlibrary.org/b/isbn/0449214923-L.jpg",
      "https://covers.openlibrary.org/b/isbn/0804139024-L.jpg",
      "https://covers.openlibrary.org/b/isbn/0066620996-L.jpg",
    ],
    excerpt:
      "From Napoleon Hill's philosophy of achievement to Peter Thiel's contrarian theory of monopoly — the ten books every serious leader must read.",
    featured: false,
  },
  {
    id: 3,
    href: "/blog/10-best-self-development-books-for-2026",
    title: "10 Best Self-Development Books for 2026",
    category: "Reading List",
    date: "June 2026",
    readTime: "14 min read",
    accent: "#5B9BD5",
    thumbnailType: "books",
    bookCovers: [
      "https://covers.openlibrary.org/b/isbn/0812968255-L.jpg",
      "https://covers.openlibrary.org/b/isbn/080701429X-L.jpg",
      "https://covers.openlibrary.org/b/isbn/0735211299-L.jpg",
    ],
    excerpt:
      "From Marcus Aurelius's ancient stoicism to James Clear's behavioral science — ten books that will reshape how you think, focus, and endure.",
    featured: false,
  },
];

// ─── Reading Progress ─────────────────────────────────────────────────

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min((window.scrollY / total) * 100, 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

// ─── Books Thumbnail ──────────────────────────────────────────────────

function BooksThumbnail({ covers, accent, title }: { covers: string[]; accent: string; title: string }) {
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  const config = [
    { width: "32%", left: "2%",  rotate: "-8deg", bottom: "4%",  zIndex: 1 },
    { width: "38%", left: "50%", rotate: "0deg",  bottom: "0%",  zIndex: 3, centerX: true },
    { width: "32%", right: "2%", rotate: "8deg",  bottom: "4%",  zIndex: 1 },
  ] as const;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #121212 0%, #0a0a0a 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 90%, ${accent}22 0%, transparent 62%)` }}
      />
      <div
        className="absolute top-3 left-3 w-5 h-5"
        style={{ borderTop: `1px solid ${accent}30`, borderLeft: `1px solid ${accent}30` }}
      />
      <div
        className="absolute top-3 right-3 w-5 h-5"
        style={{ borderTop: `1px solid ${accent}30`, borderRight: `1px solid ${accent}30` }}
      />

      <div className="absolute inset-0 flex items-end justify-center pb-4 sm:pb-6">
        <div className="relative" style={{ width: "85%", height: "85%" }}>
          {covers.slice(0, 3).map((url, i) => {
            const c = config[i];
            return (
              <div
                key={i}
                className="absolute overflow-hidden"
                style={{
                  width: c.width,
                  left: "centerX" in c ? "50%" : "left" in c ? c.left : undefined,
                  right: "right" in c ? c.right : undefined,
                  bottom: c.bottom,
                  transform: `${"centerX" in c ? "translateX(-50%) " : ""}rotate(${c.rotate})`,
                  zIndex: c.zIndex,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.82)",
                }}
              >
                {errors[i] ? (
                  <div
                    style={{
                      aspectRatio: "2/3",
                      background: `linear-gradient(160deg, ${accent}18 0%, #0a0a0a 100%)`,
                      borderLeft: `2px solid ${accent}30`,
                    }}
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Book cover ${i + 1} featured in: ${title}`} // Resolves Image SEO warning
                    style={{ aspectRatio: "2/3", width: "100%", display: "block", objectFit: "cover" }}
                    onError={() => setErrors((p) => ({ ...p, [i]: true }))}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Image Thumbnail ──────────────────────────────────────────────────

function ImageThumbnail({ url, alt }: { url: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="w-full h-full bg-[#111]" />;
  return (
    <img
      src={url}
      alt={alt}
      className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
      onError={() => setErr(true)}
    />
  );
}

// ─── Featured (Hero) Card ─────────────────────────────────────────────

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <article
      className="group relative block overflow-hidden border border-[#1d1d1d] hover:border-[#2d2d2d] transition-all duration-300"
      aria-label={`Featured article: ${post.title}`}
    >
      <div className="flex flex-col lg:flex-row h-full">
        {/* ── Thumbnail ── */}
        <div className="relative overflow-hidden w-full lg:w-[58%] flex-shrink-0 h-[260px] sm:h-[320px] lg:h-auto lg:min-h-[380px]">
          <div className="absolute inset-0">
            {post.thumbnailType === "image" ? (
              <ImageThumbnail url={post.thumbnailUrl!} alt={`Cover image for ${post.title}`} />
            ) : (
              <BooksThumbnail covers={post.bookCovers!} accent={post.accent} title={post.title} />
            )}
          </div>
          <div
            className="absolute inset-y-0 right-0 w-14 hidden lg:block pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent, #0d0d0d)" }}
          />
        </div>

        {/* ── Content ── */}
        <div
          className="w-full lg:w-[42%] bg-[#0d0d0d] p-6 sm:p-8 lg:p-10 flex flex-col justify-between"
          style={{ borderLeft: "1px solid #1d1d1d" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full flex-shrink-0" style={{ background: post.accent }} />
              <span
                className="text-[9px] sm:text-[10px] tracking-[0.32em] uppercase font-semibold"
                style={{ color: post.accent, opacity: 0.85 }}
              >
                {post.category}
              </span>
            </div>

            {/* Resolves long/duplicate anchor text by isolating the link and stretching it */}
            <h2
              className="text-2xl sm:text-3xl lg:text-[1.85rem] font-bold text-[#f5f0e8] leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <a href={post.href} className="focus:outline-none">
                <span className="absolute inset-0 z-10" aria-hidden="true" />
                {post.title}
              </a>
            </h2>

            <div
              className="w-10 h-px mb-4 sm:mb-5"
              style={{ background: `${post.accent}55` }}
            />

            <p className="text-[#d8d8d8] text-sm sm:text-[0.925rem] leading-[1.8] mb-6 sm:mb-7 line-clamp-4 relative z-20 pointer-events-none">
              {post.excerpt}
            </p>
          </div>

          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[#555] mb-5 sm:mb-7">
              <span className="text-[#C9A227]">{post.date}</span>
              <span className="w-1 h-1 rounded-full bg-[#333]" />
              <span className="text-[#C9A227]">{post.readTime}</span>
            </div>
            <span
              className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-200"
              style={{ color: post.accent }}
              aria-hidden="true" // Hides visual duplicate CTA text from screen readers
            >
              Read Article 
              <span className="text-sm transition-transform duration-200 group-hover:translate-x-1 inline-block">
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────

function GridCard({ post }: { post: BlogPost }) {
  return (
    <article
      className="group relative flex flex-col overflow-hidden border border-[#1d1d1d] hover:border-[#2d2d2d] bg-[#0d0d0d] transition-all duration-300"
      aria-label={`Article: ${post.title}`}
    >
      <div className="h-[2px] w-full flex-shrink-0" style={{ background: post.accent, opacity: 0.45 }} />

      <div className="relative overflow-hidden flex-shrink-0 h-[260px] sm:h-[280px]">
        <div className="absolute inset-0">
          {post.thumbnailType === "image" ? (
            <ImageThumbnail url={post.thumbnailUrl!} alt={`Cover image for ${post.title}`} />
          ) : (
            <BooksThumbnail covers={post.bookCovers!} accent={post.accent} title={post.title} />
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6 lg:p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: post.accent }} />
          <span
            className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-semibold"
            style={{ color: post.accent, opacity: 0.85 }}
          >
            {post.category}
          </span>
        </div>

        {/* Anchor link correctly isolated */}
        <h3
          className="text-[1.1rem] sm:text-xl font-bold text-[#f5f0e8] leading-snug mb-3 flex-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <a href={post.href} className="focus:outline-none">
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {post.title}
          </a>
        </h3>

        <p className="text-[#cccccc] text-sm leading-[1.7] mb-5 line-clamp-3 relative z-20 pointer-events-none">
          {post.excerpt}
        </p>

        <div
          className="flex items-center justify-between pt-4 mt-auto"
          style={{ borderTop: "1px solid #181818" }}
        >
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-[#555]">
            <span className="text-[#C9A227]">{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-[#2e2e2e]" />
            <span className="text-[#C9A227]">{post.readTime}</span>
          </div>
          <span
            className="text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase opacity-50 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5"
            style={{ color: post.accent }}
            aria-hidden="true"
          >
            Read
            <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">→</span>
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────

export default function MainBlogPage() {
  const progress = useReadingProgress();
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (document.getElementById("ag-blog-fonts")) return;
    const link = document.createElement("link");
    link.id = "ag-blog-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600;1,700&family=Lato:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap";
    document.head.appendChild(link);
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = ["All"];
    POSTS.forEach((p) => {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        cats.push(p.category);
      }
    });
    return cats;
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: POSTS.length };
    POSTS.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(
    () => (activeCategory === "All" ? POSTS : POSTS.filter((p) => p.category === activeCategory)),
    [activeCategory]
  );

  const heroPost = filtered.find((p) => p.featured) ?? filtered[0] ?? null;
  const gridPosts = heroPost ? filtered.filter((p) => p.id !== heroPost.id) : [];

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-[#e8dfc8] mt-20 sm:mt-30"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <div className="fixed top-0 left-0 w-full h-[2px] z-50 pointer-events-none">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(to right, #C9A227, #F0CC5A)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        <nav className="flex items-center gap-2 text-[10px] sm:text-[11px] pt-8 sm:pt-10 tracking-wider">
          <a href="/" className="text-[#C9A227] hover:text-[#E8B84B] transition-colors relative z-20">
            Home
          </a>
          <span className="text-[#333]">›</span>
          <span className="text-[#888]">Journal</span>
        </nav>

        {/* ── Editorial Header ── */}
        <header className="pt-8 sm:pt-10">
          {/* Resolves H1 length & ensures exact match with the Title tags words */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.05] mb-4 sm:mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            AG Classics Blogs: 
            <span className="italic text-[#C9A227]"> Ideas Worth Reading</span>
          </h1>

          <p
            className="text-[0.95rem] sm:text-[1.05rem] text-[#bbbbbb] leading-relaxed mb-6 sm:mb-8 max-w-xl font-light"
          >
            Explore our curated blogs, essays, and reading lists offering timeless business & self-development insights from the
            AG&nbsp;Classics collection — assembled for the intentional reader.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-[10px] sm:text-[11px] text-[#ccc] tracking-wide">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <span>{POSTS.length} Articles</span>
            </div>
            <span className="text-[#333] hidden xs:inline">·</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <span>Updated Monthly</span>
            </div>
            <span className="text-[#333] hidden xs:inline">·</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <span>Free to Read</span>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
            <span className="text-[#C9A227]/25 text-lg sm:text-xl select-none">◆</span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
          </div>
        </header>

        {/* ── Category Filter ── */}
        <div className="relative z-20 mt-8 sm:mt-9 mb-10 sm:mb-12 flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <span className="text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-white mr-1 flex-shrink-0">
            Filter:
          </span>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase px-3 sm:px-3.5 py-1.5 sm:py-2 border transition-all duration-200 ${
                  isActive
                    ? "border-[#C9A227]/70 text-[#C9A227]"
                    : "border-[#ffffff] text-[#ffffff] hover:text-[#888] hover:border-[#2a2a2a]"
                }`}
                style={isActive ? { background: "rgba(201,162,39,0.06)" } : {}}
              >
                {cat}
                <span
                  className="ml-1.5 sm:ml-2 text-[8px] sm:text-[9px]"
                  style={{ color: isActive ? "rgba(201,162,39,0.5)" : "rgba(255,255,255,0.6)" }}
                >
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-20 sm:pb-24">
        {filtered.length === 0 ? (
          <div className="py-20 sm:py-28 text-center border border-[#181818] mx-1">
            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-[#555]">
              No articles in this category yet
            </p>
          </div>
        ) : (
          <>
            {/* ── Featured / Hero Post ── */}
            {heroPost && (
              <div className="mb-6 sm:mb-8">
                {heroPost.featured && (
                  <p className="text-[8px] sm:text-[9px] tracking-[0.42em] uppercase text-[#C9A227] mb-3 sm:mb-4 px-1">
                    Featured
                  </p>
                )}
                <FeaturedCard post={heroPost} />
              </div>
            )}

            {/* ── Grid ── */}
            {gridPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mt-8 sm:mt-10 mb-6 sm:mb-8">
                  <div className="flex-1 h-px bg-[#161616]" />
                  <p className="text-[8px] sm:text-[9px] tracking-[0.42em] uppercase text-[#C9A227] px-1 whitespace-nowrap">
                    {activeCategory === "All" ? "More Articles" : activeCategory}
                  </p>
                  <div className="flex-1 h-px bg-[#161616]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                  {gridPosts.map((post) => (
                    <GridCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-16 sm:mt-20 border border-[#C9A227]/12 bg-[#0d0d0d] p-6 sm:p-8 md:p-12 text-center sm:text-left">
          <span className="block text-[9px] sm:text-[10px] tracking-[0.38em] uppercase text-[#C9A227]/50 font-semibold mb-2">
            Explore Further
          </span>
          <h2
            className="text-2xl md:text-3xl font-bold text-[#f5f0e8] mt-2 mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Browse the <span className="italic text-[#C9A227]">Collection</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-5 sm:mb-6 mx-auto sm:mx-0" />
          <p className="text-[#cccccc] leading-[1.8] mb-6 sm:mb-7 text-[0.875rem] sm:text-[0.925rem] max-w-xl mx-auto sm:mx-0">
            Every book discussed in these pages is available through the
            AG&nbsp;Classics digital library — beautifully formatted editions
            for every device, with lifetime access from the moment you purchase.
          </p>
          <a
            href="/category/all"
            className="inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#C9A227] text-[#0a0a0a] text-[10px] sm:text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-[#E8B84B] transition-colors duration-200 w-full sm:w-auto active:scale-[0.98]"
          >
            Explore the Collection
            <span className="text-sm leading-none">→</span>
          </a>
        </div>

      </div>
    </div>
  );
}