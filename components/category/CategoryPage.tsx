"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ── Types ── */
interface Product {
  id: number; title: string; slug: string;
  price: number; sell_price: number; stock: number;
  product_type: "physical" | "ebook" | "both"; main_image: string;
  created_at: string; rating: number;
}
interface Author {
  id: number; name: string; slug: string;
  profile_image: string; product_count: number;
}
interface RatingCounts { [key: number]: number; }
interface Category {
  id: number; name: string; slug: string;
  parent_id: number | null; product_count: number;
}
interface Toast { id: number; message: string; type: "success" | "error" | "info"; }

const LIMIT = 12;

const calcDiscount = (price: number, sell: number) =>
  price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

const getFormat = (type: Product["product_type"]): "paperback" | "ebook" =>
  type === "ebook" ? "ebook" : "paperback";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .ac-skeleton {
    background: linear-gradient(90deg, #1c1c1e 25%, #252527 50%, #1c1c1e 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ac-toast { animation: toast-in .3s ease both; }
`;

/* ══════════════════════
   STARS
══════════════════════ */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="9" height="9" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#c9a84c" : "none"}
          stroke="#c9a84c" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ══════════════════════
   TOAST LIST
══════════════════════ */
function ToastList({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-32px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "ac-toast px-4 py-[10px] text-[10px] sm:text-[11px] tracking-[1.5px] uppercase backdrop-blur-md border",
            t.type === "success" && "bg-[rgba(201,168,76,.15)] border-[rgba(201,168,76,.35)] text-[#c9a84c]",
            t.type === "error"   && "bg-[rgba(139,58,58,.18)] border-[rgba(139,58,58,.4)] text-[#d4756a]",
            t.type === "info"    && "bg-[rgba(28,28,30,.95)] border-[rgba(255,255,255,.1)] text-[#e8e0d0]",
          ].filter(Boolean).join(" ")}
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════════════════ */
function ProductCard({
  product, inCart, onCartAdded,
}: {
  product: Product;
  inCart: boolean;
  onCartAdded: (productId: number) => void;
}) {
  const [loadingCart, setLoadingCart]         = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlisted, setWishlisted]           = useState(false);
  const [toasts, setToasts]                   = useState<Toast[]>([]);
  const toastCounter                          = useRef(0);

  const disc   = calcDiscount(product.price, product.sell_price);
  const isNew  = new Date(product.created_at) > new Date(Date.now() - 30 * 86400000);
  const isOos  = product.product_type !== "ebook" && product.stock === 0;
  const format = getFormat(product.product_type);

  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = ++toastCounter.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    window.location.href = `/product/${product.slug}`;
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOos || loadingCart || inCart) return;
    const token = localStorage.getItem("token");
    if (!token) { showToast("Please log in to add items to cart", "info"); return; }
    setLoadingCart(true);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id, format, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { showToast("Please log in to add items to cart", "info"); return; }
        showToast(data?.message || "Could not add to cart", "error"); return;
      }
      window.dispatchEvent(new Event("cart-change"));
      showToast(`"${product.title}" added to cart`, "success");
      onCartAdded(product.id);
    } catch { showToast("Network error — please try again", "error"); }
    finally { setLoadingCart(false); }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingWishlist) return;
    const token = localStorage.getItem("token");
    if (!token) { showToast("Please log in to save to wishlist", "info"); return; }
    const prev = wishlisted;
    setWishlisted((w) => !w);
    setLoadingWishlist(true);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/wishlist`, {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id }),
      });
      if (!res.ok) { setWishlisted(prev); showToast("Wishlist update failed", "error"); return; }
      showToast(prev ? "Removed from wishlist" : `"${product.title}" saved`, prev ? "info" : "success");
    } catch { setWishlisted(prev); showToast("Network error — please try again", "error"); }
    finally { setLoadingWishlist(false); }
  };

  const cartDisabled  = isOos || loadingCart || inCart;
  const cartBtnBg     = isOos ? "#2a2a2d" : inCart ? "rgba(201,168,76,.12)" : "#c9a84c";
  const cartBtnColor  = isOos ? "#ffffff" : inCart ? "#c9a84c" : "#0a0a0b";

  return (
    <>
      <ToastList toasts={toasts} />
      <div
        className="group relative bg-[#1c1c1e] cursor-pointer overflow-hidden
          transition-[transform,box-shadow] duration-[350ms] ease-out
          hover:-translate-y-[5px] hover:shadow-[0_20px_52px_rgba(0,0,0,.6),0_0_0_1px_rgba(201,168,76,.15)]
          hover:z-[2]"
        onClick={handleCardClick}
      >
        {/* Image area */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-[2] flex flex-col gap-[5px]">
            {isOos ? (
              <span className="text-[7px] sm:text-[8px] tracking-[1.5px] uppercase px-1.5 sm:px-2 py-0.5 bg-[rgba(60,60,60,0.85)] text-white"
                style={{ fontFamily: "'Jost', sans-serif" }}>Out of Stock</span>
            ) : disc > 5 ? (
              <span className="text-[7px] sm:text-[8px] tracking-[1.5px] uppercase px-1.5 sm:px-2 py-0.5 bg-[#8b3a3a] text-[#f5f0e8]"
                style={{ fontFamily: "'Jost', sans-serif" }}>{disc}% Off</span>
            ) : isNew ? (
              <span className="text-[7px] sm:text-[8px] tracking-[1.5px] uppercase px-1.5 sm:px-2 py-0.5 bg-[#c9a84c] text-[#0a0a0b]"
                style={{ fontFamily: "'Jost', sans-serif" }}>New</span>
            ) : null}
            {product.product_type !== "physical" && (
              <span
                className="text-[6px] sm:text-[7px] tracking-[1.5px] uppercase px-1.5 sm:px-2 py-0.5"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: product.product_type === "ebook" ? "rgba(201,168,76,.18)" : "rgba(255,255,255,.08)",
                  color: product.product_type === "ebook" ? "#c9a84c" : "#a0a0a0",
                  border: product.product_type === "ebook" ? "1px solid rgba(201,168,76,.3)" : "1px solid rgba(255,255,255,.1)",
                }}
              >
                {product.product_type === "ebook" ? "E-Book" : "Physical + E-Book"}
              </span>
            )}
          </div>

          {/* Cover */}
          {product.main_image ? (
            <img
              className="w-full h-full object-cover block brightness-[.88] saturate-[.75]
                transition-[transform,filter] duration-[550ms] ease-out
                group-hover:scale-[1.06] group-hover:brightness-[.68] group-hover:saturate-50"
              src={`${API_URL}${product.main_image}`}
              alt={product.title}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2d] to-[#1c1c1e] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3a3a3d" strokeWidth="1">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          )}

          {/* Overlay + actions */}
          <div
            className="absolute inset-0 flex flex-col justify-end px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 transition-all duration-[350ms]"
            style={{ background: "linear-gradient(to top, rgba(10,10,11,.96) 0%, rgba(10,10,11,.45) 45%, transparent 70%)" }}
          >
            {/* On touch: always show; on hover: slide up */}
            <div className="flex gap-1 sm:gap-1.5
              sm:opacity-0 sm:translate-y-[10px] sm:transition-[opacity,transform] sm:duration-[350ms]
              sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
              <button
                disabled={cartDisabled}
                onClick={addToCart}
                className={[
                  "flex-1 text-[8px] sm:text-[9px] tracking-[1.5px] sm:tracking-[2px] uppercase font-medium py-[7px] sm:py-[9px] px-1 border-none",
                  "flex items-center justify-center gap-[4px] sm:gap-[5px] transition-colors duration-[250ms]",
                  cartDisabled && !inCart ? "cursor-not-allowed" : inCart ? "cursor-default" : "cursor-pointer hover:bg-[#f5f0e8]",
                ].join(" ")}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: cartBtnBg,
                  color: cartBtnColor,
                  border: inCart ? "1px solid rgba(201,168,76,.3)" : "none",
                }}
              >
                {loadingCart ? (
                  <span className="w-[9px] h-[9px] rounded-full animate-spin border-[1.5px] border-[rgba(10,10,11,.3)] border-t-[#0a0a0b]" />
                ) : inCart ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    In Cart
                  </>
                ) : isOos ? "Sold Out" : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <button
                aria-label={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                onClick={toggleWishlist}
                className={[
                  "w-8 sm:w-9 shrink-0 flex items-center justify-center border",
                  "transition-all duration-[250ms]",
                  wishlisted
                    ? "text-[#c9a84c] bg-[rgba(201,168,76,.12)] border-[rgba(201,168,76,.4)]"
                    : "text-white bg-[rgba(255,255,255,.07)] border-[rgba(255,255,255,.1)] hover:text-[#c9a84c] hover:border-[rgba(201,168,76,.4)]",
                  loadingWishlist ? "opacity-60 cursor-wait" : "cursor-pointer",
                ].join(" ")}
              >
                {loadingWishlist ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24"
                    fill={wishlisted ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Text block */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-3.5 pb-4 sm:pb-[18px] border-t border-[rgba(201,168,76,.07)]">
          <h3
            className="text-[14px] sm:text-[16px] font-semibold text-[#f5f0e8] leading-[1.25] mb-1.5 sm:mb-2 line-clamp-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {product.title}
          </h3>
          {product.rating > 0 && <div className="mb-1.5 sm:mb-2"><Stars rating={product.rating} /></div>}
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] sm:text-[15px] font-medium text-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              ₹{parseFloat(String(product.sell_price)).toFixed(0)}
            </span>
            {disc > 0 && (
              <span className="text-[10px] sm:text-[11px] text-white line-through"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                ₹{parseFloat(String(product.price)).toFixed(0)}
              </span>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-[10px] h-[10px] border-b border-r border-[rgba(201,168,76,0.25)]" />
      </div>
    </>
  );
}

/* ══════════════════════
   MAIN PAGE
══════════════════════ */
export default function CategoryPage() {
  const params = useParams();
  const slug   = params?.slug as string;

  const [products, setProducts]               = useState<Product[]>([]);
  const [total, setTotal]                     = useState(0);
  const [page, setPage]                       = useState(1);
  const [loading, setLoading]                 = useState(true);
  const [sort, setSort]                       = useState("latest");
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceInput, setPriceInput]           = useState<[number, number]>([0, 5000]);
  const [selectedRating, setSelectedRating]   = useState(0);
  const [selectedAuthor, setSelectedAuthor]   = useState("");

  const [authors, setAuthors]           = useState<Author[]>([]);
  const [ratingCounts, setRatingCounts] = useState<RatingCounts>({});
  const [categories, setCategories]     = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [cartProductIds, setCartProductIds] = useState<Set<number>>(new Set());

  const totalPages = Math.ceil(total / LIMIT);

  const fetchCartIds = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.cart)) {
        setCartProductIds(new Set(data.cart.map((item: { product_id: number }) => item.product_id)));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchCartIds();
    window.addEventListener("cart-change", fetchCartIds);
    return () => window.removeEventListener("cart-change", fetchCartIds);
  }, [fetchCartIds]);

  const handleCartAdded = (productId: number) => {
    setCartProductIds((prev) => new Set([...prev, productId]));
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    const p = new URLSearchParams({
      page: String(page), limit: String(LIMIT), sort,
      search: debouncedSearch,
      min: String(priceInput[0]), max: String(priceInput[1]),
      rating: String(selectedRating), author: selectedAuthor,
    });
    fetch(`${API_URL}/api/ag-classics/viewcategory/${slug}/products?${p}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setTotal(d.total || 0); })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [slug, page, sort, debouncedSearch, priceInput, selectedRating, selectedAuthor]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/ag-classics/viewcategory/${slug}/top-authors`)
      .then((r) => r.json()).then(setAuthors).catch(() => setAuthors([]));
    fetch(`${API_URL}/api/ag-classics/viewcategory/${slug}/rating-counts`)
      .then((r) => r.json()).then(setRatingCounts).catch(() => setRatingCounts({}));
    fetch(`${API_URL}/api/ag-classics/viewcategory/counts`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        const currentCat = data.find((c: Category) => c.slug === slug);
        setCategoryName(currentCat
          ? currentCat.name
          : slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
        );
      })
      .catch(() => {
        setCategories([]);
        setCategoryName(slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()));
      });
  }, [slug]);

  useEffect(() => { setPage(1); }, [sort, debouncedSearch, priceInput, selectedRating, selectedAuthor]);

  const clearFilters = () => {
    setSelectedRating(0); setSelectedAuthor("");
    setPriceInput([0, 5000]); setSearch(""); setSort("latest");
  };

  const activeFilters = selectedRating > 0 || !!selectedAuthor || priceInput[0] > 0 || priceInput[1] < 5000;

  const sidebarProps = {
    authors, ratingCounts, categories, currentSlug: slug,
    priceInput, setPriceInput,
    selectedRating, setSelectedRating,
    selectedAuthor, setSelectedAuthor,
    activeFilters, clearFilters,
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen bg-[#0a0a0b] pt-[120px] sm:pt-[130px] md:pt-[140px]">

        {/* ── Hero Banner ── */}
        <div className="relative px-4 sm:px-8 md:px-16 pt-8 sm:pt-10 md:pt-12 pb-7 sm:pb-9 md:pb-10
          border-b border-[rgba(201,168,76,.1)] overflow-hidden">
          <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,.04) 0%, transparent 70%)" }} />
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <a href="/ag-classics"
                className="text-[10px] tracking-[2px] uppercase text-white no-underline transition-colors duration-200 hover:text-[#c9a84c]"
                style={{ fontFamily: "'Jost', sans-serif" }}>AG Classics</a>
              <span className="text-[#3a3a3d]">›</span>
              <span className="text-[10px] tracking-[2px] uppercase text-[#c9a84c]"
                style={{ fontFamily: "'Jost', sans-serif" }}>{categoryName}</span>
            </div>
            <h1 className="text-[clamp(24px,4vw,52px)] font-light italic text-[#f5f0e8] leading-[1.1] mb-2 sm:mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>{categoryName}</h1>
            <div className="flex items-center gap-3">
              <div className="w-8 sm:w-10 h-px bg-[rgba(201,168,76,.4)]" />
              <span className="text-[11px] text-white tracking-wide"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                {total} {total === 1 ? "Title" : "Titles"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-16 py-6 sm:py-8
          grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[290px_1fr] gap-6 md:gap-8 lg:gap-10 items-start">

          {/* Desktop sidebar */}
          <aside className="hidden md:block sticky top-[100px]">
            <SidebarContent {...sidebarProps} />
          </aside>

          {/* Content */}
          <main>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">

              {/* Top row on mobile: filter button + sort */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile filter button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden flex items-center gap-2
                    bg-[rgba(201,168,76,.08)] border border-[rgba(201,168,76,.2)]
                    px-3 py-[7px] text-[#c9a84c] text-[10px] tracking-[2px] uppercase cursor-pointer"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  Filters
                  {activeFilters && (
                    <span className="inline-flex items-center justify-center w-[14px] h-[14px] text-[9px] bg-[#c9a84c] text-[#0a0a0b] rounded-full">!</span>
                  )}
                </button>

                {/* Sort buttons */}
                <div className="flex">
                  {[
                    { key: "latest",     label: "Latest" },
                    { key: "price_low",  label: "Price ↑" },
                    { key: "price_high", label: "Price ↓" },
                  ].map((s) => (
                    <button key={s.key} onClick={() => setSort(s.key)}
                      className={[
                        "text-[9px] sm:text-[10px] tracking-[1.5px] uppercase px-3 sm:px-4 py-[6px] sm:py-[7px] cursor-pointer border whitespace-nowrap transition-all duration-200",
                        sort === s.key
                          ? "bg-[#c9a84c] text-[#0a0a0b] border-[#c9a84c]"
                          : "bg-transparent text-white border-[rgba(255,255,255,.07)] hover:text-[#c9a84c] hover:border-[rgba(201,168,76,.25)]",
                      ].join(" ")}
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 bg-[rgba(201,168,76,.04)] border border-[rgba(201,168,76,.1)] px-3 py-[7px] w-full sm:w-auto sm:max-w-[280px] md:max-w-[300px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="1.5" className="shrink-0">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search in collection…"
                  className="flex-1 w-full bg-transparent !border-none !outline-none focus:!outline-none focus:!ring-0 text-[12px] text-[#e8e0d0] tracking-[0.5px] placeholder:text-white/60"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="bg-transparent border-none cursor-pointer text-white p-0 leading-none flex shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilters && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
                {selectedRating > 0 && (
                  <FilterTag label={`${selectedRating}★ & above`} onRemove={() => setSelectedRating(0)} />
                )}
                {selectedAuthor && (
                  <FilterTag
                    label={authors.find((a) => String(a.id) === selectedAuthor)?.name || "Author"}
                    onRemove={() => setSelectedAuthor("")}
                  />
                )}
                {(priceInput[0] > 0 || priceInput[1] < 5000) && (
                  <FilterTag label={`₹${priceInput[0]} – ₹${priceInput[1]}`} onRemove={() => setPriceInput([0, 5000])} />
                )}
                <button onClick={clearFilters}
                  className="text-[9px] tracking-[2px] uppercase text-[#8b3a3a] bg-transparent border border-[rgba(139,58,58,.3)] px-3 py-1 cursor-pointer"
                  style={{ fontFamily: "'Jost', sans-serif" }}>
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid — 2 cols on mobile, 2 on tablet, 3 on desktop */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <div key={i} className="bg-[#1c1c1e] overflow-hidden">
                    <div className="ac-skeleton w-full" style={{ aspectRatio: "3/4" }} />
                    <div className="px-3 sm:px-4 pt-3 pb-4">
                      <div className="ac-skeleton h-4 mb-2 rounded-sm" />
                      <div className="ac-skeleton h-4 w-[65%] mb-3 rounded-sm" />
                      <div className="ac-skeleton h-3.5 w-[40%] rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <div className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] mx-auto mb-4 sm:mb-5 flex items-center justify-center border border-[rgba(201,168,76,.15)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="1">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <p className="text-[18px] sm:text-[20px] italic text-white mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>No volumes found</p>
                <p className="text-[11px] text-[#3a3a3d] tracking-wide"
                  style={{ fontFamily: "'Jost', sans-serif" }}>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inCart={cartProductIds.has(product.id)}
                    onCartAdded={handleCartAdded}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-10 sm:mt-12">
                <div className="flex-1 h-px hidden sm:block"
                  style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,.15))" }} />
                <PaginationBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </PaginationBtn>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                    return (
                      <PaginationBtn key={p} active={page === p} onClick={() => setPage(p)}>
                        {p}
                      </PaginationBtn>
                    );
                  }
                  if (Math.abs(p - page) === 2) {
                    return <span key={p} className="text-white text-[11px]" style={{ fontFamily: "'Jost', sans-serif" }}>…</span>;
                  }
                  return null;
                })}
                <PaginationBtn disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </PaginationBtn>
                <div className="flex-1 h-px hidden sm:block"
                  style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,.15))" }} />
              </div>
            )}
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-[4px]"
              onClick={() => setSidebarOpen(false)} />
            <div className="fixed top-0 left-0 bottom-0 w-[min(300px,85vw)] z-[201] bg-[#141415]
              border-r border-[rgba(201,168,76,.12)] overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="text-[13px] text-[#f5f0e8] tracking-[2px]"
                  style={{ fontFamily: "'Cinzel', serif" }}>FILTERS</span>
                <button onClick={() => setSidebarOpen(false)}
                  className="bg-transparent border-none cursor-pointer text-white p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <SidebarContent {...sidebarProps} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ── Pagination button ── */
function PaginationBtn({
  children, active = false, disabled = false, onClick,
}: {
  children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-8 h-8 sm:w-[34px] sm:h-[34px] flex items-center justify-center border text-[11px] bg-transparent transition-all duration-200",
        active
          ? "bg-[#c9a84c] text-[#0a0a0b] border-[#c9a84c]"
          : "text-white border-[rgba(255,255,255,.07)] hover:text-[#c9a84c] hover:border-[rgba(201,168,76,.25)]",
        disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {children}
    </button>
  );
}

/* ══════════════════════
   SIDEBAR CONTENT
══════════════════════ */
function SidebarContent({
  authors, ratingCounts, categories, currentSlug,
  priceInput, setPriceInput,
  selectedRating, setSelectedRating,
  selectedAuthor, setSelectedAuthor,
  activeFilters, clearFilters,
}: {
  authors: Author[]; ratingCounts: RatingCounts; categories: Category[];
  currentSlug: string; priceInput: [number, number];
  setPriceInput: (v: [number, number]) => void;
  selectedRating: number; setSelectedRating: (v: number) => void;
  selectedAuthor: string; setSelectedAuthor: (v: string) => void;
  activeFilters: boolean; clearFilters: () => void;
}) {
  const parents    = categories.filter((c) => c.parent_id === null);
  const childrenOf = (id: number) => categories.filter((c) => c.parent_id === id);
  const currentCat = categories.find((c) => c.slug === currentSlug);
  const sectionCls = "border-b border-[rgba(201,168,76,.08)] pb-5 mb-5";
  const labelCls   = "block mb-3 sm:mb-3.5 text-[11px] sm:text-sm tracking-[3px] uppercase text-[#c9a84c]";

  return (
    <div>
      {/* Categories */}
      {categories.length > 0 && (
        <div className={sectionCls}>
          <span className={labelCls} style={{ fontFamily: "'Jost', sans-serif" }}>Genre</span>
          <div className="flex flex-col">
            {parents.map((parent) => {
              const children         = childrenOf(parent.id);
              const isParentActive   = parent.slug === currentSlug;
              const isParentAncestor = currentCat?.parent_id === parent.id;
              return (
                <div key={parent.id}>
                  <a href={`/category/${parent.slug}`}
                    className={["flex items-center justify-between py-[6px] sm:py-[7px] px-2 no-underline border-l-2 transition-all duration-200",
                      isParentActive ? "bg-[rgba(201,168,76,.08)] border-[#c9a84c]" : "border-transparent hover:bg-[rgba(201,168,76,.04)]",
                    ].join(" ")}>
                    <span className={["text-[13px] sm:text-sm tracking-[.5px]",
                      isParentActive ? "font-medium text-[#c9a84c]" : isParentAncestor ? "font-medium text-[#e8e0d0]" : "font-normal text-[#b0a898]",
                    ].join(" ")} style={{ fontFamily: "'Jost', sans-serif" }}>
                      {parent.name}
                    </span>
                    <span className={["text-[12px] sm:text-sm shrink-0 ml-2", isParentActive ? "text-[#c9a84c]" : "text-[#4a4a4d]"].join(" ")}
                      style={{ fontFamily: "'Jost', sans-serif" }}>({parent.product_count})</span>
                  </a>
                  {children.map((child) => {
                    const isChildActive = child.slug === currentSlug;
                    return (
                      <a key={child.id} href={`/category/${child.slug}`}
                        className={["flex items-center justify-between py-[5px] pl-5 pr-2 no-underline border-l-2 transition-all duration-200",
                          isChildActive ? "bg-[rgba(201,168,76,.08)] border-[#c9a84c]" : "border-transparent hover:bg-[rgba(201,168,76,.04)]",
                        ].join(" ")}>
                        <span className={["text-[12px] sm:text-sm tracking-[.3px]",
                          isChildActive ? "font-medium text-[#c9a84c]" : "font-light text-white"].join(" ")}
                          style={{ fontFamily: "'Jost', sans-serif" }}>{child.name}</span>
                        <span className={["text-[12px] sm:text-sm shrink-0 ml-2", isChildActive ? "text-[#c9a84c]" : "text-[#4a4a4d]"].join(" ")}
                          style={{ fontFamily: "'Jost', sans-serif" }}>({child.product_count})</span>
                      </a>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <span className="text-[11px] text-[#f5f0e8] tracking-[3px] uppercase"
          style={{ fontFamily: "'Cinzel', serif" }}>Filters</span>
        {activeFilters && (
          <button onClick={clearFilters}
            className="text-[9px] tracking-[1.5px] uppercase text-[#8b3a3a] bg-transparent border-none cursor-pointer"
            style={{ fontFamily: "'Jost', sans-serif" }}>Clear</button>
        )}
      </div>

      {/* Price Range */}
      <div className={sectionCls}>
        <span className={labelCls} style={{ fontFamily: "'Jost', sans-serif" }}>Price Range</span>
        <div className="flex justify-between mb-3">
          <span className="text-[11px] text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>₹{priceInput[0]}</span>
          <span className="text-[11px] text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>₹{priceInput[1]}</span>
        </div>
        <input type="range"
          className="w-full h-0.5 appearance-none outline-none cursor-pointer bg-[rgba(201,168,76,.2)]
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c9a84c]
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0a0a0b] [&::-webkit-slider-thumb]:cursor-pointer"
          min={0} max={5000} step={50} value={priceInput[0]}
          onChange={(e) => setPriceInput([Math.min(Number(e.target.value), priceInput[1] - 50), priceInput[1]])}
        />
        <input type="range"
          className="w-full h-0.5 appearance-none outline-none cursor-pointer mt-2 bg-[rgba(201,168,76,.2)]
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c9a84c]
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0a0a0b] [&::-webkit-slider-thumb]:cursor-pointer"
          min={0} max={5000} step={50} value={priceInput[1]}
          onChange={(e) => setPriceInput([priceInput[0], Math.max(Number(e.target.value), priceInput[0] + 50)])}
        />
      </div>

      {/* Rating */}
      <div className={sectionCls}>
        <span className={labelCls} style={{ fontFamily: "'Jost', sans-serif" }}>Rating</span>
        {[4, 3, 2, 1].map((r) => (
          <button key={r}
            onClick={() => setSelectedRating(selectedRating === r ? 0 : r)}
            className={["flex items-center gap-2 sm:gap-2.5 w-full px-2 py-[6px] sm:py-[7px] mb-1 cursor-pointer border bg-transparent transition-all duration-200",
              selectedRating === r ? "bg-[rgba(201,168,76,.08)] border-[rgba(201,168,76,.2)]" : "border-transparent hover:bg-[rgba(201,168,76,.04)]",
            ].join(" ")}
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24"
                  fill={i <= r ? "#c9a84c" : "none"} stroke={i <= r ? "#c9a84c" : "#3a3a3d"} strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-[12px] sm:text-sm text-white tracking-wide" style={{ fontFamily: "'Jost', sans-serif" }}>
              & above {ratingCounts[r] ? `(${ratingCounts[r]})` : ""}
            </span>
          </button>
        ))}
      </div>

      {/* Authors */}
      {authors.length > 0 && (
        <div className={sectionCls}>
          <span className={labelCls} style={{ fontFamily: "'Jost', sans-serif" }}>Authors</span>
          {authors.map((author) => {
            const isActive = selectedAuthor === String(author.id);
            return (
              <div key={author.id}
                onClick={() => setSelectedAuthor(isActive ? "" : String(author.id))}
                className={["flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-[7px] sm:py-2 cursor-pointer border transition-colors duration-200",
                  isActive ? "bg-[rgba(201,168,76,.08)] border-[rgba(201,168,76,.2)]" : "border-transparent hover:bg-[rgba(201,168,76,.05)]",
                ].join(" ")}
              >
                {author.profile_image ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${author.profile_image}`} alt={author.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0 border border-[rgba(201,168,76,.15)]" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[rgba(201,168,76,.08)] border border-[rgba(201,168,76,.15)] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={["text-[13px] sm:text-sm tracking-[.5px] truncate m-0", isActive ? "text-[#c9a84c]" : "text-[#e8e0d0]"].join(" ")}
                    style={{ fontFamily: "'Jost', sans-serif" }}>{author.name}</p>
                  <p className="text-[11px] sm:text-xs text-white mt-0.5 mb-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {author.product_count} {author.product_count === 1 ? "book" : "books"}
                  </p>
                </div>
                {isActive && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" className="shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Ornament */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,.2), transparent)" }} />
        <div className="w-1 h-1 rotate-45 bg-[rgba(201,168,76,.3)]" />
      </div>
    </div>
  );
}

/* ── Filter tag chip ── */
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-[rgba(201,168,76,.08)] border border-[rgba(201,168,76,.2)] pl-2.5 sm:pl-3 pr-2 py-1">
      <span className="text-[10px] text-[#c9a84c] tracking-[.5px]" style={{ fontFamily: "'Jost', sans-serif" }}>{label}</span>
      <button onClick={onRemove} className="bg-transparent border-none cursor-pointer text-[#8a6f2e] p-0 leading-none flex">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}