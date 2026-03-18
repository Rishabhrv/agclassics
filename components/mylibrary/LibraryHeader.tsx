"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Library, Search, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type User = {
  id: number;
  name: string;
  email: string;
};

type SearchResult = {
  id: number;
  title: string;
  slug: string;
  main_image: string;
};

const headerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  .lib-header {
    background: #0f0f10;
    border-bottom: 1px solid rgba(201,168,76,0.12);
    position: sticky;
    top: 0;
    z-index: 40;
    backdrop-filter: blur(12px);
  }

  .lib-logo-text {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c9a84c;
    transition: color 0.3s;
  }
  .lib-logo-text:hover { color: #f5f0e8; }

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

  .lib-dropdown {
    position: absolute;
    left: 0; right: 0;
    top: calc(100% + 8px);
    background: #1a1a1c;
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 2px;
    z-index: 50;
    padding: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }

  .lib-search-book:hover img {
    transform: scale(1.04);
    filter: brightness(0.75) saturate(0.7);
  }
  .lib-search-book img {
    transition: transform 0.4s ease, filter 0.4s ease;
  }

  .lib-user-badge {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #6b6b70;
    white-space: nowrap;
  }
  .lib-user-name {
    color: #c9a84c;
    font-weight: 500;
  }

  /* Blocked overlay */
  .lib-overlay-cta {
    position: relative;
    overflow: hidden;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 12px 28px;
    background: #c9a84c;
    color: #0a0a0b;
    border: none;
    cursor: pointer;
    transition: background 0.3s;
  }
  .lib-overlay-cta:hover { background: #f5f0e8; }

  .lib-overlay-cancel {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 12px 28px;
    background: transparent;
    color: #6b6b70;
    border: 1px solid rgba(201,168,76,0.2);
    cursor: pointer;
    transition: border-color 0.3s, color 0.3s;
  }
  .lib-overlay-cancel:hover {
    border-color: #c9a84c;
    color: #c9a84c;
  }

  @keyframes libFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .lib-dropdown { animation: libFadeIn 0.2s ease both; }
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

  /* FETCH USER */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetch(`${API_URL}/api/mylibrary/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()).then(setUser).catch(() => {});
  }, []);

  /* CHECK SUBSCRIPTION */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetch(`${API_URL}/api/mylibrary/check-access`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()).then((d) => { if (!d.access) setBlocked(true); });
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

  return (
    <>
      <style>{headerStyles}</style>

      {/* ── HEADER ── */}
      <header className="lib-header">
        <div
          className="max-w-7xl mx-auto px-6 flex items-center gap-6 justify-between"
          style={{ height: 64 }}
        >
          {/* LOGO */}
          <Link href="/library/MyLibrary" className="flex items-center gap-3 shrink-0">
            <Library size={18} color="#c9a84c" strokeWidth={1.5} />
            <span className="lib-logo-text">My Library</span>
          </Link>

          {/* SEARCH */}
          <div
            ref={wrapperRef}
            className="relative flex-1 max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Search
              size={15}
              className="absolute left-[14px] top-1/2 -translate-y-1/2"
              style={{ color: "#6b6b70" }}
            />
            <input
              type="text"
              placeholder="Search books…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length && setShowDropdown(true)}
              className="lib-search-input"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }}
                className="absolute right-[14px] top-1/2 -translate-y-1/2"
                style={{ color: "#6b6b70", background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={14} />
              </button>
            )}

            {/* DROPDOWN */}
            {showDropdown && (
              <div className="lib-dropdown">
                {/* Header row */}
                <div
                  className="flex items-center justify-between mb-4 pb-3"
                  style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
                >
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "9px",
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      color: "#c9a84c",
                    }}
                  >
                    Results
                  </span>
                  {!loadingSearch && (
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#6b6b70" }}>
                      {results.length} found
                    </span>
                  )}
                </div>

                {loadingSearch && (
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#6b6b70" }}>
                    Searching…
                  </p>
                )}

                {!loadingSearch && results.length === 0 && (
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#6b6b70" }}>
                    No results found
                  </p>
                )}

                {!loadingSearch && results.length > 0 && (
                  <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    {results.slice(0, 6).map((book) => (
                      <Link
                        key={book.id}
                        href={`/my-books/${book.slug}`}
                        onClick={() => { setShowDropdown(false); setQuery(""); }}
                        className="lib-search-book group text-center"
                        style={{ textDecoration: "none" }}
                      >
                        <div className="relative overflow-hidden" style={{ borderRadius: "1px" }}>
                          <img
                            src={book.main_image ? `${API_URL}${book.main_image}` : "/images/placeholder-book.png"}
                            alt={book.title}
                            className="w-full object-cover"
                            style={{ height: 200, display: "block" }}
                          />
                          {/* Read badge */}
                          <span
                            className="absolute bottom-2 right-2"
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: "9px",
                              letterSpacing: "2px",
                              textTransform: "uppercase",
                              background: "#c9a84c",
                              color: "#0a0a0b",
                              padding: "4px 8px",
                              fontWeight: 500,
                            }}
                          >
                            Read
                          </span>
                        </div>
                        <p
                          className="mt-2 line-clamp-2"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "13px",
                            color: "#e8e0d0",
                            lineHeight: 1.4,
                          }}
                        >
                          {book.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* USER */}
          {user && (
            <span className="lib-user-badge">
              Hi, <span className="lib-user-name">{user.name}</span>
            </span>
          )}
        </div>
      </header>

      {/* ── BLOCKED OVERLAY ── */}
      {blocked && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        >
          {/* Decorative border box */}
          <div
            style={{
              background: "#0f0f10",
              border: "1px solid rgba(201,168,76,0.2)",
              padding: "48px 40px",
              maxWidth: 440,
              width: "100%",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Corner accents */}
            {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos}`}
                style={{
                  width: 20, height: 20,
                  borderTop: i < 2 ? "1px solid #c9a84c" : "none",
                  borderBottom: i >= 2 ? "1px solid #c9a84c" : "none",
                  borderLeft: i % 2 === 0 ? "1px solid #c9a84c" : "none",
                  borderRight: i % 2 === 1 ? "1px solid #c9a84c" : "none",
                }}
              />
            ))}

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <Library size={32} color="#c9a84c" strokeWidth={1} />
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30,
                fontWeight: 300,
                color: "#f5f0e8",
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              Activate Your Subscription
            </h2>

            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#6b6b70",
                lineHeight: 1.7,
                marginBottom: 8,
              }}
            >
              You need an active subscription to access{" "}
              <span style={{ color: "#e8e0d0" }}>My Library</span>.
            </p>

            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                color: "#6b6b70",
                marginBottom: 28,
              }}
            >
              Redirecting in{" "}
              <span style={{ color: "#c9a84c", fontWeight: 600 }}>{countdown}</span> seconds…
            </p>

            {/* Divider */}
            <div
              className="flex items-center gap-4 justify-center mb-6"
            >
              <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
              <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: "#8a6f2e" }} />
              <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => (window.location.href = "/subscriptions")}
                className="lib-overlay-cta"
              >
                Choose Plan Now
              </button>
              <button
                onClick={() => router.push("/")}
                className="lib-overlay-cancel"
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