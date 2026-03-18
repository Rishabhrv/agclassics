"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MagneticBtn } from "@/components/motion/Motionutils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Author {
  id: number;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
}
interface GalleryImage {
  id: number;
  image_path: string;
  sort_order: number;
}
interface EbookFile {
  id: number;
  file_type: "pdf" | "epub";
  price: number;
  sell_price: number;
}
interface Attribute {
  name: string;
  value: string;
}
interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  images: string[];
}
interface Product {
  id: number;
  title: string;
  slug: string;
  sku: string;
  isbn: string;
  price: number;
  sell_price: number;
  main_image: string;
  description: string;
  stock: number;
  product_type: "ebook" | "physical" | "both";
  created_at: string;
  authors: Author[];
  gallery: GalleryImage[];
  ebook_files: EbookFile[];
  attributes: Attribute[];
  avg_rating: number | null;
  review_count: number;
}
interface RecommendedProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  main_image: string;
  authors: { id: number; name: string; slug: string }[];
  avg_rating: number | null;
  review_count: number;
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const disc = (price: number, sell: number): number =>
  price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

/* ─────────────────────────────────────────────
   STYLES — only animations, pseudo-elements,
   descendant hover, and :focus.
   NO global resets, NO @import.
───────────────────────────────────────────── */
const PAGE_STYLES = `
  .agc-page, .agc-page *, .agc-page *::before, .agc-page *::after {
    box-sizing: border-box;
  }

  @keyframes agcFadeUp  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
  @keyframes agcScaleIn { from{opacity:0;transform:scale(0.97)}       to{opacity:1;transform:scale(1)} }
  @keyframes agcShimmer { from{left:-60%} to{left:140%} }
  @keyframes agcPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0)} 50%{box-shadow:0 0 0 10px rgba(201,168,76,0.13)} }
  @keyframes agcSpin    { to{transform:rotate(360deg)} }
  @keyframes agcSk      { from{background-position:-200% 0} to{background-position:200% 0} }

  .agc-page .fu0{animation:agcFadeUp 0.65s ease 0.05s both}
  .agc-page .fu1{animation:agcFadeUp 0.65s ease 0.12s both}
  .agc-page .fu2{animation:agcFadeUp 0.7s  ease 0.20s both}
  .agc-page .fu3{animation:agcFadeUp 0.7s  ease 0.28s both}
  .agc-page .fu4{animation:agcFadeUp 0.75s ease 0.36s both}
  .agc-page .fu5{animation:agcFadeUp 0.75s ease 0.44s both}
  .agc-page .sc {animation:agcScaleIn 0.85s ease 0.05s both}

  .agc-sk {
    background: linear-gradient(90deg,#161618 0%,#252528 50%,#161618 100%);
    background-size: 200% 100%;
    animation: agcSk 1.6s infinite;
  }

  /* shimmer sweep on gold CTA */
  .agc-cta-g { position:relative; overflow:hidden; }
  .agc-cta-g::after {
    content:''; position:absolute; top:0;
    width:45%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
  }
  .agc-cta-g:hover:not(:disabled)::after { animation:agcShimmer 0.5s ease; }

  /* descendant hover: rec card zoom */
  .agc-rec:hover .agc-rec-img { transform:scale(1.06); }

  /* input focus ring */
  .agc-rv-input:focus { border-color:rgba(201,168,76,0.45); outline:none; }

  /* prose from DB html */
  .agc-prose p  { margin-bottom:14px; line-height:1.9; }
  .agc-prose ul { padding-left:22px; margin-bottom:14px; }
  .agc-prose li { margin-bottom:8px; line-height:1.75; }
  .agc-prose em { color:#c9a84c; }
  .agc-prose strong { color:#e8e0d0; font-weight:500; }

  .agc-spin { animation:agcSpin 0.7s linear infinite; }
  .agc-pulse { animation:agcPulse 0.6s ease; }
`;

/* ─────────────────────────────────────────────
   STARS
───────────────────────────────────────────── */
interface StarsProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (n: number) => void;
}
function Stars({ rating, size = 14, interactive = false, onRate }: StarsProps) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size} height={size} viewBox="0 0 24 24"
          fill={(interactive ? hover || rating : rating) >= s ? "#c9a84c" : "none"}
          stroke="#c9a84c" strokeWidth="1.5"
          className={`transition-all duration-150 ${interactive ? "cursor-pointer" : "cursor-default"}`}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(s)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────── */
interface LightboxProps {
  images: string[];
  active: number;
  onClose: () => void;
  onChange: (i: number) => void;
}
function Lightbox({ images, active, onClose, onChange }: LightboxProps) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange(Math.min(active + 1, images.length - 1));
      if (e.key === "ArrowLeft") onChange(Math.max(active - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, images.length, onClose, onChange]);

  const lbBtn = "flex items-center justify-center w-12 h-12 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] cursor-pointer text-xl";

  return (
    <div onClick={onClose} className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
      <button onClick={onClose} className={`${lbBtn} absolute top-6 right-6`}>✕</button>
      {active > 0 && (
        <button onClick={(e) => { e.stopPropagation(); onChange(active - 1); }} className={`${lbBtn} absolute left-6 top-1/2 -translate-y-1/2`}>‹</button>
      )}
      <img src={`${API_URL}${images[active]}`} alt="" onClick={(e) => e.stopPropagation()} className="max-w-[85vw] max-h-[85vh] object-contain" />
      {active < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); onChange(active + 1); }} className={`${lbBtn} absolute right-6 top-1/2 -translate-y-1/2`}>›</button>
      )}
      <div className="absolute bottom-6 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onChange(i); }}
            className="h-[6px] border-none cursor-pointer transition-all duration-300"
            style={{ width: i === active ? 24 : 6, background: i === active ? "#c9a84c" : "rgba(201,168,76,0.3)" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="agc-page grid grid-cols-2 gap-20 px-20 pt-[140px] pb-20 max-w-[1440px] mx-auto max-md:grid-cols-1 max-md:px-6">
      <style>{PAGE_STYLES}</style>
      <div className="agc-sk aspect-[3/4] w-full" />
      <div className="pt-12 flex flex-col gap-[18px]">
        {[160, 300, 120, 56, 80, 200].map((w, i) => (
          <div key={i} className="agc-sk" style={{ height: i === 1 ? 52 : 16, width: w, maxWidth: "100%" }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADING
───────────────────────────────────────────── */
function SectionHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[18px] mb-12">
      <div className="h-px w-14" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.6))" }} />
      <h2 className="text-lg tracking-[5px] uppercase text-[#c9a84c] whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
        {children}
      </h2>
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.6), transparent)" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ProductPage() {
  const params  = useParams();
  const router  = useRouter();
  const slug    = params?.slug as string;

  const [product,     setProduct]     = useState<Product | null>(null);
  const [reviews,     setReviews]     = useState<Review[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const [activeImg,    setActiveImg]    = useState(0);
  const [lightboxImg,  setLightboxImg]  = useState<number | null>(null);
  const [selectedFmt,  setSelectedFmt]  = useState<"physical" | "ebook">("physical");
  const [qty,          setQty]          = useState(1);
  const [addedToCart,  setAddedToCart]  = useState(false);
  const [wishlisted,   setWishlisted]   = useState(false);

  const [rvRating,    setRvRating]    = useState(0);
  const [rvName,      setRvName]      = useState("");
  const [rvComment,   setRvComment]   = useState("");
  const [rvSubmitting,setRvSubmitting]= useState(false);
  const [rvSubmitted, setRvSubmitted] = useState(false);
  const [rvError,     setRvError]     = useState("");

  const [rvPage,      setRvPage]      = useState(0);
  const RV_PER_PAGE = 3;
  const reviewRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ── */
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ag-classics/${slug}`);
        if (!res.ok) {
          if (res.status === 404) { router.replace("/"); return; }
          throw new Error("Failed to load product");
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const p: Product = data.product;
        setProduct(p);
        if (p.product_type === "ebook") setSelectedFmt("ebook");

        const [rvRes, recRes] = await Promise.all([
          fetch(`${API_URL}/api/ag-classics/${slug}/reviews?limit=50`),
          fetch(`${API_URL}/api/ag-classics?limit=8`),
        ]);
        if (rvRes.ok) {
          const d = await rvRes.json();
          if (d.success) setReviews(d.reviews);
        }
        if (recRes.ok) {
          const d = await recRes.json();
          if (d.success)
            setRecommended((d.products as RecommendedProduct[]).filter((r) => r.slug !== slug).slice(0, 4));
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, router]);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
    // TODO: POST /api/cart
  };

  const handleReviewSubmit = async () => {
    if (!rvRating || !rvName.trim() || !rvComment.trim()) {
      setRvError("Please fill in all fields and select a rating.");
      return;
    }
    setRvError("");
    setRvSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // TODO: POST /api/reviews
      setRvSubmitted(true);
    } catch {
      setRvError("Could not submit review. Please try again.");
    } finally {
      setRvSubmitting(false);
    }
  };

  if (loading) return <Skeleton />;

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[#0c0c0e]">
        <p className="text-[28px] italic text-[#f5f0e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {error || "Product not found"}
        </p>
        <MagneticBtn
          style={{ background: "#c9a84c", color: "#0a0a0b", padding: "13px 36px", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Jost', sans-serif", border: "none", cursor: "pointer" }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = "#e8c860")}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = "#c9a84c")}
          onClick={() => router.push("/ag-classics")}
        >
          Back to Collection
        </MagneticBtn>
      </div>
    );
  }

  const dpct           = disc(product.price, product.sell_price);
  const allImages      = [product.main_image, ...product.gallery.map((g) => g.image_path)].filter(Boolean);
  const isOos          = product.stock === 0 && selectedFmt === "physical";
  const totalRvPages   = Math.ceil(reviews.length / RV_PER_PAGE);
  const visibleReviews = reviews.slice(rvPage * RV_PER_PAGE, (rvPage + 1) * RV_PER_PAGE);
  const ratingDist     = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 };
  });

  return (
    <>
      <style>{PAGE_STYLES}</style>

      {lightboxImg !== null && (
        <Lightbox images={allImages} active={lightboxImg} onClose={() => setLightboxImg(null)} onChange={setLightboxImg} />
      )}

      <div className="agc-page bg-[#0c0c0e] text-[#e8e0d0] min-h-screen pt-[130px]" style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* ════════ BREADCRUMB ════════ */}
        <div className="px-20 max-w-[1440px] mx-auto max-md:px-6">
          <button
            className="fu0 inline-flex items-center gap-2 text-[9px] tracking-[3px] uppercase text-[#4a4a4d] bg-transparent border-none cursor-pointer py-[18px] transition-colors duration-300 hover:text-[#c9a84c]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            AG Classics
            <span className="text-[#252528] mx-[2px]">›</span>
            <span className="text-[#8a6f2e] max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
              {product.title}
            </span>
          </button>
        </div>

        {/* ════════ HERO ════════ */}
        <div className="grid grid-cols-2 gap-20 px-20 pt-4 pb-[88px] max-w-[1240px] mx-auto max-lg:grid-cols-1 max-md:px-6 max-md:gap-10">

          {/* LEFT: Gallery */}
          <div className="sc">
            <div
              className="relative  border border-[rgba(201,168,76,0.08)] cursor-zoom-in overflow-hidden"
              onClick={() => setLightboxImg(activeImg)}
            >
              {allImages[activeImg] ? (
                <img
                  src={`${API_URL}${allImages[activeImg]}`}
                  alt={product.title}
                  className="w-full h-full object-cover block transition-transform duration-700 hover:scale-[1.01] px-20 py-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e1e20,#141416)" }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="0.75" className="opacity-35">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
              )}

              {dpct > 5 && (
                <div className="absolute top-4 left-4 bg-[#7a2e2e] px-3 py-[5px] text-[8px] tracking-[3px] uppercase text-[#f5d5d5]" style={{ fontFamily: "'Cinzel', serif" }}>
                  {dpct}% Off
                </div>
              )}

              {product.stock > 0 && product.stock <= 5 && (
                <div
                  className="absolute left-4 px-3 py-[5px] border border-[rgba(201,168,76,0.3)] bg-[rgba(180,120,0,0.14)] text-[9px] tracking-[2px] uppercase text-[#c9a84c]"
                  style={{ top: dpct > 5 ? 54 : 16, fontFamily: "'Jost', sans-serif" }}
                >
                  Only {product.stock} left
                </div>
              )}

              <div className="absolute bottom-[14px] right-[14px] bg-[rgba(12,12,14,0.78)] border border-[rgba(201,168,76,0.18)] px-3 py-[6px] flex items-center gap-[7px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span className="text-[7px] tracking-[2px] text-white" style={{ fontFamily: "'Cinzel', serif" }}>ZOOM</span>
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-[10px] overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    className={`shrink-0 w-[68px] h-[90px] overflow-hidden border transition-all duration-300 cursor-pointer ${
                      i === activeImg
                        ? "opacity-100 border-[#c9a84c]"
                        : "opacity-40 border-[rgba(201,168,76,0.12)] hover:opacity-100 hover:border-[#c9a84c]"
                    }`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={`${API_URL}${img}`} alt="" className="w-full h-full object-cover block" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="pt-[6px]">

            {/* Eyebrow */}
            <div className="fu0 flex items-center gap-[10px] mb-5">
              <div className="w-8 h-px bg-[#8a6f2e]" />
              <span className="text-[8px] tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>
                AG Classics
              </span>
            </div>

            {/* Title */}
            <h1 className="fu1 font-light leading-[1.08] text-[#f5f0e8] mb-[14px] italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4vw,54px)" }}>
              {product.title}
            </h1>

            {/* Authors */}
            {product.authors.length > 0 && (
              <div className="fu2 flex flex-wrap gap-[6px] mb-4 items-center">
                <span className="text-[11px] text-[#4a4a4d]" style={{ fontFamily: "'Jost', sans-serif" }}>by</span>
                {product.authors.map((a, i) => (
                  <span key={a.id}>
                    <span
                      onClick={() => router.push(`/authors/${a.slug}`)}
                      className="text-[17px] italic text-[#8a6f2e] cursor-pointer transition-colors duration-300 hover:text-[#c9a84c]"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {a.name}
                    </span>
                    {i < product.authors.length - 1 && <span className="text-[#3a3a3d] ml-[6px]">&amp;</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Rating */}
            {product.avg_rating && (
              <div
                className="fu2 flex items-center gap-[10px] mb-[22px] cursor-pointer"
                onClick={() => reviewRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                <Stars rating={product.avg_rating} size={13} />
                <span className="text-[12px] font-medium text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {product.avg_rating.toFixed(1)}
                </span>
                <span className="text-[#252528]">·</span>
                <span className="text-[11px] text-white underline decoration-[rgba(107,107,112,0.35)]" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {product.review_count} review{product.review_count !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Ornament */}
            <div className="fu2 flex items-center gap-3 mb-[26px]">
              <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
              <div className="w-1 h-1 bg-[rgba(201,168,76,0.35)] rotate-45" />
              <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
            </div>

            {/* Price */}
            <div className="fu3 flex items-baseline gap-[14px] mb-[26px]">
              <span className="text-[38px] font-medium text-[#c9a84c] tracking-[-1px]" style={{ fontFamily: "'Jost', sans-serif" }}>
                ₹{parseFloat(String(product.sell_price)).toFixed(0)}
              </span>
              {dpct > 0 && (
                <>
                  <span className="text-xl text-[#3a3a3d] line-through" style={{ fontFamily: "'Jost', sans-serif" }}>
                    ₹{parseFloat(String(product.price)).toFixed(0)}
                  </span>
                  <span className="text-[8px] tracking-[2px] px-[10px] py-1 bg-[rgba(122,46,46,0.22)] text-[#c97070] border border-[rgba(201,100,100,0.18)]" style={{ fontFamily: "'Cinzel', serif" }}>
                    SAVE {dpct}%
                  </span>
                </>
              )}
            </div>

            {/* Format selector */}
            {product.product_type === "both" && (
              <div className="fu3 mb-6">
                <span className="block text-[8px] tracking-[3px] uppercase text-white mb-[10px]" style={{ fontFamily: "'Cinzel', serif" }}>Format</span>
                <div className="flex gap-2">
                  {([{ k: "physical", l: "Paperback" }, { k: "ebook", l: "E-Book" }] as const).map(({ k, l }) => (
                    <button
                      key={k}
                      onClick={() => setSelectedFmt(k)}
                      className={`text-[10px] tracking-[2px] uppercase px-[22px] py-[10px] border transition-all duration-300 cursor-pointer ${
                        selectedFmt === k
                          ? "border-[#c9a84c] bg-[rgba(201,168,76,0.08)] text-[#c9a84c]"
                          : "border-[rgba(255,255,255,0.08)] bg-transparent text-white hover:border-[rgba(201,168,76,0.35)] hover:text-[#8a6f2e]"
                      }`}
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            {selectedFmt === "physical" && product.product_type !== "ebook" && (
              <div className="fu3 flex items-center gap-[14px] mb-[26px]">
                <span className="text-[8px] tracking-[3px] uppercase text-white" style={{ fontFamily: "'Cinzel', serif" }}>Qty</span>
                <div className="flex items-center border border-[rgba(201,168,76,0.2)]">
                  <button
                    className="w-[38px] h-[38px] flex items-center justify-center bg-transparent border-none text-[#c9a84c] text-[22px] cursor-pointer leading-none transition-colors duration-200 hover:bg-[rgba(201,168,76,0.08)]"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >−</button>
                  <span className="w-[42px] text-center text-[15px] text-[#f5f0e8]" style={{ fontFamily: "'Jost', sans-serif" }}>{qty}</span>
                  <button
                    className="w-[38px] h-[38px] flex items-center justify-center bg-transparent border-none text-[#c9a84c] text-[22px] cursor-pointer leading-none transition-colors duration-200 hover:bg-[rgba(201,168,76,0.08)]"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  >+</button>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="fu4 flex gap-[10px] mb-3">
              <MagneticBtn
                className={`agc-cta-g flex-1 px-6 py-4 text-[11px] tracking-[3px] uppercase font-medium border-none cursor-pointer transition-colors duration-300 ${
                  isOos
                    ? "bg-[#252528] text-[#4a4a4d] cursor-not-allowed"
                    : addedToCart
                    ? "bg-[rgba(201,168,76,0.14)] text-[#c9a84c] border border-[#c9a84c] agc-pulse"
                    : "bg-[#c9a84c] text-[#0c0c0e] hover:bg-[#e4be54]"
                }`}
                style={{ fontFamily: "'Jost', sans-serif" }}
                disabled={isOos}
                onClick={handleAddToCart}
              >
                {isOos ? "Out of Stock" : addedToCart ? "✓  Added to Cart" : "Add to Cart"}
              </MagneticBtn>

              <MagneticBtn
                className={`w-[52px] h-[52px] p-0 flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                  wishlisted
                    ? "bg-[rgba(201,168,76,0.1)] border-[rgba(201,168,76,0.5)] text-[#c9a84c]"
                    : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)] text-white hover:border-[rgba(201,168,76,0.45)] hover:text-[#c9a84c]"
                }`}
                onClick={() => setWishlisted(!wishlisted)}
                aria-label="Wishlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#c9a84c" : "none"} stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </MagneticBtn>
            </div>

            {/* Buy Now */}
            {!isOos && (
              <div className="fu4 mb-[30px]">
                <MagneticBtn
                  className="agc-cta-g w-full py-[14px] px-6 text-[11px] tracking-[3px] uppercase bg-transparent border border-[rgba(255,255,255,0.1)] text-[#e8e0d0] cursor-pointer transition-all duration-300 hover:border-[rgba(201,168,76,0.5)] hover:text-[#c9a84c]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                  onClick={() => { /* TODO: buy now */ }}
                >
                  Buy Now — Instant {selectedFmt === "ebook" ? "Download" : "Checkout"}
                </MagneticBtn>
              </div>
            )}

            {/* Trust badges */}
            <div className="fu5 grid grid-cols-2 gap-[2px] border-t border-[rgba(201,168,76,0.08)] pt-[22px]">
              {[
                { ico: "🔒", t: "Secure Payment" },
                { ico: "📦", t: "Free Shipping ₹999+" },
                { ico: "⚡", t: "Instant E-Book Access" },
                { ico: "🔄", t: "7-Day Easy Returns" },
              ].map(({ ico, t }) => (
                <div key={t} className="flex items-center gap-[9px] py-[9px]">
                  <span className="text-[13px]">{ico}</span>
                  <span className="text-[11px] text-white" style={{ fontFamily: "'Jost', sans-serif" }}>{t}</span>
                </div>
              ))}
            </div>

            {/* ISBN / SKU */}
            {(product.isbn || product.sku) && (
              <div className="fu5 flex gap-5 mt-4">
                {product.isbn && (
                  <span className="text-[10px] text-[#3a3a3d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                    ISBN: <span className="text-[#5a5a5e]">{product.isbn}</span>
                  </span>
                )}
                {product.sku && (
                  <span className="text-[10px] text-[#3a3a3d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                    SKU: <span className="text-[#5a5a5e]">{product.sku}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ════════ DESCRIPTION + BOOK DETAILS ════════ */}
        <div className="h-px bg-[rgba(201,168,76,0.09)]" />
        <div className="grid grid-cols-[2fr_1fr] gap-20 px-20 py-[72px] max-w-[1440px] mx-auto max-lg:grid-cols-1 max-md:px-6">

          <div>
            <div className="flex items-center gap-[14px] mb-8">
              <div className="w-[2px] h-[34px]" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
              <h2 className="text-lg tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>About This Book</h2>
            </div>
            <div
              className="agc-prose font-light text-[#8a8a8e] leading-[1.9]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(13px,1.5vw,15px)" }}
              dangerouslySetInnerHTML={{ __html: product.description || "<p>No description available.</p>" }}
            />
          </div>

          {product.attributes.length > 0 && (
            <div>
              <div className="flex items-center gap-[14px] mb-8">
                <div className="w-[2px] h-[34px]" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
                <h2 className="text-lg tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>Book Details</h2>
              </div>
              {product.attributes.map((attr, i) => (
                <div key={i} className="flex justify-between gap-4 py-[13px] border-b border-[rgba(255,255,255,0.04)]">
                  <span className="text-[8px] tracking-[2px] uppercase text-[#4a4a4d] shrink-0" style={{ fontFamily: "'Cinzel', serif" }}>{attr.name}</span>
                  <span className="text-[13px] text-[#8a8a8e] text-right" style={{ fontFamily: "'Jost', sans-serif" }}>{attr.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ════════ AUTHORS ════════ */}
        {product.authors.some((a) => a.bio) && (
          <>
            <div className="h-px bg-[rgba(201,168,76,0.09)]" />
            <div className="px-20 py-[72px] max-w-[1440px] mx-auto max-md:px-6">
              <SectionHeading>About the Author</SectionHeading>
              <div className="flex flex-col gap-4">
                {product.authors.filter((a) => a.bio).map((author) => (
                  <div
                    key={author.id}
                    className="flex gap-7 items-start p-8 bg-[#111113] border border-[rgba(201,168,76,0.09)] transition-colors duration-300 hover:border-[rgba(201,168,76,0.22)] max-md:flex-col"
                  >
                    {author.profile_image ? (
                      <img src={`${API_URL}${author.profile_image}`} alt={author.name} className="w-20 h-20 rounded-full object-cover shrink-0 border border-[rgba(201,168,76,0.25)]" />
                    ) : (
                      <div className="w-20 h-20 rounded-full shrink-0 border border-[rgba(201,168,76,0.2)] flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(138,111,46,0.18),rgba(201,168,76,0.04))" }}>
                        <span className="text-[28px] text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>{author.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-[22px] text-[#f5f0e8] block mb-[6px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{author.name}</span>
                      <div className="flex items-center gap-2 mb-[14px]">
                        <div className="w-7 h-px bg-[rgba(201,168,76,0.3)]" />
                        <span className="text-[7px] tracking-[3px] uppercase text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>Author</span>
                      </div>
                      <p className="text-[17px] italic text-white leading-[1.85]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{author.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════ REVIEWS ════════ */}
        <div className="h-px bg-[rgba(201,168,76,0.09)]" />
        <div ref={reviewRef} className="px-20 py-[72px] max-w-[1440px] mx-auto max-md:px-6">
          <SectionHeading>Reader Reviews</SectionHeading>

          {/* Rating overview */}
          {product.avg_rating && (
            <div className="grid grid-cols-[200px_1fr] gap-14 mb-[60px] items-start max-md:grid-cols-1">
              <div className="text-center py-[38px] px-6 bg-[#111113] border border-[rgba(201,168,76,0.1)]">
                <div className="font-light text-[#f5f0e8] leading-none text-[72px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {product.avg_rating.toFixed(1)}
                </div>
                <div className="flex justify-center my-[14px]">
                  <Stars rating={product.avg_rating} size={15} />
                </div>
                <div className="text-[7px] tracking-[3px] uppercase text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                  {product.review_count} Reviews
                </div>
              </div>

              <div className="pt-[10px]">
                <div className="text-[8px] tracking-[3px] uppercase text-[#8a6f2e] mb-[18px]" style={{ fontFamily: "'Cinzel', serif" }}>Rating Breakdown</div>
                {ratingDist.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-[10px] mb-2">
                    <span className="w-[10px] text-[11px] text-white shrink-0" style={{ fontFamily: "'Jost', sans-serif" }}>{star}</span>
                    <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full transition-[width] duration-[1200ms] ease-in-out"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg,#8a6f2e,#c9a84c)" }}
                      />
                    </div>
                    <span className="w-8 text-[10px] text-[#4a4a4d] text-right" style={{ fontFamily: "'Jost', sans-serif" }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review cards */}
          {reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-[14px] mb-7">
                {visibleReviews.map((rv) => (
                  <div key={rv.id} className="bg-[#111113] border border-[rgba(255,255,255,0.05)] p-[26px] transition-colors duration-300 hover:border-[rgba(201,168,76,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-[rgba(201,168,76,0.07)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center shrink-0">
                          <span className="text-[15px] text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>{rv.user_name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-[#e8e0d0] mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>{rv.user_name}</div>
                          <div className="flex items-center gap-[6px]">
                            <Stars rating={rv.rating} size={11} />
                            <span className="text-[10px] text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>{rv.rating}.0</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#3a3a3d] tracking-[1px] whitespace-nowrap" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {new Date(rv.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div className="h-px bg-[rgba(255,255,255,0.04)] mb-4" />

                    <p className="text-[17px] italic text-[#7a7a7e] leading-[1.78]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      "{rv.comment}"
                    </p>

                    {rv.images.length > 0 && (
                      <div className="flex gap-[6px] mt-[14px]">
                        {rv.images.map((img, i) => (
                          <img key={i} src={`${API_URL}${img}`} alt="" className="w-[52px] h-[52px] object-cover border border-[rgba(201,168,76,0.15)] cursor-pointer" />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-[6px]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span className="text-[7px] tracking-[2px] uppercase text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>Verified Purchase</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalRvPages > 1 && (
                <div className="flex justify-center gap-2 mb-14">
                  <button
                    disabled={rvPage === 0}
                    onClick={() => setRvPage(Math.max(0, rvPage - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.08)] text-white cursor-pointer transition-all duration-300 disabled:opacity-30"
                  >‹</button>
                  {Array.from({ length: totalRvPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRvPage(i)}
                      className={`w-10 h-10 text-[12px] cursor-pointer transition-all duration-300 border ${
                        i === rvPage
                          ? "bg-[rgba(201,168,76,0.1)] border-[#c9a84c] text-[#c9a84c]"
                          : "bg-transparent border-[rgba(255,255,255,0.08)] text-white hover:border-[rgba(201,168,76,0.3)] hover:text-[#c9a84c]"
                      }`}
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={rvPage >= totalRvPages - 1}
                    onClick={() => setRvPage(Math.min(totalRvPages - 1, rvPage + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.08)] text-white cursor-pointer transition-all duration-300 disabled:opacity-30"
                  >›</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 mb-14">
              <p className="text-xl italic text-[#4a4a4d]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                No reviews yet. Be the first to share your thoughts.
              </p>
            </div>
          )}

          {/* Write a Review */}
          <div className="bg-[#111113] border border-[rgba(201,168,76,0.09)] p-10 px-11 max-md:px-6 max-md:p-6">
            <div className="flex items-center gap-[14px] mb-8">
              <div className="w-[2px] h-7" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
              <h3 className="text-[9px] tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>Write a Review</h3>
            </div>

            {rvSubmitted ? (
              <div className="text-center py-10">
                <div className="w-[60px] h-[60px] rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center mx-auto mb-[18px]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p className="text-2xl italic text-[#f5f0e8] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Thank you for your review
                </p>
                <p className="text-[11px] text-white" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Your review will appear after moderation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
                {/* Left */}
                <div className="flex flex-col gap-[22px]">
                  <div>
                    <label className="block text-[8px] tracking-[3px] uppercase text-white mb-3" style={{ fontFamily: "'Cinzel', serif" }}>Your Rating *</label>
                    <div className="flex items-center gap-[14px]">
                      <Stars rating={rvRating} size={28} interactive onRate={setRvRating} />
                      {rvRating > 0 && (
                        <span className="text-base italic text-[#8a6f2e]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {(["", "Poor", "Fair", "Good", "Very Good", "Excellent"] as const)[rvRating]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] tracking-[3px] uppercase text-white mb-[10px]" style={{ fontFamily: "'Cinzel', serif" }}>Your Name *</label>
                    <input
                      type="text"
                      className="agc-rv-input w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.09)] text-[#e8e0d0] text-[13px] outline-none transition-colors duration-300 rounded-none"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      value={rvName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRvName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col gap-[22px]">
                  <div className="flex-1">
                    <label className="block text-[8px] tracking-[3px] uppercase text-white mb-[10px]" style={{ fontFamily: "'Cinzel', serif" }}>Your Review *</label>
                    <textarea
                      className="agc-rv-input w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.09)] text-[#e8e0d0] text-[13px] outline-none transition-colors duration-300 rounded-none resize-y"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      rows={5}
                      value={rvComment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRvComment(e.target.value)}
                      placeholder="Share your thoughts about this book..."
                    />
                  </div>
                  {rvError && <p className="text-[11px] text-[#c97070]" style={{ fontFamily: "'Jost', sans-serif" }}>{rvError}</p>}
                  <button
                    className={`agc-cta-g self-start flex items-center gap-[10px] px-9 py-[14px] text-[11px] tracking-[3px] uppercase bg-[#c9a84c] text-[#0c0c0e] border-none cursor-pointer transition-colors duration-300 hover:bg-[#e4be54] disabled:bg-[#252528] disabled:text-[#4a4a4d] disabled:cursor-not-allowed ${!rvRating || !rvName.trim() || !rvComment.trim() ? "opacity-50" : ""}`}
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    onClick={handleReviewSubmit}
                    disabled={rvSubmitting || !rvRating || !rvName.trim() || !rvComment.trim()}
                  >
                    {rvSubmitting && <span className="agc-spin block w-[14px] h-[14px] border-2 border-[rgba(12,12,14,0.3)] border-t-[#0c0c0e] rounded-full" />}
                    {rvSubmitting ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════════ RECOMMENDED ════════ */}
        {recommended.length > 0 && (
          <>
            <div className="h-px bg-[rgba(201,168,76,0.09)]" />
            <div className="px-20 py-[72px] pb-24 bg-[#0e0e10] max-md:px-6">
              <div className="max-w-[1440px] mx-auto">
                <SectionHeading>You May Also Like</SectionHeading>
                <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-sm:grid-cols-1">
                  {recommended.map((rec) => {
                    const rpct = disc(rec.price, rec.sell_price);
                    return (
                      <div
                        key={rec.id}
                        className="agc-rec bg-[#111113] border border-[rgba(255,255,255,0.05)] overflow-hidden transition-all duration-[350ms] cursor-pointer hover:border-[rgba(201,168,76,0.25)] hover:-translate-y-[5px] hover:shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
                        onClick={() => router.push(`/ag-classics/${rec.slug}`)}
                      >
                        <div className="aspect-[3/4] overflow-hidden relative">
                          {rec.main_image ? (
                            <img src={`${API_URL}${rec.main_image}`} alt={rec.title} className="agc-rec-img w-full h-full object-cover block transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e1e20,#141416)" }}>
                              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="0.75" className="opacity-30">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                              </svg>
                            </div>
                          )}
                          {rpct > 5 && (
                            <div className="absolute top-3 left-3 bg-[#7a2e2e] px-[10px] py-1 text-[7px] tracking-[2px] text-[#f5d5d5]" style={{ fontFamily: "'Cinzel', serif" }}>
                              {rpct}% Off
                            </div>
                          )}
                        </div>
                        <div className="p-[18px] pb-5">
                          {rec.authors.length > 0 && (
                            <div className="text-[10px] tracking-[2px] uppercase text-[#8a6f2e] mb-[7px]" style={{ fontFamily: "'Jost', sans-serif" }}>
                              {rec.authors.map((a) => a.name).join(", ")}
                            </div>
                          )}
                          <div className="text-[18px] italic text-[#f5f0e8] leading-[1.2] mb-[10px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {rec.title}
                          </div>
                          {rec.avg_rating && (
                            <div className="flex items-center gap-[7px] mb-3">
                              <Stars rating={rec.avg_rating} size={10} />
                              <span className="text-[10px] text-white" style={{ fontFamily: "'Jost', sans-serif" }}>{rec.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-[10px]">
                            <span className="text-[18px] font-medium text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>
                              ₹{parseFloat(String(rec.sell_price)).toFixed(0)}
                            </span>
                            {rpct > 0 && (
                              <span className="text-[13px] text-[#3a3a3d] line-through" style={{ fontFamily: "'Jost', sans-serif" }}>
                                ₹{parseFloat(String(rec.price)).toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-[52px]">
                  <button
                    className="px-14 py-[14px] text-[11px] tracking-[3px] uppercase bg-transparent border border-[rgba(255,255,255,0.1)] text-[#e8e0d0] cursor-pointer transition-all duration-300 hover:border-[rgba(201,168,76,0.5)] hover:text-[#c9a84c]"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    onClick={() => router.push("/ag-classics")}
                  >
                    Explore Full Collection
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════ ORNAMENT ════════ */}
        <div className="text-center py-5 pb-9 text-[rgba(201,168,76,0.12)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, letterSpacing: 16 }}>
          ✦ ✦ ✦
        </div>

      </div>
    </>
  );
}