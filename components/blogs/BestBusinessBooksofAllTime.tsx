// ─────────────────────────────────────────────────────────────────────
//  AG Classics — Blog: "10 Best Business Books of All Time"
//  Drop into your Next.js / React project. Requires: Tailwind CSS
// ─────────────────────────────────────────────────────────────────────

"use client";

import React, { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────

interface Book {
  rank: number;
  title: string;
  author: string;
  year: string;
  category: string;
  accent: string;
  coverUrl: string;
  description: string;
  coreIdea: string;
  whyRead: string;
  legacy: string;
}

// ─── Book Data ────────────────────────────────────────────────────────
// Cover images are served from Open Library (covers.openlibrary.org).
// A styled fallback renders automatically if any image fails to load.

const BOOKS: Book[] = [
  {
    rank: 1,
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    year: "1937",
    category: "Mindset & Achievement",
    accent: "#D4AF37",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0449214923-L.jpg",
    description:
      "Drawn from two decades of research and personal interviews with over 500 self-made millionaires — including Andrew Carnegie, Thomas Edison, and Henry Ford — Napoleon Hill's masterwork distills the science of achievement into 13 interlocking principles. It is not, despite its title, a book about money. It is a treatise on the architecture of human possibility: the radical premise that thought, sustained and obsessive and backed by unwavering faith, becomes the magnetic force that draws its material equivalent into existence. Every foundational success framework written in the century since borrows from this book — often without acknowledgment.",
    coreIdea:
      "Whatever the mind can conceive and believe, it can achieve. Success begins not with action, but with a state of mind — a burning desire backed by faith and a definite plan.",
    whyRead:
      "Reading Think and Grow Rich is going to the original source of nearly every success philosophy that followed it. Not as a historical curiosity, but as living instruction.",
    legacy: "Over 100 million copies sold worldwide. In continuous print for nearly 90 years.",
  },
  {
    rank: 2,
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    year: "1936",
    category: "Communication & Leadership",
    accent: "#4CAF8A",
    coverUrl: "https://m.media-amazon.com/images/I/41OksZQYt+L._SY445_SX342_FMwebp_.jpg",
    description:
      "Carnegie's deceptively simple title conceals one of the most profound inquiries into human nature ever committed to a business book. Written from thousands of case studies collected over years of teaching, the book argues — supported by every subsequent study in organisational psychology — that business success is 85% people skills and 15% technical knowledge. Through vivid anecdotes drawn from Lincoln, Rockefeller, and Roosevelt, Carnegie demonstrates that the art of making people feel genuinely important, understood, and valued is not manipulation: it is mastery of the one element no technology has ever automated.",
    coreIdea:
      "You can make more friends in two months by becoming genuinely interested in other people than in two years of trying to get other people interested in you.",
    whyRead:
      "Leadership, sales, negotiation, management, hiring — every professional domain is fundamentally about human relationships. This book lays the foundation on which all others build.",
    legacy: "Over 30 million copies sold. A standard reading list staple at business schools for nearly 90 years.",
  },
  {
    rank: 3,
    title: "Zero to One",
    author: "Peter Thiel",
    year: "2014",
    category: "Entrepreneurship & Innovation",
    accent: "#5B9BD5",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0804139024-L.jpg",
    description:
      "Peter Thiel, co-founder of PayPal and the first outside investor in Facebook, argues that genuine progress — going from zero to one — means doing something truly new, not copying and optimising what already exists. His contrarian thesis is stated without apology: competition is for losers, monopoly is the goal, and the best businesses are founded on secrets the rest of the world has not yet noticed. Dense with Silicon Valley insider knowledge and genuine philosophical depth, this is one of the most intellectually honest books about building something that matters, written by someone who has repeatedly done exactly that.",
    coreIdea:
      "Every moment in business happens only once. The next Gates won't build an operating system. The next Page won't make a search engine. If you are copying these people, you are not learning from them.",
    whyRead:
      "Thiel asks questions no other business book dares to ask, and his answers are discomforting in the most productive way possible for any serious builder.",
    legacy: "Required reading in Stanford's entrepreneurship programme. Foundational text across venture capital ecosystems worldwide.",
  },
  {
    rank: 4,
    title: "Good to Great",
    author: "Jim Collins",
    year: "2001",
    category: "Leadership & Organisational Strategy",
    accent: "#9B59B6",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0066620996-L.jpg",
    description:
      "Collins and his research team spent five years analysing 28 companies — 11 that made the sustained leap from good to great and 17 that did not — extracting the patterns that separate enduring greatness from comfortable mediocrity. Their findings demolished several cherished myths: charismatic leadership matters far less than most assume; corporate transformations are not dramatic turnarounds but the patient accumulation of momentum, like a flywheel gathering speed; and the right people in the right seats must precede any strategy whatsoever. The data is unambiguous. The conclusions are, for most leaders, genuinely unsettling.",
    coreIdea:
      "Good is the enemy of great. Most companies never become great precisely because most settle for being good — and good is comfortable, achievable, and deeply, dangerously safe.",
    whyRead:
      "Empirically grounded and rigorously researched, this is business literature that actually proves its claims rather than merely asserting them — a genuine rarity in any genre.",
    legacy: "Over 4 million copies sold. Named one of the most influential business books of the past two decades by TIME.",
  },
  {
    rank: 5,
    title: "The Lean Startup",
    author: "Eric Ries",
    year: "2011",
    category: "Operations & Product Development",
    accent: "#E74C3C",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0307887898-L.jpg",
    description:
      "Ries synthesised lean manufacturing principles from Toyota, agile software development, and his own hard-earned experience as a failed and then successful startup founder to create a methodology that has fundamentally reshaped how the world builds products. The core insight is simple and devastating: most startups don't know what their customers want, and the greatest waste is not failed launches but the slow accumulation of resources building something nobody needs. The fastest path to truth is a disciplined Build-Measure-Learn cycle using minimum viable products to test real hypotheses before committing capital at scale.",
    coreIdea:
      "The only way to win is to learn faster than anyone else. Validated learning — not output, not lines of code, not features shipped — is the true measure of startup progress.",
    whyRead:
      "Whether you are launching a product, a department, or a new business line, the Lean Startup framework is the most practical and battle-tested innovation system available to any builder.",
    legacy: "Established an entirely new business methodology now used by startups, Fortune 500 companies, and government agencies on every continent.",
  },
  {
    rank: 6,
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    year: "1989",
    category: "Personal Effectiveness",
    accent: "#E67E22",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0743269519-L.jpg",
    description:
      "Covey's framework is built on a distinction most productivity literature carefully avoids: the difference between the Character Ethic — rooted in fundamental principles of integrity, contribution, and service — and the Personality Ethic, rooted in techniques, social performance, and surface competence. The seven habits are not productivity tips; they are a comprehensive paradigm for moving from dependence to independence to genuine interdependence. The book is as much philosophy as it is practice, grounded in the uncomfortable conviction that sustainable effectiveness begins not with what you do, but with who you are.",
    coreIdea:
      "Begin with the end in mind. Most people spend their whole lives climbing the ladder of success, only to discover at the end that it was leaning against the wrong wall.",
    whyRead:
      "In a world saturated with productivity hacks and morning routines, Covey addresses what every other productivity book carefully avoids: character. On that ground, it remains peerless.",
    legacy: "Over 40 million copies sold in 50 languages. Named the most influential business book of the 20th century by Forbes.",
  },
  {
    rank: 7,
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    year: "1949",
    category: "Finance & Investing",
    accent: "#7CBB4A",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0060555661-L.jpg",
    description:
      "Warren Buffett calls this 'by far the best book on investing ever written' — and Buffett is not given to superlatives. Graham's framework of value investing — buying securities at significant discounts to their intrinsic worth, with a built-in margin of safety against error — was revolutionary in 1949 and remains the philosophical bedrock of successful long-term investing today. The book's essential distinction between investment and speculation is one of the most practically useful ideas in financial history, and the allegory of Mr. Market — the manic-depressive business partner who offers to buy or sell his share every day at a different price — is a mental model every professional should carry permanently.",
    coreIdea:
      "The investor's chief problem — and even his worst enemy — is likely to be himself. The market is there to serve you, not to instruct you. Learning that distinction is everything.",
    whyRead:
      "Understanding how capital actually works is foundational knowledge for any professional. Graham doesn't just teach investing — he teaches you to think clearly about money and value.",
    legacy: "Shaped the investment philosophy of Buffett, Munger, Seth Klarman, and virtually every successful value investor of the past 75 years.",
  },
  {
    rank: 8,
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    year: "1997",
    category: "Financial Literacy",
    accent: "#3498DB",
    coverUrl: "https://covers.openlibrary.org/b/isbn/1612680194-L.jpg",
    description:
      "Told through the contrast between his financially struggling educated father ('Poor Dad') and the entrepreneurial father of his best friend ('Rich Dad'), Kiyosaki's book challenges the conventional script of school, stable job, and a 40-year career with brutal directness. The central insight — that the rich do not work for money, they make money work for them — reframed how a generation understood assets, liabilities, and the fundamental economics of personal finance. The book is deliberately provocative, designed not to comfort but to force a complete rupture in every assumption most people carry about work, security, and wealth.",
    coreIdea:
      "The poor and middle class work for money. The rich have money work for them. Your house is not an asset — it is a liability. Financial education is the one subject school will never teach.",
    whyRead:
      "As an intellectual provocation about financial literacy and the school system's failure to teach real economics, it has few equals in accessibility, clarity, and lasting impact.",
    legacy: "Over 40 million copies sold in 109 countries. Among the best-selling personal finance books in publishing history.",
  },
  {
    rank: 9,
    title: "The Art of War",
    author: "Sun Tzu",
    year: "5th Century BC",
    category: "Strategy & Philosophy",
    accent: "#C0392B",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0195014766-L.jpg",
    description:
      "Written over 2,500 years ago for military commanders on the battlefields of ancient China, Sun Tzu's 13 chapters contain perhaps the most concentrated collection of strategic wisdom ever assembled. Business leaders, negotiators, and executives have found in it principles that translate directly and without forcing: know your terrain; win without fighting wherever possible; act only from a position of genuine strength; the highest form of victory is to render conflict unnecessary before it begins. Its brevity is its genius — in the original Chinese, each character is irreducible. There is no filler, no padding, no encouragement. Only principle.",
    coreIdea:
      "The supreme art of war is to subdue the enemy without fighting. The supreme art of business is to render competition irrelevant before it has time to begin.",
    whyRead:
      "Competition in business is strategic warfare conducted with financial instruments. Sun Tzu provides the clearest and most durable framework for strategic thinking ever committed to writing.",
    legacy: "Studied continuously for 2,500 years across military, political, and business contexts. Cited by leaders from Mao Zedong to Bill Belichick.",
  },
  {
    rank: 10,
    title: "Built to Last",
    author: "Jim Collins & Jerry I. Porras",
    year: "1994",
    category: "Vision & Organisational Culture",
    accent: "#1ABC9C",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0060516402-L.jpg",
    description:
      "Before Good to Great, Collins and Porras spent six years studying 18 truly exceptional companies — including 3M, Boeing, Disney, and Merck — that had endured across multiple decades, leaders, and product cycles, comparing them rigorously against less successful competitors. Their conclusion: visionary companies are built on core values and a core purpose that extend far beyond profit, combined with a structural genius for preserving what is essential while relentlessly stimulating progress. It is ultimately a study in institutional character — what it actually means to build not just a successful company, but a lasting one.",
    coreIdea:
      "Preserve the core; stimulate progress. The visionary company is not the most profitable in any single year — it is the one that is still here, and still excellent, a century later.",
    whyRead:
      "In an era of quarterly earnings and five-year plans, this book asks what it means to build something that outlasts you — and answers that question with six years of evidence.",
    legacy: "Named one of the greatest business books of all time by BusinessWeek. Required reading at Stanford GSB and Harvard Business School.",
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

// ─── Fallback Cover ───────────────────────────────────────────────────
// Shown when the Open Library image fails to load.

function FallbackCover({ book, small = false }: { book: Book; small?: boolean }) {
  return (
    <div
      className="w-full flex flex-col justify-between"
      style={{
        aspectRatio: "2/3",
        background: `linear-gradient(160deg, ${book.accent}22 0%, #111 55%)`,
        borderLeft: `${small ? "3px" : "4px"} solid ${book.accent}`,
        borderTop: `1px solid ${book.accent}18`,
        padding: small ? "8px" : "14px",
      }}
    >
      {/* Decorative top lines */}
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1" style={{ height: "2px", background: `${book.accent}35` }} />
        ))}
      </div>
      {/* Title + Author */}
      <div>
        <p
          className="text-[#f0ead8] font-bold leading-snug mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: small ? "8px" : "12px",
          }}
        >
          {book.title}
        </p>
        <p
          className="tracking-wider uppercase"
          style={{
            color: book.accent,
            opacity: 0.55,
            fontSize: small ? "7px" : "9px",
          }}
        >
          {book.author}
        </p>
      </div>
    </div>
  );
}

// ─── Books Collage ────────────────────────────────────────────────────
// Visual 5×2 grid preview after the intro — each cover links to its entry.

function CollageItem({ book }: { book: Book }) {
  const [err, setErr] = useState(false);
  return (
    <a
      href={`#book-${book.rank}`}
      className="group relative block overflow-hidden"
      style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.55)" }}
      aria-label={`Jump to ${book.title}`}
    >
      {err ? (
        <FallbackCover book={book} small />
      ) : (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ aspectRatio: "2/3", display: "block" }}
          onError={() => setErr(true)}
        />
      )}
      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)" }}
      >
        <p className="text-[#f0ead8] text-[8px] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {book.title}
        </p>
      </div>
      {/* Rank badge */}
      <div
        className="absolute top-1.5 left-1.5 w-5 h-5 flex items-center justify-center text-[9px] font-black select-none"
        style={{ background: book.accent, color: "#0a0a0a" }}
      >
        {book.rank}
      </div>
    </a>
  );
}

function BooksCollage() {
  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 mb-16">
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {BOOKS.map((book) => (
          <CollageItem key={book.rank} book={book} />
        ))}
      </div>
      <p className="text-center text-[10px] text-[#2e2e2e] mt-3 tracking-[0.25em] uppercase select-none">
        Click any cover to jump to that entry
      </p>
    </div>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────

function BookCard({ book }: { book: Book }) {
  const [imgErr, setImgErr] = useState(false);
  const rankStr = String(book.rank).padStart(2, "0");

  return (
    <article id={`book-${book.rank}`} className="relative scroll-mt-8">
      {/* Top accent rule */}
      <div
        className="h-px w-full"
        style={{ background: `linear-gradient(to right, ${book.accent}55, ${book.accent}15, transparent)` }}
      />

      <div className="py-12 lg:py-14">
        <div className="flex gap-5 sm:gap-7 md:gap-10 lg:gap-12">

          {/* ── Left column: rank + cover ── */}
          <div className="flex-shrink-0 self-start">
            {/* Rank number above cover */}
            <p
              className="text-right text-2xl sm:text-3xl font-black mb-2 sm:mb-3 leading-none"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: book.accent,
                opacity: 0.7,
                width: "85px",
              }}
            >
              {rankStr}
            </p>

            {/* Cover image */}
            <div
              className="overflow-hidden"
              style={{
                width: "85px",
                boxShadow: `0 10px 28px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)`,
              }}
            >
              {imgErr ? (
                <FallbackCover book={book} />
              ) : (
                <img
                  src={book.coverUrl}
                  alt={`${book.title} by ${book.author}`}
                  className="w-full object-cover block"
                  style={{ aspectRatio: "2/3" }}
                  onError={() => setImgErr(true)}
                />
              )}
            </div>

            {/* Thin accent line below cover */}
            <div
              className="mt-3 h-8 w-px mx-auto"
              style={{ background: `linear-gradient(to bottom, ${book.accent}40, transparent)` }}
            />
          </div>

          {/* ── Right column: content ── */}
          <div className="flex-1 min-w-0">

            {/* Category */}
            <span
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-semibold mb-3"
              style={{ color: book.accent, opacity: 0.85 }}
            >
              {book.category}
            </span>

            {/* Title */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2 text-[#f5f0e8]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {book.title}
            </h2>

            {/* Author · Year */}
            <div className="flex items-center flex-wrap gap-2 text-sm mb-6">
              <span className="text-[#e3e3e3]">{book.author}</span>
              <span className="w-1 h-1 rounded-full bg-[#af6f00]" />
              <span className="text-[#bdbdbd]">{book.year}</span>
            </div>

            {/* Accent divider */}
            <div
              className="w-full h-px mb-6"
              style={{ background: `linear-gradient(to right, ${book.accent}30, transparent)` }}
            />

            {/* Description */}
            <p className="text-[#ffffff] leading-[1.9] text-[0.9rem] mb-8">
              {book.description}
            </p>

            {/* Core Idea pull-quote */}
            <div
              className="pl-5 border-l-2 mb-7"
              style={{ borderColor: `${book.accent}65` }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#ffffff] mb-2 font-semibold">
                Core Idea
              </p>
              <p
                className="text-lg sm:text-xl md:text-2xl italic leading-relaxed font-light text-[#c9b87a]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                &ldquo;{book.coreIdea}&rdquo;
              </p>
            </div>

            {/* Why Read / Legacy panels */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border border-[#1d1d1d] bg-[#0f0f0f] p-4 lg:p-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#c9b87a] mb-2 font-semibold">
                  Why Read It
                </p>
                <p className="text-[#a7a7a7] text-sm leading-relaxed">{book.whyRead}</p>
              </div>
              <div className="border border-[#181818] bg-[#0c0c0c] p-4 lg:p-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#c9b87a] mb-2 font-semibold">
                  Legacy
                </p>
                <p className="text-[#a7a7a7] text-sm leading-relaxed italic">{book.legacy}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────

export default function BestBusinessBooksofAllTime() {
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

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-[#333] pt-10 tracking-wider">
          <a href="/" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Home</a>
          <span className="text-white">›</span>
          <a href="/blog" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Blog</a>
          <span className="text-white">›</span>
          <span className="text-white">10 Best Business Books of All Time</span>
        </nav>

        <header className="pt-10 pb-0">
          {/* Badge */}
          <div className="mb-6">
            <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227] border border-[#C9A227]/25 px-3 py-1.5 font-semibold">
              Reading List
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.03] mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-7xl">10</span> Best Business Books{" "}
            <span className="italic text-[#C9A227]">of All Time</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[1.05rem] text-[#eeeeee] leading-relaxed mb-8 max-w-2xl" style={{ fontWeight: 300 }}>
            A curated guide to the books that built empires, rewired industries, and changed the thinking
            of every leader worth knowing — assembled from the AG&nbsp;Classics collection.
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
            <span className="text-white">14 min read</span>
          </div>

          {/* Ornamental divider */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
            <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════ */}
        {/*  INTRO                                                 */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="mt-12 mb-12">
          <blockquote className="border-l-2 border-[#C9A227]/50 pl-7 mb-10">
            <p
              className="text-2xl md:text-3xl italic text-[#c9b87a] font-light leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              &ldquo;Not all readers are leaders, but all leaders are readers.&rdquo;
            </p>
            <cite className="block mt-3 text-[10px] tracking-[0.3em] text-[#d8d8d8] not-italic uppercase">
              — Harry S. Truman
            </cite>
          </blockquote>

          <p className="text-[#e8e8e8] leading-[1.95] mb-5 text-[0.925rem]">
            The most expensive education in the world costs nothing compared to the right book read at the
            right moment. The ten books assembled here represent centuries of compressed wisdom — from the
            battlefields of ancient China to the boardrooms of Silicon Valley — selected not for their
            popularity alone, but for the depth, durability, and irreplaceability of their ideas.
          </p>
          <p className="text-[#e8e8e8] leading-[1.95] text-[0.925rem]">
            Each book on this list has done something rare: it has changed the way its readers think, not
            merely what they know. They are arranged in the sequence we believe most readers will extract
            maximum value from encountering them — beginning with the architecture of the mind, and ending
            with the architecture of institutions built to outlast their founders.
          </p>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  BOOKS COLLAGE — visual grid preview                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <BooksCollage />

      {/* ══════════════════════════════════════════════════════ */}
      {/*  BOOK ENTRIES                                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        {BOOKS.map((book) => (
          <BookCard key={book.rank} book={book} />
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
            Final Thought
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#f5f0e8] mt-3 mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Library Is the{" "}
            <span className="italic text-[#C9A227]">Investment</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            These ten books do not merely teach business — they teach how to think, how to lead, how to build,
            and how to endure. The greatest return on investment any professional can make is not in the stock
            market or in real estate: it is in the pages of books written by people who spent their entire
            lives mastering what they had to teach.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            All ten books are available in the AG&nbsp;Classics collection. Browse our curated catalogue of
            business, philosophy, and timeless literature — physical editions selected for their quality,
            beauty, and enduring value.
          </p>
          <a
            href="/category/all"
            className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#C9A227] text-[#0a0a0a] text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-[#E8B84B] transition-colors duration-200"
          >
            Explore the Collection
            <span className="text-base leading-none">→</span>
          </a>
        </div>


        <div className="mt-8">
          <a href="/blog" className="text-[11px] tracking-[0.25em] uppercase text-[#dcdcdc] hover:text-[#C9A227] transition-colors">
            ← Back to Blog
          </a>
        </div>
      </div>

    </div>
  );
}