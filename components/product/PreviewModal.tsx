"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Plus, Minus, Search, X, Type, Lock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const READER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;500;600&family=Jost:wght@200;300;400;500&display=swap');

  .ag-reader * { box-sizing: border-box; }

  @keyframes ag-fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ag-spin    { to { transform: rotate(360deg); } }

  .ag-fade-in { animation: ag-fadeIn 0.45s ease both; }
  .ag-spin    { animation: ag-spin 1s linear infinite; }

  .ag-scroll::-webkit-scrollbar       { width: 3px; }
  .ag-scroll::-webkit-scrollbar-track { background: transparent; }
  .ag-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }
  .ag-scroll::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.4); }

  .ag-corner { position: absolute; width: 14px; height: 14px; border-color: rgba(201,168,76,0.35); border-style: solid; }
  .ag-corner.tl { top: 0; left: 0;   border-width: 1px 0 0 1px; }
  .ag-corner.tr { top: 0; right: 0;  border-width: 1px 1px 0 0; }
  .ag-corner.bl { bottom: 0; left: 0;  border-width: 0 0 1px 1px; }
  .ag-corner.br { bottom: 0; right: 0; border-width: 0 1px 1px 0; }

  .ag-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  .ag-highlight { background: rgba(201,168,76,0.22); color: #c9a84c; padding: 0 2px; border-radius: 2px; }

  .ag-slider { appearance: none; width: 100%; height: 2px; background: rgba(201,168,76,0.14); border-radius: 1px; outline: none; cursor: pointer; }
  .ag-slider::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #c9a84c; border: 2px solid #09090c; cursor: pointer; }

  .ag-tooltip {
    position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
    background: #111009; border: 1px solid rgba(201,168,76,0.18);
    color: rgba(245,240,232,0.75); font-family: 'Jost', sans-serif;
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    padding: 5px 10px; white-space: nowrap; pointer-events: none;
    opacity: 0; transition: opacity 0.15s; z-index: 60; border-radius: 2px;
  }
  .ag-icon-btn:hover .ag-tooltip { opacity: 1; }

  .ag-icon-btn {
    width: 36px; height: 36px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s, color 0.2s;
    color: #c9a84c; position: relative; background: transparent; border: none;
  }
  .ag-icon-btn:hover  { background: rgba(201,168,76,0.08); }
  .ag-icon-btn.ag-active { background: rgba(201,168,76,0.11); }
  .ag-icon-btn.ag-active::before {
    content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 2px; height: 16px; background: #c9a84c; border-radius: 0 2px 2px 0;
  }

  .ag-nav-btn {
    width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.22); background: rgba(201,168,76,0.05);
    color: rgba(201,168,76,0.6);  align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
    backdrop-filter: blur(8px);
  }
  .ag-nav-btn:hover  { background: rgba(201,168,76,0.14); border-color: #c9a84c; color: #c9a84c; transform: scale(1.06); }
  .ag-nav-btn:active { transform: scale(0.96); }

  .ag-type-btn {
    padding: 7px 10px; border: 1px solid rgba(201,168,76,0.14);
    background: transparent; color: #c9a84c; font-family: 'Jost', sans-serif;
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.18s; border-radius: 3px;
  }
  .ag-type-btn:hover  { border-color: #c9a84c; background: rgba(201,168,76,0.05); }
  .ag-type-btn.ag-active { border-color: #c9a84c; color: #06060a; background: #c9a84c; }

  .ag-search-input {
    width: 100%; background: rgba(201,168,76,0.04); border: 1px solid rgba(231, 174, 19, 0.8);
    color: rgba(245,240,232,0.85); font-family: 'Jost', sans-serif; font-size: 11px;
    letter-spacing: 0.3px; padding: 9px 36px 9px 12px; outline: none;
    border-radius: 3px; transition: border-color 0.2s, background 0.2s;
  }
  .ag-search-input::placeholder { color: rgba(225, 171, 24, 0.83); }
  .ag-search-input:focus { border-color: rgba(243,179,5,0.95); background: rgba(201,168,76,0.07); }

  .ag-header-btn {
    background: transparent; border: 1px solid rgba(232, 178, 29, 0.9); border-radius: 3px;
    cursor: pointer; color: #c9a84c; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .ag-header-btn:hover { border-color: rgba(201,168,76,0.45); background: rgba(201,168,76,0.06); }
`;

const GoldDiamond = ({ size = 4 }: { size?: number }) => (
  <div className="shrink-0" style={{ width: size, height: size, background: "rgba(201,168,76,0.55)", transform: "rotate(45deg)" }} />
);

const GoldRule = () => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-px bg-[rgba(201,168,76,0.08)]" />
    <GoldDiamond size={3} />
    <div className="flex-1 h-px bg-[rgba(201,168,76,0.08)]" />
  </div>
);

const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6"  r="1.2" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="3" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export default function PreviewModal({
  slug,
  title,
  mainImage,
  ebookCover,
  onClose,
}: {
  slug: string;
  title: string;
  mainImage: string | null;
  ebookCover: string | null;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);

  const isAtFirstPageRef = useRef(true);
  const lastValidCfiRef = useRef<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [pageMode, setPageMode] = useState<"single" | "double">("double");
  const [fontSize, setFontSize] = useState(100);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<any[]>([]);
  const [fontFamily, setFontFamily] = useState("serif");
  const [lineHeight, setLineHeight] = useState(1.6);
  const [panel, setPanel] = useState<"search" | "toc" | "typography">("toc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookReady, setBookReady] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  
  const [showCover, setShowCover] = useState(true);
  const [paywallReached, setPaywallReached] = useState(false);

  const PAGE_LIMIT = 10;
  const activeCover = pageMode === "single" ? mainImage : (ebookCover || mainImage);

  const navState = useRef({ showCover, activeCover });
  useEffect(() => { navState.current = { showCover, activeCover }; }, [showCover, activeCover]);

  useEffect(() => {
    const check = () => { const m = window.innerWidth < 768; setIsMobile(m); if (m) setPageMode("single"); };
    check(); window.addEventListener("resize", check); return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let blurTimer: ReturnType<typeof setTimeout>;
    const handleBlur = () => { blurTimer = setTimeout(() => { if (!document.hasFocus()) setIsBlurred(true); }, 100); };
    const handleFocus = () => { clearTimeout(blurTimer); setIsBlurred(false); };
    const handleVisibility = () => { setIsBlurred(document.visibilityState === "hidden"); };
    window.addEventListener("blur", handleBlur); window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { clearTimeout(blurTimer); window.removeEventListener("blur", handleBlur); window.removeEventListener("focus", handleFocus); document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);

  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("copy", prevent); document.addEventListener("cut", prevent); document.addEventListener("contextmenu", prevent);
    const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && ["c","x","a","p"].includes(e.key.toLowerCase())) e.preventDefault(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("copy", prevent); document.removeEventListener("cut", prevent); document.removeEventListener("contextmenu", prevent); document.removeEventListener("keydown", handleKeyDown); };
  }, []);

  useEffect(() => { if (typeof window !== "undefined") import("@/lib/foliate/view.js"); }, []);

  useEffect(() => {
    if (!slug || !containerRef.current) return;
    let destroyed = false;
    
    const loadBook = async () => {
      setLoading(true); setBookReady(false);
      // Fetch from the UN-AUTHENTICATED public endpoint
      const res = await fetch(`${API_URL}/api/ag-classics/${slug}/preview`);
      if (!res.ok) {
        setLoading(false);
        return; 
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (destroyed) return;
      
      await customElements.whenDefined("foliate-view");
      const view = document.createElement("foliate-view") as any;
      containerRef.current!.innerHTML = "";
      containerRef.current!.appendChild(view);
      viewRef.current = view;
      
      view.addEventListener("relocate", (e: any) => {
        setProgress(Math.round(e.detail.fraction * 100));
        isAtFirstPageRef.current = e.detail.atStart === true || e.detail.location?.atStart === true || e.detail.fraction <= 0.001;

        const loc = e.detail.location;
        if (loc) {
          const cur = loc.current ?? null; 
          const tot = loc.total ?? null;
          if (cur !== null) {
            setCurrentPage(cur);
            setTotalPages(tot);

            // PAYWALL LOGIC: Block reading after page 10
            if (cur >= PAGE_LIMIT) {
              setPaywallReached(true);
              if (lastValidCfiRef.current) {
                view.goTo(lastValidCfiRef.current);
              }
            } else {
              lastValidCfiRef.current = e.detail.cfi;
            }
          }
        }
      });
      
      await view.open(url);
      setToc(view.book?.toc || []); 
      setLoading(false); 
      setBookReady(true);
    };
    loadBook();
    return () => { destroyed = true; setBookReady(false); viewRef.current?.close?.(); viewRef.current?.remove?.(); };
  }, [slug]);

  useEffect(() => {
    if (!viewRef.current || !bookReady) return;
    const apply = () => {
      const contents = viewRef.current.renderer?.getContents?.();
      if (!contents) return;
      contents.forEach((item: any) => {
        const doc = item.doc; 
        if (!doc) return;
        doc.documentElement.style.fontSize = `${fontSize}%`;
        doc.documentElement.style.fontFamily = fontFamily;

        let s = doc.getElementById("ag-reader-styles");
        if (!s) {
          s = doc.createElement("style");
          s.id = "ag-reader-styles";
          doc.head.appendChild(s);
        }

        const mediaFilter = theme === "dark" ? "img, image, video, svg, canvas { filter: invert(1) hue-rotate(180deg) !important; }" : "";

        s.innerHTML = `
          html,body,p,div,span,li,blockquote{line-height:${lineHeight}!important}
          *{-webkit-user-select:none!important;user-select:none!important}
          ${mediaFilter}
        `;
        
        if (!doc.documentElement.dataset.eventsBound) {
          const block = (e: Event) => e.preventDefault();
          doc.addEventListener("copy", block); doc.addEventListener("cut", block); doc.addEventListener("contextmenu", block);
          doc.addEventListener("keydown", (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && ["c","x","a","p"].includes(e.key.toLowerCase())) e.preventDefault(); });
          doc.documentElement.dataset.eventsBound = "true";
        }
      });
    };
    apply();
    viewRef.current.addEventListener("load", apply);
    return () => viewRef.current?.removeEventListener("load", apply);
  }, [fontSize, fontFamily, lineHeight, bookReady, theme]);

  const handleSearch = async (query: string) => {
    if (!viewRef.current || !bookReady || query.trim().length < 3) { setSearchResults([]); viewRef.current?.clearSearch?.(); return; }
    setSearching(true); setSearchResults([]);
    const results: any[] = [];
    try {
      for await (const item of viewRef.current.search({ query, wholeWords: false })) {
        if (item === "done") break;
        if (item.subitems) item.subitems.forEach((sub: any) => results.push({ cfi: sub.cfi, excerpt: sub.excerpt, label: item.label }));
      }
      setSearchResults(results);
    } catch {}
    setSearching(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.style.setProperty("filter", theme === "dark" ? "invert(1) hue-rotate(180deg)" : "none");
  }, [theme]);

  useEffect(() => {
    if (!viewRef.current?.renderer) return;
    const r = viewRef.current.renderer;
    r.setAttribute("flow", "paginated");
    r.setAttribute("max-column-count", pageMode === "single" ? "1" : "2");
  }, [pageMode]);

  const handleNext = () => {
    if (paywallReached) return;
    const { showCover, activeCover } = navState.current;
    if (showCover && activeCover) { setShowCover(false); } else { viewRef.current?.next(); }
  };

  const handlePrev = () => {
    if (paywallReached) return;
    const { showCover } = navState.current;
    if (showCover) return; 
    const isAtStart = isAtFirstPageRef.current || viewRef.current?.location?.atStart;
    if (isAtStart) { setShowCover(true); } else { viewRef.current?.prev(); }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") handleNext();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") handlePrev();
    };
    const handleWheel = (e: WheelEvent) => { e.deltaY > 0 ? handleNext() : handlePrev(); }; 
    window.addEventListener("keydown", handleKeyDown); window.addEventListener("wheel", handleWheel);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("wheel", handleWheel); };
  }, [paywallReached]);

  useEffect(() => {
    let sx = 0;
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => { 
        if(paywallReached) return;
        const d = sx - e.changedTouches[0].clientX; 
        if (Math.abs(d) > 50) { if (d > 0) handleNext(); else handlePrev(); } 
    };
    window.addEventListener("touchstart", onStart, { passive: true }); window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [paywallReached]);

  const panelDefs = [
    { id: "toc"        as const, icon: <ListIcon />,           label: "Contents"  },
    { id: "search"     as const, icon: <Search size={15} />,   label: "Search"    },
    { id: "typography" as const, icon: <Type size={15} />,     label: "Reading"   },
  ];

  return (
    <div
      className="ag-reader fixed inset-0 z-[9999] flex flex-col bg-[#06060a] text-[#f5f0e8] select-none"
      style={{ fontFamily: "'Jost', sans-serif", WebkitUserSelect: "none" }}
    >
      <style>{READER_STYLES}</style>
      <div className="ag-noise absolute inset-0 opacity-[0.018] z-0 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)" }}
        aria-hidden="true"
      />

      {/* ══ HEADER ══ */}
        <header className="absolute right-0 z-10 h-10 px-[18px] hidden md:block items-center justify-end backdrop-blur-md shrink-0">
          <button onClick={toggleFullscreen} className="ag-header-btn hidden md:flex w-[30px] h-[30px] text-[13px]  my-3 mr-2 float-left" title="Fullscreen">⛶</button>
          <button onClick={onClose} className="ag-header-btn w-[30px] h-[30px] text-[13px] my-3 float-left" title="Close Preview"><X size={12} /></button>
        </header>
        <div className="absolute top-5 right-0 z-10 h-10 px-[18px]  md:hidden items-center justify-end  shrink-0">
          <button onClick={onClose} className="ag-header-btn w-[30px] h-[30px] text-[13px]" title="Close Preview"><X size={12} /></button>
        </div>

      {/* ══ BODY ══ */}
      <div className="flex flex-1 min-h-0 relative z-[1]">

        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 bg-black/70 z-[30] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ══ SIDEBAR ══ */}
        <aside
          className="flex shrink-0 bg-[#080809] border-r border-[rgba(201,168,76,0.08)] overflow-hidden transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            position: isMobile ? "fixed" : "relative",
            top: isMobile ? 0 : "auto",
            left: isMobile ? 0 : "auto",
            height: "100%",
            zIndex: isMobile ? 40 : "auto",
            width: isMobile ? (sidebarOpen ? 272 : 0) : (sidebarOpen ? 322 : 50),
          }}
        >
          <div className="w-[50px] shrink-0 flex flex-col items-center py-[14px] gap-[3px] border-r border-[rgba(201,168,76,0.06)]">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="w-[34px] h-[34px] bg-transparent border-none cursor-pointer flex items-center justify-center text-[#c9a84c] hover:text-white transition-colors duration-200 mb-2 rounded-md"
            >
              {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
            <div className="w-[22px] h-px bg-[rgba(201,168,76,0.10)] mb-[6px]" />
            {panelDefs.map(item => (
              <button
                key={item.id}
                onClick={() => { setPanel(item.id); if (!sidebarOpen) setSidebarOpen(true); }}
                className={`ag-icon-btn ${panel === item.id && sidebarOpen ? "ag-active" : ""}`}
              >
                {item.icon}
                <span className="ag-tooltip">{item.label}</span>
              </button>
            ))}
            <div className="mt-2 flex flex-col items-center gap-[5px] pb-[2px]">
              <div className="w-[22px] h-px bg-[rgba(212, 160, 18, 0.83)]" />
              <span className="text-[8px] tracking-[2px] text-[#c9a84c]">{progress}%</span>
            </div>
          </div>

          {sidebarOpen && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden ag-fade-in">
              <div className="px-4 pt-[14px] pb-3 border-b border-[rgba(201,168,76,0.07)] shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-[2.5px] h-[13px] bg-[#c9a84c] rounded-[1px]" />
                  <span className="text-[11px] tracking-[3px] text-[#c9a84c] uppercase font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                    {panel === "toc" ? "Contents" : panel === "search" ? "Search" : "Reading"}
                  </span>
                </div>
                {isMobile && (
                  <button onClick={() => setSidebarOpen(false)} className="bg-transparent border-none cursor-pointer text-[rgba(201,168,76,0.35)] leading-none">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="ag-scroll flex-1 overflow-y-auto">
                {/* ── SEARCH ── */}
                {panel === "search" && (
                  <div className="p-[14px]">
                    <div className="relative mb-3">
                      <input
                        value={searchQuery}
                        onChange={e => {
                          const v = e.target.value;
                          setSearchQuery(v);
                          if (v.trim().length >= 3) handleSearch(v);
                          else { setSearchResults([]); viewRef.current?.clearSearch?.(); }
                        }}
                        placeholder="Search in book…"
                        className="ag-search-input"
                        style={{ userSelect: "text", WebkitUserSelect: "text" }}
                      />
                      <Search size={12} className="absolute right-[11px] top-1/2 -translate-y-1/2 text-[#c9a84c] pointer-events-none" />
                    </div>
                    {searching && (
                      <div className="flex items-center gap-2 text-[#c9a84c] text-[10px] py-[6px]">
                        <div className="ag-spin w-[10px] h-[10px] border-[1.5px] border-[#c9a84c] rounded-full" />
                        Searching…
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div>
                        <p className="text-[8px] tracking-[2px] text-[#c9a84c] uppercase mb-2">{searchResults.length} results</p>
                        <div className="flex flex-col gap-[1px]">
                          {searchResults.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => { viewRef.current?.goTo(r.cfi); if (isMobile) setSidebarOpen(false); }}
                              className="text-left px-2 py-[9px] bg-transparent border border-transparent rounded-[3px] cursor-pointer transition-all duration-150 hover:bg-[rgba(201,168,76,0.04)] hover:border-[rgba(201,168,76,0.09)]"
                            >
                              <p className="text-[9px] tracking-[0.5px] text-[rgba(201,168,76,0.65)] mb-[3px]" style={{ fontFamily: "'Cinzel', serif" }}>{r.label}</p>
                              {r.excerpt && (
                                <p className="text-[13px] text-white leading-[1.55]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                  {r.excerpt.pre}
                                  <span className="ag-highlight">{r.excerpt.match}</span>
                                  {r.excerpt.post}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                      <p className="text-[12px] text-[#c9a84c] text-center py-7 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No results found</p>
                    )}
                  </div>
                )}

                {/* ── TOC ── */}
                {panel === "toc" && (
                  <div className="py-2">
                    <button
                      onClick={() => { viewRef.current?.goTo(toc[0]?.href); if (isMobile) setSidebarOpen(false); }}
                      className="w-full text-left px-4 py-[10px] bg-transparent border-none border-b border-[rgba(201,168,76,0.06)] cursor-pointer flex items-center justify-between gap-2 mb-[6px] transition-colors duration-150 hover:bg-[rgba(201,168,76,0.04)]"
                    >
                      <span className="text-[13px] text-[rgba(255,252,247,0.97)] leading-[1.4]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title}</span>
                      <ChevronRight size={11} className="text-[rgba(201,168,76,0.3)] shrink-0" />
                    </button>
                    <div className="px-[6px]">
                      {toc.slice(1).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { viewRef.current?.goTo(item.href); if (isMobile) setSidebarOpen(false); }}
                          className="w-full text-left px-[10px] py-[7px] bg-transparent border-none cursor-pointer flex items-center gap-[9px] rounded-[3px] transition-all duration-150 hover:bg-[rgba(201,168,76,0.05)]"
                        >
                          <div className="w-1 h-1 border border-[#c9a84c] rotate-45 shrink-0" />
                          <span className="text-[12px] text-[rgba(255,255,255,0.94)] tracking-[0.3px]" style={{ fontFamily: "'Jost', sans-serif" }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TYPOGRAPHY ── */}
                {panel === "typography" && (
                  <div className="p-[14px] flex flex-col gap-[18px]">
                    <div>
                      <p className="text-[10px] tracking-[3px] text-[#ffbb00] uppercase mb-[9px]" style={{ fontFamily: "'Cinzel', serif" }}>Typeface</p>
                      <div className="grid grid-cols-2 gap-[5px]">
                        {[{ value: "serif", label: "Serif" }, { value: "sans-serif", label: "Sans" }, { value: "Georgia", label: "Georgia" }, { value: "Arial", label: "Arial" }].map(f => (
                          <button key={f.value} onClick={() => setFontFamily(f.value)} className={`ag-type-btn ${fontFamily === f.value ? "ag-active" : ""}`} style={{ fontFamily: f.value }}>{f.label}</button>
                        ))}
                      </div>
                    </div>
                    <GoldRule />
                    <div>
                      <div className="flex items-center justify-between mb-[9px]">
                        <p className="text-[10px] tracking-[3px] text-[#ffbb00] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>Font Size</p>
                        <span className="text-[9px] tracking-[1px] text-[#c9a84c]">{fontSize}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setFontSize(f => Math.max(60, f - 10))} className="w-[30px] h-[30px] shrink-0 border border-[rgba(201,168,76,0.13)] bg-transparent rounded-[3px] cursor-pointer text-[#c9a84c] text-[14px] flex items-center justify-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>A−</button>
                        <input type="range" min={60} max={200} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="ag-slider" />
                        <button onClick={() => setFontSize(f => Math.min(200, f + 10))} className="w-[30px] h-[30px] shrink-0 border border-[rgba(201,168,76,0.13)] bg-transparent rounded-[3px] cursor-pointer text-[#c9a84c] text-[14px] flex items-center justify-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>A+</button>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-[9px]">
                        <p className="text-[10px] tracking-[3px] text-[#ffbb00] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>Line Spacing</p>
                        <span className="text-[9px] tracking-[1px] text-[#c9a84c]">{lineHeight.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setLineHeight(l => Math.max(1, parseFloat((l - 0.1).toFixed(1))))} className="w-[30px] h-[30px] shrink-0 border border-[rgba(201,168,76,0.13)] bg-transparent rounded-[3px] cursor-pointer text-[#c9a84c] flex items-center justify-center"><Minus size={12} /></button>
                        <input type="range" min={10} max={30} value={Math.round(lineHeight * 10)} onChange={e => setLineHeight(+e.target.value / 10)} className="ag-slider" />
                        <button onClick={() => setLineHeight(l => Math.min(3, parseFloat((l + 0.1).toFixed(1))))} className="w-[30px] h-[30px] shrink-0 border border-[rgba(201,168,76,0.13)] bg-transparent rounded-[3px] cursor-pointer text-[#c9a84c] flex items-center justify-center"><Plus size={12} /></button>
                      </div>
                    </div>
                    <GoldRule />
                    {!isMobile && (
                      <div>
                        <p className="text-[10px] tracking-[3px] text-[#ffbb00] uppercase mb-[9px]" style={{ fontFamily: "'Cinzel', serif" }}>Layout</p>
                        <div className="flex gap-[5px]">
                          {[{ value: "single", label: "Single" }, { value: "double", label: "Double" }].map(m => (
                            <button key={m.value} onClick={() => setPageMode(m.value as any)} className={`ag-type-btn flex-1 ${pageMode === m.value ? "ag-active" : ""}`}>{m.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] tracking-[3px] text-[#ffbb00] uppercase mb-[9px]" style={{ fontFamily: "'Cinzel', serif" }}>Theme</p>
                      <div className="flex gap-[5px]">
                        {[{ value: "light", label: "☀ Light" }, { value: "dark", label: "☾ Dark" }].map(t => (
                          <button key={t.value} onClick={() => setTheme(t.value as any)} className={`ag-type-btn flex-1 ${theme === t.value ? "ag-active" : ""}`}>{t.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ══ READER ══ */}
        <main className="flex-1 flex flex-col min-w-0 relative z-[1]">

          <div className="h-1 bg-[rgba(201,168,76,0.08)] shrink-0 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, rgba(201,168,76,0.4), #c9a84c)", boxShadow: "0 0 6px rgba(201,168,76,0.4)" }}
            />
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[18px] z-[20]">
                <div className="w-11 h-11 border border-[rgba(201,168,76,0.14)] border-t-[#c9a84c] rounded-full ag-spin" />
                <div className="text-center flex flex-col gap-[5px]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-[18px] h-px bg-[rgba(201,168,76,0.25)]" />
                    <span className="text-[8px] tracking-[4px] text-[rgba(201,168,76,0.45)] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>Opening Preview</span>
                    <div className="w-[18px] h-px bg-[rgba(201,168,76,0.25)]" />
                  </div>
                  <p className="text-[13px] italic text-[rgba(245,240,232,0.28)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title || "Loading…"}</p>
                </div>
              </div>
            )}

            <div className="relative w-full h-full flex items-center justify-center px-0 py-0 sm:px-[68px]">
              {isBlurred && (
                <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center gap-[14px]" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(6,6,10,0.6)" }}>
                  <div className="w-[46px] h-[46px] border border-[rgba(201,168,76,0.18)] rounded-full flex items-center justify-center">
                    <svg className="w-[19px] h-[19px] text-[rgba(201,168,76,0.45)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] tracking-[3px] text-[rgba(201,168,76,0.55)] uppercase mb-[5px]" style={{ fontFamily: "'Cinzel', serif" }}>Content Hidden</p>
                    <p className="text-[13px] italic text-[rgba(245,240,232,0.28)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Return to this window to continue reading</p>
                  </div>
                </div>
              )}

               {showCover && activeCover && !loading && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#06060a]">
                  <img src={activeCover} alt="Book Cover" className="max-h-[75vh] w-auto shadow-2xl mb-8 rounded-r-md border border-[rgba(201,168,76,0.2)]" />
                </div>
              )}

              {pageMode === "double" && !isMobile && (
                <div className="absolute top-[6%] bottom-[6%] left-1/2 -translate-x-1/2 w-px pointer-events-none z-[30]" style={{ background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.59) 20%, rgba(201,168,76,0.39) 80%, transparent)" }} />
              )}

              <div className="relative w-full h-full" style={{ maxWidth: pageMode === "double" && !isMobile ? 940 : 660, maxHeight: "90vh" }}>
                <div className="ag-corner tl" /><div className="ag-corner tr" /><div className="ag-corner bl" /><div className="ag-corner br" />

                {currentPage !== null && totalPages !== null && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[30] pointer-events-none">
                    <div className="flex items-center gap-[7px] bg-[rgba(6,6,10,0.82)] border border-[rgba(201,168,76,0.10)] px-[13px] py-1 backdrop-blur-sm">
                      <GoldDiamond size={3} />
                      <span className="text-[10px] tracking-[2.5px] text-[rgba(255,195,28,0.97)]" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {pageMode === "double" && !isMobile
                          ? progress >= 99 ? `${currentPage + 1}` : `${currentPage + 1} – ${currentPage + 2}`
                          : `${currentPage + 1}`}
                      </span>
                      <GoldDiamond size={3} />
                    </div>
                  </div>
                )}

                <div
                  ref={containerRef}
                  className="w-full h-full select-none"
                  style={{
                    background: theme === "dark" ? "#000" : "#fff",
                    WebkitUserSelect: "none",
                    filter: isBlurred ? "blur(20px)" : "none",
                    transition: "filter 0.25s ease",
                    boxShadow: "0 0 0 1px rgba(201,168,76,0.11), 0 28px 70px rgba(0,0,0,0.65)",
                  }}
                />

                {/* 🚨 THE PAYWALL OVERLAY 🚨 */}
                {paywallReached && (
                  <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md">
                    <div className="w-16 h-16 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mb-6 bg-[rgba(201,168,76,0.05)] text-[#c9a84c]">
                      <Lock size={20} />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-[18px] h-px bg-[rgba(201,168,76,0.35)]" />
                        <span className="text-[10px] tracking-[3px] text-[#c9a84c] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>Free Preview Ended</span>
                        <div className="w-[18px] h-px bg-[rgba(201,168,76,0.35)]" />
                    </div>
                    <h3 className="text-[26px] text-[#f5f0e8] italic mb-4 text-center leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Get the Full Story
                    </h3>
                    <p className="text-[14px] text-[rgba(245,240,232,0.6)] mb-8 text-center max-w-sm leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                      You have reached the end of the 10-page preview. Purchase the full eBook to unlock unlimited reading, cross-device sync, and bookmarks.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setPaywallReached(false)}
                        className="px-6 py-2.5 bg-transparent border border-[rgba(201,168,76,0.2)] text-[#e8e0d0] text-[10px] tracking-[2.5px] uppercase cursor-pointer transition-all duration-300 hover:border-[rgba(201,168,76,0.5)] hover:text-[#c9a84c]"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        Go Back
                      </button>
                      <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-[#c9a84c] border border-[#c9a84c] text-[#0c0c0e] text-[10px] tracking-[2.5px] uppercase font-medium cursor-pointer transition-all duration-300 hover:bg-[#e4be54]"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        Unlock Full Book
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handlePrev} className="ag-nav-btn hidden md:flex absolute left-[18px] top-1/2 -translate-y-1/2 z-50">
              <ChevronLeft className="hidden md:flex" size={17} />
            </button>
            <button onClick={handleNext} className="ag-nav-btn hidden md:flex absolute right-[18px] top-1/2 -translate-y-1/2 z-50">
              <ChevronRight className="hidden md:flex" size={17} />
            </button>
          </div>

          <div className="md:hidden shrink-0 flex items-center justify-between px-[14px] py-[9px] border-t border-[rgba(201,168,76,0.08)] bg-[rgba(6,6,10,0.96)]">
            <button onClick={handlePrev} className="ag-nav-btn flex w-10 h-10"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-[3px]">
              {panelDefs.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setPanel(item.id); setSidebarOpen(true); }}
                  className="w-[37px] h-[37px] bg-transparent border-none cursor-pointer flex items-center justify-center rounded-[5px] transition-colors duration-200"
                  style={{ color: panel === item.id && sidebarOpen ? "#ffbb00" : "rgba(255, 190, 10, 0.81)" }}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            <button onClick={handleNext} className="ag-nav-btn flex w-10 h-10"><ChevronRight size={16} /></button>
          </div>
        </main>
      </div>
    </div>
  );
}