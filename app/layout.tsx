import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import HomeHeader from "@/components/layout/HomeHeader";
import HomeFooter from "@/components/layout/HomeFooter";
import MotionBackground from "@/components/motion/MotionBackground";
import { MotionProvider } from "@/components/motion/Motionprovider";
import CustomCursor from "@/components/motion/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ag Classics",
  description:
    "A modern e-book store. Explore a wide range of books, from bestsellers to new releases, and enjoy a seamless shopping experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0a0a0b", margin: 0, overflowX: "hidden" }}
      >
        <MotionProvider>

          {/* ── Fixed motion background (particles, beams, glow, grid) ── */}
          <MotionBackground />

          {/* ── Custom magnetic cursor ── */}
          <CustomCursor />

          {/* ── All page content sits above the motion layers (z-index: 10) ── */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <HomeHeader />

            <main>
              {children}
            </main>

            <HomeFooter />
          </div>

        </MotionProvider>
      </body>
    </html>
  );
}