"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/*
        Minimal style block — ONLY for:
        1. Google Fonts @import
        2. @keyframes ticker animation
        3. nav a::after sliding underline (pseudo-element, can't be done in Tailwind)
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
            <Image
              src="/images/logo/AGClassicLogo.png"
              alt="AGPH Store Logo"
              width={140}
              height={68}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-9">
            {[
              { href: "/",            label: "Home" },
              { href: "/ag-classics", label: "AG Classics" },
              { href: "/ebooks",      label: "E-Books" },
              { href: "/authors",     label: "Authors" },
              { href: "/about",       label: "About" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="nav-link text-[12px] tracking-[2px] uppercase font-normal no-underline"
                style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">

            {/* Search */}
            <button
              className="flex items-center p-1 transition-colors duration-300 hover:text-[#c9a84c]"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b70" }}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Wishlist */}
            <button
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
              className="relative flex items-center p-1 transition-colors duration-300 hover:text-[#c9a84c]"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b70" }}
              aria-label="Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span
                className="absolute -top-1 -right-1 w-[14px] h-[14px] rounded-full text-[9px] flex items-center justify-center font-semibold"
                style={{ background: "#c9a84c", color: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}
              >
                0
              </span>
            </button>

            {/* Sign In — desktop only */}
            <button
              className="hidden md:block text-[11px] tracking-[2px] uppercase font-medium px-[22px] py-[10px] transition-all duration-300 hover:-translate-y-px"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: "#0a0a0b",
                background: "#c9a84c",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
            >
              Sign In
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="flex md:hidden flex-col gap-[5px] p-1"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span
                className="block w-[22px] h-px transition-all duration-300"
                style={{
                  background: "#6b6b70",
                  transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
                }}
              />
              <span
                className="block w-[22px] h-px transition-all duration-300"
                style={{ background: "#6b6b70", opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block w-[22px] h-px transition-all duration-300"
                style={{
                  background: "#6b6b70",
                  transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* ─── Ornament Divider ─── */}
        <div className="flex items-center gap-3 px-12 pb-3 max-md:px-6 max-md:pb-[10px]">
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }}
          />
          <div className="w-[5px] h-[5px] rotate-45 flex-shrink-0" style={{ background: "#8a6f2e" }} />
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }}
          />
        </div>

        {/* ─── Mobile Menu ─── */}
        <div
          className="flex-col gap-5 px-8 py-6"
          style={{
            display: menuOpen ? "flex" : "none",
            background: "#1c1c1e",
            borderTop: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          {[
            { href: "/",            label: "Home" },
            { href: "/ag-classics", label: "AG Classics" },
            { href: "/ebooks",      label: "E-Books" },
            { href: "/authors",     label: "Authors" },
            { href: "/about",       label: "About" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[13px] tracking-[2px] uppercase no-underline transition-colors duration-300 hover:text-[#c9a84c]"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
            >
              {label}
            </a>
          ))}

          <button
            className="self-start mt-2 text-[11px] tracking-[2px] uppercase font-medium px-[22px] py-[10px] transition-all duration-300"
            style={{
              fontFamily: "'Jost', sans-serif",
              color: "#0a0a0b",
              background: "#c9a84c",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
          >
            Sign In
          </button>
        </div>
      </header>
    </>
  );
}