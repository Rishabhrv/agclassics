// ─────────────────────────────────────────────────────────────────────
//  AG Classics — Blog: "10 Best Self-Development Books for 2026"
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
      "Written not for publication but as the private journal of a Roman Emperor governing the known world, Meditations is perhaps the only document of its kind: the intimate thoughts of the most powerful man on earth advising himself on how to be a better human being. Amidst warfare, plague, and political betrayal, Aurelius grounds himself in the Stoic principles of emotional regulation, civic duty, and the acceptance of mortality. It is the ultimate manual for remaining sovereign over one's own mind when everything external is in chaos.",
    coreIdea:
      "You have power over your mind — not outside events. Realize this, and you will find strength.",
    whyRead:
      "It strips away the noise of modern anxiety, offering an anchor of profound, unshakable perspective from a man who faced pressures we can barely imagine.",
    legacy: "The foundational text of Stoicism, referenced by leaders, thinkers, and warriors for over two millennia.",
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
      "Psychiatrist Viktor Frankl's memoir of life in Nazi death camps is a staggering testament to the indestructible nature of the human spirit. Frankl observed that the prisoners who survived were not necessarily the physically strongest, but those who retained a sense of meaning—a task to complete, a loved one to see again. From this unimaginable darkness, he developed logotherapy, arguing that our primary drive in life is not pleasure, but the pursuit of meaning.",
    coreIdea:
      "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude in any given set of circumstances.",
    whyRead:
      "It recontextualizes our daily struggles, proving that suffering ceases to be suffering at the moment it finds a meaning.",
    legacy: "Selected by the Library of Congress as one of the ten most influential books in America.",
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
      "A masterclass in the compounding nature of small decisions. James Clear synthesizes decades of neuroscience and cognitive psychology into a highly practical framework for behavioral change. He dismantles the myth that massive success requires massive action, proving instead that a 1% daily improvement yields mathematically transformative results over time. It shifts the focus from goal-setting to system-building, changing how we view daily routines.",
    coreIdea:
      "You do not rise to the level of your goals. You fall to the level of your systems.",
    whyRead:
      "It provides a purely mechanical, emotion-free methodology to break bad habits and adopt good ones, completely bypassing the need for fleeting 'motivation'.",
    legacy: "Over 15 million copies sold globally; the definitive modern text on habit formation.",
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
      "In an economy built on distraction, the ability to focus without interruption is becoming increasingly rare and exponentially more valuable. Cal Newport defines 'deep work' as professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. He argues that network tools and shallow work are fundamentally diminishing our capacity for profound output, and offers a strict training regimen to rebuild our attention spans.",
    coreIdea:
      "To produce at your peak level you need to work for extended periods with full concentration on a single task free from distraction.",
    whyRead:
      "It is an urgent survival guide for the modern knowledge worker, offering a blueprint to out-produce and out-think a distracted competition.",
    legacy: "Sparked a global conversation about digital minimalism and the true cost of constant connectivity.",
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
      "Nobel laureate Daniel Kahneman takes us on a groundbreaking tour of the mind, explaining the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical. By exposing the extraordinary capabilities—and the terrifying faults and biases—of fast thinking, Kahneman reveals where we can and cannot trust our intuitions, fundamentally altering how we make decisions in business, finance, and life.",
    coreIdea:
      "We are prone to overestimate how much we understand about the world and to underestimate the role of chance in events.",
    whyRead:
      "Understanding your own cognitive biases is the first and most vital step toward true rationality and effective decision-making.",
    legacy: "Transformed the fields of behavioral economics and psychology, becoming a mandatory text for leaders across all industries.",
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
      "Greene demolishes the myth of innate talent, proving through historical case studies from Leonardo da Vinci to Charles Darwin that mastery is the result of a specific, replicable process. He maps out the journey from the grueling apprenticeship phase, through the acquisition of social intelligence, to the ultimate achievement of creative mastery. It is a dense, historical, and deeply philosophical look at what it actually takes to become world-class at your craft.",
    coreIdea:
      "The future belongs to those who learn more skills and combine them in creative ways.",
    whyRead:
      "It cures the modern impatience for instant success, providing a historical roadmap for long-term, unassailable excellence.",
    legacy: "Considered the ultimate blueprint for ambitious individuals unwilling to settle for mediocrity in their life's work.",
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
      "The way of the Essentialist isn't about getting more done in less time. It's about getting only the right things done. McKeown challenges the modern assumption that we can 'have it all', forcing the reader to recognize the power of extreme selectivity. By applying a more rigorous criteria to what is truly essential, we regain control of our own choices so we can channel our time, energy, and effort into our highest point of contribution.",
    coreIdea:
      "If you don't prioritize your life, someone else will. The disciplined pursuit of less is the key to achieving more.",
    whyRead:
      "It is an antidote to the burnout, overwhelm, and lack of progress that plagues modern professionals who say 'yes' to too much.",
    legacy: "Popularized the 'less but better' philosophy, shifting the cultural paradigm away from mindless hustle.",
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
      "After decades of research, Stanford psychologist Carol Dweck discovered a simple but groundbreaking idea: the power of mindset. She outlines the profound difference between a 'fixed mindset' (believing abilities are static) and a 'growth mindset' (believing abilities can be developed). This single conceptual shift changes how we approach learning, how we handle failure, and ultimately, what we are capable of achieving.",
    coreIdea:
      "In a growth mindset, challenges are exciting rather than threatening. So rather than thinking, oh, I'm going to reveal my weaknesses, you say, wow, here's a chance to grow.",
    whyRead:
      "It fundamentally alters how you speak to yourself during moments of failure, transforming setbacks into raw data for improvement.",
    legacy: "Reshaped educational and corporate training models globally, proving that neuroplasticity is driven by belief.",
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
      "Drawing heavily on the ancient philosophy of Stoicism, Ryan Holiday provides a framework for turning adversity into advantage. Through historical examples—from John D. Rockefeller to Amelia Earhart to Steve Jobs—Holiday illustrates how the world's most successful people haven't just avoided obstacles; they have actively utilized them as the fuel for their success. It is a tactical manual for emotional alchemy.",
    coreIdea:
      "The impediment to action advances action. What stands in the way becomes the way.",
    whyRead:
      "It teaches you how to flip the script on misfortune, rendering you psychologically immune to the paralysis of bad circumstances.",
    legacy: "Sparked a massive modern revival of Stoicism among entrepreneurs, professional athletes, and politicians.",
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
      "To make the journey into the Now we will need to leave our analytical mind and its false created self, the ego, behind. Tolle argues that almost all human suffering is rooted in our obsession with the past and our anxiety regarding the future. By anchoring consciousness entirely in the present moment, we liberate ourselves from the self-inflicted torment of the mind. It is a profound spiritual text wrapped in accessible language.",
    coreIdea:
      "Realize deeply that the present moment is all you have. Make the NOW the primary focus of your life.",
    whyRead:
      "While other books optimize the mind for output, Tolle teaches you how to turn the mind off, offering a critical defense against psychological burnout.",
    legacy: "Translated into 33 languages, it remains one of the most widely read spiritual texts of the modern era.",
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
      {/*  HERO                                                  */}
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
            A curated guide to the books that forge resilience, sharpen focus, and fundamentally rewire the human mind — assembled from the AG&nbsp;Classics collection.
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
              &ldquo;The mind is not a vessel to be filled, but a fire to be kindled.&rdquo;
            </p>
            <cite className="block mt-3 text-[10px] tracking-[0.3em] text-[#d8d8d8] not-italic uppercase">
              — Plutarch
            </cite>
          </blockquote>

          <p className="text-[#e8e8e8] leading-[1.95] mb-5 text-[0.925rem]">
            True self-development is not about superficial life hacks or fleeting bursts of motivation. It is about the fundamental restructuring of character, focus, and perspective. The ten books assembled here represent a masterclass in human potential — drawing from ancient stoic philosophy, modern cognitive science, and behavioral psychology.
          </p>
          <p className="text-[#e8e8e8] leading-[1.95] text-[0.925rem]">
            We have carefully curated this list not just for popularity, but for depth and durability. These texts are arranged in a specific sequence: beginning with the mastery of internal perspective, moving through the mechanics of focus and habit, and concluding with the ultimate pursuit of meaning and mastery.
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
            The Mind Is the{" "}
            <span className="italic text-[#C9A227]">Ultimate Asset</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            These ten books do not merely offer advice — they offer a rewiring of your cognitive framework. The greatest return on investment any individual can make is not in external systems, but in the deliberate cultivation of their own mind, focus, and resilience.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            All ten books are available in the AG&nbsp;Classics collection. Browse our curated catalogue of self-development, philosophy, and timeless literature — physical editions selected for their quality, beauty, and enduring value.
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