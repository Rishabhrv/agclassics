"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { RevealText } from "@/components/motion/Motionutils";

const themeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  .anim-fade-up { 
    animation: fadeUp 1s ease forwards; 
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .mag-cta { position: relative; overflow: hidden; }
  .mag-cta::after {
    content: '';
    position: absolute;
    top: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  }
  .mag-cta:hover::after { animation: shimmerSweep 0.55s ease; }
  @keyframes shimmerSweep {
    from { left: -50%; }
    to { left: 150%; }
  }

  .plan-card {
    transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
  }
  .plan-card:hover {
    border-color: #c9a84c !important;
    transform: translateY(-6px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  }
`;

// ── Pricing derived from ₹399 / month ──────────────────────────
// Monthly  : ₹399       × 1  = ₹399   (base)
// Quarterly: ₹399       × 3  = ₹1197  → ₹999   (save ₹198, ~17% off)
// Yearly   : ₹399       × 12 = ₹4788  → ₹3599  (save ₹1189, ~25% off)
// ───────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const router = useRouter();

  return (
    <>
      <style>{themeStyles}</style>
      <div
        className="min-h-screen bg-[#0a0a0b] text-[#e8e0d0] pt-[130px] pb-20"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 py-16 text-center overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none select-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "200px" }}
          >
            Pass
          </div>

          <h1
            className="font-light leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 80px)" }}
          >
            <RevealText text="Unlimited Reading." delay={0.2} />
            <br />
            <em className="italic text-[#c9a84c]">
              <RevealText text="One Simple Plan." delay={0.4} />
            </em>
          </h1>
          <p
            className="anim-fade-up mt-4 text-white max-w-2xl mx-auto italic text-xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", animationDelay: "0.6s" }}
          >
            Read unlimited eBooks anytime, anywhere. No limits. No ads.
            Collected for those who read with intention.
          </p>


        </section>

        {/* ── PLANS ────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Monthly */}
          <PlanCard
            title="Monthly"
            price="₹399"
            strikePrice={null}
            period="per month"
            description="Perfect for casual readers"
            features={[
              "Unlimited eBook access",
              "Read on any device",
              "Cancel anytime",
            ]}
            note={null}
            button="Start Monthly"
            planType="monthly"
            highlight={false}
            badge={null}
          />

          {/* Quarterly */}
          <PlanCard
            title="3 Months"
            price="₹999"
            strikePrice="₹1,197"
            period="per 3 months"
            description="Best balance of value & flexibility"
            features={[
              "Unlimited eBook access",
              "Read on any device",
              "Priority support",
            ]}
            note="Save ₹198 vs monthly"
            button="Start 3 Months"
            planType="quarterly"
            highlight={true}
            badge="Most Popular"
          />

          {/* Yearly */}
          <PlanCard
            title="Annual"
            price="₹3,599"
            strikePrice="₹4,788"
            period="per year"
            description="For serious, committed readers"
            features={[
              "Unlimited eBook access",
              "Read on any device",
              "Early access to new releases",
            ]}
            note="Save ₹1,189 vs monthly"
            button="Go Annual"
            planType="yearly"
            highlight={false}
            badge="Best Value"
          />
        </section>

        {/* ── PRICE BREAKDOWN TABLE ──────────────────── */}
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div
            className="border border-[rgba(201,168,76,0.12)] overflow-hidden"
            style={{ background: "#141416" }}
          >
            <div className="grid grid-cols-4 text-[10px] tracking-[2px] uppercase text-white border-b border-[rgba(201,168,76,0.08)] px-6 py-3"
              style={{ fontFamily: "'Cinzel', serif" }}>
              <span>Plan</span>
              <span className="text-center">Duration</span>
              <span className="text-center">Regular</span>
              <span className="text-right text-[#c9a84c]">You Pay</span>
            </div>
            {[
              { plan: "Monthly",    duration: "1 month",  regular: "₹399",    youPay: "₹399",    saving: null },
              { plan: "3 Months",   duration: "3 months", regular: "₹1,197",  youPay: "₹999",    saving: "Save ₹198" },
              { plan: "Annual",     duration: "12 months",regular: "₹4,788",  youPay: "₹3,599",  saving: "Save ₹1,189" },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center px-6 py-4 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 text-sm"
              >
                <span className="text-[#f0ece4]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {row.plan}
                </span>
                <span className="text-center text-white">{row.duration}</span>
                <span className="text-center text-white line-through">{row.regular}</span>
                <div className="text-right">
                  <span className="text-[#c9a84c] font-medium">{row.youPay}</span>
                  {row.saving && (
                    <span className="block text-[10px] text-[#8b3a3a] mt-0.5">{row.saving}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-16 border-t border-[rgba(201,168,76,0.1)]">
          <h2
            className="italic font-light text-[#f5f0e8] text-center mb-12"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Faq q="Does this include paperback books?" a="No. Subscription is only for digital eBooks. Paperbacks are sold separately." />
            <Faq q="Can I cancel anytime?" a="Yes. You can cancel your subscription anytime from your account settings." />
            <Faq q="How is the annual price calculated?" a="Annual plan is ₹3,599 vs ₹4,788 if you paid monthly for 12 months saving you ₹1,189 (25% off)." />
            <Faq q="What's included in the 3-month plan?" a="3-month plan is ₹999 vs ₹1,197 monthly saving you ₹198. Full library access, all devices." />
          </div>
        </section>

      </div>
    </>
  );
}

// ── PlanCard ─────────────────────────────────────────────────────
function PlanCard({
  title, price, strikePrice, period, description,
  features, note, button, planType, highlight, badge,
}: {
  title: string; price: string; strikePrice: string | null; period: string;
  description: string; features: string[]; note: string | null; button: string;
  planType: string; highlight: boolean; badge: string | null;
}) {
  const router = useRouter();

  return (
    <div
      className={`plan-card flex flex-col p-8 bg-[#141416] border ${
        highlight
          ? "border-[#c9a84c] shadow-[0_0_40px_rgba(201,168,76,0.08)]"
          : "border-[rgba(201,168,76,0.1)]"
      }`}
    >
      {badge && (
        <span
          className="mb-5 self-start text-[9px] tracking-[2px] uppercase font-medium px-3 py-1"
          style={{
            background: highlight ? "#c9a84c" : "rgba(201,168,76,0.12)",
            color: highlight ? "#0a0a0b" : "#c9a84c",
            border: highlight ? "none" : "1px solid rgba(201,168,76,0.25)",
          }}
        >
          {badge}
        </span>
      )}

      <h3
        className="text-2xl italic mb-1 text-[#f5f0e8]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {title}
      </h3>
      <p className="text-white text-xs tracking-wide uppercase mb-7">{description}</p>

      {/* Price */}
      <div className="mb-1 flex items-baseline gap-3">
        <span
          className="text-4xl font-light text-[#f5f0e8]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {price}
        </span>
        {strikePrice && (
          <span className="text-white text-sm line-through">{strikePrice}</span>
        )}
      </div>
      <p className="text-white text-xs mb-1">{period}</p>
      {note && (
        <p className="text-[11px] text-[#8b4a2e] mb-6 font-medium tracking-wide">
          ✦ {note}
        </p>
      )}
      {!note && <div className="mb-6" />}

      {/* Features */}
      <ul className="mb-10 space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-[#c4bfb5]">
            <Check className="text-[#c9a84c] shrink-0" size={14} />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => router.push(`/subscriptions/payment?plan=${planType}`)}
        className={`mag-cta w-full py-4 text-[11px] tracking-[3px] uppercase font-medium transition-all duration-300 cursor-pointer ${
          highlight
            ? "bg-[#c9a84c] text-[#0a0a0b] hover:bg-[#f5f0e8]"
            : "bg-transparent border border-[rgba(201,168,76,0.3)] text-[#c9a84c] hover:border-[#c9a84c] hover:bg-[rgba(201,168,76,0.06)]"
        }`}
      >
        {button}
      </button>
    </div>
  );
}

// ── FAQ item ─────────────────────────────────────────────────────
function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="p-6 border border-[rgba(201,168,76,0.06)] hover:border-[rgba(201,168,76,0.2)] transition-colors" style={{ background: "#141416" }}>
      <p className="text-[#f5f0e8] font-medium mb-2 tracking-wide text-sm" style={{ fontFamily: "'Cinzel', serif" }}>{q}</p>
      <p className="text-white text-sm leading-relaxed">{a}</p>
    </div>
  );
}