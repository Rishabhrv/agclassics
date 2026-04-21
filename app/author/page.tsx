"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Only for things Tailwind can't do: fonts, keyframes, hover transitions
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;500;600&family=Jost:wght@300;400;500&display=swap');

  .font-cormorant { font-family: 'Cormorant Garamond', serif; }
  .font-cinzel    { font-family: 'Cinzel', serif; }
  .font-jost      { font-family: 'Jost', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .anim-fade-up { animation: fadeUp 0.55s ease forwards; opacity: 0; }
  .anim-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,0.05), transparent);
    animation: shimmer 1.8s infinite;
  }

  /* Image zoom on card hover */
  .card-img {
    transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.4s ease;
    filter: grayscale(25%) brightness(0.82);
  }
  .author-card:hover .card-img {
    transform: scale(1.05);
    filter: grayscale(0%) brightness(0.88);
  }

  /* Bio slides up */
  .bio-reveal {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, opacity 0.35s ease;
  }
  .author-card:hover .bio-reveal { max-height: 72px; opacity: 1; }

  /* CTA slides up */
  .cta-reveal {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.3s 0.08s, transform 0.3s 0.08s;
  }
  .author-card:hover .cta-reveal { opacity: 1; transform: translateY(0); }

  /* Ornament fades in */
  .ornament-reveal {
    opacity: 0;
    transform: translateY(-5px);
    transition: opacity 0.3s, transform 0.3s;
  }
  .author-card:hover .ornament-reveal { opacity: 1; transform: translateY(0); }

  /* CTA bar expands */
  .cta-bar { width: 20px; transition: width 0.3s ease; }
  .author-card:hover .cta-bar { width: 32px; }

  /* Initial letter on placeholder */
  .initial-char {
    transition: color 0.4s, letter-spacing 0.4s;
    color: rgba(201,168,76,0.12);
  }
  .author-card:hover .initial-char {
    color: rgba(201,168,76,0.3);
    letter-spacing: 4px;
  }
`;

type Author = {
  id: number;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
  status: string;
};

export default function AuthorsPage() {
  const [authors, setAuthors]   = useState<Author[]>([]);
  const [filtered, setFiltered] = useState<Author[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/ag-classics/authors`)
      .then((r) => r.json())
      .then((data: Author[]) => {
        const active = data.filter((a) => a.status === "active");
        setAuthors(active);
        setFiltered(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(authors); return; }
    setFiltered(
      authors.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.bio?.toLowerCase().includes(q) ?? false)
      )
    );
  }, [search, authors]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e0d0] overflow-x-hidden">
      <style>{fontStyles}</style>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative pt-36 pb-7 text-center px-6">
        {/* Soft radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)",
          }}
        />

        <span className="font-cinzel text-[9px] tracking-[7px] text-[#c9a84c] uppercase block mb-5 relative z-10">
          AG Classics
        </span>

        <h1
          className="font-cormorant font-light text-[#f5f0e8] relative z-10 leading-[0.9] mb-5"
          style={{ fontSize: "clamp(48px, 9vw, 96px)", letterSpacing: "-1.5px" }}
        >
          The <em className="italic text-[#c9a84c]">Authors</em>
          <br />
          Behind the Classics
        </h1>

        <p className="font-jost font-light text-[#bb9523] text-[13px] tracking-widest relative z-10">
          {!loading && authors.length > 0
            ? `${authors.length} authors · timeless works`
            : "Curated literary voices"}
        </p>

        {/* Vertical separator */}
        <div className="w-px h-9 bg-gradient-to-b from-[rgba(201,168,76,0.35)] to-transparent mx-auto mt-3" />
      </section>

      {/* ── SEARCH ────────────────────────────────────── */}
      <div className="max-w-[520px] mx-auto px-6 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search authors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full bg-[#141416] border border-[rgba(201,168,76,0.12)]
              text-[#e8e0d0] font-jost font-light text-[13px] tracking-wide
              placeholder-[#2a2830] px-5 py-4 pr-12 outline-none
              focus:border-[rgba(201,168,76,0.35)] transition-colors duration-300
            "
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a84c] opacity-40 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {search && (
          <p className="font-cinzel text-[8px] tracking-[3px] text-[#2e2c33] uppercase text-center mt-3">
            <span className="text-[#c9a84c]">{filtered.length}</span>{" "}
            result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* ── DIVIDER ───────────────────────────────────── */}
      <div className="max-w-[1300px] mx-auto px-6 mb-10 flex items-center gap-5">
        <div className="flex-1 h-px bg-[rgba(201,168,76,0.07)]" />
        <span className="font-cinzel text-[8px] tracking-[5px] text-[rgba(248, 185, 9, 0.87)] uppercase whitespace-nowrap">
          All Authors
        </span>
        <div className="flex-1 h-px bg-[rgba(201,168,76,0.07)]" />
      </div>

      {/* ── GRID ──────────────────────────────────────── */}
      <div
        className="max-w-[1300px] mx-auto px-6 pb-32 grid gap-[3px]"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))" }}
      >

        {/* Skeleton cards */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141416] border border-[rgba(201,168,76,0.05)] relative overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <div className="anim-shimmer absolute inset-0" />
            </div>
          ))}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-32 px-6">
            <p className="font-cormorant text-[80px] leading-none mb-6 text-[rgba(201,168,76,0.06)]">
              ∅
            </p>
            <p className="font-cormorant font-light text-[#2a2830] text-3xl mb-2">
              No authors found
            </p>
            <p className="font-jost text-[#1e1c22] text-[11px] tracking-widest uppercase">
              Try a different search term
            </p>
          </div>
        )}

        {/* Author cards */}
        {!loading &&
          filtered.map((author, idx) => (
            <Link
              key={author.id}
              href={`/author/${author.slug}`}
              className="author-card relative block overflow-hidden border border-[rgba(201,168,76,0.06)] hover:border-[rgba(201,168,76,0.22)] transition-colors duration-500 anim-fade-up"
              style={{
                aspectRatio: "3/4",
                animationDelay: `${Math.min(idx * 55, 480)}ms`,
              }}
            >
              {/* Image */}
              {author.profile_image ? (
                <img
                  src={`${API_URL}${author.profile_image}`}
                  alt={author.name}
                  className="card-img absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1c] to-[#101012] flex items-center justify-center">
                  <span
                    className="initial-char font-cormorant font-light select-none"
                    style={{ fontSize: "clamp(64px, 8vw, 92px)" }}
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,10,11,0.96) 0%, rgba(10,10,11,0.42) 42%, transparent 68%)",
                }}
              />

              {/* Arrow ornament — top right */}
              <div className="ornament-reveal absolute top-4 right-4 w-[28px] h-[28px] border border-[rgba(201,168,76,0.2)] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>

              {/* Card body */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4">

                {/* Index */}
                <span className="font-cinzel text-[8px] tracking-[3px] text-[#c9a84c] opacity-50 block mb-2">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Name */}
                <h2
                  className="font-cormorant font-normal text-[#f5f0e8] leading-tight mb-2"
                  style={{ fontSize: "clamp(18px, 2vw, 23px)" }}
                >
                  {author.name}
                </h2>

                {/* Bio — hover reveal */}
                {author.bio && (
                  <p className="bio-reveal font-jost font-light text-[11px] text-[#5a5660] leading-relaxed mb-3">
                    {author.bio.length > 100 ? author.bio.slice(0, 100) + "…" : author.bio}
                  </p>
                )}

                {/* CTA — hover reveal */}
                <div className="cta-reveal flex items-center gap-2">
                  <div className="cta-bar h-px bg-[#c9a84c]" />
                  <span className="font-cinzel text-[8px] tracking-[3px] text-[#c9a84c] uppercase">
                    View Works
                  </span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}