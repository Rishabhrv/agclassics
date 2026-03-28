import type { Metadata } from "next";
import SubscriptionPage from "@/components/subscription/SubscriptionPage";
/* ═══════════════════════════════════════════════════════════════════
   ENV
═══════════════════════════════════════════════════════════════════ */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agclassics.agkit.in/";
const SITE_NAME = "AG Classics";

/* ═══════════════════════════════════════════════════════════════════
   STATIC METADATA
═══════════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  /* ── Core ─────────────────────────────────────────── */
  title:       "Unlimited eBook Subscription Plans | AG Classics",
  description:
    "Subscribe to AG Classics and get unlimited access to our entire eBook library. " +
    "Monthly at ₹399, 3-month at ₹999, or annual at ₹3,599. No ads. Cancel anytime.",

  /* ── Canonical ────────────────────────────────────── */
  alternates: {
    canonical: `${SITE_URL}/subscriptions`,
  },

  /* ── Open Graph ───────────────────────────────────── */
  openGraph: {
    type:        "website",
    url:         `${SITE_URL}/subscriptions`,
    siteName:    SITE_NAME,
    title:       "Unlimited eBook Subscription | AG Classics",
    description:
      "One subscription. Every classic. Starting at ₹399/month — read unlimited eBooks " +
      "on any device with no ads and no limits.",
    images: [
      {
        url:    `${SITE_URL}/logo/AGClassicLogo.png`, // ← place a 1200×630 image here
        width:  1200,
        height: 630,
        alt:    "AG Classics Subscription — Unlimited eBook Reading Pass",
      },
    ],
    locale: "en_IN",
  },

  /* ── Twitter / X ──────────────────────────────────── */
  twitter: {
    card:        "summary_large_image",
    site:        "@agclassics",              // ← update your handle
    title:       "Unlimited eBook Subscription | AG Classics",
    description:
      "Read unlimited classic eBooks starting at ₹399/month. No ads. Cancel anytime.",
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
    "ebook subscription india",
    "unlimited ebook reading india",
    "classic book subscription plan",
    "ag classics subscription",
    "monthly ebook plan india",
    "annual ebook subscription",
    "read unlimited books online india",
    "digital library subscription india",
    "cheap ebook subscription india",
    "classic literature subscription",
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
  name:       "Unlimited eBook Subscription Plans — AG Classics Pass",
  description:
    "Subscribe for unlimited access to AG Classics' entire eBook library. " +
    "Monthly, quarterly, and annual plans available.",
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

/* 3 ── Product  (the subscription itself — all three offers in one product) */
const schemaProduct = {
  "@context":   "https://schema.org",
  "@type":      "Product",
  "@id":        `${pageUrl}#product`,
  name:         "AG Classics Pass | Unlimited eBook Subscription",
  url:          pageUrl,
  description:
    "Unlimited access to the entire AG Classics eBook library. " +
    "Read on any device, no ads, cancel anytime.",
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
      description:     "Unlimited eBook access — billed monthly. Cancel anytime.",
      url:             `${SITE_URL}/subscriptions/payment?plan=monthly`,
      priceCurrency:   "INR",
      price:           "399.00",
      availability:    "https://schema.org/InStock",
      itemCondition:   "https://schema.org/NewCondition",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split("T")[0],
      eligibleQuantity: {
        "@type":    "QuantitativeValue",
        unitText:   "month",
        value:      1,
      },
    },
    /* ── Quarterly ── */
    {
      "@type":         "Offer",
      "@id":           `${pageUrl}#offer-quarterly`,
      name:            "3-Month Plan",
      description:     "Unlimited eBook access for 3 months. Save ₹198 vs monthly.",
      url:             `${SITE_URL}/subscriptions/payment?plan=quarterly`,
      priceCurrency:   "INR",
      price:           "999.00",
      availability:    "https://schema.org/InStock",
      itemCondition:   "https://schema.org/NewCondition",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split("T")[0],
      eligibleQuantity: {
        "@type":    "QuantitativeValue",
        unitText:   "month",
        value:      3,
      },
    },
    /* ── Annual ── */
    {
      "@type":         "Offer",
      "@id":           `${pageUrl}#offer-annual`,
      name:            "Annual Plan",
      description:     "Unlimited eBook access for 12 months. Save ₹1,189 vs monthly.",
      url:             `${SITE_URL}/subscriptions/payment?plan=yearly`,
      priceCurrency:   "INR",
      price:           "3599.00",
      availability:    "https://schema.org/InStock",
      itemCondition:   "https://schema.org/NewCondition",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split("T")[0],
      eligibleQuantity: {
        "@type":    "QuantitativeValue",
        unitText:   "month",
        value:      12,
      },
    },
  ],
};

/* 4 ── FAQPage  (pulls directly from your existing FAQ items) */
const schemaFaq = {
  "@context": "https://schema.org",
  "@type":    "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name:    "Does the AG Classics subscription include paperback books?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "No. The subscription is only for digital eBooks. " +
          "Paperback books are sold separately.",
      },
    },
    {
      "@type": "Question",
      name:    "Can I cancel my AG Classics subscription anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. You can cancel your subscription at any time from your account settings " +
          "with no cancellation fees.",
      },
    },
    {
      "@type": "Question",
      name:    "How much does the annual eBook subscription cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The annual plan is priced at ₹3,599 for 12 months, compared to ₹4,788 if " +
          "you paid monthly — saving you ₹1,189 (approximately 25% off).",
      },
    },
    {
      "@type": "Question",
      name:    "What is included in the 3-month subscription plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The 3-month plan costs ₹999 and gives you full access to the entire AG Classics " +
          "eBook library on all devices, saving ₹198 compared to three individual monthly payments.",
      },
    },
    {
      "@type": "Question",
      name:    "On which devices can I read AG Classics eBooks?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "You can read on any device — smartphone, tablet, or laptop. " +
          "Your library syncs automatically across all your devices.",
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