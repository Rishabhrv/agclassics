"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ── Types ── */
interface OrderItem {
  id: number;
  product_id: number;
  title: string;
  main_image: string;
  format: "ebook" | "paperback";
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  payment_status: "pending" | "success" | "failed";
  razorpay_payment_id?: string;
  created_at: string;
  coupon_code?: string;
  coupon_discount?: number;
  items?: OrderItem[];
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
  const s = STATUS_COLOR[status] ?? { bg: "bg-zinc-700/40", text: "text-zinc-500" };
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
      <p className="text-[11px] text-zinc-500 tracking-[0.5px] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{sub}</p>
      <div className="mt-3.5 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.25), transparent)" }} />
    </div>
  );
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-5 py-[18px] border-b border-[rgba(201,168,76,0.06)]">
          {[10, 30, 15, 12, 14, 6].map((w, j) => (
            <div key={j} className="h-3.5 rounded-sm animate-pulse bg-[rgba(201,168,76,0.07)]" style={{ width: `${w}%`, flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Page ── */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/orders/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setOrders(data.orders ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const COL = "80px 1fr 100px 90px 110px 50px";

  return (
    <div className="panel-fade">
      <div className="px-9 md:px-10 pt-9 pb-5">
        <SectionHead title="Order History" sub="All your physical & digital purchases" />
      </div>

      {loading ? (
        <SkeletonRows />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-4xl">📦</span>
          <p className="text-2xl italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No orders yet</p>
          <p className="text-xs text-zinc-500 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Your purchases will appear here.</p>
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="px-5 py-2.5 border-b border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.03)]" style={{ display: "grid", gridTemplateColumns: COL, gap: 12 }}>
            {["Order #", "Date", "Items", "Amount", "Status", ""].map((h) => (
              <p key={h} className="text-[9px] tracking-[2.5px] uppercase text-zinc-500 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{h}</p>
            ))}
          </div>

          {orders.map((order) => (
            <div key={order.id}>
              {/* Row */}
              <div
                className="px-5 py-[18px] border-b border-[rgba(201,168,76,0.07)] cursor-pointer transition-colors hover:bg-[rgba(201,168,76,0.03)] items-center"
                style={{ display: "grid", gridTemplateColumns: COL, gap: 12 }}
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <p className="text-[11px] text-[#c9a84c] m-0" style={{ fontFamily: "'Cinzel', serif" }}>#{order.id}</p>
                <p className="text-xs text-zinc-500 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{fmtDate(order.created_at)}</p>
                <p className="text-xs text-[#e8e0d0] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{order.items?.length ?? "—"} item(s)</p>
                <p className="text-base text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{fmtAmt(order.total_amount)}</p>
                <StatusBadge status={order.status} />
                <div className="flex justify-end">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="2"
                    style={{ transform: expanded === order.id ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="bg-[rgba(201,168,76,0.025)] border-b border-[rgba(201,168,76,0.08)] px-5 py-5">
                  <div className="grid grid-cols-2 gap-6 mb-5">
                    <div>
                      <p className="text-[9px] tracking-[2.5px] uppercase text-zinc-500 mb-1 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Payment Status</p>
                      <StatusBadge status={order.payment_status} />
                    </div>
                    {order.razorpay_payment_id && (
                      <div>
                        <p className="text-[9px] tracking-[2.5px] uppercase text-zinc-500 mb-1 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Payment ID</p>
                        <span className="text-[11px] text-[#f5f0e8]" style={{ fontFamily: "monospace" }}>{order.razorpay_payment_id}</span>
                      </div>
                    )}
                    {order.coupon_code && (
                      <div>
                        <p className="text-[9px] tracking-[2.5px] uppercase text-zinc-500 mb-1 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Coupon Applied</p>
                        <span className="text-base text-[#f5f0e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{order.coupon_code} (−{fmtAmt(order.coupon_discount ?? 0)})</span>
                      </div>
                    )}
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div>
                      <p className="text-[9px] tracking-[2.5px] uppercase text-[#8a6f2e] mb-3.5 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>Items</p>
                      <div className="flex flex-col gap-2.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3.5 px-3.5 py-2.5 bg-white/[0.02] border border-[rgba(201,168,76,0.08)]">
                            {item.main_image && (
                              <img src={`${API_URL}${item.main_image}`} alt={item.title} className="w-9 h-12 object-cover shrink-0 border border-[rgba(201,168,76,0.1)]" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-[#f5f0e8] mb-1 m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.title}</p>
                              <p className="text-[10px] text-zinc-500 tracking-[1px] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                                {item.format.toUpperCase()} · Qty {item.quantity}
                              </p>
                            </div>
                            <p className="text-base text-[#c9a84c] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{fmtAmt(item.price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <a
                      href={`/orders/${order.id}`}
                      className="text-[10px] tracking-[2px] uppercase px-5 py-2.5 border border-[rgba(201,168,76,0.2)] text-zinc-500 no-underline transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      View Details
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}