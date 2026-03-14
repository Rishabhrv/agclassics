"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, StarHalf } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Book {
  id: number;
  title: string;
  slug: string;
  description?: string;
  main_image: string;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  author_name: string | null;
  avg_rating: number | null;
  review_count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function ebookPrice(book: Book): { display: number; original: number } {
  const eSell = book.ebook_sell_price !== null ? Number(book.ebook_sell_price) : null;
  const ePr   = book.ebook_price      !== null ? Number(book.ebook_price)      : null;
  return { display: eSell ?? Number(book.sell_price), original: ePr ?? Number(book.price) };
}

// ─── Star Renderer (Dark Theme Gold) ──────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half   = !filled && rating >= star - 0.5;
        return filled ? (
          <Star key={star} size={13} className="fill-[#c9a84c] text-[#c9a84c]" />
        ) : half ? (
          <StarHalf key={star} size={13} className="fill-[#c9a84c] text-[#c9a84c]" />
        ) : (
          <Star key={star} size={13} className="text-[#3a3a40]" />
        );
      })}
    </div>
  );
}

// ─── Skeleton (Dark Theme) ────────────────────────────────────────────────────
function SpotlightSkeleton() {
  return (
    <section className="mt-20 px-[clamp(20px,5vw,80px)] animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-2 w-24 bg-[rgba(201,168,76,0.2)] rounded" />
        <div className="h-10 w-64 bg-[rgba(245,240,232,0.1)] rounded" />
        <div className="h-3 w-80 bg-[#1a1a1d] rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-[2px]">
        <div className="bg-[#131316] min-h-[420px]" />
        <div className="bg-[#131316] p-[clamp(32px,5vw,64px)_clamp(24px,4vw,56px)] flex flex-col justify-center space-y-5 border border-l-0 md:border-t-0 border-[rgba(201,168,76,0.10)]">
          <div className="h-2 w-32 bg-[rgba(201,168,76,0.2)] rounded" />
          <div className="h-8 w-3/4 bg-[rgba(245,240,232,0.1)] rounded" />
          <div className="h-3 w-1/3 bg-[#1a1a1d] rounded" />
          <div className="h-16 w-full bg-[#1a1a1d] rounded" />
          <div className="h-10 w-32 bg-[rgba(201,168,76,0.2)] rounded mt-4" />
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeaturedEbookSpotlight({ book, loading }: { book: Book | null; loading: boolean }) {
  if (loading) return <SpotlightSkeleton />;
  if (!book) return null;

  const { display, original } = ebookPrice(book);
  const discount = original > display ? Math.round(((original - display) / original) * 100) : 0;
  const rating = book.avg_rating || 0;

  return (
    <section className="mt-20 px-[clamp(20px,5vw,80px)]">
      
      {/* ── Section Header ── */}
      <div className="mb-8">
        <span className="block font-['Cinzel',serif] text-[8px] tracking-[5px] uppercase text-[#8a6f2e] mb-2.5">
          Editor's Pick
        </span>
        <h2 className="font-['Cormorant_Garamond',serif] font-light text-[clamp(30px,4.5vw,52px)] text-[#f5f0e8] leading-[1.05]">
          Featured <em className="italic text-[#c9a84c]">eBook</em>
        </h2>
        <p className="font-['Jost',sans-serif] text-[13px] text-[#6b6b70] leading-[1.8] max-w-[480px] mt-3">
          A handpicked title from our curated collection — read by thousands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-[2px]">

        {/* ── LEFT: Cover ── */}
        <div className="relative flex items-center justify-center bg-[#131316] min-h-[420px] group overflow-hidden p-10">
          
          {/* Gradient Overlay Behind Book */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,9,0.85)] via-[rgba(8,8,9,0.2)] to-transparent pointer-events-none" />

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-6 right-6 font-['Jost',sans-serif] text-[10px] font-medium text-white bg-[#4a9a5a] py-1 px-2.5 z-10">
              −{discount}% OFF
            </span>
          )}

          {/* Featured label */}
          <span className="absolute top-6 left-6 font-['Cinzel',serif] text-[8px] tracking-[3px] uppercase text-[#080809] bg-[#c9a84c] px-3.5 py-1.5 z-10">
            ✦ Featured eBook
          </span>

          <div className="relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {book.main_image ? (
              <img
                src={`${API_URL}${book.main_image}`}
                alt={book.title}
                className="h-80 w-auto object-contain brightness-90 saturate-90 transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-100"
              />
            ) : (
              <div className="w-48 h-72 flex items-center justify-center bg-[#1a1a1d] border border-[rgba(201,168,76,0.1)]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Details ── */}
        <div className="flex flex-col justify-center p-5 px-15 bg-[#131316] border-t md:border-t-0 md:border-l border-[rgba(201,168,76,0.10)]">
          
          {/* Label */}
          <p className="font-['Cinzel',serif] text-[8px] tracking-[4px] uppercase text-[#8a6f2e] mb-4">
            AG Classics Digital
          </p>

          {/* Title */}
          <h3 className="font-['Cormorant_Garamond',serif] font-light italic text-[clamp(28px,4vw,48px)] text-[#f5f0e8] leading-[1.1] mb-3">
            {book.title}
          </h3>

          {/* Authors */}
          {book.author_name && (
            <p className="font-['Cinzel',serif] text-[9px] tracking-[3px] uppercase text-[#6b6b70] mb-4">
              by <span className="text-[#e8dfd0]">{book.author_name}</span>
            </p>
          )}

          {/* Real reviews */}
          <div className="flex items-center gap-2.5 mb-6">
            <StarRating rating={rating} />
            <span className="font-['Jost',sans-serif] text-[12px] font-medium text-[#c9a84c]">
              {rating > 0 ? rating.toFixed(1) : "—"}
            </span>
            <span className="font-['Jost',sans-serif] text-[10px] text-[#6b6b70]">
              ({book.review_count} {book.review_count === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-[rgba(201,168,76,0.10)] mb-6" />

          {/* Description */}
          <p className="font-['Jost',sans-serif] text-[13px] text-[#6b6b70] leading-[1.8] max-w-[420px] mb-8 line-clamp-4">
            {book.description || "Experience this timeless classic in a beautifully formatted digital edition. Download instantly and start reading on any device."}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-8">
            <span className="font-['Cormorant_Garamond',serif] font-light text-[36px] text-[#c9a84c]">
              {fmt(display)}
            </span>
            {discount > 0 && (
              <s className="font-['Cormorant_Garamond',serif] text-[20px] text-[#3a3a40]">
                {fmt(original)}
              </s>
            )}
          </div>

          {/* CTA Row */}
          <div className="flex items-center gap-5">
            <Link
              href={`/books/${book.slug}`}
              className="inline-block font-['Jost',sans-serif] text-[10px] tracking-[3px] uppercase font-medium bg-[#c9a84c] text-[#080809] px-9 py-4 border-none cursor-pointer transition-colors duration-300 hover:bg-[#f5f0e8]"
            >
              Get This eBook
            </Link>
            <Link
              href={`/books/${book.slug}#reviews`}
              className="font-['Jost',sans-serif] text-[11px] text-[#6b6b70] hover:text-[#c9a84c] underline underline-offset-4 decoration-[rgba(201,168,76,0.3)] transition-colors"
            >
              Read reviews
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}