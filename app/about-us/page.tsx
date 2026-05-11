"use client";
import React, { useEffect, useRef } from "react";
import { Zap, MonitorSmartphone, BookMarked, ShieldCheck } from "lucide-react";


// ─── Types ────────────────────────────────────────────────────────────────────
interface StatItem {
  value: string;
  label: string;
}

interface ValueItem {
  icon: string;
  title: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats: StatItem[] = [
  { value: "12+", label: "Curated Titles" },
  { value: "10+", label: "Timeless Authors" },
  { value: "6+", label: "Genres Covered" },
  { value: "∞", label: "Ideas Waiting for You" },
];

const values: ValueItem[] = [
  {
    icon: "✦",
    title: "Curation Over Quantity",
    description:
      "We don't stock every book ever written. We hand-select titles that have stood the test of time works that shaped civilisations, changed minds, and outlived their authors.",
  },
  {
    icon: "◈",
    title: "Legacy Preservation",
    description:
      "Many great works fade into obscurity due to inaccessibility. We digitise, restore, and present them so future generations can discover the wisdom of the past.",
  },
  {
    icon: "⬡",
    title: "Accessibility First",
    description:
      "Instant Access, every device supported, lifetime availability. Great literature shouldn't be locked behind shipping costs or sold-out editions.",
  },
  {
    icon: "◉",
    title: "Intentional Reading",
    description:
      "We believe in reading with purpose. Each title in our library is chosen to provoke thought, build character, or sharpen the mind not merely to entertain.",
  },
];

const timeline = [
  {
    year: "The Spark",
    title: "A Frustration Becomes a Vision",
    desc: "Frustrated by the inaccessibility of timeless titles out of print, overpriced, or simply forgotten our founder began digitising rare works from personal collections.",
  },
  {
    year: "The Curation",
    title: "Hand-Picking Every Title",
    desc: "We spent months selecting only works that had genuinely stood the test of time not trending titles, but books that shaped empires, philosophies, and lives.",
  },
  {
    year: "The Build",
    title: "Designing the Library",
    desc: "We built a reading experience worthy of the books themselves clean, beautiful, compatible with every device, with instant access the moment you purchase.",
  },
  {
    year: "Today",
    title: "AG Classics is Live",
    desc: "We're open. 15+ curated titles spanning literature, philosophy, finance, strategy, and self-development ready for the readers who've been waiting.",
  },
  {
    year: "Next",
    title: "The Mission Continues",
    desc: "New titles added every month. Every lost masterpiece we recover is a small victory for the culture. We're just getting started.",
  },
];

const missionPillars = [
  {
    numeral: "I",
    heading: "Preserve",
    body: "No great book should be lost to neglect. We digitise, restore, and guard the written heritage of humanity.",
  },
  {
    numeral: "II",
    heading: "Democratise",
    body: "Price, geography, and time should never separate a reader from a text that might change their life.",
  },
  {
    numeral: "III",
    heading: "Endure",
    body: "We build for permanence — not trends. Every title in our library earns its place by the weight of its ideas.",
  },
];

// ─── Decorative Divider ───────────────────────────────────────────────────────
const GoldDivider = () => (
  <div className="flex items-center justify-center gap-3 my-2">
    <span className="block h-px w-16 bg-gradient-to-r from-transparent to-yellow-500/60" />
    <span className="text-yellow-500 text-xs">✦</span>
    <span className="block h-px w-16 bg-gradient-to-l from-transparent to-yellow-500/60" />
  </div>
);

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ text }: { text: string }) => (
  <p className="text-yellow-500/80 text-xs tracking-[0.3em] uppercase font-medium mb-3">
    {text}
  </p>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AboutUs: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: "#080808",
        color: "#e8e0d0",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* ── Inline CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&display=swap');

        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-title   { font-family: 'Cinzel', 'Times New Roman', serif; }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        .gold-text {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gold-border { border-color: rgba(201, 168, 76, 0.4); }

        .card-hover {
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          border-color: rgba(201, 168, 76, 0.6) !important;
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(201, 168, 76, 0.08);
        }

        .ticker-line {
          white-space: nowrap;
          animation: ticker 30s linear infinite;
          display: inline-block;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .grain-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }

        .timeline-line {
          background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.4), transparent);
        }

        /* ── Mission pillars ── */
        .mission-pillar {
          position: relative;
          transition: background 0.4s ease;
        }
        .mission-pillar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(201,168,76,0.06) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .mission-pillar:hover::before { opacity: 1; }

        .roman-numeral {
          font-family: 'Cinzel', 'Times New Roman', serif;
          background: linear-gradient(135deg, #D4AF37 0%, #FFDF73 50%, #AA771C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          user-select: none;
        }

        /* ── Classic cards ── */
        .classic-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          cursor: default;
        }
        .classic-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, rgba(201,168,76,0.8), transparent);
          transform: scaleY(0);
          transition: transform 0.4s ease;
        }
        .classic-card:hover::before { transform: scaleY(1); }
        .classic-card .excerpt-reveal {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.5s ease, opacity 0.4s ease;
        }
        .classic-card:hover .excerpt-reveal {
          max-height: 80px;
          opacity: 1;
        }
        .classic-card:hover {
          background: rgba(201,168,76,0.04) !important;
        }

        /* ── Mission big text ── */
        .mission-statement-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .mission-statement-word.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Mobile: disable hover transforms to prevent layout jumps ── */
        @media (max-width: 640px) {
          .card-hover:hover {
            transform: none;
          }
        }
      `}</style>

      {/* ─── Ticker Bar ──────────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden py-2 border-b"
        style={{
          background: "rgba(201,168,76,0.07)",
          borderColor: "rgba(201,168,76,0.2)",
        }}
      >
        <div className="ticker-line text-yellow-500/70 text-xs tracking-widest">
          {Array(4)
            .fill(
              "✦ Curated Digital Library &nbsp;&nbsp;&nbsp; ✦ Timeless Literature &nbsp;&nbsp;&nbsp; ✦ Instant Access &nbsp;&nbsp;&nbsp; ✦ Read Anywhere &nbsp;&nbsp;&nbsp; ✦ 15+ Titles &nbsp;&nbsp;&nbsp; ✦ Lifetime Access &nbsp;&nbsp;&nbsp; "
            )
            .join("")}
        </div>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-5 pt-20 md:py-32 overflow-hidden grain-overlay"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%), #080808",
          minHeight: "55vh",
        }}
      >
        {/* Decorative quotes — hidden on very small screens to avoid overflow */}
        <span className="hidden sm:block absolute top-8 left-8 text-yellow-500/20 font-title text-4xl select-none" aria-hidden>❝</span>
        <span className="hidden sm:block absolute bottom-8 right-8 text-yellow-500/20 font-title text-4xl select-none" aria-hidden>❞</span>

        <div className="reveal max-w-4xl mx-auto w-full">
          <SectionLabel text="About AG Classics" />
          <GoldDivider />
          {/* Stepped font sizes: smaller on mobile, larger on wider screens */}
          <h1
            className="font-display text-[2.4rem] sm:text-5xl md:text-7xl lg:text-8xl font-light mt-6 mb-6"
            style={{ lineHeight: 1.1 }}
          >
            Guardians of{" "}
            <em className="gold-text font-light not-italic">Timeless Words</em>
          </h1>
          <p
            className="font-display text-base sm:text-lg md:text-xl text-stone-200 max-w-2xl mx-auto leading-relaxed mt-8"
            style={{ fontWeight: 300 }}
          >
            AG Classics is India's foremost curated digital library built not for browsers, but for{" "}
            <em className="text-yellow-400/80">intentional readers</em> who believe the greatest ideas in history deserve a permanent home.
          </p>
          <GoldDivider />
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.03)" }}
      >
        <div className="max-w-5xl mx-auto px-5 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1}`}>
              <p className="gold-text font-display text-4xl md:text-5xl font-light">{s.value}</p>
              <p className="text-stone-500 text-xs tracking-widest uppercase mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Our Story ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-28 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="reveal">
          <SectionLabel text="Our Story" />
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light leading-tight mt-2 mb-6">
            Born from a{" "}<em className="gold-text not-italic">love of lost books</em>
          </h2>
          <div className="space-y-4 md:space-y-5 text-stone-100 font-display text-base md:text-lg leading-relaxed" style={{ fontWeight: 300 }}>
            <p>It started with a single frustration: a beloved title, out of print, unavailable on any platform, slowly vanishing from cultural memory. Our founder believed that was unacceptable.</p>
            <p>AG Classics was founded on a conviction that the world's most important books deserve a permanent, accessible digital home. Not just bestsellers or trending titles, but the quiet masterpieces that shaped business empires, philosophical movements, and personal transformations.</p>
            <p>AG Classics is just beginning its journey launching with a hand-curated library of{" "}<span className="text-yellow-400/80">15+ titles</span>{" "}spanning literature, philosophy, finance, strategy, and self-development. We're building this for readers who refuse to let great ideas disappear.</p>
          </div>
        </div>

        {/* Blockquote card — clamp the decorative quote mark so it never bleeds */}
        <div
          className="reveal reveal-delay-2 relative p-8 md:p-10 border grain-overlay overflow-hidden"
          style={{ borderColor: "rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.03)", borderRadius: "2px" }}
        >
          <span className="gold-text font-display text-7xl md:text-8xl leading-none absolute -top-3 left-5 select-none" aria-hidden>"</span>
          <blockquote className="font-display text-xl sm:text-2xl md:text-3xl font-light leading-snug text-stone-200 mt-10 md:mt-8">
            Every book read is a step ahead in the art of understanding life.
          </blockquote>
          <footer className="mt-6 md:mt-8 flex items-center gap-3">
            <span className="block h-px w-12" style={{ background: "rgba(201,168,76,0.5)" }} />
            <span className="text-yellow-500/70 text-sm tracking-widest uppercase font-medium">Sun Tzu</span>
          </footer>
          <span className="absolute bottom-4 right-6 text-yellow-500/10 font-display text-6xl leading-none select-none" aria-hidden>"</span>
        </div>
      </section>

      {/* ─── Our Mission ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-0"
        style={{
          background: "linear-gradient(180deg, #080808 0%, #0d0b07 50%, #080808 100%)",
        }}
      >
        {/* Top rule */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

        {/* Massive background text — scales via vw so safe on all widths */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="font-title leading-none"
            style={{
              fontSize: "clamp(5rem, 18vw, 18rem)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(201,168,76,0.04)",
              letterSpacing: "-0.02em",
            }}
          >
            MISSION
          </span>
        </div>

        {/* Header */}
        <div className="relative z-10 text-center pt-16 md:pt-24 pb-10 md:pb-16 px-5 reveal">
          <SectionLabel text="Our Mission" />
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mt-4 leading-tight">
            Preserving the{" "}
            <em className="gold-text not-italic">legacy</em>
            <br />
            <span style={{ color: "#a09080" }}>of human thought</span>
          </h2>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="block h-px flex-1 max-w-16 sm:max-w-24" style={{ background: "rgba(201,168,76,0.3)" }} />
            <span className="text-yellow-600 text-[10px] tracking-[0.3em] sm:tracking-[0.5em] uppercase font-title">Est. for Eternity</span>
            <span className="block h-px flex-1 max-w-16 sm:max-w-24" style={{ background: "rgba(201,168,76,0.3)" }} />
          </div>
        </div>

        {/* Three Pillars — stack on mobile, 3-col on md+ */}
        <div
          className="relative z-10 max-w-6xl mx-auto px-0 sm:px-5 md:px-6 pb-6 grid md:grid-cols-3 border-t border-b"
          style={{ borderColor: "rgba(201,168,76,0.15)" }}
        >
          {missionPillars.map((pillar, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} mission-pillar px-6 sm:px-8 md:px-10 py-10 md:py-12 ${
                i < missionPillars.length - 1 ? "border-b md:border-b-0 md:border-r" : ""
              }`}
              style={{ borderColor: "rgba(201,168,76,0.15)" }}
            >
              <div className="roman-numeral font-title text-6xl md:text-7xl mb-4">{pillar.numeral}</div>
              <h3 className="font-title text-base tracking-[0.2em] uppercase gold-text mb-4">{pillar.heading}</h3>
              <div className="w-8 h-px mb-5" style={{ background: "rgba(201,168,76,0.4)" }} />
              <p className="font-display text-stone-300 text-base md:text-lg leading-relaxed" style={{ fontWeight: 300 }}>
                {pillar.body}
              </p>
            </div>
          ))}
        </div>

        {/* Full-width Mission Statement */}
        <div className="relative z-10 max-w-4xl mx-auto px-5 py-14 md:py-20 text-center reveal">
          <p
            className="font-display text-lg sm:text-xl md:text-2xl leading-loose"
            style={{ fontWeight: 300, color: "#c9a84c", letterSpacing: "0.01em" }}
          >
            We exist at the intersection of{" "}
            <span style={{ color: "#e8d8b0" }}>preservation</span> and{" "}
            <span style={{ color: "#e8d8b0" }}>discovery</span>. Our mission is to ensure that no
            great book is lost to neglect, no transformative idea fades from reach, and no reader
            is ever separated from the text that might{" "}
            <em
              className="font-display"
              style={{
                color: "transparent",
                background: "linear-gradient(135deg, #c9a84c, #f0d080, #c9a84c)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                fontStyle: "italic",
              }}
            >
              change their life
            </em>{" "}
            — by price, geography, or time.
          </p>
        </div>

        {/* Bottom rule */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />
      </section>


      {/* ─── Values Grid ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14 reveal">
          <SectionLabel text="What We Stand For" />
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mt-2">
            Our <em className="gold-text not-italic">Core Values</em>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${(i % 4) + 1} card-hover p-6 md:p-8 border`}
              style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(255,255,255,0.015)", borderRadius: "2px" }}
            >
              <span className="gold-text font-display text-3xl">{v.icon}</span>
              <h3 className="font-title text-sm tracking-widest text-stone-100 mt-4 mb-3 uppercase">{v.title}</h3>
              <p className="font-display gold-text text-base md:text-lg leading-relaxed" style={{ fontWeight: 300 }}>
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* ─── Timeless Classics ────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#060604" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 pt-16 md:pt-24 pb-8">
          {/* Section header */}
          <div className="reveal text-center mb-12 md:mb-16">
            <SectionLabel text="Our Philosophy" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mt-2 mb-6">
              Timeless <em className="gold-text not-italic">Classics</em>
            </h2>
            <p className="font-display text-stone-100 text-base md:text-lg max-w-2xl mx-auto" style={{ fontWeight: 300 }}>
              Discover the literature that defies time. We curate and provide the profound, enduring works that have outlived their authors to shape modern philosophy, society, and storytelling.
            </p>
          </div>

          {/* Grid of informational cards
              Mobile: single column, no outer left border (cards have their own bottom + right)
              md+: 3-col with outer border-t and border-l restored */}
          <div
            className="grid md:grid-cols-3 md:border-t md:border-l"
            style={{ borderColor: "rgba(201,168,76,0.12)" }}
          >
            {[
              {
                numeral: "I",
                title: "Enduring Masterpieces",
                body: "We meticulously source works that have stood the ultimate test of time. Every title in our shop represents a pinnacle of human thought that remains as relevant today as the day it was written.",
              },
              {
                numeral: "II",
                title: "Heirloom Quality",
                body: "Timeless words deserve a timeless vessel. We offer beautiful, high-quality editions crafted to be cherished, read, and passed down through generations in your personal library.",
              },
              {
                numeral: "III",
                title: "A Library of Eras",
                body: "From ancient philosophical treatises to sweeping Victorian epics, our collection spans centuries, offering you the rare opportunity to own the ideas that built civilizations.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${i + 1} classic-card border-b md:border-r p-8 md:p-10 lg:p-12 flex flex-col justify-center text-center`}
                style={{
                  borderColor: "rgba(201,168,76,0.12)",
                  background: "transparent",
                  /* On mobile, add a top border since outer border-t is removed */
                }}
              >
                <span
                  className="font-title text-sm tracking-[0.35em] mb-4 block"
                  style={{ color: "rgba(201,168,76,0.4)" }}
                >
                  {card.numeral}
                </span>
                <h3 className="gold-text font-display text-2xl md:text-2xl lg:text-3xl font-light leading-tight mb-6">
                  {card.title}
                </h3>
                <div className="w-12 h-px mx-auto mb-6" style={{ background: "rgba(201,168,76,0.2)" }} />
                <p className="font-display text-stone-200 text-sm sm:text-base leading-relaxed" style={{ fontWeight: 500 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA ribbon */}
        <div className="relative z-10 text-center py-10 px-5 reveal">
          <p className="font-display text-stone-200 text-base md:text-lg mb-6" style={{ fontWeight: 300 }}>
            Ready to claim your piece of literary history?
          </p>
          <a
            href="/category/classics"
            className="inline-block font-title text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase px-8 sm:px-10 py-3 border transition-all duration-300"
            style={{ borderColor: "rgba(201,168,76,0.35)", color: "#c9a84c" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.08)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.7)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.35)";
            }}
          >
            Shop The Classics Collection
          </a>
        </div>
      </section>


      {/* ─── Timeline ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-14 md:py-24">
        <div className="text-center mb-12 md:mb-16 reveal">
          <SectionLabel text="Our Journey" />
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mt-2">
            A <em className="gold-text not-italic">Chronicle</em> of Curation
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line — always on the left on mobile, centred on md+ */}
          <div
            className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px timeline-line"
            style={{ transform: "translateX(-50%)" }}
          />

          <div className="space-y-8 md:space-y-10">
            {timeline.map((item, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${(i % 4) + 1} relative flex items-start gap-6 md:gap-8 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Centre dot — only visible on md+ */}
                <div
                  className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 z-10"
                  style={{ borderColor: "rgba(201,168,76,0.7)", background: "#080808", top: "0.4rem" }}
                />

                {/* Left-side dot visible on mobile */}
                <div
                  className="md:hidden flex-shrink-0 w-3 h-3 rounded-full border-2 mt-1.5 z-10 relative"
                  style={{ borderColor: "rgba(201,168,76,0.7)", background: "#080808", marginLeft: "0.45rem" }}
                />

                {/* Content — full width on mobile, half width on md+ */}
                <div
                  className={`flex-1 md:w-5/12 md:flex-none pl-4 md:pl-0 ${
                    i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"
                  }`}
                >
                  <span className="gold-text font-title text-xs tracking-widest">{item.year}</span>
                  <h3 className="font-display text-xl sm:text-2xl gold-text mt-1 mb-2">{item.title}</h3>
                  <p className="font-display text-stone-100 text-sm sm:text-base leading-relaxed" style={{ fontWeight: 300 }}>
                    {item.desc}
                  </p>
                </div>

                {/* Spacer for alternating layout on md+ */}
                <div className="hidden md:block md:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Row ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-14 md:py-24">
        <div className="text-center mb-10 md:mb-14 reveal">
          <SectionLabel text="Why AG Classics" />
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mt-2">
            Built for the{" "}<em className="gold-text not-italic">Thoughtful Reader</em>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            {
              icon: <Zap size={26} strokeWidth={1.5} />,
              title: "Instant Access",
              body: "Start reading within seconds of purchase. No waiting.",
            },
            {
              icon: <MonitorSmartphone size={26} strokeWidth={1.5} />,
              title: "Every Device",
              body: "Phone, tablet, desktop, or e-reader — your library travels with you.",
            },
            {
              icon: <BookMarked size={26} strokeWidth={1.5} />,
              title: "Lifetime Ownership",
              body: "Once purchased, the book is yours. No subscriptions required.",
            },
            {
              icon: <ShieldCheck size={26} strokeWidth={1.5} />,
              title: "Secure Payments",
              body: "Encrypted checkout via Razorpay. 100% safe transactions guaranteed.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} p-5 md:p-6 border text-center card-hover`}
              style={{
                borderColor: "rgba(201,168,76,0.15)",
                background: "rgba(255,255,255,0.015)",
                borderRadius: "2px",
              }}
            >
              <span
                className="flex items-center justify-center mb-3 md:mb-4"
                style={{ color: "rgba(201,168,76,0.75)" }}
              >
                {feat.icon}
              </span>
              <h3 className="font-title text-[0.6rem] sm:text-xs tracking-widest gold-text uppercase mb-2 md:mb-3">
                {feat.title}
              </h3>
              <p
                className="font-display text-stone-100 text-xs sm:text-sm md:text-base leading-relaxed"
                style={{ fontWeight: 300 }}
              >
                {feat.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-28 px-5 text-center relative overflow-hidden grain-overlay"
        style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)" }}
      >
        <div className="reveal max-w-2xl mx-auto">
          <GoldDivider />
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mt-6 mb-5">
            Begin your{" "}<em className="gold-text not-italic">reading journey</em>
          </h2>
          <p className="font-display text-stone-400 text-base md:text-lg leading-relaxed mb-8 md:mb-10" style={{ fontWeight: 300 }}>
            15+ titles. Instant access. A lifetime of wisdom waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/subscriptions"
              className="inline-block px-8 sm:px-10 py-3.5 text-sm tracking-widest uppercase font-title border transition-all duration-300"
              style={{ borderColor: "rgba(201,168,76,0.4)", color: "#c9a84c", borderRadius: "1px", letterSpacing: "0.15em" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.9)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.4)";
              }}
            >
              View Subscriptions
            </a>
          </div>
          <GoldDivider />
        </div>
      </section>
    </div>
  );
};

export default AboutUs;