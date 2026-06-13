import { Metadata } from "next";
import WhyPublicDomainBooks from "@/components/blogs/WhyPublicDomainBooks";

// ─── 1. Comprehensive Next.js Metadata ────────────────────────────────

export const metadata: Metadata = {
  title: "Why Public Domain Books Are Still Relevant Today | AG Classics",
  description: "An inquiry into the intellectual commons: how restriction-free historical masterworks act as the ultimate catalyst for contemporary creativity, uninhibited education, and independent publishing.",
  keywords: [
    "Public Domain Books",
    "Classic Literature",
    "Copyright Free Books",
    "Open Library",
    "Independent Publishing",
    "AG Classics",
    "Literary Heritage",
    "Importance of Classic Books"
  ],
  authors: [{ name: "AG Classics Editorial", url: "https://agclassics.in" }],
  creator: "AG Classics Editorial",
  publisher: "AG Publishing House",
  alternates: {
    canonical: "https://agclassics.in/blog/why-public-domain-books-are-still-relevant",
  },
  openGraph: {
    title: "Why Public Domain Books Are Still Relevant Today",
    description: "Discover how public domain literature remains the creative engine and cultural bedrock of our modern world.",
    url: "https://agclassics.in/blog/why-public-domain-books-are-still-relevant",
    siteName: "AG Classics",
    images: [
      {
        url: "https://agclassics.in/og-public-domain.jpg", // Make sure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "Why Public Domain Books Are Still Relevant Today",
      },
    ],
    locale: "en_US",
    type: "article",
    publishedTime: "2026-06-12T00:00:00.000Z",
    authors: ["AG Classics Editorial"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Why Public Domain Books Are Still Relevant Today",
    description: "How restriction-free historical masterworks act as the ultimate catalyst for contemporary creativity.",
    images: ["https://agclassics.in/og-public-domain.jpg"], 
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

// ─── 2. JSON-LD Structured Data (Schema) ──────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://agclassics.in/blog/why-public-domain-books-are-still-relevant",
  },
  headline: "Why Public Domain Books Are Still Relevant Today",
  description: "An inquiry into the intellectual commons: how restriction-free historical masterworks act as the ultimate catalyst for contemporary creativity, uninhibited education, and independent publishing.",
  image: [
    "https://agclassics.in/og-public-domain.jpg",
    "https://covers.openlibrary.org/b/isbn/0140439005-L.jpg", // Sherlock Holmes Cover
    "https://covers.openlibrary.org/b/isbn/0140444300-L.jpg", // Les Misérables Cover
    "https://covers.openlibrary.org/b/isbn/0141439769-L.jpg", // Alice in Wonderland Cover
    "https://covers.openlibrary.org/b/isbn/0141439475-L.jpg"  // Frankenstein Cover
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
      url: "https://agclassics.in/logo.png", // Make sure logo.png is in your public folder
    },
  },
  datePublished: "2026-06-12T08:00:00+00:00",
  dateModified: "2026-06-12T08:00:00+00:00",
  articleSection: "Essays & Analysis",
  wordCount: 1050, // Approximate word count of the essay
};

// ─── 3. Page Component ────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      {/* Inject the JSON-LD Script strictly into the page structure */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Render the actual Client Component */}
      <WhyPublicDomainBooks />
    </>
  );
}