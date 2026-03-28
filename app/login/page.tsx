import type { Metadata } from "next";
import LoginPage from "@/components/auth/LoginPage";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? "";

// 1. SEO Metadata (Server Side)
export const metadata: Metadata = {
  title: "Sign In | AG Classics",
  description: "Securely sign in to your AG Classics account. Access your literary collection, custom dashboard, and explore classic literature.",
  robots: {
    index: false, // Prevents login page from cluttering search results
    follow: true, // Allows search engines to follow links to other pages
  },
  openGraph: {
    title: "Sign In | AG Classics",
    description: "Continue your literary journey at AG Classics.",
    url: `${SITE_URL}/login`, // Replace with your actual domain
    type: "website",
  },
};

export default function Page() {
  // 2. JSON-LD Schema (Structured Data)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LoginPage",
    "name": "Sign In - AG Classics",
    "description": "User authentication page for AG Classics.",
    "url": `${SITE_URL}/login`,
    "potentialAction": {
      "@type": "LogInAction",
      "target": `${SITE_URL}/login`
    },
    "provider": {
      "@type": "Organization",
      "name": "AG Classics",
      "logo": `${SITE_URL}/logo/AGClassicLogo.png` // Update with your logo path
    }
  };

  return (
    <>
      {/* Injecting Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Rendering the Client Component */}
      <LoginPage />
    </>
  );
}