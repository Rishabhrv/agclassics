"use client";

import { useState, useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Step = "email" | "otp" | "reset";

/*
  Kept in <style> ONLY:
  1. Google Fonts @import
  2. @keyframes (spin, fadeIn, panelIn, rotateSlow)
  3. .auth-input :focus + ::placeholder pseudo-selectors
  4. .auth-input-pr padding-right variant
  5. repeating-linear-gradient grid overlay (no Tailwind equivalent)
*/

export default function ForgotPasswordPage() {
  const [step, setStep]               = useState<Step>("email");
  const [email, setEmail]             = useState("");
  const [otp, setOtp]                 = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass]         = useState("");
  const [confirm, setConfirm]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp]; next[idx - 1] = "";
      setOtp(next);
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Failed to send OTP"); return; }
      setStep("otp"); setResendTimer(60);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Invalid OTP"); return; }
      setStep("reset");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (newPass.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPass !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Reset failed"); return; }
      setSuccess("Password reset successfully! Redirecting to sign in…");
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const stepIndex  = step === "email" ? 0 : step === "otp" ? 1 : 2;
  const stepLabels = ["Email", "Verify", "Reset"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes panelIn    { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .auth-card  { animation: fadeIn  0.55s ease both; }
        .step-panel { animation: panelIn 0.35s ease both; }
        .ring-fwd   { animation: rotateSlow 70s linear infinite; }
        .ring-rev   { animation: rotateSlow 45s linear infinite reverse; }
        .spin-anim  { animation: spin 0.8s linear infinite; }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid #c9a84c;
          padding: 13px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: #e8e0d0;
          outline: none;
          transition: border-color 0.3s;
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

      {/* ── Page wrapper ── */}
      <div
        className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0a0b] text-[#e8e0d0] mt-10"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {/* Radial glow */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 45% at 70% 70%, rgba(201,168,76,0.05) 0%, transparent 60%),
              radial-gradient(ellipse 45% 35% at 30% 25%, rgba(138,111,46,0.04) 0%, transparent 55%)
            `,
          }}
        />
        {/* Grid overlay */}
        <div className="grid-overlay fixed inset-0 pointer-events-none z-0 opacity-35" />

        {/* ── Main ── */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 md:pt-[152px] pb-16">

          {/* Decorative rings */}
          <div className="ring-fwd pointer-events-none absolute w-[520px] h-[520px] rounded-full border border-[rgba(201,168,76,0.04)]" />
          <div className="ring-rev pointer-events-none absolute w-[370px] h-[370px] rounded-full border border-[rgba(201,168,76,0.06)]" />

          {/* ── Card ── */}
          <div
            className="auth-card relative w-full max-w-[430px] border border-[#c9a84c] p-10"
            style={{ background: "rgba(28,28,30,0.88)", backdropFilter: "blur(24px)" }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-[18px] h-[18px] border-t-2 border-l-2 border-[#c9a84c]" />
            <div className="absolute top-0 right-0 w-[18px] h-[18px] border-t-2 border-r-2 border-[#c9a84c]" />
            <div className="absolute bottom-0 left-0 w-[18px] h-[18px] border-b-2 border-l-2 border-[#c9a84c]" />
            <div className="absolute bottom-0 right-0 w-[18px] h-[18px] border-b-2 border-r-2 border-[#c9a84c]" />

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-[10px]">
              <div className="flex-1 h-px bg-[#c9a84c]" />
              <span className="text-[11px] tracking-[4px] uppercase text-[#c9a84c]"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Account Recovery
              </span>
              <div className="flex-1 h-px bg-[#c9a84c]" />
            </div>

            {/* Title */}
            <h1 className="text-center font-light italic text-[#f5f0e8] text-[38px] leading-[1.2] mb-[6px]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Reset Password
            </h1>
            <p className="text-center text-[12px] tracking-[0.3px] text-[#c9a84c] mb-7"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Recover access to your account
            </p>

            {/* ── Step indicator ── */}
            <div className="flex items-center mb-7">
              {stepLabels.map((label, i) => {
                const done   = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-[6px] relative">
                    {/* Connector line */}
                    {i < 2 && (
                      <div
                        className="absolute top-[13px] left-1/2 w-full h-px z-0 transition-all duration-[400ms]"
                        style={{ background: done ? "rgba(201,168,76,0.5)" : "rgba(255, 255, 255, 0.59)" }}
                      />
                    )}
                    {/* Circle */}
                    <div
                      className="relative z-[1] w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-[400ms]"
                      style={{
                        background: done ? "#c9a84c" : active ? "rgba(201,168,76,0.15)" : "rgba(255, 255, 255, 0.38)",
                        border: active ? "1px solid #c9a84c" : done ? "none" : "1px solid rgba(201,168,76,0.2)",
                      }}
                    >
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <span className="text-[10px] transition-colors duration-[400ms]"
                          style={{ fontFamily: "'Cinzel', serif", color: active ? "#c9a84c" : "#2e2e2e" }}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                    {/* Label */}
                    <span
                      className="text-[9px] tracking-[2px] uppercase transition-colors duration-[400ms]"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: active ? "#c9a84c" : done ? "#8a6f2e" : "#c9c9c9",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Error / Success */}
            {error && (
              <div className="mb-[18px] px-[14px] py-[11px] text-[12px] leading-[1.5] text-[#e07070]
                bg-[rgba(139,58,58,0.15)] border border-[rgba(139,58,58,0.35)]"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-[18px] px-[14px] py-[11px] text-[12px] leading-[1.5] text-[#70c090]
                bg-[rgba(50,120,80,0.15)] border border-[rgba(50,120,80,0.35)]"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                {success}
              </div>
            )}

            {/* ── Step 1: Email ── */}
            {step === "email" && (
              <div className="step-panel">
                <form onSubmit={handleSendOtp}>
                  <div className="mb-5">
                    <label className="block mb-[7px] text-[10px] tracking-[2px] uppercase text-white"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      Email Address
                    </label>
                    <input className="auth-input" type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" required />
                  </div>
                  <p className="text-[11px] text-white leading-[1.7] mb-5"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    If an account exists for this email, we'll send a reset code.
                  </p>
                  <SubmitBtn loading={loading}>Send Reset Code</SubmitBtn>
                </form>
              </div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === "otp" && (
              <div className="step-panel">
                <form onSubmit={handleVerifyOtp}>
                  <p className="text-center text-[12px] text-[#6b6b70] leading-[1.7] mb-[22px]"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    Code sent to{" "}
                    <span className="text-[#c9a84c]">{email}</span>
                  </p>

                  {/* OTP boxes */}
                  <div className="flex gap-[10px] justify-center mb-[22px]">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="text-center text-[20px] text-[#c9a84c] outline-none transition-[border-color] duration-300"
                        style={{
                          width: 46, height: 54,
                          background: "rgba(255,255,255,0.03)",
                          border: digit ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.2)",
                          fontFamily: "'Cinzel', serif",
                          caretColor: "#c9a84c",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.8)")}
                        onBlur={e => (e.currentTarget.style.borderColor = digit ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.2)")}
                      />
                    ))}
                  </div>

                  <SubmitBtn loading={loading}>Verify Code</SubmitBtn>

                  <div className="text-center mt-4">
                    {resendTimer > 0 ? (
                      <span className="text-[11px] text-[#6b6b70]"
                        style={{ fontFamily: "'Jost', sans-serif" }}>
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button type="button"
                        className="bg-transparent border-none text-[11px] text-[#8a6f2e] cursor-pointer p-0 underline"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                        onClick={handleSendOtp as any}>
                        Resend code
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 3: Reset ── */}
            {step === "reset" && (
              <div className="step-panel">
                <form onSubmit={handleReset}>
                  <div className="mb-5">
                    <label className="block mb-[7px] text-[10px] tracking-[2px] uppercase text-white"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      New Password
                    </label>
                    <div className="relative">
                      <input className="auth-input auth-input-pr" type={showPass ? "text" : "password"}
                        value={newPass} onChange={e => setNewPass(e.target.value)}
                        placeholder="Min 8 characters" autoComplete="new-password" required />
                      <EyeToggle show={showPass} toggle={() => setShowPass(s => !s)} />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block mb-[7px] text-[10px] tracking-[2px] uppercase text-white"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        className="auth-input auth-input-pr"
                        type={showConf ? "text" : "password"}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        style={{
                          borderColor: confirm && confirm !== newPass
                            ? "rgba(139,58,58,0.6)"
                            : confirm && confirm === newPass
                            ? "rgba(80,160,100,0.5)"
                            : "rgba(201,168,76,0.2)",
                        }}
                        required
                      />
                      <EyeToggle show={showConf} toggle={() => setShowConf(s => !s)} />
                    </div>
                  </div>

                  <SubmitBtn loading={loading}>Reset Password</SubmitBtn>
                </form>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-[14px] my-[26px]">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.25))" }} />
              <div className="w-[5px] h-[5px] rotate-45 bg-[#8a6f2e] shrink-0" />
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,0.25))" }} />
            </div>

            <p className="text-center text-[12px] text-white"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Remembered your password?{" "}
              <a href="/login" className="text-[#c9a84c] underline decoration-[rgba(201,168,76,0.4)]">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Shared sub-components ── */

function EyeToggle({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle}
      className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#6b6b70] p-0">
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={[
        "w-full py-[14px] text-[11px] tracking-[3px] uppercase font-medium border-none",
        "text-[#0a0a0b] transition-colors duration-300",
        loading ? "bg-[#8a6f2e] cursor-not-allowed" : "bg-[#c9a84c] cursor-pointer hover:bg-[#f5f0e8]",
      ].join(" ")}
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="spin-anim">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity="0.25"/>
            <path d="M21 12a9 9 0 0 1-9 9"/>
          </svg>
          Please wait…
        </span>
      ) : children}
    </button>
  );
}