"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  User,
  BookOpen,
  Copyright,
  CreditCard,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  Shield,
  Globe,
  Scale,
  RefreshCw,
  Mail,
  Download,
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

  .anim-fade-0  { animation: fadeUp 0.9s ease 0.0s both; }
  .anim-fade-2  { animation: fadeUp 0.9s ease 0.2s both; }
  .anim-fade-5  { animation: fadeUp 0.9s ease 0.5s both; }

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

  .ornament-line::before,
  .ornament-line::after {
    content: '';
    display: block;
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(201,168,76,0.25));
  }
  .ornament-line::after {
    background: linear-gradient(to left, transparent, rgba(201,168,76,0.25));
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0b; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }

  .gold-dot { animation: pulse-gold 2.5s ease infinite; }
`;

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    number: "01",
    title: "Acceptance of Terms",
    content:
      "By accessing or using AG Classics, you confirm that you are at least 18 years old, or have the legal capacity to enter into this agreement. If you are using the platform on behalf of an organization, you represent that you are authorized to bind that organization to these Terms. Continued use of agclassics.com constitutes your acceptance of these Terms in full.",
  },
  {
    id: "services",
    icon: Briefcase,
    number: "02",
    title: "Services Provided",
    content:
      "AG Classics is a digital platform offering curated eBooks spanning all genres — from classic literature and philosophy to business, finance, and self-development. Our catalog is built around public domain works and licensed titles, thoughtfully selected for readers who value enduring ideas.",
    list: [
      "Browse and purchase eBooks across all genres",
      "Instant digital download upon successful payment",
      "Access to curated public domain collections",
      "Subscription-based or one-time purchase options (where available)",
      "Reading recommendations and genre-based discovery",
    ],
  },
  {
    id: "responsibilities",
    icon: User,
    number: "03",
    title: "User Responsibilities",
    content: "As a reader and member of AG Classics, you agree to:",
    list: [
      "Provide accurate, complete, and current information during registration or purchase.",
      "Keep your account credentials confidential and notify us promptly of any unauthorized access.",
      "Use the platform strictly for lawful, personal, and non-commercial purposes.",
      "Not reproduce, redistribute, resell, or share purchased eBooks without explicit written permission.",
      "Not attempt to reverse-engineer, scrape, or otherwise exploit the platform's content or infrastructure.",
    ],
  },
  {
    id: "ebooks",
    icon: BookOpen,
    number: "04",
    title: "eBooks & Digital Content",
    content: null,
    subsections: [
      {
        label: "Delivery",
        text: "Upon successful payment, your eBook will be available for immediate download. You will also receive a confirmation email with a download link. If you experience issues, please contact our support team.",
      },
      {
        label: "Format & Compatibility",
        text: "Our eBooks are provided in widely supported formats (PDF, EPUB, or MOBI) compatible with all major devices including smartphones, tablets, desktops, and dedicated e-readers.",
      },
      {
        label: "Personal Use License",
        text: "Purchase grants you a non-transferable, non-exclusive license for personal reading only. You may not share, resell, or commercially exploit the content. Ownership of the underlying intellectual property remains with the respective rights holders.",
      },
      {
        label: "Public Domain Titles",
        text: "Many titles in our catalog are public domain works. While the underlying text may be freely available, our editions may include original formatting, cover design, or editorial curation that is proprietary to AG Classics.",
      },
    ],
  },
  {
    id: "ip",
    icon: Copyright,
    number: "05",
    title: "Intellectual Property",
    content: null,
    subsections: [
      {
        label: "Platform Content",
        text: "All content on agclassics.com — including the website design, logos, typography, original cover art, editorial selections, and software — is owned by or licensed to AG Classics. You may not reproduce, modify, distribute, or commercially use our content without prior written consent.",
      },
      {
        label: "Third-Party Rights",
        text: "Non-public-domain titles are used under license from their respective copyright holders. Any unauthorized reproduction or distribution of these works may constitute copyright infringement and could expose you to legal liability.",
      },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    number: "06",
    title: "Payments & Fees",
    content: "All purchases on AG Classics are processed securely. By completing a payment, you agree to the following:",
    list: [
      "Pay the listed price for each title at the time of purchase.",
      "Provide accurate, valid payment information.",
      "Authorize AG Classics to charge your selected payment method.",
      "All transactions are processed via Razorpay — encrypted and secured.",
      "Prices are listed in Indian Rupees (₹) and may be updated at any time.",
      "Applicable taxes (e.g. GST) will be added where required by law.",
    ],
  },
  {
    id: "refunds",
    icon: ShoppingBag,
    number: "07",
    title: "Refunds & Cancellations",
    content: null,
    subsections: [
      {
        label: "Digital Products",
        text: "Due to the instant-delivery nature of digital content, all eBook sales are final and non-refundable once the download link has been accessed or the file has been downloaded.",
      },
      {
        label: "Exceptions",
        text: "If you were charged but did not receive your eBook, or if the file is corrupted or unreadable, please contact us within 7 days of purchase. We will investigate and provide a replacement or refund as appropriate.",
      },
      {
        label: "Duplicate Purchases",
        text: "If you accidentally purchased the same title twice, please reach out within 48 hours with proof of both transactions. Eligible duplicate charges will be refunded after verification.",
      },
    ],
  },
  {
    id: "termination",
    icon: XCircle,
    number: "08",
    title: "Termination",
    content:
      "We reserve the right to suspend or terminate your access to AG Classics at our sole discretion, without prior notice, if you violate these Terms or engage in conduct that is harmful to the platform, its users, or any third party. Upon termination:",
    list: [
      "Your access to the platform will cease immediately.",
      "Previously downloaded eBooks may remain accessible on your device, but no new downloads will be permitted.",
      "Any outstanding payment obligations remain due.",
      "Clauses relating to intellectual property, liability, and indemnification shall survive termination.",
    ],
  },
  {
    id: "liability",
    icon: AlertTriangle,
    number: "09",
    title: "Limitation of Liability",
    content:
      "To the fullest extent permitted by applicable law, AG Classics and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or its content. Our total liability for any claim shall not exceed the amount you paid in the 12 months preceding the claim. The platform and its content are provided on an \"as is\" and \"as available\" basis without warranties of any kind — express or implied.",
  },
  {
    id: "indemnification",
    icon: Shield,
    number: "10",
    title: "Indemnification",
    content:
      "You agree to indemnify, defend, and hold harmless AG Classics, its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, or expenses — including reasonable legal fees — arising out of your use of the platform, your violation of these Terms, or your infringement of any third-party rights.",
  },
  {
    id: "third-party",
    icon: Globe,
    number: "11",
    title: "Third-Party Links",
    content:
      "AG Classics may contain links to external websites or third-party services for your convenience. We have no control over, and accept no responsibility for, the content, privacy policies, or practices of any third-party sites. Visiting external links is entirely at your own risk.",
  },
  {
    id: "governing-law",
    icon: Scale,
    number: "12",
    title: "Governing Law & Disputes",
    content:
      "These Terms are governed by the laws of the Republic of India. Any disputes arising from or relating to these Terms or your use of AG Classics shall first be addressed through good-faith negotiation. If unresolved, disputes shall be submitted to the exclusive jurisdiction of the competent courts of India.",
  },
  {
    id: "changes",
    icon: RefreshCw,
    number: "13",
    title: "Changes to These Terms",
    content:
      "We may revise these Terms periodically to reflect changes in our practices, services, or applicable law. The updated Terms will be posted with a revised effective date. Your continued use of AG Classics following any such update constitutes your acceptance of the new Terms. We encourage you to review this page from time to time.",
  },
  {
    id: "contact",
    icon: Mail,
    number: "14",
    title: "Contact Us",
    content:
      "If you have any questions, concerns, or feedback regarding these Terms or your experience on AG Classics, we'd love to hear from you. Our team is happy to help clarify anything and will respond as promptly as possible.",
    cta: true,
  },
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");
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
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen mt-30" style={{ background: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}>

        {/* ══════════════════════════════════
            HERO BAND
        ══════════════════════════════════ */}
        <div style={{ background: "#0f0f10", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
            style={{
              background: "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />
          <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28" style={{ zIndex: 1 }}>

            {/* Eyebrow */}
            <div className="anim-fade-0 flex items-center gap-4 mb-6">
              <div className="w-[40px] h-px" style={{ background: "rgba(201,168,76,0.4)" }} />
              <span
                className="text-[10px] uppercase tracking-[5px]"
                style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}
              >
                Legal · Terms
              </span>
            </div>

            {/* Title */}
            <h1
              className="anim-fade-2 font-light leading-[0.9] tracking-tight mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(52px, 8vw, 100px)", color: "#f5f0e8" }}
            >
              Terms &<br />
              <em className="italic" style={{ color: "#c9a84c" }}>Conditions</em>
            </h1>

            {/* Meta row */}
            <div className="anim-fade-5 flex flex-col sm:flex-row sm:items-center gap-5 mt-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px]"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  border: "1px solid rgba(201,168,76,0.2)",
                  color: "#8a8790",
                  background: "rgba(201,168,76,0.04)",
                }}
              >
                <span className="gold-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#c9a84c" }} />
                Effective: September 6, 2025
              </div>
              <p
                className="text-sm max-w-md leading-relaxed"
                style={{ fontFamily: "'Jost', sans-serif", color: "white" }}
              >
                These Terms govern your use of{" "}
                <span style={{ color: "#8a8790" }}>agclassics.com</span> and all
                services provided by AG Classics. Please read them carefully before
                exploring our collection.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            ORNAMENT DIVIDER
        ══════════════════════════════════ */}
        <div className="ornament-line flex items-center gap-4 px-6 py-0" style={{ height: 1 }}>
          <div className="w-[6px] h-[6px] rotate-45 mx-auto shrink-0" style={{ background: "#8a6f2e" }} />
        </div>

        {/* ══════════════════════════════════
            TWO-COLUMN LAYOUT
        ══════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-14 py-16">

            {/* ── LEFT: Sticky Nav ── */}
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
                    Questions about these terms?
                  </p>
                  <Link
                    href="https://agclassics.com/contact"
                    className="inline-flex items-center gap-2 text-[11px] font-medium transition-colors duration-200"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
                  >
                    <Mail style={{ width: 12, height: 12 }} />
                    Contact us →
                  </Link>
                </div>
              </div>
            </aside>

            {/* ── RIGHT: Content ── */}
            <main className="flex-1 min-w-0">
              <div>
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <section
                      key={section.id}
                      id={section.id}
                      className="section-card py-10 scroll-mt-8 first:pt-0"
                    >
                      {/* Section header */}
                      <div className="flex items-start gap-4 mb-7">
                        <div
                          className="mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: "rgba(201,168,76,0.08)",
                            border: "1px solid rgba(201,168,76,0.15)",
                          }}
                        >
                          <Icon
                            style={{ width: 15, height: 15, color: "#c9a84c" }}
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
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 2.5vw, 26px)", color: "#c9a84c" }}
                          >
                            {section.title}
                          </h2>
                        </div>
                      </div>

                      {/* Body text */}
                      {section.content && (
                        <p
                          className="text-[14px] leading-[1.95] mb-6"
                          style={{ fontFamily: "'Jost', sans-serif", color: "#ffffff", paddingLeft: "56px" }}
                        >
                          {section.content}
                        </p>
                      )}

                      {/* Subsections */}
                      {section.subsections && (
                        <div className="space-y-3 mb-6" style={{ paddingLeft: "56px" }}>
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

                      {/* List */}
                      {section.list && (
                        <ul className="space-y-3" style={{ paddingLeft: "56px" }}>
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

                      {/* CTA */}
                      {section.cta && (
                        <div
                          className="mt-8 flex flex-col sm:flex-row gap-3"
                          style={{ paddingLeft: "56px" }}
                        >
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
                    </section>
                  );
                })}
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