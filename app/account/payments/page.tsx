"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ── Types ── */
interface PaymentRecord {
  id: number;
  amount: number;
  status: "pending" | "success" | "failed";
  gateway_payment_id?: string;
  gateway_order_id?: string;
  created_at: string;
  plan_title?: string;
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

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-5 py-4 border-b border-[rgba(201,168,76,0.06)]">
          {[35, 22, 15, 12].map((w, j) => (
            <div key={j} className="h-3.5 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" style={{ width: `${w}%`, flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Page ── */
export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/subscriptions/payments`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setPayments(data.payments ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const COL = "1fr 160px 100px 100px";

  return (
    <div className="panel-fade">
      <div className="px-9 md:px-10 pt-9 pb-5">
        <SectionHead title="Payment History" sub="All subscription payments processed" />
      </div>

      {loading ? (
        <SkeletonRows />
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-4xl">💳</span>
          <p className="text-2xl italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No payment records</p>
          <p className="text-xs text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Payments will appear here once processed.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-5 py-2.5 border-b border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.03)]" style={{ display: "grid", gridTemplateColumns: COL, gap: 12 }}>
            {["Plan", "Payment ID", "Amount", "Status"].map((h) => (
              <p key={h} className="text-[9px] tracking-[2.5px] uppercase text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{h}</p>
            ))}
          </div>

          {payments.map((p) => (
            <div
              key={p.id}
              className="px-5 py-4 border-b border-[rgba(201,168,76,0.06)] transition-colors hover:bg-[rgba(201,168,76,0.02)] items-center"
              style={{ display: "grid", gridTemplateColumns: COL, gap: 12 }}
            >
              <div>
                <p className="text-sm text-[#f5f0e8] mb-[3px] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {p.plan_title ?? "Subscription"}
                </p>
                <p className="text-[10px] text-white m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{fmtDate(p.created_at)}</p>
              </div>
              <p className="text-[10px] text-white overflow-hidden text-ellipsis whitespace-nowrap m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                {p.gateway_payment_id ?? "—"}
              </p>
              <p className="text-base text-[#c9a84c] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {fmtAmt(p.amount)}
              </p>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}