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

/* ── Inline Components ── */
function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[26px] italic text-[#f5f0e8] mb-1.5 m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {title}
      </h2>
      <p className="text-[11px] text-zinc-500 tracking-[0.5px] m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
        {sub}
      </p>
      <div className="mt-3.5 h-px" style={{ background: "linear-gradient(to right, rgba(201,168,76,0.25), transparent)" }} />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-[7px] text-[9px] tracking-[2.5px] uppercase text-zinc-500" style={{ fontFamily: "'Jost', sans-serif" }}>
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

/* ── Page ── */
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/api/account/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u: User) => { setUser(u); setEditName(u.name ?? ""); setEditPhone(u.phone ?? ""); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMsg(null);
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API_URL}/api/account/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.msg);
      setUser((prev) => prev ? { ...prev, name: editName, phone: editPhone } : prev);
      setMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (e: any) {
      setMsg({ type: "err", text: e.message ?? "Failed to update." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border border-[rgba(201,168,76,0.3)] border-t-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="panel-fade p-9 md:p-10">
      <SectionHead title="Personal Information" sub="Update your name and phone number" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-9">
        {[
          { label: "Member Since", value: new Date().getFullYear().toString() },
          { label: "Account Type", value: user.provider === "google" ? "Google" : "Email" },
          { label: "Role", value: "Customer" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1c1c1e] border border-[rgba(201,168,76,0.1)] p-5 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-10 h-px bg-[#8a6f2e]" />
            <p className="text-[9px] tracking-[2.5px] uppercase text-zinc-500 mb-2 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>{s.label}</p>
            <p className="text-[22px] italic text-[#f5f0e8] m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px my-7" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)" }} />

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      <div className="mt-7 flex items-center gap-4">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="text-[10px] tracking-[2.5px] uppercase px-7 py-3 bg-[#c9a84c] text-[#0a0a0b] border-none cursor-pointer transition-colors hover:bg-[#f5f0e8] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {msg && (
          <p className={`text-[11px] tracking-[0.5px] m-0 ${msg.type === "ok" ? "text-green-400" : "text-red-400"}`} style={{ fontFamily: "'Jost', sans-serif" }}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}