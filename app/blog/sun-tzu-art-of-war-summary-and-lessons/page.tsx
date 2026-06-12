import { Metadata } from "next";
import TheArtofWarSummaryandCoreLessons from "@/components/blogs/TheArtofWarSummaryandCoreLessons";

// ─── SEO Metadata ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "The Art of War: Summary & Core Lessons | AG Classics",
  description: "Sun Tzu's ancient military treatise remains the ultimate playbook for modern business strategy, competitive advantage, and executive leadership.",
  keywords: [
    "The Art of War Summary",
    "Sun Tzu Lessons",
    "Business Strategy",
    "AG Classics",
    "The Art of War for Business",
    "Sun Tzu Strategy",
    "Leadership Books"
  ],
  alternates: {
    canonical: "https://agclassics.in/blog/sun-tzu-art-of-war-summary-and-lessons",
  },
  openGraph: {
    title: "The Art of War: Summary & Core Lessons | AG Classics",
    description: "Sun Tzu's ancient military treatise remains the ultimate playbook for modern business strategy, competitive advantage, and executive leadership.",
    url: "https://agclassics.in/blog/sun-tzu-art-of-war-summary-and-lessons",
    type: "article",
    siteName: "AG Classics",
    images: [
      {
        url: "https://brandongaille.com/wp-content/uploads/2020/02/the-art-of-war-summary-ft.jpg",
        width: 1200,
        height: 630,
        alt: "The Art of War by Sun Tzu - Summary and Lessons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Art of War: Summary & Core Lessons | AG Classics",
    description: "Sun Tzu's ancient military treatise remains the ultimate playbook for modern business strategy, competitive advantage, and executive leadership.",
    images: ["https://brandongaille.com/wp-content/uploads/2020/02/the-art-of-war-summary-ft.jpg"],
  },
};

// ─── JSON-LD Schema ──────────────────────────────────────────────────────
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://agclassics.in/blog/sun-tzu-art-of-war-summary-and-lessons"
  },
  "headline": "The Art of War: Summary & Core Lessons",
  "description": "Sun Tzu's ancient military treatise remains the ultimate playbook for modern business strategy, competitive advantage, and executive leadership.",
  "image": "https://brandongaille.com/wp-content/uploads/2020/02/the-art-of-war-summary-ft.jpg",  
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
      <TheArtofWarSummaryandCoreLessons />
    </>
  );
}