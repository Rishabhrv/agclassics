"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import BookCard from "@/components/book/BookCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Author = {
  id: number;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
  created_at: string;
};

type Book = {
  id: number;
  title: string;
  slug: string;
  image: string;
  product_type: "ebook" | "physical" | "both";
  stock: number;
  price: number;
  sell_price: number;
  ebook_price?: number;
  ebook_sell_price?: number;
};

interface Props {
  params: Promise<{ slug: string }>;
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

  .ap, .ap *, .ap *::before, .ap *::after { box-sizing: border-box; }

  @keyframes apSk { from{background-position:-200% 0} to{background-position:200% 0} }
  @keyframes apFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes apGlow { 0%,100%{opacity:0.2} 50%{opacity:0.6} }

  .ap-sk {
    background: linear-gradient(90deg,#161618 0%,#252528 50%,#161618 100%);
    background-size: 200% 100%;
    animation: apSk 1.6s infinite;
  }

  /* Ghost watermark — mirrors the light version's ghost text */
  .ap-ghost {
    font-family: 'Cinzel', serif;
    font-weight: 600;
    position: absolute;
    top: 0; left: 0; right: 0;
    font-size: clamp(72px, 13vw, 150px);
    line-height: 1;
    color: rgba(201,168,76,0.035);
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
  }

  /* Offset portrait shadow — mirrors the light version's gray-200 block */
  .ap-shadow-block {
    position: absolute;
    top: 8px; left: 8px;
    width: 100%; height: 100%;
    border: 1px solid rgba(201,168,76,0.18);
  }

  /* Animated glow ring on portrait */
  .ap-portrait-glow { position: relative; }
  .ap-portrait-glow::before {
    content: '';
    position: absolute;
    inset: -1px;
    border: 1px solid rgba(201,168,76,0.35);
    pointer-events: none;
    animation: apGlow 3s ease-in-out infinite;
    z-index: 2;
  }

  /* Staggered card entrance */
  .ap-book { opacity:0; animation: apFadeUp 0.6s ease forwards; }
`;

/* ── SKELETON — matches light version structure ── */
function Skeleton() {
  return (
    <div className="ap min-h-screen bg-[#0c0c0e]">
      <style>{STYLES}</style>

      {/* Masthead */}
      <div className="border-b-2 border-[rgba(201,168,76,0.25)]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="ap-sk h-2.5 w-24 rounded" />
          <div className="ap-sk h-2.5 w-40 rounded" />
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-16">
          <div className="space-y-5">
            <div className="ap-sk w-44 h-56 md:w-56 md:h-72 rounded" />
            <div className="ap-sk h-2.5 w-24 rounded" />
            <div className="ap-sk h-6 w-16 rounded" />
          </div>
          <div className="pt-6 space-y-6">
            <div className="ap-sk h-3 w-32 rounded" />
            <div className="ap-sk h-16 w-3/4 rounded" />
            <div className="flex gap-1">
              <div className="ap-sk h-2 w-16 rounded" />
              <div className="ap-sk h-2 w-4 rounded" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="ap-sk h-3 rounded" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function AuthorPage({ params }: Props) {
  const { slug } = React.use(params);

  const [author, setAuthor]             = useState<Author | null>(null);
  const [books, setBooks]               = useState<Book[]>([]);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [bioExpanded, setBioExpanded]   = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/ag-classics/authors/slug/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setAuthor(data.author);
        setBooks(data.books);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (bioRef.current)
      setBioOverflows(bioRef.current.scrollHeight > bioRef.current.clientHeight + 4);
  }, [author]);

  if (loading) return <Skeleton />;

  /* ── 404 ── */
  if (notFound || !author) {
    return (
      <div className="ap min-h-screen bg-[#0c0c0e] flex flex-col items-center justify-center gap-6 text-center px-6">
        <style>{STYLES}</style>
        <div
          className="leading-none font-light text-[rgba(201,168,76,0.12)]"
          style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(90px,18vw,160px)" }}
        >
          404
        </div>
        <div className="h-px w-24 bg-[rgba(201,168,76,0.3)]" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a84c]" style={{ fontFamily:"'Cinzel',serif" }}>
          Author Not Found
        </p>
        <p className="text-[#4a4a4d] text-sm max-w-xs italic" style={{ fontFamily:"'Cormorant Garamond',serif" }}>
          We couldn't locate this author. The link may be incorrect or the author may have been removed.
        </p>
        <Link
          href="/"
          className="mt-2 inline-block border border-[rgba(201,168,76,0.3)] text-[#c9a84c] text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-[rgba(201,168,76,0.08)] transition-all duration-300"
          style={{ fontFamily:"'Cinzel',serif" }}
        >
          Return Home
        </Link>
      </div>
    );
  }

  const initials = author.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const joinYear = new Date(author.created_at).getFullYear();

  return (
    <div className="ap min-h-screen mt-30 bg-[#0c0c0e] text-[#e8e0d0]" style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{STYLES}</style>

      {/*
       * ─────────────────────────────────────────
       * TOP RULE + MASTHEAD
       * mirrors: border-b-2 border-gray-800 masthead
       * ─────────────────────────────────────────
       */}
      <div className="border-b-2 border-[rgba(201,168,76,0.2)]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.35em] text-[#4a4a4d]"
            style={{ fontFamily:"'Cinzel',serif" }}
          >
            Author Profile
          </span>
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-[rgba(201,168,76,0.25)]" />
            <span
              className="text-[10px] uppercase tracking-[0.3em] text-[#8a6f2e]"
              style={{ fontFamily:"'Cinzel',serif" }}
            >
              {books.length} {books.length === 1 ? "Work" : "Works"} · Est. {joinYear}
            </span>
          </div>
        </div>
      </div>

      {/*
       * ─────────────────────────────────────────
       * HERO — editorial split layout
       * mirrors: max-w-6xl px-6 pt-16 relative
       * ─────────────────────────────────────────
       */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative pt-16 pb-0">

          {/* Ghost watermark — dark gold tint (mirrors gray-900/[0.04]) */}
          <div className="ap-ghost" aria-hidden="true">
            {author.name.toUpperCase()}
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-start">

            {/* ── Portrait column ── */}
            <div className="flex flex-col items-start">
              <div className="relative">

                {/* Offset shadow block — dark gold border (mirrors bg-gray-200 block) */}
                <div className="ap-shadow-block" />

                {/* Portrait frame */}
                <div className="ap-portrait-glow relative w-44 h-56 md:w-56 md:h-72 overflow-hidden bg-[#111113] border border-[rgba(201,168,76,0.12)]">
                  {author.profile_image ? (
                    <Image
                      src={`${API_URL}${author.profile_image}`}
                      alt={author.name}
                      fill
                      className="object-cover"
                      unoptimized
                      style={{ position:"absolute" }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background:"linear-gradient(135deg,rgba(138,111,46,0.18),rgba(201,168,76,0.04))" }}
                    >
                      <span
                        className="font-light text-[#8a6f2e]"
                        style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(40px,10vw,60px)" }}
                      >
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vertical meta — mirrors "Since / year" */}
              <div className="mt-7 space-y-1">
                <p
                  className="text-[10px] uppercase tracking-[0.3em] text-[#4a4a4d]"
                  style={{ fontFamily:"'Cinzel',serif" }}
                >
                  Since
                </p>
                <p
                  className="text-2xl font-light text-[#c9a84c]"
                  style={{ fontFamily:"'Cormorant Garamond',serif" }}
                >
                  {joinYear}
                </p>
              </div>
            </div>

            {/* ── Name + Bio column ── */}
            <div className="flex flex-col pt-2 md:pt-6">

              {/* Section label — mirrors "The Author" label */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-[#8a6f2e]" />
                <span
                  className="text-[10px] uppercase tracking-[0.35em] text-[#c9a84c]"
                  style={{ fontFamily:"'Cinzel',serif" }}
                >
                  The Author
                </span>
              </div>

              {/* Name — mirrors font-black H1 */}
              <h1
                className="leading-[0.95] mb-8 tracking-tight text-[#f5f0e8] font-light italic"
                style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,6vw,72px)" }}
              >
                {author.name}
              </h1>

              {/* Thick rule — mirrors h-1 w-16 bg-gray-800 + h-1 w-4 bg-gray-400 */}
              <div className="flex gap-1 mb-8">
                <div className="h-[3px] w-16 bg-[#c9a84c]" />
                <div className="h-[3px] w-4 bg-[#8a6f2e]" />
              </div>

              {/* Bio — mirrors line-clamp-5 + expand button */}
              {author.bio ? (
                <div>
                  <p
                    ref={bioRef}
                    className={`text-[#8a8a8e] text-[15px] leading-[1.85] transition-all ${bioExpanded ? "" : "line-clamp-5"}`}
                    style={{ fontFamily:"'Cormorant Garamond',serif" }}
                  >
                    {author.bio}
                  </p>
                  {bioOverflows && (
                    <button
                      onClick={() => setBioExpanded(!bioExpanded)}
                      className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#8a6f2e] hover:text-[#c9a84c] transition-colors cursor-pointer bg-transparent border-none"
                      style={{ fontFamily:"'Cinzel',serif" }}
                    >
                      {bioExpanded ? "Collapse" : "Read Full Biography"}
                      <span className="text-base leading-none">{bioExpanded ? "↑" : "↓"}</span>
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[#3a3a3d] italic text-[15px]" style={{ fontFamily:"'Cormorant Garamond',serif" }}>
                  No biography available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/*
         * ─────────────────────────────────────────
         * BOOKS SECTION
         * mirrors: mt-20 mb-16 section header + grid
         * ─────────────────────────────────────────
         */}
        <div className="mt-20 mb-16">

          {/* Section header — mirrors light version exactly */}
          <div className="flex items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px w-10 bg-[#8a6f2e]" />
                <span
                  className="text-[10px] uppercase tracking-[0.35em] text-[#c9a84c]"
                  style={{ fontFamily:"'Cinzel',serif" }}
                >
                  Bibliography
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-light italic text-[#f5f0e8]"
                style={{ fontFamily:"'Cormorant Garamond',serif" }}
              >
                Works by {author.name}
              </h2>
            </div>

            {/* Dashed divider — mirrors border-dashed border-gray-200 */}
            <div className="flex-1 border-b border-dashed border-[rgba(201,168,76,0.15)]" />

            <span
              className="shrink-0 text-xs uppercase tracking-[0.2em] text-[#8a6f2e] border border-[rgba(201,168,76,0.2)] px-3 py-1"
              style={{ fontFamily:"'Cinzel',serif" }}
            >
              {books.length} {books.length === 1 ? "Title" : "Titles"}
            </span>
          </div>

          {/* Empty state — mirrors light version */}
          {books.length === 0 ? (
            <div className="border border-dashed border-[rgba(201,168,76,0.12)] py-24 flex flex-col items-center gap-4 bg-[#111113]">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="0.75" className="opacity-40">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p
                className="text-[#3a3a3d] italic text-sm"
                style={{ fontFamily:"'Cormorant Garamond',serif" }}
              >
                No published works yet.
              </p>
            </div>
          ) : (
            /* Grid — mirrors grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-10 */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-10">
              {books.map((book, i) => (
                <div
                  key={book.id}
                  className="ap-book w-full"
                  style={{ animationDelay:`${i * 60}ms` }}
                >
                  <BookCard
                    visibleCount={1}
                    book={{
                      id: book.id,
                      title: book.title,
                      slug: book.slug,
                      image: book.image.startsWith("http") ? book.image : `${API_URL}${book.image}`,
                      product_type: book.product_type,
                      stock: book.stock,
                      price: book.price,
                      sell_price: book.sell_price,
                      ebook_price: book.ebook_price,
                      ebook_sell_price: book.ebook_sell_price,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/*
         * Bottom rule — mirrors border-t-2 border-gray-800
         */}
        <div className="border-t-2 border-[rgba(201,168,76,0.2)] py-6 flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-[#4a4a4d]"
            style={{ fontFamily:"'Cinzel',serif" }}
          >
            {author.name}
          </span>
          <div className="flex gap-1">
            <div className="h-[3px] w-8 bg-[#c9a84c]" />
            <div className="h-[3px] w-2 bg-[#8a6f2e]" />
          </div>
        </div>
      </div>
    </div>
  );
}