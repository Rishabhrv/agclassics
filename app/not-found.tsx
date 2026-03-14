import React from "react";

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
      `}</style>

      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,.04) 0%, transparent 60%)" }} 
        />

        {/* 404 Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <span 
            className="block mb-4 text-[11px] tracking-[5px] uppercase text-[#c9a84c]"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Error 404
          </span>
          
          <h1 
            className="font-light italic text-[#f5f0e8] leading-[1.1] mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 64px)" }}
          >
            A Missing Volume
          </h1>
          
          <p 
            className="text-[14px] leading-[1.7] text-[#6b6b70] max-w-[420px] mb-10"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            The page or collection you are looking for has been misplaced in the archives, or perhaps it never existed at all.
          </p>

          <a 
            href="/"
            className="group relative flex items-center justify-center gap-3 bg-[rgba(201,168,76,.08)] border border-[rgba(201,168,76,.35)] text-[#c9a84c] px-8 py-3.5 transition-all duration-300 hover:bg-[#c9a84c] hover:text-[#0a0a0b] no-underline cursor-pointer"
          >
            <span 
              className="text-[10px] tracking-[2px] uppercase font-medium" 
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Return to Collection
            </span>
            <svg 
              width="14" height="14" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="1.5" 
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>

        {/* Bottom ornament */}
        <div className="flex items-center gap-3 mt-16 w-full max-w-[240px] opacity-60">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,.2)] to-transparent" />
          <div className="w-[5px] h-[5px] rotate-45 flex-shrink-0 bg-[rgba(201,168,76,.4)]" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,.2)] to-transparent" />
        </div>

      </div>
    </>
  );
}