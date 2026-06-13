// ─────────────────────────────────────────────────────────────────────
//  AG Classics  Blog: "The Art of War: Summary & Core Lessons"
//  Drop into your Next.js / React project. Requires: Tailwind CSS
// ─────────────────────────────────────────────────────────────────────

"use client";

import React, { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────

interface Lesson {
  rank: number;
  title: string;
  author: string;
  year: string;
  category: string;
  accent: string;
  description: string;
  coreIdea: string;
  whyRead: string;
  legacy: string;
}

// ─── Lesson Data ──────────────────────────────────────────────────────

const LESSONS: Lesson[] = [
  {
    rank: 1,
    title: "Win Without Fighting",
    author: "Sun Tzu",
    year: "5th Century BC",
    category: "Ultimate Strategy",
    accent: "#D4AF37",
    description:
      "Sun Tzu believed that actually fighting means your strategy has already failed. War destroys resources, drains your wealth, and guarantees pain even if you win. The smartest leaders maneuver their opponents into a spot where giving up or walking away is the only logical choice. This secures a win while keeping your own resources safe. Winning every battle is not the goal. The real goal is breaking the competition's resistance without ever throwing a punch.",
    coreIdea:
      "The supreme art of war is to subdue the enemy without fighting.",
    whyRead:
      "A price war is a slow battle where everyone just loses money. Actually fighting your competition head on is expensive and highly unpredictable.",
    legacy: "This is the core of Blue Ocean Strategy. It means creating a brand new market space or building a massive advantage before a costly battle even starts.",
  },
  {
    rank: 2,
    title: "Absolute Information",
    author: "Sun Tzu",
    year: "5th Century BC",
    category: "Intelligence & Auditing",
    accent: "#C0392B",
    description:
      "This might be the most famous lesson in the entire book. Sun Tzu explains that winning is all about having the right information. If you understand your own weaknesses just as well as your strengths, and you know exactly where your opponent is vulnerable, your victory is practically guaranteed. Ignoring either your own flaws or your enemy's moves will almost always lead to disaster.",
    coreIdea:
      "If you know the enemy and know yourself, you need not fear the result of a hundred battles.",
    whyRead:
      "Leaders usually fail because of ego or because they simply do not understand their market. Information is your most powerful weapon.",
    legacy: "This requires taking a brutally honest look at your own company while investing heavily in research to find out exactly where your rivals are weak.",
  },
  {
    rank: 3,
    title: "Preparation Precedes Victory",
    author: "Sun Tzu",
    year: "5th Century BC",
    category: "Calculation & Planning",
    accent: "#5B9BD5",
    description:
      "Battles are actually won in the planning room, not out on the field. Sun Tzu argues that a smart leader looks at every single detail before making a move. If the math points to a loss, a smart leader simply steps back and refuses to fight. Taking action without planning is just gambling with your hard earned resources.",
    coreIdea:
      "Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.",
    whyRead:
      "Hope is not a business strategy. If you are relying on pure hustle to save a product after it launches, you have already lost the upper hand.",
    legacy: "You have to figure out what your customers want, secure your funding, and build your audience long before you announce anything to the public.",
  },
  {
    rank: 4,
    title: "Formlessness & Fluidity",
    author: "Sun Tzu",
    year: "5th Century BC",
    category: "Adaptability",
    accent: "#4CAF8A",
    description:
      "Being stubborn will destroy you. Sun Tzu uses the idea of water to explain that your plans must constantly flow and shift. Just like water takes the shape of its container, you have to adjust to the situation in front of you. A great leader never sticks to a broken plan when reality changes. The ability to adapt instantly is the true mark of genius.",
    coreIdea:
      "Water shapes its course according to the nature of the ground; the soldier works out his victory in relation to the foe whom he is facing.",
    whyRead:
      "Strict five year business plans often become useless in just five months. Sticking to old ways of doing things when the world changes is a deadly mistake.",
    legacy: "This is the heart of modern agile business. Companies have to stay flexible and be willing to pivot their products the moment customer behavior changes.",
  },
  {
    rank: 5,
    title: "The Power of Deception",
    author: "Sun Tzu",
    year: "5th Century BC",
    category: "Information Control",
    accent: "#9B59B6",
    description:
      "To Sun Tzu, showing all your cards is a huge weakness. Controlling what people know forces your competition to make decisions based on illusions. By looking weak when you are actually strong, you can lead your rivals right into a trap. If your opponent has no idea what you are going to do next, they have to try to protect everything. And when they try to protect everything, they end up being strong nowhere.",
    coreIdea:
      "All warfare is based on deception. Hence, when we are able to attack, we must seem unable; when using our forces, we must appear inactive.",
    whyRead:
      "Announcing your big moves too early gives your competitors time to block them. Managing how people see you is just as important as running your daily operations.",
    legacy: "Think of how Apple keeps everything a massive secret before a big launch, or how startups work in stealth mode so bigger companies cannot steal their ideas.",
  },
  {
    rank: 6,
    title: "Speed and Timing",
    author: "Sun Tzu",
    year: "5th Century BC",
    category: "Execution & Momentum",
    accent: "#E67E22",
    description:
      "Even a small, scrappy team can beat a massive company if they move with overwhelming speed at the exact right time. Dragging things out just exhausts your people and drains your bank account. Sun Tzu teaches that once you decide to make a move, you have to execute it incredibly fast. Waiting around kills your momentum, and in business, momentum is everything.",
    coreIdea:
      "Let your rapidity be that of the wind... In raiding and plundering be like fire, in immovability like a mountain.",
    whyRead:
      "Trying to be perfect just slows you down. When an opportunity opens up, moving fast helps you overcome your weaknesses and disrupt much bigger competitors.",
    legacy: "This is all about the first mover advantage. Moving quickly is the greatest weapon a small startup has against giant, slow moving corporations.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min((window.scrollY / total) * 100, 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

// ─── Single Featured Image ────────────────────────────────────────────

function FeaturedImage() {
  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 mb-16">
      <div className="relative w-full overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-[rgba(201,168,76,0.15)]">
        <img
          src="https://brandongaille.com/wp-content/uploads/2020/02/the-art-of-war-summary-ft.jpg"
          alt="Abstract representation of strategy"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />
        <div className="absolute inset-0 bg-[rgba(201,168,76,0.08)] mix-blend-overlay" />
      </div>
      {/* Changed to H2 to establish the hierarchy for the 6 lessons beneath it */}
      <h2 className="text-center text-[9px] text-[#444] mt-4 tracking-[0.3em] uppercase select-none">
        The Six Stratagems
      </h2>
    </div>
  );
}

// ─── Lesson Card (Redesigned) ────────────────────────────────────────

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <article id={`lesson-${lesson.rank}`} className="relative scroll-mt-8">
      {/* Top accent rule */}
      <div
        className="h-px w-full"
        style={{ background: `linear-gradient(to right, ${lesson.accent}55, ${lesson.accent}15, transparent)` }}
      />

      <div className="py-12 lg:py-16">
        {/* Centered Content Container */}
        <div className="max-w-3xl mx-auto">
          
          {/* Category */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full" style={{ background: lesson.accent }} />
            <span
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-semibold"
              style={{ color: lesson.accent, opacity: 0.85 }}
            >
              {lesson.category}
            </span>
          </div>

          {/* Title - Changed to H3 to nest perfectly under the "The Six Stratagems" H2 */}
          <h3
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-[#f5f0e8]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {lesson.title}
          </h3>

          {/* Author · Year */}
          <div className="flex items-center flex-wrap gap-2 text-xs md:text-sm mb-8">
            <span className="text-[#e3e3e3]">{lesson.author}</span>
            <span className="w-1 h-1 rounded-full bg-[#af6f00]" />
            <span className="text-[#bdbdbd]">{lesson.year}</span>
          </div>

          {/* Description */}
          <p className="text-[#ffffff] leading-[1.95] text-[0.95rem] md:text-[1rem] mb-10">
            {lesson.description}
          </p>

          {/* Core Idea pull-quote */}
          <div
            className="pl-6 border-l-[3px] mb-12"
            style={{ borderColor: `${lesson.accent}80` }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#ffffff] mb-3 font-semibold opacity-60">
              The Maxim
            </p>
            <p
              className="text-xl sm:text-2xl md:text-3xl italic leading-relaxed font-light text-[#c9b87a]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              &ldquo;{lesson.coreIdea}&rdquo;
            </p>
          </div>

          {/* ── NEW: Unified Concept & Application Panel ── */}
          <div className="rounded-sm bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-transparent border border-[rgba(255,255,255,0.05)] p-6 md:p-10 relative overflow-hidden">
            {/* Subtle background glow */}
            <div 
              className="absolute -top-20 -right-20 w-48 h-48 blur-3xl opacity-20 pointer-events-none"
              style={{ background: lesson.accent }} 
            />

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
              {/* Desktop vertical divider */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)] -translate-x-1/2" />
              
              {/* Strategic Concept */}
              <div>
                {/* Changed from H4 to P to prevent 6 duplicate H4 headings on the page */}
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#c9b87a] mb-5 font-semibold flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rotate-45" style={{ background: lesson.accent }} />
                  Strategic Concept
                </p>
                <p className="text-[#d8d8d8] text-[0.925rem] leading-[1.8]">
                  {lesson.whyRead}
                </p>
              </div>

              {/* Mobile horizontal divider */}
              <div className="md:hidden w-full h-px bg-[rgba(255,255,255,0.06)]" />

              {/* Modern Application */}
              <div>
                {/* Changed from H4 to P to prevent 6 duplicate H4 headings on the page */}
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#c9b87a] mb-5 font-semibold flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full border border-current" style={{ color: lesson.accent }} />
                  Modern Application
                </p>
                <p className="text-[#a7a7a7] text-[0.925rem] leading-[1.8] italic">
                  {lesson.legacy}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────

export default function TheArtofWarSummaryandCoreLessons() {
  const progress = useReadingProgress();

  useEffect(() => {
    if (document.getElementById("ag-blog-fonts")) return;
    const link = document.createElement("link");
    link.id = "ag-blog-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600;1,700&family=Lato:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8dfc8] mt-30" style={{ fontFamily: "'Lato', sans-serif" }}>

      {/* ── Reading progress bar ─────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50">
        <div
          className="h-full transition-all duration-75"
          style={{ width: `${progress}%`, background: "linear-gradient(to right, #C9A227, #F0CC5A)" }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO                                                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-5 md:px-8">

        {/* Breadcrumb - Anchor text updated to be highly distinct */}
        <nav className="flex items-center gap-2 text-[11px] text-[#333] pt-10 tracking-wider">
          <a href="/" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Home</a>
          <span className="text-white">›</span>
          <a href="/blog" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Blog</a>
          <span className="text-white">›</span>
          <span className="text-white">The Art of War Summary</span>
        </nav>

        <header className="pt-10 pb-0">
          {/* Badge */}
          <div className="mb-6">
            <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227] border border-[#C9A227]/25 px-3 py-1.5 font-semibold">
              Strategy & Philosophy
            </span>
          </div>

          {/* Headline (H1 is correct) */}
          <h1
            className="text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.03] mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Art of War:{" "}
            <span className="italic text-[#C9A227]">Summary & Core Lessons</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[1.05rem] text-[#eeeeee] leading-relaxed mb-8 max-w-2xl" style={{ fontWeight: 300 }}>
            Written 2,500 years ago, Sun Tzu's ancient military guide is still the ultimate playbook for modern business strategy, staying ahead of the competition, and strong leadership.
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#444] tracking-wide">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center text-[#0a0a0a] font-black text-[9px] select-none">
                AG
              </div>
              <span className="text-white">AG Classics Editorial</span>
            </div>
            <span className="text-white">·</span>
            <span className="text-white">June 2026</span>
            <span className="text-white">·</span>
            <span className="text-white">8 min read</span>
          </div>

          {/* Ornamental divider */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
            <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════ */}
        {/*  INTRO                                               */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="mt-12 mb-12">
          {/* Added an H2 here so the structure goes seamlessly from the H1 into the body content */}
          <h2 className="sr-only">
            Introduction
          </h2>
          
          <blockquote className="border-l-2 border-[#C9A227]/50 pl-7 mb-10 mt-6">
            <p
              className="text-2xl md:text-3xl italic text-[#c9b87a] font-light leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              &ldquo;Strategy without tactics is the slowest route to victory. Tactics without strategy is the noise before defeat.&rdquo;
            </p>
            <cite className="block mt-3 text-[10px] tracking-[0.3em] text-[#d8d8d8] not-italic uppercase">
               Sun Tzu
            </cite>
          </blockquote>

          <p className="text-[#e8e8e8] leading-[1.95] mb-5 text-[0.925rem]">
            It is pretty amazing that a manual written for chariot commanders and infantry generals in the 5th century BC is now required reading in Silicon Valley boardrooms and Wall Street firms. But when you think about it, business is really just about managing limited resources in a highly competitive space, and that is exactly how war works.
          </p>
          <p className="text-[#e8e8e8] leading-[1.95] text-[0.925rem]">
            <em>The Art of War</em> breaks conflict down to its pure psychology and math. It teaches us that you do not win just by using brute force or working yourself to the bone. Instead, you win through smart positioning, having better information, and subtly managing what your opponent expects. Here are the 6 core lessons from Sun Tzu's masterpiece, translated for modern creators and leaders.
          </p>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  SINGLE FEATURED IMAGE                               */}
      {/* ══════════════════════════════════════════════════════ */}
      <FeaturedImage />

      {/* ══════════════════════════════════════════════════════ */}
      {/*  LESSON ENTRIES                                        */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        {LESSONS.map((lesson) => (
          <LessonCard key={lesson.rank} lesson={lesson} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  CONCLUSION                                            */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 mt-16 mb-24">

        <div className="flex items-center gap-3 mb-12">
          <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
          <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
          <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
        </div>

        <div className="border border-[#C9A227]/12 bg-[#0d0d0d] p-8 md:p-12">
          <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227]/50 font-semibold">
            Master the Source
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#f5f0e8] mt-3 mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Study The <span className="italic text-[#C9A227]">Art of War</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            A quick summary is a great way to learn the basics, but true mastery means reading the text for yourself. Sun Tzu keeps things short, which means every single sentence makes you stop and think. This is not a book you read just once. It is a guide you will want to keep on your desk for your entire career.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            You can add a beautiful physical edition or the digital eBook of <em>The Art of War</em> to your personal library right here in the AG Classics collection.
          </p>
          <a
            href="/product/the-art-of-war"
            className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#C9A227] text-[#0a0a0a] text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-[#E8B84B] transition-colors duration-200"
          >
            Get the Book
            <span className="text-base leading-none">→</span>
          </a>
        </div>

        <div className="mt-8">
          {/* Distinctive anchor text to avoid duplicating the breadcrumb link */}
          <a href="/blog" className="text-[11px] tracking-[0.25em] uppercase text-[#dcdcdc] hover:text-[#C9A227] transition-colors">
            ← Back to Blog
          </a>
        </div>
      </div>

    </div>
  );
}