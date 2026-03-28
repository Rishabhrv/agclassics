"use client";

import { useState } from "react";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .auth-card { animation: fadeIn 0.55s ease both; }
        .spin-anim { animation: spin 0.8s linear infinite; }
        .ring-slow { animation: rotateSlow 70s linear infinite; }
        .ring-slow-rev { animation: rotateSlow 45s linear infinite reverse; }
        .auth-input {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid #c9a84c;
          padding: 11px 16px; font-family: 'Jost', sans-serif; font-size: 13px;
          color: #e8e0d0; outline: none; transition: border-color 0.3s;
        }
        .auth-input:focus { border-color: rgba(201,168,76,0.6); }
        .auth-input::placeholder { color: #c9a84c; }
        .auth-input-pr { padding-right: 44px; }
        .grid-overlay {
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.008) 60px, rgba(255,255,255,0.008) 61px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.008) 60px, rgba(255,255,255,0.008) 61px);
        }
      `}</style>

      <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0a0b] text-[#e8e0d0] md:mt-30" style={{ fontFamily: "'Jost', sans-serif" }}>
        <div className="fixed inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse 55% 45% at 15% 85%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse 45% 40% at 85% 15%, rgba(138,111,46,0.04) 0%, transparent 55%)` }} />
        <div className="grid-overlay fixed inset-0 pointer-events-none z-0 opacity-35" />

        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
          <div className="ring-slow pointer-events-none absolute w-[520px] h-[520px] rounded-full border border-[rgba(201,168,76,0.04)]" />
          <div className="ring-slow-rev pointer-events-none absolute w-[370px] h-[370px] rounded-full border border-[rgba(201,168,76,0.06)]" />

          <div className="auth-card relative w-full max-w-[430px] border border-[#c9a84c] p-10" style={{ background: "rgba(28,28,30,0.88)", backdropFilter: "blur(24px)" }}>
            <div className="absolute top-0 left-0 w-[18px] h-[18px] border-t-2 border-l-2 border-[#c9a84c]" />
            <div className="absolute top-0 right-0 w-[18px] h-[18px] border-t-2 border-r-2 border-[#c9a84c]" />
            <div className="absolute bottom-0 left-0 w-[18px] h-[18px] border-b-2 border-l-2 border-[#c9a84c]" />
            <div className="absolute bottom-0 right-0 w-[18px] h-[18px] border-b-2 border-r-2 border-[#c9a84c]" />

            <div className="flex items-center gap-3 mb-[10px]">
              <div className="flex-1 h-px bg-[#c9a84c]" />
              <span className="text-[11px] tracking-[4px] uppercase text-[#c9a84c]" style={{ fontFamily: "'Cinzel', serif" }}>Welcome Back</span>
              <div className="flex-1 h-px bg-[#c9a84c]" />
            </div>

            <h1 className="text-center font-light italic text-[#f5f0e8] leading-[1.2] text-[38px] mb-[6px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign In</h1>
            <p className="text-center text-[12px] tracking-[0.3px] text-[#c9a84c] mb-8">Continue your literary journey</p>

            {error && <div className="mb-[18px] px-[14px] py-[11px] text-[12px] text-[#e07070] bg-[rgba(139,58,58,0.15)] border border-[rgba(139,58,58,0.35)]">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block mb-[7px] text-[10px] tracking-[2px] uppercase text-white">Email Address</label>
                <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>

              <div className="mb-[10px]">
                <label className="block mb-[7px] text-[10px] tracking-[2px] uppercase text-white">Password</label>
                <div className="relative">
                  <input className="auth-input auth-input-pr" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6b6b70]">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="text-right mb-4">
                <a href="/forgot-password" className="text-[11px] tracking-[1px] text-[#c9a84c] underline">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-[10px] text-[9px] tracking-[3px] uppercase font-medium ${loading ? "bg-[#8a6f2e]" : "bg-[#c9a84c] hover:bg-[#f5f0e8]"} text-[#0a0a0b]`}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="flex justify-center py-3 text-[13px] text-[#6b6b70]">Or</div>
            <SocialAuthButtons />

            <div className="text-center mt-6 text-[12px] text-[#6b6b70]">
              New to AG Classics? <a href="/register" className="text-[#c9a84c] underline">Create an account</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}