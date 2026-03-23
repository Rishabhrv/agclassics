"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ── Types ── */
interface Subscription {
  id: number;
  plan_id: number;
  plan_key: string;
  title: string;
  months: number;
  amount_paid: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled" | "pending";
}

/* ── Helpers ── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtAmt = (n: number) =>
  `₹${parseFloat(String(n)).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  active:    { bg: "bg-green-500/10", text: "text-green-400" },
  paid:      { bg: "bg-green-500/10", text: "text-green-400" },
  completed: { bg: "bg-green-500/10", text: "text-green-400" },
  success:   { bg: "bg-green-500/10", text: "text-green-400" },
  shipped:   { bg: "bg-amber-500/10", text: "text-amber-400" },
  pending:   { bg: "bg-amber-500/10", text: "text-amber-400" },
  cancelled: { bg: "bg-red-500/10",   text: "text-red-400"   },
  expired:   { bg: "bg-red-500/10",   text: "text-red-400"   },
  failed:    { bg: "bg-red-500/10",   text: "text-red-400"   },
};

/* ── Inline Components ── */
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? { bg: "bg-zinc-700/40", text: "text-white" };
  return (
    <span className={`inline-block px-2.5 py-0.5 text-[9px] tracking-[2px] uppercase font-medium ${s.bg} ${s.text}`} style={{ fontFamily: "'Jost', sans-serif" }}>
      {status}
    </span>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[26px] italic text-[#f5f0e8] mb-1.5 m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>
      <p className="text-[11px] text-white tracking-[0.5px] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{sub}</p>
      <div className="mt-3.5 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.25), transparent)" }} />
    </div>
  );
}

function InfoBlock({ label, value, gold }: { label: string; value: React.ReactNode; gold?: boolean }) {
  return (
    <div>
      <p className="text-[9px] tracking-[2.5px] uppercase text-white mb-1 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{label}</p>
      <div className="text-base" style={{ fontFamily: "'Cormorant Garamond', serif", color: gold ? "#c9a84c" : "#f5f0e8" }}>{value}</div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] p-6 flex flex-col gap-4">
          <div className="h-4 w-2/5 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
          <div className="grid grid-cols-3 gap-5">
            {[1,2,3].map(j => <div key={j} className="h-3 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />)}
          </div>
          <div className="h-[3px] rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
        </div>
      ))}
    </div>
  );
}

/* ── Page ── */
export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubs = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/subscriptions/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setSubs(data.subscriptions ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  return (
    <div className="panel-fade p-9 md:p-10">
      <SectionHead title="Subscriptions" sub="Your reading plan history & active access" />

      {loading ? (
        <SkeletonCards />
      ) : subs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-4xl">📖</span>
          <p className="text-2xl italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No subscriptions yet</p>
          <p className="text-xs text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Subscribe for unlimited reading access.</p>
          <a href="/subscription">
            <button className="mt-2 text-[10px] tracking-[2.5px] uppercase px-7 py-3 bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer hover:bg-[#f5f0e8] transition-colors" style={{ fontFamily: "'Jost', sans-serif" }}>
              Browse Plans
            </button>
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subs.map((sub) => {
            const now = new Date();
            const end = new Date(sub.end_date);
            const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
            const progress = sub.status === "active"
              ? Math.min(100, Math.max(0, 100 - (daysLeft / (sub.months * 30)) * 100))
              : 100;

            return (
              <div key={sub.id} className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.12)] p-6 relative overflow-hidden">
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-[#8a6f2e]" />

                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[13px] text-[#c9a84c] mb-1.5 tracking-[1px] m-0" style={{ fontFamily: "'Cinzel', serif" }}>{sub.title}</p>
                    <p className="text-[11px] text-white uppercase tracking-[1.5px] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {sub.months} Month{sub.months > 1 ? "s" : ""} Plan
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <div className="grid grid-cols-3 gap-5 mb-5">
                  <InfoBlock label="Amount Paid" value={fmtAmt(sub.amount_paid)} gold />
                  <InfoBlock label="Start Date" value={fmtDate(sub.start_date)} />
                  <InfoBlock label="Expiry Date" value={fmtDate(sub.end_date)} />
                </div>

                {sub.status === "active" && (
                  <div>
                    <div className="flex justify-between mb-[7px]">
                      <p className="text-[9px] tracking-[2px] uppercase text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Time Used</p>
                      <p className="text-[10px] text-[#c9a84c] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining</p>
                    </div>
                    <div className="h-[3px] bg-[rgba(201,168,76,0.12)] relative">
                      <div className="absolute left-0 top-0 bottom-0 transition-all duration-700" style={{ width: `${progress}%`, background: "linear-gradient(to right, #8a6f2e, #c9a84c)" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {subs.length > 0 && (
        <div className="mt-7">
          <a href="/subscription">
            <button className="text-[10px] tracking-[2.5px] uppercase px-7 py-3 bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer hover:bg-[#f5f0e8] transition-colors" style={{ fontFamily: "'Jost', sans-serif" }}>
              Renew / Upgrade Plan
            </button>
          </a>
        </div>
      )}
    </div>
  );
}