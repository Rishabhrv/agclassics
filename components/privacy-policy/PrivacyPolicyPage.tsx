"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield,
  Mail,
  Cookie,
  Lock,
  Eye,
  Share2,
  Globe,
  Baby,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerSweep {
    from { left: -60%; }
    to   { left: 160%; }
  }
  @keyframes pulse-gold {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }

  .anim-fade-0 { animation: fadeUp 0.9s ease 0.0s both; }
  .anim-fade-2 { animation: fadeUp 0.9s ease 0.2s both; }
  .anim-fade-5 { animation: fadeUp 0.9s ease 0.5s both; }

  .mag-cta { position: relative; overflow: hidden; }
  .mag-cta::after {
    content: '';
    position: absolute;
    top: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  }
  .mag-cta:hover::after { animation: shimmerSweep 0.55s ease; }

  .nav-btn { transition: all 200ms ease; }
  .nav-btn:hover { background: rgba(201,168,76,0.06); }
  .nav-btn.active { background: rgba(201,168,76,0.1); }

  .section-card {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 300ms ease;
  }

  .sub-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-left: 2px solid rgba(201,168,76,0.3);
    transition: border-left-color 250ms ease, background 250ms ease;
  }
  .sub-card:hover {
    border-left-color: #c9a84c;
    background: rgba(201,168,76,0.04);
  }

  .mobile-dropdown {
    background: #0f0f10;
    border-top: 1px solid rgba(255,255,255,0.05);
    max-height: 72vh;
    overflow-y: auto;
  }

  .gold-dot { animation: pulse-gold 2.5s ease infinite; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0b; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }
`;

const sections = [
  {
    id: "information-we-collect",
    icon: Eye,
    number: "01",
    title: "What Information We Collect",
    content: null,
    subsections: [
      {
        label: "Information You Give Us",
        text: "This includes your name, email address, and any other details you provide when creating an account, completing a purchase, or signing up for our newsletter. We only ask for what we genuinely need.",
      },
      {
        label: "Information Collected Automatically",
        text: "When you browse AG Classics, we may automatically collect your IP address, browser type, device information, and pages you visit. This is gathered through cookies and similar tracking technologies to help us improve your experience.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: Shield,
    number: "02",
    title: "How We Use Your Information",
    content: "Your data helps us deliver a seamless reading experience and run AG Classics effectively.",
    list: [
      "Manage your account and respond to your queries.",
      "Improve our catalog, platform performance, and recommendations.",
      "Send newsletters or curated reading suggestions — only with your explicit consent.",
      "Detect and prevent fraudulent transactions or misuse of the platform.",
      "Comply with applicable legal and regulatory obligations.",
    ],
  },
  {
    id: "who-we-share-with",
    icon: Share2,
    number: "03",
    title: "Who We Share Your Information With",
    content: "We do not sell, trade, or rent your personal information to anyone. Limited sharing occurs only in the following specific circumstances:",
    list: [
      "Payment processors (e.g. Razorpay) bound by strict confidentiality obligations.",
      "Law enforcement or regulatory authorities when legally required.",
      "Successors or acquirers in the event of a business merger or acquisition.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    number: "04",
    title: "Cookies & Tracking",
    content: "We use cookies to remember your preferences, keep you signed in, and understand how readers use our platform. You can disable cookies in your browser settings, though some features — such as staying logged in — may not work as intended. Please refer to your browser's help documentation for instructions.",
  },
  {
    id: "data-safety",
    icon: Lock,
    number: "05",
    title: "Keeping Your Data Safe",
    content: "We implement administrative, technical, and physical safeguards to protect your personal data from unauthorized access, loss, or disclosure. All payment transactions on AG Classics are encrypted and processed securely via Razorpay. While no system can be fully impenetrable, we continuously review and strengthen our security practices.",
  },
  {
    id: "your-rights",
    icon: Shield,
    number: "06",
    title: "Your Rights",
    content: "Depending on your location, you may have the following rights regarding your personal data:",
    list: [
      "Access and review the personal information we hold about you.",
      "Request correction of inaccurate or incomplete data.",
      "Request deletion of your personal data, subject to legal obligations.",
      "Unsubscribe from marketing communications at any time.",
      "Restrict or object to certain types of data processing.",
    ],
  },
  {
    id: "external-links",
    icon: Globe,
    number: "07",
    title: "Links to Other Websites",
    content: "AG Classics may occasionally link to third-party websites for reference or convenience. We have no control over these external sites and are not responsible for their privacy practices. We encourage you to review their policies before sharing any personal information.",
  },
  {
    id: "kids-privacy",
    icon: Baby,
    number: "08",
    title: "Children's Privacy",
    content: "AG Classics is not intended for children under the age of 16. We do not knowingly collect personal information from minors. If we become aware that we have inadvertently done so, we will promptly delete that data. If you believe a child has provided us with personal information, please contact us immediately.",
  },
  {
    id: "updates",
    icon: RefreshCw,
    number: "09",
    title: "Policy Updates",
    content: "We may update this Privacy Policy from time to time to reflect changes in our practices, services, or applicable law. Updates will be posted here with a revised effective date. We recommend checking this page occasionally to stay informed.",
  },
  {
    id: "contact",
    icon: Mail,
    number: "10",
    title: "Get in Touch",
    content: "Have questions or concerns about this policy or how we handle your data? We're committed to transparency and would love to hear from you.",
    cta: true,
  },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("information-we-collect");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNavOpen(false);
  };

  const activeTitle = sections.find((s) => s.id === activeSection)?.title ?? "Contents";

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen mt-30" style={{ background: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}>

        {/* ══════════════════════════════════
            HERO
        ══════════════════════════════════ */}
        <div style={{ background: "#0f0f10", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
            style={{
              background: "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 md:py-28" style={{ zIndex: 1 }}>

            {/* Eyebrow */}
            <div className="anim-fade-0 flex items-center gap-4 mb-6">
              <div className="w-[40px] h-px" style={{ background: "rgba(201,168,76,0.4)" }} />
              <span
                className="text-[10px] uppercase tracking-[5px]"
                style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}
              >
                Legal · Privacy
              </span>
            </div>

            {/* Title */}
            <h1
              className="anim-fade-2 font-light leading-[0.9] tracking-tight mb-8"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(48px, 8vw, 100px)",
                color: "#f5f0e8",
              }}
            >
              Privacy{" "}
              <em className="italic" style={{ color: "#c9a84c" }}>Policy</em>
            </h1>

            {/* Meta row */}
            <div className="anim-fade-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div
                className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px]"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  border: "1px solid rgba(201,168,76,0.2)",
                  color: "#8a8790",
                  background: "rgba(201,168,76,0.04)",
                }}
              >
                <span className="gold-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#c9a84c" }} />
                Effective: September 5, 2025
              </div>
              <p
                className="text-sm max-w-md leading-relaxed"
                style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
              >
                We care about your privacy and want to be fully transparent about how
                we handle your data at{" "}
                <span style={{ color: "#8a8790" }}>agclassics.agkit.in</span>.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            MOBILE: sticky section picker
        ══════════════════════════════════ */}
        <div
          className="lg:hidden sticky top-0 z-30"
          style={{ background: "#0f0f10", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            <span className="flex items-center gap-3">
              <span
                className="text-[9px] tabular-nums"
                style={{ color: "white" }}
              >
                {sections.find((s) => s.id === activeSection)?.number}
              </span>
              <span
                className="truncate max-w-[240px] text-[13px]"
                style={{ color: "#c9a84c" }}
              >
                {activeTitle}
              </span>
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform shrink-0 ${mobileNavOpen ? "rotate-180" : ""}`}
              style={{ color: "white" }}
            />
          </button>

          {mobileNavOpen && (
            <div className="mobile-dropdown">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-[13px] transition-colors cursor-pointer"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    color: activeSection === s.id ? "#c9a84c" : "white",
                    background: activeSection === s.id ? "rgba(201,168,76,0.07)" : "transparent",
                    borderLeft: activeSection === s.id ? "2px solid #c9a84c" : "2px solid transparent",
                  }}
                >
                  <span className="text-[9px] tabular-nums shrink-0" style={{ color: "#3a3a3e" }}>
                    {s.number}
                  </span>
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            TWO-COLUMN LAYOUT
        ══════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-14 py-10 sm:py-16">

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="sticky top-8">
                <p
                  className="text-[9px] uppercase tracking-[4px] mb-5"
                  style={{ fontFamily: "'Cinzel', serif", color: "white" }}
                >
                  Contents
                </p>

                <nav className="space-y-0.5">
                  {sections.map((s) => {
                    const Icon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`nav-btn w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] cursor-pointer ${isActive ? "active" : ""}`}
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          color: isActive ? "#c9a84c" : "white",
                          border: isActive ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
                        }}
                      >
                        <span
                          className="text-[9px] tabular-nums shrink-0"
                          style={{ color: isActive ? "rgba(201,168,76,0.6)" : "#c9a84c" }}
                        >
                          {s.number}
                        </span>
                        <Icon
                          className="shrink-0"
                          style={{ width: 12, height: 12, color: isActive ? "#c9a84c" : "#c9a84c" }}
                          strokeWidth={1.5}
                        />
                        <span className="leading-tight">{s.title}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Contact card */}
                <div
                  className="mt-10 p-5 rounded-xl"
                  style={{
                    background: "rgba(201,168,76,0.04)",
                    border: "1px solid rgba(201,168,76,0.12)",
                  }}
                >
                  <p
                    className="text-[11px] leading-relaxed mb-4"
                    style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
                  >
                    Questions about your privacy?
                  </p>
                  <Link
                    href="https://agphbooks.com/contact-us/"
                    className="inline-flex items-center gap-2 text-[11px] font-medium transition-colors duration-200"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
                  >
                    <Mail style={{ width: 12, height: 12 }} />
                    Contact us →
                  </Link>
                </div>
              </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 min-w-0">
              <div>
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <section
                      key={section.id}
                      id={section.id}
                      className="section-card py-8 sm:py-10 scroll-mt-16 lg:scroll-mt-8 first:pt-0"
                    >
                      {/* Section header */}
                      <div className="flex items-start gap-4 mb-7">
                        <div
                          className="mt-0.5 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: "rgba(201,168,76,0.08)",
                            border: "1px solid rgba(201,168,76,0.15)",
                          }}
                        >
                          <Icon
                            style={{ width: 14, height: 14, color: "#c9a84c" }}
                            strokeWidth={1.5}
                          />
                        </div>
                        <div>
                          <span
                            className="text-[9px] uppercase tracking-[4px] block mb-1"
                            style={{ fontFamily: "'Cinzel', serif", color: "white" }}
                          >
                            Section {section.number}
                          </span>
                          <h2
                            className="font-light leading-snug"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontSize: "clamp(20px, 2.5vw, 26px)",
                              color: "#c9a84c",
                            }}
                          >
                            {section.title}
                          </h2>
                        </div>
                      </div>

                      {/* Indented content block */}
                      <div className="pl-[52px] sm:pl-[56px]">

                        {section.content && (
                          <p
                            className="text-[14px] leading-[1.95] mb-6"
                            style={{ fontFamily: "'Jost', sans-serif", color: "#ffffff" }}
                          >
                            {section.content}
                          </p>
                        )}

                        {section.subsections && (
                          <div className="space-y-3 mb-6">
                            {section.subsections.map((sub) => (
                              <div key={sub.label} className="sub-card rounded-lg p-5">
                                <p
                                  className="text-[10px] font-semibold uppercase tracking-[3px] mb-2"
                                  style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}
                                >
                                  {sub.label}
                                </p>
                                <p
                                  className="text-[14px] leading-[1.85]"
                                  style={{ fontFamily: "'Jost', sans-serif", color: "#ffffff" }}
                                >
                                  {sub.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {section.list && (
                          <ul className="space-y-3">
                            {section.list.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-[14px] leading-[1.8]"
                                style={{ fontFamily: "'Jost', sans-serif", color: "#ffffff" }}
                              >
                                <span
                                  className="mt-[10px] shrink-0 w-1 h-1 rotate-45 inline-block"
                                  style={{ background: "#8a6f2e" }}
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.cta && (
                          <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Link
                              href="https://agphbooks.com/contact-us/"
                              className="mag-cta inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[3px] px-7 py-[13px] transition-colors duration-300"
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                background: "#c9a84c",
                                color: "#0a0a0b",
                              }}
                            >
                              <Mail style={{ width: 13, height: 13 }} />
                              Contact Us
                            </Link>
                            <Link
                              href="/"
                              className="mag-cta inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[3px] px-7 py-[13px] transition-all duration-300"
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                border: "1px solid rgba(201,168,76,0.2)",
                                color: "#8a8790",
                              }}
                            >
                              Back to Home
                            </Link>
                          </div>
                        )}

                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Mobile bottom contact card */}
              <div
                className="lg:hidden mt-8 mb-4 p-5 rounded-xl flex items-center justify-between"
                style={{
                  background: "rgba(201,168,76,0.04)",
                  border: "1px solid rgba(201,168,76,0.12)",
                }}
              >
                <p
                  className="text-[12px]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
                >
                  Questions about your privacy?
                </p>
                <Link
                  href="https://agclassics.com/contact"
                  className="inline-flex items-center gap-2 text-[12px] font-medium transition-colors duration-200"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
                >
                  <Mail style={{ width: 12, height: 12 }} />
                  Contact us →
                </Link>
              </div>

              {/* Bottom ornament */}
              <div className="flex items-center justify-center gap-[14px] pt-10 pb-16">
                <div className="w-[60px] h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
                <div className="w-[5px] h-[5px] rotate-45" style={{ background: "#8a6f2e" }} />
                <div className="w-[60px] h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
              </div>
            </main>

          </div>
        </div>
      </div>
    </>
  );
}