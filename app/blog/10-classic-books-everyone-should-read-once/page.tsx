import { Metadata } from "next";
import ClassicBooksEveryoneShouldRead from "@/components/blogs/ClassicBooksEveryoneShouldRead";

// ─── 1. Comprehensive Next.js Metadata ────────────────────────────────

export const metadata: Metadata = {
  title: "10 Classic Books Everyone Should Read Once in Their Lifetime | AG Classics",
  description: "A curated guide to the masterworks of literature that have shaped human empathy, challenged societal norms, and endured through centuries.",
  keywords: [
    "Classic Books",
    "Must Read Books",
    "Literature",
    "AG Classics",
    "Top 10 Books",
    "Best Novels",
    "Classic Literature",
    "Book Recommendations"
  ],
  authors: [{ name: "AG Classics Editorial", url: "https://agclassics.in" }],
  creator: "AG Classics Editorial",
  publisher: "AG Publishing House",
  alternates: {
    canonical: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once",
  },
  openGraph: {
    title: "10 Classic Books Everyone Should Read Once in Their Lifetime",
    description: "A curated guide to the masterworks of literature that have shaped human empathy, challenged societal norms, and endured through centuries.",
    url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once",
    siteName: "AG Classics",
    images: [
      {
        url: "https://agclassics.in/og-classic-books.jpg", // Make sure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "10 Classic Books Everyone Should Read",
      },
    ],
    locale: "en_US",
    type: "article",
    publishedTime: "2026-06-12T00:00:00.000Z",
    authors: ["AG Classics Editorial"],
  },
  twitter: {
    card: "summary_large_image",
    title: "10 Classic Books Everyone Should Read",
    description: "A curated guide to the masterworks of literature that have shaped human empathy and challenged societal norms.",
    images: ["https://agclassics.in/og-classic-books.jpg"], 
    creator: "@agclassics", // Update if you have a specific Twitter handle
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
    "@id": "https://agclassics.in/blog/10-classic-books-everyone-should-read-once",
  },
  headline: "10 Classic Books Everyone Should Read Once in Their Lifetime",
  description: "A curated guide to the masterworks of literature that have shaped human empathy, challenged societal norms, and endured through centuries.",
  image: "https://agclassics.in/og-classic-books.jpg", 
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
  mainEntity: {
    "@type": "ItemList",
    name: "10 Classic Books Everyone Should Read",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-1", name: "To Kill a Mockingbird", author: { "@type": "Person", name: "Harper Lee" } }
      },
      {
        "@type": "ListItem",
        position: 2,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-2", name: "1984", author: { "@type": "Person", name: "George Orwell" } }
      },
      {
        "@type": "ListItem",
        position: 3,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-3", name: "Pride and Prejudice", author: { "@type": "Person", name: "Jane Austen" } }
      },
      {
        "@type": "ListItem",
        position: 4,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-4", name: "The Great Gatsby", author: { "@type": "Person", name: "F. Scott Fitzgerald" } }
      },
      {
        "@type": "ListItem",
        position: 5,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-5", name: "One Hundred Years of Solitude", author: { "@type": "Person", name: "Gabriel García Márquez" } }
      },
      {
        "@type": "ListItem",
        position: 6,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-6", name: "Crime and Punishment", author: { "@type": "Person", name: "Fyodor Dostoevsky" } }
      },
      {
        "@type": "ListItem",
        position: 7,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-7", name: "Frankenstein", author: { "@type": "Person", name: "Mary Shelley" } }
      },
      {
        "@type": "ListItem",
        position: 8,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-8", name: "The Catcher in the Rye", author: { "@type": "Person", name: "J.D. Salinger" } }
      },
      {
        "@type": "ListItem",
        position: 9,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-9", name: "Moby-Dick", author: { "@type": "Person", name: "Herman Melville" } }
      },
      {
        "@type": "ListItem",
        position: 10,
        item: { "@type": "Book", url: "https://agclassics.in/blog/10-classic-books-everyone-should-read-once#book-10", name: "Don Quixote", author: { "@type": "Person", name: "Miguel de Cervantes" } }
      }
    ]
  }
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
      <ClassicBooksEveryoneShouldRead />
    </>
  );
}