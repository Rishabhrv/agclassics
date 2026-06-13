import { Metadata } from "next";
import HowBooksEnterPublicDomain from "@/components/blogs/HowBooksEnterPublicDomain";

// ─── 1. Next.js Metadata Optimized for Search Engines ─────────────────

export const metadata: Metadata = {
  title: "How Books Enter the Public Domain | AG Classics",
  description: "Demystifying the complex legal labyrinth of copyright expiration. Learn the mechanics of how, when, and why a literary masterwork finally belongs to the world.",
  keywords: [
    "How books enter public domain",
    "Copyright Expiration",
    "Public Domain Day",
    "Life plus 70 years",
    "Orphan Works",
    "AG Classics",
    "Publishing Law",
    "Open Source Literature"
  ],
  authors: [{ name: "AG Classics Editorial", url: "https://agclassics.in" }],
  creator: "AG Classics Editorial",
  publisher: "AG Publishing House",
  alternates: {
    canonical: "https://agclassics.in/blog/how-books-enter-the-public-domain",
  },
  openGraph: {
    title: "The Mechanics of Liberation: How Books Enter the Public Domain",
    description: "Discover the legal timelines and rules that dictate when a book transitions from private corporate property into the shared human inheritance.",
    url: "https://agclassics.in/blog/how-books-enter-the-public-domain",
    siteName: "AG Classics",
    images: [
      {
        url: "https://agclassics.in/og-how-books-enter.jpg", // ← Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "How Books Enter the Public Domain",
      },
    ],
    locale: "en_US",
    type: "article",
    publishedTime: "2026-09-10T00:00:00.000Z",
    authors: ["AG Classics Editorial"],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Books Enter the Public Domain",
    description: "Demystifying the legal labyrinth of copyright expiration and Public Domain Day.",
    images: ["https://agclassics.in/og-how-books-enter.jpg"],
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
    "@id": "https://agclassics.in/blog/how-books-enter-the-public-domain",
  },
  headline: "The Mechanics of Liberation: How Books Enter the Public Domain",
  description: "Demystifying the complex legal labyrinth of copyright expiration. Learn the mechanics of how, when, and why a literary masterwork finally belongs to the world.",
  image: [
    "https://agclassics.in/og-how-books-enter.jpg",
    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1600&auto=format&fit=crop", // Legal/Scales Hero Image
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1600&auto=format&fit=crop" // Library/Orphan works image
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
  datePublished: "2026-09-10T08:00:00+00:00",
  dateModified: "2026-09-10T08:00:00+00:00",
  articleSection: "Publishing & Law",
  wordCount: 1100,
};

// ─── 3. Clean Layout Architecture ─────────────────────────────────────

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HowBooksEnterPublicDomain />
    </>
  );
}