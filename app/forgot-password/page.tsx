"use client";

import { useState, useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const [step, setStep]           = useState<Step>("email");

  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass]     = useState("");
  const [confirm, setConfirm]     = useState("");

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ── OTP helpers ── */
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

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Failed to send OTP"); return; }
      setStep("otp");
      setResendTimer(60);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Invalid OTP"); return; }
      setStep("reset");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: Reset ── */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPass.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPass !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Reset failed"); return; }
      setSuccess("Password reset successfully! Redirecting to sign in…");
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex  = step === "email" ? 0 : step === "otp" ? 1 : 2;
  const stepLabels = ["Email", "Verify", "Reset"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn      { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes panelIn     { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ticker      { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes rotateSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes floatDiamond{ 0%,100%{transform:rotate(45deg) translateY(0)} 50%{transform:rotate(45deg) translateY(-7px)} }

        .auth-card  { animation: fadeIn  0.55s ease both; }
        .step-panel { animation: panelIn 0.35s ease both; }
        .ticker-run { animation: ticker  20s   linear infinite; }
        * { box-sizing: border-box; }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.2);
          padding: 13px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          color: #e8e0d0;
          outline: none;
          transition: border-color 0.3s;
        }
        .auth-input:focus { border-color: rgba(201,168,76,0.6); }
        .auth-input::placeholder { color: #3a3a3d; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#0a0a0b",
        display: "flex", flexDirection: "column",
        fontFamily: "'Jost', sans-serif", color: "#e8e0d0",
        position: "relative", overflow: "hidden",
      }}>

        {/* Background */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `
            radial-gradient(ellipse 50% 45% at 70% 70%, rgba(201,168,76,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 30% 25%, rgba(138,111,46,0.04) 0%, transparent 55%)
          `,
        }} />
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.35,
          backgroundImage: `
            repeating-linear-gradient(0deg,  transparent, transparent 60px, rgba(255,255,255,0.008) 60px, rgba(255,255,255,0.008) 61px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.008) 60px, rgba(255,255,255,0.008) 61px)
          `,
        }} />


        {/* Main */}
        <div style={{
          flex: 1, position: "relative", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "152px 24px 64px",
        }}>

          <div style={{
            position: "absolute", width: 520, height: 520,
            border: "1px solid rgba(201,168,76,0.04)", borderRadius: "50%",
            animation: "rotateSlow 70s linear infinite", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: 370, height: 370,
            border: "1px solid rgba(201,168,76,0.06)", borderRadius: "50%",
            animation: "rotateSlow 45s linear infinite reverse", pointerEvents: "none",
          }} />

          {/* Card */}
          <div className="auth-card" style={{
            width: "100%", maxWidth: 430,
            background: "rgba(28,28,30,0.88)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(201,168,76,0.15)",
            padding: "46px 42px 42px",
            position: "relative",
          }}>

            {[
              { top: 0,    left: 0,  borderTop:    "2px solid #8a6f2e", borderLeft:   "2px solid #8a6f2e" },
              { top: 0,    right: 0, borderTop:    "2px solid #8a6f2e", borderRight:  "2px solid #8a6f2e" },
              { bottom: 0, left: 0,  borderBottom: "2px solid #8a6f2e", borderLeft:   "2px solid #8a6f2e" },
              { bottom: 0, right: 0, borderBottom: "2px solid #8a6f2e", borderRight:  "2px solid #8a6f2e" },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 18, height: 18, ...s }} />
            ))}

            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 9,
                letterSpacing: "4px", textTransform: "uppercase", color: "#8a6f2e",
              }}>
                Account Recovery
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 38, fontWeight: 300, fontStyle: "italic",
              color: "#f5f0e8", margin: "0 0 6px", textAlign: "center", lineHeight: 1.2,
            }}>
              Reset Password
            </h1>
            <p style={{
              fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#6b6b70",
              textAlign: "center", margin: "0 0 28px", letterSpacing: "0.3px",
            }}>
              Recover access to your account
            </p>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
              {stepLabels.map((label, i) => {
                const done   = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
                    {i < 2 && (
                      <div style={{
                        position: "absolute", top: 13, left: "50%", width: "100%", height: 1,
                        background: done ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)",
                        transition: "background 0.4s", zIndex: 0,
                      }} />
                    )}
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", zIndex: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: done ? "#c9a84c" : active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid #c9a84c" : done ? "none" : "1px solid rgba(201,168,76,0.2)",
                      transition: "all 0.4s",
                    }}>
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <span style={{
                          fontFamily: "'Cinzel', serif", fontSize: 10,
                          color: active ? "#c9a84c" : "#3a3a3d",
                        }}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: "'Jost', sans-serif", fontSize: 9,
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: active ? "#c9a84c" : done ? "#8a6f2e" : "#3a3a3d",
                      transition: "color 0.4s",
                    }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Messages */}
            {error && (
              <div style={{
                marginBottom: 18, padding: "11px 14px",
                background: "rgba(139,58,58,0.15)",
                border: "1px solid rgba(139,58,58,0.35)",
                fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#e07070", lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                marginBottom: 18, padding: "11px 14px",
                background: "rgba(50,120,80,0.15)",
                border: "1px solid rgba(50,120,80,0.35)",
                fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#70c090", lineHeight: 1.5,
              }}>
                {success}
              </div>
            )}

            {/* ── Step 1: Email ── */}
            {step === "email" && (
              <div className="step-panel">
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      display: "block", marginBottom: 7,
                      fontFamily: "'Jost', sans-serif", fontSize: 10,
                      letterSpacing: "2px", textTransform: "uppercase", color: "#6b6b70",
                    }}>
                      Email Address
                    </label>
                    <input
                      className="auth-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <p style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 11,
                    color: "#6b6b70", lineHeight: 1.7, marginBottom: 20,
                  }}>
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
                  <p style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#6b6b70",
                    textAlign: "center", marginBottom: 22, lineHeight: 1.7,
                  }}>
                    Code sent to <span style={{ color: "#c9a84c" }}>{email}</span>
                  </p>

                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 22 }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{
                          width: 46, height: 54, textAlign: "center",
                          background: "rgba(255,255,255,0.03)",
                          border: digit ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.2)",
                          fontFamily: "'Cinzel', serif",
                          fontSize: 20, color: "#c9a84c",
                          outline: "none", transition: "border-color 0.3s",
                          caretColor: "#c9a84c",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.8)")}
                        onBlur={e => (e.currentTarget.style.borderColor = digit ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.2)")}
                      />
                    ))}
                  </div>

                  <SubmitBtn loading={loading}>Verify Code</SubmitBtn>

                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    {resendTimer > 0 ? (
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#6b6b70" }}>
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button type="button"
                        style={{
                          background: "none", border: "none",
                          fontFamily: "'Jost', sans-serif", fontSize: 11,
                          color: "#8a6f2e", cursor: "pointer", padding: 0, textDecoration: "underline",
                        }}
                        onClick={handleSendOtp as any}
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 3: New Password ── */}
            {step === "reset" && (
              <div className="step-panel">
                <form onSubmit={handleReset}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      display: "block", marginBottom: 7,
                      fontFamily: "'Jost', sans-serif", fontSize: 10,
                      letterSpacing: "2px", textTransform: "uppercase", color: "#6b6b70",
                    }}>
                      New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="auth-input"
                        type={showPass ? "text" : "password"}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        placeholder="Min 8 characters"
                        autoComplete="new-password"
                        style={{ paddingRight: 44 }}
                        required
                      />
                      <EyeToggle show={showPass} toggle={() => setShowPass(s => !s)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{
                      display: "block", marginBottom: 7,
                      fontFamily: "'Jost', sans-serif", fontSize: 10,
                      letterSpacing: "2px", textTransform: "uppercase", color: "#6b6b70",
                    }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="auth-input"
                        type={showConf ? "text" : "password"}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        style={{
                          paddingRight: 44,
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
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0" }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(201,168,76,0.25))" }} />
              <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: "#8a6f2e" }} />
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(201,168,76,0.25))" }} />
            </div>

            <p style={{
              textAlign: "center", margin: 0,
              fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#6b6b70",
            }}>
              Remembered your password?{" "}
              <a href="/login" style={{
                color: "#c9a84c",
                textDecoration: "underline",
                textDecorationColor: "rgba(201,168,76,0.4)",
              }}>
                Sign in
              </a>
            </p>
          </div>
        </div>


      </div>
    </>
  );
}

function EyeToggle({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} style={{
      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
      background: "none", border: "none", cursor: "pointer", color: "#6b6b70", padding: 0,
    }}>
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
    <button type="submit" disabled={loading} style={{
      width: "100%", padding: "14px 0",
      background: loading ? "#8a6f2e" : "#c9a84c",
      color: "#0a0a0b",
      fontFamily: "'Jost', sans-serif", fontSize: 11,
      letterSpacing: "3px", textTransform: "uppercase",
      fontWeight: 500, border: "none",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "background 0.3s",
    }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f5f0e8"; }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? "#8a6f2e" : "#c9a84c"; }}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity="0.25"/>
            <path d="M21 12a9 9 0 0 1-9 9"/>
          </svg>
          Please wait…
        </span>
      ) : children}
    </button>
  );
}