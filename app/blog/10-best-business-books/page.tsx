import { Metadata } from "next";
import BestBusinessBooksofAllTime from "@/components/blogs/BestBusinessBooksofAllTime";
// ─── SEO Metadata ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "10 Best Business Books of All Time | AG Classics",
  description: "A curated guide to the timeless business books that built empires, rewired industries, and changed the thinking of every leader worth knowing.",
  keywords: [
    "Best Business Books",
    "Top Business Books of All Time",
    "Business Strategy",
    "AG Classics",
    "Entrepreneurship Books",
    "Must Read Business Books"
  ],
  alternates: {
    canonical: "https://agclassics.in/blog/10-best-business-books",
  },
  openGraph: {
    title: "10 Best Business Books of All Time | AG Classics",
    description: "A curated guide to the timeless business books that built empires, rewired industries, and changed the thinking of every leader worth knowing.",
    url: "https://agclassics.in/blog/10-best-business-books",
    type: "article",
    siteName: "AG Classics",
    images: [
      {
        url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop", // General library/business image
        width: 1200,
        height: 630,
        alt: "10 Best Business Books of All Time",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "10 Best Business Books of All Time | AG Classics",
    description: "A curated guide to the timeless business books that built empires, rewired industries, and changed the thinking of every leader worth knowing.",
    images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop"],
  },
};

// ─── JSON-LD Schema ──────────────────────────────────────────────────────
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://agclassics.in/blog/10-best-business-books"
  },
  "headline": "10 Best Business Books of All Time",
  "description": "A curated guide to the timeless business books that built empires, rewired industries, and changed the thinking of every leader worth knowing.",
  "image": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop",  
  "author": {
    "@type": "Organization",
    "name": "AG Classics Editorial",
    "url": "https://agclassics.in"
  },  
  "publisher": {
    "@type": "Organization",
    "name": "AG Classics",
    "logo": {
      "@type": "ImageObject",
      "url": "https://agclassics.in/logo.png" // Ensure you have your logo here
    }
  },
  "datePublished": "2026-06-01T08:00:00+00:00",
  "dateModified": "2026-06-01T08:00:00+00:00"
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BestBusinessBooksofAllTime />
    </>
  );
}