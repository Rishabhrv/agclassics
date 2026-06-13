"use client";

import { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { syncGuestDataAfterLogin } from "@/lib/guestStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const SocialAuthButtons = () => {
  const router = useRouter();
  const pathname = usePathname(); // /login or /register
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const isRegister = pathname === "/register";

  // Auto-hide the toast after 4 seconds
  useEffect(() => {
    if (toastOpen) {
      const timer = setTimeout(() => setToastOpen(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastOpen]);

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const endpoint = isRegister ? "google/register" : "google/login";

      const res = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          google_id: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {      
        setToastMsg(data.msg || "Authentication failed. Please try again.");
        setToastOpen(true);
        return;
      }

      localStorage.setItem("token", data.token);
      await syncGuestDataAfterLogin(data.token);
      window.dispatchEvent(new Event("auth-change"));

      window.location.href = "/";
    } catch (error: any) {
      // Handle cases where the user closes the Google popup manually
      if (error.code !== "auth/popup-closed-by-user") {
        setToastMsg("An error occurred with Google Sign-In.");
        setToastOpen(true);
      }
    }
  };

  return (
    <>
      <button
        onClick={handleGoogle}
        className="w-full flex items-center cursor-pointer justify-center gap-3 border border-gray-300 rounded-md py-2.5 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
      >
        <img
          src="./google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        {isRegister ? "Sign up with Google" : "Sign in with Google"}
      </button>

      {/* Toast Notification UI */}
      {toastOpen && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 text-[13px] text-[#e07070] border border-[rgba(139,58,58,0.5)] shadow-2xl rounded-md flex items-center gap-3 animate-fadeIn" 
          style={{ 
            background: "rgba(28,28,30,0.98)", 
            backdropFilter: "blur(12px)",
            fontFamily: "'Jost', sans-serif" 
          }}
        >
          {/* Warning Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          
          <span>{toastMsg}</span>
          
          {/* Close Button */}
          <button 
            onClick={() => setToastOpen(false)} 
            className="ml-2 text-[#6b6b70] hover:text-[#e8e0d0] transition-colors p-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default SocialAuthButtons;