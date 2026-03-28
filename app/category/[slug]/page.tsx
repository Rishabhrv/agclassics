import type { Metadata } from "next";
import CategoryPage from "@/components/category/CategoryPage";
/* ═══════════════════════════════════════════════════════════════════
   ENV
═══════════════════════════════════════════════════════════════════ */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agclassics.agkit.in";
const API_URL   = process.env.NEXT_PUBLIC_API_URL  ?? "https://agclassics.agkit.in";
const SITE_NAME = "AG Classics";

/* ═══════════════════════════════════════════════════════════════════
   TYPES  (only what the server needs — keep in sync with client)
═══════════════════════════════════════════════════════════════════ */
interface CategoryMeta {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  product_count: number;
  description?: string | null;
  image?: string | null;
}

interface ProductMeta {
  id: number;
  title: string;
  slug: string;
  price: number;
  sell_price: number;
  main_image: string;
  rating: number;
  author_name?: string | null;
  review_count?: number;
}

/* ═══════════════════════════════════════════════════════════════════
   SERVER-SIDE DATA HELPERS
═══════════════════════════════════════════════════════════════════ */
async function fetchCategoryMeta(slug: string): Promise<CategoryMeta | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/ag-classics/viewcategory/counts`,
      { next: { revalidate: 3600 } }   // cache for 1 hour
    );
    if (!res.ok) return null;
    const data: CategoryMeta[] = await res.json();
    return data.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

async function fetchTopProducts(slug: string): Promise<ProductMeta[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/ag-classics/viewcategory/${slug}/products?page=1&limit=8&sort=latest`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}

function toTitleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ═══════════════════════════════════════════════════════════════════
   GENERATE METADATA  (runs on the server per-request / ISR)
═══════════════════════════════════════════════════════════════════ */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const cat  = await fetchCategoryMeta(slug);
  const name = cat?.name ?? toTitleCase(slug);
  const count = cat?.product_count ?? 0;

  const title = `${name} Books | Buy Classic ${name} Online | AG Classics`;
  const description =
    cat?.description ??
    `Explore our curated collection of ${count > 0 ? `${count} ` : ""}classic ${name} books at AG Classics. ` +
    `Available in paperback and eBook formats. Instant delivery, lifetime access.`;

  const ogImage = cat?.image
    ? `${API_URL}${cat.image}`
    : `${SITE_URL}/logo/AGClassicLogo.png`;   // ← fallback OG image

  return {
    /* ── Core ─────────────────────────────────────────── */
    title,
    description,

    /* ── Canonical ────────────────────────────────────── */
    alternates: {
      canonical: `${SITE_URL}/category/${slug }`,
    },

    /* ── Open Graph ───────────────────────────────────── */
    openGraph: {
      type:        "website",
      url:         `${SITE_URL}/category/${slug }`,
      siteName:    SITE_NAME,
      title:       `${name} Books | AG Classics`,
      description,
      images: [
        {
          url:    ogImage,
          width:  1200,
          height: 630,
          alt:    `${name} books collection | AG Classics`,
        },
      ],
      locale: "en_IN",
    },

    /* ── Twitter / X ──────────────────────────────────── */
    twitter: {
      card:        "summary_large_image",
      site:        "@agclassics",           // ← update your handle
      title:       `${name} Books | AG Classics`,
      description,
      images:      [ogImage],
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
      `${name.toLowerCase()} books`,
      `classic ${name.toLowerCase()} books india`,
      `buy ${name.toLowerCase()} books online`,
      `${name.toLowerCase()} ebooks`,
      `${name.toLowerCase()} literature`,
      `ag classics ${name.toLowerCase()}`,
      `best ${name.toLowerCase()} books`,
      `${name.toLowerCase()} novels india`,
    ],
  };
}

/* ═══════════════════════════════════════════════════════════════════
   JSON-LD SCHEMA BUILDER
═══════════════════════════════════════════════════════════════════ */
function buildSchemas(
  slug: string,
  cat: CategoryMeta | null,
  products: ProductMeta[]
) {
  const name    = cat?.name ?? toTitleCase(slug);
  const pageUrl = `${SITE_URL}/category/${slug}`;

  /* 1 ── CollectionPage */
  const schemaWebPage = {
    "@context": "https://schema.org",
    "@type":    "CollectionPage",
    "@id":      `${pageUrl}#webpage`,
    url:        pageUrl,
    name:       `${name} Books | AG Classics`,
    description:
      cat?.description ??
      `Curated classic ${name} books — paperback & eBook formats. Instant delivery, lifetime access.`,
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebSite",
      "@id":   `${SITE_URL}/#website`,
      url:     SITE_URL,
      name:    SITE_NAME,
    },
    ...(cat?.image && {
      primaryImageOfPage: {
        "@type":    "ImageObject",
        url:        `${API_URL}${cat.image}`,
        contentUrl: `${API_URL}${cat.image}`,
      },
    }),
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
        item:       `${SITE_URL}/category/${slug}`,
      },
      {
        "@type":    "ListItem",
        position:   3,
        name:       name,
        item:       pageUrl,
      },
    ],
  };

  /* 3 ── ItemList (top products with Product schema) */
  const schemaItemList = {
    "@context": "https://schema.org",
    "@type":    "ItemList",
    name:       `${name} Books Collection | AG Classics`,
    url:        pageUrl,
    numberOfItems: products.length,
    itemListElement: products.map((p, idx) => {
      const sell  = parseFloat(String(p.sell_price));
      const orig  = parseFloat(String(p.price));
      const hasD  = orig > sell;

      return {
        "@type":    "ListItem",
        position:   idx + 1,
        item: {
          "@type":       "Product",
          "@id":         `${SITE_URL}/product/${p.slug}#product`,
          name:          p.title,
          url:           `${SITE_URL}/product/${p.slug}`,
          description:   `${p.title}${p.author_name ? ` by ${p.author_name}` : ""} — Classic ${name} book available at AG Classics.`,
          sku:           `AGCL-${p.id}`,
          brand: {
            "@type": "Brand",
            name:    SITE_NAME,
          },
          ...(p.author_name && {
            author: { "@type": "Person", name: p.author_name },
          }),
          ...(p.main_image && {
            image: `${API_URL}${p.main_image}`,
          }),
          offers: {
            "@type":           "Offer",
            url:               `${SITE_URL}/product/${p.slug}`,
            priceCurrency:     "INR",
            price:             sell.toFixed(2),
            availability:      "https://schema.org/InStock",
            itemCondition:     "https://schema.org/NewCondition",
            priceValidUntil:   new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ).toISOString().split("T")[0],
            ...(hasD && {
              highPrice: orig.toFixed(2),
              lowPrice:  sell.toFixed(2),
            }),
          },
          ...(p.rating > 0 && (p.review_count ?? 0) > 0 && {
            aggregateRating: {
              "@type":       "AggregateRating",
              ratingValue:   p.rating.toFixed(1),
              ratingCount:   p.review_count,
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
      url:        `${SITE_URL}/logo/AGClassicLogo.png`,   // ← confirm path
      contentUrl: `${SITE_URL}/logo/AGClassicLogo.png`,
    },
  };

  return [schemaWebPage, schemaBreadcrumb, schemaItemList, schemaOrg];
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE  (Server Component)
═══════════════════════════════════════════════════════════════════ */
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [cat, products] = await Promise.all([
    fetchCategoryMeta(slug),
    fetchTopProducts(slug),
  ]);

  const schemas = buildSchemas(slug, cat, products);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <CategoryPage />
    </>
  );
}

