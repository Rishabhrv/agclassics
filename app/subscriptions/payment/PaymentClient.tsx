"use client";

import { useEffect, useState, Suspense } from "react";
import { Check, ShieldCheck, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import "../../globals.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const paymentStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');
  /* ... (Keep your exact same CSS logic from before) ... */
  .anim-fade-up { animation: fadeUp 0.4s ease forwards; }
  @keyframes fadeUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
  .payment-card { background: #141416; border: 1px solid rgba(201, 168, 76, 0.1); }
  .plan-btn-active { background: #c9a84c !important; color: #0a0a0b !important; }
  .mag-cta { position: relative; overflow: hidden; transition: all 0.3s ease; }
  .mag-cta:not(:disabled):hover { background: #f5f0e8; color: #0a0a0b; }
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
  monthly: { promo: "+ 1 Month Free" },
  quarterly: { promo: "+ 1 Month Free" },
  "half-yearly": { promo: "+ 1 Month Free" },
  yearly: { promo: "+ 1 Month Free" },
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const urlPlanKey = searchParams ? searchParams.get("plan") : null;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string>("monthly");
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [isEligibleForPromo, setIsEligibleForPromo] = useState(true); // Default true for guests

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    // 1. Fetch Plans
    fetch(`${API_URL}/api/subscriptions/subscription-plans`)
      .then((res) => res.json())
      .then((data) => {
        const activePlans = data.filter((p: any) => p.status === 'active');
        setPlans(activePlans);
        if (urlPlanKey && activePlans.some((p: any) => p.plan_key === urlPlanKey)) {
          setSelectedPlanKey(urlPlanKey);
        } else if (activePlans.length > 0) {
          setSelectedPlanKey(activePlans[0].plan_key);
        }
        setFetchingPlans(false);
      })
      .catch((err) => {
        console.error("Failed to fetch plans", err);
        setFetchingPlans(false);
      });

    // 2. Check Eligibility if logged in
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

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [urlPlanKey]);

  const selectedPlan = plans.find(p => p.plan_key === selectedPlanKey);
  
  // ONLY APPLY PROMO TEXT IF THEY ARE ELIGIBLE
  const currentPromo = (selectedPlan && isEligibleForPromo) ? PLAN_UI_EXTRAS[selectedPlan.plan_key]?.promo : null;

  const startPayment = async () => {
    // ... (Keep your exact startPayment function from before)
    if (!selectedPlan) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { 
        setToastMsg("Please login first to continue.");
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 4000); 
        setLoading(false);
        return; 
      }

      const res = await fetch(`${API_URL}/api/subscription-payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_key: selectedPlan.plan_key }), 
      });

      const sub = await res.json();
      if (!res.ok) {
        setToastMsg(sub.msg || "Failed to initiate payment");
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 4000);
        setLoading(false);
        return;
      }
      if (!sub.subscription_id) return;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: sub.amount * 100,
        currency: "INR",
        name: "AG Classics",
        description: `${selectedPlan.title} Subscription`,
        modal: {
          backdropclose: false, escape: true, handleback: true, confirm_close: true,
          ondismiss: () => setLoading(false),
        },
        handler: async (response: any) => {
          await fetch(`${API_URL}/api/subscription-payment/success`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              subscription_id: sub.subscription_id,
              payment_id: response.razorpay_payment_id,
              amount: sub.amount,
            }),
          });
          window.location.href = "/library/MyLibrary";
        },
        theme: { color: "#c9a84c" },
      };

      const rzp = (window as any).Razorpay ? new (window as any).Razorpay(options) : null;
      rzp?.open();
    } catch (err) {
      console.error(err);
      setToastMsg("Something went wrong. Please try again.");
      setToastOpen(true);
      setTimeout(() => setToastOpen(false), 4000);
      setLoading(false);
    }
  };

  if (fetchingPlans) return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#c9a84c]">Loading Secure Checkout...</div>;
  if (!selectedPlan) return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white">No active plans available.</div>;

  const finalPrice = selectedPlan.discount_price || selectedPlan.base_price;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e0d0] pt-[100px] sm:pt-[140px] pb-20 px-4 sm:px-6 relative" style={{ fontFamily: "'Jost', sans-serif" }}>
      <style>{paymentStyles}</style>

      <div className="max-w-6xl mx-auto">
        <header className="mb-8 sm:mb-12 text-center md:text-left">
          <span className="text-[10px] tracking-[5px] uppercase text-[#c9a84c] block mb-3">Secure Checkout</span>
          <h1 className="text-[#f5f0e8] italic font-light leading-none" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 5vw, 48px)" }}>
            Complete your <em className="text-[#c9a84c]">Subscription</em>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          <div className="md:col-span-2 space-y-5 sm:space-y-6">
            
            <div className="payment-card p-5 sm:p-8 rounded-sm">
              <h2 className="text-[#f5f0e8] text-lg mb-5 sm:mb-6 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Select Plan</h2>
              <div className="flex bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.1)] overflow-hidden mb-6 sm:mb-8 rounded-sm">
                {plans.map((p) => (
                  <button key={p.plan_key} onClick={() => setSelectedPlanKey(p.plan_key)} className={`plan-toggle-btn flex-1 py-4 text-[10px] tracking-[2px] uppercase transition-all duration-300 cursor-pointer ${selectedPlanKey === p.plan_key ? "plan-btn-active" : "bg-[#0a0a0b] text-[#8a8790] hover:text-[#e8e0d0] border-r border-[rgba(201,168,76,0.1)] last:border-none"}`}>
                    {p.plan_key.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 bg-[#0a0a0b] border border-[rgba(201,168,76,0.06)]">
                <div>
                  <h3 className="text-[#f5f0e8] text-lg sm:text-xl font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{selectedPlan.title}</h3>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {selectedPlan.discount_price ? (
                      <>
                        <span className="text-[#c9a84c] text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>₹{selectedPlan.discount_price.toLocaleString("en-IN")}</span>
                        <span className="text-[#8a8790] text-sm line-through">₹{selectedPlan.base_price.toLocaleString("en-IN")}</span>
                      </>
                    ) : (
                      <span className="text-[#c9a84c] text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>₹{selectedPlan.base_price.toLocaleString("en-IN")}</span>
                    )}
                    <span className="text-[#8a8790] text-xs">for {selectedPlan.duration_months} month{selectedPlan.duration_months > 1 ? 's' : ''}</span>
                    
                    {currentPromo && (
                      <span className="inline-block bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 rounded-sm ml-1 sm:ml-2">
                         {currentPromo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-card p-5 sm:p-8 rounded-sm">
              <h3 className="text-[11px] tracking-[2px] uppercase text-[#8a8790] mb-5" style={{ fontFamily: "'Cinzel', serif" }}>What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 ? (
                  selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm text-[#c4bfb5]">
                      <Check size={16} className="text-[#c9a84c] shrink-0 mt-0.5" /> 
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#555259] italic col-span-full">No specific features listed for this plan yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="order-first md:order-none">
            {/* Mobile Summary */}
            <div className="md:hidden payment-card p-4 rounded-sm mb-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] tracking-[2px] uppercase text-[#8a8790]">{selectedPlan.title}</p>
                  {currentPromo && (
                    <p className="mt-1 inline-block bg-[#c9a84c]/10 text-[#c9a84c] text-[8px] tracking-[1.5px] uppercase font-bold px-1.5 py-0.5 rounded-sm">
                       {currentPromo}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl text-[#c9a84c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>₹{finalPrice.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <button disabled={loading} onClick={startPayment} className="mag-cta w-full py-4 bg-[#c9a84c] text-[#0a0a0b] text-[11px] tracking-[3px] uppercase font-semibold disabled:opacity-50 cursor-pointer">
                {loading ? "Authenticating..." : `Pay ₹${finalPrice.toLocaleString("en-IN")}`}
              </button>
            </div>

            {/* Desktop Summary */}
            <div className="hidden md:block payment-card p-8 rounded-sm sticky top-[140px]">
              <h2 className="text-[#f5f0e8] text-lg mb-6 italic border-b border-[rgba(201,168,76,0.06)] pb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Summary</h2>

              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between"><span className="text-[#8a8790]">Plan</span><span className="text-[#e8e0d0]">{selectedPlan.title}</span></div>
                <div className="flex justify-between"><span className="text-[#8a8790]">Duration</span><span className="text-[#e8e0d0]">{selectedPlan.duration_months} month{selectedPlan.duration_months > 1 ? "s" : ""}</span></div>
                
                {selectedPlan.discount_price && (
                  <>
                    <div className="flex justify-between"><span className="text-[#8a8790]">Base Price</span><span className="text-[#e8e0d0] line-through">₹{selectedPlan.base_price.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between text-[#4ade80]"><span>Discount</span><span>-₹{(selectedPlan.base_price - selectedPlan.discount_price).toLocaleString("en-IN")}</span></div>
                  </>
                )}

                {currentPromo && (
                  <div className="flex justify-between items-center text-[#c9a84c]">
                    <span className="text-[#8a8790]">Special Offer</span>
                    <span className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 px-2 py-0.5 rounded-sm text-[9px] tracking-widest uppercase font-bold"> {currentPromo}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[rgba(201,168,76,0.1)] flex justify-between items-baseline">
                  <span className="text-[#f5f0e8] font-medium uppercase text-[10px] tracking-[2px]">Total</span>
                  <span className="text-2xl text-[#c9a84c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>₹{finalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button disabled={loading} onClick={startPayment} className="mag-cta w-full py-4 bg-[#c9a84c] text-[#0a0a0b] text-[11px] tracking-[3px] uppercase font-semibold disabled:opacity-50 cursor-pointer">
                {loading ? "Authenticating..." : `Pay ₹${finalPrice.toLocaleString("en-IN")}`}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#555259] uppercase tracking-[1px]"><Lock size={11} /> Secure Encryption</div>
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#555259] uppercase tracking-[1px]"><ShieldCheck size={11} /> Razorpay Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastOpen && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-[#141416] border border-[#c9a84c] px-6 py-4 rounded-sm shadow-[0_4px_20px_rgba(201,168,76,0.15)] flex items-center gap-4 anim-fade-up">
          <span className="text-[#c9a84c] text-xs tracking-[1.5px] uppercase font-medium">{toastMsg}</span>
          <button onClick={() => setToastOpen(false)} className="text-[#8a8790] hover:text-[#f5f0e8] transition-colors cursor-pointer text-sm">✕</button>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#c9a84c]">Loading Heritage Pass...</div>}>
      <PaymentContent />
    </Suspense>
  );
}