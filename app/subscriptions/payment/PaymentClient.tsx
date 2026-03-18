"use client";

import { useEffect, useState, Suspense } from "react";
import { Check, ShieldCheck, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import "../../globals.css";

const paymentStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  .payment-card {
    background: #141416;
    border: 1px solid rgba(201, 168, 76, 0.1);
  }
  .plan-btn-active {
    background: #c9a84c !important;
    color: #0a0a0b !important;
  }
  .mag-cta { position: relative; overflow: hidden; transition: all 0.3s ease; }
  .mag-cta:not(:disabled):hover { background: #f5f0e8; color: #0a0a0b; }
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
  .razorpay-backdrop,
  div[class*="razorpay-backdrop"],
  div[id*="razorpay-backdrop"] { display: none !important; }
  .razorpay-container { z-index: 2147483647 !important; position: fixed !important; }
  body.razorpay-payment-open { overflow: hidden !important; }
`;

type PlanKey = "monthly" | "quarterly" | "yearly";

type Plan = {
  label: string;
  basePrice: number;
  regularPrice: number;
  durationLabel: string;
  saving: string | null;
};

const PLANS: Record<PlanKey, Plan> = {
  monthly:   { label: "Monthly Pass",          basePrice: 399,   regularPrice: 399,  durationLabel: "per month",    saving: null },
  quarterly: { label: "3-Month Pass",           basePrice: 999,   regularPrice: 1197, durationLabel: "per 3 months", saving: "Save ₹198" },
  yearly:    { label: "Annual Heritage Pass",   basePrice: 3599,  regularPrice: 4788, durationLabel: "per year",     saving: "Save ₹1,189" },
};

// ── Monthly duration: actual price per number of months ──────────
// 1–11 months: ₹399 × n
// 12 months:   ₹3,599 (annual deal, same as yearly plan)
// ────────────────────────────────────────────────────────────────
const MONTHLY_PRICE: Record<number, number> = {
  1:  399,
  2:  798,
  3:  999,   // same as quarterly deal
  6:  2394,
  12: 3599,  // same as annual deal
};

const MONTHLY_REGULAR: Record<number, number> = {
  1:  399,
  2:  798,
  3:  1197,
  6:  2394,
  12: 4788,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function PaymentContent() {
  const searchParams = useSearchParams();
  const urlPlan = searchParams ? (searchParams.get("plan") as PlanKey | null) : null;

  const [plan, setPlan]   = useState<PlanKey>("monthly");
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlPlan && PLANS[urlPlan]) setPlan(urlPlan);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [urlPlan]);

  useEffect(() => {
    if (plan !== "monthly") setMonths(1);
  }, [plan]);

  const selected = PLANS[plan];

  // Actual amount the user will pay
  const totalPrice = plan === "monthly"
    ? MONTHLY_PRICE[months]
    : selected.basePrice;

  // What it would cost at full monthly rate (for strikethrough / saving calc)
  const regularTotal = plan === "monthly"
    ? MONTHLY_REGULAR[months]
    : selected.regularPrice;

  const totalSaving = regularTotal - totalPrice;

  // Label shown next to each month option in the select
  const monthOptionLabel = (m: number) => {
    const price   = MONTHLY_PRICE[m];
    const regular = MONTHLY_REGULAR[m];
    const saving  = regular - price;
    const base    = `${m} Month${m > 1 ? "s" : ""} — ₹${price.toLocaleString("en-IN")}`;
    return saving > 0 ? `${base}  (save ₹${saving.toLocaleString("en-IN")})` : base;
  };

  const startPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { alert("Please login first"); return; }

      const res = await fetch(`${API_URL}/api/subscription-payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, months }),
      });

      const sub = await res.json();
      if (!sub.subscription_id) return;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: sub.amount * 100,
        currency: "INR",
        name: "AG Classics",
        description: `${selected.label} Subscription`,
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          confirm_close: true,
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
          window.location.href = "/account/subscription";
        },
        theme: { color: "#c9a84c" },
      };

      const rzp = (window as any).Razorpay ? new (window as any).Razorpay(options) : null;
      rzp?.open();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] text-[#e8e0d0] pt-[140px] pb-20 px-6"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <style>{paymentStyles}</style>

      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <span className="text-[10px] tracking-[5px] uppercase text-[#c9a84c] block mb-3">Secure Checkout</span>
          <h1
            className="text-[#f5f0e8] italic font-light leading-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            Complete your <em className="text-[#c9a84c]">Subscription</em>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* ── LEFT ── */}
          <div className="md:col-span-2 space-y-6">
            <div className="payment-card p-8 rounded-sm">
              <h2
                className="text-[#f5f0e8] text-lg mb-6 italic"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Select Plan
              </h2>

              {/* Plan toggle */}
              <div className="grid grid-cols-3 gap-px bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.1)] overflow-hidden mb-8">
                {(["monthly", "quarterly", "yearly"] as PlanKey[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    className={`py-4 text-[10px] tracking-[2px] uppercase transition-all duration-300 cursor-pointer ${
                      plan === p ? "plan-btn-active" : "bg-[#0a0a0b] text-[#8a8790] hover:text-[#e8e0d0]"
                    }`}
                  >
                    {p === "quarterly" ? "3 Months" : p === "yearly" ? "Annual" : "Monthly"}
                  </button>
                ))}
              </div>

              {/* Plan detail */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-[#0a0a0b] border border-[rgba(201,168,76,0.06)] mb-8">
                <div>
                  <h3
                    className="text-[#f5f0e8] text-xl font-semibold mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {selected.label}
                  </h3>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-[#c9a84c] text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                    {totalSaving > 0 && (
                      <span className="text-[#555259] text-sm line-through">
                        ₹{regularTotal.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="text-[#8a8790] text-xs">{selected.durationLabel}</span>
                  </div>
                </div>
                {totalSaving > 0 && (
                  <span
                    className="text-[10px] tracking-[1px] px-3 py-1.5 uppercase font-medium"
                    style={{ background: "rgba(139,74,46,0.18)", color: "#d4845a", border: "1px solid rgba(139,74,46,0.25)" }}
                  >
                    Save ₹{totalSaving.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Monthly: duration selector */}
              {plan === "monthly" && (
                <div className="space-y-2 mb-8">
                  <label className="text-[11px] tracking-[2px] uppercase text-[#8a8790]">
                    Duration
                  </label>
                  <select
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full bg-[#0a0a0b] border border-[rgba(201,168,76,0.2)] text-[#e8e0d0] px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]"
                  >
                    {[1, 2, 3, 6, 12].map((m) => (
                      <option key={m} value={m}>
                        {monthOptionLabel(m)}
                      </option>
                    ))}
                  </select>

                  {/* Inline price breakdown */}
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-[#555259]">
                      {months < 12
                        ? `₹399 × ${months} month${months > 1 ? "s" : ""}`
                        : "Annual deal applied automatically"}
                    </span>
                    <span className="text-[#c9a84c]">
                      = ₹{MONTHLY_PRICE[months].toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* 12-month tip */}
                  {months === 12 && (
                    <p className="text-[11px] px-3 py-2 mt-1 border border-[rgba(201,168,76,0.15)]"
                      style={{ background: "rgba(201,168,76,0.05)", color: "#c9a84c" }}>
                      ✦ Annual plan price applied — you save ₹1,189 vs paying monthly
                    </p>
                  )}
                  {months === 3 && (
                    <p className="text-[11px] px-3 py-2 mt-1 border border-[rgba(201,168,76,0.15)]"
                      style={{ background: "rgba(201,168,76,0.05)", color: "#c9a84c" }}>
                      ✦ 3-month deal applied — you save ₹198 vs paying monthly
                    </p>
                  )}
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[rgba(201,168,76,0.06)]">
                {["Unlimited Library Access", "Multi-Device Sync", "Early Collection Access", "Premium Support"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[#c4bfb5]">
                    <Check size={14} className="text-[#c9a84c] shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan comparison */}
            <div className="payment-card p-6 rounded-sm">
              <h3 className="text-[11px] tracking-[2px] uppercase text-[#8a8790] mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
                Price Comparison
              </h3>
              <div className="space-y-0 divide-y divide-[rgba(255,255,255,0.04)]">
                {[
                  { label: "1 month",   price: 399,  regular: 399,  effPm: 399 },
                  { label: "3 months",  price: 999,  regular: 1197, effPm: 333 },
                  { label: "6 months",  price: 2394, regular: 2394, effPm: 399 },
                  { label: "12 months", price: 3599, regular: 4788, effPm: 300 },
                ].map((row) => {
                  const saving = row.regular - row.price;
                  return (
                    <div key={row.label} className="flex items-center justify-between py-3 text-sm">
                      <span className="text-[#c4bfb5]">{row.label}</span>
                      <div className="flex items-center gap-4">
                        {saving > 0 && (
                          <span className="text-[#555259] text-xs line-through">
                            ₹{row.regular.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="text-[#c9a84c] font-medium w-20 text-right">
                          ₹{row.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[#555259] text-xs w-24 text-right">
                          ₹{row.effPm}/mo
                        </span>
                        {saving > 0 && (
                          <span className="text-[10px] w-20 text-right" style={{ color: "#d4845a" }}>
                            −₹{saving.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: SUMMARY ── */}
          <div>
            <div className="payment-card p-8 rounded-sm sticky top-[140px]">
              <h2
                className="text-[#f5f0e8] text-lg mb-6 italic border-b border-[rgba(201,168,76,0.06)] pb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Order Summary
              </h2>

              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between">
                  <span className="text-[#8a8790]">Plan</span>
                  <span className="text-[#e8e0d0]">{selected.label}</span>
                </div>
                {plan === "monthly" && (
                  <div className="flex justify-between">
                    <span className="text-[#8a8790]">Duration</span>
                    <span className="text-[#e8e0d0]">{months} month{months > 1 ? "s" : ""}</span>
                  </div>
                )}
                {regularTotal !== totalPrice && (
                  <div className="flex justify-between">
                    <span className="text-[#8a8790]">Regular</span>
                    <span className="text-[#555259] line-through">
                      ₹{regularTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {totalSaving > 0 && (
                  <div className="flex justify-between text-xs" style={{ color: "#d4845a" }}>
                    <span>You save</span>
                    <span>−₹{totalSaving.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#c9a84c] text-xs">
                  <span>Processing Fee</span>
                  <span>Complimentary</span>
                </div>
                <div className="pt-4 border-t border-[rgba(201,168,76,0.1)] flex justify-between items-baseline">
                  <span className="text-[#f5f0e8] font-medium uppercase text-[10px] tracking-[2px]">Total</span>
                  <span className="text-2xl text-[#c9a84c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={startPayment}
                className="mag-cta w-full py-4 bg-[#c9a84c] text-[#0a0a0b] text-[11px] tracking-[3px] uppercase font-semibold disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Authenticating..." : `Pay ₹${totalPrice.toLocaleString("en-IN")}`}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#555259] uppercase tracking-[1px]">
                  <Lock size={11} /> Secure Encryption
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#555259] uppercase tracking-[1px]">
                  <ShieldCheck size={11} /> Razorpay Verified
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#c9a84c]">
        Loading Heritage Pass...
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}