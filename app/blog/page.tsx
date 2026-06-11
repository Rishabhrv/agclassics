import { Metadata } from "next";
import MainBlogPage from "@/components/blogs/MainBlogPage";

export const metadata: Metadata = {
  title: "AG Classics Blogs | Curated Business & Self-Development Insights",
  description: "Explore our curated collection of essays, reading lists, and timeless strategic insights. Deep dives into classic literature, business strategy, and personal development.",
  alternates: {
    canonical: "https://agclassics.in/blog",
  },
  openGraph: {
    title: "AG Classics Blogs | Curated Business & Self-Development Insights",
    description: "Explore our curated collection of essays, reading lists, and timeless strategic insights.",
    url: "https://agclassics.in/blog",
    siteName: "AG Classics",
    type: "website",
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "AG Classics Blogs",
  "description": "Curated essays and reading lists on business, strategy, and self-development.",
  "url": "https://agclassics.in/blog",
  "publisher": {
    "@type": "Organization",
    "name": "AG Classics",
    "logo": {
      "@type": "ImageObject",
      "url": "https://agclassics.in/logo.png"
    }
  }
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <MainBlogPage />
    </>
  );
}