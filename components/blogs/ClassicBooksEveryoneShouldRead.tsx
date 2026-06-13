// ─────────────────────────────────────────────────────────────────────
//  AG Classics  Blog: "10 Classic Books Everyone Should Read"
//  SEO-Optimized with JSON-LD Schema & Semantic HTML
// ─────────────────────────────────────────────────────────────────────

"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";

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

const BOOKS: Book[] = [
  {
    rank: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    year: "1960",
    category: "Fiction & Moral Philosophy",
    accent: "#D4AF37",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0060935464-L.jpg",
    description: "Told through the eyes of young Scout Finch, Harper Lee's masterpiece explores human morality, racism, and the loss of innocence in the American South. The story revolves around her father, Atticus Finch. He is a lawyer defending an innocent Black man accused of a terrible crime. Through the intense heat and tension of a divided community, Lee tells a story about the quiet nature of true courage and the darkest failures of society. It remains an incredible lesson in empathy.",
    coreIdea: "You never really understand a person until you consider things from his point of view... until you climb into his skin and walk around in it.",
    whyRead: "It is the ultimate lesson in moral education. Lee manages to tackle the heaviest and most destructive parts of human nature without ever losing her warmth or humanity.",
    legacy: "Over 40 million copies sold worldwide. It won the Pulitzer Prize and helped shape the moral conscience of an entire generation.",
  },
  {
    rank: 2,
    title: "1984",
    author: "George Orwell",
    year: "1949",
    category: "Dystopian Fiction",
    accent: "#4CAF8A",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0451524934-L.jpg",
    description: "George Orwell did more than just write a novel. He created a powerful political warning. Set in the totalitarian superstate of Oceania, the book follows Winston Smith as he tries to quietly rebel against the constant surveillance of Big Brother and the Party. What makes this book so terrifying today is not just its vision of physical control. It is the exploration of psychological domination. The government manipulates the truth, rewrites history, and destroys language to make rebellious thoughts completely impossible.",
    coreIdea: "Who controls the past controls the future. Who controls the present controls the past. Freedom is the freedom to say that two plus two make four.",
    whyRead: "It gives you the essential vocabulary to understand modern political manipulation. Terms like Doublethink and Big Brother are not just literary references. They are vital tools for understanding the world.",
    legacy: "It remains the definitive dystopian novel and routinely hits bestseller lists during times of political crisis.",
  },
  {
    rank: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: "1813",
    category: "Romance & Social Satire",
    accent: "#5B9BD5",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0141439513-L.jpg",
    description: "People often mistake this for a simple romance story, but Jane Austen's most famous novel is actually a brilliant and sharp critique of 19th-century English society. Through the clever banter between the fiercely independent Elizabeth Bennet and the proud Mr. Darcy, Austen breaks down the economics of marriage, gender rules, and the danger of first impressions. Her writing is sharp, incredibly funny, and shows a deep understanding of human psychology that still feels completely modern today.",
    coreIdea: "Vanity and pride are different things, though the words are often used synonymously. Pride relates more to our opinion of ourselves, vanity to what we would have others think of us.",
    whyRead: "Austen basically invented the modern romantic comedy. Her wit is merciless, her dialogue is flawless, and her insight into human flaws is startlingly accurate.",
    legacy: "It has inspired countless movie adaptations and remains one of the most loved and widely read novels in the English language.",
  },
  {
    rank: 4,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: "1925",
    category: "Tragedy & The American Dream",
    accent: "#9B59B6",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0743273567-L.jpg",
    description: "This book is a glittering and tragic monument to the Jazz Age. Narrated by the observant Nick Carraway, the story follows the mysterious millionaire Jay Gatsby and his doomed obsession with Daisy Buchanan. Underneath the champagne, the massive mansions, and the wild parties of 1920s Long Island, Fitzgerald delivers a devastating critique of the American Dream. It is a story about how impossible it is to repeat the past and the emptiness of having wealth without true purpose.",
    coreIdea: "So we beat on, boats against the current, borne back ceaselessly into the past. The illusion that money can rewrite history is the ultimate American tragedy.",
    whyRead: "Page for page, it contains some of the most beautiful and evocative writing in the English language. It is the perfect tragedy of ambition and illusion.",
    legacy: "It is the definitive novel of the Roaring Twenties and a permanent fixture in classic literature.",
  },
  {
    rank: 5,
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    year: "1967",
    category: "Magical Realism",
    accent: "#E74C3C",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0060883286-L.jpg",
    description: "Following the rise and fall of the mythic town of Macondo through the history of the Buendía family, this epic novel fundamentally changed global literature. In this book, the magical and the ordinary exist side by side without any contradiction. Ghosts haunt the courtyard, a plague of insomnia sweeps the town, and a priest floats in the air after drinking hot chocolate. Beneath the magic, it tells a profound and sorrowful history of Latin America, exploring how human memory and time tend to repeat themselves.",
    coreIdea: "Time does not pass, it turns in a circle. Human beings are destined to repeat their triumphs and their tragedies across generations, trapped by the gravity of their own nature.",
    whyRead: "It breaks every traditional rule of storytelling and asks you to just surrender to its unique rhythm. It is a colorful, wild experience that will expand your idea of what a novel can actually do.",
    legacy: "It won the Nobel Prize in Literature and made Magical Realism a massive force in the literary world.",
  },
  {
    rank: 6,
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    year: "1866",
    category: "Psychological Fiction",
    accent: "#E67E22",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0679734503-L.jpg",
    description: "This is an incredibly deep dive into the human conscience. The story follows Raskolnikov, a poor former student in Saint Petersburg who convinces himself it is philosophically okay to murder a corrupt pawnbroker. He believes he is a superman who does not have to follow normal moral laws. However, the murder itself is just the beginning. The real story is the unbearable psychological collapse that follows, as Raskolnikov is hunted by a brilliant police investigator and his own guilt ridden soul.",
    coreIdea: "Pain and suffering are always inevitable for a large intelligence and a deep heart. Rationality cannot override morality without tearing the human psyche apart.",
    whyRead: "Dostoevsky explores the darkest corners of the human mind with terrifying accuracy. It is the ultimate psychological thriller, written decades before psychology was even recognized as a science.",
    legacy: "It pioneered the psychological novel and heavily influenced modern philosophy and psychoanalysis.",
  },
  {
    rank: 7,
    title: "Frankenstein",
    author: "Mary Shelley",
    year: "1818",
    category: "Gothic & Science Fiction",
    accent: "#7CBB4A",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0141439475-L.jpg",
    description: "Written by a teenager during a stormy summer in Geneva, this novel is the true starting point of science fiction. The tragedy does not just belong to Victor Frankenstein, the ambitious scientist who unlocks the secret of life. It also belongs to his creation. The creature is intelligent, well spoken, and deeply sensitive, yet he is abandoned by his maker and hated by humanity. Shelley creates a powerful story about the ethics of creation, the limits of ambition, and the pain of being completely unloved.",
    coreIdea: "Beware; for I am fearless, and therefore powerful. The true monster is not the creature, but the creator who refuses to take responsibility for what he has brought into the world.",
    whyRead: "Pop culture has completely distorted this story over the years. The original book is not a cheap horror story. It is a beautiful, philosophical tragedy that feels more relevant today in the age of AI than it ever has before.",
    legacy: "It created the entire science fiction genre and remains the ultimate warning about scientific ethics and human ego.",
  },
  {
    rank: 8,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    year: "1951",
    category: "Coming-of-Age",
    accent: "#3498DB",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0316769177-L.jpg",
    description: "Set over three days in New York City, the story follows sixteen year old Holden Caulfield. He has just been expelled from his prep school and wanders through an adult world he finds completely fake. Salinger perfectly captures the voice of teenage alienation. Holden is cynical, deeply sensitive, funny, and incredibly lonely. Salinger's writing style was brilliant and forever changed American literature. Holden is desperate for connection but terrified of growing up, wanting only to save children from falling into the harsh world of adulthood.",
    coreIdea: "The mark of the immature man is that he wants to die nobly for a cause, while the mark of the mature man is that he wants to live humbly for one. Adolescence is a grief for the loss of childhood.",
    whyRead: "It is the foundational book of modern youth culture. Salinger's authentic, conversational writing style completely broke the rules of how fiction was supposed to sound.",
    legacy: "It has sold over 65 million copies and permanently defined the classic image of the rebellious, disillusioned teenager.",
  },
  {
    rank: 9,
    title: "Moby-Dick",
    author: "Herman Melville",
    year: "1851",
    category: "Epic Adventure & Philosophy",
    accent: "#C0392B",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0142437247-L.jpg",
    description: "Even though it was initially a commercial failure, Melville's massive story is now recognized as the great American epic. On the surface, it is the story of the whaling ship Pequod and Captain Ahab's crazy quest to kill the white whale that injured him. However, the novel expands into a massive exploration of humanity, nature, religion, and fate. Melville seamlessly switches between a gripping adventure, scientific facts about whales, stage plays, and deep poetry.",
    coreIdea: "To the last I grapple with thee; from hell's heart I stab at thee; for hate's sake I spit my last breath at thee. Obsession is a fire that consumes the vessel carrying it.",
    whyRead: "It is a challenging and monumental mountain of a book. Reading it is a true achievement that gives you access to some of the most ambitious and powerful writing in literary history.",
    legacy: "It was rediscovered in the 1920s and is now a central pillar of American literature. It is the ultimate study of dangerous obsession.",
  },
  {
    rank: 10,
    title: "Don Quixote",
    author: "Miguel de Cervantes",
    year: "1605",
    category: "Satire & Adventure",
    accent: "#1ABC9C",
    coverUrl: "https://covers.openlibrary.org/b/isbn/0060934344-L.jpg",
    description: "Widely considered the very first modern novel, Cervantes' masterpiece follows an aging nobleman named Alonso Quixano. After reading way too many fantasy books about knights, he loses his mind, renames himself Don Quixote, and sets out on a broken down horse to bring justice to the world. Accompanied by his realistic sidekick Sancho Panza, what starts as a hilarious parody turns into a deeply moving story. It explores idealism, reality, and the beauty of fighting for a noble illusion in a harsh world.",
    coreIdea: "Too much sanity may be madness. And maddest of all, to see life as it is and not as it should be. True nobility often looks ridiculous to the cynical observer.",
    whyRead: "It is the absolute foundation of Western fiction. Every buddy comedy, every story of an idealistic dreamer, and every self aware narrative traces its roots right back to Cervantes.",
    legacy: "Panels of global authors routinely vote it the greatest literary work ever written, and it even gave us the word quixotic.",
  },
];

// ─── Schema Generator (JSON-LD) ───────────────────────────────────────
// Generates E-E-A-T compliant structured data for search engines.

const generateSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://techdotsamanta.com/blog/10-classic-books"
    },
    "headline": "10 Classic Books Everyone Should Read Once in Their Lifetime",
    "description": "A curated guide to the masterworks of literature that have shaped human empathy, challenged societal norms, and endured through centuries.",
    "author": {
      "@type": "Organization",
      "name": "AG Classics Editorial",
      "url": "https://techdotsamanta.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AG Publishing House",
      "logo": {
        "@type": "ImageObject",
        "url": "https://techdotsamanta.com/logo.png" // Update with your actual logo path
      }
    },
    "datePublished": "2026-06-12",
    "dateModified": "2026-06-12",
    "mainEntity": {
      "@type": "ItemList",
      "name": "10 Classic Books Everyone Should Read",
      "itemListElement": BOOKS.map((book, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Book",
          "url": `https://techdotsamanta.com/blog/10-classic-books#book-${book.rank}`,
          "name": book.title,
          "author": {
            "@type": "Person",
            "name": book.author
          },
          "image": book.coverUrl,
          "datePublished": book.year,
          "genre": book.category
        }
      }))
    }
  };
};

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
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1" style={{ height: "2px", background: `${book.accent}35` }} />
        ))}
      </div>
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
          alt={`Cover of ${book.title}`}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ aspectRatio: "2/3", display: "block" }}
          onError={() => setErr(true)}
        />
      )}
      <div
        className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)" }}
      >
        <p className="text-[#f0ead8] text-[8px] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {book.title}
        </p>
      </div>
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
    <nav aria-label="Book navigation grid" className="max-w-4xl mx-auto px-5 md:px-8 mb-16">
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {BOOKS.map((book) => (
          <CollageItem key={book.rank} book={book} />
        ))}
      </div>
      <p className="text-center text-[10px] text-[#2e2e2e] mt-3 tracking-[0.25em] uppercase select-none">
        Click any cover to jump to that entry
      </p>
    </nav>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────

function BookCard({ book }: { book: Book }) {
  const [imgErr, setImgErr] = useState(false);
  const rankStr = String(book.rank).padStart(2, "0");

  return (
    <article id={`book-${book.rank}`} className="relative scroll-mt-8">
      <div
        className="h-px w-full"
        style={{ background: `linear-gradient(to right, ${book.accent}55, ${book.accent}15, transparent)` }}
      />

      <div className="py-12 lg:py-14">
        <div className="flex gap-5 sm:gap-7 md:gap-10 lg:gap-12">
          
          <div className="flex-shrink-0 self-start">
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
                  alt={`${book.title} book cover`}
                  className="w-full object-cover block"
                  style={{ aspectRatio: "2/3" }}
                  onError={() => setImgErr(true)}
                  loading="lazy"
                />
              )}
            </div>

            <div
              className="mt-3 h-8 w-px mx-auto"
              style={{ background: `linear-gradient(to bottom, ${book.accent}40, transparent)` }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-semibold mb-3"
              style={{ color: book.accent, opacity: 0.85 }}
            >
              {book.category}
            </span>

            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2 text-[#f5f0e8]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {book.title}
            </h2>

            <div className="flex items-center flex-wrap gap-2 text-sm mb-6">
              <span className="text-[#e3e3e3] font-medium">{book.author}</span>
              <span className="w-1 h-1 rounded-full bg-[#af6f00]" />
              <time dateTime={book.year} className="text-[#bdbdbd]">{book.year}</time>
            </div>

            <div
              className="w-full h-px mb-6"
              style={{ background: `linear-gradient(to right, ${book.accent}30, transparent)` }}
            />

            <p className="text-[#ffffff] leading-[1.9] text-[0.9rem] mb-8">
              {book.description}
            </p>

            <blockquote
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
            </blockquote>

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

export default function ClassicBooksEveryoneShouldRead() {
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
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8dfc8] mt-30" style={{ fontFamily: "'Lato', sans-serif" }}>
      
      {/* ── JSON-LD Structured Data for SEO ── */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
      />

      {/* ── Reading progress bar ── */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50">
        <div
          className="h-full transition-all duration-75"
          style={{ width: `${progress}%`, background: "linear-gradient(to right, #C9A227, #F0CC5A)" }}
        />
      </div>

      <article>
        {/* ══════════════════════════════════════════════════════ */}
        {/* HERO                                                  */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] text-[#333] pt-10 tracking-wider">
            <a href="/" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Home</a>
            <span className="text-white">›</span>
            <a href="/blog" className="hover:text-[#C9A227] text-[#C9A227] transition-colors">Blog</a>
            <span className="text-white">›</span>
            <span className="text-white" aria-current="page">10 Classic Books Everyone Should Read</span>
          </nav>

          <header className="pt-10 pb-0">
            <div className="mb-6">
              <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227] border border-[#C9A227]/25 px-3 py-1.5 font-semibold">
                Reading List
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.03] mb-5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-7xl">10</span> Classic Books{" "}
              <span className="italic text-[#C9A227]">Everyone Should Read</span>
            </h1>

            <p className="text-[1.05rem] text-[#eeeeee] leading-relaxed mb-8 max-w-2xl" style={{ fontWeight: 300 }}>
              A curated guide to the masterworks of literature that have shaped human empathy, challenged societal norms, and endured through centuries, assembled from the AG Classics collection.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#444] tracking-wide">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center text-[#0a0a0a] font-black text-[9px] select-none">
                  AG
                </div>
                <span className="text-white">AG Classics Editorial</span>
              </div>
              <span className="text-white">·</span>
              <time dateTime="2026-06-12" className="text-white">June 2026</time>
              <span className="text-white">·</span>
              <span className="text-white">14 min read</span>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
              <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
              <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
            </div>
          </header>

          <section className="mt-12 mb-12">
            <blockquote className="border-l-2 border-[#C9A227]/50 pl-7 mb-10">
              <p
                className="text-2xl md:text-3xl italic text-[#c9b87a] font-light leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                &ldquo;A classic is a book that has never finished saying what it has to say.&rdquo;
              </p>
              <cite className="block mt-3 text-[10px] tracking-[0.3em] text-[#d8d8d8] not-italic uppercase">
                 Italo Calvino
              </cite>
            </blockquote>

            <p className="text-[#e8e8e8] leading-[1.95] mb-5 text-[0.925rem]">
              The word "classic" is often treated as a synonym for "difficult" or "ancient." In reality, a classic is simply a book that refuses to be forgotten. The ten novels put together here represent the absolute best of storytelling. They capture the complexity, joy, tragedy, and contradictions of the human experience so perfectly that they remain just as important today as the day they were first published.
            </p>
            <p className="text-[#e8e8e8] leading-[1.95] text-[0.925rem]">
              Reading these books is like having a conversation with some of history's greatest minds. We have arranged this list to take you on a journey through societal morality, political rebellion, deep philosophy, and sweeping adventure. These are the foundation stones that built modern literature.
            </p>
          </section>
        </div>

        <BooksCollage />

        <div className="max-w-4xl mx-auto px-5 md:px-8">
          {BOOKS.map((book) => (
            <BookCard key={book.rank} book={book} />
          ))}
        </div>
      </article>

      {/* ══════════════════════════════════════════════════════ */}
      {/* CONCLUSION                                            */}
      {/* ══════════════════════════════════════════════════════ */}
      <aside className="max-w-4xl mx-auto px-5 md:px-8 mt-16 mb-24">
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
            The Conversation <span className="italic text-[#C9A227]">Continues</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            A great novel does more than just reflect the world. It provides a lens that teaches us how to view it. Whether they are exploring the nature of injustice or capturing the fading beauty of a past era, these ten authors left behind much more than just stories. They left behind detailed maps of the human soul.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            You can find all ten of these timeless books in the AG Classics collection. Take some time to browse our carefully curated catalogue of classic literature. We focus on creating beautiful, high quality physical editions that will bring enduring value to your personal bookshelf.
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
      </aside>

    </main>
  );
}