"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Plus } from "lucide-react";
import { guestCart } from "@/lib/guestStorage"; // Adjust import if needed

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const F_CORMORANT = { fontFamily: "'Cormorant Garamond', serif" } as const;
const F_CINZEL = { fontFamily: "'Cinzel', serif" } as const;
const F_JOST = { fontFamily: "'Jost', sans-serif" } as const;

export interface Book {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  main_image: string;
  stock: number;
  created_at: string;
  product_type?: "ebook" | "physical" | "both";
  ebook_price?: number | null;
  ebook_sell_price?: number | null;
  category?: string;
  authors?: { name: string }[];
}

interface NewArrivalsProps {
  books: Book[];
  loading: boolean;
  error: string | null;
}

// ─── Custom CSS for the Editorial Layout ───
const EDITORIAL_STYLES = `
 

  /* 3D Book Cover Effect for the Main Feature */
  .na-featured-book {
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
    box-shadow: 
      -20px 20px 30px rgba(0,0,0,0.8), 
      inset 4px 0 10px rgba(255,255,255,0.1),
      inset -1px 0 2px rgba(255,255,255,0.05);
  }
  .na-featured-container:hover .na-featured-book {
    transform: perspective(1000px) rotateY(-2deg) rotateX(0deg) translateY(-8px);
    box-shadow: 
      -30px 30px 40px rgba(0,0,0,0.9), 
      inset 4px 0 10px rgba(255,255,255,0.1);
  }

  /* List Item Hover Effects */
  .na-list-item {
    transition: background-color 0.4s ease, padding-left 0.4s ease;
  }
  .na-list-item:hover {
    background-color: rgba(201,168,76,0.03);
    padding-left: 12px;
  }
  
  .na-list-img {
    transition: transform 0.5s ease, box-shadow 0.5s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }
  .na-list-item:hover .na-list-img {
    transform: scale(1.08) translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.7);
  }

  .na-add-btn {
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.4s ease;
  }
  .na-list-item:hover .na-add-btn {
    opacity: 1;
    transform: translateX(0);
  }

  .na-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: naShimmer 1.5s infinite;
  }
  @keyframes naShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export default function NewArrivals({ books, loading, error }: NewArrivalsProps) {
  const [toast, setToast] = useState<string | null>(null);

  if (loading || error || books.length === 0) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Helper to determine pricing
  const getPrice = (book: Book) => {
    const isEbookOnly = book.product_type === "ebook";
    const sellPrice = isEbookOnly ? (book.ebook_sell_price ?? book.sell_price) : book.sell_price;
    const mrp = isEbookOnly ? (book.ebook_price ?? book.price) : book.price;
    const format = isEbookOnly ? "eBook" : "Paperback";
    return { sellPrice, mrp, format };
  };

  // Dummy Add to Cart (Matches your ProductSlider logic)
  const handleAddToCart = async (e: React.MouseEvent, book: Book) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (book.product_type === "physical" && book.stock === 0) {
      showToast("Currently Out of Stock");
      return;
    }

    const format = book.product_type === "ebook" ? "ebook" : "paperback";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      // Guest Cart
      guestCart.add({
        id: book.id,
        product_id: book.id,
        format,
        quantity: 1,
        title: book.title,
        slug: book.slug,
        main_image: `${API_URL}${book.main_image}`,
        price: book.price,
        sell_price: book.sell_price,
        ebook_price: book.ebook_price ?? null,
        ebook_sell_price: book.ebook_sell_price ?? null,
        stock: book.stock,
        product_type: book.product_type || "physical",
      });
      window.dispatchEvent(new Event("cart-change"));
      showToast("Added to Cart");
      return;
    }

    // Authenticated API Call
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: book.id, format, quantity: 1 }),
      });
      if (res.ok || res.status === 409) {
        window.dispatchEvent(new Event("cart-change"));
        showToast("Added to Cart");
      } else {
        showToast("Could not add to cart");
      }
    } catch {
      showToast("Network Error");
    }
  };

  const featuredBook = books[0];
  const listBooks = books.slice(1, 5);

  return (
    <section aria-label="New Arrivals Editorial" className="na-editorial-wrap relative sm:pb-24 my-12">
      <style>{EDITORIAL_STYLES}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 text-[11px] tracking-[2px] uppercase bg-[#1c1c1e] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] shadow-[0_8px_32px_rgba(0,0,0,0.8)]" style={F_JOST}>
          <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#c9a84c]" />
              <span className="text-[12px] tracking-[4px] uppercase text-[#c9a84c]" style={F_CINZEL}>
                The Latest Additions
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#f5f0e8] italic font-light leading-none" style={F_CORMORANT}>
              New Arrivals
            </h2>
          </div>
          <Link
            href="/category/all?sort=newest"
            className="group flex items-center gap-2 text-[12px] tracking-[3px] uppercase text-[#f2f2f2] hover:text-[#c9a84c] transition-colors border-b border-[rgba(201,168,76,0.2)] hover:border-[#c9a84c] pb-1"
            style={F_JOST}
          >
            View All Releases
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Asymmetrical Editorial Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* LEFT: Crown Jewel (Featured Book) */}
          {featuredBook && (
            <div className="lg:col-span-5 flex flex-col group na-featured-container">
              <Link href={`/product/${featuredBook.slug}`} className="block relative w-full aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] mb-8 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.1)_0%,transparent_70%)]">
                
                {/* Out of Stock Overlay for Featured */}
                {featuredBook.product_type === "physical" && featuredBook.stock === 0 && (
                  <div className="absolute top-6 left-6 z-20 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-[#444]">
                     <span className="text-[9px] tracking-[2px] uppercase text-[#888]" style={F_JOST}>Out of Stock</span>
                  </div>
                )}
                {/* New Badge */}
                {(!featuredBook.stock || featuredBook.stock > 0) && (
                  <div className="absolute top-6 left-6 z-20 bg-[#c9a84c] px-3 py-1.5 shadow-lg">
                    <span className="text-[11px] tracking-[3px] uppercase text-[#000] font-bold" style={F_JOST}>Premiere</span>
                  </div>
                )}

                <img
                  src={`${API_URL}${featuredBook.main_image}`}
                  alt={featuredBook.title}
                  className="na-featured-book w-[65%] sm:w-[55%] lg:w-[70%] object-cover border border-[rgba(255,255,255,0.1)] relative z-10"
                />
              </Link>

              <div className="flex flex-col items-start px-2">
                <span className="text-[10px] tracking-[3px] uppercase text-[#ffffff] mb-3" style={F_CINZEL}>
                  {getPrice(featuredBook).format} Edition
                </span>
                <Link href={`/product/${featuredBook.slug}`}>
                  <h3 className="text-3xl sm:text-4xl text-[#f5f0e8] font-light leading-tight mb-2 group-hover:text-[#c9a84c] transition-colors" style={F_CORMORANT}>
                    {featuredBook.title}
                  </h3>
                </Link>
                {featuredBook.authors && featuredBook.authors.length > 0 && (
                  <p className="text-[13px] text-[rgba(245,240,232,0.6)] mb-6" style={F_JOST}>
                    By {featuredBook.authors[0].name}
                  </p>
                )}
                
                <div className="flex items-center justify-between w-full border-t border-[rgba(201,168,76,0.2)] pt-6 mt-auto">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl text-[#c9a84c]" style={F_JOST}>
                      ₹{getPrice(featuredBook).sellPrice}
                    </span>
                    {getPrice(featuredBook).mrp > getPrice(featuredBook).sellPrice && (
                      <span className="text-sm text-[#555] line-through" style={F_JOST}>
                        ₹{getPrice(featuredBook).mrp}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, featuredBook)}
                    className="relative overflow-hidden flex items-center gap-2 bg-[#c9a84c] text-[#0a0a0c] px-6 py-3 text-[10px] tracking-[2px] uppercase font-bold hover:bg-[#e4be54] transition-colors"
                    style={F_JOST}
                  >
                    <span className="absolute inset-0 na-shimmer opacity-30" />
                    <ShoppingBag size={14} className="relative z-10" />
                    <span className="relative z-10">Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: The List (Other New Arrivals) */}
          {listBooks.length > 0 && (
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="w-full h-px bg-[rgba(201,168,76,0.15)] mb-2" />
              
              {listBooks.map((book) => {
                const { sellPrice, mrp, format } = getPrice(book);
                const isOos = book.product_type === "physical" && book.stock === 0;

                return (
                  <Link 
                    key={book.id} 
                    href={`/product/${book.slug}`}
                    className="na-list-item group flex items-center justify-between py-6 border-b border-[rgba(201,168,76,0.15)] relative overflow-hidden"
                  >
                    <div className="flex items-center gap-6 sm:gap-8 relative z-10">
                      
                      {/* Image */}
                      <div className="relative w-[70px] sm:w-[90px]  shrink-0 bg-[#111]">
                        <img 
                          src={`${API_URL}${book.main_image}`} 
                          alt={book.title}
                          className="na-list-img w-full h-full object-cover border border-[rgba(255,255,255,0.05)]"
                        />
                        {isOos && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-[7px] text-white tracking-widest uppercase rotate-[-15deg] font-bold" style={F_JOST}>Sold Out</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col py-2">
                        <span className="text-[8px] sm:text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-2" style={F_CINZEL}>
                          {format}
                        </span>
                        <h3 className="text-2xl sm:text-2xl text-[#f5f0e8] font-light leading-snug mb-1 group-hover:text-[#c9a84c] transition-colors line-clamp-2 pr-4" style={F_CORMORANT}>
                          {book.title}
                        </h3>
                        {book.authors && book.authors.length > 0 && (
                          <p className="text-[12px] text-[#bebebe] mb-3" style={F_JOST}>
                            {book.authors[0].name}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-base text-[#e8e0d0]" style={F_JOST}>₹{sellPrice}</span>
                          {mrp > sellPrice && (
                            <span className="text-xs text-[#555] line-through" style={F_JOST}>₹{mrp}</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Quick Add Button (Appears on Hover) */}
                    <button
                      onClick={(e) => handleAddToCart(e, book)}
                      disabled={isOos}
                      className="na-add-btn hidden sm:flex shrink-0 w-12 h-12 rounded-full border border-[#c9a84c] items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0c] transition-colors relative z-20 mr-4 disabled:opacity-30 disabled:border-[#555] disabled:text-[#555] disabled:hover:bg-transparent"
                      aria-label="Add to cart"
                    >
                      <Plus size={18} />
                    </button>

                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}