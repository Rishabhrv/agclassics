// ─────────────────────────────────────────────────────────────────────
//  AG Classics  Blog: "10 Best Business Books of All Time"
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
      "Napoleon Hill spent twenty years researching and interviewing over 500 self-made millionaires like Andrew Carnegie, Thomas Edison, and Henry Ford to write this masterpiece. Despite the title, it is not actually a book about money. Instead, it explores human potential and the powerful idea that intense, focused thoughts backed by strong faith can turn your goals into reality. Almost every major success framework written over the last century has borrowed ideas from this book, even if they do not admit it.",
    coreIdea:
      "Whatever your mind can conceive and believe, it can achieve. True success starts with your mindset, requiring a strong desire, unshakeable faith, and a clear plan of action.",
    whyRead:
      "This book is the original source of almost every modern success philosophy. You should read it not just as a piece of history, but as a practical guide for your own life.",
    legacy: "It has sold over 100 million copies worldwide and has stayed in print continuously for almost 90 years.",
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
      "The simple title hides one of the deepest looks into human nature you will ever find in a business book. Dale Carnegie used thousands of real-world case studies to show that business success is 85% people skills and only 15% technical knowledge. Using great stories about leaders like Lincoln and Roosevelt, he proves that making people feel important, understood, and valued is not about tricking them. It is about mastering the human connection that no technology can ever replace.",
    coreIdea:
      "You will make more friends in two months by being truly interested in others than you ever could in two years of trying to get them interested in you.",
    whyRead:
      "Whether you are in leadership, sales, or management, your work is always about human relationships. This book gives you the essential foundation for dealing with people.",
    legacy: "With over 30 million copies sold, it has been a must-read staple at business schools for almost 90 years.",
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
      "Peter Thiel, who co-founded PayPal and was the first outside investor in Facebook, argues that true progress means creating something entirely new instead of just improving what already exists. He boldly claims that competition is actually a bad thing, monopolies should be your goal, and the best businesses are built on secrets the rest of the world has missed. Packed with insider stories from Silicon Valley and deep philosophical ideas, this book gives an incredibly honest look at how to build things that truly matter.",
    coreIdea:
      "Every big moment in business only happens once. The next Bill Gates will not build an operating system, and the next Larry Page will not make a search engine. If you just copy them, you are missing the point entirely.",
    whyRead:
      "Thiel asks the tough questions that other business books avoid. His answers might make you uncomfortable, but they are exactly what any serious entrepreneur needs to hear.",
    legacy: "It is required reading for Stanford entrepreneurs and serves as a foundational guide for the global venture capital world.",
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
      "Jim Collins and his team spent five years studying 28 companies to find out why some make the leap to greatness while others stay stuck in the middle. Their research destroyed some common business myths. They found that flashy leaders matter a lot less than we think, and real change happens slowly as you build momentum over time. They also proved that getting the right people on your team has to happen before you make any big strategic plans. The data is crystal clear, even if the answers might surprise some leaders.",
    coreIdea:
      "Being just good is the biggest block to becoming great. Most companies never achieve greatness because they settle for a comfortable, easy, and completely safe level of good.",
    whyRead:
      "This book is backed by heavy research and hard data. It actually proves its claims instead of just sharing opinions, which is very rare in the business world.",
    legacy: "It has sold over 4 million copies and was named one of the most influential business books of the past two decades by TIME magazine.",
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
      "Eric Ries combined ideas from Toyota's manufacturing process, modern software development, and his own bumpy ride as a startup founder to create a system that changed how we build products today. His main point is simple but powerful: most new businesses have no idea what their customers actually want. The biggest waste of time and money is not a failed launch, but secretly building something that nobody cares about. The best approach is to launch a basic version of your idea quickly, see how people react, and learn from it before spending all your money.",
    coreIdea:
      "The only way to win in business is to learn faster than your competition. Real progress is measured by how much you learn from your customers, not just by how many features you build.",
    whyRead:
      "Whether you are starting a new company, launching a product, or building a new department, this book offers the most practical and proven system to help you innovate safely.",
    legacy: "It created a brand new way of doing business that is now used everywhere, from small startups to massive Fortune 500 companies around the world.",
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
      "Stephen Covey focuses on something most productivity books ignore. He highlights the difference between quick fixes or social tricks and building deep, lasting character traits like honesty and service. His seven habits are not just life hacks to help you save time. They form a complete guide on how to grow from relying on others to becoming self-sufficient, and finally to working beautifully in a team. The book blends philosophy with practical advice, showing that true success starts with who you are inside, not just what you do.",
    coreIdea:
      "Always start with your final goal in mind. Far too many people spend their entire lives climbing the ladder of success, only to realize too late that it was leaning against the wrong wall.",
    whyRead:
      "In a world obsessed with quick productivity hacks and morning routines, Covey talks about building solid character. That makes this book truly one of a kind.",
    legacy: "It has sold over 40 million copies across 50 languages and was named the most influential business book of the 20th century by Forbes.",
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
      "Warren Buffett calls this the best investing book ever written, and he does not give out praise lightly. Benjamin Graham introduced the idea of value investing back in 1949, which means finding great stocks that are priced lower than what they are actually worth. This concept is still the foundation for making smart, long-term investments today. His clear explanation of the difference between true investing and simple gambling is a must-read. He also shares the famous story of Mr. Market, an emotional business partner whose wild mood swings teach us exactly how to handle the stock market.",
    coreIdea:
      "The biggest problem an investor faces is usually their own emotions. The market is there to serve you, not to tell you what to do, and understanding that changes everything.",
    whyRead:
      "Knowing how money truly works is essential for everyone. Graham goes beyond basic stock tips and teaches you how to think clearly and rationally about wealth.",
    legacy: "It completely shaped the strategies of legends like Warren Buffett and Charlie Munger, along with almost every great value investor over the last 75 years.",
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
      "Robert Kiyosaki compares two father figures in his life: his highly educated but financially struggling dad, and his best friend's dad who was a wealthy entrepreneur. By looking at their different mindsets, he challenges the traditional path of going to school to get a safe job for 40 years. His biggest lesson is that wealthy people do not work for money; instead, they make their money work for them. The book was written to shake up how we view personal finance, making us rethink everything we believe about jobs, security, and getting rich.",
    coreIdea:
      "Average folks trade their time for a paycheck, while the wealthy build assets that generate cash. Surprisingly, your house is a liability, not an asset, and financial literacy is the one subject schools ignore.",
    whyRead:
      "It is incredibly easy to read and completely changes how you look at money. It highlights the massive gap in what the school system teaches us about real-world economics.",
    legacy: "Selling over 40 million copies in 109 countries, it remains one of the best-selling personal finance books in history.",
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
      "Written over 2,500 years ago for military generals in ancient China, these 13 chapters hold some of the sharpest strategic advice ever recorded. Today, business leaders and negotiators use its lessons because they apply perfectly to the modern world. Sun Tzu teaches you to understand your environment, avoid unnecessary fights, and only make moves when you have a real advantage. He believes the ultimate victory is winning before a battle even starts. It is a short, brilliant read packed with pure strategy and zero fluff.",
    coreIdea:
      "True mastery means defeating your opponent without ever fighting. In business, this means becoming so unique or powerful that your competition becomes completely irrelevant.",
    whyRead:
      "Business is often a lot like strategic warfare. This ancient book offers the clearest and most timeless framework for outsmarting your rivals.",
    legacy: "It has been studied globally for 2,500 years in military, political, and business circles by countless historic and modern leaders.",
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
      "Before releasing Good to Great, Jim Collins and Jerry Porras spent six years looking at 18 incredible companies like Disney, Boeing, and 3M. They wanted to know how these giants survived changing times, multiple CEOs, and shifting markets compared to their competitors. They discovered that truly visionary companies are driven by strong core values that go far beyond just making a profit. They know exactly what traditions to protect while constantly pushing for fresh ideas. It is a fascinating look at how to build a business that will outlive its founders.",
    coreIdea:
      "Protect your core values but always push for progress. A truly great company might not be the most profitable one every single year, but it will still be thriving a century later.",
    whyRead:
      "In a business world obsessed with short-term profits, this book shows you how to build a legacy that will outlast you, backed by six years of solid evidence.",
    legacy: "BusinessWeek named it one of the greatest business books of all time, and it remains required reading at top schools like Stanford and Harvard.",
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
// Visual 5×2 grid preview after the intro  each cover links to its entry.

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
      {/* HERO                                                  */}
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
            A curated guide to the books that built empires, reshaped industries, and changed how great leaders think all selected from the AG Classics collection.
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
        {/* INTRO                                               */}
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
               Harry S. Truman
            </cite>
          </blockquote>

          <p className="text-[#e8e8e8] leading-[1.95] mb-5 text-[0.925rem]">
            Getting a great education does not have to cost a fortune, especially when you find the perfect book at exactly the right time. The ten books we have put together here hold centuries of wisdom. They cover everything from ancient battlefields in China to modern boardrooms in Silicon Valley. We chose them not just because they are popular, but because their ideas are deep, lasting, and truly life changing.
          </p>
          <p className="text-[#e8e8e8] leading-[1.95] text-[0.925rem]">
            Every book on this list does something very special. They do not just give you new facts; they completely change the way you look at the world. We arranged them in an order that makes the most sense for your journey. You will start by exploring the power of your own mindset and finish by learning how to build organizations that will last for generations.
          </p>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* BOOKS COLLAGE  visual grid preview                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <BooksCollage />

      {/* ══════════════════════════════════════════════════════ */}
      {/* BOOK ENTRIES                                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        {BOOKS.map((book) => (
          <BookCard key={book.rank} book={book} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* CONCLUSION                                            */}
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
            These ten books do more than just teach you about business. They teach you how to think better, lead well, and build things that truly last. The smartest investment you can make for your career is not in the stock market or real estate. It is diving into the pages written by people who spent their whole lives mastering their craft.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            You can find all ten of these amazing books right here in the AG Classics collection. Take some time to browse our carefully chosen catalogue of business, philosophy, and classic literature. We focus on offering beautiful, high quality physical editions that you will value for a lifetime.
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