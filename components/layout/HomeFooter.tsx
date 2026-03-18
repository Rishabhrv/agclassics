"use client";

export default function HomeFooter() {
  return (
    <>
      {/*
        Minimal style block — ONLY for:
        1. Google Fonts @import
        2. footer-col a::before dash pseudo-element (can't do in Tailwind)
        3. newsletter input::placeholder color
        4. newsletter input:focus border
      */}
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
      `}</style>

      <footer
        className="px-12 pt-20 max-md:px-6 max-md:pt-12 max-sm:px-6"
        style={{ background: "#1c1c1e", borderTop: "1px solid rgba(201,168,76,0.15)" }}
      >
        {/* ─── Main Grid ─── */}
        <div
          className="grid gap-[60px] pb-[60px] max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-9"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Brand */}
          <div>
            <span
              className="block mb-1 text-[26px] font-semibold tracking-[4px]"
              style={{ fontFamily: "'Cinzel', serif", color: "#f5f0e8" }}
            >
              AG Classics
            </span>
            <span
              className="block mb-5 text-[9px] tracking-[4px] uppercase"
              style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
            >
              Est. MMXXIV · Curated Books
            </span>
            <p
              className="italic leading-[1.8] max-w-[300px] mb-7 text-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "white" }}
            >
              Every book is a doorway. We curate the finest literary works — from timeless classics to contemporary masterpieces.
            </p>

            {/* Social Links */}
            <div className="flex gap-[14px]">
              {[
                {
                  label: "Instagram",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  ),
                },
                {
                  label: "Twitter/X",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4l16 16M4 20L20 4"/>
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  ),
                },
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
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <FooterCol
            title="Explore"
            links={[
              { href: "/ag-classics",  label: "AG Classics" },
              { href: "/ebooks",       label: "E-Books" },
              { href: "/new-arrivals", label: "New Arrivals" },
              { href: "/bestsellers",  label: "Bestsellers" },
              { href: "/authors",      label: "Authors" },
            ]}
          />

          {/* Account */}
          <FooterCol
            title="Account"
            links={[
              { href: "/login",         label: "Sign In" },
              { href: "/register",      label: "Create Account" },
              { href: "/orders",        label: "My Orders" },
              { href: "/wishlist",      label: "Wishlist" },
              { href: "/subscriptions", label: "Subscriptions" },
            ]}
          />

          {/* Help */}
          <FooterCol
            title="Help"
            links={[
              { href: "/shipping", label: "Shipping Info" },
              { href: "/returns",  label: "Returns" },
              { href: "/faq",      label: "FAQ" },
              { href: "/contact",  label: "Contact Us" },
              { href: "/track",    label: "Track Order" },
            ]}
          />
        </div>

        {/* ─── Newsletter ─── */}
        <div
          className="flex items-center justify-between gap-10 py-[50px] flex-wrap max-sm:flex-col max-sm:items-start"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div>
            <h3
              className="font-light italic mb-[6px] text-[28px]"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}
            >
              Letters from the Library
            </h3>
            <p
              className="text-[12px] tracking-[1px]"
              style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
            >
              New titles, rare finds &amp; reading notes. No spam — only stories.
            </p>
          </div>

          <div className="flex flex-1 max-w-[420px] max-sm:max-w-full max-sm:w-full">
            <input
              type="email"
              placeholder="your@email.com"
              className="nl-input flex-1 px-[18px] py-[13px] text-[13px] transition-[border-color] duration-300"
              style={{
                background: "#2a2a2d",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRight: "none",
                color: "#e8e0d0",
                fontFamily: "'Jost', sans-serif",
              }}
            />
            <button
              className="px-6 py-[13px] text-[11px] tracking-[2px] uppercase font-medium whitespace-nowrap transition-[background] duration-300"
              style={{
                background: "#c9a84c",
                color: "#0a0a0b",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="flex items-center justify-between gap-5 py-7 pb-9 flex-wrap max-sm:flex-col max-sm:items-start">
          <p
            className="text-[11px] tracking-[1px]"
            style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
          >
            © 2024 AG Classics. All rights reserved.{" "}
            <span style={{ color: "#8a6f2e" }}>·</span>{" "}
            Crafted with care in India
          </p>

          <div className="flex gap-6">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms",   label: "Terms of Service" },
              { href: "/cookies", label: "Cookies" },
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
          className="text-center py-5 pb-[10px] text-[20px] tracking-[12px]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "rgba(201,168,76,0.2)",
          }}
        >
          ✦ ✦ ✦
        </div>
      </footer>
    </>
  );
}

/* ── Reusable footer column ── */
function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4
        className="text-lg tracking-[3px] uppercase font-normal mb-6"
        style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}
      >
        {title}
      </h4>
      <ul className="flex flex-col gap-[13px] list-none">
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