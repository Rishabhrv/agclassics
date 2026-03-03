"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Book {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  main_image: string;
  stock: number;
  created_at: string;
}

interface ProductSliderProps {
  books: Book[];
  title?: string;
  eyebrow?: string;
  description?: string;
  onAddToCart?: (book: Book) => void;
  onWishlist?: (book: Book) => void;
}

const calcDiscount = (price: number, sell: number) =>
  price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

export default function ProductSlider({
  books,
  title = "AG Classics",
  eyebrow = "The Collection",
  description = "Every volume chosen for its enduring significance and the worlds it opens.",
  onAddToCart,
  onWishlist,
}: ProductSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged = useRef(false);

  const CARDS_PER_PAGE = 5;

  /* ── scroll state sync ── */
  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    const cardW = el.scrollWidth / Math.max(books.length, 1);
    setActiveIndex(Math.round(el.scrollLeft / cardW));
  }, [books.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    setTimeout(checkScroll, 80);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll, books.length]);

  /* ── arrow navigation ── */
  const scrollByCards = (count: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / Math.max(books.length, 1);
    el.scrollBy({ left: cardW * count, behavior: "smooth" });
  };

  /* ── dot navigation ── */
  const scrollToPage = (pageIndex: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / Math.max(books.length, 1);
    el.scrollTo({ left: cardW * pageIndex * CARDS_PER_PAGE, behavior: "smooth" });
  };

  /* ── mouse drag ── */
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.pageX;
    scrollStartX.current = trackRef.current?.scrollLeft ?? 0;
    if (trackRef.current) trackRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const delta = e.pageX - dragStartX.current;
    if (Math.abs(delta) > 4) hasDragged.current = true;
    trackRef.current.scrollLeft = scrollStartX.current - delta;
  };
  const stopDrag = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };

  const totalPages = Math.ceil(books.length / CARDS_PER_PAGE);
  const currentPage = Math.floor(activeIndex / CARDS_PER_PAGE);

  if (!books.length) return null;

  return (
    <>
      <style>{`
        /* Child-hover transitions — requires parent→child CSS selector */
        .ps-card:hover .ps-img {
          transform: scale(1.07);
          filter: brightness(0.62) saturate(0.5);
        }
        .ps-card:hover .ps-overlay {
          background: linear-gradient(
            to top,
            rgba(10,10,11,1)    0%,
            rgba(10,10,11,0.78) 55%,
            rgba(10,10,11,0.22) 100%
          );
        }
        .ps-card:hover .ps-info    { transform: translateY(0); }
        .ps-card:hover .ps-actions { opacity: 1; transform: translateY(0); }
        .ps-card:hover .ps-title   { color: #c9a84c; }

        /* hide scrollbar */
        .ps-track { scrollbar-width: none; -ms-overflow-style: none; }
        .ps-track::-webkit-scrollbar { display: none; }
      `}</style>

      <section className="relative w-full">

        {/* ── Section Header ── */}
        <div className="flex items-end justify-between px-12 pt-16 pb-8 max-md:px-6 max-md:flex-col max-md:items-start max-md:gap-5">
          <div>
            <span
              className="block mb-3 text-[10px] tracking-[5px] uppercase"
              style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
            >
              {eyebrow}
            </span>
            <h2
              className="font-light italic leading-[1.1] mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(30px, 4vw, 50px)",
                color: "#f5f0e8",
              }}
            >
              {title}
            </h2>
            <p
              className="text-[13px] max-w-[380px] leading-[1.7]"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
            >
              {description}
            </p>
          </div>

          {/* Arrow controls + counter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className="text-[11px] tracking-[2px] hidden sm:block mr-1 tabular-nums"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
            >
              {String(activeIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(books.length).padStart(2, "0")}
            </span>

            {/* Prev button */}
            <button
              onClick={() => scrollByCards(-CARDS_PER_PAGE)}
              disabled={!canScrollLeft}
              aria-label="Previous"
              className="w-10 h-10 flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                background: canScrollLeft ? "rgba(201,168,76,0.08)" : "transparent",
                border: `1px solid ${canScrollLeft ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.07)"}`,
                color: canScrollLeft ? "#c9a84c" : "#6b6b70",
                cursor: canScrollLeft ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (!canScrollLeft) return;
                e.currentTarget.style.background = "#c9a84c";
                e.currentTarget.style.color = "#0a0a0b";
              }}
              onMouseLeave={(e) => {
                if (!canScrollLeft) return;
                e.currentTarget.style.background = "rgba(201,168,76,0.08)";
                e.currentTarget.style.color = "#c9a84c";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            {/* Next button */}
            <button
              onClick={() => scrollByCards(CARDS_PER_PAGE)}
              disabled={!canScrollRight}
              aria-label="Next"
              className="w-10 h-10 flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                background: canScrollRight ? "rgba(201,168,76,0.08)" : "transparent",
                border: `1px solid ${canScrollRight ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.07)"}`,
                color: canScrollRight ? "#c9a84c" : "#6b6b70",
                cursor: canScrollRight ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (!canScrollRight) return;
                e.currentTarget.style.background = "#c9a84c";
                e.currentTarget.style.color = "#0a0a0b";
              }}
              onMouseLeave={(e) => {
                if (!canScrollRight) return;
                e.currentTarget.style.background = "rgba(201,168,76,0.08)";
                e.currentTarget.style.color = "#c9a84c";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Slider Viewport ── */}
        <div className="relative overflow-hidden">
          {/* Left edge fade */}
          <div
            className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: "linear-gradient(to right, #0a0a0b, transparent)",
              opacity: canScrollLeft ? 1 : 0,
            }}
          />
          {/* Right edge fade */}
          <div
            className="absolute right-0 top-0 bottom-0 w-14 z-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: "linear-gradient(to left, #0a0a0b, transparent)",
              opacity: canScrollRight ? 1 : 0,
            }}
          />

          {/* Track */}
          <div
            ref={trackRef}
            className="ps-track flex gap-0.5 overflow-x-auto px-12 pb-5 max-md:px-6 select-none"
            style={{ cursor: "grab", scrollSnapType: "x mandatory" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            {books.map((book) => {
              const disc = calcDiscount(book.price, book.sell_price);
              const isNew = new Date(book.created_at) > new Date(Date.now() - 30 * 86400000);
              const isOos = book.stock === 0;

              return (
                <div
                  key={book.id}
                  className="ps-card relative overflow-hidden flex-shrink-0 aspect-[3/4] transition-[transform,box-shadow] duration-[400ms] ease-in-out hover:z-10 cursor-pointer"
                  style={{
                    width: "calc((100% - 96px - 4 * 2px) / 5)",
                    minWidth: "155px",
                    maxWidth: "255px",
                    background: "#1c1c1e",
                    scrollSnapAlign: "start",
                  }}
                  onClick={() => {
                    if (!hasDragged.current) window.location.href = `/product/${book.slug}`;
                  }}
                >
                  {/* Badge */}
                  {isOos ? (
                    <span
                      className="absolute top-3 left-3 z-10 text-[8px] tracking-[2px] uppercase font-medium px-[9px] py-[4px]"
                      style={{ fontFamily: "'Jost', sans-serif", background: "rgba(80,80,80,0.7)", color: "#6b6b70" }}
                    >
                      Out of Stock
                    </span>
                  ) : disc > 5 ? (
                    <span
                      className="absolute top-3 left-3 z-10 text-[8px] tracking-[2px] uppercase font-medium px-[9px] py-[4px]"
                      style={{ fontFamily: "'Jost', sans-serif", background: "#8b3a3a", color: "#f5f0e8" }}
                    >
                      {disc}% Off
                    </span>
                  ) : isNew ? (
                    <span
                      className="absolute top-3 left-3 z-10 text-[8px] tracking-[2px] uppercase font-medium px-[9px] py-[4px]"
                      style={{ fontFamily: "'Jost', sans-serif", background: "#c9a84c", color: "#0a0a0b" }}
                    >
                      New
                    </span>
                  ) : null}

                  {/* Image */}
                  {book.main_image ? (
                    <img
                      src={`${API_URL}${book.main_image}`}
                      alt={book.title}
                      draggable={false}
                      className="ps-img w-full h-full object-cover block transition-[transform,filter] duration-[560ms] ease-in-out"
                      style={{ filter: "brightness(0.83) saturate(0.75)" }}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #2a2a2d 0%, #1c1c1e 100%)" }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                  )}

                  {/* Overlay */}
                  <div
                    className="ps-overlay absolute inset-0 flex flex-col justify-end px-4 pb-4 transition-[background] duration-[380ms]"
                    style={{
                      background: "linear-gradient(to top, rgba(10,10,11,0.97) 0%, rgba(10,10,11,0.46) 42%, transparent 68%)",
                    }}
                  >
                    <div
                      className="ps-info transition-transform duration-[380ms] ease-in-out"
                      style={{ transform: "translateY(6px)" }}
                    >
                      {/* Title */}
                      <h3
                        className="ps-title font-semibold leading-[1.2] mb-[5px] transition-colors duration-300"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "clamp(13px, 1.1vw, 16px)",
                          color: "#f5f0e8",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {book.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span
                          className="text-[14px] font-medium"
                          style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
                        >
                        </span>
                        {disc > 0 && (
                          <span
                            className="text-[11px] line-through"
                            style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
                          >
                            ₹{parseFloat(String(book.price)).toFixed(0)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className="ps-actions flex gap-[5px] transition-[opacity,transform] duration-[360ms] ease-in-out"
                        style={{ opacity: 0, transform: "translateY(8px)" }}
                      >
                        <button
                          className="flex-1 text-[9px] tracking-[2px] uppercase font-medium py-2 px-2 transition-[background] duration-300"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            color: isOos ? "#6b6b70" : "#0a0a0b",
                            background: isOos ? "#2a2a2d" : "#c9a84c",
                            border: "none",
                            cursor: isOos ? "not-allowed" : "pointer",
                          }}
                          disabled={isOos}
                          onMouseEnter={(e) => { if (!isOos) e.currentTarget.style.background = "#f5f0e8"; }}
                          onMouseLeave={(e) => { if (!isOos) e.currentTarget.style.background = "#c9a84c"; }}
                          onClick={(e) => { e.stopPropagation(); if (!isOos) onAddToCart?.(book); }}
                        >
                          {isOos ? "Sold Out" : "Add to Cart"}
                        </button>

                        <button
                          className="w-8 h-8 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                          style={{
                            color: "#6b6b70",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer",
                          }}
                          aria-label="Wishlist"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#c9a84c";
                            e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#6b6b70";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                          }}
                          onClick={(e) => { e.stopPropagation(); onWishlist?.(book); }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Dot Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1 pb-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                aria-label={`Page ${i + 1}`}
                className="transition-all duration-300"
                style={{
                  width: i === currentPage ? "22px" : "6px",
                  height: "6px",
                  background: i === currentPage ? "#c9a84c" : "rgba(201,168,76,0.22)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  borderRadius: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Bottom ornament ── */}
        <div className="flex items-center gap-3 px-12 pt-3 pb-2 max-md:px-6">
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }}
          />
          <div className="w-[5px] h-[5px] rotate-45 flex-shrink-0" style={{ background: "rgba(201,168,76,0.25)" }} />
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }}
          />
        </div>

      </section>
    </>
  );
}