"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: number;
  name: string;
  email: string;
}
interface SearchResults {
  products: { id: number; title: string; slug: string; main_image: string }[];
  authors:  { id: number; name: string; slug: string; profile_image: string }[];
}

/* ── Only keyframes that Tailwind can't express stay here ── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-track { animation: ticker 20s linear infinite; }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .user-drop { animation: dropIn 0.22s ease both; }

  @keyframes searchExpand {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .search-overlay { animation: searchExpand 0.22s ease both; }

  /* Custom scrollbar — no Tailwind equivalent */
  .search-results-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(201,168,76,0.35) rgba(201,168,76,0.04);
  }
  .search-results-scroll::-webkit-scrollbar { width: 4px; }
  .search-results-scroll::-webkit-scrollbar-track {
    background: rgba(201,168,76,0.04);
    border-left: 1px solid rgba(201,168,76,0.08);
  }
  .search-results-scroll::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.35);
    border-radius: 0;
  }
  .search-results-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(201,168,76,0.65);
  }
`;

const NAV_LINKS = [
  { href: "/",                  label: "Home" },
  { href: "/category/business-professional-skills",  label: "Genre" },
  { href: "/ebooks",            label: "E-Books" },
  { href: "/bestseller",        label: "Bestseller" },
  { href: "/subscriptions",      label: "Subscription" },
];

export default function HomeHeader() {
  const pathname = usePathname() || "";

  const [scrolled,       setScrolled]       = useState(false);
  const [menuOpen,       setMenuOpen]        = useState(false);
  const [user,           setUser]            = useState<User | null>(null);
  const [authLoading,    setAuthLoading]     = useState(true);
  const [dropOpen,       setDropOpen]        = useState(false);
  const [cartCount,      setCartCount]       = useState(0);
  const [searchOpen,     setSearchOpen]      = useState(false);
  const [query,          setQuery]           = useState("");
  const [searchResults,  setSearchResults]   = useState<SearchResults>({ products: [], authors: [] });
  const [searchLoading,  setSearchLoading]   = useState(false);

  const dropRef    = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  /* ── Determine if a nav link is "active" ──
     Exact match for "/" to avoid marking every page as Home.
     Prefix match for all other routes.                        */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /* ── Scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Auth ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setAuthLoading(false); return; }
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: User) => setUser(data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Cart count ── */
  const fetchCartCount = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/ag-classics/cart`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (data.success) setCartCount(data.cart.length); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cart-change", fetchCartCount);
    return () => window.removeEventListener("cart-change", fetchCartCount);
  }, [fetchCartCount]);

  /* ── Outside-click: dropdown ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Outside-click: search ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
        setSearchResults({ products: [], authors: [] });
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Auto-focus search input ── */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInput.current?.focus(), 80);
  }, [searchOpen]);

  /* ── Debounced search fetch ── */
  useEffect(() => {
    if (query.trim().length < 2) { setSearchResults({ products: [], authors: [] }); return; }
    setSearchLoading(true);
    const t = setTimeout(() => {
      fetch(`${API_URL}/api/ag-classics/search?q=${encodeURIComponent(query)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setSearchResults(data))
        .catch(() => setSearchResults({ products: [], authors: [] }))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setDropOpen(false);
    window.location.href = "/";
  };

  const highlightMatch = (text: string) => {
    if (!query) return <>{text}</>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return (
      <>
        {text.split(regex).map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <span key={i} className="text-[#c9a84c]">{part}</span>
            : part
        )}
      </>
    );
  };

  const hasResults = searchResults.products.length > 0 || searchResults.authors.length > 0;
  const initials   = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <>
      <style>{globalStyles}</style>

      <header className={[
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        scrolled ? "bg-[rgba(10,10,11,0.92)] backdrop-blur-[16px] border-b border-[rgba(201,168,76,0.15)]" : "",
      ].join(" ")}>

        {/* ── Ticker ── */}
        <div className="overflow-hidden text-center px-4 py-2 text-[11px] font-medium tracking-[2px] uppercase bg-[#c9a84c] text-[#0a0a0b]"
          style={{ fontFamily: "'Jost', sans-serif" }}>
          <span className="ticker-track inline-block whitespace-nowrap">
            ✦ Instant Ebook Access &nbsp;&nbsp;&nbsp; ✦ Read Immediately After Purchase &nbsp;&nbsp;&nbsp; ✦ Read on Mobile, Tablet &amp; Desktop &nbsp;&nbsp;&nbsp; ✦ New Titles Added Every Month &nbsp;&nbsp;&nbsp; ✦ Read Anywhere, Anytime &nbsp;&nbsp;&nbsp; ✦ Exclusive AG Digital Collection &nbsp;&nbsp;&nbsp;
          </span>
        </div>

        {/* ── Main bar ── */}
        <div className={[
          "flex items-center justify-between px-12 max-md:px-6 transition-[padding] duration-[400ms]",
          scrolled ? "py-[14px]" : "py-5",
        ].join(" ")}>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/logo/AGClassicLogo.png" alt="AGPH Store Logo" width={140} height={68} priority />
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-14 ml-10">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <a
                  key={href}
                  href={href}
                  className="relative group text-[12px] tracking-[2px] uppercase font-normal no-underline transition-colors duration-300"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    color: active ? "#c9a84c" : "#ffffff",
                  }}
                >
                  {label}

                  {/* Underline bar:
                      - active page  → always visible, gold
                      - inactive     → hidden, slides in on hover  */}
                  <span
                    className={[
                      "absolute -bottom-[4px] left-0 right-0 h-px bg-[#c9a84c]",
                      "transition-transform duration-300 origin-left",
                      active
                        ? "scale-x-100"                          // always shown
                        : "scale-x-0 group-hover:scale-x-100",  // only on hover
                    ].join(" ")}
                  />

                  {/* Text colour on hover for inactive links */}
                  {!active && (
                    <style>{`
                      a[href="${href}"]:hover { color: #e8e0d0 !important; }
                    `}</style>
                  )}
                </a>
              );
            })}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-5">

            {/* Search — desktop */}
            <div ref={searchRef} className="hidden md:block relative">
              <button
                onClick={() => setSearchOpen(o => !o)}
                className="flex items-center p-1 transition-colors duration-300 border-none bg-transparent cursor-pointer"
                style={{ color: searchOpen ? "#c9a84c" : "#6b6b70" }}
                aria-label="Search"
              >
                {searchOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                )}
              </button>

              {/* Search dropdown */}
              {searchOpen && (
                <div
                  className="search-overlay fixed top-[20%] z-[300] overflow-hidden bg-[#1c1c1e] border border-[rgba(201,168,76,0.15)]"
                  style={{ left: "28%", transform: "translateX(-50%)", width: 650 }}
                >
                  {/* Input row */}
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[rgba(201,168,76,0.1)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="1.5" className="shrink-0">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      ref={searchInput}
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search books, authors…"
                      className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#e8e0d0] tracking-[.5px] placeholder:text-white"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                    {searchLoading && (
                      <span className="shrink-0 w-3 h-3 rounded-full animate-spin border-[1.5px] border-[rgba(201,168,76,0.3)] border-t-[#c9a84c]" />
                    )}
                    {query && !searchLoading && (
                      <button
                        onClick={() => { setQuery(""); setSearchResults({ products: [], authors: [] }); }}
                        className="bg-transparent border-none cursor-pointer text-white p-0 leading-none"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Results */}
                  <div className="search-results-scroll max-h-[380px] overflow-y-auto relative">
                    {query.trim().length < 2 && (
                      <p className="px-4 py-4 text-[11px] text-white tracking-[1px] m-0"
                        style={{ fontFamily: "'Jost', sans-serif" }}>
                        Type at least 2 characters…
                      </p>
                    )}
                    {query.trim().length >= 2 && !hasResults && !searchLoading && (
                      <p className="px-4 py-5 text-[12px] text-white text-center tracking-[1px] m-0"
                        style={{ fontFamily: "'Jost', sans-serif" }}>
                        No results found
                      </p>
                    )}

                    {/* Authors section */}
                    {searchResults.authors.length > 0 && (
                      <div>
                        <p className="px-4 pt-[10px] pb-[6px] text-[9px] tracking-[3px] uppercase text-[#c9a84c] m-0"
                          style={{ fontFamily: "'Jost', sans-serif" }}>Authors</p>
                        {searchResults.authors.map(author => (
                          <a key={author.id} href={`/author/${author.slug}`}
                            className="flex items-center gap-3 px-4 py-[10px] no-underline transition-colors duration-200 hover:bg-[rgba(201,168,76,0.06)] cursor-pointer"
                            onClick={() => { setSearchOpen(false); setQuery(""); }}>
                            {author.profile_image ? (
                              <img src={`${API_URL}${author.profile_image}`} alt={author.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[rgba(201,168,76,0.2)]" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                </svg>
                              </div>
                            )}
                            <span className="text-[12px] text-[#e8e0d0] tracking-[.5px]"
                              style={{ fontFamily: "'Jost', sans-serif" }}>
                              {highlightMatch(author.name)}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Divider between authors and products */}
                    {searchResults.authors.length > 0 && searchResults.products.length > 0 && (
                      <div className="mx-4 my-1 h-px bg-[rgba(201,168,76,0.08)]" />
                    )}

                    {/* Products section */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <p className="px-4 pt-[10px] pb-[6px] text-[9px] tracking-[3px] uppercase text-[#c9a84c] m-0"
                          style={{ fontFamily: "'Jost', sans-serif" }}>Books</p>
                        {searchResults.products.map(product => (
                          <a key={product.id} href={`/product/${product.slug}`}
                            className="flex items-center gap-3 px-4 py-[10px] no-underline transition-colors duration-200 hover:bg-[rgba(201,168,76,0.06)] cursor-pointer"
                            onClick={() => { setSearchOpen(false); setQuery(""); }}>
                            {product.main_image ? (
                              <img src={`${API_URL}${product.main_image}`} alt={product.title}
                                className="w-[62px] h-20 object-cover shrink-0 border border-[rgba(201,168,76,0.15)]" />
                            ) : (
                              <div className="w-8 h-11 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center shrink-0">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1">
                                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                              </div>
                            )}
                            <span
                              className="text-[13px] text-[#e8e0d0] leading-[1.3] line-clamp-2"
                              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                              {highlightMatch(product.title)}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Corner accent */}
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#8a6f2e]" />
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => { window.location.href = "/wishlist"; }}
              className={[
                "flex items-center p-1 transition-colors duration-300 bg-transparent border-none cursor-pointer",
                pathname === "/wishlist" ? "text-[#c9a84c]" : "text-white hover:text-[#c9a84c]",
              ].join(" ")}
              aria-label="Wishlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill={pathname === "/wishlist" ? "#c9a84c" : "none"}
                stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Cart */}
            <button
              onClick={() => { window.location.href = "/cart"; }}
              className={[
                "relative flex items-center p-1 transition-colors duration-300 bg-transparent border-none cursor-pointer",
                pathname === "/cart" ? "text-[#c9a84c]" : "text-white hover:text-[#c9a84c]",
              ].join(" ")}
              aria-label="Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[3px] rounded-full text-[9px] flex items-center justify-center font-semibold bg-[#c9a84c] text-[#0a0a0b]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* ── Auth area — desktop ── */}
            <div className="hidden md:block relative" ref={dropRef}>
              {authLoading && (
                <div className="w-8 h-8 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.2)]" />
              )}

              {!authLoading && !user && (
                <button
                  className="text-[11px] tracking-[2px] uppercase font-medium px-[22px] py-[10px] border-none cursor-pointer
                    transition-all duration-300 hover:-translate-y-px bg-[#c9a84c] text-[#0a0a0b] hover:bg-[#f5f0e8]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                  onClick={() => { window.location.href = "/login"; }}
                >
                  Sign In
                </button>
              )}

              {!authLoading && user && (
                <>
                  <button
                    onClick={() => setDropOpen(o => !o)}
                    className="flex items-center gap-[9px] bg-transparent border-none cursor-pointer p-0"
                    aria-label="Account menu"
                  >
                    <span className="text-[12px] text-[#e8e0d0] max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      {user.name.split(" ")[0]}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="2"
                      className="shrink-0 transition-transform duration-300"
                      style={{ transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  {dropOpen && (
                    <div className="user-drop absolute top-[calc(100%+14px)] right-0 min-w-[220px] bg-[#1c1c1e] border border-[rgba(201,168,76,0.15)] z-[200] overflow-hidden">

                      {/* User info */}
                      <div className="px-4 py-[14px] pb-3 border-b border-[rgba(201,168,76,0.1)]">
                        <p className="text-[16px] italic text-[#f5f0e8] m-0"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}>{user.name}</p>
                        <p className="text-[11px] text-white mt-[3px] mb-0 overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{ fontFamily: "'Jost', sans-serif" }}>{user.email}</p>
                      </div>

                      <div className="py-[6px]">
                        {[
                          { href: "/account",        label: "My Account", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
                          { href: "/orders",         label: "My Orders",  icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
                          { href: "/wishlist",       label: "Wishlist",   icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
                          { href: "/library/MyLibrary", label: "My Library", icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
                          { href: "/my-books", label: "My Books", icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
                        ].map(({ href, label, icon }) => (
                          <a key={href} href={href}
                            className={[
                              "flex items-center gap-[10px] w-full px-4 py-[10px] text-[12px] tracking-[1px]",
                              "no-underline transition-[color,background] duration-200 cursor-pointer whitespace-nowrap",
                              pathname === href
                                ? "text-[#c9a84c] bg-[rgba(201,168,76,0.07)]"
                                : "text-white hover:text-[#e8e0d0] hover:bg-[rgba(201,168,76,0.07)]",
                            ].join(" ")}
                            style={{ fontFamily: "'Jost', sans-serif" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              {icon}
                            </svg>
                            {label}
                          </a>
                        ))}

                        <div className="mx-4 my-[6px] h-px bg-[rgba(201,168,76,0.1)]" />

                        <button
                          className="flex items-center gap-[10px] w-full px-4 py-[10px] text-[12px] tracking-[1px] bg-transparent border-none cursor-pointer text-left whitespace-nowrap
                            text-white hover:text-[#e07070] hover:bg-[rgba(139,58,58,0.1)] transition-[color,background] duration-200"
                          style={{ fontFamily: "'Jost', sans-serif" }}
                          onClick={handleLogout}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                          Sign Out
                        </button>
                      </div>

                      {/* Corner accents */}
                      <div className="absolute bottom-0 left-0 w-[14px] h-[14px] border-b border-l border-[#8a6f2e]" />
                      <div className="absolute top-0 right-0 w-[14px] h-[14px] border-t border-r border-[#8a6f2e]" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              className="flex md:hidden flex-col gap-[5px] p-1 bg-transparent border-none cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="block w-[22px] h-px bg-[#6b6b70] transition-transform duration-300"
                style={{ transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
              <span className="block w-[22px] h-px bg-[#6b6b70] transition-opacity duration-300"
                style={{ opacity: menuOpen ? 0 : 1 }} />
              <span className="block w-[22px] h-px bg-[#6b6b70] transition-transform duration-300"
                style={{ transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* ── Ornament divider ── */}
        <div className="flex items-center gap-3 px-12 pb-3 max-md:px-6 max-md:pb-[10px]">
          <div className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
          <div className="w-[5px] h-[5px] rotate-45 shrink-0 bg-[#8a6f2e]" />
          <div className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
        </div>

        {/* ── Mobile menu ── */}
        <div
          className="flex-col gap-5 px-8 py-6 bg-[#1c1c1e] border-t border-[rgba(201,168,76,0.15)]"
          style={{ display: menuOpen ? "flex" : "none" }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <a key={href} href={href}
                className="text-[13px] tracking-[2px] uppercase no-underline transition-colors duration-300"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  color: active ? "#c9a84c" : "#6b6b70",
                  borderLeft: active ? "2px solid #c9a84c" : "2px solid transparent",
                  paddingLeft: active ? 8 : 0,
                }}
              >
                {label}
              </a>
            );
          })}

          {/* Mobile search */}
          <div className="border-t border-[rgba(201,168,76,0.12)] pt-4">
            <div className="flex items-center gap-2.5 px-3.5 py-[10px] bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.12)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="1.5" className="shrink-0">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
                placeholder="Search books, authors…"
                className="flex-1 bg-transparent border-none outline-none text-[12px] text-[#e8e0d0] tracking-[.5px] placeholder:text-white"
                style={{ fontFamily: "'Jost', sans-serif" }}
              />
              {searchLoading && (
                <span className="shrink-0 w-3 h-3 rounded-full animate-spin border-[1.5px] border-[rgba(201,168,76,0.3)] border-t-[#c9a84c]" />
              )}
            </div>

            {searchOpen && query.trim().length >= 2 && (
              <div className="bg-[rgba(201,168,76,0.03)] border border-[rgba(201,168,76,0.1)] border-t-0 max-h-[240px] overflow-y-auto">
                {!hasResults && !searchLoading && (
                  <p className="px-4 py-[14px] text-[11px] text-white m-0"
                    style={{ fontFamily: "'Jost', sans-serif" }}>No results found</p>
                )}
                {searchResults.authors.map(author => (
                  <a key={author.id} href={`/author/${author.slug}`}
                    className="flex items-center gap-3 px-4 py-[10px] no-underline hover:bg-[rgba(201,168,76,0.06)]"
                    onClick={() => { setMenuOpen(false); setSearchOpen(false); setQuery(""); }}>
                    <span className="text-[12px] text-[#e8e0d0]"
                      style={{ fontFamily: "'Jost', sans-serif" }}>{highlightMatch(author.name)}</span>
                  </a>
                ))}
                {searchResults.products.map(product => (
                  <a key={product.id} href={`/product/${product.slug}`}
                    className="flex items-center gap-3 px-4 py-[10px] no-underline hover:bg-[rgba(201,168,76,0.06)]"
                    onClick={() => { setMenuOpen(false); setSearchOpen(false); setQuery(""); }}>
                    <span className="text-[13px] text-[#e8e0d0]"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>{highlightMatch(product.title)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile auth */}
          {!authLoading && (
            user ? (
              <div className="border-t border-[rgba(201,168,76,0.12)] pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a6f2e] to-[#c9a84c] flex items-center justify-center shrink-0 text-[10px] font-semibold text-[#0a0a0b]"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-[15px] italic text-[#f5f0e8] m-0"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>{user.name}</p>
                    <p className="text-[10px] text-white mt-0.5 mb-0"
                      style={{ fontFamily: "'Jost', sans-serif" }}>{user.email}</p>
                  </div>
                </div>

                {[
                  { href: "/account",        label: "My Account" },
                  { href: "/orders",         label: "My Orders" },
                  { href: "/library/MyLibrary", label: "My Library" },
                ].map(({ href, label }) => (
                  <a key={href} href={href}
                    className="text-[12px] tracking-[1px] uppercase no-underline transition-colors duration-200"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: pathname === href ? "#c9a84c" : "#6b6b70",
                    }}>
                    {label}
                  </a>
                ))}

                <button
                  className="self-start mt-1 text-[11px] tracking-[2px] uppercase cursor-pointer
                    bg-[rgba(139,58,58,0.15)] border border-[rgba(139,58,58,0.3)] px-5 py-[9px] text-[#e07070]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="self-start mt-2 text-[11px] tracking-[2px] uppercase font-medium px-[22px] py-[10px]
                  bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer transition-colors duration-300 hover:bg-[#f5f0e8]"
                style={{ fontFamily: "'Jost', sans-serif" }}
                onClick={() => { window.location.href = "/login"; }}
              >
                Sign In
              </button>
            )
          )}
        </div>
      </header>
    </>
  );
}