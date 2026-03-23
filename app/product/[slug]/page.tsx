"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MagneticBtn } from "@/components/motion/Motionutils";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

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
interface Attribute {
  name: string;
  value: string;
}
interface EbookFile {
  id: number;
  file_type: "pdf" | "epub";
  price: number;
  sell_price: number;
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
  ebook_price?: number;
  ebook_sell_price?: number;
  main_image: string;
  description: string;
  stock: number;
  product_type: "ebook" | "physical" | "both";
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  created_at: string;
  authors: Author[];
  gallery: GalleryImage[];
  ebook_files?: EbookFile[];
  attributes: Attribute[];
  subjects?: { id: number; name: string; slug: string }[];
  categories?: { id: number; name: string; slug: string }[];
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
const disc = (price: number, sell: number) =>
  price > 0 ? Math.round(((price - sell) / price) * 100) : 0;

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

  .agc-page, .agc-page *, .agc-page *::before, .agc-page *::after {
    box-sizing: border-box;
  }

  @keyframes agcFadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes agcScaleIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes agcShimmer { from{left:-60%} to{left:140%} }
  @keyframes agcPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0)} 50%{box-shadow:0 0 0 10px rgba(201,168,76,0.13)} }
  @keyframes agcSpin    { to{transform:rotate(360deg)} }
  @keyframes agcSk      { from{background-position:-200% 0} to{background-position:200% 0} }

  .agc-page .fu0{animation:agcFadeUp 0.6s ease 0.05s both}
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

  /* shimmer on gold CTA */
  .agc-cta-g { position:relative; overflow:hidden; }
  .agc-cta-g::after {
    content:''; position:absolute; top:0;
    width:45%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
  }
  .agc-cta-g:hover:not(:disabled)::after { animation:agcShimmer 0.5s ease; }

  /* rec card zoom */
  .agc-rec:hover .agc-rec-img { transform:scale(1.06); }

  /* input focus */
  .agc-rv-input:focus { border-color:rgba(201,168,76,0.45); outline:none; box-shadow: 0 0 0 2px rgba(201,168,76,0.08); }

  /* description prose */
  .agc-prose p  { margin-bottom:14px; line-height:1.9; }
  .agc-prose ul { padding-left:22px; margin-bottom:14px; }
  .agc-prose li { margin-bottom:8px; line-height:1.75; }
  .agc-prose em { color:#c9a84c; }
  .agc-prose strong { color:#e8e0d0; font-weight:500; }

  /* h2 & h3 inside description (dangerouslySetInnerHTML content) */
  .agc-prose h2 {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #c9a84c;
    font-weight: 500;
    margin-top: 28px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(201,168,76,0.15);
  }
  .agc-prose h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-style: italic;
    font-weight: 400;
    color: #f5f0e8;
    margin-top: 22px;
    margin-bottom: 10px;
    line-height: 1.3;
  }
  .agc-prose h2:first-child,
  .agc-prose h3:first-child { margin-top: 0; }

  .agc-spin { animation:agcSpin 0.7s linear infinite; }
  .agc-pulse { animation:agcPulse 0.6s ease; }

  /* thumbnail strip scrollbar */
  .agc-thumb-strip { scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .agc-thumb-strip::-webkit-scrollbar { display:none; }

  /* share dropdown */
  .agc-share-btn:hover { background: rgba(201,168,76,0.12) !important; }
`;

/* ─────────────────────────────────────────────
   STARS
───────────────────────────────────────────── */
function Stars({
  rating,
  size = 14,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = (interactive ? hover || rating : rating) >= s;
        const partial = !filled && rating > s - 1 && !interactive;
        const fillPct = partial ? Math.round((rating - (s - 1)) * 100) : 0;
        return (
          <span key={s} className="relative inline-block" style={{ width: size, height: size }}>
            {/* background star */}
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="absolute inset-0 opacity-30">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {/* filled star */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? "100%" : `${fillPct}%` }}
            >
              <svg
                width={size} height={size} viewBox="0 0 24 24"
                fill="#c9a84c" stroke="#c9a84c" strokeWidth="1.5"
                className={`transition-all duration-150 ${interactive ? "cursor-pointer" : ""}`}
                onMouseEnter={() => interactive && setHover(s)}
                onMouseLeave={() => interactive && setHover(0)}
                onClick={() => interactive && onRate?.(s)}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            {interactive && (
              <svg
                width={size} height={size} viewBox="0 0 24 24"
                fill="transparent" stroke="transparent" strokeWidth="1.5"
                className="absolute inset-0 cursor-pointer"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => onRate?.(s)}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────── */
function Lightbox({
  images,
  active,
  onClose,
  onChange,
}: {
  images: string[];
  active: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange(Math.min(active + 1, images.length - 1));
      if (e.key === "ArrowLeft") onChange(Math.max(active - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, images.length, onClose, onChange]);

  const btnCls =
    "flex items-center justify-center w-11 h-11 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] cursor-pointer text-xl transition-colors hover:bg-[rgba(201,168,76,0.2)]";

  return (
    <div onClick={onClose} className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
      <button onClick={onClose} className={`${btnCls} absolute top-6 right-6`}>✕</button>
      {active > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange(active - 1); }}
          className={`${btnCls} absolute left-6 top-1/2 -translate-y-1/2`}
        >‹</button>
      )}
      <img
        src={`${API_URL}${images[active]}`}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-[85vw] max-h-[85vh] object-contain"
      />
      {active < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange(active + 1); }}
          className={`${btnCls} absolute right-6 top-1/2 -translate-y-1/2`}
        >›</button>
      )}
      <div className="absolute bottom-6 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onChange(i); }}
            className="h-[6px] border-none cursor-pointer transition-all duration-300"
            style={{
              width: i === active ? 24 : 6,
              background: i === active ? "#c9a84c" : "rgba(201,168,76,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARE BUTTON  (dark theme)
───────────────────────────────────────────── */
function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const url = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  const shareLinks = [
    {
      label: "WhatsApp",
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "X (Twitter)",
      color: "#1a1a1a",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(201,168,76,0.2)] bg-[rgba(12,12,14,0.8)] text-[#c9a84c] cursor-pointer transition-all hover:border-[#c9a84c] hover:bg-[rgba(201,168,76,0.1)]"
        aria-label="Share"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-11 right-0 bg-[#111113] border border-[rgba(201,168,76,0.15)] rounded w-52 z-50 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,76,0.08)]">
            <span className="text-[8px] tracking-[3px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>Share</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-[#c9a84c] cursor-pointer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="p-2">
            {shareLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="agc-share-btn flex items-center gap-3 px-3 py-2.5 rounded transition-colors"
                style={{ background: "transparent" }}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: s.color }}>
                  {s.icon}
                </span>
                <span className="text-[12px] text-[#8a8a8e]" style={{ fontFamily: "'Jost', sans-serif" }}>{s.label}</span>
              </a>
            ))}
            <button
              onClick={copyLink}
              className="agc-share-btn w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors cursor-pointer"
              style={{ background: "transparent" }}
            >
              <span className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center flex-shrink-0">
                {copied
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a8e" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                }
              </span>
              <span className="text-[12px] text-[#8a8a8e]" style={{ fontFamily: "'Jost', sans-serif" }}>
                {copied ? "Copied!" : "Copy link"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="agc-page max-w-6xl mx-auto px-6 pt-[130px] pb-20">
      <style>{PAGE_STYLES}</style>
      <div className="agc-sk h-8 w-64 mb-8 rounded" />
      <div className="grid grid-cols-2 gap-14 max-md:grid-cols-1">
        <div className="agc-sk aspect-[3/4] w-full rounded" />
        <div className="pt-8 flex flex-col gap-5">
          {[280, 160, 120, 56, 80, 200].map((w, i) => (
            <div key={i} className="agc-sk rounded" style={{ height: i === 0 ? 44 : 16, width: w, maxWidth: "100%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADING
───────────────────────────────────────────── */
function SectionHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <div className="h-px w-10" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.6))" }} />
      <h2 className="text-base tracking-[5px] uppercase text-[#c9a84c] whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
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
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  /* data */
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* gallery */
  const [activeImg, setActiveImg] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<number | null>(null);

  /* touch / swipe */
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const mobileThumbnailRef = useRef<HTMLDivElement>(null);

  /* product options */
  const [format, setFormat] = useState<"paperback" | "ebook">("paperback");
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [stockWarning, setStockWarning] = useState(false);

  /* description / author expansion */
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [expandedAuthors, setExpandedAuthors] = useState<Record<number, boolean>>({});

  /* reviews */
  const [rvRating, setRvRating] = useState(0);
  const [rvName, setRvName] = useState("");
  const [rvComment, setRvComment] = useState("");
  const [rvSubmitting, setRvSubmitting] = useState(false);
  const [rvSubmitted, setRvSubmitted] = useState(false);
  const [rvError, setRvError] = useState("");
  const [rvPage, setRvPage] = useState(0);
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

        // Fallback: derive flat ebook pricing from ebook_files when backend
        // does not yet return ebook_price / ebook_sell_price directly.
        if (p.ebook_files && p.ebook_files.length > 0) {
          const validFiles = p.ebook_files.filter(
            (f: any) => f.price != null && f.sell_price != null
          );
          if (validFiles.length > 0) {
            if (p.ebook_price == null)
              p.ebook_price = Math.min(...validFiles.map((f: any) => Number(f.price)));
            if (p.ebook_sell_price == null)
              p.ebook_sell_price = Math.min(...validFiles.map((f: any) => Number(f.sell_price)));
          }
        }
        setProduct(p);
        if (p.product_type === "ebook") setFormat("ebook");

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
            setRecommended(
              (d.products as RecommendedProduct[]).filter((r) => r.slug !== slug).slice(0, 4)
            );
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, router]);

  /* ── derive allImages once product loads ── */
  const allImages = product
    ? [product.main_image, ...product.gallery.map((g) => g.image_path)].filter(Boolean)
    : [];

  /* ── auto-cycle ── */
  useEffect(() => {
    if (!product || allImages.length <= 1) return;
    const VISIBLE = 5;
    const id = setInterval(() => {
      setActiveImg((prev) => {
        const next = prev >= allImages.length - 1 ? 0 : prev + 1;
        setGalleryIndex((gi) => {
          if (next >= gi + VISIBLE) return next - VISIBLE + 1;
          if (next < gi) return next;
          return gi;
        });
        scrollMobileStrip(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [product, allImages.length]);

  /* ── wishlist check ── */
  useEffect(() => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/wishlist/check/${product.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setWishlisted(d.liked))
      .catch(() => {});
  }, [product]);

  const scrollMobileStrip = (index: number) => {
    if (!mobileThumbnailRef.current) return;
    const THUMB_W = 56 + 8;
    mobileThumbnailRef.current.scrollTo({ left: Math.max(0, index * THUMB_W - THUMB_W), behavior: "smooth" });
  };

  const jumpToImage = (index: number) => {
    setActiveImg(index);
    setGalleryIndex(Math.max(0, index - 4));
    scrollMobileStrip(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.changedTouches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) jumpToImage(activeImg < allImages.length - 1 ? activeImg + 1 : 0);
    else jumpToImage(activeImg > 0 ? activeImg - 1 : allImages.length - 1);
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) { window.dispatchEvent(new Event("open-account-slider")); return; }
    await fetch(`${API_URL}/api/wishlist/${product?.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setWishlisted(!wishlisted);
  };

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) { window.dispatchEvent(new Event("open-account-slider")); return; }
    try {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: product!.id,
          format: format === "ebook" ? "ebook" : "paperback",
          quantity: format === "ebook" ? 1 : qty,
        }),
      });
      if (!res.ok) throw new Error("Add to cart failed");
      window.dispatchEvent(new Event("cart-change"));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    } catch (err) {
      console.error(err);
    }
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

  /* ── guards ── */
  if (loading) return <Skeleton />;
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[#0c0c0e]">
        <style>{PAGE_STYLES}</style>
        <p className="text-[28px] italic text-[#f5f0e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {error || "Product not found"}
        </p>
        <button
          onClick={() => router.push("/ag-classics")}
          className="agc-cta-g px-10 py-3 bg-[#c9a84c] text-[#0c0c0e] text-[11px] tracking-[3px] uppercase cursor-pointer border-none hover:bg-[#e4be54] transition-colors"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Back to Collection
        </button>
      </div>
    );
  }

  /* ── computed ── */
  const paperbackDiscount = disc(product.price, product.sell_price);
  const ebookDiscount =
    product.ebook_price && product.ebook_sell_price
      ? disc(product.ebook_price, product.ebook_sell_price)
      : 0;

  const descWords = product.description?.replace(/<[^>]*>/g, "").split(" ") ?? [];
  const isLongDesc = descWords.length > 200;

  const getShortBio = (text: string, limit = 60) => {
    const words = text.split(" ");
    return words.length <= limit ? text : words.slice(0, limit).join(" ");
  };

  const isOos = product.stock === 0 && format === "paperback";
  const totalRvPages = Math.ceil(reviews.length / RV_PER_PAGE);
  const visibleReviews = reviews.slice(rvPage * RV_PER_PAGE, (rvPage + 1) * RV_PER_PAGE);
  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 };
  });
  const GALLERY_VISIBLE = 5;

  return (
    <>
      <style>{PAGE_STYLES}</style>

      {lightboxImg !== null && (
        <Lightbox
          images={allImages}
          active={lightboxImg}
          onClose={() => setLightboxImg(null)}
          onChange={setLightboxImg}
        />
      )}

      <div
        className="agc-page bg-[#0c0c0e] text-[#e8e0d0] min-h-screen"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {/* ════════ BREADCRUMB ════════ */}
        <nav className="border-t border-b-2 border-[rgba(201,168,76,0.6)] py-3 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 pt-[calc(3rem+80px)] sm:pt-[calc(3rem+100px)]">
          <ol className="flex items-center gap-1.5 flex-wrap max-w-6xl mx-auto">
            <li>
              <Link
                href="/"
                className="text-xs tracking-[2px] uppercase text-white hover:text-[#c9a84c] transition-colors"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Home
              </Link>
            </li>
            {product.categories && product.categories.length > 0 && (
              <>
                <li className="text-white">›</li>
                <li>
                  <Link
                    href={`/category/${product.categories[0].slug}`}
                    className="text-[10px] tracking-[2px] uppercase text-white hover:text-[#ffc011] transition-colors"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    {product.categories[0].name}
                  </Link>
                </li>
              </>
            )}
            <li className="text-white">›</li>
            <li
              className="text-xs tracking-[1px] pt-1 uppercase text-[#ffc011] truncate max-w-[160px] sm:max-w-xl"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {product.title}
            </li>
          </ol>
        </nav>

        {/* ════════ HERO — two-column ════════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

            {/* ── LEFT: Gallery ── */}
            <div className="sc">

              {/* Main image (swipeable on mobile, lightbox on desktop) */}
              <div
                className="relative flex justify-center bg-[#111113] border border-[rgba(201,168,76,0.08)] p-6 sm:p-10 select-none cursor-zoom-in"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setLightboxImg(activeImg)}
              >
                {allImages[activeImg] ? (
                  <img
                    src={`${API_URL}${allImages[activeImg]}`}
                    alt={product.title}
                    className="object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[460px] w-auto pointer-events-none transition-transform duration-700 hover:scale-[1.01]"
                  />
                ) : (
                  <div className="w-full h-[360px] flex items-center justify-center">
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="0.75" className="opacity-30">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                )}

                {/* Discount badge */}
                {paperbackDiscount > 5 && (
                  <div
                    className="absolute top-3 left-3 bg-[#7a2e2e] px-3 py-1 text-[8px] tracking-[2px] uppercase text-[#f5d5d5]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {paperbackDiscount}% Off
                  </div>
                )}

                {/* Low stock badge */}
                {product.stock > 0 && product.stock <= 5 && (
                  <div
                    className="absolute top-3 left-3 px-3 py-1 border border-[rgba(201,168,76,0.3)] bg-[rgba(180,120,0,0.14)] text-[9px] tracking-[2px] uppercase text-[#c9a84c]"
                    style={{ top: paperbackDiscount > 5 ? 46 : 12, fontFamily: "'Jost', sans-serif" }}
                  >
                    Only {product.stock} left
                  </div>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 bg-[rgba(12,12,14,0.75)] border border-[rgba(201,168,76,0.18)] px-2.5 py-1.5 flex items-center gap-1.5 hidden md:flex">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  <span className="text-[7px] tracking-[2px] text-white" style={{ fontFamily: "'Cinzel', serif" }}>ZOOM</span>
                </div>

                {/* Dot indicators — mobile only */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); jumpToImage(i); }}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === activeImg ? 16 : 6,
                          background: i === activeImg ? "#c9a84c" : "rgba(201,168,76,0.25)",
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Wishlist + Share — top right */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(201,168,76,0.2)] bg-[rgba(12,12,14,0.8)] cursor-pointer transition-all hover:border-[#c9a84c] hover:bg-[rgba(201,168,76,0.1)]"
                    aria-label="Wishlist"
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill={wishlisted ? "#c9a84c" : "none"}
                      stroke="#c9a84c" strokeWidth="1.5"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ShareButton title={product.title} />
                  </div>
                </div>
              </div>

              {/* MOBILE: horizontal thumbnail strip */}
              {allImages.length > 1 && (
                <div
                  ref={mobileThumbnailRef}
                  className="agc-thumb-strip mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden"
                >
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => jumpToImage(i)}
                      className="flex-shrink-0 border transition-all duration-200"
                      style={{
                        borderColor: i === activeImg ? "#c9a84c" : "rgba(201,168,76,0.12)",
                        opacity: i === activeImg ? 1 : 0.5,
                      }}
                    >
                      <img
                        src={`${API_URL}${img}`}
                        className="h-16 w-12 object-cover block"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* DESKTOP: thumbnail strip */}
              {allImages.length > 1 && (
                <div className="mt-3 hidden md:flex items-center gap-2">
                  <div className="overflow-hidden flex-1">
                    <div
                      className="flex gap-2 transition-transform duration-300"
                      style={{ transform: `translateX(-${galleryIndex * 74}px)` }}
                    >
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => { setActiveImg(i); setGalleryIndex(Math.max(0, i - 4)); }}
                          className="flex-shrink-0 border p-0.5 transition-all duration-200"
                          style={{
                            borderColor: i === activeImg ? "#c9a84c" : "rgba(201,168,76,0.12)",
                            opacity: i === activeImg ? 1 : 0.45,
                          }}
                        >
                          <img
                            src={`${API_URL}${img}`}
                            className="h-20 w-[60px] object-cover block cursor-pointer"
                            alt=""
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Arrows if more than GALLERY_VISIBLE images */}
                  {allImages.length > GALLERY_VISIBLE && (
                    <div className="flex flex-col gap-1 ml-1">
                      <button
                        onClick={() => setGalleryIndex((g) => Math.max(0, g - 1))}
                        disabled={galleryIndex === 0}
                        className="w-7 h-7 flex items-center justify-center border border-[rgba(201,168,76,0.2)] text-[#c9a84c] text-sm cursor-pointer disabled:opacity-25 hover:bg-[rgba(201,168,76,0.08)] transition-colors"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setGalleryIndex((g) => Math.min(allImages.length - GALLERY_VISIBLE, g + 1))}
                        disabled={galleryIndex >= allImages.length - GALLERY_VISIBLE}
                        className="w-7 h-7 flex items-center justify-center border border-[rgba(201,168,76,0.2)] text-[#c9a84c] text-sm cursor-pointer disabled:opacity-25 hover:bg-[rgba(201,168,76,0.08)] transition-colors"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: Info ── */}
            <div className="flex flex-col">

              {/* Eyebrow */}
              <div className="fu0 flex items-center gap-3 mb-4">
                <div className="w-7 h-px bg-[#8a6f2e]" />
                <span className="text-[8px] tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>AG Classics</span>
              </div>

              {/* Title */}
              <h1
                className="fu1 font-light leading-[1.1] text-[#f5f0e8] mb-3 italic text-4xl"
                style={{ fontFamily: "'Cormorant Garamond', serif"}}
              >
                {product.title}
              </h1>

              {/* Authors */}
              {product.authors.length > 0 && (
                <div className="fu2 flex flex-wrap items-center gap-1.5 mb-4">
                  <span className="text-[11px] text-white">by</span>
                  {product.authors.map((a, i) => (
                    <span key={a.id}>
                      <Link
                        href={`/author/${a.slug}`}
                        className="text-lg italic text-[#ffb300] hover:text-[#c9a84c] transition-colors cursor-pointer"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {a.name}
                      </Link>
                      {i < product.authors.length - 1 && <span className="text-white ml-1">&amp;</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Stars */}
              <div
                className="fu2 flex items-center gap-2 mb-5 cursor-pointer"
                onClick={() => reviewRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                <Stars rating={product.avg_rating ?? 0} size={13} />
                {product.review_count > 0 ? (
                  <span className="text-xs text-[#8a6f2e]" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {(product.avg_rating ?? 0).toFixed(1)} · {product.review_count} {product.review_count === 1 ? "review" : "reviews"}
                  </span>
                ) : (
                  <span className="text-xs text-white" style={{ fontFamily: "'Jost', sans-serif" }}>No reviews yet</span>
                )}
              </div>

              {/* Ornament divider */}
              <div className="fu2 flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[rgba(201,168,76,0.6)]" />
                <div className="w-1 h-1 bg-[rgba(201,168,76,0.6)] rotate-45" />
                <div className="flex-1 h-px bg-[rgba(201,168,76,0.6)]" />
              </div>

              {/* ── PRICE ── */}
              <div className="fu3 mb-5 space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className="text-[32px] font-medium text-[#c9a84c] tracking-tight"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    ₹{format === "paperback"
                      ? parseFloat(String(product.sell_price)).toFixed(0)
                      : parseFloat(String(product.ebook_sell_price ?? 0)).toFixed(0)}
                  </span>
                  {format === "paperback" && paperbackDiscount > 0 && (
                    <span className="text-lg text-white line-through" style={{ fontFamily: "'Jost', sans-serif" }}>
                      ₹{parseFloat(String(product.price)).toFixed(0)}
                    </span>
                  )}
                  {format === "ebook" && ebookDiscount > 0 && (
                    <span className="text-lg text-white line-through" style={{ fontFamily: "'Jost', sans-serif" }}>
                      ₹{parseFloat(String(product.ebook_price ?? 0)).toFixed(0)}
                    </span>
                  )}
                  {(format === "paperback" ? paperbackDiscount : ebookDiscount) > 0 && (
                    <span
                      className="text-[8px] tracking-[2px] px-2.5 py-1 bg-[rgba(122,46,46,0.22)] text-[#c97070] border border-[rgba(201,100,100,0.18)]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      SAVE {format === "paperback" ? paperbackDiscount : ebookDiscount}%
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-white" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {format === "paperback"
                    ? "Order now · delivered in 6–7 business days"
                    : "Buy now · eBook available instantly in My Books"}
                </p>

                {/* Format selector */}
                {product.product_type === "both" && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button
                      onClick={() => setFormat("paperback")}
                      className="border px-4 py-2.5 w-36 text-left cursor-pointer transition-all duration-300"
                      style={{
                        borderColor: format === "paperback" ? "#c9a84c" : "rgba(255,255,255,0.08)",
                        background: format === "paperback" ? "rgba(201,168,76,0.07)" : "transparent",
                      }}
                    >
                      <p className="text-[9px] tracking-[2px] uppercase text-white" style={{ fontFamily: "'Cinzel', serif" }}>Paperback</p>
                      <p className="font-medium text-[15px] text-[#c9a84c] mt-0.5" style={{ fontFamily: "'Jost', sans-serif" }}>
                        ₹{parseFloat(String(product.sell_price)).toFixed(0)}
                      </p>
                    </button>
                    <button
                      onClick={() => setFormat("ebook")}
                      className="border px-4 py-2.5 w-36 text-left cursor-pointer transition-all duration-300"
                      style={{
                        borderColor: format === "ebook" ? "#c9a84c" : "rgba(255,255,255,0.08)",
                        background: format === "ebook" ? "rgba(201,168,76,0.07)" : "transparent",
                      }}
                    >
                      <p className="text-[9px] tracking-[2px] uppercase text-white" style={{ fontFamily: "'Cinzel', serif" }}>eBook</p>
                      <p className="font-medium text-[15px] text-[#c9a84c] mt-0.5" style={{ fontFamily: "'Jost', sans-serif" }}>
                        ₹{parseFloat(String(product.ebook_sell_price ?? 0)).toFixed(0)}
                      </p>
                    </button>
                  </div>
                )}
                {product.product_type === "ebook" && (
                  <div className="flex gap-2">
                    <div className="border border-[#c9a84c] bg-[rgba(201,168,76,0.07)] px-4 py-2.5 w-36">
                      <p className="text-[9px] tracking-[2px] uppercase text-white" style={{ fontFamily: "'Cinzel', serif" }}>eBook</p>
                      <p className="font-medium text-[15px] text-[#c9a84c] mt-0.5" style={{ fontFamily: "'Jost', sans-serif" }}>
                        ₹{parseFloat(String(product.ebook_sell_price ?? 0)).toFixed(0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── ACTIONS ── */}
              <div className="fu4 flex flex-col gap-4 mb-6">
                {format === "paperback" && isOos && (
                  <p className="text-[11px] text-[#c97070]" style={{ fontFamily: "'Jost', sans-serif" }}>Out of stock</p>
                )}
                {format === "paperback" && stockWarning && !isOos && (
                  <p className="text-[11px] text-[#c97070]" style={{ fontFamily: "'Jost', sans-serif" }}>Only {product.stock} copies available</p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {/* Qty stepper */}
                  {format === "paperback" && !isOos && (
                    <div className="flex items-center border border-[rgba(201,168,76,0.2)]">
                      <button
                        onClick={() => setQty((q) => (q > 1 ? q - 1 : 1))}
                        className="w-9 h-9 flex items-center justify-center text-[#c9a84c] text-lg bg-transparent border-none cursor-pointer transition-colors hover:bg-[rgba(201,168,76,0.08)]"
                      >−</button>
                      <span
                        className="w-10 text-center text-[14px] text-[#f5f0e8]"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >{qty}</span>
                      <button
                        onClick={() => {
                          if (product.stock && qty >= product.stock) { setStockWarning(true); return; }
                          setQty((q) => q + 1); setStockWarning(false);
                        }}
                        className="w-9 h-9 flex items-center justify-center text-[#c9a84c] text-lg bg-transparent border-none cursor-pointer transition-colors hover:bg-[rgba(201,168,76,0.08)]"
                      >+</button>
                    </div>
                  )}

                  {/* Add to Cart */}
                  <button
                    className={`agc-cta-g flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 text-[11px] tracking-[3px] uppercase border-none cursor-pointer transition-colors duration-300 ${
                      isOos
                        ? "bg-[#1e1e20] text-white cursor-not-allowed"
                        : addedToCart
                        ? "bg-[rgba(201,168,76,0.12)] text-[#c9a84c] border border-[#c9a84c] agc-pulse"
                        : "bg-[#c9a84c] text-[#0c0c0e] hover:bg-[#e4be54]"
                    }`}
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    disabled={isOos}
                    onClick={addToCart}
                  >
                    {addedToCart ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={toggleWishlist}
                    className="w-11 h-11 flex items-center justify-center border cursor-pointer transition-all duration-300"
                    style={{
                      borderColor: wishlisted ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)",
                      background: wishlisted ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)",
                      color: wishlisted ? "#c9a84c" : "#e8e0d0",
                    }}
                    aria-label="Wishlist"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#c9a84c" : "none"} stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Trust strip */}
                <div className="grid grid-cols-3 gap-2 pt-5 border-t-2 border-[rgba(201,168,76,0.6)] ">
                  {[
                    {
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.3">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      ),
                      title: "Premium Quality",
                      sub: "Fine paper & binding",
                    },
                    {
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.3">
                          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      ),
                      title: "Fast Shipping",
                      sub: "Dispatched in 4–7days",
                    },
                    {
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.3">
                          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      ),
                      title: "Best Price",
                      sub: "Direct from publisher",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-1.5 py-3">
                      <div className="opacity-80">{item.icon}</div>
                      <p className="text-sm tracking-[1px] uppercase text-[#8a8a8e] leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                        {item.title}
                      </p>
                      <p className="text-xs text-white hidden sm:block" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ISBN / SKU */}
              {(product.isbn || product.sku) && (
                <div className="fu5 flex gap-5 mt-1">
                  {product.isbn && (
                    <span className="text-xs text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>
                      ISBN: <span className="text-white">{product.isbn}</span>
                    </span>
                  )}
                  {product.sku && (
                    <span className="text-xs text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>
                      SKU: <span className="text-white">{product.sku}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════ DESCRIPTION ════════ */}
        <div className="border-y-2 border-[rgba(201,168,76,0.6)] py-10 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[2px] h-8" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
              <h2 className="text-base tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>About This Book</h2>
            </div>
            <div
              className="agc-prose font-light text-white leading-[1.9] text-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif"}}
              dangerouslySetInnerHTML={{
                __html: showFullDesc || !isLongDesc
                  ? product.description ?? ""
                  : descWords.slice(0, 200).join(" ") + "...",
              }}
            />
            {isLongDesc && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-3 text-[11px] tracking-[2px] uppercase text-[#c9a84c] hover:text-[#e4be54] transition-colors cursor-pointer border-none bg-transparent"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {showFullDesc ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
        </div>

        {/* ════════ ATTRIBUTES + SUBJECTS + SHIPPING ════════ */}
        {(product.attributes?.length > 0 || product.subjects?.length || product.weight || product.length) && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10">

            {/* Attributes */}
            {product.attributes?.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-[2px] h-8" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
                  <h2 className="text-base tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>Book Details</h2>
                </div>
                <div className="mb-8">
                  {product.attributes.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-4 py-3 border-b border-[rgba(201,168,76,0.6)]"
                    >
                      <span className="text-sm tracking-[2px] uppercase text-white shrink-0" style={{ fontFamily: "'Cinzel', serif" }}>
                        {a.name}
                      </span>
                      <span className="text-sm text-[#8a8a8e] text-right" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {a.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Subjects */}
            {product.subjects && product.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-[9px] tracking-[2px] uppercase text-white self-center" style={{ fontFamily: "'Cinzel', serif" }}>Subjects:</span>
                {product.subjects.map((s) => (
                  <span
                    key={s.id}
                    className="text-[11px] px-3 py-1 border border-[rgba(201,168,76,0.15)] text-[#8a6f2e]"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}

            {/* Shipping */}
            {(product.weight || product.length) && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-[2px] h-8" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
                  <h2 className="text-base tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>Shipping Details</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {product.weight && (
                    <div>
                      <p className="text-[9px] tracking-[2px] uppercase text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Weight</p>
                      <p className="text-[13px] text-[#8a8a8e]" style={{ fontFamily: "'Jost', sans-serif" }}>{product.weight} kg</p>
                    </div>
                  )}
                  {product.length && (
                    <div>
                      <p className="text-[9px] tracking-[2px] uppercase text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Length</p>
                      <p className="text-[13px] text-[#8a8a8e]" style={{ fontFamily: "'Jost', sans-serif" }}>{product.length} cm</p>
                    </div>
                  )}
                  {product.width && (
                    <div>
                      <p className="text-[9px] tracking-[2px] uppercase text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Width</p>
                      <p className="text-[13px] text-[#8a8a8e]" style={{ fontFamily: "'Jost', sans-serif" }}>{product.width} cm</p>
                    </div>
                  )}
                  {product.height && (
                    <div>
                      <p className="text-[9px] tracking-[2px] uppercase text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Height</p>
                      <p className="text-[13px] text-[#8a8a8e]" style={{ fontFamily: "'Jost', sans-serif" }}>{product.height} cm</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════ AUTHORS ════════ */}
        {product.authors.length > 0 && (
          <>
            <div className="h-px bg-[rgba(201,168,76,0.6)]" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10">
              <SectionHeading>About the Author</SectionHeading>
              <div className="space-y-4">
                {product.authors.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-4 sm:gap-6 bg-[#111113] border border-[rgba(201,168,76,0.09)] p-5 sm:p-7 transition-colors duration-300 hover:border-[rgba(201,168,76,0.22)]"
                  >
                    <div className="flex-shrink-0">
                      <Link href={`/author/${a.slug}`}>
                        {a.profile_image ? (
                          <img
                            src={`${API_URL}${a.profile_image}`}
                            alt={a.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-[rgba(201,168,76,0.25)] cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border border-[rgba(201,168,76,0.2)] cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ background: "linear-gradient(135deg,rgba(138,111,46,0.18),rgba(201,168,76,0.04))" }}
                          >
                            <span className="text-2xl text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>
                              {a.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/author/${a.slug}`}
                        className="text-[20px] italic text-[#f5f0e8] block mb-1 hover:text-[#c9a84c] transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {a.name}
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-px bg-[rgba(201,168,76,0.3)]" />
                        <span className="text-[7px] tracking-[3px] uppercase text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>Author</span>
                      </div>
                      {a.bio && (
                        <p className="text-[16px] italic text-[#7a7a7e] leading-[1.8] break-words" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {expandedAuthors[a.id]
                            ? a.bio
                            : getShortBio(a.bio) + (a.bio.split(" ").length > 60 ? "..." : "")}
                        </p>
                      )}
                      {a.bio && a.bio.split(" ").length > 60 && (
                        <button
                          onClick={() => setExpandedAuthors((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                          className="mt-2 text-[10px] tracking-[2px] uppercase text-[#c9a84c] hover:text-[#e4be54] transition-colors cursor-pointer border-none bg-transparent"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          {expandedAuthors[a.id] ? "Read less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════ REVIEWS ════════ */}
        <div className="h-px bg-[rgba(201,168,76,0.6)]" />
        <div ref={reviewRef} className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 sm:py-14">
          <SectionHeading>Reader Reviews</SectionHeading>

          {/* Rating overview */}
          {product.avg_rating && reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-10 sm:gap-14 mb-14 items-start">
              <div className="text-center py-9 px-5 bg-[#111113] border border-[rgba(201,168,76,0.1)]">
                <div
                  className="font-light text-[#f5f0e8] leading-none text-[64px] sm:text-[72px]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {product.avg_rating.toFixed(1)}
                </div>
                <div className="flex justify-center my-3">
                  <Stars rating={product.avg_rating} size={14} />
                </div>
                <div className="text-[7px] tracking-[3px] uppercase text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                  {product.review_count} Reviews
                </div>
              </div>
              <div className="pt-2">
                <div className="text-[8px] tracking-[3px] uppercase text-[#8a6f2e] mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
                  Rating Breakdown
                </div>
                {ratingDist.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="w-3 text-[11px] text-white shrink-0" style={{ fontFamily: "'Jost', sans-serif" }}>{star}</span>
                    <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full transition-[width] duration-[1200ms] ease-in-out"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg,#8a6f2e,#c9a84c)" }}
                      />
                    </div>
                    <span className="w-8 text-[10px] text-white text-right" style={{ fontFamily: "'Jost', sans-serif" }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review cards */}
          {reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
                {visibleReviews.map((rv) => (
                  <div
                    key={rv.id}
                    className="bg-[#111113] border border-[rgba(255,255,255,0.05)] p-6 transition-colors duration-300 hover:border-[rgba(201,168,76,0.2)]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-[rgba(201,168,76,0.07)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center shrink-0">
                          <span className="text-[14px] text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>
                            {rv.user_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-[#e8e0d0] mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                            {rv.user_name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Stars rating={rv.rating} size={11} />
                            <span className="text-[10px] text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>{rv.rating}.0</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-white whitespace-nowrap" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {new Date(rv.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div className="h-px bg-[rgba(255,255,255,0.04)] mb-4" />

                    <p className="text-[16px] italic text-[#7a7a7e] leading-[1.78]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      "{rv.comment}"
                    </p>

                    {rv.images.length > 0 && (
                      <div className="flex gap-1.5 mt-4">
                        {rv.images.map((img, i) => (
                          <img
                            key={i}
                            src={`${API_URL}${img}`}
                            alt=""
                            className="w-12 h-12 object-cover border border-[rgba(201,168,76,0.15)] cursor-pointer"
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span className="text-[7px] tracking-[2px] uppercase text-[#8a6f2e]" style={{ fontFamily: "'Cinzel', serif" }}>
                        Verified Purchase
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalRvPages > 1 && (
                <div className="flex justify-center gap-2 mb-12">
                  <button
                    disabled={rvPage === 0}
                    onClick={() => setRvPage(Math.max(0, rvPage - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.08)] text-white cursor-pointer transition-all disabled:opacity-30 hover:border-[rgba(201,168,76,0.3)]"
                  >‹</button>
                  {Array.from({ length: totalRvPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRvPage(i)}
                      className="w-10 h-10 text-[12px] cursor-pointer transition-all duration-300 border"
                      style={{
                        background: i === rvPage ? "rgba(201,168,76,0.1)" : "transparent",
                        borderColor: i === rvPage ? "#c9a84c" : "rgba(255,255,255,0.08)",
                        color: i === rvPage ? "#c9a84c" : "#e8e0d0",
                        fontFamily: "'Jost', sans-serif",
                      }}
                    >{i + 1}</button>
                  ))}
                  <button
                    disabled={rvPage >= totalRvPages - 1}
                    onClick={() => setRvPage(Math.min(totalRvPages - 1, rvPage + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.08)] text-white cursor-pointer transition-all disabled:opacity-30 hover:border-[rgba(201,168,76,0.3)]"
                  >›</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 mb-12">
              <p className="text-xl italic text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                No reviews yet. Be the first to share your thoughts.
              </p>
            </div>
          )}

          {/* Write a Review */}
          <div className="bg-[#111113] border border-[rgba(201,168,76,0.09)] p-7 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-[2px] h-7" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
              <h3 className="text-[9px] tracking-[5px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>Write a Review</h3>
            </div>

            {rvSubmitted ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center mx-auto mb-5">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-2xl italic text-[#f5f0e8] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Thank you for your review
                </p>
                <p className="text-[11px] text-white" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Your review will appear after moderation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Left */}
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[8px] tracking-[3px] uppercase text-white mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-4">
                      <Stars rating={rvRating} size={26} interactive onRate={setRvRating} />
                      {rvRating > 0 && (
                        <span className="text-base italic text-[#8a6f2e]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {(["", "Poor", "Fair", "Good", "Very Good", "Excellent"] as const)[rvRating]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] tracking-[3px] uppercase text-white mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      className="agc-rv-input w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.09)] text-[#e8e0d0] text-[13px] outline-none transition-all duration-300"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      value={rvName}
                      onChange={(e) => setRvName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col gap-6">
                  <div className="flex-1">
                    <label className="block text-[8px] tracking-[3px] uppercase text-white mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                      Your Review *
                    </label>
                    <textarea
                      className="agc-rv-input w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.09)] text-[#e8e0d0] text-[13px] outline-none transition-all duration-300 resize-y"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      rows={5}
                      value={rvComment}
                      onChange={(e) => setRvComment(e.target.value)}
                      placeholder="Share your thoughts about this book..."
                    />
                  </div>
                  {rvError && <p className="text-[11px] text-[#c97070]" style={{ fontFamily: "'Jost', sans-serif" }}>{rvError}</p>}
                  <button
                    className={`agc-cta-g self-start flex items-center gap-2.5 px-9 py-3.5 text-[11px] tracking-[3px] uppercase bg-[#c9a84c] text-[#0c0c0e] border-none cursor-pointer transition-colors hover:bg-[#e4be54] disabled:bg-[#252528] disabled:text-white disabled:cursor-not-allowed ${(!rvRating || !rvName.trim() || !rvComment.trim()) ? "opacity-50" : ""}`}
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    onClick={handleReviewSubmit}
                    disabled={rvSubmitting || !rvRating || !rvName.trim() || !rvComment.trim()}
                  >
                    {rvSubmitting && (
                      <span className="agc-spin block w-3.5 h-3.5 border-2 border-[rgba(12,12,14,0.3)] border-t-[#0c0c0e] rounded-full" />
                    )}
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
            <div className="h-px bg-[rgba(201,168,76,0.6)]" />
            <div className="bg-[#0e0e10] py-12 sm:py-16 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 pb-20">
              <div className="max-w-6xl mx-auto">
                <SectionHeading>You May Also Like</SectionHeading>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommended.map((rec) => {
                    const rpct = disc(rec.price, rec.sell_price);
                    return (
                      <div
                        key={rec.id}
                        className="agc-rec bg-[#111113] border border-[rgba(255,255,255,0.05)] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[rgba(201,168,76,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        onClick={() => router.push(`/ag-classics/${rec.slug}`)}
                      >
                        <div className="aspect-[3/4] overflow-hidden relative">
                          {rec.main_image ? (
                            <img
                              src={`${API_URL}${rec.main_image}`}
                              alt={rec.title}
                              className="agc-rec-img w-full h-full object-cover block transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e1e20,#141416)" }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="0.75" className="opacity-30">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                              </svg>
                            </div>
                          )}
                          {rpct > 5 && (
                            <div className="absolute top-2 left-2 bg-[#7a2e2e] px-2 py-0.5 text-[7px] tracking-[2px] text-[#f5d5d5]" style={{ fontFamily: "'Cinzel', serif" }}>
                              {rpct}% Off
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          {rec.authors.length > 0 && (
                            <div className="text-[9px] tracking-[2px] uppercase text-[#8a6f2e] mb-1.5" style={{ fontFamily: "'Jost', sans-serif" }}>
                              {rec.authors.map((a) => a.name).join(", ")}
                            </div>
                          )}
                          <div className="text-[16px] italic text-[#f5f0e8] leading-[1.2] mb-2.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {rec.title}
                          </div>
                          {rec.avg_rating && (
                            <div className="flex items-center gap-1.5 mb-3">
                              <Stars rating={rec.avg_rating} size={10} />
                              <span className="text-[10px] text-white" style={{ fontFamily: "'Jost', sans-serif" }}>{rec.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-2">
                            <span className="text-[16px] font-medium text-[#c9a84c]" style={{ fontFamily: "'Jost', sans-serif" }}>
                              ₹{parseFloat(String(rec.sell_price)).toFixed(0)}
                            </span>
                            {rpct > 0 && (
                              <span className="text-[12px] text-white line-through" style={{ fontFamily: "'Jost', sans-serif" }}>
                                ₹{parseFloat(String(rec.price)).toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-12">
                  <button
                    className="px-12 py-3.5 text-[11px] tracking-[3px] uppercase bg-transparent border border-[rgba(255,255,255,0.1)] text-[#e8e0d0] cursor-pointer transition-all duration-300 hover:border-[rgba(201,168,76,0.5)] hover:text-[#c9a84c]"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    onClick={() => router.push("/category/business-professional-skills")}
                  >
                    Explore Full Collection
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════ ORNAMENT ════════ */}
        <div
          className="text-center py-6 pb-10 text-[rgba(201,168,76,0.12)]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, letterSpacing: 16 }}
        >
          ✦ ✦ ✦
        </div>
      </div>
    </>
  );
}