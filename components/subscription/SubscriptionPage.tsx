"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { Check } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { RevealText } from "@/components/motion/Motionutils"; 

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const paymentStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  .anim-fade-up { animation: fadeUp 1s ease forwards; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .btn-glow { transition: all 0.3s ease; }
  .btn-glow:hover { box-shadow: 0 0 20px rgba(201,168,76,0.4); transform: translateY(-2px); }
  .plan-card-modern { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
  .plan-card-modern:hover { transform: translateY(-10px) scale(1.02); z-index: 20; }
`;

type SubscriptionPlan = {
  id: number;
  plan_key: string;
  title: string;
  base_price: number;
  discount_price: number | null; 
  duration_months: number;
  description: string;
  status: string;
  features: string[];
};

const PLAN_UI_EXTRAS: Record<string, any> = {
  monthly: { period: "per month", button: "Start Plan", highlight: false, badge: null, promo: "+ 1 Month Free" },
  quarterly: { period: "per 3 months", button: "Start 3 Months", highlight: false, badge: null, promo: "+ 1 Month Free" },
  "half-yearly": { period: "per 6 months", button: "Start 6 Months", highlight: true, badge: "Most Popular", promo: "+ 1 Month Free" },
  yearly: { period: "per year", button: "Go Annual", highlight: false, badge: "Best Value", promo: "+ 1 Month Free" },
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEligibleForPromo, setIsEligibleForPromo] = useState(true); // Default true to show promo to guests

  useEffect(() => {
    // 1. Fetch Plans
    fetch(`${API_URL}/api/subscriptions/subscription-plans`)
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.filter((p: SubscriptionPlan) => p.status === 'active'));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch plans:", err);
        setLoading(false);
      });

    // 2. Check Promo Eligibility if Logged In
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/api/subscription-payment/eligibility`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.isNewUser !== undefined) {
          setIsEligibleForPromo(data.isNewUser);
        }
      })
      .catch(console.error);
    }
  }, []);

  const enrichedPlans = useMemo(() => {
    return plans.map(plan => {
      const uiData = PLAN_UI_EXTRAS[plan.plan_key] || PLAN_UI_EXTRAS.monthly;
      return {
        ...plan,
        ui: uiData,
        displayBasePrice: `₹${plan.base_price.toLocaleString()}`,
        displayDiscountPrice: plan.discount_price ? `₹${plan.discount_price.toLocaleString()}` : null
      };
    });
  }, [plans]);

  return (
    <>
      <style>{paymentStyles}</style>
      <div className="min-h-screen bg-[#0a0a0b] text-[#e8e0d0] pt-[130px] pb-20" style={{ fontFamily: "'Jost', sans-serif" }}>
        
        <section className="relative mx-auto max-w-6xl px-6 py-16 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none select-none" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "200px" }}>Pass</div>
          <h1 className="font-light leading-tight tracking-tight mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 80px)" }}>
            <RevealText text="Unlimited Reading." delay={0.2} />
            <br /><em className="italic text-[#c9a84c]"><RevealText text="One Simple Plan." delay={0.4} /></em>
          </h1>
          <p className="anim-fade-up mt-4 text-white max-w-2xl mx-auto italic text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", animationDelay: "0.6s" }}>
            Read unlimited eBooks anytime, anywhere. No limits. No ads. Collected for those who read with intention.
          </p>
        </section>

        {loading ? (
          <div className="text-center py-20 text-[#c9a84c]">Loading plans...</div>
        ) : (
          <section className="mx-auto px-4 sm:px-8 mt-10 pb-24 flex flex-wrap justify-center items-center gap-4 lg:gap-6">
            {enrichedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                title={plan.title}
                basePrice={plan.displayBasePrice}
                discountPrice={plan.displayDiscountPrice}
                period={plan.ui.period}
                description={plan.description || "Unlimited Classic Literature"}
                features={plan.features || []}
                button={plan.ui.button}
                planType={plan.plan_key}
                highlight={plan.ui.highlight}
                badge={plan.ui.badge}
                promo={isEligibleForPromo ? plan.ui.promo : null} // ONLY SHOW IF ELIGIBLE
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

// ── PlanCard (Premium Glass & Elevated Design) ─────────────────────
function PlanCard({
  title, basePrice, discountPrice, period, description, features, button, planType, highlight, badge, promo
}: {
  title: string; basePrice: string; discountPrice: string | null; period: string; description: string; features: string[]; button: string; planType: string; highlight: boolean; badge: string | null; promo?: string | null;
}) {
  const router = useRouter();
  return (
    <div className={`plan-card-modern relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] min-w-[280px] max-w-[340px] flex flex-col p-8 rounded-3xl backdrop-blur-xl border ${highlight ? "bg-gradient-to-b from-[#1a1710] to-[#0a0a0b] border-[#c9a84c]/50 shadow-[0_10px_40px_rgba(201,168,76,0.15)] lg:scale-110 lg:-translate-y-4 z-10 py-10" : "bg-white/[0.02] border-white/10 shadow-2xl hover:bg-white/[0.04]"}`}>
      {badge && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-gradient-to-r from-[#e3c77d] to-[#c9a84c] text-black text-[10px] tracking-widest uppercase font-bold px-4 py-1.5 rounded-full shadow-lg">{badge}</span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-3xl italic mb-2 text-[#f5f0e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title}</h3>
        <p className="text-[#8a8790] text-xs tracking-wider uppercase">{description}</p>
      </div>

      <div className="mb-4 flex flex-col items-center justify-center">
        {promo && (
          <div className="relative inline-flex group">
            <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-full blur-sm hidden"></div>
            <span className="relative inline-block bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full"> {promo}</span>
          </div>
        )}
      </div>

      <div className="mb-2 flex flex-col items-center justify-center">
        {discountPrice ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl text-[#8a8790] line-through mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", textDecorationThickness: "1px" }}>{basePrice}</span>
            <span className={`text-5xl font-light ${highlight ? 'text-[#c9a84c]' : 'text-[#f5f0e8]'}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>{discountPrice}</span>
          </div>
        ) : (
          <span className={`text-5xl font-light ${highlight ? 'text-[#c9a84c]' : 'text-[#f5f0e8]'}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>{basePrice}</span>
        )}
      </div>

      <div className="text-center pb-6 mb-8 border-b border-white/10">
        <p className="text-[#8a8790] text-xs">{period}</p>
      </div>

      <ul className="mb-10 space-y-4 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-xs text-[#c4bfb5]">
            <div className={`p-1 rounded-full ${highlight ? 'bg-[#c9a84c]/20' : 'bg-white/5'}`}><Check className={highlight ? 'text-[#c9a84c]' : 'text-gray-400'} size={14} strokeWidth={3} /></div>
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <button onClick={() => router.push(`/subscriptions/payment?plan=${planType}`)} className={`btn-glow w-full py-4 rounded-xl text-[12px] tracking-[2px] uppercase font-bold transition-all duration-300 cursor-pointer ${highlight ? "bg-[#c9a84c] text-black hover:bg-[#e3c77d]" : "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20"}`}>
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