"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  authors:  { id: number; name: string;  slug: string; profile_image: string }[];
}

export default function HomeHeader() {
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dropOpen, setDropOpen]       = useState(false);
  const dropRef   = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount]     = useState(0);

  /* ── Search state ── */
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [query,         setQuery]         = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>({ products: [], authors: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef   = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  /* ── Scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Fetch logged-in user ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setAuthLoading(false); return; }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: User) => setUser(data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Fetch Cart Count ── */
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

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Close search on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
        setSearchResults({ products: [], authors: [] });
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Focus input when search opens ── */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInput.current?.focus(), 80);
  }, [searchOpen]);

  /* ── Debounced search ── */
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults({ products: [], authors: [] });
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetch(`${API_URL}/api/ag-classics/search?q=${encodeURIComponent(query)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setSearchResults(data))
        .catch(() => setSearchResults({ products: [], authors: [] }))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
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
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <span key={i} style={{ color: "#c9a84c" }}>{part}</span>
            : part
        )}
      </>
    );
  };

  const hasResults = searchResults.products.length > 0 || searchResults.authors.length > 0;

  /* ── Avatar initials ── */
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes searchExpand {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ticker-track { animation: ticker 20s linear infinite; }

        .nav-link {
          position: relative;
          transition: color 0.3s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1px;
          background: #c9a84c;
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: left;
        }
        .nav-link:hover { color: #e8e0d0; }
        .nav-link:hover::after { transform: scaleX(1); }

        .user-drop { animation: dropIn 0.22s ease both; }

        .drop-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          letter-spacing: 1px;
          color: #6b6b70;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s, background 0.2s;
          text-align: left;
          white-space: nowrap;
        }
        .drop-item:hover { color: #e8e0d0; background: rgba(201,168,76,0.07); }
        .drop-item.danger:hover { color: #e07070; background: rgba(139,58,58,0.1); }

        .search-overlay { animation: searchExpand 0.22s ease both; }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          text-decoration: none;
          transition: background 0.2s;
          cursor: pointer;
        }
        .search-result-item:hover { background: rgba(201,168,76,0.06); }

        @keyframes spin { to { transform: rotate(360deg); } }
        .search-spinner {
          width: 12px; height: 12px;
          border: 1.5px solid rgba(201,168,76,0.3);
          border-top-color: #c9a84c;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        /* ── Custom scrollbar for search results ── */
        .search-results-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(201,168,76,0.35) rgba(201,168,76,0.04);
        }
        .search-results-scroll::-webkit-scrollbar {
          width: 4px;
        }
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
      `}</style>

      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "bg-[rgba(10,10,11,0.92)] backdrop-blur-[16px] border-b border-[rgba(201,168,76,0.15)]"
            : ""
        }`}
      >
        {/* ─── Ticker ─── */}
        <div
          className="overflow-hidden text-center px-4 py-2 text-[11px] font-medium tracking-[2px] uppercase"
          style={{ background: "#c9a84c", color: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}
        >
          <span className="ticker-track inline-block whitespace-nowrap">
            ✦ Instant Ebook Access &nbsp;&nbsp;&nbsp; ✦ Download Immediately After Purchase &nbsp;&nbsp;&nbsp; ✦ Read on Mobile, Tablet &amp; Desktop &nbsp;&nbsp;&nbsp; ✦ New Titles Added Every Month &nbsp;&nbsp;&nbsp; ✦ Read Anywhere, Anytime &nbsp;&nbsp;&nbsp; ✦ Exclusive AG Digital Collection &nbsp;&nbsp;&nbsp;
          </span>
        </div>

        {/* ─── Main Header ─── */}
        <div
          className={`flex items-center justify-between px-12 max-md:px-6 transition-[padding] duration-[400ms] ${
            scrolled ? "py-[14px]" : "py-5"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/logo/AGClassicLogo.png" alt="AGPH Store Logo" width={140} height={68} priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-14 ml-10">
            {[
              { href: "/",            label: "Home" },
              { href: "/category/friction", label: "Genre" },
              { href: "/ebooks",      label: "E-Books" },
              { href: "/bestseller",     label: "Bestseller" },
              { href: "/subscription",       label: "Subscription" },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                className="nav-link text-[12px] tracking-[2px] uppercase font-normal no-underline"
                style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">

            {/* ─── Search (desktop) ─── */}
            <div ref={searchRef} className="hidden md:block" style={{ position: "relative" }}>
              <button
                onClick={() => setSearchOpen(o => !o)}
                className="flex items-center p-1 transition-colors duration-300"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: searchOpen ? "#c9a84c" : "#6b6b70",
                }}
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

              {searchOpen && (
                  <div
                    className="search-overlay"
                    style={{
                      position: "fixed",
                      top: "20%",
                      left: "28%",
                      transform: "translateX(-50%)",
                      width: 650,
                      background: "#1c1c1e",
                      border: "1px solid rgba(201,168,76,0.15)",
                      zIndex: 300,
                      overflow: "hidden",
                    }}
                  >
                  {/* Input */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(201,168,76,0.1)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      ref={searchInput}
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search books, authors…"
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        fontFamily: "'Jost', sans-serif", fontSize: 13,
                        color: "#e8e0d0", letterSpacing: "0.5px",
                      }}
                    />
                    {searchLoading && <span className="search-spinner" />}
                    {query && !searchLoading && (
                      <button
                        onClick={() => { setQuery(""); setSearchResults({ products: [], authors: [] }); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b70", padding: 0, lineHeight: 1 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Results */}
                  <div className="search-results-scroll" style={{ maxHeight: 380, overflowY: "auto", position: "relative" }}>
                    {query.trim().length < 2 && (
                      <p style={{ padding: "16px", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#6b6b70", letterSpacing: "1px", margin: 0 }}>
                        Type at least 2 characters…
                      </p>
                    )}

                    {query.trim().length >= 2 && !hasResults && !searchLoading && (
                      <p style={{ padding: "20px 16px", fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#6b6b70", textAlign: "center", letterSpacing: "1px", margin: 0 }}>
                        No results found
                      </p>
                    )}

                    {/* Authors */}
                    {searchResults.authors.length > 0 && (
                      <div>
                        <p style={{ padding: "10px 16px 6px", fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#c9a84c", margin: 0 }}>
                          Authors
                        </p>
                        {searchResults.authors.map(author => (
                          <a key={author.id} href={`/author/${author.slug}`} className="search-result-item"
                            onClick={() => { setSearchOpen(false); setQuery(""); }}>
                            {author.profile_image ? (
                              <img src={`${API_URL}${author.profile_image}`} alt={author.name}
                                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.2)" }} />
                            ) : (
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                </svg>
                              </div>
                            )}
                            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#e8e0d0", letterSpacing: "0.5px" }}>
                              {highlightMatch(author.name)}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {searchResults.authors.length > 0 && searchResults.products.length > 0 && (
                      <div style={{ margin: "4px 16px", height: 1, background: "rgba(201,168,76,0.08)" }} />
                    )}

                    {/* Products */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <p style={{ padding: "10px 16px 6px", fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#c9a84c", margin: 0 }}>
                          Books
                        </p>
                        {searchResults.products.map(product => (
                          <a key={product.id} href={`/product/${product.slug}`} className="search-result-item"
                            onClick={() => { setSearchOpen(false); setQuery(""); }}>
                            {product.main_image ? (
                              <img src={`${API_URL}${product.main_image}`} alt={product.title}
                                style={{ width: 62, height: 80, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.15)" }} />
                            ) : (
                              <div style={{ width: 32, height: 44, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1">
                                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                              </div>
                            )}
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#e8e0d0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                              {highlightMatch(product.title)}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Gold corner accent */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, borderBottom: "1px solid #8a6f2e", borderLeft: "1px solid #8a6f2e" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => { window.location.href = "/wishlist"; }}
              className="flex items-center p-1 transition-colors duration-300 hover:text-[#c9a84c]"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b70" }}
              aria-label="Wishlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Cart */}
            <button
              onClick={() => { window.location.href = "/cart"; }}
              className="relative flex items-center p-1 transition-colors duration-300 hover:text-[#c9a84c]"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b70" }}
              aria-label="Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[3px] rounded-full text-[9px] flex items-center justify-center font-semibold"
                  style={{ background: "#c9a84c", color: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* ─── Auth Area (desktop) ─── */}
            <div className="hidden md:block" ref={dropRef} style={{ position: "relative" }}>
              {authLoading && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.2)" }} />
              )}
              {!authLoading && !user && (
                <button
                  className="text-[11px] tracking-[2px] uppercase font-medium px-[22px] py-[10px] transition-all duration-300 hover:-translate-y-px"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#0a0a0b", background: "#c9a84c", border: "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f5f0e8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#c9a84c")}
                  onClick={() => { window.location.href = "/login"; }}
                >
                  Sign In
                </button>
              )}
              {!authLoading && user && (
                <>
                  <button
                    onClick={() => setDropOpen(o => !o)}
                    style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label="Account menu"
                  >
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#e8e0d0", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name.split(" ")[0]}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="2"
                      style={{ transition: "transform 0.3s", transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  {dropOpen && (
                    <div className="user-drop" style={{
                      position: "absolute", top: "calc(100% + 14px)", right: 0,
                      minWidth: 220, background: "#1c1c1e",
                      border: "1px solid rgba(201,168,76,0.15)", zIndex: 200, overflow: "hidden",
                    }}>
                      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", color: "#f5f0e8", margin: 0 }}>{user.name}</p>
                        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#6b6b70", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        <a href="/account" className="drop-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          My Account
                        </a>
                        <a href="/orders" className="drop-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          My Orders
                        </a>
                        <a href="/wishlist" className="drop-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          Wishlist
                        </a>
                        <a href="/ebooks/library" className="drop-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                          My Library
                        </a>
                        <div style={{ margin: "6px 16px", height: 1, background: "rgba(201,168,76,0.1)" }} />
                        <button className="drop-item danger" onClick={handleLogout}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Sign Out
                        </button>
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, width: 14, height: 14, borderBottom: "1px solid #8a6f2e", borderLeft: "1px solid #8a6f2e" }} />
                      <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, borderTop: "1px solid #8a6f2e", borderRight: "1px solid #8a6f2e" }} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="flex md:hidden flex-col gap-[5px] p-1"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="block w-[22px] h-px transition-all duration-300" style={{ background: "#6b6b70", transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
              <span className="block w-[22px] h-px transition-all duration-300" style={{ background: "#6b6b70", opacity: menuOpen ? 0 : 1 }} />
              <span className="block w-[22px] h-px transition-all duration-300" style={{ background: "#6b6b70", transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* ─── Ornament Divider ─── */}
        <div className="flex items-center gap-3 px-12 pb-3 max-md:px-6 max-md:pb-[10px]">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
          <div className="w-[5px] h-[5px] rotate-45 flex-shrink-0" style={{ background: "#8a6f2e" }} />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
        </div>

        {/* ─── Mobile Menu ─── */}
        <div
          className="flex-col gap-5 px-8 py-6"
          style={{ display: menuOpen ? "flex" : "none", background: "#1c1c1e", borderTop: "1px solid rgba(201,168,76,0.15)" }}
        >
          {[
              { href: "/",            label: "Home" },
              { href: "/category/friction", label: "Genre" },
              { href: "/ebooks",      label: "E-Books" },
              { href: "/bestseller",     label: "Bestseller" },
              { href: "/subscription",       label: "Subscription" },
          ].map(({ href, label }) => (
            <a key={href} href={href}
              className="text-[13px] tracking-[2px] uppercase no-underline transition-colors duration-300 hover:text-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
            >
              {label}
            </a>
          ))}

          {/* ── Mobile Search ── */}
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
                placeholder="Search books, authors…"
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#e8e0d0", letterSpacing: "0.5px" }}
              />
              {searchLoading && <span className="search-spinner" />}
            </div>

            {searchOpen && query.trim().length >= 2 && (
              <div style={{ background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.1)", borderTop: "none", maxHeight: 240, overflowY: "auto" }}>
                {!hasResults && !searchLoading && (
                  <p style={{ padding: "14px 16px", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#6b6b70", margin: 0 }}>No results found</p>
                )}
                {searchResults.authors.map(author => (
                  <a key={author.id} href={`/author/${author.slug}`} className="search-result-item"
                    onClick={() => { setMenuOpen(false); setSearchOpen(false); setQuery(""); }}>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#e8e0d0" }}>{highlightMatch(author.name)}</span>
                  </a>
                ))}
                {searchResults.products.map(product => (
                  <a key={product.id} href={`/product/${product.slug}`} className="search-result-item"
                    onClick={() => { setMenuOpen(false); setSearchOpen(false); setQuery(""); }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#e8e0d0" }}>{highlightMatch(product.title)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile — user section */}
          {!authLoading && (
            user ? (
              <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #8a6f2e, #c9a84c)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", fontSize: 10, color: "#0a0a0b", fontWeight: 600, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", color: "#f5f0e8", margin: 0 }}>{user.name}</p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: "#6b6b70", margin: "2px 0 0" }}>{user.email}</p>
                  </div>
                </div>
                {[
                  { href: "/account", label: "My Account" },
                  { href: "/orders",  label: "My Orders" },
                  { href: "/ebooks/library", label: "My Library" },
                ].map(({ href, label }) => (
                  <a key={href} href={href} style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "1px", textTransform: "uppercase", color: "#6b6b70", textDecoration: "none" }}>
                    {label}
                  </a>
                ))}
                <button
                  style={{ alignSelf: "flex-start", marginTop: 4, fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#e07070", background: "rgba(139,58,58,0.15)", border: "1px solid rgba(139,58,58,0.3)", padding: "9px 20px", cursor: "pointer" }}
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="self-start mt-2 text-[11px] tracking-[2px] uppercase font-medium px-[22px] py-[10px] transition-all duration-300"
                style={{ fontFamily: "'Jost', sans-serif", color: "#0a0a0b", background: "#c9a84c", border: "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f0e8")}
                onMouseLeave={e => (e.currentTarget.style.background = "#c9a84c")}
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