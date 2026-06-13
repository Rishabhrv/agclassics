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
  const monthlyPlan = plans.find((p: any) => p.plan_key === "monthly");
  const startingPrice = monthlyPlan ? monthlyPlan.base_price : 99;

  return {
    // ⬇ Primary Keywords: "ebook subscription service", "classic literature"
    title: "Classic Literature eBook Subscription  | AG Classics",
    
    // ⬇ Secondary Keywords: "reading membership", "ebook access", "classic literature books", "digital library india"
    description: `Join our reading membership for unlimited ebook access to classic literature books. Explore the best digital library in India starting at ₹${startingPrice}/month.`,
    
    alternates: {
      canonical: `${SITE_URL}/subscriptions`,
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/subscriptions`,
      siteName: SITE_NAME,
      title: "Classic Literature eBook Subscription  | AG Classics",
      description: `Join our reading membership for unlimited ebook access to classic literature books. Explore the best digital library in India starting at ₹${startingPrice}/month.`,
      images: [
        {
          url: `${SITE_URL}/logo/AGClassicLogo.png`,
          width: 1200,
          height: 630,
          alt: "AG Classics — Classic Books Subscription",
        },
      ],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      site: "@agclassics",
      title: "Classic Books Subscription | AG Classics",
      description: `Get unlimited ebook access to classic literature. Join our digital library in India today.`,
      images: [`${SITE_URL}/logo/AGClassicLogo.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Your exact new keyword list
    keywords: [
      "ebook subscription service",
      "ebook subscription",
      "classic literature",
      "classic literature books",
      "affordable ebook reader",
      "classic books subscription",
      "reading membership",
      "ebook access",
      "digital library india",
      "e libraries in india",
      "e books online"
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
    name:       "Classic Literature eBook Subscription  | AG Classics",
    description:
      "Discover one of the top e libraries in India. Get your reading membership to read e books online with our fast and affordable ebook reader platform.",   inLanguage: "en-IN",
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

/* 3 ── Product (DYNAMIC OFFERS) */
  const schemaProduct = {
    "@context":   "https://schema.org",
    "@type":      "Product",
    "@id":        `${pageUrl}#product`,
    name:         "AG Classics Reading Membership — Classic Books Subscription",
    url:          pageUrl,
    description:
      "Your all-access ebook subscription. Dive into classic literature books with unlimited ebook access. Read seamlessly across all devices.",
    brand: {
      "@type": "Brand",
      name:    SITE_NAME,
    },
    image: `${SITE_URL}/logo/AGClassicLogo.png`,
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