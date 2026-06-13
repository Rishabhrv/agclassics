import { Metadata } from "next";
import HistoryOfPublicDomainLiterature from "@/components/blogs/HistoryOfPublicDomainLiterature";

// ─── 1. Next.js Metadata Optimized for Search Engines ─────────────────

export const metadata: Metadata = {
  title: "The History of Public Domain Literature | AG Classics",
  description: "From the Statute of Anne to the digital commons: explore how humanity fought to keep its stories free, and the ongoing battle for the public domain.",
  keywords: [
    "History of Public Domain",
    "Statute of Anne",
    "Copyright History",
    "Public Domain Literature",
    "Copyright Term Extension",
    "AG Classics",
    "Literary History",
    "Open Source Literature"
  ],
  authors: [{ name: "AG Classics Editorial", url: "https://agclassics.in" }],
  creator: "AG Classics Editorial",
  publisher: "AG Publishing House",
  alternates: {
    canonical: "https://agclassics.in/blog/the-history-of-public-domain-literature",
  },
  openGraph: {
    title: "The History of Public Domain Literature",
    description: "Discover the fascinating 300-year war over who owns humanity's greatest stories.",
    url: "https://agclassics.in/blog/the-history-of-public-domain-literature",
    siteName: "AG Classics",
    images: [
      {
        url: "https://agclassics.in/og-history-public-domain.jpg", // ← Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "The History of Public Domain Literature",
      },
    ],
    locale: "en_US",
    type: "article",
    publishedTime: "2026-08-15T00:00:00.000Z",
    authors: ["AG Classics Editorial"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The History of Public Domain Literature",
    description: "From ancient oral traditions to the corporate copyright extensions of the 20th century.",
    images: ["https://agclassics.in/og-history-public-domain.jpg"],
    creator: "@agclassics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ─── 2. JSON-LD Structured Schema Data (Article) ──────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://agclassics.in/blog/the-history-of-public-domain-literature",
  },
  headline: "The History of Public Domain Literature",
  description: "From the Statute of Anne to the digital commons: explore how humanity fought to keep its stories free, and the ongoing battle for the public domain.",
  image: [
    "https://agclassics.in/og-history-public-domain.jpg",
    "https://images.unsplash.com/photo-1585779034641-65476a8947f6?q=80&w=1600&auto=format&fit=crop", // Hero Image
    "https://covers.openlibrary.org/b/id/12620612-L.jpg", // Shakespeare Folio
    "https://covers.openlibrary.org/b/id/8259441-L.jpg" // Steamboat Willie era aesthetics
  ],
  author: {
    "@type": "Organization",
    name: "AG Classics Editorial",
    url: "https://agclassics.in",
  },
  publisher: {
    "@type": "Organization",
    name: "AG Publishing House",
    logo: {
      "@type": "ImageObject",
      url: "https://agclassics.in/logo.png",
    },
  },
  datePublished: "2026-08-15T08:00:00+00:00",
  dateModified: "2026-08-15T08:00:00+00:00",
  articleSection: "History & Culture",
  wordCount: 1150,
};

// ─── 3. Clean Layout Architecture ─────────────────────────────────────

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HistoryOfPublicDomainLiterature />
    </>
  );
}