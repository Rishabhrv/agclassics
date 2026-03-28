"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

type Book = { id: number; title: string; slug: string; main_image: string };
type Props = { book: Book; visibleCount?: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* Only what Tailwind genuinely can't do */
const minimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400&family=Jost:wght@300;400;500&display=swap');

  /* -webkit-line-clamp — no Tailwind equivalent that works cross-browser */
  .lib-book-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export default function LibraryBookCard({ book }: Props) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/my-books/${book.slug}/favorite`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setFavorite(d.favorite))
      .catch(() => {});
  }, [book.slug]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_URL}/api/my-books/${book.slug}/favorite`, {
      method: favorite ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setFavorite((f) => !f);
  };

  return (
    <>
      <style>{minimalStyles}</style>

      <Link
        href={`/my-books/${book.slug}`}
        className="block w-full no-underline"
      >
        {/*
         * `group` on this div lets every child use `group-hover:` variants.
         * aspect-ratio keeps the 2:3 book-cover proportion at any width.
         */}
        <div className="group relative w-full overflow-hidden bg-[#1a1a1c] cursor-pointer [aspect-ratio:2/3] transition-transform duration-[400ms] ease-[ease] hover:scale-[1.02] hover:z-[2]">

          {/* ── FAVORITE BUTTON ── */}
          <button
            onClick={toggleFavorite}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            className={`
              absolute top-2.5 right-2.5 z-10
              w-7 h-7 flex items-center justify-center
              border cursor-pointer
              transition-colors duration-300
              ${favorite
                ? "bg-[rgba(201,168,76,0.15)] border-[rgba(201,168,76,0.6)]"
                : "bg-[rgba(10,10,11,0.75)] border-[rgba(201,168,76,0.2)] hover:bg-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.5)]"
              }
            `}
          >
            <Heart
              size={13}
              strokeWidth={1.5}
              className="transition-colors duration-300"
              style={{
                fill: favorite ? "#c9a84c" : "none",
                color: favorite ? "#c9a84c" : "#6b6b70",
              }}
            />
          </button>

          {/* ── COVER IMAGE ── */}
          {book.main_image ? (
            <Image
              src={`${API_URL}${book.main_image}`}
              alt={book.title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
              className="
                object-cover
                brightness-[0.88] saturate-[0.85]
                transition-[transform,filter] duration-[600ms] ease-[ease]
                group-hover:scale-[1.07] group-hover:brightness-[0.65] group-hover:saturate-[0.6]
              "
              unoptimized
            />
          ) : (
            /* Placeholder when no image */
            <div className="w-full h-full bg-gradient-to-br from-[#1c1c1e] to-[#2a2a2d] flex items-center justify-center">
              <svg
                width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="#8a6f2e" strokeWidth="1" opacity={0.5}
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          )}

          {/* ── GRADIENT OVERLAY ── */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-t from-[rgba(10,10,11,0.96)] via-[rgba(10,10,11,0.45)] to-transparent
              [background-image:linear-gradient(to_top,rgba(10,10,11,0.96)_0%,rgba(10,10,11,0.45)_45%,transparent_70%)]
              transition-[background] duration-[400ms]
              group-hover:[background-image:linear-gradient(to_top,rgba(10,10,11,0.99)_0%,rgba(10,10,11,0.7)_55%,rgba(10,10,11,0.25)_100%)]
            "
          />

          {/* ── BOOK INFO ── */}
          <div
            className="
              absolute bottom-0 left-0 right-0
              px-3 pb-3.5 pt-3
              translate-y-1
              transition-transform duration-[400ms] ease-[ease]
              group-hover:translate-y-0
            "
          >
            {/* Title */}
            <p
              className="lib-book-title text-[13px] font-normal text-[#f5f0e8] leading-[1.35] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {book.title}
            </p>

            {/* Read Now button — fades in on hover */}
            <span
              className="
                inline-block
                text-[9px] tracking-[2px] uppercase font-medium
                px-3 py-1.5
                bg-[#c9a84c] text-[#0a0a0b]
                border-none cursor-pointer
                opacity-0 translate-y-1.5
                transition-[opacity,transform,background-color] duration-[350ms] ease-[ease]
                group-hover:opacity-100 group-hover:translate-y-0
                hover:bg-[#f5f0e8]
              "
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Read Now
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}