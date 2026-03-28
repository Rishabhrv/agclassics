import type { Metadata } from "next";
import RegisterPage from "@/components/auth/RegisterPage";
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? "";


// 1. SEO Metadata (Server Side)
export const metadata: Metadata = {
  title: "Create Account | AG Classics",
  description: "Join the AG Classics collection. Create an account to curate your literary journey, track your reading, and access exclusive classic literature discussions.",
  robots: {
    index: false, // Registration pages are usually kept out of search index to avoid clutter
    follow: true,
  },
  openGraph: {
    title: "Create an Account | AG Classics",
    description: "Start your curated reading experience today.",
    url: `${SITE_URL}/register`,
    type: "website",
  },
};

export default function Page() {
  // 2. JSON-LD Schema (Structured Data)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Register - AG Classics",
    "description": "User registration and account creation page for AG Classics.",
    "url": `${SITE_URL}/register`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": "Register", "item": `${SITE_URL}/register` }
      ]
    },
    "potentialAction": {
      "@type": "RegisterAction",
      "target": `${SITE_URL}/register`
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
      <RegisterPage />
    </>
  );
}