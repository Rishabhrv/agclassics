"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Billing = "monthly" | "annual";
type PlanId  = "reader" | "scholar" | "collector";

interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  booksPerMonth: number;
  maxCategories: number | "unlimited";
  highlight: boolean;
  badge?: string;
  features: string[];
  color: string;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CATEGORIES: Category[] = [
  { id: "fiction",      label: "Fiction",       icon: "✦", description: "Novels, stories & literary classics" },
  { id: "nonfiction",   label: "Non-Fiction",   icon: "◈", description: "Essays, journalism & true stories" },
  { id: "biography",    label: "Biography",     icon: "◎", description: "Lives worth reading about" },
  { id: "business",     label: "Business",      icon: "◇", description: "Strategy, leadership & finance" },
  { id: "selfhelp",     label: "Self-Help",     icon: "◉", description: "Growth, habits & mindset" },
  { id: "history",      label: "History",       icon: "⬡", description: "Ancient to modern world history" },
  { id: "philosophy",   label: "Philosophy",    icon: "△", description: "Ideas that shaped civilisation" },
  { id: "science",      label: "Science",       icon: "⬢", description: "Discovery, nature & technology" },
  { id: "spirituality", label: "Spirituality",  icon: "✧", description: "Inner wisdom & contemplative texts" },
  { id: "classics",     label: "AG Classics",   icon: "♦", description: "Our handpicked timeless collection" },
];

const PLANS: Plan[] = [
  {
    id: "reader",
    name: "Reader",
    tagline: "Begin your journey",
    monthlyPrice: 199,
    annualPrice: 1799,
    booksPerMonth: 3,
    maxCategories: 1,
    highlight: false,
    features: [
      "3 ebooks per month",
      "1 category of your choice",
      "Instant digital delivery",
      "Read on any device",
      "Cancel anytime",
    ],
    color: "rgba(138,111,46,0.6)",
  },
  {
    id: "scholar",
    name: "Scholar",
    tagline: "Most popular choice",
    monthlyPrice: 399,
    annualPrice: 3599,
    booksPerMonth: 6,
    maxCategories: 3,
    highlight: true,
    badge: "Most Popular",
    features: [
      "6 ebooks per month",
      "Up to 3 categories",
      "Curated monthly selections",
      "Early access to new titles",
      "Priority reader support",
      "Cancel anytime",
    ],
    color: "#d4aa4e",
  },
  {
    id: "collector",
    name: "Collector",
    tagline: "The complete library",
    monthlyPrice: 699,
    annualPrice: 5999,
    booksPerMonth: 12,
    maxCategories: "unlimited",
    highlight: false,
    badge: "Best Value",
    features: [
      "12 ebooks per month",
      "All categories — unlimited",
      "Exclusive collector editions",
      "First access to new releases",
      "Dedicated concierge support",
      "Custom reading recommendations",
      "Cancel anytime",
    ],
    color: "rgba(212,170,78,0.85)",
  },
];

const FAQS = [
  {
    q: "How does the batch delivery work?",
    a: "Each month, we curate and deliver your chosen number of ebooks based on your selected categories. You'll receive a notification when your batch is ready, and all titles are instantly accessible in your AG Classics library.",
  },
  {
    q: "Can I change my categories after subscribing?",
    a: "Yes. You can update your category preferences from your account dashboard at any time. Changes take effect from your next billing cycle.",
  },
  {
    q: "What format are the ebooks delivered in?",
    a: "All ebooks are delivered in PDF, EPUB, and MOBI formats. You can read them on Kindle, Apple Books, Google Play Books, or any e-reader app.",
  },
  {
    q: "What is the difference between monthly and annual billing?",
    a: "Annual billing gives you the equivalent of 2 months free compared to monthly billing. Payment is charged once per year upfront, and you retain access for the full 12 months.",
  },
  {
    q: "Can I pause or cancel my subscription?",
    a: "You can cancel anytime from your account settings. If you cancel mid-cycle, you retain access until the end of your paid period. Pausing for up to 3 months is available on Scholar and Collector plans.",
  },
  {
    q: "Do unused ebooks roll over to the next month?",
    a: "Unused slots do not roll over. We recommend selecting your categories carefully so our curators can make the best picks for you each month.",
  },
];

/* ─────────────────────────────────────────────
   NODE TYPE FOR CONSTELLATION
───────────────────────────────────────────── */
interface Node { x: number; y: number; vx: number; vy: number; }

/* ═════════════════════════════════════════════
   PAGE COMPONENT
═════════════════════════════════════════════ */
export default function SubscriptionPage() {
  const [billing,      setBilling]      = useState<Billing>("monthly");
  const [selected,     setSelected]     = useState<PlanId | null>(null);
  const [catSelections, setCatSelections] = useState<Record<PlanId, Set<string>>>({
    reader: new Set(), scholar: new Set(), collector: new Set(),
  });
  const [openFaq,      setOpenFaq]      = useState<number | null>(null);
  const [loadingPlan,  setLoadingPlan]  = useState<PlanId | null>(null);
  const [toastMsg,     setToastMsg]     = useState<string | null>(null);
  const [hovPlan,      setHovPlan]      = useState<PlanId | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef  = useRef<Node[]>([]);
  const rafRef    = useRef<number>(0);
  const plansRef  = useRef<HTMLElement>(null);

 



  /* ── toast ── */
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  /* ── category toggle ── */
  const toggleCat = (planId: PlanId, catId: string) => {
    const plan = PLANS.find(p => p.id === planId)!;
    const current = catSelections[planId];
    const next = new Set(current);
    if (next.has(catId)) {
      next.delete(catId);
    } else {
      if (plan.maxCategories !== "unlimited" && next.size >= plan.maxCategories) {
        showToast(`${plan.name} allows up to ${plan.maxCategories} categor${plan.maxCategories === 1 ? "y" : "ies"}`);
        return;
      }
      next.add(catId);
    }
    setCatSelections(prev => ({ ...prev, [planId]: next }));
  };

  /* ── subscribe handler ── */
  const handleSubscribe = async (planId: PlanId) => {
    const cats = catSelections[planId];
    const plan = PLANS.find(p => p.id === planId)!;
    const maxCats = plan.maxCategories;
    if (cats.size === 0) { showToast("Please select at least one category"); return; }
    if (maxCats !== "unlimited" && cats.size < maxCats && maxCats > 1) {
      // Allow with fewer — no hard block
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ plan: planId, billing, categories: Array.from(cats) }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      showToast("Subscription started! Check your email.");
      setSelected(planId);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  const annualSavings = (plan: Plan) =>
    Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100);

  const displayPrice = (plan: Plan) =>
    billing === "monthly" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

        :root {
          --void:#05040a; --void2:#0e0c14; --void3:#181520; --void4:#221f2c;
          --gold:#d4aa4e; --gold2:#a07c2a; --gold3:#7a5e1a; --goldf:rgba(212,170,78,0.12);
          --cream:#f0ebe0; --fog:#8a8490; --mist:#5a5660;
          --fh:'Bebas Neue',sans-serif; --fs:'EB Garamond',serif; --fm:'Space Mono',monospace;
        }

        @keyframes fadeUp   {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
        @keyframes scaleIn  {from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
        @keyframes lineGrow {from{width:0}to{width:100%}}
        @keyframes spin     {to{transform:rotate(360deg)}}
        @keyframes pulse    {0%,100%{opacity:.3}50%{opacity:.9}}
        @keyframes marquee  {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes shimmer  {0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes toastIn  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes toastOut {from{opacity:1}to{opacity:0;transform:translateY(8px)}}
        @keyframes glow     {0%,100%{box-shadow:0 0 0 0 rgba(212,170,78,0)}50%{box-shadow:0 0 40px 4px rgba(212,170,78,.12)}}
        @keyframes borderRun{0%{background-position:0 0,100% 0,100% 100%,0 100%}100%{background-position:300px 0,100% 300px,-300px 100%,0 -300px}}
        @keyframes float    {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

        .a1{animation:fadeUp .9s cubic-bezier(.16,1,.3,1) .05s both}
        .a2{animation:fadeUp .9s cubic-bezier(.16,1,.3,1) .2s both}
        .a3{animation:fadeUp .9s cubic-bezier(.16,1,.3,1) .35s both}
        .a4{animation:fadeUp .9s cubic-bezier(.16,1,.3,1) .5s both}
        .a5{animation:scaleIn .8s cubic-bezier(.16,1,.3,1) .65s both}

        /* grain */
        body::before{content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)' opacity='.038'/%3E%3C/svg%3E");
          opacity:.45;mix-blend-mode:soft-light;}

        /* billing toggle */
        .billing-track{
          position:relative;display:inline-flex;
          background:var(--void3);border:1px solid rgba(212,170,78,.18);
          border-radius:0;overflow:hidden;
        }
        .billing-opt{
          position:relative;z-index:1;cursor:pointer;border:none;background:transparent;
          font-family:var(--fm);font-size:8px;letter-spacing:2px;text-transform:uppercase;
          padding:10px 28px;transition:color .3s;
        }
        .billing-opt.on{color:var(--void)!important;}
        .billing-opt:not(.on){color:var(--fog);}
        .billing-slider{
          position:absolute;top:0;bottom:0;width:50%;
          background:linear-gradient(135deg,#d4aa4e,#a07c2a);
          transition:transform .35s cubic-bezier(.16,1,.3,1);
          z-index:0;
        }

        /* plan card */
        .plan-card{
          position:relative;overflow:hidden;
          border:1px solid rgba(212,170,78,.1);
          transition:transform .4s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .4s;
          cursor:default;
        }
        .plan-card:hover{
          transform:translateY(-6px);
          border-color:rgba(212,170,78,.3);
          box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 40px rgba(212,170,78,.06);
        }
        .plan-card.featured{
          border-color:rgba(212,170,78,.4);
          box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 60px rgba(212,170,78,.08);
          animation:glow 4s ease infinite;
        }
        .plan-card.featured:hover{
          transform:translateY(-8px);
          box-shadow:0 44px 100px rgba(0,0,0,.7),0 0 80px rgba(212,170,78,.14);
        }
        /* running gold border on featured */
        .plan-card.featured::before{
          content:'';position:absolute;inset:0;z-index:0;pointer-events:none;
          background:
            linear-gradient(90deg,var(--gold) 40%,transparent 40%) top/6px 1px repeat-x,
            linear-gradient(180deg,var(--gold) 40%,transparent 40%) right/1px 6px repeat-y,
            linear-gradient(90deg,var(--gold) 40%,transparent 40%) bottom/6px 1px repeat-x,
            linear-gradient(180deg,var(--gold) 40%,transparent 40%) left/1px 6px repeat-y;
          opacity:.25;
          animation:borderRun 8s linear infinite;
        }

        /* category chip */
        .cat-chip{
          cursor:pointer;border:1px solid rgba(212,170,78,.15);
          background:rgba(212,170,78,.03);
          transition:all .25s cubic-bezier(.16,1,.3,1);
          position:relative;overflow:hidden;
        }
        .cat-chip:hover{border-color:rgba(212,170,78,.35);background:rgba(212,170,78,.07);}
        .cat-chip.selected{
          border-color:var(--gold);
          background:rgba(212,170,78,.12);
        }
        .cat-chip.selected .cat-icon{color:var(--gold)!important;}
        .cat-chip.selected .cat-label{color:var(--cream)!important;}

        /* step card */
        .step-card{
          position:relative;overflow:hidden;
          border:1px solid rgba(212,170,78,.08);
          transition:border-color .3s,transform .3s;
        }
        .step-card:hover{border-color:rgba(212,170,78,.25);transform:translateY(-3px);}
        .step-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(212,170,78,.03) 0%,transparent 55%);pointer-events:none;}

        /* faq */
        .faq-item{
          border-bottom:1px solid rgba(212,170,78,.08);
          transition:background .25s;
        }
        .faq-item:hover{background:rgba(212,170,78,.03);}
        .faq-q{
          cursor:pointer;display:flex;align-items:center;justify-content:space-between;
          padding:22px 28px;gap:20px;
        }
        .faq-body{
          overflow:hidden;transition:max-height .4s cubic-bezier(.16,1,.3,1),padding .3s;
          max-height:0;
        }
        .faq-body.open{max-height:200px;}

        /* cta strip */
        .cta-card{
          position:relative;overflow:hidden;
          border:1px solid rgba(212,170,78,.2);
          background:linear-gradient(135deg,var(--void3) 0%,var(--void2) 100%);
          animation:glow 5s ease infinite;
        }
        .cta-card::after{
          content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(212,170,78,.07) 0%,transparent 70%);
          pointer-events:none;
        }

        /* subscribe btn */
        .sub-btn{
          font-family:var(--fm);font-size:8px;letter-spacing:3px;text-transform:uppercase;
          border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
          transition:transform .2s,filter .2s;
          width:100%;
        }
        .sub-btn:not([disabled]):hover{filter:brightness(1.14);transform:translateY(-1px);}
        .sub-btn[disabled]{cursor:not-allowed;filter:none!important;transform:none!important;}

        /* spinner */
        .sp{width:9px;height:9px;border:1.5px solid rgba(5,4,10,.25);border-top-color:var(--void);border-radius:50%;animation:spin .6s linear infinite;display:inline-block;}

        /* marquee */
        .mq{animation:marquee 30s linear infinite;}

        /* scrollbar */
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:rgba(212,170,78,.03);}
        ::-webkit-scrollbar-thumb{background:rgba(212,170,78,.2);}

        @media(max-width:900px){
          .plans-grid{grid-template-columns:1fr!important;}
          .steps-grid{grid-template-columns:1fr 1fr!important;}
          .hero-inner{padding:60px 24px!important;}
          .sect{padding:72px 24px!important;}
        }
        @media(max-width:540px){
          .steps-grid{grid-template-columns:1fr!important;}
          .cats-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      {/* constellation */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 10000, background: "var(--void3)", border: "1px solid rgba(212,170,78,.3)", padding: "12px 28px", fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold)", animation: "toastIn .3s ease both", boxShadow: "0 20px 60px rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>
          {toastMsg}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, background: "rgba(5,4,10,.9)", minHeight: "100vh", paddingTop: "130px", fontFamily: "var(--fs)", color: "var(--cream)", overflowX: "hidden" }}>

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section style={{ position: "relative", minHeight: "88vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", overflow: "hidden", padding: "0 24px" }}>

          {/* radial glow */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 40%,rgba(212,170,78,.06) 0%,transparent 65%)", pointerEvents: "none" }} />

          {/* Ghost SUBSCRIBE text */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--fh)", fontSize: "clamp(60px,16vw,220px)", color: "rgba(212,170,78,.025)", lineHeight: 1, letterSpacing: "8px", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap" }}>
            SUBSCRIBE
          </div>

          <div className="hero-inner" style={{ position: "relative", maxWidth: "800px" }}>
            {/* Eyebrow */}
            <div className="a1" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "28px" }}>
              <div style={{ width: "40px", height: "1px", background: "linear-gradient(to right,transparent,var(--gold2))" }} />
              <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)" }}>
                AG Classics — Reading Plans
              </span>
              <div style={{ width: "40px", height: "1px", background: "linear-gradient(to left,transparent,var(--gold2))" }} />
            </div>

            {/* Headline */}
            <h1 className="a2" style={{ fontFamily: "var(--fh)", fontSize: "clamp(68px,11vw,136px)", lineHeight: .88, letterSpacing: "3px", marginBottom: "24px", background: "linear-gradient(155deg,#f0ebe0 20%,#d4aa4e 60%,#a07c2a 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase" }}>
              Own Every<br />Word You<br />Love
            </h1>

            {/* Divider */}
            <div className="a3" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{ flex: 1, maxWidth: "100px", height: "1px", background: "linear-gradient(to right,transparent,rgba(212,170,78,.4))" }} />
              {[.3,.7,1,.7,.3].map((o, i) => <div key={i} style={{ width: "4px", height: "4px", transform: "rotate(45deg)", background: `rgba(212,170,78,${o})` }} />)}
              <div style={{ flex: 1, maxWidth: "100px", height: "1px", background: "linear-gradient(to left,transparent,rgba(212,170,78,.4))" }} />
            </div>

            <p className="a3" style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "clamp(15px,1.8vw,20px)", color: "var(--fog)", lineHeight: 1.85, marginBottom: "48px", maxWidth: "560px", margin: "0 auto 48px" }}>
              Choose your plan, select your categories, and receive a curated batch of ebooks every month — delivered instantly to any device.
            </p>

            {/* ── Billing toggle ── */}
            <div className="a4" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div className="billing-track">
                <div className="billing-slider" style={{ transform: billing === "annual" ? "translateX(100%)" : "translateX(0)" }} />
                <button className={`billing-opt ${billing === "monthly" ? "on" : ""}`} onClick={() => setBilling("monthly")}>Monthly</button>
                <button className={`billing-opt ${billing === "annual" ? "on" : ""}`} onClick={() => setBilling("annual")}>Annual</button>
              </div>
              <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: billing === "annual" ? "var(--gold)" : "var(--mist)", transition: "color .3s", display: "flex", alignItems: "center", gap: "8px" }}>
                {billing === "annual" ? (
                  <>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", animation: "shimmer 1.5s ease infinite" }} />
                    Save up to {annualSavings(PLANS[2])}% with annual billing
                  </>
                ) : "Switch to annual & save up to 29%"}
              </div>
            </div>

            {/* Scroll CTA */}
            <div className="a5" style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <button onClick={() => plansRef.current?.scrollIntoView({ behavior: "smooth" })}
                style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(212,170,78,.5)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                See Plans
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(212,170,78,.5)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: "absolute", bottom: "36px", right: "36px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "4px", color: "rgba(212,170,78,.28)", writingMode: "vertical-rl", textTransform: "uppercase" }}>Plans</div>
            <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom,rgba(212,170,78,.35),transparent)", animation: "pulse 2s ease infinite" }} />
          </div>
        </section>

        {/* ════════════════════════════════════════
            MARQUEE STRIP
        ════════════════════════════════════════ */}
        <div style={{ borderTop: "1px solid rgba(212,170,78,.14)", borderBottom: "1px solid rgba(212,170,78,.14)", background: "var(--void2)", padding: "12px 0", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "60px", background: "linear-gradient(to right,var(--void2),transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60px", background: "linear-gradient(to left,var(--void2),transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div className="mq" style={{ display: "flex", width: "max-content" }}>
            {[...Array(2)].map((_, o) =>
              ["Instant Delivery", "Cancel Anytime", "Any Device", "10 Categories", "3 Flexible Plans", "Monthly or Annual", "Curated Selections", "Exclusive Editions", "Read Anywhere"].map((t, j) => (
                <div key={`${o}-${j}`} style={{ display: "flex", alignItems: "center", padding: "0 40px", whiteSpace: "nowrap", gap: "20px" }}>
                  <div style={{ width: "3px", height: "3px", background: "rgba(212,170,78,.38)", transform: "rotate(45deg)" }} />
                  <span style={{ fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(212,170,78,.4)" }}>{t}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
            § 01 — PLANS
        ════════════════════════════════════════ */}
        <section ref={plansRef as React.RefObject<HTMLElement>} className="sect" style={{ padding: "96px 64px", background: "var(--void)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px" }}>§ 01 — Choose Your Plan</div>
              <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(44px,7vw,88px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>
                Three Tiers.<br />One Library.
              </h2>
              <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "15px", color: "var(--fog)", marginTop: "14px" }}>
                Each plan lets you pick your categories — ebooks delivered fresh every month.
              </p>
            </div>

            {/* ── PLAN CARDS ── */}
            <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", alignItems: "start" }}>
              {PLANS.map((plan) => {
                const isHov = hovPlan === plan.id;
                const cats  = catSelections[plan.id];
                const price = displayPrice(plan);
                const saving = annualSavings(plan);

                return (
                  <div
                    key={plan.id}
                    className={`plan-card ${plan.highlight ? "featured" : ""}`}
                    style={{ background: plan.highlight ? "linear-gradient(160deg,#1a1720 0%,#111018 100%)" : "var(--void2)", padding: "0" }}
                    onMouseEnter={() => setHovPlan(plan.id)}
                    onMouseLeave={() => setHovPlan(null)}
                  >
                    {/* Top accent bar */}
                    <div style={{ height: "3px", background: plan.highlight ? "linear-gradient(to right,#d4aa4e,#a07c2a)" : "rgba(212,170,78,.15)" }} />

                    {/* Card inner */}
                    <div style={{ padding: "36px 32px", position: "relative", zIndex: 1 }}>

                      {/* Badge */}
                      {plan.badge && (
                        <div style={{ position: "absolute", top: "20px", right: "20px", padding: "4px 12px", background: plan.highlight ? "linear-gradient(135deg,#d4aa4e,#a07c2a)" : "rgba(212,170,78,.12)", border: plan.highlight ? "none" : "1px solid rgba(212,170,78,.3)", fontFamily: "var(--fm)", fontSize: "6px", letterSpacing: "2px", textTransform: "uppercase", color: plan.highlight ? "var(--void)" : "var(--gold)" }}>
                          {plan.badge}
                        </div>
                      )}

                      {/* Plan name */}
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--fog)", marginBottom: "6px" }}>Plan</div>
                        <div style={{ fontFamily: "var(--fh)", fontSize: "clamp(36px,4vw,52px)", letterSpacing: "2px", color: plan.highlight ? "var(--gold)" : "var(--cream)", lineHeight: .9, textTransform: "uppercase" }}>{plan.name}</div>
                        <div style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "13px", color: "var(--fog)", marginTop: "6px" }}>{plan.tagline}</div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: "1px", background: "linear-gradient(to right,rgba(212,170,78,.2),transparent)", margin: "20px 0" }} />

                      {/* Price */}
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                          <span style={{ fontFamily: "var(--fm)", fontSize: "10px", color: "var(--fog)" }}>₹</span>
                          <span style={{ fontFamily: "var(--fh)", fontSize: "clamp(48px,5vw,64px)", letterSpacing: "-1px", lineHeight: 1, color: plan.highlight ? "var(--gold)" : "var(--cream)" }}>{price}</span>
                          <span style={{ fontFamily: "var(--fm)", fontSize: "8px", color: "var(--fog)", letterSpacing: "1px" }}>/mo</span>
                        </div>
                        {billing === "annual" && (
                          <div style={{ fontFamily: "var(--fm)", fontSize: "8px", color: "var(--gold)", marginTop: "4px", letterSpacing: "1px" }}>
                            ₹{plan.annualPrice}/yr · Save {saving}%
                          </div>
                        )}
                        {billing === "monthly" && (
                          <div style={{ fontFamily: "var(--fm)", fontSize: "8px", color: "var(--fog)", marginTop: "4px", letterSpacing: "1px" }}>
                            Billed monthly
                          </div>
                        )}
                      </div>

                      {/* Books per month pill */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "rgba(212,170,78,.07)", border: "1px solid rgba(212,170,78,.15)", marginBottom: "24px", marginTop: "8px" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold)" }}>
                          {plan.booksPerMonth} ebooks/month
                        </span>
                      </div>

                      {/* Features */}
                      <ul style={{ listStyle: "none", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {plan.features.map((f, i) => (
                          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <div style={{ width: "14px", height: "14px", border: `1px solid ${plan.highlight ? "var(--gold)" : "rgba(212,170,78,.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                              <svg width="7" height="7" viewBox="0 0 12 12" fill="none" stroke={plan.highlight ? "var(--gold)" : "rgba(212,170,78,.6)"} strokeWidth="2"><polyline points="1 6 4.5 9.5 11 2.5" /></svg>
                            </div>
                            <span style={{ fontFamily: "var(--fs)", fontSize: "13px", color: "var(--fog)", lineHeight: 1.5 }}>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {/* ── Category Picker ── */}
                      <div style={{ marginBottom: "28px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                          <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--fog)" }}>
                            Select {plan.maxCategories === "unlimited" ? "any" : `up to ${plan.maxCategories}`} {plan.maxCategories === 1 ? "category" : "categories"}
                          </div>
                          {cats.size > 0 && (
                            <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "1px", color: "var(--gold)" }}>
                              {cats.size} chosen
                            </div>
                          )}
                        </div>
                        <div className="cats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                          {CATEGORIES.map(cat => {
                            const isSel = cats.has(cat.id);
                            return (
                              <button
                                key={cat.id}
                                className={`cat-chip ${isSel ? "selected" : ""}`}
                                onClick={() => toggleCat(plan.id, cat.id)}
                                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", textAlign: "left", width: "100%" }}
                              >
                                <span className="cat-icon" style={{ fontSize: "12px", color: isSel ? "var(--gold)" : "var(--mist)", flexShrink: 0, fontFamily: "monospace", transition: "color .25s" }}>{cat.icon}</span>
                                <span className="cat-label" style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "1px", textTransform: "uppercase", color: isSel ? "var(--cream)" : "var(--fog)", transition: "color .25s" }}>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Subscribe button */}
                      <button
                        className="sub-btn"
                        disabled={loadingPlan !== null || selected === plan.id}
                        onClick={() => handleSubscribe(plan.id)}
                        style={{
                          padding: "14px 24px",
                          background: selected === plan.id
                            ? "rgba(212,170,78,.12)"
                            : plan.highlight
                            ? "linear-gradient(135deg,#d4aa4e,#a07c2a)"
                            : "transparent",
                          color: selected === plan.id ? "var(--gold)" : plan.highlight ? "var(--void)" : "var(--cream)",
                          border: plan.highlight ? "none" : `1px solid rgba(212,170,78,${plan.id === "collector" ? ".35" : ".2"})`,
                        }}
                      >
                        {loadingPlan === plan.id ? (
                          <span className="sp" />
                        ) : selected === plan.id ? (
                          "✓ Subscribed"
                        ) : (
                          `Start ${plan.name} Plan`
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Under-card note */}
            <p style={{ textAlign: "center", fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "13px", color: "var(--mist)", marginTop: "28px" }}>
              All plans include instant digital delivery. No physical shipping costs.
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════
            § 02 — HOW IT WORKS
        ════════════════════════════════════════ */}
        <section className="sect" style={{ padding: "96px 64px", background: "var(--void2)", position: "relative", overflow: "hidden" }}>
          {/* Gold mesh bg */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(212,170,78,.032) 1px,transparent 1px),linear-gradient(90deg,rgba(212,170,78,.032) 1px,transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,transparent,rgba(212,170,78,.25),transparent)" }} />

          <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px" }}>§ 02 — How It Works</div>
              <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(44px,7vw,88px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>
                Simple.<br />Curated.<br />Delivered.
              </h2>
            </div>

            <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
              {[
                { step: "01", title: "Choose Your Plan", body: "Select Reader, Scholar, or Collector based on how many ebooks you want each month.", icon: "◇" },
                { step: "02", title: "Pick Categories", body: "Tell us your interests. Fiction, Business, History, Philosophy — or as many as your plan allows.", icon: "⬡" },
                { step: "03", title: "We Curate For You", body: "Our editorial team handpicks titles from your chosen categories each month based on quality and reader demand.", icon: "✦" },
                { step: "04", title: "Read Anywhere", body: "Your ebooks arrive instantly in PDF, EPUB, and MOBI. Compatible with every e-reader and device.", icon: "◎" },
              ].map((s) => (
                <div key={s.step} className="step-card" style={{ background: "var(--void)", padding: "36px 28px", position: "relative" }}>
                  {/* Corner marks */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: "14px", height: "14px", borderTop: "1px solid rgba(212,170,78,.28)", borderLeft: "1px solid rgba(212,170,78,.28)" }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: "14px", height: "14px", borderBottom: "1px solid rgba(212,170,78,.28)", borderRight: "1px solid rgba(212,170,78,.28)" }} />

                  <div style={{ fontFamily: "monospace", fontSize: "24px", color: "var(--gold)", marginBottom: "16px", animation: "float 4s ease infinite", display: "inline-block" }}>{s.icon}</div>
                  <div style={{ fontFamily: "var(--fh)", fontSize: "52px", letterSpacing: "2px", color: "rgba(212,170,78,.12)", lineHeight: .85, marginBottom: "16px" }}>{s.step}</div>
                  <div style={{ fontFamily: "var(--fh)", fontSize: "22px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--cream)", marginBottom: "12px" }}>{s.title}</div>
                  <p style={{ fontFamily: "var(--fs)", fontSize: "13px", color: "var(--fog)", lineHeight: 1.75 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            § 03 — CATEGORY SHOWCASE
        ════════════════════════════════════════ */}
        <section className="sect" style={{ padding: "96px 64px", background: "var(--void)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "56px", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px" }}>§ 03 — Categories</div>
                <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(44px,6vw,80px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>10 Worlds<br />To Explore</h2>
              </div>
              <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "14px", color: "var(--fog)", maxWidth: "280px", textAlign: "right", lineHeight: 1.7 }}>
                Every genre. Every mood. Pick the ones that speak to you.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "6px" }}>
              {CATEGORIES.map((cat, i) => (
                <div key={cat.id}
                  style={{
                    position: "relative", padding: "32px 24px",
                    background: i % 3 === 0 ? "var(--void2)" : i % 3 === 1 ? "var(--void3)" : "var(--void)",
                    border: "1px solid rgba(212,170,78,.07)",
                    transition: "border-color .3s,background .3s,transform .3s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,170,78,.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,170,78,.07)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, width: "10px", height: "10px", borderTop: "1px solid rgba(212,170,78,.22)", borderLeft: "1px solid rgba(212,170,78,.22)" }} />
                  <div style={{ fontFamily: "monospace", fontSize: "28px", color: "var(--gold)", marginBottom: "16px", display: "block" }}>{cat.icon}</div>
                  <div style={{ fontFamily: "var(--fh)", fontSize: "20px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--cream)", marginBottom: "8px" }}>{cat.label}</div>
                  <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "12px", color: "var(--fog)", lineHeight: 1.65 }}>{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            § 04 — PLAN COMPARISON TABLE
        ════════════════════════════════════════ */}
        <section className="sect" style={{ padding: "96px 64px", background: "var(--void2)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px" }}>§ 04 — Compare Plans</div>
              <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(40px,6vw,76px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>Side By Side</h2>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--fog)", borderBottom: "1px solid rgba(212,170,78,.12)" }}>Feature</th>
                    {PLANS.map(p => (
                      <th key={p.id} style={{ padding: "16px 24px", textAlign: "center", fontFamily: "var(--fh)", fontSize: "22px", letterSpacing: "1px", textTransform: "uppercase", color: p.highlight ? "var(--gold)" : "var(--cream)", borderBottom: `1px solid rgba(212,170,78,${p.highlight ? ".35" : ".12"})` }}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Ebooks per month",    vals: ["3", "6", "12"] },
                    { label: "Categories",           vals: ["1", "Up to 3", "Unlimited"] },
                    { label: "Instant delivery",     vals: ["✓", "✓", "✓"] },
                    { label: "Any device",           vals: ["✓", "✓", "✓"] },
                    { label: "Curated selections",   vals: ["—", "✓", "✓"] },
                    { label: "Early access",         vals: ["—", "✓", "✓"] },
                    { label: "Exclusive editions",   vals: ["—", "—", "✓"] },
                    { label: "Concierge support",    vals: ["—", "—", "✓"] },
                    { label: "Pause up to 3 months", vals: ["—", "✓", "✓"] },
                  ].map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(255,255,255,.01)" : "transparent", transition: "background .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(212,170,78,.03)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ri % 2 === 0 ? "rgba(255,255,255,.01)" : "transparent"}>
                      <td style={{ padding: "14px 24px", fontFamily: "var(--fs)", fontSize: "13px", color: "var(--fog)", borderBottom: "1px solid rgba(212,170,78,.05)" }}>{row.label}</td>
                      {row.vals.map((v, vi) => (
                        <td key={vi} style={{ padding: "14px 24px", textAlign: "center", fontFamily: v === "✓" || v === "—" ? "monospace" : "var(--fm)", fontSize: v === "✓" ? "14px" : "8px", letterSpacing: "1px", color: v === "✓" ? "var(--gold)" : v === "—" ? "var(--mist)" : "var(--cream)", borderBottom: "1px solid rgba(212,170,78,.05)" }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Price row */}
                  <tr style={{ background: "rgba(212,170,78,.04)" }}>
                    <td style={{ padding: "20px 24px", fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold)" }}>
                      {billing === "monthly" ? "Monthly Price" : "Annual Price"}
                    </td>
                    {PLANS.map(p => (
                      <td key={p.id} style={{ padding: "20px 24px", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--fh)", fontSize: "32px", letterSpacing: "1px", color: p.highlight ? "var(--gold)" : "var(--cream)", lineHeight: 1 }}>
                          ₹{billing === "monthly" ? p.monthlyPrice : p.annualPrice}
                        </div>
                        <div style={{ fontFamily: "var(--fm)", fontSize: "7px", color: "var(--fog)", marginTop: "4px", letterSpacing: "1px" }}>
                          {billing === "annual" ? "/year" : "/month"}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            § 05 — FAQ
        ════════════════════════════════════════ */}
        <section className="sect" style={{ padding: "96px 64px", background: "var(--void)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px" }}>§ 05 — Questions</div>
              <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(40px,6vw,76px)", letterSpacing: "3px", color: "var(--cream)", lineHeight: .88, textTransform: "uppercase" }}>Frequently<br />Asked</h2>
            </div>

            <div style={{ border: "1px solid rgba(212,170,78,.1)" }}>
              {FAQS.map((faq, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ fontFamily: "var(--fh)", fontSize: "22px", letterSpacing: "1px", color: "rgba(212,170,78,.35)", flexShrink: 0, lineHeight: 1, marginTop: "2px" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontFamily: "var(--fs)", fontWeight: 700, fontSize: "16px", color: "var(--cream)", lineHeight: 1.4 }}>{faq.q}</span>
                    </div>
                    <div style={{ width: "28px", height: "28px", flexShrink: 0, border: "1px solid rgba(212,170,78,.2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .3s,border-color .3s", transform: openFaq === i ? "rotate(45deg)" : "none", borderColor: openFaq === i ? "rgba(212,170,78,.5)" : "rgba(212,170,78,.2)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    </div>
                  </div>
                  <div className={`faq-body ${openFaq === i ? "open" : ""}`}>
                    <p style={{ fontFamily: "var(--fs)", fontSize: "14px", color: "var(--fog)", lineHeight: 1.8, padding: "0 28px 24px 56px" }}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            § 06 — FINAL CTA
        ════════════════════════════════════════ */}
        <section className="sect" style={{ padding: "96px 64px", background: "var(--void2)" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div className="cta-card" style={{ padding: "72px 80px", textAlign: "center", position: "relative" }}>
              {/* corner marks */}
              {[[0,0,"top","left"],[0,0,"top","right"],[0,0,"bottom","left"],[0,0,"bottom","right"]].map((_,i) => (
                <div key={i} style={{ position: "absolute", top: i < 2 ? 0 : "auto", bottom: i >= 2 ? 0 : "auto", left: i % 2 === 0 ? 0 : "auto", right: i % 2 !== 0 ? 0 : "auto", width: "24px", height: "24px", borderTop: i < 2 ? "1px solid rgba(212,170,78,.35)" : "none", borderBottom: i >= 2 ? "1px solid rgba(212,170,78,.35)" : "none", borderLeft: i % 2 === 0 ? "1px solid rgba(212,170,78,.35)" : "none", borderRight: i % 2 !== 0 ? "1px solid rgba(212,170,78,.35)" : "none" }} />
              ))}

              <div style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "20px" }}>Start Reading Today</div>

              <h2 style={{ fontFamily: "var(--fh)", fontSize: "clamp(52px,8vw,100px)", letterSpacing: "3px", textTransform: "uppercase", lineHeight: .88, marginBottom: "24px", background: "linear-gradient(155deg,#f0ebe0 20%,#d4aa4e 60%,#a07c2a 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Your Library<br />Awaits
              </h2>

              <p style={{ fontFamily: "var(--fs)", fontStyle: "italic", fontSize: "clamp(14px,1.6vw,18px)", color: "var(--fog)", maxWidth: "500px", margin: "0 auto 40px", lineHeight: 1.85 }}>
                Join thousands of readers who receive handpicked ebooks every month. Cancel anytime.
              </p>

              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => plansRef.current?.scrollIntoView({ behavior: "smooth" })}
                  style={{ fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", padding: "16px 40px", border: "none", background: "linear-gradient(135deg,#d4aa4e,#a07c2a)", color: "var(--void)", cursor: "pointer", transition: "transform .2s,filter .2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                >
                  Choose Your Plan
                </button>
                <button
                  onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
                  style={{ fontFamily: "var(--fm)", fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", padding: "16px 32px", border: "1px solid rgba(212,170,78,.25)", background: "transparent", color: "var(--cream)", cursor: "pointer", transition: "border-color .2s,transform .2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,170,78,.55)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,170,78,.25)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                >
                  {billing === "monthly" ? "Switch to Annual" : "Switch to Monthly"}
                </button>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", marginTop: "40px", flexWrap: "wrap" }}>
                {["No Credit Card Lock-in", "Cancel Anytime", "Instant Access"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--fog)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FOOTER ORNAMENT
        ════════════════════════════════════════ */}
        <div style={{ background: "var(--void)", borderTop: "1px solid rgba(212,170,78,.08)", padding: "36px 64px" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--mist)" }}>
              AG Classics · Reading Plans · All rights reserved
            </span>
            <div style={{ display: "flex", gap: "5px" }}>
              {[.06, .14, .28, .5, .7, .5, .28, .14, .06].map((o, i) => (
                <div key={i} style={{ width: "4px", height: "4px", transform: "rotate(45deg)", background: `rgba(212,170,78,${o})` }} />
              ))}
            </div>
            <span style={{ fontFamily: "var(--fm)", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--mist)" }}>
              Powered by AG Classics
            </span>
          </div>
        </div>

      </div>
    </>
  );
}