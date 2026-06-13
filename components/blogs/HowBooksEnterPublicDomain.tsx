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

export default function HowBooksEnterPublicDomain() {
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
            <span className="text-white" aria-current="page">How Books Enter the Public Domain</span>
          </nav>

          <header className="pt-10 pb-0">
            <div className="mb-6">
              <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227] border border-[#C9A227]/25 px-3 py-1.5 font-semibold">
                Publishing & Law
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.05] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How Books Enter the  <br />
              <span className="italic text-[#C9A227]">Public Domain</span>
            </h1>

            <p className="text-[1.1rem] text-[#eeeeee] leading-relaxed mb-8 max-w-2xl" style={{ fontWeight: 300 }}>
              Let's clear up the confusion around copyright laws. Discover exactly how, when, and why a great book finally moves from being corporate property into the hands of the public.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#444] tracking-wide">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center text-[#0a0a0a] font-black text-[9px] select-none">
                  AG
                </div>
                <span className="text-white uppercase tracking-wider text-[10px]">AG Classics Editorial</span>
              </div>
              <span className="text-white">·</span>
              <time dateTime="2026-09-10" className="text-white">June 2026</time>
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
          {/* HERO THUMBNAIL IMAGE                                  */}
          {/* ══════════════════════════════════════════════════════ */}
          <figure className="mt-10 mb-14">
            <div className="relative w-full overflow-hidden border border-[#C9A227]/20 bg-[#111]">
              <img
                src="/images/blogs/HowBooksEnterPublicDomain.jpg"
                alt="A vintage wooden gavel and books representing legal copyright"
                className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-700 grayscale-[40%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
            </div>
            <figcaption className="text-center text-[10px] tracking-[0.2em] text-[#8a6f2e] uppercase mt-4">
              The delicate balance between encouraging creators and preserving our culture.
            </figcaption>
          </figure>

          {/* ══════════════════════════════════════════════════════ */}
          {/* ESSAY CONTENT                                         */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="mt-10 mb-20">

            {/* Introduction */}
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              <span className="float-left text-6xl leading-[0.8] pr-3 text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>W</span>
              e all know the public domain is amazing for our culture, and it is no secret that big companies have fought hard to keep books out of it. But how does a story actually cross the finish line and become free?
            </p>

            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              There is no single global rule that decides when a book enters the public domain. Instead, it is a messy mix of local laws and international treaties. Since the United States is one of the biggest media markets in the world, its rules usually set the pace for global publishing. Here is a simple breakdown of exactly how and when literature is set free today.
            </p>

            {/* Section 1 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. The "Life Plus 70" Rule
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />
            
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              For most of the world, including the UK, the European Union, and the United States for books written after 1978, the standard rule is <strong>"Life plus 70 years."</strong> 
            </p>

            {/* Float Right Image: Time/Hourglass concept */}
            <div className="sm:float-right sm:w-[260px] sm:ml-8 mb-6 mt-2 border border-[#C9A227]/20 p-2 bg-[#111]">
              <img 
                src="https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=1600&auto=format&fit=crop" 
                alt="A vintage clock representing the passage of time and copyright expiration" 
                className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-500 aspect-square"
              />
              <p className="text-center text-[10px] text-[#C9A227] tracking-widest uppercase mt-3 mb-1">The Clock is Ticking</p>
            </div>

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              This means a book stays under the private control of the author's family or estate for their entire life, plus another seven full decades after they pass away. Only when that 70th year ends does the book finally enter the public domain. For example, George Orwell died in 1950, which meant his iconic book <em>1984</em> was finally set free in 2021.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Note that some countries, including India, use a Life plus 60 years rule, so books become free to the public a little bit faster there.
            </p>

            {/* Pull Quote */}
            <blockquote className="border-l-2 border-[#C9A227] pl-6 my-12 py-2 clear-both">
              <p
                className="text-2xl md:text-3xl italic text-[#c9b87a] font-light leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                &ldquo;Copyright is a ticking clock. It was designed as a temporary compromise, acting more like a lease on an idea rather than absolute ownership.&rdquo;
              </p>
            </blockquote>

            {/* Section 2 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. The 95-Year Corporate Rule (Pre-1978 Works)
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              For older books published in the United States, the rules change and are based entirely on the publication date, no matter when the author died. If a book was published between 1924 and 1977, the copyright lasts for exactly <strong>95 years</strong> from the day it originally came out.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              Because of this 95 year rule, we get to celebrate a huge cultural event every January 1st called <strong>Public Domain Day</strong>. On January 1, 2024, all books published in 1928 became free. On January 1, 2025, books from 1929 joined the list. It is an amazing yearly tradition where culture is set free. Any book published before this rolling cutoff is completely and safely in the public domain.
            </p>

            {/* Section 3 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5 clear-both" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. The Tragedy of "Orphan Works"
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            {/* Float Left Image: Dusty Library */}
            <div className="sm:float-left sm:w-[260px] sm:mr-8 mb-6 mt-2 border border-[#C9A227]/20 p-2 bg-[#111]">
              <img 
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1600&auto=format&fit=crop" 
                alt="A dusty, forgotten library representing orphan works" 
                className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-500 aspect-square"
              />
              <p className="text-center text-[10px] text-[#C9A227] tracking-widest uppercase mt-3 mb-1">Forgotten Archives</p>
            </div>

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              The saddest flaw in our modern copyright system is something called Orphan Works. These are books that are still legally protected by copyright, but the author has passed away, the original publisher has gone out of business, and no one can find the legal heirs. 
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              Since nobody knows who actually owns the rights, independent publishers, filmmakers, and libraries are too afraid of being sued to touch the material. Millions of culturally important books and essays are stuck in this legal limbo. They are out of print and impossible to buy, but still illegal to copy or scan. They are basically held hostage by the exact laws meant to protect them, stuck until the 95 year clock finally runs out.
            </p>

            {/* Section 4 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5 clear-both" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Immediate Liberation: CC0 and Government Works
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Not every book has to wait a hundred years. An author can choose to give up all their copyright protections and put their work straight into the public domain using a <strong>CC0 (Creative Commons Zero)</strong> license. This is a wonderfully generous choice that hands art directly to the public the moment it is created.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Also, any work created by U.S. federal government employees as part of their official job does not get copyright protection. Federal reports, historical texts, and government papers enter the public domain the second the ink dries.
            </p>

            <div className="clear-both"></div>
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
            The Value of <span className="italic text-[#C9A227]">Understanding the Law</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            Understanding how books enter the public domain is not just something for copyright lawyers to worry about. It gives readers, creators, and independent publishers the power to know exactly what belongs to them. The public domain is a massive, open pool of human brilliance, just waiting for people who know how to use it.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            At AG Classics, we navigate these legal rules every single day to rescue and revive the greatest stories in the world. We carefully find confirmed public domain classics and transform them into beautiful, high quality physical books for your personal library.
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