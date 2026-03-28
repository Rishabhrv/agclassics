"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Library, Search, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type User = { id: number; name: string; email: string };
type SearchResult = { id: number; title: string; slug: string; main_image: string };

/* Only keep things Tailwind genuinely can't do */
const minimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes libFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .lib-dropdown-anim { animation: libFadeIn 0.2s ease both; }

    .lib-search-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.18);
    border-radius: 2px;
    padding: 9px 16px 9px 40px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: #e8e0d0;
    outline: none;
    transition: border-color 0.3s, background 0.3s;
  }
  .lib-search-input::placeholder { color: #6b6b70; }
  .lib-search-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(255,255,255,0.06);
  }

  .lib-search-book img { transition: transform 0.4s ease, filter 0.4s ease; }
  .lib-search-book:hover img {
    transform: scale(1.04);
    filter: brightness(0.75) saturate(0.7);
  }

  .lib-corner-tl { border-top: 1px solid #c9a84c; border-left: 1px solid #c9a84c; }
  .lib-corner-tr { border-top: 1px solid #c9a84c; border-right: 1px solid #c9a84c; }
  .lib-corner-bl { border-bottom: 1px solid #c9a84c; border-left: 1px solid #c9a84c; }
  .lib-corner-br { border-bottom: 1px solid #c9a84c; border-right: 1px solid #c9a84c; }
`;

export default function LibraryHeader() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);



  /* FETCH USER */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetch(`${API_URL}/api/mylibrary/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then(setUser).catch(() => {});
  }, []);

  /* CHECK SUBSCRIPTION */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetch(`${API_URL}/api/mylibrary/check-access`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => { if (!d.access) setBlocked(true); });
  }, []);

  /* COUNTDOWN */
  useEffect(() => {
    if (!blocked) return;
    if (countdown === 0) { window.location.href = "/subscriptions"; return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [blocked, countdown]);

  /* LIVE SEARCH */
  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDropdown(false); return; }
    const token = localStorage.getItem("token");
    if (!token) return;
    const delay = setTimeout(() => {
      setLoadingSearch(true);
      fetch(`${API_URL}/api/mylibrary/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()).then((data) => {
        setResults(data);
        setShowDropdown(true);
      }).finally(() => setLoadingSearch(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  /* OUTSIDE CLICK */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const clearSearch = () => { setQuery(""); setResults([]); setShowDropdown(false); };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "My Library - AG Classics",
    "description": "A personalized digital library for readers to manage their book collections.",
  };

  return (
    <>
    <Head>
        <title>My Library | AG Classics</title>
        <meta name="description" content="Access your personal collection of classic literature and curated reading lists." />
        <meta name="robots" content="noindex, follow" />
        {/* Inject Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <style>{minimalStyles}</style>

      {/* ── HEADER ── */}
      <header className="bg-[#0f0f10] border-b border-[rgba(201,168,76,0.12)] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Main row */}
          <div className="flex items-center justify-between gap-3 sm:gap-6 h-16">

            {/* LOGO */}
            <Link
              href="/library/MyLibrary"
              className="flex items-center gap-2 sm:gap-3 shrink-0 transition-colors duration-300 group"
            >
              <Library size={18} color="#c9a84c" strokeWidth={1.5} />
              <span
                className="text-[13px] tracking-[3px] uppercase text-[#c9a84c] group-hover:text-[#f5f0e8] transition-colors duration-300  xs:block"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                My Library
              </span>
            </Link>

            {/* SEARCH — desktop (always visible sm+) */}
            <div
              ref={wrapperRef}
              className="relative flex-1 max-w-lg hidden sm:block"
              onClick={(e) => e.stopPropagation()}
            >
              <Search
                size={15}
                className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#6b6b70]"
              />
              <input
                type="text"
                placeholder="Search books…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length && setShowDropdown(true)}
                className="lib-search-input w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.18)] rounded-[2px] py-[9px] pl-10 pr-10 text-[13px] text-[#e8e0d0] outline-none transition-all duration-300 focus:border-[rgba(201,168,76,0.5)] focus:bg-[rgba(255,255,255,0.06)]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6b6b70] bg-transparent border-none cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}

              {/* DROPDOWN */}
              {showDropdown && (
                <div className="lib-dropdown-anim absolute left-0 right-0 top-[calc(100%+8px)] bg-[#1a1a1c] border border-[rgba(201,168,76,0.15)] rounded-[2px] z-50 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                  <SearchDropdownContent
                    loading={loadingSearch}
                    results={results}
                    onSelect={() => { setShowDropdown(false); setQuery(""); }}
                  />
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto sm:ml-0">
              {/* Mobile search toggle */}
              <button
                className="sm:hidden text-[#6b6b70] hover:text-[#c9a84c] transition-colors"
                onClick={() => setMobileSearchOpen((v) => !v)}
                aria-label="Toggle search"
              >
                {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {/* USER */}
              {user && (
                <span
                  className="text-[11px] tracking-[2px] uppercase text-[#6b6b70] whitespace-nowrap hidden sm:block"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Hi, <span className="text-[#c9a84c] font-medium">{user.name}</span>
                </span>
              )}
            </div>
          </div>

          {/* Mobile search row (slides down when open) */}
          {mobileSearchOpen && (
            <div
              ref={wrapperRef}
              className="sm:hidden pb-3 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#6b6b70]"
                />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search books…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => results.length && setShowDropdown(true)}
                  className="lib-search-input w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.18)] rounded-[2px] py-[9px] pl-10 pr-10 text-[13px] text-[#e8e0d0] outline-none transition-all duration-300 focus:border-[rgba(201,168,76,0.5)] focus:bg-[rgba(255,255,255,0.06)]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6b6b70]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {showDropdown && (
                <div className="lib-dropdown-anim absolute left-0 right-0 top-[calc(100%-4px)] bg-[#1a1a1c] border border-[rgba(201,168,76,0.15)] rounded-[2px] z-50 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                  <SearchDropdownContent
                    loading={loadingSearch}
                    results={results}
                    onSelect={() => { setShowDropdown(false); setQuery(""); setMobileSearchOpen(false); }}
                    columns={2}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── BLOCKED OVERLAY ── */}
      {blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)] backdrop-blur-[8px] px-4">
          <div className="relative bg-[#0f0f10] border border-[rgba(201,168,76,0.2)] p-8 sm:p-12 max-w-[440px] w-full text-center">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-5 h-5 lib-corner-tl" />
            <div className="absolute top-0 right-0 w-5 h-5 lib-corner-tr" />
            <div className="absolute bottom-0 left-0 w-5 h-5 lib-corner-bl" />
            <div className="absolute bottom-0 right-0 w-5 h-5 lib-corner-br" />

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <Library size={32} color="#c9a84c" strokeWidth={1} />
            </div>

            <h2
              className="text-[30px] font-light text-[#f5f0e8] mb-3 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Activate Your Subscription
            </h2>

            <p
              className="text-[13px] text-[#6b6b70] leading-[1.7] mb-2"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              You need an active subscription to access{" "}
              <span className="text-[#e8e0d0]">My Library</span>.
            </p>

            <p
              className="text-[12px] text-[#6b6b70] mb-7"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Redirecting in{" "}
              <span className="text-[#c9a84c] font-semibold">{countdown}</span> seconds…
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="flex-1 h-px bg-[rgba(201,168,76,0.15)]" />
              <div className="w-[5px] h-[5px] rotate-45 bg-[#8a6f2e]" />
              <div className="flex-1 h-px bg-[rgba(201,168,76,0.15)]" />
            </div>

            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              <button
                onClick={() => (window.location.href = "/subscriptions")}
                className="text-[11px] tracking-[3px] uppercase font-medium px-7 py-3 bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer hover:bg-[#f5f0e8] transition-colors duration-300"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Choose Plan Now
              </button>
              <button
                onClick={() => router.push("/")}
                className="text-[11px] tracking-[3px] uppercase px-7 py-3 bg-transparent text-[#6b6b70] border border-[rgba(201,168,76,0.2)] cursor-pointer hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all duration-300"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── SEARCH DROPDOWN CONTENT ── */
function SearchDropdownContent({
  loading,
  results,
  onSelect,
  columns = 3,
}: {
  loading: boolean;
  results: SearchResult[];
  onSelect: () => void;
  columns?: number;
}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(201,168,76,0.1)]">
        <span
          className="text-[9px] tracking-[4px] uppercase text-[#c9a84c]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Results
        </span>
        {!loading && (
          <span
            className="text-[11px] text-[#6b6b70]"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            {results.length} found
          </span>
        )}
      </div>

      {loading && (
        <p
          className="text-[13px] text-[#6b6b70]"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Searching…
        </p>
      )}

      {!loading && results.length === 0 && (
        <p
          className="text-[13px] text-[#6b6b70]"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          No results found
        </p>
      )}

      {!loading && results.length > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {results.slice(0, columns === 2 ? 4 : 6).map((book) => (
            <Link
              key={book.id}
              href={`/my-books/${book.slug}`}
              onClick={onSelect}
              className="lib-search-book group text-center"
              style={{ textDecoration: "none" }}
            >
              <div className="relative overflow-hidden rounded-[1px]">
                <img
                  src={book.main_image ? `${API_URL}${book.main_image}` : "/images/placeholder-book.png"}
                  alt={book.title}
                  className="w-full object-cover block"
                />
                <span
                  className="absolute bottom-2 right-2 text-[9px] tracking-[2px] uppercase bg-[#c9a84c] text-[#0a0a0b] px-2 py-1 font-medium"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Read
                </span>
              </div>
              <p
                className="mt-2 line-clamp-2 text-[13px] text-[#e8e0d0] leading-[1.4]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {book.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}