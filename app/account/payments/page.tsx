"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ── Types ── */
interface PaymentRecord {
  ref_id: number;
  payment_type: "order" | "subscription";
  amount: number;
  currency: string;
  status: string;
  date: string;
  title: string;
  payment_id?: string;
  plan_key?: string;
}

/* ── Helpers ── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtAmt = (n: number) =>
  `₹${parseFloat(String(n)).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  success:   { bg: "rgba(34,197,94,0.1)",  color: "#4ade80" },
  paid:      { bg: "rgba(34,197,94,0.1)",  color: "#4ade80" },
  completed: { bg: "rgba(34,197,94,0.1)",  color: "#4ade80" },
  pending:   { bg: "rgba(245,158,11,0.1)", color: "#fbbf24" },
  failed:    { bg: "rgba(239,68,68,0.1)",  color: "#f87171" },
  cancelled: { bg: "rgba(239,68,68,0.1)",  color: "#f87171" },
};

const TYPE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  order:        { bg: "rgba(99,102,241,0.12)", color: "#a5b4fc", label: "Order" },
  subscription: { bg: "rgba(201,168,76,0.12)", color: "#c9a84c", label: "Subscription" },
};

/* ── Components ── */
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "rgba(255,255,255,0.06)", color: "#ffffff" };
  return (
    <span
      className="inline-block px-2 py-0.5 text-[9px] tracking-[1.5px] uppercase rounded-sm font-medium"
      style={{ fontFamily: "'Jost', sans-serif", background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function TypeChip({ type }: { type: string }) {
  const t = TYPE_STYLE[type] ?? { bg: "rgba(255,255,255,0.06)", color: "#fff", label: type };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] tracking-[1.5px] uppercase rounded-sm"
      style={{ fontFamily: "'Jost', sans-serif", background: t.bg, color: t.color }}
    >
      {type === "order" ? (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        </svg>
      ) : (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      )}
      {t.label}
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

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 px-5 md:px-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.08)] p-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <div className="h-3.5 w-1/3 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
            <div className="h-3.5 w-1/5 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
          </div>
          <div className="h-3 w-1/4 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" />
        </div>
      ))}
    </div>
  );
}

/* ── Filter tabs ── */
type Filter = "all" | "order" | "subscription";

function FilterTabs({ active, onChange, counts }: {
  active: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  const tabs: { key: Filter; label: string }[] = [
    { key: "all",          label: "All" },
    { key: "order",        label: "Orders" },
    { key: "subscription", label: "Subscriptions" },
  ];
  return (
    <div className="flex gap-0 mb-5 border border-[rgba(201,168,76,0.15)] overflow-hidden">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="flex-1 py-2.5 text-[9px] tracking-[2px] uppercase border-none cursor-pointer transition-colors relative"
          style={{
            fontFamily: "'Jost', sans-serif",
            background: active === t.key ? "rgba(201,168,76,0.1)" : "transparent",
            color: active === t.key ? "#c9a84c" : "#ffffff",
            borderRight: "1px solid rgba(201,168,76,0.1)",
          }}
        >
          {t.label}
          {counts[t.key] > 0 && (
            <span
              className="ml-1.5 text-[8px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: active === t.key ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)",
                color: active === t.key ? "#c9a84c" : "#ffffff",
              }}
            >
              {counts[t.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>("all");

  const fetchPayments = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      /* ── Single endpoint now returns both orders + subscriptions ── */
      const res = await fetch(`${API_URL}/api/ag-classics/payment-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Payment fetch error:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  /* ── Derived ── */
  const filtered = filter === "all" ? payments : payments.filter((p) => p.payment_type === filter);
  const counts: Record<Filter, number> = {
    all:          payments.length,
    order:        payments.filter((p) => p.payment_type === "order").length,
    subscription: payments.filter((p) => p.payment_type === "subscription").length,
  };

  /* ── Summary totals ── */
  const totalSpent   = payments.reduce((s, p) => s + Number(p.amount), 0);
  const orderTotal   = payments.filter((p) => p.payment_type === "order").reduce((s, p) => s + Number(p.amount), 0);
  const subTotal     = payments.filter((p) => p.payment_type === "subscription").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="panel-fade p-5 md:p-9 lg:p-10">
      <SectionHead title="Payment History" sub="All order and subscription payments" />

      {/* ── Summary Cards ── */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 md:gap-3 mb-6">
          {[
            { label: "Total Spent",    value: fmtAmt(totalSpent),  gold: true  },
            { label: "On Orders",      value: fmtAmt(orderTotal),  gold: false },
            { label: "On Plans",       value: fmtAmt(subTotal),    gold: false },
          ].map((s) => (
            <div key={s.label} className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] p-3 md:p-5 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-8 h-px bg-[#8a6f2e]" />
              <p className="text-[7px] md:text-[9px] tracking-[2px] uppercase text-white mb-1 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{s.label}</p>
              <p
                className="text-[16px] md:text-[22px] italic m-0"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: s.gold ? "#c9a84c" : "#f5f0e8" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : payments.length === 0 ? (
        /* ── Empty ── */
        <div className="flex flex-col items-center justify-center py-14 md:py-20 gap-4 text-center px-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(201,168,76,0.2)]"
            style={{ background: "rgba(201,168,76,0.05)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <p className="text-xl md:text-2xl italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            No payments yet
          </p>
          <p className="text-xs text-white m-0 max-w-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
            Your order and subscription payments will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* ── Filter Tabs ── */}
          <FilterTabs active={filter} onChange={setFilter} counts={counts} />

          {/* ── Desktop Table ── */}
          <div className="hidden md:block">
            {/* Table header */}
            <div
              className="grid px-4 py-2.5 border-b border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.03)]"
              style={{ gridTemplateColumns: "1fr 140px 120px 90px 90px" }}
            >
              {["Description", "Date", "Payment ID", "Amount", "Status"].map((h) => (
                <p key={h} className="text-[9px] tracking-[2.5px] uppercase text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{h}</p>
              ))}
            </div>

            {/* Table rows */}
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-white py-10 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>No payments in this category.</p>
            ) : (
              filtered.map((p, i) => (
                <div
                  key={`${p.payment_type}-${p.ref_id}-${i}`}
                  className="grid px-4 py-4 border-b border-[rgba(201,168,76,0.06)] hover:bg-[rgba(201,168,76,0.02)] transition-colors items-center"
                  style={{ gridTemplateColumns: "1fr 140px 120px 90px 90px" }}
                >
                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <TypeChip type={p.payment_type} />
                    <p className="text-sm text-[#f5f0e8] m-0 leading-snug" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {p.title}
                    </p>
                  </div>

                  {/* Date */}
                  <p className="text-[11px] text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {fmtDate(p.date)}
                  </p>

                  {/* Payment ID */}
                  <p
                    className="text-[10px] text-white m-0 overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    title={p.payment_id ?? ""}
                  >
                    {p.payment_id ? p.payment_id.slice(0, 14) + "…" : "—"}
                  </p>

                  {/* Amount */}
                  <p className="text-base text-[#c9a84c] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {fmtAmt(p.amount)}
                  </p>

                  {/* Status */}
                  <StatusBadge status={p.status} />
                </div>
              ))
            )}
          </div>

          {/* ── Mobile Cards ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-white py-8 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>No payments in this category.</p>
            ) : (
              filtered.map((p, i) => (
                <div
                  key={`${p.payment_type}-${p.ref_id}-${i}`}
                  className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] p-4 relative overflow-hidden"
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#8a6f2e]" />

                  {/* Top row: type chip + amount */}
                  <div className="flex items-center justify-between mb-2.5">
                    <TypeChip type={p.payment_type} />
                    <span className="text-base text-[#c9a84c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {fmtAmt(p.amount)}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-sm text-[#f5f0e8] mb-2 m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {p.title}
                  </p>

                  {/* Bottom row: date + status */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {fmtDate(p.date)}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>

                  {/* Payment ID (if available) */}
                  {p.payment_id && (
                    <p
                      className="text-[9px] text-zinc-600 mt-2 m-0 truncate"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      title={p.payment_id}
                    >
                      ID: {p.payment_id}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}