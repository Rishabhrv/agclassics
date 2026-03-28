import type { Metadata } from "next";
import EbooksPage from "@/components/ebooks/EbookPage"; // your "use client" component

/* ═══════════════════════════════════════════════════════════════════
   ENV
═══════════════════════════════════════════════════════════════════ */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? "";
const SITE_NAME = "AG Classics";

/* ═══════════════════════════════════════════════════════════════════
   METADATA  (Next.js picks this up automatically — server only)
═══════════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  /* ── Core ──────────────────────────────────────────────────────── */
  title:       "Buy Classic eBooks Online | Timeless Literature",
  description:
    "Build your digital library with premium classic eBooks from AG Classics. " +
    "Instant download, lifetime access, beautifully typeset — browse by genre today.",

  /* ── Canonical ─────────────────────────────────────────────────── */
  alternates: {
    canonical: `${SITE_URL}/ebooks`,
  },

  /* ── Open Graph ────────────────────────────────────────────────── */
  openGraph: {
    type:        "website",
    url:         `${SITE_URL}/ebooks`,
    siteName:    SITE_NAME,
    title:       "Buy Classic eBooks Online | AG Classics",
    description:
      "Download timeless classics instantly. Works on every device. " +
      "Professionally typeset, lifetime ownership — starting at ₹99.",
    images: [
      {
        url:    `${SITE_URL}/logo/AGClassicLogo.png`, // ← place a 1200×630 image here
        width:  1200,
        height: 630,
        alt:    "AG Classics eBook collection",
      },
    ],
    locale: "en_IN",
  },

  /* ── Twitter / X ───────────────────────────────────────────────── */
  twitter: {
    card:        "summary_large_image",
    site:        "@agclassics",              // ← update to your handle
    title:       "Classic eBooks | AG Classics",
    description:
      "Instant download. Lifetime access. Professionally typeset classics on every device.",
    images: [`${SITE_URL}/logo/AGClassicLogo.png`],
  },

  /* ── Robots ────────────────────────────────────────────────────── */
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  /* ── Keywords ──────────────────────────────────────────────────── */
  keywords: [
    "classic ebooks india",
    "buy classic books online india",
    "timeless literature ebook",
    "english classics digital download",
    "ebook store india",
    "ag classics ebooks",
    "premium ebooks india",
    "classic novels ebook",
    "fiction ebooks india",
    "best classic literature ebook",
  ],

  /* ── Google Search Console (uncomment after adding token) ──────── */
  // verification: { google: "YOUR_TOKEN_HERE" },
};

/* ═══════════════════════════════════════════════════════════════════
   JSON-LD SCHEMAS  (static — does not need live book data)
═══════════════════════════════════════════════════════════════════ */

/** 1 ── CollectionPage */
const schemaWebPage = {
  "@context": "https://schema.org",
  "@type":    "CollectionPage",
  "@id":      `${SITE_URL}/ebooks#webpage`,
  url:        `${SITE_URL}/ebooks`,
  name:       "Classic eBooks | AG Classics",
  description:
    "Browse and instantly download premium classic eBooks. " +
    "Timeless literature, professionally typeset, lifetime access.",
  inLanguage: "en-IN",
  isPartOf: {
    "@type":  "WebSite",
    "@id":    `${SITE_URL}/#website`,
    url:      SITE_URL,
    name:     SITE_NAME,
    publisher: {
      "@type": "Organization",
      "@id":   `${SITE_URL}/#organization`,
      name:    SITE_NAME,
      url:     SITE_URL,
      logo: {
        "@type":      "ImageObject",
        url:          `${SITE_URL}/logo/AGClassicLogo.png`,   // ← update if needed
        contentUrl:   `${SITE_URL}/logo/AGClassicLogo.png`,
      },
    },
  },
  primaryImageOfPage: {
    "@type":    "ImageObject",
    url:        `${SITE_URL}/logo/AGClassicLogo.png`,
    contentUrl: `${SITE_URL}/logo/AGClassicLogo.png`,
  },
};

/** 2 ── BreadcrumbList */
const schemaBreadcrumb = {
  "@context": "https://schema.org",
  "@type":    "BreadcrumbList",
  itemListElement: [
    {
      "@type":    "ListItem",
      position:   1,
      name:       "Home",
      item:       SITE_URL,
    },
    {
      "@type":    "ListItem",
      position:   2,
      name:       "eBooks",
      item:       `${SITE_URL}/ebooks`,
    },
  ],
};

/** 3 ── Organization  */
const schemaOrg = {
  "@context": "https://schema.org",
  "@type":    "Organization",
  "@id":      `${SITE_URL}/#organization`,
  name:       SITE_NAME,
  url:        SITE_URL,
  logo: {
    "@type":    "ImageObject",
    url:        `${SITE_URL}/logo/AGClassicLogo.png`,
    contentUrl: `${SITE_URL}/logo/AGClassicLogo.png`,
  },
  sameAs: [
    // "https://www.instagram.com/agclassics",  ← add your social URLs
    // "https://twitter.com/agclassics",
  ],
};

/** 4 ── ItemList  (genre category links — static, no API call needed) */
const schemaItemList = {
  "@context": "https://schema.org",
  "@type":    "ItemList",
  name:       "Classic eBook Genres | AG Classics",
  url:        `${SITE_URL}/ebooks`,
  description:
    "Explore our curated collection of classic eBooks organised by genre.",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Business & Professional Skills",      url: `${SITE_URL}/category/business-professional-skills` },
    { "@type": "ListItem", position: 2, name: "Classic Literature",   url: `${SITE_URL}/category/classic-literature` },
    { "@type": "ListItem", position: 3, name: "Finance & Wealth",       url: `${SITE_URL}/category/finance-wealth` },
    { "@type": "ListItem", position: 4, name: "Self Development",      url: `${SITE_URL}/category/self-development` },
    { "@type": "ListItem", position: 5, name: "Strategy & Philosophy",      url: `${SITE_URL}category/strategy-philosophy` },
  ],
  // ↑ Replace / extend these entries to match your actual category slugs
};

/** 5 ── SiteLinksSearchBox */
const schemaSearchBox = {
  "@context":       "https://schema.org",
  "@type":          "WebSite",
  "@id":            `${SITE_URL}/#website`,
  url:              SITE_URL,
  name:             SITE_NAME,
  potentialAction: {
    "@type":       "SearchAction",
    target: {
      "@type":       "EntryPoint",
      urlTemplate:   `${SITE_URL}/search?q={search_term_string}`, // ← update to your search URL
    },
    "query-input": "required name=search_term_string",
  },
};

const ALL_SCHEMAS = [
  schemaWebPage,
  schemaBreadcrumb,
  schemaOrg,
  schemaItemList,
  schemaSearchBox,
];

/* ═══════════════════════════════════════════════════════════════════
   PAGE  (Server Component)
═══════════════════════════════════════════════════════════════════ */
export default function Page() {
  return (
    <>
      {/* Inject all JSON-LD schemas into <head> via Next.js script rendering */}
      {ALL_SCHEMAS.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Your full "use client" ebooks UI */}
      <EbooksPage />
    </>
  );
}