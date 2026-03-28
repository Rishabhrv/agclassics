import type { Metadata } from "next";
import BestSellersPage from "@/components/bestseller/BestSellerPage";
/* ═══════════════════════════════════════════════════════════════════
   ENV
═══════════════════════════════════════════════════════════════════ */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agclassics.agkit.in";
const API_URL   = process.env.NEXT_PUBLIC_API_URL  ?? "";
const SITE_NAME = "AG Classics";

/* ═══════════════════════════════════════════════════════════════════
   SERVER-SIDE DATA  (top 8 books for schema — ISR cached)
═══════════════════════════════════════════════════════════════════ */
interface BookMeta {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  main_image: string;
  stock: number;
  avg_rating: number | null;
  review_count: number;
  authors: { id: number; name: string; slug: string }[];
}

async function fetchTopBestsellers(): Promise<BookMeta[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/ag-classics/bestseller?sort=bestseller&limit=8`,
      { next: { revalidate: 3600 } }   // re-fetch at most once per hour
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? (data.products ?? []) : [];
  } catch {
    return [];
  }
}

const calcDisc = (p: number, s: number) =>
  p > 0 ? Math.round(((p - s) / p) * 100) : 0;

/* ═══════════════════════════════════════════════════════════════════
   STATIC METADATA
═══════════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  /* ── Core ─────────────────────────────────────────── */
  title:       "Bestselling Classic Books | AG Classics",
  description:
    "Discover the most-loved classic books at AG Classics — ranked by readers, " +
    "verified by sales. Paperback & eBook formats. Instant delivery, lifetime access.",

  /* ── Canonical ────────────────────────────────────── */
  alternates: {
    canonical: `${SITE_URL}/bestseller`,
  },

  /* ── Open Graph ───────────────────────────────────── */
  openGraph: {
    type:        "website",
    url:         `${SITE_URL}/bestseller`,
    siteName:    SITE_NAME,
    title:       "Bestselling Classic Books | AG Classics",
    description:
      "Reader-ranked. Sales-verified. The most-loved classics in one place — " +
      "available in paperback and eBook.",
    images: [
      {
        url:    `${SITE_URL}/logo/AGClassicLogo.png`, // ← place a 1200×630 image here
        width:  1200,
        height: 630,
        alt:    "AG Classics Bestsellers | AG Classics",
      },
    ],
    locale: "en_IN",
  },

  /* ── Twitter / X ──────────────────────────────────── */
  twitter: {
    card:        "summary_large_image",
    site:        "@agclassics",              // ← update your handle
    title:       "Bestselling Classic Books | AG Classics",
    description:
      "Reader-ranked. Sales-verified. The most-loved classics all in one place.",
    images:      [`${SITE_URL}/logo/AGClassicLogo.png`],
  },

  /* ── Robots ───────────────────────────────────────── */
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

  /* ── Keywords ─────────────────────────────────────── */
  keywords: [
    "bestselling classic books india",
    "most popular classic books",
    "top rated classic books online",
    "best classic novels to buy",
    "ag classics bestsellers",
    "classic literature bestsellers india",
    "buy bestseller books online india",
    "top classic ebooks",
    "ranked classic books",
    "best books to read classics",
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   JSON-LD SCHEMA BUILDER
═══════════════════════════════════════════════════════════════════ */
function buildSchemas(books: BookMeta[]) {
  const pageUrl = `${SITE_URL}/bestseller`;

  /* 1 ── CollectionPage */
  const schemaWebPage = {
    "@context": "https://schema.org",
    "@type":    "CollectionPage",
    "@id":      `${pageUrl}#webpage`,
    url:        pageUrl,
    name:       "Bestselling Classic Books | AG Classics",
    description:
      "Reader-ranked bestselling classic books — paperback & eBook formats. " +
      "Instant delivery, lifetime access.",
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
          "@type":    "ImageObject",
          url:        `${SITE_URL}/logo/AGClassicLogo.png`,   // ← confirm path
          contentUrl: `${SITE_URL}/logo/AGClassicLogo.png`,
        },
      },
    },
    primaryImageOfPage: {
      "@type":    "ImageObject",
      url:        `${SITE_URL}/logo/AGClassicLogo.png`,
      contentUrl: `${SITE_URL}/logo/AGClassicLogo.png`,
    },
  };

  /* 2 ── BreadcrumbList */
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
        name:       "AG Classics",
        item:       `${SITE_URL}/`,
      },
      {
        "@type":    "ListItem",
        position:   3,
        name:       "Bestsellers",
        item:       pageUrl,
      },
    ],
  };

  /* 3 ── ItemList  (top 8 ranked products as Product) */
  const schemaItemList = {
    "@context":    "https://schema.org",
    "@type":       "ItemList",
    name:          "Bestselling Classic Books | AG Classics",
    url:           pageUrl,
    description:   "The most-loved classics ranked by reader votes and sales velocity.",
    numberOfItems: books.length,
    itemListElement: books.map((book, idx) => {
      const sell = parseFloat(String(book.sell_price));
      const orig = parseFloat(String(book.price));
      const disc = calcDisc(orig, sell);

      return {
        "@type":    "ListItem",
        position:   idx + 1,
        item: {
          "@type":       "Product",
          "@id":         `${SITE_URL}/product/${book.slug}#product`,
          name:          book.title,
          url:           `${SITE_URL}/product/${book.slug}`,
          description:
            `${book.title}${book.authors?.[0] ? ` by ${book.authors[0].name}` : ""} — ` +
            `A bestselling classic available at AG Classics.`,
          sku:           `AGCL-${book.id}`,
          brand: {
            "@type": "Brand",
            name:    SITE_NAME,
          },
          ...(book.authors?.[0] && {
            author: {
              "@type": "Person",
              name:    book.authors[0].name,
              url:     `${SITE_URL}/author/${book.authors[0].slug}`,
            },
          }),
          ...(book.main_image && {
            image: `${API_URL}${book.main_image}`,
          }),
          offers: {
            "@type":         "Offer",
            url:             `${SITE_URL}/product/${book.slug}`,
            priceCurrency:   "INR",
            price:           sell.toFixed(2),
            availability:
              book.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition:   "https://schema.org/NewCondition",
            priceValidUntil: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ).toISOString().split("T")[0],
            ...(disc > 0 && {
              highPrice: orig.toFixed(2),
              lowPrice:  sell.toFixed(2),
            }),
          },
          ...(book.avg_rating !== null && book.review_count > 0 && {
            aggregateRating: {
              "@type":       "AggregateRating",
              ratingValue:   book.avg_rating.toFixed(1),
              ratingCount:   book.review_count,
              bestRating:    "5",
              worstRating:   "1",
            },
          }),
        },
      };
    }),
  };

  /* 4 ── Organization */
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
      // "https://www.instagram.com/agclassics",
      // "https://twitter.com/agclassics",
    ],
  };

  /* 5 ── FAQPage  (common bestseller page questions — boosts rich results) */
  const schemaFaq = {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: [
      {
        "@type":    "Question",
        name:       "How are the bestsellers ranked at AG Classics?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Our bestseller rankings are determined by a combination of total sales volume, " +
            "reader ratings, and review counts — updated regularly to reflect the most " +
            "loved titles in our catalogue.",
        },
      },
      {
        "@type":    "Question",
        name:       "Are bestseller books available as eBooks?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Most bestsellers at AG Classics are available in both paperback and eBook " +
            "formats. eBooks are delivered instantly after purchase and are accessible on " +
            "any device for life.",
        },
      },
      {
        "@type":    "Question",
        name:       "Can I get a discount on bestselling books?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Many titles in our bestseller list are offered at discounted prices. " +
            "The current selling price and any applicable discount are shown clearly " +
            "on each book's listing.",
        },
      },
    ],
  };

  return [schemaWebPage, schemaBreadcrumb, schemaItemList, schemaOrg, schemaFaq];
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE  (Server Component)
═══════════════════════════════════════════════════════════════════ */
export default async function Page() {
  // Fetch top books server-side for schema only (ISR cached)
  const books   = await fetchTopBestsellers();
  const schemas = buildSchemas(books);

  return (
    <>
      {/* Inject all JSON-LD schemas */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Your full "use client" bestsellers UI */}
      <BestSellersPage />
    </>
  );
}