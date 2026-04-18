import type { Metadata } from "next";
import SubscriptionPage from "@/components/subscription/SubscriptionPage";

/* ═══════════════════════════════════════════════════════════════════
   ENV
═══════════════════════════════════════════════════════════════════ */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "/";
const SITE_NAME = "AG Classics";

/* ═══════════════════════════════════════════════════════════════════
   STATIC METADATA
═══════════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  /* ── Core ─────────────────────────────────────────── */
  title: "Read Every Classic, Anytime eBook Plans | AG Classics",
  description:
    "Your all-access pass to the world's greatest literature. " +
    "Choose a plan that fits you monthly at ₹399, quarterly at ₹999, or yearly at ₹3,599. " +
    "No ads. No limits. Just great books.",

  /* ── Canonical ────────────────────────────────────── */
  alternates: {
    canonical: `${SITE_URL}/subscriptions`,
  },

  /* ── Open Graph ───────────────────────────────────── */
  openGraph: {
    type:     "website",
    url:      `${SITE_URL}/subscriptions`,
    siteName: SITE_NAME,
    title:    "Read Every Classic, Anytime eBook Plans | AG Classics",
    description:
      "Dive into the world's greatest classic literature — unlimited eBooks, zero ads, " +
      "any device. Plans start at just ₹399/month. Cancel whenever you like.",
    images: [
      {
        url:    `${SITE_URL}/logo/AGClassicLogo.png`,
        width:  1200,
        height: 630,
        alt:    "AG Classics — Your All-Access eBook Reading Pass",
      },
    ],
    locale: "en_IN",
  },

  /* ── Twitter / X ──────────────────────────────────── */
  twitter: {
    card:        "summary_large_image",
    site:        "@agclassics",
    title:       "Your All-Access eBook Pass | AG Classics",
    description:
      "Classics without limits read the world's greatest books from ₹399/month. " +
      "Ad-free. Device-friendly. Cancel anytime.",
    images: [`${SITE_URL}/logo/AGClassicLogo.png`],
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
    "classic ebook subscription india",
    "best ebook subscription plan india",
    "unlimited classic literature online india",
    "ag classics reading pass",
    "affordable ebook plan india",
    "digital classic books subscription",
    "online reading membership india",
    "monthly ebook access india",
    "yearly ebook subscription india",
    "classic novels online india",
    "read great books online india",
    "ebook library membership india",
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   JSON-LD SCHEMAS
═══════════════════════════════════════════════════════════════════ */
const pageUrl = `${SITE_URL}/subscriptions`;

/* 1 ── WebPage */
const schemaWebPage = {
  "@context": "https://schema.org",
  "@type":    "WebPage",
  "@id":      `${pageUrl}#webpage`,
  url:        pageUrl,
  name:       "Read Every Classic, Anytime — eBook Plans | AG Classics",
  description:
    "Explore AG Classics' flexible subscription plans and get unlimited access to the " +
    "world's greatest literature. Monthly, quarterly, and annual options available.",
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
        url:        `${SITE_URL}/logo.png`,
        contentUrl: `${SITE_URL}/logo.png`,
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
    { "@type": "ListItem", position: 1, name: "Home",          item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Subscriptions", item: pageUrl  },
  ],
};

/* 3 ── Product */
const schemaProduct = {
  "@context":   "https://schema.org",
  "@type":      "Product",
  "@id":        `${pageUrl}#product`,
  name:         "AG Classics Pass — Unlimited Classic eBook Access",
  url:          pageUrl,
  description:
    "One subscription. Every classic. Read ad-free on any device — smartphone, tablet, " +
    "or laptop. Your entire library syncs automatically across all screens.",
  brand: {
    "@type": "Brand",
    name:    SITE_NAME,
  },
  image: `${SITE_URL}/logo/AGClassicLogo.png`,
  offers: [
    /* ── Monthly ── */
    {
      "@type":         "Offer",
      "@id":           `${pageUrl}#offer-monthly`,
      name:            "Monthly Plan",
      description:
        "Full, unlimited eBook access billed each month. " +
        "Perfect for readers who want flexibility — pause or cancel anytime.",
      url:             `${SITE_URL}/subscriptions/payment?plan=monthly`,
      priceCurrency:   "INR",
      price:           "399.00",
      availability:    "https://schema.org/InStock",
      itemCondition:   "https://schema.org/NewCondition",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split("T")[0],
      eligibleQuantity: {
        "@type":  "QuantitativeValue",
        unitText: "month",
        value:    1,
      },
    },
    /* ── Quarterly ── */
    {
      "@type":         "Offer",
      "@id":           `${pageUrl}#offer-quarterly`,
      name:            "3-Month Plan",
      description:
        "Three months of unlimited classic eBook reading for ₹999. " +
        "Save ₹198 compared to three separate monthly payments.",
      url:             `${SITE_URL}/subscriptions/payment?plan=quarterly`,
      priceCurrency:   "INR",
      price:           "999.00",
      availability:    "https://schema.org/InStock",
      itemCondition:   "https://schema.org/NewCondition",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split("T")[0],
      eligibleQuantity: {
        "@type":  "QuantitativeValue",
        unitText: "month",
        value:    3,
      },
    },
    /* ── Annual ── */
    {
      "@type":         "Offer",
      "@id":           `${pageUrl}#offer-annual`,
      name:            "Annual Plan",
      description:
        "A full year of unlimited classic eBook access for ₹3,599. " +
        "Our best value — save ₹1,189 (roughly 25%) compared to paying monthly.",
      url:             `${SITE_URL}/subscriptions/payment?plan=yearly`,
      priceCurrency:   "INR",
      price:           "3599.00",
      availability:    "https://schema.org/InStock",
      itemCondition:   "https://schema.org/NewCondition",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split("T")[0],
      eligibleQuantity: {
        "@type":  "QuantitativeValue",
        unitText: "month",
        value:    12,
      },
    },
  ],
};

/* 4 ── FAQPage */
const schemaFaq = {
  "@context": "https://schema.org",
  "@type":    "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name:    "Does AG Classics sell physical or printed books?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "No. AG Classics is a 100% digital platform — we sell eBooks only. " +
          "All titles are available exclusively in digital format and can be read " +
          "on any internet-connected device.",
      },
    },
    {
      "@type": "Question",
      name:    "What is the price of the annual AG Classics subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The annual plan is priced at ₹3,599 for 12 months of unlimited access. " +
          "Compared to paying ₹399 every month (₹4,788 per year), you save ₹1,189 — " +
          "roughly 25% off.",
      },
    },
    {
      "@type": "Question",
      name:    "What do I get with the 3-month subscription plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The 3-month plan gives you complete, unlimited access to the entire AG Classics " +
          "eBook library for 90 days at ₹999. That's a saving of ₹198 over three individual " +
          "monthly payments, and everything syncs across all your devices automatically.",
      },
    },
    {
      "@type": "Question",
      name:    "Which devices can I use to read AG Classics eBooks?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "AG Classics works on any internet-connected device Android or iPhone, tablet, " +
          "or laptop/desktop browser. Your reading progress and library sync automatically, " +
          "so you can pick up exactly where you left off on any screen.",
      },
    },

  ],
};

/* 5 ── Organization */
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

const ALL_SCHEMAS = [
  schemaWebPage,
  schemaBreadcrumb,
  schemaProduct,
  schemaFaq,
  schemaOrg,
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

      <SubscriptionPage />
    </>
  );
}