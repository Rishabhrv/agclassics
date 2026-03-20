"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, ChevronLeft, Package, BookOpen } from "lucide-react";
import DeliveryTimeline from "./DeliveryTimeline";
import ReviewSection from "./ReviewSection";
import InvoiceButton from "@/components/invoice/InvoiceButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmerSweep {
    from { left: -60%; }
    to   { left: 160%; }
  }

  .anim-fade { animation: fadeUp 0.5s ease both; }

  .dark-card {
    background: #141416;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    overflow: hidden;
  }
  .dark-card-header {
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dark-divider { border-top: 1px solid rgba(255,255,255,0.05); }

  .mag-cta { position: relative; overflow: hidden; }
  .mag-cta::after {
    content: '';
    position: absolute;
    top: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }
  .mag-cta:hover::after { animation: shimmerSweep 0.55s ease; }

  .status-success { background: rgba(74,222,128,0.08); border-color: rgba(74,222,128,0.2); color: #4ade80; }
  .status-failed  { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.2); color: #f87171; }
  .status-pending { background: rgba(251,191,36,0.08);  border-color: rgba(251,191,36,0.2);  color: #fbbf24; }

  .review-btn {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-family: 'Jost', sans-serif;
    padding: 7px 14px;
    border: 1px solid rgba(201,168,76,0.25);
    color: #c9a84c;
    background: rgba(201,168,76,0.06);
    cursor: pointer;
    transition: background 250ms, border-color 250ms;
    border-radius: 4px;
  }
  .review-btn:hover {
    background: rgba(201,168,76,0.12);
    border-color: rgba(201,168,76,0.5);
  }

  .overlay-backdrop {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    display: flex; align-items: flex-end; justify-content: center;
  }
  @media (min-width: 640px) {
    .overlay-backdrop { align-items: center; padding: 16px; }
  }
  .review-modal {
    position: relative; z-index: 10;
    background: #141416;
    border: 1px solid rgba(255,255,255,0.08);
    width: 100%;
    border-radius: 16px 16px 0 0;
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
  }
  @media (min-width: 640px) {
    .review-modal { max-width: 480px; border-radius: 16px; padding: 24px; }
  }
`;

type OrderItem = {
  order_id: number;
  product_id: number;
  title: string;
  main_image: string;
  price: number;
  quantity: number;
  format: "ebook" | "paperback";
  total_amount: number;
  payment_status: "pending" | "success" | "failed";
  payment_method?: string;
  transaction_id?: string;
  paid_amount?: number;
  created_at: string;
  shipping_cost: number;
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  shipping_email?: string;
};

export default function OrderDetailsPage() {
  const params  = useParams();
  const orderId = params?.orderId as string | undefined;

  const [items,          setItems]          = useState<OrderItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [reviewItem,     setReviewItem]     = useState<{ product_id: number; title: string } | null>(null);
  const [shippingStatus, setShippingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    fetch(`${API_URL}/api/ag-classics/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/api/ag-classics/orders/${orderId}/shipping`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setShippingStatus(data?.status?.toLowerCase().trim() || "confirmed"));
  }, [orderId]);

  if (!orderId) return (
    <p className="p-6 text-sm" style={{ fontFamily: "'Jost', sans-serif", color: "#555259" }}>
      Invalid order
    </p>
  );

  if (loading) return (
    <>
      <style>{globalStyles}</style>
      <div
        className="flex items-center justify-center py-24 gap-3 text-sm"
        style={{ fontFamily: "'Jost', sans-serif", color: "#555259" }}
      >
        <svg
          style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }}
          viewBox="0 0 24 24" fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#c9a84c" strokeWidth="4"/>
          <path fill="#c9a84c" d="M4 12a8 8 0 018-8v8z" opacity="0.75"/>
        </svg>
        Loading order…
      </div>
    </>
  );

  if (!items.length) return (
    <p className="p-6 text-sm" style={{ fontFamily: "'Jost', sans-serif", color: "#555259" }}>
      Order not found
    </p>
  );

  const order          = items[0];
  const numericOrderId = Number(orderId);
  const hasPaperback   = items.some((i) => i.format === "paperback");

  const paymentStatusClass =
    order.payment_status === "success" ? "status-success" :
    order.payment_status === "failed"  ? "status-failed"  : "status-pending";

  const paymentIcon =
    order.payment_status === "success" ? <CheckCircle size={13} /> :
    order.payment_status === "failed"  ? <XCircle     size={13} /> :
                                         <Clock       size={13} />;

  return (
    <>
      <style>{globalStyles}</style>

      <div className="w-full space-y-4 sm:space-y-5 anim-fade p-5" style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* ── HEADER ── */}
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-xs mb-4 transition-colors"
            style={{ color: "#555259" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555259")}
          >
            <ChevronLeft size={14} />
            Back to orders
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1
                className="font-light"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 3vw, 30px)", color: "#f5f0e8" }}
              >
                Order{" "}
                <em className="italic" style={{ color: "#c9a84c" }}>#{order.order_id}</em>
              </h1>
              <p className="text-[12px] mt-1" style={{ color: "#555259" }}>
                Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border capitalize ${paymentStatusClass}`}
              style={{ letterSpacing: "0.03em" }}
            >
              {paymentIcon}
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* ── DELIVERY TIMELINE ── */}
        {hasPaperback && <DeliveryTimeline orderId={numericOrderId} />}

        {/* ── ORDER ITEMS ── */}
        <div className="dark-card">
          <div className="dark-card-header">
            <Package size={14} style={{ color: "#c9a84c" }} />
            <span
              className="text-[11px] uppercase tracking-[2px]"
              style={{ fontFamily: "'Cinzel', serif", color: "#8a8790" }}
            >
              {items.length} item{items.length !== 1 ? "s" : ""} in this order
            </span>
          </div>

          <div>
            {items.map((item, i) => (
              <div key={i} className={i > 0 ? "dark-divider" : ""}>
                <div className="px-4 sm:px-5 py-4">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Cover */}
                    <div
                      className="flex-shrink-0 rounded overflow-hidden"
                      style={{ width: 48, height: 68, border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <Image
                        src={`${API_URL}${item.main_image}`}
                        width={48}
                        height={68}
                        alt=""
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-sm leading-tight line-clamp-2"
                        style={{ color: "#e8e0d0" }}
                      >
                        {item.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        {item.format === "ebook"
                          ? <BookOpen size={10} style={{ color: "#c9a84c", flexShrink: 0 }} />
                          : <Package  size={10} style={{ color: "#8a8790", flexShrink: 0 }} />
                        }
                        <p className="text-[11px] capitalize" style={{ color: "#555259" }}>
                          {item.format} × {item.quantity}
                        </p>
                      </div>

                      {item.format === "ebook" && (
                        <span
                          className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(74,222,128,0.08)",
                            border: "1px solid rgba(74,222,128,0.18)",
                            color: "#4ade80",
                          }}
                        >
                          Available in My Books
                        </span>
                      )}

                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {shippingStatus === "delivered" && item.format === "paperback" && (
                          <button
                            className="review-btn"
                            onClick={() => setReviewItem({ product_id: item.product_id, title: item.title })}
                          >
                            Write a review
                          </button>
                        )}
                        {item.format === "ebook" && (
                          <button
                            className="review-btn"
                            onClick={() => setReviewItem({ product_id: item.product_id, title: item.title })}
                          >
                            Write a review
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-medium text-sm" style={{ color: "#c9a84c" }}>
                        ₹{item.price}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#555259" }}>
                        × {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAYMENT + SUMMARY ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Payment details */}
          <div className="dark-card p-4 sm:p-5" style={{ borderRadius: 12 }}>
            <h2
              className="text-[11px] uppercase tracking-[3px] mb-4 pb-3"
              style={{ fontFamily: "'Cinzel', serif", color: "#555259", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px]" style={{ color: "#555259" }}>Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border capitalize ${paymentStatusClass}`}
                >
                  {paymentIcon}
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px]" style={{ color: "#555259" }}>Method</span>
                <span className="text-[12px] font-medium" style={{ color: "#e8e0d0" }}>
                  {order.payment_method || "Razorpay"}
                </span>
              </div>
              <div
                className="flex justify-between items-center pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-[12px]" style={{ color: "#555259" }}>Amount Paid</span>
                <span
                  className="font-medium text-base"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: 20 }}
                >
                  ₹{order.paid_amount || order.total_amount}
                </span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="dark-card p-4 sm:p-5" style={{ borderRadius: 12 }}>
            <h2
              className="text-[11px] uppercase tracking-[3px] mb-4 pb-3"
              style={{ fontFamily: "'Cinzel', serif", color: "#555259", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px]" style={{ color: "#555259" }}>Subtotal</span>
                <span className="text-[12px] font-medium" style={{ color: "#e8e0d0" }}>
                  ₹{(order.total_amount - Number(order.shipping_cost)).toFixed(2)}
                </span>
              </div>
              {Number(order.shipping_cost) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[12px]" style={{ color: "#555259" }}>Shipping</span>
                  <span className="text-[12px] font-medium" style={{ color: "#e8e0d0" }}>
                    ₹{Number(order.shipping_cost).toFixed(2)}
                  </span>
                </div>
              )}
              <div
                className="flex justify-between items-center pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-[12px] font-medium" style={{ color: "#e8e0d0" }}>Total</span>
                <span
                  className="font-medium"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: 20 }}
                >
                  ₹{order.total_amount}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <InvoiceButton orderId={order.order_id} />
            </div>
          </div>
        </div>

        {/* ── SHIPPING ADDRESS ── */}
        {order.address && (
          <div className="dark-card p-4 sm:p-5" style={{ borderRadius: 12 }}>
            <h2
              className="text-[11px] uppercase tracking-[3px] mb-4 pb-3"
              style={{ fontFamily: "'Cinzel', serif", color: "#555259", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              Shipping Address
            </h2>
            <div className="space-y-1 text-[13px] leading-relaxed" style={{ color: "#8a8790" }}>
              <p className="font-medium" style={{ color: "#e8e0d0" }}>
                {order.first_name} {order.last_name}
              </p>
              <p>{order.address}</p>
              <p>{order.city}, {order.state} – {order.pincode}</p>
              {order.phone && (
                <p className="mt-1.5" style={{ color: "#555259" }}>📞 {order.phone}</p>
              )}
              {order.shipping_email && (
                <p style={{ color: "#555259" }}>✉ {order.shipping_email}</p>
              )}
            </div>
          </div>
        )}

        {/* ── REVIEW POPUP ── */}
        {reviewItem && (
          <div className="overlay-backdrop" onClick={() => setReviewItem(null)}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
              <div
                className="flex justify-between items-center mb-5 pb-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <h2
                  className="font-light leading-tight line-clamp-1 pr-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#f5f0e8" }}
                >
                  {reviewItem.title}
                </h2>
                <button
                  onClick={() => setReviewItem(null)}
                  className="transition-colors cursor-pointer text-lg leading-none"
                  style={{ color: "#555259" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555259")}
                >
                  ✕
                </button>
              </div>
              <ReviewSection productId={reviewItem.product_id} productTitle={reviewItem.title} />
            </div>
          </div>
        )}

      </div>
    </>
  );
}