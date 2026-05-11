"use client";
import React, { useEffect, useRef } from "react";

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
      "We don't stock every book ever written. We hand-select titles that have stood the test of time — works that shaped civilisations, changed minds, and outlived their authors.",
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
      "We believe in reading with purpose. Each title in our library is chosen to provoke thought, build character, or sharpen the mind — not merely to entertain.",
  },
];

const timeline = [
  {
    year: "The Spark",
    title: "A Frustration Becomes a Vision",
    desc: "Frustrated by the inaccessibility of timeless titles — out of print, overpriced, or simply forgotten — our founder began digitising rare works from personal collections.",
  },
  {
    year: "The Curation",
    title: "Hand-Picking Every Title",
    desc: "We spent months selecting only works that had genuinely stood the test of time — not trending titles, but books that shaped empires, philosophies, and lives.",
  },
  {
    year: "The Build",
    title: "Designing the Library",
    desc: "We built a reading experience worthy of the books themselves — clean, beautiful, compatible with every device, with instant access the moment you purchase.",
  },
  {
    year: "Today",
    title: "AG Classics is Live",
    desc: "We're open. 15+ curated titles spanning literature, philosophy, finance, strategy, and self-development — ready for the readers who've been waiting.",
  },
  {
    year: "Next",
    title: "The Mission Continues",
    desc: "New titles added every month. Every lost masterpiece we recover is a small victory for the culture. We're just getting started.",
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
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "#080808",
        color: "#e8e0d0",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* ── Inline CSS for animations ──────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&display=swap');

        * { box-sizing: border-box; }

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
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden grain-overlay"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%), #080808",
          minHeight: "80vh",
        }}
      >
        {/* decorative corner marks */}
        <span
          className="absolute top-8 left-8 text-yellow-500/20 font-title text-4xl select-none"
          aria-hidden
        >
          ❝
        </span>
        <span
          className="absolute bottom-8 right-8 text-yellow-500/20 font-title text-4xl select-none"
          aria-hidden
        >
          ❞
        </span>

        <div className="reveal max-w-4xl mx-auto">
          <SectionLabel text="About AG Classics" />
          <GoldDivider />

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-tight mt-6 mb-6"
            style={{ lineHeight: 1.1 }}
          >
            Guardians of{" "}
            <em className="gold-text font-light not-italic">Timeless Words</em>
          </h1>

          <p
            className="font-display text-lg md:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed mt-8"
            style={{ fontWeight: 300 }}
          >
            AG Classics is India's foremost curated digital library — built not
            for browsers, but for{" "}
            <em className="text-yellow-400/80">intentional readers</em> who
            believe the greatest ideas in history deserve a permanent home.
          </p>

          <GoldDivider />
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{
          borderColor: "rgba(201,168,76,0.2)",
          background: "rgba(201,168,76,0.03)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1}`}
            >
              <p className="gold-text font-display text-4xl md:text-5xl font-light">
                {s.value}
              </p>
              <p className="text-stone-500 text-xs tracking-widest uppercase mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Our Story ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
        {/* text */}
        <div className="reveal">
          <SectionLabel text="Our Story" />
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mt-2 mb-6">
            Born from a{" "}
            <em className="gold-text not-italic">love of lost books</em>
          </h2>
          <div
            className="space-y-5 text-stone-400 font-display text-lg leading-relaxed"
            style={{ fontWeight: 300 }}
          >
            <p>
              It started with a single frustration: a beloved title, out of
              print, unavailable on any platform, slowly vanishing from cultural
              memory. Our founder believed that was unacceptable.
            </p>
            <p>
              AG Classics was founded on a conviction — that the world's most
              important books deserve a permanent, accessible digital home. Not
              just bestsellers or trending titles, but the quiet masterpieces
              that shaped business empires, philosophical movements, and
              personal transformations.
            </p>
            <p>
              AG Classics is just beginning its journey — launching with a
              hand-curated library of{" "}
              <span className="text-yellow-400/80">15+ titles</span> spanning
              literature, philosophy, finance, strategy, and self-development.
              We're building this for readers who refuse to let great ideas
              disappear.
            </p>
          </div>
        </div>

        {/* decorative quote block */}
        <div
          className="reveal reveal-delay-2 relative p-10 border grain-overlay"
          style={{
            borderColor: "rgba(201,168,76,0.25)",
            background: "rgba(201,168,76,0.03)",
            borderRadius: "2px",
          }}
        >
          <span className="gold-text font-display text-8xl leading-none absolute -top-5 left-6">
            "
          </span>
          <blockquote
            className="font-display text-2xl md:text-3xl font-light leading-snug text-stone-200 mt-8"
          >
            Every book read is a step ahead in the art of understanding life.
          </blockquote>
          <footer className="mt-8 flex items-center gap-3">
            <span
              className="block h-px w-12"
              style={{ background: "rgba(201,168,76,0.5)" }}
            />
            <span className="text-yellow-500/70 text-sm tracking-widest uppercase font-medium">
              Sun Tzu
            </span>
          </footer>
          {/* corner ornament */}
          <span
            className="absolute bottom-4 right-6 text-yellow-500/10 font-display text-6xl leading-none select-none"
          >
            "
          </span>
        </div>
      </section>

      {/* ─── Mission ──────────────────────────────────────────────────────────── */}
      <section
        className="py-24 text-center px-6"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.04) 50%, transparent 100%)",
        }}
      >
        <div className="reveal max-w-3xl mx-auto">
          <SectionLabel text="Our Mission" />
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mt-3 mb-8">
            Preserving the{" "}
            <em className="gold-text not-italic">legacy of human thought</em>
          </h2>
          <p
            className="font-display text-xl text-stone-400 leading-relaxed"
            style={{ fontWeight: 300 }}
          >
            We exist at the intersection of preservation and discovery. Our
            mission is to ensure that no great book is lost to neglect, no
            transformative idea fades from reach, and no reader is separated
            from the text that might change their life — by price, geography, or
            time.
          </p>
        </div>
      </section>

      {/* ─── Values Grid ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14 reveal">
          <SectionLabel text="What We Stand For" />
          <h2 className="font-display text-4xl md:text-5xl font-light mt-2">
            Our <em className="gold-text not-italic">Core Values</em>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${(i % 4) + 1} card-hover p-8 border`}
              style={{
                borderColor: "rgba(201,168,76,0.2)",
                background: "rgba(255,255,255,0.015)",
                borderRadius: "2px",
              }}
            >
              <span className="gold-text font-display text-3xl">{v.icon}</span>
              <h3 className="font-title text-base tracking-widest text-stone-100 mt-4 mb-3 uppercase">
                {v.title}
              </h3>
              <p
                className="font-display text-stone-400 text-lg leading-relaxed"
                style={{ fontWeight: 300 }}
              >
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Timeline ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16 reveal">
          <SectionLabel text="Our Journey" />
          <h2 className="font-display text-4xl md:text-5xl font-light mt-2">
            A <em className="gold-text not-italic">Chronicle</em> of Curation
          </h2>
        </div>

        <div className="relative">
          {/* vertical line */}
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px timeline-line"
            style={{ transform: "translateX(-50%)" }}
          />

          <div className="space-y-10">
            {timeline.map((item, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${(i % 4) + 1} relative flex items-start gap-8 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* dot */}
                <div
                  className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 z-10"
                  style={{
                    borderColor: "rgba(201,168,76,0.7)",
                    background: "#080808",
                    top: "0.4rem",
                  }}
                />
                {/* mobile dot */}
                <div
                  className="md:hidden flex-shrink-0 w-3 h-3 rounded-full border-2 mt-1.5"
                  style={{
                    borderColor: "rgba(201,168,76,0.7)",
                    background: "#080808",
                  }}
                />

                <div
                  className={`md:w-5/12 pl-8 md:pl-0 ${
                    i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"
                  }`}
                >
                  <span className="gold-text font-title text-xs tracking-widest">
                    {item.year}
                  </span>
                  <h3 className="font-display text-xl text-stone-100 mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p
                    className="font-display text-stone-500 leading-relaxed"
                    style={{ fontWeight: 300 }}
                  >
                    {item.desc}
                  </p>
                </div>

                {/* spacer for opposite side */}
                <div className="hidden md:block md:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Row ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14 reveal">
          <SectionLabel text="Why AG Classics" />
          <h2 className="font-display text-4xl md:text-5xl font-light mt-2">
            Built for the{" "}
            <em className="gold-text not-italic">Thoughtful Reader</em>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: "⚡",
              title: "Instant Access",
              body: "Start reading within seconds of purchase. No waiting.",
            },
            {
              icon: "📱",
              title: "Every Device",
              body: "Phone, tablet, desktop, or e-reader — your library travels with you.",
            },
            {
              icon: "∞",
              title: "Lifetime Ownership",
              body: "Once purchased, the book is yours. No subscriptions required for owned titles.",
            },
            {
              icon: "🔐",
              title: "Secure Payments",
              body: "Encrypted checkout via Razorpay. 100% safe transactions guaranteed.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} p-6 border text-center card-hover`}
              style={{
                borderColor: "rgba(201,168,76,0.15)",
                background: "rgba(255,255,255,0.015)",
                borderRadius: "2px",
              }}
            >
              <span className="text-3xl block mb-4">{feat.icon}</span>
              <h3 className="font-title text-xs tracking-widest text-stone-200 uppercase mb-3">
                {feat.title}
              </h3>
              <p
                className="font-display text-stone-500 text-base leading-relaxed"
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
        className="py-28 px-6 text-center relative overflow-hidden grain-overlay"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
        }}
      >
        <div className="reveal max-w-2xl mx-auto">
          <GoldDivider />
          <h2 className="font-display text-4xl md:text-5xl font-light mt-6 mb-5">
            Begin your{" "}
            <em className="gold-text not-italic">reading journey</em>
          </h2>
          <p
            className="font-display text-stone-400 text-lg leading-relaxed mb-10"
            style={{ fontWeight: 300 }}
          >
            15+ titles. Instant access. A lifetime of wisdom waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/ebooks"
              className="inline-block px-10 py-3.5 text-sm tracking-widest uppercase font-title transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)",
                color: "#080808",
                borderRadius: "1px",
                letterSpacing: "0.15em",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
              }
            >
              Explore Library
            </a>
            <a
              href="/subscriptions"
              className="inline-block px-10 py-3.5 text-sm tracking-widest uppercase font-title border transition-all duration-300"
              style={{
                borderColor: "rgba(201,168,76,0.4)",
                color: "#c9a84c",
                borderRadius: "1px",
                letterSpacing: "0.15em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(201,168,76,0.9)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(201,168,76,0.4)";
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