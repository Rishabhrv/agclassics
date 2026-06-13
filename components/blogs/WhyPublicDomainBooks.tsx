"use client";

import React, { useState, useEffect } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────

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

// ─── Main Export Component ────────────────────────────────────────────

export default function WhyPublicDomainBooks() {
  const progress = useReadingProgress();

  useEffect(() => {
    if (document.getElementById("ag-blog-fonts")) return;
    const link = document.createElement("link");
    link.id = "ag-blog-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600;1,700&family=Lato:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8dfc8] md:mt-30" style={{ fontFamily: "'Lato', sans-serif" }}>

      {/* ── Reading progress bar ── */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50">
        <div
          className="h-full transition-all duration-75"
          style={{ width: `${progress}%`, background: "linear-gradient(to right, #C9A227, #F0CC5A)" }}
        />
      </div>

      <article>
        {/* ══════════════════════════════════════════════════════ */}
        {/* HERO                                                  */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] text-[#333] pt-10 tracking-wider">
            <a href="/" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Home</a>
            <span className="text-white">›</span>
            <a href="/blog" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Blog</a>
            <span className="text-white">›</span>
            <span className="text-white" aria-current="page">Why Public Domain Books Are Still Relevant Today</span>
          </nav>

          <header className="pt-10 pb-0">
            <div className="mb-6">
              <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227] border border-[#C9A227]/25 px-3 py-1.5 font-semibold">
                Essays & Analysis
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.05] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Why Public Domain Books{" "}
              <span className="italic text-[#C9A227]">Are Still Relevant Today</span>
            </h1>

            <p className="text-[1.1rem] text-[#eeeeee] leading-relaxed mb-8 max-w-2xl" style={{ fontWeight: 300 }}>
              An inquiry into the intellectual commons: how restriction-free historical masterworks act as the ultimate catalyst for contemporary creativity, uninhibited education, and independent publishing.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#444] tracking-wide">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center text-[#0a0a0a] font-black text-[9px] select-none">
                  AG
                </div>
                <span className="text-white uppercase tracking-wider text-[10px]">AG Classics Editorial</span>
              </div>
              <span className="text-white">·</span>
              <time dateTime="2026-06-12" className="text-white">JUNE 2026</time>
              <span className="text-white">·</span>
              <span className="text-white">8 MIN READ</span>
            </div>

            <div className="mt-12 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
              <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
              <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
            </div>
          </header>

          {/* ══════════════════════════════════════════════════════ */}
          {/* ESSAY CONTENT                                         */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="mt-16 mb-20">

            <img
              src="/images/blogs/Why Public Domain Books.jpg"
              alt="Why Public Domain Books Are Still Relevant Today"
              className="w-full h-auto object-cover  mb-12 "
            />

            {/* Introduction */}
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              <span className="float-left text-6xl leading-[0.8] pr-3 text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>I</span>
              n a world where many books, movies, and digital products are locked behind subscriptions and licenses, public domain books offer something different. These are books that are no longer protected by copyright, which means anyone can read, share, publish, or adapt them freely. They belong to everyone and can be enjoyed without restrictions.
            </p>

            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              Some people think public domain books are old and no longer useful. In reality, they continue to influence modern culture, education, and publishing. Many famous stories, ideas, and characters that we still enjoy today come from public domain works. Here are some reasons why these books remain valuable in today's world.
            </p>

            {/* Section 1 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. The Engine of Infinite Adaptation
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />
            
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Copyright protection gives authors the opportunity to earn from their work, but eventually many classic books enter the public domain. When that happens, their stories and characters become available for everyone to use, reinterpret, and share.
            </p>

            {/* Inline Image / Example */}
            <div className="sm:float-right sm:w-64 sm:ml-8 mb-6 mt-2 border border-[#C9A227]/20 p-2 bg-[#111]">
              <img 
                src="https://covers.openlibrary.org/b/isbn/0140439005-L.jpg" 
                alt="Sherlock Holmes" 
                className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
              <p className="text-center text-[10px] text-[#C9A227] tracking-widest uppercase mt-3 mb-1">Cultural Archetype</p>
            </div>

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Think about characters like <em>Sherlock Holmes</em> or <em>Dracula</em>. Because these stories are in the public domain, filmmakers, writers, and artists can create new versions without needing special permissions. This keeps classic stories alive and introduces them to new generations. Every adaptation helps these timeless works remain part of modern culture.
            </p>

            {/* Pull Quote */}
            <blockquote className="border-l-2 border-[#C9A227] pl-6 my-12 py-2">
              <p
                className="text-2xl md:text-3xl italic text-[#c9b87a] font-light leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                &ldquo;Classic books stay alive when each generation has the freedom to discover, reinterpret, and share them in new ways.&rdquo;
              </p>
            </blockquote>

            {/* Section 2 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Democratic Access to Education
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Public domain books make knowledge accessible to everyone. Since these works can be freely shared and distributed, students, teachers, and readers around the world can learn from them without worrying about expensive licensing fees.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              Books such as Plato's <em>The Republic</em>, Victor Hugo's <em>Les Misérables</em>, and Shakespeare's plays continue to teach valuable lessons about society, justice, and human nature. Because these works are freely available, anyone with an interest in learning can explore them regardless of their financial situation.
            </p>

            {/* Section 3 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. A Renaissance for Independent Publishing
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Public domain books also create opportunities for independent publishers. Unlike copyrighted works that require licensing agreements and royalty payments, public domain titles can be published freely, making it easier for smaller publishers to bring classic literature to readers.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              This freedom allows publishers to focus on creating beautiful editions with better design, typography, illustrations, and print quality. It also helps preserve important books that might otherwise disappear from the market. As a result, readers gain access to high-quality editions of timeless classics.
            </p>

            {/* Section 4 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. The Testing Ground for the Digital Future
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Public domain books play an important role in the digital world as well. Large online libraries and educational projects rely on these freely available works to make literature accessible to readers everywhere.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Because books like <em>Frankenstein</em> and <em>Moby-Dick</em> are free to use, developers, researchers, educators, and archivists can use them for digital projects, accessibility tools, language research, and preservation efforts. In many ways, some of the world's oldest stories continue to support the technologies of the future.
            </p>

          </div>
        </div>
      </article>

      {/* ══════════════════════════════════════════════════════ */}
      {/* CONCLUSION                                            */}
      {/* ══════════════════════════════════════════════════════ */}
      <aside className="max-w-4xl mx-auto px-5 md:px-8 mt-4 mb-24">
        <div className="flex items-center gap-3 mb-12">
          <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
          <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
          <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
        </div>

        <div className="border border-[#C9A227]/12 bg-[#0d0d0d] p-8 md:p-12">
          <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227]/50 font-semibold">
            Final Thought
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#f5f0e8] mt-3 mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Preserving the <span className="italic text-[#C9A227]">Shared Inheritance</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            The books we choose to preserve and share say a lot about our culture. Public domain works ensure that important stories, ideas, and knowledge remain available to everyone rather than being locked away behind restrictions.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            At AG Classics, we celebrate these timeless works by bringing carefully selected public domain books to modern readers. Our goal is to help preserve literary heritage while making these classics easy to discover, read, and enjoy for generations to come.
          </p>
          <a
            href="/category/all"
            className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#C9A227] text-[#0a0a0a] text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-[#E8B84B] transition-colors duration-200"
          >
            Explore the Collection
            <span className="text-base leading-none">→</span>
          </a>
        </div>

        <div className="mt-8">
          <a href="/blog" className="text-[11px] tracking-[0.25em] uppercase text-[#dcdcdc] hover:text-[#C9A227] transition-colors">
            ← Back to Blog
          </a>
        </div>
      </aside>

    </main>
  );
}