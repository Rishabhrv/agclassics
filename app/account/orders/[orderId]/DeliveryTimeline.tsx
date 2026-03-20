"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

  @keyframes pulse-gold {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
  }
  .step-pulse { animation: pulse-gold 2s ease infinite; }
`;

type ShippingInfo = {
  status: "confirmed" | "shipped" | "out_for_delivery" | "delivered";
  courier?: string;
  tracking_number?: string;
  confirmed_at?: string;
  shipped_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
};

const STEPS = [
  { key: "confirmed",        label: "Order Confirmed",  field: "confirmed_at"        },
  { key: "shipped",          label: "Shipped",           field: "shipped_at"          },
  { key: "out_for_delivery", label: "Out for Delivery",  field: "out_for_delivery_at" },
  { key: "delivered",        label: "Delivered",         field: "delivered_at"        },
] as const;

const STATUS_ORDER = ["confirmed", "shipped", "out_for_delivery", "delivered"] as const;

const normalizeStatus = (status?: string) =>
  (status || "confirmed").toLowerCase().trim();

export default function DeliveryTimeline({ orderId }: { orderId: number }) {
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/ag-classics/orders/${orderId}/shipping`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) =>
        setShipping({ ...data, status: normalizeStatus(data.status) as ShippingInfo["status"] })
      );
  }, [orderId]);

  const currentIndex = shipping ? STATUS_ORDER.indexOf(shipping.status) : 0;

  return (
    <>
      <style>{globalStyles}</style>

      <div
        style={{
          background: "#141416",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            className="text-[11px] uppercase tracking-[3px]"
            style={{ fontFamily: "'Cinzel', serif", color: "#555259" }}
          >
            Delivery Status
          </span>
        </div>

        <div className="p-4 sm:p-5">

          {/* ── Mobile: horizontal stepper ── */}
          <div className="sm:hidden mb-4">
            <div className="relative flex items-start justify-between">
              {/* Background track */}
              <div
                className="absolute top-4 left-0 right-0 h-px"
                style={{ background: "rgba(255,255,255,0.06)", zIndex: 0 }}
              />
              {/* Gold progress track */}
              <div
                className="absolute top-4 left-0 h-px transition-all duration-700"
                style={{
                  background: "linear-gradient(to right, #8a6f2e, #c9a84c)",
                  width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
                  zIndex: 1,
                }}
              />

              {STEPS.map((step, i) => {
                const isDone    = currentIndex >= i;
                const isCurrent = currentIndex === i;
                return (
                  <div key={i} className="flex flex-col items-center gap-2" style={{ zIndex: 2 }}>
                    <div
                      className={isCurrent ? "step-pulse" : ""}
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isDone ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                        border: isDone
                          ? "1.5px solid rgba(201,168,76,0.5)"
                          : "1.5px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {isDone
                        ? <CheckCircle size={14} style={{ color: "#c9a84c" }} />
                        : <Circle     size={12} style={{ color: "#3a3a3e" }} />
                      }
                    </div>
                    <span
                      className="text-[10px] text-center leading-tight max-w-[56px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: isDone ? "#c9a84c" : "#3a3a3e" }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current step info */}
            {shipping && (
              <div
                className="mt-4 px-3 py-3 rounded-lg text-xs"
                style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)" }}
              >
                <p
                  className="font-medium capitalize mb-1"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}
                >
                  {STATUS_ORDER[currentIndex].replace(/_/g, " ")}
                </p>
                {(() => {
                  const step    = STEPS[currentIndex];
                  const dateVal = shipping[step.field as keyof ShippingInfo];
                  return dateVal ? (
                    <p style={{ color: "#8a8790" }}>
                      {new Date(dateVal).toLocaleDateString()} ·{" "}
                      {new Date(dateVal).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  ) : (
                    <p style={{ color: "#3a3a3e" }}>Pending</p>
                  );
                })()}
                {shipping.tracking_number && currentIndex >= 1 && (
                  <p className="mt-1" style={{ color: "#8a8790" }}>
                    {shipping.courier || "Courier"} ·{" "}
                    <span className="font-mono text-[10px]">{shipping.tracking_number}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Desktop: vertical timeline ── */}
          <div className="hidden sm:block space-y-0">
            {STEPS.map((step, i) => {
              const isDone    = currentIndex >= i;
              const isCurrent = currentIndex === i;
              const isLast    = i === STEPS.length - 1;
              const dateVal   = shipping?.[step.field as keyof ShippingInfo];
              const showTracking = step.key === "shipped" && shipping?.tracking_number && isDone;

              return (
                <div key={i} className="flex gap-4">
                  {/* Icon + connector line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={isCurrent ? "step-pulse" : ""}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isDone ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                        border: isDone
                          ? "1.5px solid rgba(201,168,76,0.4)"
                          : "1.5px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {isDone
                        ? <CheckCircle size={13} style={{ color: "#c9a84c" }} />
                        : <Circle     size={11} style={{ color: "#3a3a3e" }} />
                      }
                    </div>
                    {!isLast && (
                      <div
                        style={{
                          width: 1, flexGrow: 1, marginTop: 4, minHeight: 28,
                          background: isDone
                            ? "linear-gradient(to bottom, rgba(201,168,76,0.4), rgba(201,168,76,0.1))"
                            : "rgba(255,255,255,0.05)",
                        }}
                      />
                    )}
                  </div>

                  {/* Text content */}
                  <div className={`pb-5 ${!isDone ? "opacity-40" : ""}`}>
                    <p
                      className="text-sm font-medium"
                      style={{ fontFamily: "'Jost', sans-serif", color: isDone ? "#e8e0d0" : "#3a3a3e" }}
                    >
                      {step.label}
                    </p>
                    {dateVal ? (
                      <p className="text-[12px] mt-0.5" style={{ color: "#555259" }}>
                        {new Date(dateVal).toLocaleDateString()} ·{" "}
                        {new Date(dateVal).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    ) : (
                      <p className="text-[12px] mt-0.5" style={{ color: "#3a3a3e" }}>Pending</p>
                    )}
                    {showTracking && (
                      <p className="text-[12px] mt-1" style={{ color: "#555259" }}>
                        {shipping.courier || "Courier"} ·{" "}
                        <span className="font-mono text-[11px]" style={{ color: "#c9a84c" }}>
                          {shipping.tracking_number}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}