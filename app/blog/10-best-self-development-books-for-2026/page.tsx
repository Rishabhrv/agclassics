import { Metadata } from "next";
import BestSelfDevelopmentBooksfor2026 from "@/components/blogs/BestSelfDevelopmentBooksfor2026";

// ─── SEO Metadata ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "10 Best Self-Development Books for 2026 | AG Classics",
  description: "A curated guide to the books that forge resilience, sharpen focus, and fundamentally rewire the human mind — assembled from the AG Classics collection.",
  keywords: [
    "Best Self-Development Books 2026",
    "Top Self-Help Books",
    "Personal Growth Books",
    "Atomic Habits",
    "Meditations Marcus Aurelius",
    "AG Classics",
    "Productivity Books",
    "Mindset Books"
  ],
  alternates: {
    canonical: "https://agclassics.in/blog/10-best-self-development-books",
  },
  openGraph: {
    title: "10 Best Self-Development Books for 2026 | AG Classics",
    description: "A curated guide to the books that forge resilience, sharpen focus, and fundamentally rewire the human mind — assembled from the AG Classics collection.",
    url: "https://agclassics.in/blog/10-best-self-development-books",
    type: "article",
    siteName: "AG Classics",
    images: [
      {
        url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop", // General library/reading image
        width: 1200,
        height: 630,
        alt: "10 Best Self-Development Books for 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "10 Best Self-Development Books for 2026 | AG Classics",
    description: "A curated guide to the books that forge resilience, sharpen focus, and fundamentally rewire the human mind — assembled from the AG Classics collection.",
    images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop"],
  },
};

// ─── JSON-LD Schema ──────────────────────────────────────────────────────
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://agclassics.in/blog/10-best-self-development-books"
  },
  "headline": "10 Best Self-Development Books for 2026",
  "description": "A curated guide to the books that forge resilience, sharpen focus, and fundamentally rewire the human mind — assembled from the AG Classics collection.",
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
      "url": "https://agclassics.in/logo.png" 
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
      <BestSelfDevelopmentBooksfor2026 />
    </>
  );
}