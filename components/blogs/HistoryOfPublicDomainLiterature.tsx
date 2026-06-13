"use client";

import React, { useState, useEffect } from "react";

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

// ─── Main Export Component ────────────────────────────────────────────

export default function HistoryOfPublicDomainLiterature() {
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
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8dfc8] md:mt-30" style={{ fontFamily: "'Lato', sans-serif" }}>

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
            <span className="text-white" aria-current="page">History of the Public Domain</span>
          </nav>

          <header className="pt-10 pb-0">
            <div className="mb-6">
              <span className="text-[10px] tracking-[0.38em] uppercase text-[#C9A227] border border-[#C9A227]/25 px-3 py-1.5 font-semibold">
                History & Culture
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#f5f0e8] leading-[1.05] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The History of <br />
              <span className="italic text-[#C9A227]">Public Domain Literature</span>
            </h1>

            <p className="text-[1.1rem] text-[#eeeeee] leading-relaxed mb-8 max-w-2xl" style={{ fontWeight: 300 }}>
              From early copyright laws to today's digital libraries, let's explore how people have fought to keep our stories free and dive into the ongoing debate over who truly owns the greatest books of the past.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#444] tracking-wide">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center text-[#0a0a0a] font-black text-[9px] select-none">
                  AG
                </div>
                <span className="text-white uppercase tracking-wider text-[10px]">AG Classics Editorial</span>
              </div>
              <span className="text-white">·</span>
              <time dateTime="2026-08-15" className="text-white">June 2026</time>
              <span className="text-white">·</span>
              <span className="text-white">9 MIN READ</span>
            </div>

            <div className="mt-12 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
              <span className="text-[#C9A227]/25 text-xl select-none">◆</span>
              <div className="flex-1 h-px bg-gradient-to-l from-[#C9A227]/25 to-transparent" />
            </div>
          </header>

          {/* ══════════════════════════════════════════════════════ */}
          {/* HERO THUMBNAIL IMAGE                                  */}
          {/* ══════════════════════════════════════════════════════ */}
          <figure className="mt-10 mb-14">
            <div className="relative w-full overflow-hidden border border-[#C9A227]/20 bg-[#111]">
              <img
                src="https://internationalpublishers.org/wp-content/uploads/2025/05/Chodowiecki_Basedow_Tafel_21_c_Z-1-e1747039207115-1024x576.jpg"
                alt="Ancient texts and manuscripts representing the origins of literature"
                className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-700 grayscale-[40%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
            </div>
            <figcaption className="text-center text-[10px] tracking-[0.2em] text-[#8a6f2e] uppercase mt-4">
              How storytelling evolved from spoken legends around a fire to mass printed books.
            </figcaption>
          </figure>

          {/* ══════════════════════════════════════════════════════ */}
          {/* ESSAY CONTENT                                         */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="mt-10 mb-20">

            {/* Introduction */}
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              <span className="float-left text-6xl leading-[0.8] pr-3 text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>F</span>
              or most of human history, the idea that someone could actually "own" a story seemed completely ridiculous. When classic tales like Homer's <em>Iliad</em> were shared across the ancient world, they belonged to everyone. People freely changed, adapted, and improved these stories every time they passed them on to the next generation.
            </p>

            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              The concept that a single person or a massive publishing company could lock down a story for nearly a century is a very new invention. To really understand why we care so much about the public domain today, we have to look back at how copyright laws were born, how big corporations started using them for profit, and how the internet is helping us take our shared culture back.
            </p>

            {/* Section 1 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. The Printing Press and the Printing Monopoly
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />
            
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Long before the 15th century, books had to be painstakingly copied out by hand. Because this process took so long, no one really worried about book piracy. That all changed when the printing press was invented. Suddenly, books could be printed and sold in massive numbers.
            </p>

            {/* Float Right Image: Shakespeare / Early Print */}
            <div className="sm:float-right sm:w-[260px] sm:ml-8 mb-6 mt-2 border border-[#C9A227]/20 p-2 bg-[#111]">
              <img 
                src="https://covers.openlibrary.org/b/id/12620612-L.jpg" 
                alt="Early printed folio of Shakespeare" 
                className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
              <p className="text-center text-[10px] text-[#C9A227] tracking-widest uppercase mt-3 mb-1">First Folios</p>
            </div>

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Back in 1557, the English government gave a single group called the Stationers' Company total control over printing. This rule was not made to protect the people writing the books. Instead, it was a sneaky way to censor the public. By controlling the printing presses, the government could easily silence political rebels. Even legendary writers like William Shakespeare did not actually own the rights to their own plays. The publishers who printed them held all the power.
            </p>

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Things finally changed in 1710 with the creation of the world's first real copyright law, known as <strong>The Statute of Anne</strong>. It was a massive breakthrough because it finally gave ownership rights to the <em>author</em> rather than the printing companies. Best of all, it made sure these rights were strictly temporary. Writers were given exclusive rights for 14 years, and they could renew for another 14. After a maximum of 28 years, the book officially belonged to the public.
            </p>

            {/* Pull Quote */}
            <blockquote className="border-l-2 border-[#C9A227] pl-6 my-12 py-2 clear-both">
              <p
                className="text-2xl md:text-3xl italic text-[#c9b87a] font-light leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                &ldquo;Copyright was originally created to be a short, temporary reward to encourage people to write new things. It was never meant to be a permanent asset owned by massive corporations.&rdquo;
              </p>
            </blockquote>

            {/* Section 2 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. The 20th Century: The Era of Extension
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              This balanced system worked beautifully for almost two hundred years. The original laws in the United States completely agreed with this idea, granting creators rights only for a very specific, limited amount of time. A healthy public domain allowed visionaries like Walt Disney to take classic fairy tales from the Brothers Grimm and turn them into massive cinematic empires without having to ask for permission.
            </p>

            {/* Float Left Image: Vintage aesthetic / 1920s */}
            <div className="sm:float-left sm:w-[260px] sm:mr-8 mb-6 mt-2 border border-[#C9A227]/20 p-2 bg-[#111]">
              <img 
                src="https://covers.openlibrary.org/b/id/8259441-L.jpg" 
                alt="Vintage 1920s era novel cover" 
                className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
              <p className="text-center text-[10px] text-[#C9A227] tracking-widest uppercase mt-3 mb-1">Corporate Monopolies</p>
            </div>

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              However, the 20th century completely changed the game. As the entertainment world exploded into a multi billion dollar industry, giant corporations started to panic. They realized that their most profitable properties like books, movies, and beloved characters were about to lose their copyright protection and enter the public domain.
            </p>

            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              These companies spent a lot of money lobbying the government to drastically extend copyright laws. The most famous example is the 1998 extension, which many people jokingly called the Mickey Mouse Protection Act. This new law locked down corporate owned works for 95 years, and protected individual authors for their entire lifetime <em>plus another 70 years</em>. Because of this, the public domain basically hit a brick wall. For two straight decades, almost nothing new became free for the public to use.
            </p>

            {/* Section 3 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5 clear-both" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. The Digital Renaissance and the Great Thaw
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              This massive freeze on the public domain did serious damage to literary history. Countless books became orphan works. These were stories where the original author had passed away, but the legal rights were still locked down tightly. Because nobody could legally reprint or digitize them, thousands of amazing books simply faded away into obscurity.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              Thankfully, the rise of the internet sparked a massive pushback. Amazing projects like the Internet Archive and Project Gutenberg started working around the clock to digitize any classic book they could legally get their hands on. Finally, on January 1, 2019, the long twenty year freeze came to an end. Historic books from 1923 were finally set free and entered the public domain.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-12 text-[1.05rem] font-light">
              Now, we celebrate January 1st as Public Domain Day all over the world. Every single year, a fresh batch of classic literature is officially liberated from corporate vaults. We have recently seen legendary works like <em>The Great Gatsby</em> and <em>Winnie the Pooh</em> finally become free for everyone to enjoy.
            </p>

            {/* Section 4 */}
            <h2 className="text-3xl text-[#f5f0e8] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Why the Battle Still Matters
            </h2>
            <div className="w-12 h-px bg-[#C9A227]/50 mb-6" />

            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              The story of the public domain is really an endless tug of war. On one side, companies want to privatize culture, and on the other side, everyday people want to protect our shared human history. When books are free and unowned, smaller independent publishers can design stunning new physical editions. Filmmakers can put fun new spins on classic characters, and teachers can easily share world class literature with their students without constantly worrying about legal issues.
            </p>
            <p className="text-[#e8e8e8] leading-[2] mb-6 text-[1.05rem] font-light">
              As we move deeper into the digital age, fighting for a healthy public domain is more important than ever. It is the only way we can guarantee that the greatest achievements of human creativity stay exactly where they belong. They belong in the hands of the public.
            </p>

            <div className="clear-both"></div>
          </div>
        </div>
      </article>

      {/* ══════════════════════════════════════════════════════ */}
      {/* CONCLUSION                                            */}
      {/* ══════════════════════════════════════════════════════ */}
      <aside className="max-w-4xl mx-auto px-5 md:px-8 mt-4 mb-24">
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
            Owning Our <span className="italic text-[#C9A227]">Literary Heritage</span>
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227]/50 mt-4 mb-7" />
          <p className="text-[#7a7a7a] leading-[1.9] mb-4 text-[0.925rem]">
            The public domain does not just exist on its own. It is a shared space that we have to actively protect and defend. Whenever we read, preserve, and share these classic stories, we are taking part in the ancient human tradition of passing wisdom down to the next generation.
          </p>
          <p className="text-[#7a7a7a] leading-[1.9] text-[0.925rem] mb-9">
            Here at AG Classics, we absolutely love celebrating this literary freedom. We proudly use the public domain to dig up forgotten masterpieces and breathe new life into them. Our goal is to transform these historic books into beautiful, high quality physical editions that you will be proud to display on your personal bookshelf.
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