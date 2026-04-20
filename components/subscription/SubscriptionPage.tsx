"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { Check } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { RevealText } from "@/components/motion/Motionutils"; // <-- Adjust path if needed

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const paymentStyles = `
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

type SubscriptionPlan = {
  id: number;
  plan_key: string;
  title: string;
  base_price: number;
  duration_months: number;
  description: string;
  status: string;
  features: string[]; // <-- Dynamic features from DB
};

// UI extras that aren't stored in the database (like badges and buttons)
const PLAN_UI_EXTRAS: Record<string, any> = {
  monthly: {
    period: "per month",
    button: "Start Monthly",
    highlight: false,
    badge: null,
  },
  quarterly: {
    period: "per 3 months",
    button: "Start 3 Months",
    highlight: true,
    badge: "Most Popular",
  },
  yearly: {
    period: "per year",
    button: "Go Annual",
    highlight: false,
    badge: "Best Value",
  },
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch plans from backend
  useEffect(() => {
    fetch(`${API_URL}/api/subscriptions/subscription-plans`)
      .then((res) => res.json())
      .then((data) => {
        const activePlans = data.filter((p: SubscriptionPlan) => p.status === 'active');
        setPlans(activePlans);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch plans:", err);
        setLoading(false);
      });
  }, []);

  // Calculate dynamic pricing
  const enrichedPlans = useMemo(() => {
    return plans.map(plan => {
      const uiData = PLAN_UI_EXTRAS[plan.plan_key] || PLAN_UI_EXTRAS.monthly;

      return {
        ...plan,
        ui: uiData,
        displayPrice: `₹${plan.base_price.toLocaleString()}`
      };
    });
  }, [plans]);

  return (
    <>
      <style>{paymentStyles}</style>
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
        {loading ? (
          <div className="text-center py-20 text-[#c9a84c]">Loading plans...</div>
        ) : (
          <section className="mx-auto max-w-6xl px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrichedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                title={plan.title}
                price={plan.displayPrice}
                period={plan.ui.period}
                description={plan.description || "Unlimited Classic Literature"}
                features={plan.features || []} // <-- Now passing dynamic features from DB!
                button={plan.ui.button}
                planType={plan.plan_key}
                highlight={plan.ui.highlight}
                badge={plan.ui.badge}
              />
            ))}
          </section>
        )}

        {/* ── FAQ SECTION ──────────────────────────── */}
        {!loading && enrichedPlans.length > 0 && (
          <section className="mx-auto max-w-4xl px-6 pb-20">
            <div className="text-center mb-10">
              <h2
                className="text-3xl italic text-[#f5f0e8] mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Frequently Asked Questions
              </h2>
              <p className="text-[#8a8790] text-sm uppercase tracking-widest font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>
                Everything you need to know
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Faq 
                q="Which books are included in the plan?" 
                a="Your subscription grants you complete and unlimited access to read all the books available on our website." 
              />
              <Faq 
                q="Which devices are supported?" 
                a="You can read on any device! Our web reader is fully optimized and works seamlessly across desktops, tablets, and mobile phones." 
              />
              <Faq 
                q="Can I download books to read offline?" 
                a="No, books cannot be downloaded. Our platform is designed strictly for online reading directly through your web browser." 
              />
              <Faq 
                q="Can I cancel my subscription or get a refund?" 
                a="All subscriptions are final. We do not offer cancellations or refunds once a plan has been purchased." 
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}

// ── PlanCard ─────────────────────────────────────────────────────
function PlanCard({
  title, price, period, description,
  features, button, planType, highlight, badge,
}: {
  title: string; price: string; period: string;
  description: string; features: string[]; button: string;
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
      {!badge && <div className="mb-5 h-[22px]" />}

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
      </div>
      <p className="text-white text-xs mb-8">{period}</p>

      {/* Features - Now maps the dynamic features! */}
      <ul className="mb-10 space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#c4bfb5]">
            <Check className="text-[#c9a84c] shrink-0 mt-0.5" size={16} />
            <span className="leading-snug">{f}</span>
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
    <div className="p-6 border border-[rgba(201,168,76,0.06)] hover:border-[rgba(201,168,76,0.2)] transition-colors h-full" style={{ background: "#141416" }}>
      <p className="text-[#f5f0e8] font-medium mb-3 tracking-wide text-sm" style={{ fontFamily: "'Cinzel', serif" }}>{q}</p>
      <p className="text-[#c4bfb5] text-sm leading-relaxed">{a}</p>
    </div>
  );
}