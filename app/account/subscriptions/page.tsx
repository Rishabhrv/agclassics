"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ── Types ── */
interface Subscription {
  subscription_id: number;
  plan_key: string;
  title: string;
  months: number;
  amount_paid: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled" | "pending";
}

interface Payment {
  gateway_payment_id: string;
  gateway_order_id: string;
  amount: number;
  status: string;
  created_at: string;
}

/* ── Helpers ── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtAmt = (n: number) =>
  `₹${parseFloat(String(n)).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  active:    { bg: "rgba(34,197,94,0.1)",   text: "#4ade80" },
  paid:      { bg: "rgba(34,197,94,0.1)",   text: "#4ade80" },
  success:   { bg: "rgba(34,197,94,0.1)",   text: "#4ade80" },
  pending:   { bg: "rgba(245,158,11,0.1)",  text: "#fbbf24" },
  cancelled: { bg: "rgba(239,68,68,0.1)",   text: "#f87171" },
  expired:   { bg: "rgba(239,68,68,0.1)",   text: "#f87171" },
  failed:    { bg: "rgba(239,68,68,0.1)",   text: "#f87171" },
};

/* ── Inline Components ── */
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? { bg: "rgba(255,255,255,0.06)", text: "#ffffff" };
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-[9px] tracking-[2px] uppercase font-medium rounded-sm"
      style={{ fontFamily: "'Jost', sans-serif", background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-7">
      <h2
        className="text-[22px] md:text-[26px] italic text-[#f5f0e8] mb-1.5 m-0"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {title}
      </h2>
      <p className="text-[11px] text-white tracking-[0.5px] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
        {sub}
      </p>
      <div className="mt-3.5 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.25), transparent)" }} />
    </div>
  );
}

function InfoBlock({ label, value, gold }: { label: string; value: React.ReactNode; gold?: boolean }) {
  return (
    <div>
      <p
        className="text-[8px] md:text-[9px] tracking-[2px] uppercase text-white mb-1 m-0"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {label}
      </p>
      <div
        className="text-sm md:text-base"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: gold ? "#c9a84c" : "#f5f0e8" }}
      >
        {value}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] p-5 md:p-6 flex flex-col gap-4">
          <div className="h-4 w-2/5 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-3 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
            ))}
          </div>
          <div className="h-[3px] rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
        </div>
      ))}
    </div>
  );
}

/* ── Page ── */
export default function SubscriptionsPage() {
  const [sub, setSub]       = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showPayments, setShowPayments] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    setLoading(true);
    try {
      /* ─── GET /api/subscription-payment/me ───────────────────────────────
         Backend returns: { active: boolean, subscription: Subscription | null }
      ──────────────────────────────────────────────────────────────── */
      const res = await fetch(`${API_URL}/api/subscription-payment/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Backend returns { active, subscription } — single object, not array
      const record: Subscription | null = data.subscription ?? null;
      setSub(record);

      /* ─── GET /api/subscription-payment/payments ─────────────────────── */
      if (record) {
        const pRes = await fetch(`${API_URL}/api/subscription-payment/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          setPayments(Array.isArray(pData) ? pData : []);
        }
      }
    } catch (err) {
      console.error("Subscription fetch error:", err);
      setSub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Progress calculation ── */
  const getDaysLeft = (end: string) =>
    Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86_400_000));

  const getProgress = (s: Subscription) => {
    if (s.status !== "active") return 100;
    const totalDays = Math.max(1, s.months * 30);
    const daysLeft  = getDaysLeft(s.end_date);
    return Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
  };

  /* ── Empty state ── */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-14 md:py-20 gap-4 text-center px-4">
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border border-[rgba(201,168,76,0.2)]"
        style={{ background: "rgba(201,168,76,0.05)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <p className="text-xl md:text-2xl italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        No subscriptions yet
      </p>
      <p className="text-xs text-white m-0 max-w-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
        Subscribe to a reading plan for unlimited ebook access across our catalogue.
      </p>
      <a href="/subscription">
        <button
          className="mt-2 text-[10px] tracking-[2.5px] uppercase px-7 py-3 bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer hover:bg-[#f5f0e8] transition-colors"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Browse Plans
        </button>
      </a>
    </div>
  );

  return (
    <div className="panel-fade p-5 md:p-9 lg:p-10">
      <SectionHead title="My Subscription" sub="Your active reading plan and payment history" />

      {loading ? (
        <Skeleton />
      ) : !sub ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Subscription Card ── */}
          <div className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.15)] p-5 md:p-6 relative overflow-hidden mb-4">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#8a6f2e]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#8a6f2e]" />

            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p
                  className="text-[12px] md:text-[13px] text-[#c9a84c] mb-1 tracking-[1px] m-0"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {sub.title}
                </p>
                <p
                  className="text-[10px] md:text-[11px] text-white uppercase tracking-[1.5px] m-0"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {sub.months} Month{sub.months !== 1 ? "s" : ""} Plan
                </p>
              </div>
              <StatusBadge status={sub.status} />
            </div>

            {/* Info grid — 2 cols on mobile, 3 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mb-5">
              <InfoBlock label="Amount Paid" value={fmtAmt(sub.amount_paid)} gold />
              <InfoBlock label="Start Date"  value={fmtDate(sub.start_date)} />
              <InfoBlock label="Expiry Date" value={fmtDate(sub.end_date)} />
            </div>

            {/* Progress bar (active only) */}
            {sub.status === "active" && (
              <div>
                <div className="flex justify-between mb-2">
                  <p
                    className="text-[9px] tracking-[2px] uppercase text-white m-0"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    Access Period
                  </p>
                  <p
                    className="text-[10px] text-[#c9a84c] m-0"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    {getDaysLeft(sub.end_date)} day{getDaysLeft(sub.end_date) !== 1 ? "s" : ""} remaining
                  </p>
                </div>
                <div className="h-[3px] bg-[rgba(201,168,76,0.1)] relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 transition-all duration-700"
                    style={{
                      width: `${getProgress(sub)}%`,
                      background: "linear-gradient(to right, #8a6f2e, #c9a84c)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Expired notice */}
            {sub.status === "expired" && (
              <div className="mt-4 flex items-center gap-2 p-3 border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[11px] text-red-400 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                  This plan has expired. Renew to restore access.
                </p>
              </div>
            )}
          </div>



          {/* ── Payment History ── */}
          {payments.length > 0 && (
            <div>
              <div className="h-px mb-6" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)" }} />

              <button
                onClick={() => setShowPayments((v) => !v)}
                className="flex items-center justify-between w-full text-left mb-4 bg-transparent border-none cursor-pointer p-0 group"
              >
                <p
                  className="text-[9px] tracking-[3px] uppercase text-[#8a6f2e] m-0"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Payment History
                  <span className="ml-2 text-white text-[8px]">({payments.length})</span>
                </p>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#8a6f2e" strokeWidth="1.5"
                  className="transition-transform duration-200"
                  style={{ transform: showPayments ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showPayments && (
                <div className="flex flex-col gap-2.5">
                  {payments.map((p, i) => (
                    <div
                      key={i}
                      className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <p
                          className="text-[10px] text-[#f5f0e8] m-0 font-mono tracking-wide truncate max-w-[220px] md:max-w-none"
                          title={p.gateway_payment_id}
                        >
                          {p.gateway_payment_id ?? "—"}
                        </p>
                        <p
                          className="text-[9px] text-white m-0"
                          style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                          {fmtDate(p.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className="text-[13px] text-[#c9a84c]"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {fmtAmt(p.amount)}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}