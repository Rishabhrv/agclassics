import type { Metadata } from "next";
import MainBody from "@/components/home/MainBody";

/* ─────────────────────────────────────────────
   SITE-WIDE CONSTANTS  (update once, used everywhere)
───────────────────────────────────────────────── */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || "";   // ← your canonical domain
const SITE_NAME = "AG Classics";
const OG_IMAGE  = `${SITE_URL}/images/logo/AGClassicLogosquare.png`; // 1200×630 recommended

/* ─────────────────────────────────────────────
   METADATA  (Next.js 13 + App Router)
───────────────────────────────────────────────── */
export const metadata: Metadata = {
  /* ── Basics ── */
  title: {
    default: "AG Classics | Books & E-Books for Every Reader",
    template: "%s | AG Classics",
  },
  description:
    "Discover the AG Classics collection — a curated selection of timeless literature, business, philosophy, and self-development books and e-books, chosen for those who read with intention.",
  keywords: [
    "AG Classics",
    "classic literature books",
    "curated book collection",
    "buy books online India",
    "e-books",
    "business books",
    "self-development books",
    "philosophy books",
    "finance books",
    "timeless literature",
    "rare books",
  ],
  authors: [{ name: "AG Classics", url: SITE_URL }],
  creator:   "AG Classics",
  publisher: "AG Classics",

  /* ── Canonical & alternates ── */
  alternates: {
    canonical: SITE_URL,
  },

  /* ── Open Graph ── */
  openGraph: {
    type:        "website",
    url:         SITE_URL,
    siteName:    SITE_NAME,
    title:       "AG Classics | Books & E-Books for Intentional Readers",
    description:
      "Timeless literature, business, philosophy, and self-development books — curated for those who read with intention.",
    images: [
      {
        url:    OG_IMAGE,
        width:  1200,
        height: 630,
        alt:    "AG Classics | Curated Book Collection",
      },
    ],
    locale: "en_IN",
  },

  /* ── Twitter / X Card ── */
  twitter: {
    card:        "summary_large_image",
    title:       "AG Classics | Curated Books & E-Books",
    description: "Timeless literature and curated reads for intentional readers.",
    images:      [OG_IMAGE],
    // creator: "@agclassics",  // ← add if you have a Twitter handle
  },

  /* ── Robots ── */
  robots: {
    index:               true,
    follow:              true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  /* ── Icons ── */
  icons: {
    icon:        "/favicon.ico",
    shortcut:    "/favicon-16x16.png",
    apple:       "/apple-touch-icon.png",
  },

  /* ── Verification (add your tokens) ── */
  // verification: {
  //   google: "GOOGLE_SITE_VERIFICATION_TOKEN",
  //   yandex: "YANDEX_TOKEN",
  // },

  /* ── Misc ── */
  category: "books",
};

/* ─────────────────────────────────────────────
   JSON-LD SCHEMA HELPERS
───────────────────────────────────────────────── */

/** 1. Organization — tells Google who you are */
const organizationSchema = {
  "@context":    "https://schema.org",
  "@type":       "Organization",
  name:          SITE_NAME,
  url:           SITE_URL,
  logo: {
    "@type":     "ImageObject",
    url:         `${SITE_URL}/images/logo/AGClassicLogo.png`,
    width:       300,
    height:      80,
  },
  description:
    "AG Classics curates timeless books and e-books across literature, business, philosophy, and self-development for intentional readers.",
  sameAs: [
    // Add your real social profiles:
    // "https://www.instagram.com/agclassics",
    // "https://twitter.com/agclassics",
    // "https://www.facebook.com/agclassics",
  ],
  contactPoint: {
    "@type":        "ContactPoint",
    contactType:    "customer service",
    availableLanguage: ["English", "Hindi"],
  },
};

/** 2. WebSite — enables Google Sitelinks search box */
const websiteSchema = {
  "@context":   "https://schema.org",
  "@type":      "WebSite",
  name:         SITE_NAME,
  url:          SITE_URL,
  description:  "Curated books and e-books for intentional readers.",
  potentialAction: {
    "@type":       "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/** 3. Bookstore — LocalBusiness / Store schema */
const bookstoreSchema = {
  "@context":   "https://schema.org",
  "@type":      ["BookStore", "OnlineStore"],
  name:         SITE_NAME,
  url:          SITE_URL,
  image:        OG_IMAGE,
  description:
    "AG Classics is a curated online bookstore offering timeless literature, business, philosophy, finance, and self-development books and e-books.",
  priceRange:   "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted:    "Credit Card, Debit Card, UPI, Net Banking",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name:    "AG Classics Book Collection",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Book", genre: "Business & Professional Skills" } },
      { "@type": "Offer", itemOffered: { "@type": "Book", genre: "Finance & Wealth" } },
      { "@type": "Offer", itemOffered: { "@type": "Book", genre: "Self Development" } },
      { "@type": "Offer", itemOffered: { "@type": "Book", genre: "Strategy & Philosophy" } },
      { "@type": "Offer", itemOffered: { "@type": "Book", genre: "Classic Literature" } },
    ],
  },
};

/** 4. ItemList — the hero collection carousel  */
const collectionSchema = {
  "@context": "https://schema.org",
  "@type":    "ItemList",
  name:       "The AG Classics Collection",
  description:
    "A curated selection of timeless literature and essential non-fiction chosen for intentional readers.",
  url:        SITE_URL,
  // Individual books are injected client-side; this gives Google the list concept.
};

/** 5. BreadcrumbList — home breadcrumb */
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type":    "BreadcrumbList",
  itemListElement: [
    {
      "@type":    "ListItem",
      position:   1,
      name:       "Home",
      item:       SITE_URL,
    },
  ],
};

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ── JSON-LD Schema Injection ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookstoreSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Client component with all the interactivity ── */}
      <MainBody />
    </>
  );
}