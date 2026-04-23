import type { Metadata } from "next";
import EbooksPage from "@/components/ebooks/EbookPage"; 

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
  // ⬇ Primary Keyword at the exact front
  title:       "Best Classic Books to Read | Buy Classic Literature Online | AG Classics",
  description:
    "Discover the best classic books to read at AG Classics. Buy timeless classic literature books online and build your digital library with India's premium eBook store.",

  /* ── Canonical ─────────────────────────────────────────────────── */
  alternates: {
    canonical: `${SITE_URL}/ebooks`,
  },

  /* ── Open Graph ────────────────────────────────────────────────── */
  openGraph: {
    type:        "website",
    url:         `${SITE_URL}/ebooks`,
    siteName:    SITE_NAME,
    title:       "Best Classic Books to Read | Buy Classic Literature Online | AG Classics",
    description:
      "Discover the best classic books to read at AG Classics. Buy timeless classic literature books online and build your digital library with India's premium eBook store.",
    images: [
      {
        url:    `${SITE_URL}/logo/AGClassicLogo.png`,
        width:  1200,
        height: 630,
        alt:    "AG Classics - Best Classic Books to Read",
      },
    ],
    locale: "en_IN",
  },

  /* ── Twitter / X ───────────────────────────────────────────────── */
  twitter: {
    card:        "summary_large_image",
    site:        "@agclassics", 
    title:       "Classic Books to Read | AG Classics eBook Store",
    description:
      "Find the best classic books to read. Instant access, lifetime access. Build your digital library of classic literature today.",
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
    "classic books to read",
    "classic literature books",
    "buy classic books online",
    "ebook store india",
    "ag classics ebooks",
    "timeless literature ebook",
    "premium ebooks india",
    "classic novels ebook",
    "fiction ebooks india",
    "english classics digital access"
  ],
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
  name:       "Best Classic Books to Read | AG Classics eBook Store",
  description:
    "Curated collection of the best classic books to read. Buy classic literature online from AG Classics, a dedicated eBook store in India.",
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
        url:          `${SITE_URL}/logo/AGClassicLogo.png`,
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
};

/** 4 ── ItemList  (genre category links) */
const schemaItemList = {
  "@context": "https://schema.org",
  "@type":    "ItemList",
  name:       "Classic Books to Read by Genre | AG Classics",
  url:        `${SITE_URL}/ebooks`,
  description:
    "Explore our curated collection of classic books to read, organised by genre.",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Business & Professional Skills", url: `${SITE_URL}/category/business-professional-skills` },
    { "@type": "ListItem", position: 2, name: "Classic Literature",   url: `${SITE_URL}/category/classic-literature` },
    { "@type": "ListItem", position: 3, name: "Finance & Wealth",       url: `${SITE_URL}/category/finance-wealth` },
    { "@type": "ListItem", position: 4, name: "Self Development",      url: `${SITE_URL}/category/self-development` },
    { "@type": "ListItem", position: 5, name: "Strategy & Philosophy",      url: `${SITE_URL}/category/strategy-philosophy` },
  ],
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
      urlTemplate:   `${SITE_URL}/search?q={search_term_string}`,
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
      {ALL_SCHEMAS.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <EbooksPage />
    </>
  );
}