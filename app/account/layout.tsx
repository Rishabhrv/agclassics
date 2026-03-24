"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  provider?: string;
}

const TABS = [
  {
    href: "/account/profile",
    label: "Profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/account/orders",
    label: "Orders",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/account/subscriptions",
    label: "Subscriptions",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    href: "/account/payments",
    label: "Payments",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/api/account/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u: User) => setUser(u))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border border-[rgba(201,168,76,0.3)] border-t-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-3xl italic text-[#f5f0e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Please sign in
        </p>
        <p className="text-sm text-white" style={{ fontFamily: "'Jost', sans-serif" }}>
          You need to be logged in to view your account.
        </p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="mt-2 text-[11px] tracking-[3px] uppercase px-8 py-3 bg-[#c9a84c] text-[#0a0a0b] cursor-pointer border-none"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .panel-fade  { animation: fadeUp 0.3s ease both; }
        .sidebar-ani { animation: slideIn 0.25s ease both; }

        .acct-tab { position: relative; transition: color 0.25s, background 0.25s; }
        .acct-tab.active { color: #c9a84c !important; background: rgba(201,168,76,0.07); }
        .acct-tab.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: #c9a84c;
        }
        .acct-tab:not(.active):hover { color: #e8e0d0; background: rgba(201,168,76,0.04); }

        .thin-scroll { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,0.3) transparent; }
        .thin-scroll::-webkit-scrollbar       { width: 3px; }
        .thin-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); }

        /* Mobile nav strip (bottom tabs) */
        .mobile-nav-strip {
          display: none;
        }

        /* Mobile sidebar overlay */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 40;
        }
        .mobile-drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 260px;
          background: #1c1c1e;
          border-right: 1px solid rgba(201,168,76,0.15);
          z-index: 50;
          overflow-y: auto;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .mobile-drawer.open { transform: translateX(0); }
        .mobile-overlay.open { display: block; }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav-strip { display: flex; }

          /* Ensure active indicator on bottom strip is a bottom line */
          .mobile-strip-tab.active::before {
            content: '';
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 2px;
            background: #c9a84c;
            top: auto; width: auto;
          }

          .acct-main-border { border-left: 1px solid rgba(201,168,76,0.1) !important; }
        }
      `}</style>

      <div className="min-h-screen pt-28 pb-20 md:pt-35 md:pb-16" style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* ── Header ── */}
        <div className="text-center px-6 pb-8 md:pb-12">
          <div
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full mx-auto mb-4 md:mb-5 flex items-center justify-center text-lg md:text-[22px] font-semibold text-[#0a0a0b] border border-[rgba(201,168,76,0.3)]"
            style={{ background: "linear-gradient(135deg,#8a6f2e,#c9a84c)", boxShadow: "0 0 40px rgba(201,168,76,0.12)", fontFamily: "'Cinzel',serif" }}
          >
            {initials}
          </div>
          <p className="text-2xl md:text-[32px] italic text-[#f5f0e8] mb-1.5" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
            {user.name}
          </p>
          <p className="text-xs text-white tracking-[0.5px]">{user.email}</p>
          <div className="flex items-center gap-3 justify-center mt-4">
            <div className="w-10 md:w-12 h-px bg-[rgba(201,168,76,0.25)]" />
            <div className="w-[5px] h-[5px] bg-[#8a6f2e] rotate-45" />
            <div className="w-10 md:w-12 h-px bg-[rgba(201,168,76,0.25)]" />
          </div>
        </div>

        {/* ── Mobile top bar with hamburger ── */}
        <div className="mobile-nav-strip md:hidden flex items-center gap-2 px-4 mb-4 overflow-x-auto thin-scroll pb-1">
          {/* Hamburger for full menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="shrink-0 w-9 h-9 flex items-center justify-center border border-[rgba(201,168,76,0.2)] text-[#c9a84c] bg-transparent"
            aria-label="Open menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Quick tab strip */}
          {TABS.map((tab) => {
            const active = pathname === tab.href || (pathname?.startsWith(tab.href + "/") ?? false);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`mobile-strip-tab relative shrink-0 flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-[1.5px] uppercase no-underline transition-colors whitespace-nowrap border-b-2 ${active ? "text-[#c9a84c] border-[#c9a84c]" : "text-white border-transparent"}`}
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* ── Mobile drawer overlay ── */}
        <div className={`mobile-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <div className={`mobile-drawer thin-scroll ${sidebarOpen ? "open" : ""}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(201,168,76,0.1)]">
            <p className="text-[8px] tracking-[3px] text-[#8a6f2e] uppercase m-0" style={{ fontFamily: "'Cinzel',serif" }}>My Account</p>
            <button onClick={() => setSidebarOpen(false)} className="text-white bg-transparent border-none cursor-pointer p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="py-2">
            {TABS.map((tab) => {
              const active = pathname === tab.href || (pathname?.startsWith(tab.href + "/") ?? false);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`acct-tab flex items-center gap-2.5 w-full px-5 py-3.5 text-[11px] tracking-[1.5px] uppercase whitespace-nowrap no-underline ${active ? "active text-[#c9a84c]" : "text-white"}`}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-[rgba(201,168,76,0.08)] py-2">
            <Link href="/library/MyLibrary" onClick={() => setSidebarOpen(false)} className="acct-tab flex items-center gap-2.5 w-full px-5 py-3.5 text-[11px] tracking-[1.5px] uppercase text-white whitespace-nowrap no-underline">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              My Library
            </Link>
            <Link href="/wishlist" onClick={() => setSidebarOpen(false)} className="acct-tab flex items-center gap-2.5 w-full px-5 py-3.5 text-[11px] tracking-[1.5px] uppercase text-white whitespace-nowrap no-underline">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Wishlist
            </Link>
            <button
              onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              className="acct-tab flex items-center gap-2.5 w-full px-5 py-3.5 text-[11px] tracking-[1.5px] uppercase text-red-400 whitespace-nowrap bg-transparent border-none cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Layout ── */}
        <div className="flex max-w-[1160px] mx-auto px-3 md:px-4">

          {/* Desktop Sidebar */}
          <aside className="desktop-sidebar hidden md:flex thin-scroll w-[220px] shrink-0 flex-col bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] py-2">
            <div className="px-[18px] py-3.5 border-b border-[rgba(201,168,76,0.08)]">
              <p className="text-[8px] tracking-[3px] text-[#8a6f2e] uppercase" style={{ fontFamily: "'Cinzel',serif" }}>
                My Account
              </p>
            </div>

            <div className="py-2 flex-1">
              {TABS.map((tab) => {
                const active = pathname === tab.href || (pathname?.startsWith(tab.href + "/") ?? false);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`acct-tab flex items-center gap-2.5 w-full px-[18px] py-3 text-[11px] tracking-[1.5px] uppercase whitespace-nowrap no-underline ${active ? "active text-[#c9a84c]" : "text-white"}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-[rgba(201,168,76,0.08)] py-2">
              <Link href="/library/MyLibrary" className="acct-tab flex items-center gap-2.5 w-full px-[18px] py-3 text-[11px] tracking-[1.5px] uppercase text-white whitespace-nowrap no-underline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                My Library
              </Link>
              <Link href="/wishlist" className="acct-tab flex items-center gap-2.5 w-full px-[18px] py-3 text-[11px] tracking-[1.5px] uppercase text-white whitespace-nowrap no-underline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Wishlist
              </Link>
              <button
                onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
                className="acct-tab flex items-center gap-2.5 w-full px-[18px] py-3 text-[11px] tracking-[1.5px] uppercase text-red-400 whitespace-nowrap bg-transparent border-none cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 bg-[#111113] border border-[rgba(201,168,76,0.1)] md:border-l-0 min-h-[560px] w-full">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}