// ─────────────────────────────────────────────────────────────────────
//  AG Classics — Blog Listing Page
//  Drop into your Next.js project at app/blog/page.tsx (or pages/blog.tsx)
//  Requires: Tailwind CSS
//
//  TO ADD A NEW POST:
//   1. Append a new object to the POSTS array below.
//   2. Set thumbnailType: "image" (for articles with a photo) or
//      thumbnailType: "books" (for reading lists — supply 3 cover URLs).
//   3. Set featured: true on whichever post you want as the hero card.
//      Only one post should be featured at a time.
// ─────────────────────────────────────────────────────────────────────

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
  thumbnailUrl?: string;   // required when thumbnailType === "image"
  bookCovers?: string[];   // required when thumbnailType === "books" (supply 3 URLs)
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
// Displays 3 book covers in a fanned arrangement on a dark gradient.
// Used for reading-list type posts.

function BooksThumbnail({ covers, accent }: { covers: string[]; accent: string }) {
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  const config = [
    { width: "31%", left: "3%",  rotate: "-7deg", bottom: "8px",  zIndex: 1 },
    { width: "36%", left: "50%", rotate: "0deg",  bottom: "0px",  zIndex: 3, centerX: true },
    { width: "31%", right: "3%", rotate: "7deg",  bottom: "8px",  zIndex: 1 },
  ] as const;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #121212 0%, #0a0a0a 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 90%, ${accent}22 0%, transparent 62%)`,
        }}
      />
      {/* Corner marks */}
      <div
        className="absolute top-3 left-3 w-5 h-5"
        style={{ borderTop: `1px solid ${accent}30`, borderLeft: `1px solid ${accent}30` }}
      />
      <div
        className="absolute top-3 right-3 w-5 h-5"
        style={{ borderTop: `1px solid ${accent}30`, borderRight: `1px solid ${accent}30` }}
      />

      {/* Book fan */}
      <div className="absolute inset-0 flex items-end justify-center pb-4">
        <div className="relative" style={{ width: "80%", height: "84%" }}>
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
                    alt=""
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

function ImageThumbnail({ url, alt = "" }: { url: string; alt?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return <div className="w-full h-full bg-[#111]" />;
  }
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
    <a
      href={post.href}
      className="group block overflow-hidden border border-[#1d1d1d] hover:border-[#2d2d2d] transition-all duration-300"
      aria-label={`Read: ${post.title}`}
    >
      <div className="flex flex-col lg:flex-row">
        {/* ── Thumbnail ── */}
        <div
          className="relative overflow-hidden lg:w-[58%] flex-shrink-0"
          style={{ minHeight: "280px" }}
        >
          <div className="absolute inset-0">
            {post.thumbnailType === "image" ? (
              <ImageThumbnail url={post.thumbnailUrl!} alt={post.title} />
            ) : (
              <BooksThumbnail covers={post.bookCovers!} accent={post.accent} />
            )}
          </div>
          {/* Right-edge fade into content panel on desktop */}
          <div
            className="absolute inset-y-0 right-0 w-14 hidden lg:block pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent, #0d0d0d)" }}
          />
        </div>

        {/* ── Content ── */}
        <div
          className="lg:w-[42%] bg-[#0d0d0d] p-7 sm:p-9 lg:p-10 xl:p-12 flex flex-col justify-between"
          style={{ borderLeft: "1px solid #1d1d1d" }}
        >
          <div>
            {/* Category */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: post.accent }} />
              <span
                className="text-[10px] tracking-[0.32em] uppercase font-semibold"
                style={{ color: post.accent, opacity: 0.85 }}
              >
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-2xl sm:text-3xl lg:text-[1.9rem] xl:text-4xl font-bold text-[#f5f0e8] leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {post.title}
            </h2>

            {/* Accent rule */}
            <div
              className="w-10 h-px mb-5"
              style={{ background: `${post.accent}55` }}
            />

            {/* Excerpt */}
            <p className="text-white text-sm leading-[1.88] mb-7">
              {post.excerpt}
            </p>
          </div>

          {/* Meta + CTA */}
          <div>
            <div className="flex items-center gap-3 text-xs text-[#4a4a4a] mb-7">
              <span className="text-[#C9A227]">{post.date}</span>
              <span className="w-1 h-1 rounded-full bg-[#333]" />
              <span className="text-[#C9A227]">{post.readTime}</span>
            </div>
            <span
              className="inline-flex items-center gap-2.5 text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-200"
              style={{ color: post.accent }}
            >
              Read Article
              <span
                className="text-sm transition-transform duration-200 group-hover:translate-x-1 inline-block"
              >
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────

function GridCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={post.href}
      className="group flex flex-col overflow-hidden border border-[#1d1d1d] hover:border-[#2d2d2d] bg-[#0d0d0d] transition-all duration-300"
      aria-label={`Read: ${post.title}`}
    >
      {/* Accent top bar */}
      <div className="h-[2px] w-full flex-shrink-0" style={{ background: post.accent, opacity: 0.45 }} />

      {/* Thumbnail */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: "250px" }}>
        <div className="absolute inset-0">
          {post.thumbnailType === "image" ? (
            <ImageThumbnail url={post.thumbnailUrl!} alt={post.title} />
          ) : (
            <BooksThumbnail covers={post.bookCovers!} accent={post.accent} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 lg:p-7">
        {/* Category */}
        <div className="flex items-center gap-2 mb-3.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: post.accent }} />
          <span
            className="text-[10px] tracking-[0.3em] uppercase font-semibold"
            style={{ color: post.accent, opacity: 0.85 }}
          >
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-[1.1rem] sm:text-xl font-bold text-[#f5f0e8] leading-snug mb-3 flex-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          className="text-[#ffffff] text-sm leading-[1.8] mb-5"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid #181818" }}
        >
          <div className="flex items-center gap-3 text-[11px] text-[#4a4a4a]">
            <span className="text-[#C9A227]">{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-[#2e2e2e]" />
            <span className="text-[#C9A227]">{post.readTime}</span>
          </div>
          <span
            className="text-[10px] font-bold tracking-[0.22em] uppercase opacity-50 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5"
            style={{ color: post.accent }}
          >
            Read
            <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">→</span>
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────

export default function MainBlogPage() {
  const progress = useReadingProgress();
  const [activeCategory, setActiveCategory] = useState("All");

  // Load Google Fonts
  useEffect(() => {
    if (document.getElementById("ag-blog-fonts")) return;
    const link = document.createElement("link");
    link.id = "ag-blog-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600;1,700&family=Lato:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap";
    document.head.appendChild(link);
  }, []);

  // Build category list from data (order: All, then appearance order)
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

  // Post counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: POSTS.length };
    POSTS.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, []);

  // Filtered posts
  const filtered = useMemo(
    () => (activeCategory === "All" ? POSTS : POSTS.filter((p) => p.category === activeCategory)),
    [activeCategory]
  );

  // The hero card is the genuinely featured post, or else the first filtered post
  const heroPost = filtered.find((p) => p.featured) ?? filtered[0] ?? null;
  const gridPosts = heroPost ? filtered.filter((p) => p.id !== heroPost.id) : [];

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-[#e8dfc8] mt-30"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      {/* ── Reading progress bar ── */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50 pointer-events-none">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(to right, #C9A227, #F0CC5A)",
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HEADER                                                */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-5 md:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] pt-10 tracking-wider">
          <a
            href="/"
            className="text-[#C9A227] hover:text-[#E8B84B] transition-colors"
          >
            Home
          </a>
          <span className="text-[#333]">›</span>
          <span className="text-[#888]">Blog</span>
        </nav>

        <header className="pt-10">
       

          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.03] mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ideas Worth{" "}
            <span className="italic text-[#C9A227]">Reading</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-[1.05rem] text-[#bbbbbb] leading-relaxed mb-8 max-w-xl"
            style={{ fontWeight: 300 }}
          >
            Curated essays, reading lists, and timeless ideas from the
            AG&nbsp;Classics collection — assembled for the intentional reader.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white tracking-wide">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <span>{POSTS.length} Articles</span>
            </div>
            <span className="text-[#222]">·</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <span>Updated Monthly</span>
            </div>
            <span className="text-[#222]">·</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <span>Free to Read</span>
            </div>
          </div>

          {/* Ornamental divider */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
            <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
          </div>
        </header>

        {/* ── Category Filter ── */}
        <div className="mt-9 mb-12 flex items-center gap-2 flex-wrap">
          <span className="text-[9px] tracking-[0.35em] uppercase text-white mr-1 flex-shrink-0">
            Filter:
          </span>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] tracking-[0.18em] uppercase px-3.5 py-2 border transition-all duration-200 ${
                  isActive
                    ? "border-[#C9A227]/70 text-[#C9A227]"
                    : "border-[#ffffff] text-[#ffffff] hover:text-[#888] hover:border-[#2a2a2a]"
                }`}
                style={
                  isActive
                    ? { background: "rgba(201,162,39,0.06)" }
                    : {}
                }
              >
                {cat}
                <span
                  className="ml-2 text-[9px]"
                  style={{ color: isActive ? "rgba(201,162,39,0.5)" : "#ffffff" }}
                >
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  CONTENT                                               */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 pb-24">

        {filtered.length === 0 ? (
          /* ── Empty state ── */
          <div className="py-28 text-center border border-[#181818]">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#333]">
              No articles in this category yet
            </p>
          </div>
        ) : (
          <>
            {/* ── Featured / Hero Post ── */}
            {heroPost && (
              <div className="mb-6">
                {/* Only show the "Featured" label for posts explicitly marked featured */}
                {heroPost.featured && (
                  <p className="text-[9px] tracking-[0.42em] uppercase text-[#C9A227] mb-4">
                    Featured
                  </p>
                )}
                <FeaturedCard post={heroPost} />
              </div>
            )}

            {/* ── Grid ── */}
            {gridPosts.length > 0 && (
              <div>
                {/* Section divider */}
                <div className="flex items-center gap-3 mt-10 mb-8">
                  <div className="flex-1 h-px bg-[#161616]" />
                  <p className="text-[9px] tracking-[0.42em] uppercase text-[#C9A227] px-1">
                    {activeCategory === "All" ? "More Articles" : activeCategory}
                  </p>
                  <div className="flex-1 h-px bg-[#161616]" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
                  {gridPosts.map((post) => (
                    <GridCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/*  BOTTOM CTA                                            */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="mt-20 border border-[#C9A227]/12 bg-[#0d0d0d] p-8 md:p-12">
          <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227]/50 font-semibold">
            Explore Further
          </span>
          <h2
            className="text-2xl md:text-3xl font-bold text-[#f5f0e8] mt-3 mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Browse the{" "}
            <span className="italic text-[#C9A227]">Collection</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-6" />
          <p className="text-[#f5f5f5] leading-[1.9] mb-7 text-[0.925rem] max-w-xl">
            Every book discussed in these pages is available through the
            AG&nbsp;Classics digital library — beautifully formatted editions
            for every device, with lifetime access from the moment you purchase.
          </p>
          <a
            href="/category/all"
            className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#C9A227] text-[#0a0a0a] text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-[#E8B84B] transition-colors duration-200"
          >
            Explore the Collection
            <span className="text-base leading-none">→</span>
          </a>
        </div>

      </div>
    </div>
  );
}