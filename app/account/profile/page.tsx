"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ── Types ── */
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  provider?: string;
}

interface Address {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

/* ── Shared UI ── */
function SectionHead({ title, sub, icon }: { title: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[#8a6f2e]">{icon}</span>
        <h2 className="text-[22px] md:text-[26px] italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {title}
        </h2>
      </div>
      <p className="text-[11px] text-white tracking-[0.5px] m-0 pl-7" style={{ fontFamily: "'Jost', sans-serif" }}>
        {sub}
      </p>
      <div className="mt-3.5 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.25), transparent)" }} />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-[7px] text-[9px] tracking-[2.5px] uppercase text-white" style={{ fontFamily: "'Jost', sans-serif" }}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-[11px] bg-white/[0.03] border border-[rgba(201,168,76,0.15)] outline-none text-[13px] text-[#e8e0d0] tracking-[0.3px] transition-colors focus:border-[rgba(201,168,76,0.5)] placeholder:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed ${props.className ?? ""}`}
      style={{ fontFamily: "'Jost', sans-serif", ...props.style }}
    />
  );
}

function StatusMsg({ msg }: { msg: { type: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <p
      className={`text-[11px] tracking-[0.5px] m-0 ${msg.type === "ok" ? "text-green-400" : "text-red-400"}`}
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {msg.type === "ok" ? "✓ " : "✕ "}{msg.text}
    </p>
  );
}

function SaveButton({ saving, label = "Save Changes" }: { saving: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="text-[10px] tracking-[2.5px] uppercase px-6 md:px-7 py-3 bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer transition-colors hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {saving ? "Saving…" : label}
    </button>
  );
}

function Divider() {
  return (
    <div className="h-px my-8 md:my-10" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)" }} />
  );
}

/* ══════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════ */
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* Personal Info */
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* Address */
  const [addr, setAddr] = useState<Address>({});
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrMsg, setAddrMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* Change Password */
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  /* Email change */
  const [emailStep, setEmailStep] = useState<"idle" | "otp">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    Promise.all([
      fetch(`${API_URL}/api/account/profile`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/api/account/address`,  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
    ])
      .then(([u, a]) => {
        if (u) { setUser(u); setEditName(u.name ?? ""); setEditPhone(u.phone ?? ""); }
        if (a) setAddr(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Handlers ── */
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true); setProfileMsg(null);
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API_URL}/api/account/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.msg);
      setUser(prev => prev ? { ...prev, name: editName, phone: editPhone } : prev);
      setProfileMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (e: any) {
      setProfileMsg({ type: "err", text: e.message ?? "Failed to update." });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true); setAddrMsg(null);
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API_URL}/api/account/address`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(addr),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.msg);
      setAddrMsg({ type: "ok", text: "Address saved successfully." });
    } catch (e: any) {
      setAddrMsg({ type: "err", text: e.message ?? "Failed to save address." });
    } finally {
      setSavingAddr(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!pwNew || pwNew.length < 6) return setPwMsg({ type: "err", text: "Password must be at least 6 characters." });
    if (pwNew !== pwConfirm)        return setPwMsg({ type: "err", text: "Passwords do not match." });
    setSavingPw(true);
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API_URL}/api/account/password`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwNew }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.msg);
      setPwMsg({ type: "ok", text: "Password updated successfully." });
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch (e: any) {
      setPwMsg({ type: "err", text: e.message ?? "Failed to update password." });
    } finally {
      setSavingPw(false);
    }
  };

  const sendOtp = async () => {
    setEmailMsg(null);
    if (!newEmail) return setEmailMsg({ type: "err", text: "Enter a new email address." });
    setSendingOtp(true);
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API_URL}/api/account/send-email-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.msg);
      setEmailStep("otp");
      setEmailMsg({ type: "ok", text: "Verification code sent! Check your inbox." });
    } catch (e: any) {
      setEmailMsg({ type: "err", text: e.message ?? "Failed to send OTP." });
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setEmailMsg(null);
    if (!otp) return setEmailMsg({ type: "err", text: "Enter the verification code." });
    setVerifyingOtp(true);
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API_URL}/api/account/email`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.msg);
      setUser(prev => prev ? { ...prev, email: d.email } : prev);
      setEmailMsg({ type: "ok", text: "Email updated successfully." });
      setEmailStep("idle"); setNewEmail(""); setOtp("");
    } catch (e: any) {
      setEmailMsg({ type: "err", text: e.message ?? "Failed to verify OTP." });
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* ── Loading / No User ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border border-[rgba(201,168,76,0.3)] border-t-[#c9a84c] animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const isGoogleUser = user.provider === "google";
  const eyeIcon = (show: boolean) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  return (
    <div className="panel-fade p-5 md:p-9 lg:p-10">

      {/* ══ 1. PERSONAL INFORMATION ══ */}
      <SectionHead
        title="Personal Information"
        sub="Update your name and contact number"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3 mb-7 md:mb-9">
        {[
          { label: "Member Since", value: new Date().getFullYear().toString() },
          { label: "Account Type", value: isGoogleUser ? "Google" : "Email" },
          { label: "Role", value: "Customer" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] p-4 md:p-5 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-10 h-px bg-[#8a6f2e]" />
            <p className="text-[8px] md:text-[9px] tracking-[2.5px] uppercase text-white mb-1.5 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{s.label}</p>
            <p className="text-[18px] md:text-[22px] italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={saveProfile}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div>
            <Label>Full Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91 00000 00000" />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input value={user.email} readOnly style={{ opacity: 0.5, cursor: "not-allowed" }} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 md:gap-4">
          <SaveButton saving={savingProfile} />
          <StatusMsg msg={profileMsg} />
        </div>
      </form>

      {/* Email Change (only for non-Google) */}
      {!isGoogleUser && (
        <div className="mt-7 p-4 md:p-5 border border-[rgba(201,168,76,0.1)] bg-[#1c1c1e]">
          <p className="text-[9px] tracking-[2.5px] uppercase text-[#8a6f2e] mb-4 m-0" style={{ fontFamily: "'Cinzel', serif" }}>
            Change Email Address
          </p>
          {emailStep === "idle" ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New email address"
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={sendingOtp}
                className="shrink-0 text-[10px] tracking-[2px] uppercase px-5 py-[11px] border border-[rgba(201,168,76,0.4)] text-[#c9a84c] bg-transparent cursor-pointer hover:bg-[rgba(201,168,76,0.06)] transition-colors disabled:opacity-50 whitespace-nowrap"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {sendingOtp ? "Sending…" : "Send Code"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit verification code"
                  maxLength={6}
                />
              </div>
              <button
                onClick={verifyOtp}
                disabled={verifyingOtp}
                className="shrink-0 text-[10px] tracking-[2px] uppercase px-5 py-[11px] bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer hover:bg-[#f5f0e8] transition-colors disabled:opacity-50 whitespace-nowrap"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {verifyingOtp ? "Verifying…" : "Verify & Update"}
              </button>
              <button
                onClick={() => { setEmailStep("idle"); setOtp(""); setEmailMsg(null); }}
                className="shrink-0 text-[10px] tracking-[2px] uppercase px-4 py-[11px] border border-[rgba(255,255,255,0.1)] text-white bg-transparent cursor-pointer hover:border-[rgba(201,168,76,0.3)] transition-colors whitespace-nowrap"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          )}
          {emailMsg && <div className="mt-3"><StatusMsg msg={emailMsg} /></div>}
        </div>
      )}

      <Divider />

      {/* ══ 2. ADDRESS ══ */}
      <SectionHead
        title="Shipping Address"
        sub="Used for physical book deliveries"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        }
      />

      <form onSubmit={saveAddress}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="md:col-span-2">
            <Label>Street Address</Label>
            <Input
              value={addr.address ?? ""}
              onChange={(e) => setAddr(p => ({ ...p, address: e.target.value }))}
              placeholder="House no., street, area"
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              value={addr.city ?? ""}
              onChange={(e) => setAddr(p => ({ ...p, city: e.target.value }))}
              placeholder="City"
            />
          </div>
          <div>
            <Label>State</Label>
            <Input
              value={addr.state ?? ""}
              onChange={(e) => setAddr(p => ({ ...p, state: e.target.value }))}
              placeholder="State"
            />
          </div>
          <div>
            <Label>PIN Code</Label>
            <Input
              value={addr.pincode ?? ""}
              onChange={(e) => setAddr(p => ({ ...p, pincode: e.target.value }))}
              placeholder="000000"
              maxLength={10}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={addr.country ?? "India"}
              onChange={(e) => setAddr(p => ({ ...p, country: e.target.value }))}
              placeholder="India"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 md:gap-4">
          <SaveButton saving={savingAddr} label="Save Address" />
          <StatusMsg msg={addrMsg} />
        </div>
      </form>

      <Divider />

      {/* ══ 3. CHANGE PASSWORD ══ */}
      <SectionHead
        title="Change Password"
        sub={isGoogleUser ? "Not available for Google accounts" : "Set a new secure password"}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        }
      />

      {isGoogleUser ? (
        <div className="flex items-center gap-3 p-4 border border-[rgba(201,168,76,0.1)] bg-[#1c1c1e]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a6f2e" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[11px] text-white tracking-[0.3px] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
            Your account uses Google Sign-In. Password changes are managed through Google.
          </p>
        </div>
      ) : (
        <form onSubmit={savePassword}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* New Password */}
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPw.new ? "text" : "password"}
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#c9a84c] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  {eyeIcon(showPw.new)}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showPw.confirm ? "text" : "password"}
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#c9a84c] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  {eyeIcon(showPw.confirm)}
                </button>
              </div>
            </div>
          </div>

          {/* Strength hint */}
          {pwNew && (
            <div className="mt-3 flex items-center gap-2">
              {[1,2,3,4].map(i => {
                const strength = pwNew.length >= 12 ? 4 : pwNew.length >= 8 ? 3 : pwNew.length >= 6 ? 2 : 1;
                const colors = ["bg-red-500","bg-orange-400","bg-yellow-400","bg-green-400"];
                return (
                  <div key={i} className={`h-[3px] flex-1 rounded-full transition-colors ${i <= strength ? colors[strength-1] : "bg-zinc-700"}`} />
                );
              })}
              <span className="text-[10px] text-zinc-500 ml-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                {pwNew.length >= 12 ? "Strong" : pwNew.length >= 8 ? "Good" : pwNew.length >= 6 ? "Weak" : "Too short"}
              </span>
            </div>
          )}

          {/* Match indicator */}
          {pwConfirm && (
            <p className={`mt-2 text-[10px] tracking-[0.3px] m-0 ${pwNew === pwConfirm ? "text-green-400" : "text-red-400"}`} style={{ fontFamily: "'Jost', sans-serif" }}>
              {pwNew === pwConfirm ? "✓ Passwords match" : "✕ Passwords do not match"}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 md:gap-4">
            <SaveButton saving={savingPw} label="Update Password" />
            <StatusMsg msg={pwMsg} />
          </div>
        </form>
      )}

      {/* Bottom spacing */}
      <div className="h-4 md:h-6" />
    </div>
  );
}