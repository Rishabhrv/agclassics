import type { Metadata } from "next";
import SubscriptionPage from "@/components/subscription/SubscriptionPage"; // <-- Adjust this path if needed

/* ═══════════════════════════════════════════════════════════════════
   ENV
═══════════════════════════════════════════════════════════════════ */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "/";
const SITE_NAME = "AG Classics";
const API_URL   = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ═══════════════════════════════════════════════════════════════════
   DATA FETCHING (Runs on the Server)
═══════════════════════════════════════════════════════════════════ */
async function getPlans() {
  try {
    // We add a revalidate cache (e.g., 3600s = 1 hour) so we don't hammer your 
    // database on every single page load for SEO bots.
    const res = await fetch(`${API_URL}/api/subscriptions/subscription-plans`, {
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((p: any) => p.status === 'active');
  } catch (error) {
    console.error("Failed to fetch plans for SEO:", error);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════
   DYNAMIC METADATA
═══════════════════════════════════════════════════════════════════ */
export async function generateMetadata(): Promise<Metadata> {
  const plans = await getPlans();
  
  // Find the monthly price to make the description dynamic, fallback to 399
  const monthlyPlan = plans.find((p: any) => p.plan_key === "monthly");
  const startingPrice = monthlyPlan ? monthlyPlan.base_price : 399;

  return {
    title: "Read Every Classic, Anytime eBook Plans | AG Classics",
    description:
      `Your all-access pass to the world's greatest literature. Plans start at just ₹${startingPrice}/month. No ads. No limits. Just great books.`,
    alternates: {
      canonical: `${SITE_URL}/subscriptions`,
    },
    openGraph: {
      type:     "website",
      url:      `${SITE_URL}/subscriptions`,
      siteName: SITE_NAME,
      title:    "Read Every Classic, Anytime eBook Plans | AG Classics",
      description:
        `Dive into the world's greatest classic literature — unlimited eBooks, zero ads, any device. Plans start at just ₹${startingPrice}/month. Cancel whenever you like.`,
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
    twitter: {
      card:        "summary_large_image",
      site:        "@agclassics",
      title:       "Your All-Access eBook Pass | AG Classics",
      description:
        `Classics without limits read the world's greatest books. Ad-free. Device-friendly. Cancel anytime.`,
      images: [`${SITE_URL}/logo/AGClassicLogo.png`],
    },
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
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE (Server Component)
═══════════════════════════════════════════════════════════════════ */
export default async function Page() {
  const plans = await getPlans();
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
      "world's greatest literature.",
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

  /* 3 ── Product (DYNAMIC OFFERS) */
  const dynamicOffers = plans.map((plan: any) => ({
    "@type":         "Offer",
    "@id":           `${pageUrl}#offer-${plan.plan_key}`,
    name:            plan.title,
    description:     plan.description,
    url:             `${SITE_URL}/subscriptions/payment?plan=${plan.plan_key}`,
    priceCurrency:   "INR",
    price:           plan.base_price.toString(),
    availability:    "https://schema.org/InStock",
    itemCondition:   "https://schema.org/NewCondition",
  }));

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
    // Inject the dynamically fetched plans into the schema
    offers: dynamicOffers, 
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
          text: "No. AG Classics is a 100% digital platform — we sell eBooks only."
        },
      },
      {
        "@type": "Question",
        name:    "Which devices can I use to read AG Classics eBooks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AG Classics works on any internet-connected device: Android, iPhone, tablet, or laptop/desktop browser."
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