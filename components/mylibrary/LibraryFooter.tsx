"use client";

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400&family=Jost:wght@300;400&display=swap');`;

export default function LibraryFooter() {
  return (
    <>
      <style>{fontImport}</style>

      <footer className="bg-[#0a0a0b] border-t border-[rgba(201,168,76,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2">

          {/* Left — copyright */}
          <span
            className="text-[11px] tracking-[0.5px] text-[#6b6b70] shrink-0"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            © {new Date().getFullYear()}{" "}
            <span className="text-[#8a6f2e]">My Library</span>
          </span>

          {/* Centre — ornament (hidden on very small screens) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-[30px] h-px bg-[rgba(201,168,76,0.15)]" />
            <div className="w-1 h-1 rotate-45 bg-[#8a6f2e] opacity-60" />
            <div className="w-[30px] h-px bg-[rgba(201,168,76,0.15)]" />
          </div>

          {/* Right — tagline */}
          <span
            className="text-[9px] tracking-[3px] uppercase text-[#6b6b70] shrink-0"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Happy Reading
          </span>
        </div>
      </footer>
    </>
  );
}