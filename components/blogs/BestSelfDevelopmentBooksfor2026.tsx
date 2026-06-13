// ─────────────────────────────────────────────────────────────────────
//  AG Classics  Blog: "10 Best Self-Development Books for 2026"
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
    title: "Meditations",
    author: "Marcus Aurelius",
    year: "161-180 AD",
    category: "Stoicism & Philosophy",
    accent: "#C0392B",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0812968255-L.jpg",
    description:
      "Marcus Aurelius did not write this to be published. It was actually the private journal of a Roman Emperor who ruled the known world. Meditations gives us a rare peek into the mind of the most powerful man on earth as he tries to be a better person. While dealing with war, sickness, and political backstabbing, Aurelius stayed grounded using Stoic principles like emotional control and accepting mortality. It is the perfect guide for keeping your mind calm when everything around you feels chaotic.",
    coreIdea:
      "You control your own mind, not the events happening around you. Once you realize this, you will find true strength.",
    whyRead:
      "It cuts through all our modern anxiety and gives you a deep, unshakable perspective from a man who handled pressures we can barely imagine.",
    legacy: "This is the absolute foundation of Stoic philosophy, and it has inspired leaders, thinkers, and warriors for over two thousand years.",
  },
  {
    rank: 2,
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    year: "1946",
    category: "Purpose & Resilience",
    accent: "#3498DB",
    coverUrl: "https://covers.openlibrary.org/b/isbn/080701429X-L.jpg",
    description:
      "Psychiatrist Viktor Frankl survived the horrific conditions of Nazi death camps, and his memoir is a powerful reminder of how unbreakable the human spirit can be. He noticed that the survivors were not always the strongest physically, but rather those who held onto a sense of purpose like finishing a life goal or hoping to see a loved one again. Out of that dark experience, he realized that our biggest drive in life is not finding pleasure, but finding meaning.",
    coreIdea:
      "You can lose absolutely everything except one thing: your freedom to choose how you react to any given situation.",
    whyRead:
      "It completely changes how you view your daily struggles and shows that suffering actually stops being suffering the moment it finds a meaning.",
    legacy: "The Library of Congress named it one of the ten most influential books in America for a very good reason.",
  },
  {
    rank: 3,
    title: "Atomic Habits",
    author: "James Clear",
    year: "2018",
    category: "Behavioral Psychology",
    accent: "#E67E22",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0735211299-L.jpg",
    description:
      "James Clear delivers an amazing guide on how small decisions add up over time. He breaks down years of brain science and psychology into simple, easy steps to help you change your behavior. He completely destroys the idea that you need to make massive changes to see massive success. Instead, he proves that getting just 1% better every day leads to incredible results. It takes the pressure off hitting big goals and teaches you how to build better daily routines instead.",
    coreIdea:
      "You do not rise to the level of your goals. Instead, you fall to the level of your daily systems.",
    whyRead:
      "It gives you a clear, stress free way to break bad habits and build good ones without having to rely on motivation that fades away.",
    legacy: "With over 15 million copies sold around the world, this is the modern handbook on building great habits.",
  },
  {
    rank: 4,
    title: "Deep Work",
    author: "Cal Newport",
    year: "2016",
    category: "Focus & Productivity",
    accent: "#5B9BD5",
    coverUrl: "https://covers.openlibrary.org/b/isbn/1455586692-L.jpg",
    description:
      "In a world filled with constant notifications and distractions, the ability to focus deeply is incredibly rare and super valuable. Cal Newport talks about deep work as the ability to focus completely on a hard task without any distractions, pushing your brain to its limits. He points out that social media and shallow tasks are actually hurting our ability to do great work, and he offers a strict training plan to help you get your attention span back.",
    coreIdea:
      "If you want to do your best work, you have to spend long periods focusing entirely on one task without any distractions getting in the way.",
    whyRead:
      "It is a must read survival guide for anyone working today. It gives you the exact tools you need to outsmart and outperform a highly distracted world.",
    legacy: "This book started a huge global conversation about stepping back from our screens and the real cost of always being online.",
  },
  {
    rank: 5,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    year: "2011",
    category: "Cognitive Science",
    accent: "#9B59B6",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0374533555-L.jpg",
    description:
      "Nobel prize winner Daniel Kahneman takes you on an amazing journey through your own brain. He explains that we have two different systems for thinking. System 1 is fast, emotional, and relies on gut feelings. System 2 is much slower, highly logical, and takes more effort. By showing us how brilliant but also how flawed our fast thinking can be, Kahneman teaches us exactly when to trust our gut and when to slow down. It will completely change how you make decisions in business and in life.",
    coreIdea:
      "We tend to be a bit too confident in how much we actually understand about the world, and we usually forget how much luck plays a role in what happens to us.",
    whyRead:
      "Figuring out your own mental blind spots is the very first step to making better, smarter choices every single day.",
    legacy: "It totally transformed how we think about psychology and economics, making it a must read for leaders everywhere.",
  },
  {
    rank: 6,
    title: "Mastery",
    author: "Robert Greene",
    year: "2012",
    category: "Skill & Excellence",
    accent: "#D4AF37",
    coverUrl: "https://covers.openlibrary.org/b/isbn/014312417X-L.jpg",
    description:
      "Robert Greene proves that natural talent is actually a myth. By looking closely at historical figures like Leonardo da Vinci and Charles Darwin, he shows that becoming a master at something follows a very specific process anyone can learn. He walks you through the tough early days of learning, figuring out how to work well with others, and finally reaching the top of your field. It is a deep, fascinating look at what it really takes to become world class at whatever you do.",
    coreIdea:
      "The future belongs to people who are willing to learn different skills and then mix them together in highly creative ways.",
    whyRead:
      "If you are tired of looking for quick fixes and overnight success, this gives you a real, historical roadmap to achieving lasting greatness.",
    legacy: "It is widely known as the ultimate playbook for ambitious people who refuse to settle for being average at what they do.",
  },
  {
    rank: 7,
    title: "Essentialism",
    author: "Greg McKeown",
    year: "2014",
    category: "Priority & Design",
    accent: "#7CBB4A",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0804137382-L.jpg",
    description:
      "Being an Essentialist is not about squeezing more tasks into your busy day. It is actually about figuring out how to do only the things that truly matter. Greg McKeown challenges the exhausting idea that we can have it all. Instead, he shows you how to be extremely picky about where you spend your time. By learning to say no and focusing only on what is essential, you get your freedom back and can put your energy where it makes the biggest difference.",
    coreIdea:
      "If you do not decide what your priorities are, someone else will decide them for you. Chasing less is actually the secret to achieving more.",
    whyRead:
      "It is the perfect cure for feeling burned out, overwhelmed, and stuck because you are always saying yes to way too many things.",
    legacy: "This book made the phrase less but better famous, helping people everywhere step off the endless treadmill of busywork.",
  },
  {
    rank: 8,
    title: "Mindset",
    author: "Carol S. Dweck",
    year: "2006",
    category: "Psychology",
    accent: "#1ABC9C",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0345472322-L.jpg",
    description:
      "After studying psychology for decades at Stanford, Carol Dweck found something incredibly simple but totally life changing: the power of your mindset. She explains the huge difference between a fixed mindset, where you think your talents are set in stone, and a growth mindset, where you believe you can always get better. This one little shift completely changes how you learn, how you bounce back from failure, and what you can eventually achieve.",
    coreIdea:
      "When you have a growth mindset, challenges look exciting instead of scary. Instead of worrying about looking foolish, you see an opportunity to learn something new.",
    whyRead:
      "It completely changes the way you talk to yourself when things go wrong, turning your failures into incredibly useful lessons.",
    legacy: "It has changed how schools and massive companies train people all over the world, proving that believing you can grow actually makes it happen.",
  },
  {
    rank: 9,
    title: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    year: "2014",
    category: "Applied Philosophy",
    accent: "#E74C3C",
    coverUrl: "https://covers.openlibrary.org/b/isbn/1591846358-L.jpg",
    description:
      "Ryan Holiday uses ancient Stoic philosophy to teach you how to turn your biggest problems into massive advantages. Looking at history's greats like Steve Jobs, Amelia Earhart, and John D. Rockefeller, Holiday points out that highly successful people do not just dodge obstacles. They actually use those very obstacles as the fuel to get ahead. Think of it as a practical guide for turning your bad luck into a superpower.",
    coreIdea:
      "Whatever is standing in your way is actually helping you move forward. The obstacle itself becomes the very path you need to take.",
    whyRead:
      "It teaches you how to completely flip the script when bad things happen so you never feel stuck or paralyzed by tough situations again.",
    legacy: "This is the book that made Stoicism cool again for modern entrepreneurs, athletes, and leaders everywhere.",
  },
  {
    rank: 10,
    title: "The Power of Now",
    author: "Eckhart Tolle",
    year: "1997",
    category: "Mindfulness & Awareness",
    accent: "#8E44AD",
    coverUrl: "https://covers.openlibrary.org/b/isbn/1577314808-L.jpg",
    description:
      "To truly live in the present moment, we have to let go of our overthinking minds and our egos. Eckhart Tolle believes that almost all of our sadness and stress comes from worrying about the past or stressing over the future. By focusing completely on what is happening right now, we can stop torturing ourselves with our own thoughts. It is a deep, spiritual book, but it is written in a way that is incredibly easy to understand.",
    coreIdea:
      "You have to deeply understand that the present moment is the only thing you ever truly have. Make right now the main focus of your life.",
    whyRead:
      "While other books try to teach you how to get more done, Tolle teaches you how to turn your mind off, which is the best way to prevent total burnout.",
    legacy: "It has been translated into 33 languages and is still one of the most loved and widely read spiritual books in the world today.",
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

export default function BestSelfDevelopmentBooksfor2026() {
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
          <span className="text-white">10 Best Self-Development Books</span>
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
            <span className="text-7xl">10</span> Best Self-Development Books{" "}
            <span className="italic text-[#C9A227]">for 2026</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[1.05rem] text-[#eeeeee] leading-relaxed mb-8 max-w-2xl" style={{ fontWeight: 300 }}>
            A curated guide to the books that forge resilience, sharpen focus, and fundamentally rewire the human mind assembled from the AG Classics collection.
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
              &ldquo;The mind is not a vessel to be filled, but a fire to be kindled.&rdquo;
            </p>
            <cite className="block mt-3 text-[10px] tracking-[0.3em] text-[#d8d8d8] not-italic uppercase">
               Plutarch
            </cite>
          </blockquote>

          <p className="text-[#e8e8e8] leading-[1.95] mb-5 text-[0.925rem]">
            True self-improvement goes way beyond quick life hacks or short bursts of motivation. It is really about changing how you view the world, improving your focus, and building strong character. We have put together ten incredible books that will help you reach your true potential, blending ancient stoic wisdom with modern psychology.
          </p>
          <p className="text-[#e8e8e8] leading-[1.95] text-[0.925rem]">
            We handpicked this list because these books offer deep, lasting value, not just because they are currently popular. We also arranged them in a specific order. You will start by mastering your mindset, then move on to building better habits, and finally finish by discovering true purpose and mastery in your life.
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
            The Mind Is the{" "}
            <span className="italic text-[#C9A227]">Ultimate Asset</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            These ten books do a lot more than just give you good advice. They actually help rewire how you think about the world. The best investment you will ever make is not in fancy tools or systems, but in growing your own mind, improving your focus, and building up your resilience.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            You can find all ten of these life changing books right here in the AG Classics collection. Take a look at our carefully chosen catalogue of self-improvement, philosophy, and classic literature. We focus on offering beautiful, high quality physical books that you will treasure forever.
          </p>
          <a
            href="/books"
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