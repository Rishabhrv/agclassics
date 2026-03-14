"use client";

import { useEffect, useState } from "react";

const API_URL      = process.env.NEXT_PUBLIC_API_URL;
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
  ebook_price: number | null;
  ebook_sell_price: number | null;
  stock: number;
  product_type: "physical" | "ebook" | "both";
}

interface Address {
  first_name: string; last_name: string;
  address: string;    city: string;
  state: string;      pincode: string;
  phone: string;      email: string;
  country: string;
}

const EMPTY: Address = {
  first_name: "", last_name: "", address: "", city: "",
  state: "", pincode: "", phone: "", email: "", country: "India",
};

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function itemPrice(item: CartItem): { display: number; original: number } {
  const price  = Number(item.price);
  const sell   = Number(item.sell_price);
  const ePr    = item.ebook_price      !== null ? Number(item.ebook_price)      : null;
  const eSell  = item.ebook_sell_price !== null ? Number(item.ebook_sell_price) : null;
  if (item.format === "ebook") return { display: eSell ?? sell, original: ePr ?? price };
  return { display: sell, original: price };
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function CheckoutPage() {
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [addr, setAddr]               = useState<Address>(EMPTY);
  const [errors, setErrors]           = useState<Partial<Address>>({});

  const [shipping, setShipping]               = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [saveAddress, setSaveAddress]         = useState(false);

  const [coupon, setCoupon]                 = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError]       = useState("");
  const [couponApplied, setCouponApplied]   = useState(false);
  const [couponChecking, setCouponChecking] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderSuccess, setOrderSuccess]     = useState<{ orderId: string; total: number } | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSaved, setSelectedSaved]   = useState<number | null>(null);

  const token   = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  /* ── Derived flags ── */
  const hasPaperback = cart.some(i => i.format === "paperback");
  const hasEbook     = cart.some(i => i.format === "ebook");
  const ebookOnly    = hasEbook && !hasPaperback;

  /* ── Fetch cart ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/api/ag-classics/cart`, { headers });
        const data = await res.json();
        if (data.success) setCart(data.cart);
      } finally { setCartLoading(false); }
    })();
  }, []);

  /* ── Prefill from /me ── */
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/ag-classics/checkout/me`, { headers })
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;
        const first = data.name?.split(" ")[0] || "";
        const last  = data.name?.split(" ").slice(1).join(" ") || "";
        setAddr(prev => ({
          ...prev,
          first_name: first        || prev.first_name,
          last_name:  last         || prev.last_name,
          email:      data.email   || prev.email,
          phone:      data.phone   || prev.phone,
          address:    data.address || prev.address,
          city:       data.city    || prev.city,
          state:      data.state   || prev.state,
          pincode:    data.pincode || prev.pincode,
          country:    data.country || prev.country,
        }));
      })
      .catch(() => {});
  }, [token]);

  /* ── Saved addresses ── */
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/user/addresses`, { headers })
      .then(r => r.json())
      .then(d => { if (d.success) setSavedAddresses(d.addresses || []); })
      .catch(() => {});
  }, [token]);

  /* ── Dynamic shipping cost on state change (paperback only) ── */
  useEffect(() => {
    if (!hasPaperback || !addr.state) { setShipping(0); return; }
    setShippingLoading(true);
    fetch(`${API_URL}/api/ag-classics/checkout/shipping-cost`, {
      method: "POST", headers,
      body: JSON.stringify({ state: addr.state }),
    })
      .then(r => r.json())
      .then(data => { if (data.success) setShipping(data.shipping || 0); })
      .catch(() => setShipping(0))
      .finally(() => setShippingLoading(false));
  }, [addr.state, hasPaperback]);

  /* ── Totals ── */
  const subtotal = cart.reduce((s, i) => s + itemPrice(i).display * i.quantity, 0);
  const savings  = cart.reduce((s, i) => {
    const { display, original } = itemPrice(i);
    return s + (original - display) * i.quantity;
  }, 0);
  const total = subtotal + shipping - couponDiscount;

  /* ── Field setter ── */
  const set = (k: keyof Address) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setAddr(p => ({ ...p, [k]: e.target.value }));
      setErrors(p => ({ ...p, [k]: "" }));
    };

  /* ── Validation ──
     For ebook-only: only email required.
     For paperback: full address required.                         ── */
  const validate = (): boolean => {
    const e: Partial<Address> = {};

    // Email always required
    if (!addr.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";

    // Address fields only needed for paperback orders
    if (hasPaperback) {
      if (!addr.first_name.trim()) e.first_name = "Required";
      if (!addr.last_name.trim())  e.last_name  = "Required";
      if (!addr.phone.match(/^\d{10}$/)) e.phone = "10-digit number required";
      if (!addr.address.trim()) e.address = "Required";
      if (!addr.city.trim())    e.city    = "Required";
      if (!addr.state.trim())   e.state   = "Required";
      if (!addr.pincode.match(/^\d{6}$/)) e.pincode = "6-digit PIN required";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      document.getElementById(`field-${Object.keys(e)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  };

  /* ── Coupon ── */
  const applyCoupon = async () => {
    if (!coupon.trim()) return setCouponError("Enter a coupon code");
    setCouponChecking(true); setCouponError("");
    try {
      const res  = await fetch(`${API_URL}/api/ag-classics/checkout/coupon-check`, {
        method: "POST", headers,
        body: JSON.stringify({ code: coupon, cart_total: subtotal }),
      });
      const data = await res.json();
      if (data.success) { setCouponDiscount(data.discount); setCouponApplied(true); }
      else setCouponError(data.message || "Invalid coupon");
    } catch { setCouponError("Could not apply coupon"); }
    finally { setCouponChecking(false); }
  };

  /* ── Razorpay loader ── */
  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  /* ── handlePayment ── */
  const handlePayment = async () => {
    if (!validate()) return;
    setPaymentLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay failed to load");

      // Save address only for paperback orders
      if (saveAddress && hasPaperback) {
        await fetch(`${API_URL}/api/ag-classics/checkout/save-address`, {
          method: "POST", headers,
          body: JSON.stringify({
            address: addr.address, city: addr.city,
            state: addr.state,     pincode: addr.pincode,
            country: addr.country,
          }),
        }).catch(() => {});
      }

      const orderRes  = await fetch(`${API_URL}/api/ag-classics/checkout/create-order`, {
        method: "POST", headers,
        body: JSON.stringify({
          address:     addr,
          coupon_code: couponApplied ? coupon : null,
          shipping,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || "Order creation failed");

      const rzp = new (window as any).Razorpay({
        key:         RAZORPAY_KEY,
        amount:      orderData.razorpay_amount,
        currency:    "INR",
        name:        "AG Classics",
        description: `Order #${orderData.order_id}`,
        order_id:    orderData.razorpay_order_id,
        prefill:     { name: `${addr.first_name} ${addr.last_name}`.trim(), email: addr.email, contact: addr.phone },
        theme:       { color: "#c9a84c" },
        modal:       { backdropclose: false, ondismiss: () => setPaymentLoading(false) },
        handler: async (response: any) => {
          const verifyRes  = await fetch(`${API_URL}/api/ag-classics/checkout/verify`, {
            method: "POST", headers,
            body: JSON.stringify({
              order_id:            orderData.order_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) setOrderSuccess({ orderId: orderData.order_id, total });
          else alert("Payment verification failed. Contact support.");
        },
      });
      rzp.on("payment.failed", (resp: any) => {
        alert(`Payment failed: ${resp.error.description}`);
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
      setPaymentLoading(false);
    }
  };

  /* ═══════ SUCCESS ═══════ */
  if (orderSuccess) return (
    <PageWrap>
      <SuccessScreen orderId={orderSuccess.orderId} total={orderSuccess.total} hasEbook={hasEbook} />
    </PageWrap>
  );

  /* ═══════ EMPTY CART ═══════ */
  if (!cartLoading && cart.length === 0) return (
    <PageWrap>
      <div className="flex flex-col items-center gap-6 py-32 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1" className="opacity-40">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2 className="text-[32px] font-light italic"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>
          Your cart is empty
        </h2>
        <GoldBtn onClick={() => (window.location.href = "/")}>Browse Collection</GoldBtn>
      </div>
    </PageWrap>
  );

  /* ═══════ MAIN ═══════ */
  return (
    <PageWrap>
      <style>{`
        @keyframes co-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .co-fade { animation: co-fadeUp 0.4s ease both; }
        .co-input {
          width:100%; background:transparent;
          border:1px solid rgba(255,255,255,0.07); color:#f5f0e8;
          font-family:'Jost',sans-serif; font-size:13px;
          padding:11px 14px; outline:none;
          transition:border-color 0.2s; -webkit-appearance:none;
        }
        .co-input::placeholder { color:#3a3a3e; }
        .co-input:focus        { border-color:rgba(201,168,76,0.5); }
        .co-input.err          { border-color:rgba(139,58,58,0.7); }
        .co-input:disabled     { opacity:0.4; cursor:not-allowed; }
        select.co-input option { background:#1c1c1e; color:#f5f0e8; }
        .co-label {
          display:block; font-family:'Jost',sans-serif;
          font-size:9px; letter-spacing:2px; text-transform:uppercase;
          color:#6b6b70; margin-bottom:6px;
        }
        @keyframes spin { to{transform:rotate(360deg)} }
        .co-spin {
          display:inline-block; width:14px; height:14px;
          border:1.5px solid rgba(10,10,11,0.3); border-top-color:#0a0a0b;
          border-radius:50%; animation:spin 0.6s linear infinite; flex-shrink:0;
        }
        .razorpay-backdrop,div[class*="razorpay-backdrop"],div[id*="razorpay-backdrop"]{display:none!important}
        .razorpay-container{z-index:2147483647!important;position:fixed!important}
        body.razorpay-payment-open{overflow:hidden!important}
      `}</style>

      {/* Page heading */}
      <div className="mb-10 co-fade">
        <span className="block mb-2 text-[10px] tracking-[5px] uppercase"
          style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
          Secure Checkout
        </span>
        <h1 className="font-light italic leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,54px)", color: "#f5f0e8" }}>
          Complete Your Order
        </h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-16 h-px" style={{ background: "rgba(201,168,76,0.3)" }} />
          <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.3)" }} />
          <div className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, rgba(201,168,76,0.15), transparent)" }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0.5 items-start">

        {/* ══════ LEFT ══════ */}
        <div className="flex flex-col gap-0.5">

          {/* ─────────────────────────────────────────────────────
              EBOOK-ONLY: show a minimal email-only form
              + instant delivery notice instead of full address form
          ───────────────────────────────────────────────────────── */}
          {ebookOnly ? (
            <Section title="Your Details" step="01">
              {/* eBook instant delivery notice */}
              <div className="flex items-start gap-3 p-4 mb-6"
                style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <span className="text-lg flex-shrink-0 mt-0.5">📖</span>
                <div>
                  <p className="text-[12px] font-medium mb-1"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c", letterSpacing: "1px" }}>
                    Instant eBook Delivery
                  </p>
                  <p className="text-[12px] leading-[1.8]"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                    Your eBook{cart.filter(i => i.format === "ebook").length > 1 ? "s" : ""} will be
                    available <strong style={{ color: "#f5f0e8" }}>instantly</strong> in your{" "}
                    <strong style={{ color: "#c9a84c" }}>My Books</strong> section right after payment.
                    No shipping required.
                  </p>
                </div>
              </div>

              {/* Only email needed for ebook-only orders */}
              <Field
                id="field-email"
                label="Email Address"
                value={addr.email}
                onChange={set("email")}
                error={errors.email}
                type="email"
                placeholder="Confirmation will be sent here"
              />
            </Section>

          ) : (
            /* ─────────────────────────────────────────────────────
               MIXED or PAPERBACK: show full contact + shipping form
            ───────────────────────────────────────────────────────── */
            <>
              {/* ── If mixed (ebook + paperback), show eBook notice at top ── */}
              {hasEbook && hasPaperback && (
                <div className="flex items-start gap-3 p-4"
                  style={{
                    background: "rgba(201,168,76,0.03)",
                    border: "1px solid rgba(201,168,76,0.15)",
                  }}>
                  <span className="text-base flex-shrink-0 mt-0.5">📖</span>
                  <p className="text-[11px] leading-[1.8]"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                    Your <strong style={{ color: "#c9a84c" }}>eBook{cart.filter(i => i.format === "ebook").length > 1 ? "s" : ""}</strong> will
                    appear instantly in <strong style={{ color: "#f5f0e8" }}>My Books</strong> after
                    payment. Paperback will be shipped to the address below.
                  </p>
                </div>
              )}

              {/* Contact */}
              <Section title="Contact Information" step="01">
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
                          onClick={() => { setSelectedSaved(i); setAddr(p => ({ ...p, ...a })); }}
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
                    <Divider label="or enter new" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-0.5 mb-0.5">
                  <Field id="field-first_name" label="First Name" value={addr.first_name} onChange={set("first_name")} error={errors.first_name} />
                  <Field id="field-last_name"  label="Last Name"  value={addr.last_name}  onChange={set("last_name")}  error={errors.last_name} />
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  <Field id="field-email" label="Email Address" value={addr.email} onChange={set("email")} error={errors.email} type="email" />
                  <Field id="field-phone" label="Phone Number"  value={addr.phone} onChange={set("phone")} error={errors.phone} type="tel" placeholder="10-digit mobile" />
                </div>
              </Section>

              {/* Shipping Address */}
              <Section title="Shipping Address" step="02">
                <div className="mb-0.5">
                  <Field
                    id="field-address" label="Street Address" value={addr.address}
                    onChange={set("address")} error={errors.address}
                    placeholder="House no., Building, Street" textarea
                  />
                </div>
                <div className="grid grid-cols-2 gap-0.5 mb-0.5">
                  <Field id="field-city" label="City" value={addr.city} onChange={set("city")} error={errors.city} />
                  <div id="field-state">
                    <label className="co-label">State</label>
                    <select value={addr.state} onChange={set("state")}
                      className={`co-input ${errors.state ? "err" : ""}`}>
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <ErrMsg>{errors.state}</ErrMsg>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  <Field id="field-pincode" label="PIN Code" value={addr.pincode} onChange={set("pincode")}
                    error={errors.pincode} placeholder="6 digits" maxLength={6} />
                  <div>
                    <label className="co-label">Country</label>
                    <select value={addr.country} onChange={set("country")} className="co-input">
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>

                {/* Save address checkbox */}
                <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={e => setSaveAddress(e.target.checked)}
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ accentColor: "#c9a84c" }}
                  />
                  <span className="text-[10px] tracking-[1px]"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                    Save this address for future orders
                  </span>
                </label>

                {/* Shipping method */}
                <div className="mt-6">
                  <label className="co-label mb-3">Shipping Method</label>
                  <div className="flex items-center justify-between p-4"
                    style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 flex items-center justify-center"
                        style={{ border: "1px solid #c9a84c" }}>
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
                    <span className="text-[13px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: shipping === 0 ? "#4a9a5a" : "#f5f0e8" }}>
                      {shippingLoading
                        ? <span className="co-spin" style={{ borderColor: "rgba(201,168,76,0.3)", borderTopColor: "#c9a84c" }} />
                        : shipping === 0 ? "Free" : fmt(shipping)
                      }
                    </span>
                  </div>
                  {!addr.state && (
                    <p className="text-[10px] mt-2"
                      style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                      Select a state to see shipping cost
                    </p>
                  )}
                </div>
              </Section>
            </>
          )}

          {/* Pay button */}
          <div className="p-6 flex items-center justify-between flex-wrap gap-4"
            style={{ background: "#1c1c1e" }}>
            <button
              className="text-[9px] tracking-[2px] uppercase transition-colors duration-200"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70", background: "none", border: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b6b70")}
              onClick={() => (window.location.href = "/cart")}
            >
              ← Edit Cart
            </button>
            <GoldBtn onClick={handlePayment} loading={paymentLoading} disabled={paymentLoading || shippingLoading}>
              {paymentLoading ? "Processing…" : `Pay ${fmt(total)}`}
            </GoldBtn>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-between p-5 flex-wrap gap-4"
            style={{ background: "#1c1c1e" }}>
            {(ebookOnly
              ? [{ icon: "🔒", text: "256-bit SSL" }, { icon: "💳", text: "Razorpay Secure" }, { icon: "📖", text: "Instant Access" }, { icon: "☁️", text: "Cloud Library" }]
              : [{ icon: "🔒", text: "256-bit SSL" }, { icon: "💳", text: "Razorpay Secure" }, { icon: "↩",  text: "Easy Returns"  }, { icon: "📦", text: "DTDC Shipping" }]
            ).map(b => (
              <div key={b.text} className="flex items-center gap-2">
                <span className="text-base">{b.icon}</span>
                <span className="text-[9px] tracking-[2px] uppercase"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════ RIGHT: Order summary ══════ */}
        <div className="flex flex-col gap-0.5 lg:sticky lg:top-6">

          {/* Cart items */}
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
                {cart.map(item => {
                  const { display, original } = itemPrice(item);
                  const d = original > display ? Math.round(((original - display) / original) * 100) : 0;
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
                        <span className="inline-block text-[8px] tracking-[1.5px] uppercase mt-0.5 px-[6px] py-[2px]"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            color:      item.format === "ebook" ? "#c9a84c" : "#6b6b70",
                            background: item.format === "ebook" ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)",
                            border:     `1px solid ${item.format === "ebook" ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)"}`,
                          }}>
                          {item.format === "ebook" ? "E-Book" : "Paperback"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>
                            {fmt(display * item.quantity)}
                          </span>
                          {d > 0 && (
                            <span className="text-[10px] line-through"
                              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                              {fmt(original * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── eBook delivery note inside summary (always shown if any ebook) ── */}
            {hasEbook && (
              <div className="mt-4 pt-4 flex items-start gap-2"
                style={{ borderTop: "1px solid rgba(201,168,76,0.08)" }}>
                <span className="text-[11px] flex-shrink-0 mt-0.5">📖</span>
                <p className="text-[10px] leading-[1.7]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
                  eBook{cart.filter(i => i.format === "ebook").length > 1 ? "s" : ""} available
                  instantly in <strong style={{ color: "#c9a84c" }}>My Books</strong> after payment.
                </p>
              </div>
            )}
          </div>

          {/* Coupon */}
          <div className="p-5" style={{ background: "#1c1c1e" }}>
            <label className="co-label">Promo Code</label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                placeholder="ENTER CODE"
                disabled={couponApplied}
                className={`co-input flex-1 ${couponError ? "err" : ""}`}
                style={{ letterSpacing: "2px" }}
                onKeyDown={e => e.key === "Enter" && applyCoupon()}
              />
              {couponApplied ? (
                <button
                  className="h-[43px] px-3 text-[9px] tracking-[1px] uppercase transition-colors duration-200"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a",
                           background: "rgba(139,58,58,0.1)", border: "1px solid rgba(139,58,58,0.2)" }}
                  onClick={() => { setCoupon(""); setCouponApplied(false); setCouponDiscount(0); setCouponError(""); }}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="h-[43px] px-4 text-[9px] tracking-[2px] uppercase flex items-center gap-2"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c",
                           background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#c9a84c"; e.currentTarget.style.color = "#0a0a0b"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.color = "#c9a84c"; }}
                  onClick={applyCoupon} disabled={couponChecking}
                >
                  {couponChecking
                    ? <span className="co-spin" style={{ borderColor: "rgba(201,168,76,0.3)", borderTopColor: "#c9a84c" }} />
                    : "Apply"}
                </button>
              )}
            </div>
            {couponError   && <p className="text-[10px] mt-2" style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a" }}>{couponError}</p>}
            {couponApplied && <p className="text-[10px] mt-2" style={{ fontFamily: "'Jost', sans-serif", color: "#4a9a5a" }}>✓ Coupon applied — you save {fmt(couponDiscount)}</p>}
          </div>

          {/* Totals */}
          <div className="p-6" style={{ background: "#1c1c1e" }}>
            <div className="flex flex-col gap-[10px] mb-5">
              <SummaryRow label="Subtotal" value={fmt(subtotal)} />
              {savings > 0        && <SummaryRow label="Item Savings"    value={`−${fmt(savings)}`}        green />}
              {couponDiscount > 0 && <SummaryRow label="Coupon Discount" value={`−${fmt(couponDiscount)}`} green />}
              {/* Only show shipping row if there are paperback items */}
              {hasPaperback && (
                <SummaryRow
                  label={shipping === 0 && !shippingLoading ? "Shipping — Free" : "Shipping"}
                  value={shippingLoading ? "…" : shipping === 0 ? "Free" : fmt(shipping)}
                />
              )}
            </div>
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.1)" }} />
              <div className="w-[4px] h-[4px] rotate-45" style={{ background: "rgba(201,168,76,0.25)" }} />
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.1)" }} />
            </div>
            <div className="flex items-baseline justify-between mb-5">
              <span className="text-[11px] tracking-[3px] uppercase"
                style={{ fontFamily: "'Jost', sans-serif", color: "#f5f0e8" }}>Total</span>
              <span className="text-[26px] font-light"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                {fmt(total)}
              </span>
            </div>
            <p className="text-[10px] text-center"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
              Taxes included · GST compliant
            </p>
          </div>

        </div>
      </div>

      <Ornament />
    </PageWrap>
  );
}

/* ═══════════════════ SUB-COMPONENTS ═══════════════════ */

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <div className="p-6" style={{ background: "#1c1c1e", border: "1px solid rgba(201,168,76,0.08)" }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] tracking-[3px]"
          style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>{step}</span>
        <h2 className="text-[16px] font-light"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>{title}</h2>
        <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.1)" }} />
      </div>
      {children}
    </div>
  );
}

function Field({ id, label, value, onChange, error, type = "text", placeholder, maxLength, textarea }: {
  id?: string; label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string; type?: string; placeholder?: string; maxLength?: number; textarea?: boolean;
}) {
  return (
    <div id={id}>
      <label className="co-label">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={2}
          className={`co-input resize-none ${error ? "err" : ""}`} style={{ resize: "none" }} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          maxLength={maxLength} className={`co-input ${error ? "err" : ""}`} />
      )}
      {error && <ErrMsg>{error}</ErrMsg>}
    </div>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: "#8b3a3a" }}>{children}</p>;
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
      <span className="text-[9px] tracking-[2px] uppercase"
        style={{ fontFamily: "'Jost', sans-serif", color: "#3a3a3e" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}

function SummaryRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] tracking-[1px]"
        style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>{label}</span>
      <span className="text-[13px]"
        style={{ fontFamily: "'Jost', sans-serif", color: green ? "#4a9a5a" : "#f5f0e8" }}>{value}</span>
    </div>
  );
}

function GoldBtn({ children, onClick, loading, disabled }: {
  children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean;
}) {
  return (
    <button
      className="px-8 py-[13px] text-[10px] tracking-[3px] uppercase font-medium flex items-center justify-center gap-2 transition-colors duration-300"
      style={{
        fontFamily: "'Jost', sans-serif",
        background: disabled ? "rgba(201,168,76,0.4)" : "#c9a84c",
        color: "#0a0a0b", border: "none",
        cursor: disabled ? "not-allowed" : "pointer", minWidth: 160,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = "#f5f0e8"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = "#c9a84c"; }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {loading && <span className="co-spin" />}
      {children}
    </button>
  );
}

function SuccessScreen({ orderId, total, hasEbook }: { orderId: string; total: number; hasEbook: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center max-w-lg mx-auto co-fade">
      <style>{`
        @keyframes successPulse { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }
        .success-icon { animation: successPulse 0.6s ease both; }
        @keyframes checkDraw { from{stroke-dashoffset:80} to{stroke-dashoffset:0} }
        .check-path { stroke-dasharray:80; animation:checkDraw 0.5s ease 0.4s both; }
      `}</style>

      <div className="success-icon relative w-20 h-20 flex items-center justify-center"
        style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.05)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2">
          <polyline className="check-path" points="20 6 9 17 4 12"/>
        </svg>
        {["-top-1 -left-1","-top-1 -right-1","-bottom-1 -left-1","-bottom-1 -right-1"].map(c => (
          <div key={c} className={`absolute ${c} w-2 h-2`}
            style={{ border: "1px solid rgba(201,168,76,0.4)", background: "#0a0a0b" }} />
        ))}
      </div>

      <div>
        <p className="text-[10px] tracking-[5px] uppercase mb-2"
          style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>Order Confirmed</p>
        <h2 className="text-[40px] font-light italic"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>Thank You</h2>
      </div>

      <p className="text-[13px] leading-[1.8]"
        style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
        Your order has been placed successfully.
        A confirmation has been sent to your email.
      </p>

      {/* eBook instant access notice on success screen */}
      {hasEbook && (
        <div className="w-full flex items-start gap-3 p-4"
          style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
          <span className="text-xl flex-shrink-0">📖</span>
          <div className="text-left">
            <p className="text-[11px] font-medium mb-1"
              style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c", letterSpacing: "1px" }}>
              Your eBook is Ready
            </p>
            <p className="text-[11px] leading-[1.8]"
              style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>
              Head to <strong style={{ color: "#f5f0e8" }}>My Books</strong> to access your
              eBook{/* plural handled by parent */} instantly — no waiting required.
            </p>
          </div>
        </div>
      )}

      <div className="w-full p-5"
        style={{ background: "#1c1c1e", border: "1px solid rgba(201,168,76,0.1)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[2px] uppercase"
            style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>Order ID</span>
          <span className="text-[13px] font-medium"
            style={{ fontFamily: "'Jost', sans-serif", color: "#c9a84c" }}>#{orderId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[2px] uppercase"
            style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70" }}>Amount Paid</span>
          <span className="text-[18px] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f5f0e8" }}>{fmt(total)}</span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {hasEbook && (
          <GoldBtn onClick={() => (window.location.href = "/my-books")}>Go to My Books</GoldBtn>
        )}
        <GoldBtn onClick={() => (window.location.href = "/orders")}>
          {hasEbook ? "Track Order" : "Track Order"}
        </GoldBtn>
        <button
          className="px-8 py-[13px] text-[10px] tracking-[3px] uppercase transition-colors duration-200"
          style={{ fontFamily: "'Jost', sans-serif", color: "#6b6b70", background: "transparent",
                   border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#c9a84c"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#6b6b70"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          onClick={() => (window.location.href = "/")}
        >Continue Shopping</button>
      </div>
    </div>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-[130px] pb-20 px-12 max-md:px-6 max-sm:px-4"
      style={{ color: "#e8e0d0", fontFamily: "'Jost', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500&display=swap');`}</style>
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