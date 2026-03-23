"use client";

import { useState } from "react";

export default function HomeFooter() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

        .footer-link::before {
          content: '–';
          color: #8a6f2e;
          font-size: 10px;
        }

        .nl-input::placeholder { color: white; }
        .nl-input:focus {
          outline: none;
          border-color: rgba(201,168,76,0.5);
        }

        /* Mobile accordion chevron */
        .footer-chevron {
          transition: transform 0.28s ease;
        }
        .footer-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

      <footer
        className="px-4 sm:px-6 md:px-12 pt-12 md:pt-20"
        style={{ background: "#1c1c1e", borderTop: "1px solid rgba(201,168,76,0.15)" }}
      >
        {/* ─── Main Grid ─── */}
        <div
          className="pb-10 md:pb-[60px]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Desktop: 4-col grid | Mobile: stacked */}
          <div className="hidden md:grid gap-[60px]"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
            <BrandBlock />
            <FooterCol title="Explore"  links={exploreLinks} />
            <FooterCol title="Account"  links={accountLinks} />
            <FooterCol title="Help"     links={helpLinks} />
          </div>

          {/* ── Mobile layout ── */}
          <div className="md:hidden flex flex-col gap-0">
            {/* Brand */}
            <div className="pb-8 border-b border-[rgba(255,255,255,0.05)]">
              <BrandBlock />
            </div>

            {/* Accordion link groups */}
            <AccordionCol title="Explore"  links={exploreLinks} />
            <AccordionCol title="Account"  links={accountLinks} />
            <AccordionCol title="Help"     links={helpLinks} />
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-5 py-6 sm:py-7 pb-4">
          <p
            className="text-[11px] tracking-[1px] text-center sm:text-left"
            style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
          >
            © 2026 AG Classics. All rights reserved.{" "}
            <span style={{ color: "#8a6f2e" }}>·</span>{" "}
            Crafted with care in India
          </p>

          <div className="flex justify-center sm:justify-end gap-4 sm:gap-6 flex-wrap">
            {[
              { href: "/privacy-policy",       label: "Privacy Policy" },
              { href: "/terms-and-conditions", label: "Terms & Conditions" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[11px] tracking-[1px] no-underline transition-colors duration-300 hover:text-[#c9a84c]"
                style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ─── Decorative Ornament ─── */}
        <div
          className="text-center py-4 pb-[10px] text-[18px] sm:text-[20px] tracking-[10px] sm:tracking-[12px]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(201,168,76,0.2)" }}
        >
          ✦ ✦ ✦
        </div>
      </footer>
    </>
  );
}

/* ── Link data ── */
const exploreLinks = [
  { href: "/",            label: "AG Classics" },
  { href: "/ebooks",      label: "E-Books" },
  { href: "/bestseller",  label: "Bestsellers" },
];
const accountLinks = [
  { href: "/login",          label: "Sign In" },
  { href: "/register",       label: "Create Account" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/wishlist",       label: "Wishlist" },
  { href: "/subscriptions",  label: "Subscriptions" },
];
const helpLinks = [
  { href: "https://agphbooks.com/contact-us/", label: "Contact Us" },
  { href: "/account/orders",                   label: "Track Order" },
];

/* ── Brand block (shared between desktop and mobile) ── */
function BrandBlock() {
  return (
    <div>
      <span
        className="block mb-1 text-[22px] sm:text-[26px] font-semibold tracking-[4px]"
        style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}
      >
        AG Classics
      </span>

      <p
        className="italic leading-[1.8] max-w-[340px] mb-6 sm:mb-7 text-base sm:text-lg"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "white" }}
      >
        Every book is a doorway. We curate the finest literary works from timeless classics to contemporary masterpieces.
      </p>

      {/* Social links */}
      <div className="flex gap-[12px] sm:gap-[14px]">
        {[
          { label: "Instagram", icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
          { label: "Twitter/X", icon: <><path d="M4 4l16 16M4 20L20 4"/></> },
          { label: "Facebook",  icon: <><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></> },
          { label: "WhatsApp",  icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
        ].map(({ label, icon }) => (
          <a
            key={label}
            href="#"
            aria-label={label}
            className="w-9 h-9 flex items-center justify-center transition-all duration-300 no-underline"
            style={{ border: "1px solid rgba(201,168,76,0.2)", color: "white" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c9a84c";
              e.currentTarget.style.color = "#c9a84c";
              e.currentTarget.style.background = "rgba(201,168,76,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {icon}
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Desktop footer column ── */
function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4
        className="text-[13px] sm:text-[14px] tracking-[3px] uppercase font-normal mb-5 sm:mb-6"
        style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}
      >
        {title}
      </h4>
      <ul className="flex flex-col gap-[11px] sm:gap-[13px] list-none m-0 p-0">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className="footer-link flex items-center gap-2 text-sm tracking-[0.5px] no-underline transition-colors duration-300 hover:text-[#e8e0d0]"
              style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Mobile accordion column ── */
function AccordionCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[rgba(255,255,255,0.05)]">
      {/* Header row — tap to toggle */}
      <button
        className="w-full flex items-center justify-between py-4 bg-transparent border-none cursor-pointer text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <h4
          className="text-[12px] tracking-[3px] uppercase font-normal m-0"
          style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}
        >
          {title}
        </h4>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(201,168,76,0.5)" strokeWidth="1.5"
          className={`footer-chevron shrink-0 ${open ? "open" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible links */}
      <div
        style={{
          maxHeight: open ? `${links.length * 44}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <ul className="flex flex-col gap-0 list-none m-0 p-0 pb-3">
          {links.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="footer-link flex items-center gap-2 py-[10px] text-[13px] tracking-[0.5px] no-underline transition-colors duration-200 active:text-[#c9a84c]"
                style={{ fontFamily: "'Jost', sans-serif", color: "rgba(255,255,255,0.7)" }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}