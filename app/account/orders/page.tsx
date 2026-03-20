"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarFold,
  ShoppingBag,
  BookOpen,
  Package,
} from "lucide-react";

type Order = {
  order_id: number;
  total_amount: number;
  order_date: string;
  items_count: number;
  shipping_cost: number;
};

type OrderItem = {
  product_id: number;
  title: string;
  main_image: string;
  price: number;
  quantity: number;
  format: "ebook" | "paperback";
};

type ShippingStatus = {
  status: "confirmed" | "shipped" | "out_for_delivery" | "delivered";
  courier?: string;
  tracking_number?: string;
  confirmed_at?: string;
  shipped_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes shimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-gold {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }

  .order-card {
    background: #141416;
    border: 1px solid rgba(255,255,255,0.06);
    transition: border-color 250ms ease, box-shadow 250ms ease;
  }
  .order-card:hover {
    border-color: rgba(201,168,76,0.25);
    box-shadow: 0 4px 32px rgba(0,0,0,0.5);
  }

  .skeleton-shimmer {
    background: linear-gradient(90deg, #1c1c1e 25%, #242426 50%, #1c1c1e 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s infinite;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 999px;
    letter-spacing: 0.04em;
    border: 1px solid;
  }
  .status-confirmed        { background: rgba(96,165,250,0.1);  color: #60a5fa; border-color: rgba(96,165,250,0.2); }
  .status-shipped          { background: rgba(201,168,76,0.1);  color: #c9a84c; border-color: rgba(201,168,76,0.2); }
  .status-out_for_delivery { background: rgba(251,146,60,0.1);  color: #fb923c; border-color: rgba(251,146,60,0.2); }
  .status-delivered        { background: rgba(74,222,128,0.1);  color: #4ade80; border-color: rgba(74,222,128,0.2); }

  .status-dot-confirmed        { background: #60a5fa; }
  .status-dot-shipped          { background: #c9a84c; }
  .status-dot-out_for_delivery { background: #fb923c; }
  .status-dot-delivered        { background: #4ade80; }

  .anim-fade { animation: fadeUp 0.6s ease both; }
  .gold-pulse { animation: pulse-gold 2.5s ease infinite; }
`;

const STATUS_LABEL: Record<ShippingStatus["status"], string> = {
  confirmed:        "Confirmed",
  shipped:          "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
};

/* ─── Skeleton card ─────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="order-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex justify-between items-center">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer h-3 w-16 rounded" />
        </div>
        <div className="skeleton-shimmer h-5 w-20 rounded-full" />
      </div>
      <div className="border-t px-5 py-4 flex gap-4" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
        <div className="skeleton-shimmer w-11 h-[60px] rounded flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="skeleton-shimmer h-3 w-3/4 rounded" />
          <div className="skeleton-shimmer h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function OrdersPage() {
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});
  const [shipping,   setShipping]   = useState<Record<number, ShippingStatus>>({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    fetch(`${API_URL}/api/ag-classics/orders/by-date`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(async (data: Order[]) => {
        setOrders(data);

        const itemsMap:    Record<number, OrderItem[]>    = {};
        const shippingMap: Record<number, ShippingStatus> = {};

        await Promise.all(
          data.map(async (order) => {
            const [iRes, sRes] = await Promise.all([
              fetch(`${API_URL}/api/ag-classics/orders/${order.order_id}`,         { headers: { Authorization: `Bearer ${token}` } }),
              fetch(`${API_URL}/api/ag-classics/orders/${order.order_id}/shipping`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            itemsMap[order.order_id]    = await iRes.json();
            shippingMap[order.order_id] = await sRes.json();
          })
        );

        setOrderItems(itemsMap);
        setShipping(shippingMap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grouped = groupByDate(orders);

  /* ── Empty state ── */
  if (!loading && orders.length === 0) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <ShoppingBag size={26} style={{ color: "#c9a84c" }} />
          </div>
          <h2
            className="font-light mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#f5f0e8" }}
          >
            No orders yet
          </h2>
          <p
            className="text-sm mb-8 max-w-[260px] leading-relaxed"
            style={{ fontFamily: "'Jost', sans-serif", color: "#555259" }}
          >
            Your purchased eBooks and physical books will appear here.
          </p>
          <Link
            href="/"
            className="text-[11px] font-medium uppercase tracking-[3px] px-8 py-3 transition-colors duration-300"
            style={{
              fontFamily: "'Jost', sans-serif",
              background: "#c9a84c",
              color: "#0a0a0b",
            }}
          >
            Browse Collection
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>

      <div className="w-full p-10" style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* Page heading */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-[32px] h-px" style={{ background: "rgba(201,168,76,0.4)" }} />
          <h1
            className="font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 3vw, 30px)", color: "#f5f0e8" }}
          >
            My Orders
          </h1>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && (
          <div className="space-y-10 sm:space-y-14">
            {Object.entries(grouped).map(([date, ordersForDate], groupIdx) => {
              const totalAmount = ordersForDate.reduce((s, o) => s + Number(o.total_amount), 0);
              const totalItems  = ordersForDate.reduce((s, o) => s + Number(o.items_count),  0);

              return (
                <div key={date} className="anim-fade" style={{ animationDelay: `${groupIdx * 0.08}s` }}>

                  {/* Date heading */}
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarFold size={13} style={{ color: "#555259", flexShrink: 0 }} />
                    <span
                      className="text-[11px] uppercase tracking-[3px]"
                      style={{ fontFamily: "'Cinzel', serif", color: "#555259" }}
                    >
                      {new Date(date).toDateString()}
                    </span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {ordersForDate.map((order) => {
                      const ship  = shipping[order.order_id];
                      const items = orderItems[order.order_id];

                      return (
                        <Link
                          key={order.order_id}
                          href={`/account/orders/${order.order_id}`}
                          className="order-card block rounded-xl overflow-hidden"
                        >
                          {/* ── ORDER HEADER ── */}
                          <div className="px-4 sm:px-5 py-3 sm:py-4">
                            <div className="flex items-start justify-between gap-3">

                              {/* Left */}
                              <div className="min-w-0">
                                <p
                                  className="font-medium text-sm sm:text-base"
                                  style={{ color: "#f5f0e8" }}
                                >
                                  Order{" "}
                                  <span style={{ color: "#c9a84c" }}>#{order.order_id}</span>
                                </p>
                                <p
                                  className="text-[11px] mt-0.5"
                                  style={{ color: "#555259" }}
                                >
                                  {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                                </p>
                              </div>

                              {/* Right */}
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <p
                                  className="font-medium text-sm sm:text-base"
                                  style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}
                                >
                                  ₹{Number(order.total_amount).toFixed(2)}
                                </p>
                                {Number(order.shipping_cost) > 0 && (
                                  <p className="text-[10px]" style={{ color: "#555259" }}>
                                    + ₹{Number(order.shipping_cost).toFixed(0)} shipping
                                  </p>
                                )}
                                {ship && (
                                  <span className={`status-badge status-${ship.status}`}>
                                    <span
                                      className={`status-dot-${ship.status} w-1.5 h-1.5 rounded-full inline-block gold-pulse`}
                                      style={{ flexShrink: 0 }}
                                    />
                                    {STATUS_LABEL[ship.status]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* ── ITEMS ── */}
                          <div
                            className="border-t px-4 sm:px-5 py-3 sm:py-4 space-y-3"
                            style={{
                              borderColor: "rgba(255,255,255,0.05)",
                              background: "rgba(255,255,255,0.015)",
                            }}
                          >
                            {!items ? (
                              <div className="flex items-center gap-3">
                                <div className="skeleton-shimmer w-10 h-14 rounded flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="skeleton-shimmer h-3 w-3/4 rounded" />
                                  <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                                </div>
                              </div>
                            ) : (
                              items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  {/* Cover */}
                                  <div
                                    className="flex-shrink-0 rounded overflow-hidden"
                                    style={{
                                      width: 40, height: 56,
                                      border: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                  >
                                    <Image
                                      src={`${API_URL}${item.main_image}`}
                                      width={40}
                                      height={56}
                                      alt=""
                                      unoptimized
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-xs sm:text-sm font-medium truncate leading-tight"
                                      style={{ color: "#e8e0d0" }}
                                    >
                                      {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {item.format === "ebook" ? (
                                        <BookOpen size={10} style={{ color: "#c9a84c", flexShrink: 0 }} />
                                      ) : (
                                        <Package size={10} style={{ color: "#8a8790", flexShrink: 0 }} />
                                      )}
                                      <p
                                        className="text-[11px] capitalize"
                                        style={{ color: "#555259" }}
                                      >
                                        {item.format} × {item.quantity}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Price */}
                                  <p
                                    className="text-xs sm:text-sm font-medium flex-shrink-0"
                                    style={{ color: "#c9a84c" }}
                                  >
                                    ₹{item.price}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Day summary */}
                  <div
                    className="mt-3 flex items-center gap-3 text-[12px]"
                    style={{ color: "#3a3a3e" }}
                  >
                    <span>
                      Day total:{" "}
                      <strong style={{ color: "#8a8790" }}>₹{totalAmount.toFixed(2)}</strong>
                    </span>
                    <span style={{ color: "#2a2a2e" }}>|</span>
                    <span>
                      Items:{" "}
                      <strong style={{ color: "#8a8790" }}>{totalItems}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── HELPERS ────────────────────────────────────────────── */
function groupByDate(orders: Order[]): Record<string, Order[]> {
  return orders.reduce<Record<string, Order[]>>((acc, order) => {
    if (!acc[order.order_date]) acc[order.order_date] = [];
    acc[order.order_date].push(order);
    return acc;
  }, {});
}