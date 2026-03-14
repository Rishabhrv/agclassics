"use client";

import { useState } from "react";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
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

        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes floatDiamond { 0%,100%{transform:rotate(45deg) translateY(0)} 50%{transform:rotate(45deg) translateY(-7px)} }

        .auth-card { animation: fadeIn 0.55s ease both; }
        .ticker-run { animation: ticker 20s linear infinite; }
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

        {/* Background atmosphere */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `
            radial-gradient(ellipse 55% 45% at 15% 85%, rgba(201,168,76,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 45% 40% at 85% 15%, rgba(138,111,46,0.04) 0%, transparent 55%)
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

          {/* Decorative rings */}
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

            {/* Corner accents */}
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
                Welcome Back
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 38, fontWeight: 300, fontStyle: "italic",
              color: "#f5f0e8", margin: "0 0 6px", textAlign: "center", lineHeight: 1.2,
            }}>
              Sign In
            </h1>
            <p style={{
              fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#6b6b70",
              textAlign: "center", margin: "0 0 32px", letterSpacing: "0.3px",
            }}>
              Continue your literary journey
            </p>

            {/* Error */}
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

            <form onSubmit={handleLogin}>
              {/* Email */}
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

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
                <label style={{
                  display: "block", marginBottom: 7,
                  fontFamily: "'Jost', sans-serif", fontSize: 10,
                  letterSpacing: "2px", textTransform: "uppercase", color: "#6b6b70",
                }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="auth-input"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      cursor: "pointer", color: "#6b6b70", padding: 0,
                    }}
                  >
                    {showPass ? (
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
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginBottom: 24 }}>
                <a href="/forgot-password" style={{
                  fontFamily: "'Jost', sans-serif", fontSize: 11,
                  letterSpacing: "1px", color: "#8a6f2e",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(138,111,46,0.4)",
                }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
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
                    Signing in…
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            <div className="mx-auto flex justify-center py-3">Or</div>
                  <SocialAuthButtons />


            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0" }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(201,168,76,0.25))" }} />
              <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: "#8a6f2e" }} />
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(201,168,76,0.25))" }} />
            </div>

            {/* Register link */}
            <p style={{
              textAlign: "center", margin: 0,
              fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#6b6b70",
            }}>
              New to AG Classics?{" "}
              <a href="/register" style={{
                color: "#c9a84c",
                textDecoration: "underline",
                textDecorationColor: "rgba(201,168,76,0.4)",
              }}>
                Create an account
              </a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}