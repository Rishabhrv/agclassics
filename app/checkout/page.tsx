"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

/* ═══════════════════ TYPES ═══════════════════ */
interface CartItem {
  id: number;
  product_id: number;
  format: "paperback" | "ebook";
  quantity: number;
  title: string;
  slug: string;
  main_image: string;
  price: number;
  sell_price: number;
  stock: number;
}

interface Address {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  country: string;
}

type Step = "contact" | "shipping" | "payment";

const EMPTY_ADDRESS: Address = {
  first_name: "", last_name: "", address: "", city: "",
  state: "", pincode: "", phone: "", email: "", country: "India",
};

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const disc = (p: number, s: number) => p > 0 ? Math.round(((p - s) / p) * 100) : 0;

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [step, setStep] = useState<Step>("contact");
  const [addr, setAddr] = useState<Address>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponChecking, setCouponChecking] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; total: number } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  /* ── fetch cart ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/ag-classics/cart`, { headers });
        const data = await res.json();
        if (data.success) setCart(data.cart);
      } finally {
        setCartLoading(false);
      }
    })();
  }, []);

  /* ── fetch saved addresses ── */
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/user/addresses`, { headers })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSavedAddresses(d.addresses || []); })
      .catch(() => {});
  }, [token]);

  /* ── prefill user email from token ── */
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setAddr((prev) => ({
        ...prev,
        email: payload.email || prev.email,
        first_name: payload.name?.split(" ")[0] || prev.first_name,
        last_name: payload.name?.split(" ").slice(1).join(" ") || prev.last_name,
      }));
    } catch {}
  }, [token]);

  /* ── totals ── */
  const subtotal = cart.reduce((s, i) => s + i.sell_price * i.quantity, 0);
  const savings   = cart.reduce((s, i) => s + (i.price - i.sell_price) * i.quantity, 0);
  const shipping  = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total     = subtotal + shipping - couponDiscount;

  /* ── field change ── */
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAddr((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  /* ── validation ── */
  const validateContact = () => {
    const e: Partial<Address> = {};
    if (!addr.first_name.trim()) e.first_name = "Required";
    if (!addr.last_name.trim())  e.last_name  = "Required";
    if (!addr.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!addr.phone.match(/^\d{10}$/)) e.phone = "10-digit number required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateShipping = () => {
    const e: Partial<Address> = {};
    if (!addr.address.trim()) e.address = "Required";
    if (!addr.city.trim())    e.city    = "Required";
    if (!addr.state.trim())   e.state   = "Required";
    if (!addr.pincode.match(/^\d{6}$/)) e.pincode = "6-digit PIN required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── coupon ── */
  const applyCoupon = async () => {
    if (!coupon.trim()) return setCouponError("Enter a coupon code");
    setCouponChecking(true);
    setCouponError("");
    try {
      const res = await fetch(`${API_URL}/api/ag-classics/coupons/apply`, {
        method: "POST",
        headers,
        body: JSON.stringify({ code: coupon, cart_total: subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponDiscount(data.discount);
        setCouponApplied(true);
      } else {
        setCouponError(data.message || "Invalid coupon");
      }
    } catch {
      setCouponError("Could not apply coupon");
    } finally {
      setCouponChecking(false);
    }
  };

  /* ── Razorpay payment ── */
  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (!validateShipping()) return;
    setPaymentLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay failed to load");

      /* 1. Create order on backend */
      const orderRes = await fetch(`${API_URL}/api/ag-classics/checkout/create-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          address: addr,
          coupon_code: couponApplied ? coupon : null,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || "Order creation failed");

      /* 2. Open Razorpay modal */
      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY,
        amount: orderData.razorpay_amount,
        currency: "INR",
        name: "AG Classics",
        description: `Order #${orderData.order_id}`,
        order_id: orderData.razorpay_order_id,
        prefill: { name: `${addr.first_name} ${addr.last_name}`, email: addr.email, contact: addr.phone },
        theme: { color: "#c9a84c" },
        modal: { backdropclose: false },
        handler: async (response: any) => {
          /* 3. Verify on backend */
          const verifyRes = await fetch(`${API_URL}/api/ag-classics/checkout/verify`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              order_id: orderData.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrderSuccess({ orderId: orderData.order_id, total: total });
            setStep("payment");
          } else {
            alert("Payment verification failed. Contact support.");
          }
        },
      });

      rzp.on("payment.failed", (resp: any) => {
        console.error("Payment failed:", resp.error);
        alert(`Payment failed: ${resp.error.description}`);
      });

      rzp.open();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ═══════ RENDER ═══════ */

  /* Success screen */
  if (orderSuccess) {
    return (
      <PageWrap>
        <SuccessScreen orderId={orderSuccess.orderId} total={orderSuccess.total} />
      </PageWrap>
    );
  }

  /* Cart empty */
  if (!cartLoading && cart.length === 0) {
    return (
      <PageWrap>
        <div className="flex flex-col items-center gap-6 py-32 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <h2 className="text-[32px] font-light italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
            Your cart is empty
          </h2>
          <GoldBtn onClick={() => (window.location.href = "/")}>Browse Collection</GoldBtn>
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <style>{`
        @keyframes co-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .co-fade { animation: co-fadeUp 0.4s ease both; }

        .co-input {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.07);
          color: #f5f0e8;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          padding: 11px 14px;
          outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }
        .co-input::placeholder { color: #3a3a3e; }
        .co-input:focus { border-color: rgba(201,168,76,0.5); }
        .co-input.error { border-color: rgba(139,58,58,0.7); }
        .co-input:disabled { opacity: 0.4; cursor: not-allowed; }

        select.co-input option { background: #1c1c1e; color: #f5f0e8; }

        .co-label {
          display: block;
          font-family: 'Jost', sans-serif;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6b6b70;
          margin-bottom: 6px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .co-spin {
          display: inline-block;
          width: 14px; height: 14px;
          border: 1.5px solid rgba(10,10,11,0.3);
          border-top-color: #0a0a0b;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        /* ── Razorpay fixes ──
           Hide the dark backdrop, keep the modal iframe on top */
        .razorpay-backdrop,
        div[class*="razorpay-backdrop"],
        div[id*="razorpay-backdrop"] {
          display: none !important;
        }
        .razorpay-container {
          z-index: 2147483647 !important;
          position: fixed !important;
        }
        body.razorpay-payment-open {
          overflow: hidden !important;
        }
      `}</style>

      {/* Page header */}
      <div className="mb-10 co-fade">
        <span className="block mb-2 text-[10px] tracking-[5px] uppercase"
          style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
          Secure Checkout
        </span>
        <h1 className="font-light italic leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 54px)", color: "#f5f0e8" }}>
          Complete Your Order
        </h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-16 h-px" style={{ background: "rgba(201,168,76,0.3)" }} />
          <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.3)" }} />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.15), transparent)" }} />
        </div>
      </div>

      {/* Step indicator */}
      <StepBar current={step} onContact={() => step !== "contact" && setStep("contact")} />

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0.5 mt-8 items-start">

        {/* ──────────── LEFT PANEL ──────────── */}
        <div className="flex flex-col gap-0.5">

          {/* ── STEP 1: Contact ── */}
          <FormSection
            title="Contact Information"
            step="01"
            active={step === "contact"}
            done={step !== "contact"}
            onEdit={() => setStep("contact")}
          >
            {step === "contact" && (
              <div className="co-fade">
                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <label className="co-label">Saved Addresses</label>
                    <div className="flex flex-col gap-1">
                      {savedAddresses.map((a, i) => (
                        <button key={i}
                          className="flex items-start gap-3 p-3 text-left transition-colors duration-200"
                          style={{
                            background: selectedSaved === i ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${selectedSaved === i ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
                          }}
                          onClick={() => {
                            setSelectedSaved(i);
                            setAddr((prev) => ({ ...prev, ...a }));
                          }}
                        >
                          <div className="w-3 h-3 mt-0.5 flex-shrink-0 flex items-center justify-center"
                            style={{ border: `1px solid ${selectedSaved === i ? "#c9a84c" : "#6b6b70"}` }}>
                            {selectedSaved === i && <div className="w-1.5 h-1.5" style={{ background: "#c9a84c" }} />}
                          </div>
                          <div>
                            <p className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>
                              {a.address}, {a.city}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                              {a.state} — {a.pincode}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 my-5">
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                      <span className="text-[9px] tracking-[2px] uppercase" style={{ fontFamily: "'Jost', sans-serif", color: "#3a3a3e" }}>
                        or enter new
                      </span>
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-0.5 mb-0.5">
                  <Field label="First Name" value={addr.first_name} onChange={set("first_name")} error={errors.first_name} />
                  <Field label="Last Name"  value={addr.last_name}  onChange={set("last_name")}  error={errors.last_name} />
                </div>
                <div className="grid grid-cols-2 gap-0.5 mb-0.5">
                  <Field label="Email Address" value={addr.email} onChange={set("email")} error={errors.email} type="email" />
                  <Field label="Phone Number"  value={addr.phone} onChange={set("phone")} error={errors.phone} type="tel" placeholder="10-digit mobile" />
                </div>

                <div className="flex justify-end mt-5">
                  <GoldBtn onClick={() => { if (validateContact()) setStep("shipping"); }}>
                    Continue to Shipping →
                  </GoldBtn>
                </div>
              </div>
            )}

            {/* Collapsed summary */}
            {step !== "contact" && addr.email && (
              <div className="pt-2">
                <p className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>
                  {addr.first_name} {addr.last_name}
                </p>
                <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                  {addr.email} · {addr.phone}
                </p>
              </div>
            )}
          </FormSection>

          {/* ── STEP 2: Shipping ── */}
          <FormSection
            title="Shipping Address"
            step="02"
            active={step === "shipping"}
            done={step === "payment"}
            onEdit={step === "payment" ? () => setStep("shipping") : undefined}
          >
            {step === "shipping" && (
              <div className="co-fade">
                <div className="mb-0.5">
                  <Field
                    label="Street Address"
                    value={addr.address}
                    onChange={set("address")}
                    error={errors.address}
                    placeholder="House no., Building, Street"
                    textarea
                  />
                </div>
                <div className="grid grid-cols-2 gap-0.5 mb-0.5">
                  <Field label="City"  value={addr.city}  onChange={set("city")}  error={errors.city} />
                  <div>
                    <label className="co-label">State</label>
                    <select
                      value={addr.state}
                      onChange={set("state")}
                      className={`co-input ${errors.state ? "error" : ""}`}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <ErrMsg>{errors.state}</ErrMsg>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-0.5 mb-0.5">
                  <Field label="PIN Code" value={addr.pincode} onChange={set("pincode")} error={errors.pincode} placeholder="6 digits" maxLength={6} />
                  <div>
                    <label className="co-label">Country</label>
                    <select value={addr.country} onChange={set("country")} className="co-input">
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>

                {/* Shipping method */}
                <div className="mt-6 mb-5">
                  <label className="co-label mb-3">Shipping Method</label>
                  <div
                    className="flex items-center justify-between p-4"
                    style={{
                      background: "rgba(201,168,76,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 flex items-center justify-center" style={{ border: "1px solid #c9a84c" }}>
                        <div className="w-1.5 h-1.5" style={{ background: "#c9a84c" }} />
                      </div>
                      <div>
                        <p className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>
                          Standard Delivery · DTDC
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                          5–7 business days
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: shipping === 0 ? "#4a9a5a" : "#f5f0e8" }}>
                      {shipping === 0 ? "Free" : fmt(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] mt-2" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                      Add {fmt(499 - subtotal)} more for free shipping
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    className="text-[9px] tracking-[2px] uppercase transition-colors duration-200"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70", background: "none", border: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b70")}
                    onClick={() => setStep("contact")}
                  >
                    ← Back
                  </button>
                  <GoldBtn
                    onClick={handlePayment}
                    loading={paymentLoading}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? "Processing…" : `Pay ${fmt(total)}`}
                  </GoldBtn>
                </div>
              </div>
            )}

            {/* Collapsed summary */}
            {step === "payment" && addr.address && (
              <div className="pt-2">
                <p className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>
                  {addr.address}
                </p>
                <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                  {addr.city}, {addr.state} – {addr.pincode}
                </p>
              </div>
            )}
          </FormSection>

          {/* Trust badges */}
          <div className="flex items-center justify-between p-5 flex-wrap gap-4"
            style={{ background: "#1c1c1e" }}>
            {[
              { icon: "🔒", text: "256-bit SSL" },
              { icon: "💳", text: "Razorpay Secure" },
              { icon: "↩", text: "Easy Returns" },
              { icon: "📦", text: "DTDC Shipping" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2">
                <span className="text-base">{b.icon}</span>
                <span className="text-[9px] tracking-[2px] uppercase"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ──────────── RIGHT: ORDER SUMMARY ──────────── */}
        <div className="flex flex-col gap-0.5 lg:sticky lg:top-6">

          {/* Items */}
          <div className="p-6" style={{ background: "#1c1c1e" }}>
            <p className="text-[9px] tracking-[3px] uppercase mb-5"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
              Order Summary · {cart.length} {cart.length === 1 ? "item" : "items"}
            </p>

            {cartLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-16 flex-shrink-0" style={{ background: "#2a2a2d" }} />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-3/4" style={{ background: "#2a2a2d" }} />
                      <div className="h-2 w-1/2" style={{ background: "#2a2a2d" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,168,76,0.2) transparent" }}>
                {cart.map((item) => {
                  const d = disc(item.price, item.sell_price);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0 w-12 h-16" style={{ background: "#2a2a2d" }}>
                        {item.main_image && (
                          <img src={`${API_URL}${item.main_image}`} alt={item.title}
                            className="w-full h-full object-cover" style={{ filter: "brightness(0.9)" }} />
                        )}
                        {item.quantity > 1 && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[8px]"
                            style={{ background: "#c9a84c", color: "#0a0a0b", fontFamily: "'Jost', sans-serif" }}>
                            {item.quantity}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] leading-[1.3] truncate"
                          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
                          {item.title}
                        </p>
                        <p className="text-[9px] tracking-[1px] mt-0.5 capitalize"
                          style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                          {item.format}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
                            {fmt(item.sell_price * item.quantity)}
                          </span>
                          {d > 0 && (
                            <span className="text-[10px] line-through" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                              {fmt(item.price * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coupon */}
          <div className="p-5" style={{ background: "#1c1c1e" }}>
            <label className="co-label">Promo Code</label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                placeholder="ENTER CODE"
                disabled={couponApplied}
                className={`co-input flex-1 ${couponError ? "error" : ""}`}
                style={{ letterSpacing: "2px" }}
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
              />
              {couponApplied ? (
                <button
                  className="h-[43px] px-3 text-[9px] tracking-[1px] uppercase transition-colors duration-200"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a", background: "rgba(139,58,58,0.1)", border: "1px solid rgba(139,58,58,0.2)" }}
                  onClick={() => { setCoupon(""); setCouponApplied(false); setCouponDiscount(0); setCouponError(""); }}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="h-[43px] px-4 text-[9px] tracking-[2px] uppercase flex items-center gap-2 transition-colors duration-200"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#c9a84c"; e.currentTarget.style.color = "#0a0a0b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.color = "#c9a84c"; }}
                  onClick={applyCoupon}
                  disabled={couponChecking}
                >
                  {couponChecking ? <span className="co-spin" style={{ borderColor: "rgba(201,168,76,0.3)", borderTopColor: "#c9a84c" }} /> : "Apply"}
                </button>
              )}
            </div>
            {couponError && <p className="text-[10px] mt-2" style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a" }}>{couponError}</p>}
            {couponApplied && (
              <p className="text-[10px] mt-2" style={{ fontFamily: "'Jost', sans-serif", color: "#4a9a5a" }}>
                ✓ Coupon applied — you save {fmt(couponDiscount)}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="p-6" style={{ background: "#1c1c1e" }}>
            <div className="flex flex-col gap-[10px] mb-5">
              <SummaryRow label="Subtotal" value={fmt(subtotal)} />
              {savings > 0 && <SummaryRow label="Item Savings" value={`−${fmt(savings)}`} green />}
              {couponDiscount > 0 && <SummaryRow label="Coupon Discount" value={`−${fmt(couponDiscount)}`} green />}
              <SummaryRow label={shipping === 0 ? "Shipping — Free" : "Shipping"} value={shipping === 0 ? "Free" : fmt(shipping)} />
            </div>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.1)" }} />
              <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.25)" }} />
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.1)" }} />
            </div>

            <div className="flex items-baseline justify-between mb-5">
              <span className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>
                Total
              </span>
              <span className="text-[26px] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                {fmt(total)}
              </span>
            </div>

            <p className="text-[10px] text-center" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
              Taxes included · GST compliant
            </p>
          </div>

          {/* Back to cart */}
          <button
            className="py-3 text-[9px] tracking-[2px] uppercase transition-colors duration-200"
            style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70", background: "transparent", border: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b70")}
            onClick={() => (window.location.href = "/cart")}
          >
            ← Edit Cart
          </button>
        </div>

      </div>

      <Ornament />
    </PageWrap>
  );
}

/* ═══════════════════ SUB-COMPONENTS ═══════════════════ */

function StepBar({ current, onContact }: { current: Step; onContact: () => void }) {
  const steps: { id: Step; label: string }[] = [
    { id: "contact",  label: "Contact"  },
    { id: "shipping", label: "Shipping" },
    { id: "payment",  label: "Payment"  },
  ];
  const order: Step[] = ["contact", "shipping", "payment"];
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex items-center gap-0 mb-2">
      {steps.map((s, i) => {
        const done    = order.indexOf(s.id) < currentIdx;
        const active  = s.id === current;
        const canClick = s.id === "contact" && current !== "contact";

        return (
          <div key={s.id} className="flex items-center flex-1">
            <button
              disabled={!canClick && !done}
              onClick={canClick ? onContact : undefined}
              className="flex items-center gap-2 group"
              style={{ cursor: (canClick || done) ? "pointer" : "default" }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center text-[10px] transition-all duration-300 flex-shrink-0"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: done ? "#c9a84c" : active ? "rgba(201,168,76,0.12)" : "transparent",
                  border: `1px solid ${done ? "#c9a84c" : active ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)"}`,
                  color: done ? "#0a0a0b" : active ? "#c9a84c" : "#6b6b70",
                }}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (i + 1)}
              </div>
              <span
                className="text-[9px] tracking-[2px] uppercase hidden sm:block"
                style={{ fontFamily: "'Jost', sans-serif", color: active ? "#c9a84c" : done ? "#f5f0e8" : "#6b6b70" }}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-3"
                style={{ background: done ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.06)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormSection({
  title, step, active, done, children, onEdit,
}: {
  title: string; step: string; active: boolean; done?: boolean;
  children: React.ReactNode; onEdit?: () => void;
}) {
  return (
    <div
      className="p-6 transition-colors duration-300"
      style={{
        background: active ? "#1c1c1e" : "#161617",
        border: `1px solid ${active ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)"}`,
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[3px]"
            style={{ fontFamily: "'Jost', sans-serif", color: active ? "#c9a84c" : done ? "#c9a84c" : "#3a3a3e" }}>
            {step}
          </span>
          <h2 className="text-[16px] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: active ? "#f5f0e8" : done ? "#f5f0e8" : "#6b6b70" }}>
            {title}
          </h2>
          {done && !active && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
        {onEdit && done && !active && (
          <button
            className="text-[9px] tracking-[2px] uppercase transition-colors duration-200"
            style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b70")}
            onClick={onEdit}
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, error, type = "text", placeholder, maxLength, textarea,
}: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string; type?: string; placeholder?: string; maxLength?: number; textarea?: boolean;
}) {
  return (
    <div>
      <label className="co-label">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={2}
          className={`co-input resize-none ${error ? "error" : ""}`}
          style={{ resize: "none" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`co-input ${error ? "error" : ""}`}
        />
      )}
      {error && <ErrMsg>{error}</ErrMsg>}
    </div>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a" }}>
      {children}
    </p>
  );
}

function SummaryRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] tracking-[1px]" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>{label}</span>
      <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: green ? "#4a9a5a" : "#f5f0e8" }}>{value}</span>
    </div>
  );
}

function GoldBtn({
  children, onClick, loading, disabled,
}: {
  children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean;
}) {
  return (
    <button
      className="px-8 py-[13px] text-[10px] tracking-[3px] uppercase font-medium flex items-center justify-center gap-2 transition-colors duration-300"
      style={{
        fontFamily: "'Jost', sans-serif",
        background: disabled ? "rgba(201,168,76,0.4)" : "#c9a84c",
        color: "#0a0a0b",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: 160,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "#f5f0e8"; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = "#c9a84c"; }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {loading && <span className="co-spin" />}
      {children}
    </button>
  );
}

function SuccessScreen({ orderId, total }: { orderId: string; total: number }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center max-w-lg mx-auto co-fade">
      <style>{`
        @keyframes successPulse {
          0%  { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100%{ transform: scale(1);   opacity: 1; }
        }
        .success-icon { animation: successPulse 0.6s ease both; }
        @keyframes checkDraw { from { stroke-dashoffset: 80; } to { stroke-dashoffset: 0; } }
        .check-path { stroke-dasharray: 80; animation: checkDraw 0.5s ease 0.4s both; }
      `}</style>

      {/* Animated checkmark */}
      <div className="success-icon relative w-20 h-20 flex items-center justify-center"
        style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.05)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2">
          <polyline className="check-path" points="20 6 9 17 4 12"/>
        </svg>
        {/* Corner ornaments */}
        {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((c) => (
          <div key={c} className={`absolute ${c} w-2 h-2`}
            style={{ border: "1px solid rgba(201,168,76,0.4)", background: "#0a0a0b" }} />
        ))}
      </div>

      <div>
        <p className="text-[10px] tracking-[5px] uppercase mb-2" style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
          Order Confirmed
        </p>
        <h2 className="text-[40px] font-light italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
          Thank You
        </h2>
      </div>

      <p className="text-[13px] leading-[1.8]" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
        Your order has been placed successfully. A confirmation has been sent to your email.
      </p>

      <div className="w-full p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(201,168,76,0.1)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
            Order ID
          </span>
          <span className="text-[13px] font-medium" style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
            #{orderId}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
            Amount Paid
          </span>
          <span className="text-[18px] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
            {fmt(total)}
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <GoldBtn onClick={() => (window.location.href = "/orders")}>Track Order</GoldBtn>
        <button
          className="px-8 py-[13px] text-[10px] tracking-[3px] uppercase transition-colors duration-200"
          style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70", background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#c9a84c"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b70"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          onClick={() => (window.location.href = "/")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-[130px] pb-20 px-12 max-md:px-6 max-sm:px-4"
      style={{ color: "#e8e0d0", fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500&display=swap');
      `}</style>
      <div className="max-w-[1100px] mx-auto">{children}</div>
    </div>
  );
}

function Ornament() {
  return (
    <div className="flex items-center gap-3 mt-16">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }} />
      <div className="w-[5px] h-[5px] rotate-45 flex-shrink-0" style={{ background: "rgba(201,168,76,0.25)" }} />
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)" }} />
    </div>
  );
}