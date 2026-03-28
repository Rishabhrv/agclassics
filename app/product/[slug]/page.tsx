import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductPage from "@/components/product/SingleProductPage";

const API_URL  = process.env.NEXT_PUBLIC_API_URL!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

// ─── Fetch product (reused in both functions) ─────────────────────────────────
// ─── Fetch product ─────────────────────────────────
async function getProduct(slug: string) {
  const res = await fetch(`${API_URL}/api/ag-classics/${slug}`, {
    cache: "no-store",
  });
  
  if (!res.ok) return null;
  
  const data = await res.json();
  
  // Return the nested product object, or null if it doesn't exist
  return data.product || null; 
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product  = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "",
    };
  }

  // 1️⃣ Try seo_meta table first (product-specific override)
  const seoRes = await fetch(
    `${API_URL}/api/seo/product/${product.id}`,
    { cache: "no-store" }
  );

  let metaTitle       = "";
  let metaDescription = "";
  let metaKeywords    = "";

  if (seoRes.ok) {
    const seo = await seoRes.json();
    metaTitle       = seo?.meta_title       || "";
    metaDescription = seo?.meta_description || "";
    metaKeywords    = seo?.keywords         || "";
  }

  // 2️⃣ Fallback: auto-generate from product data
  if (!metaTitle) {
    const authorLine = product.authors?.length
      ? ` by ${product.authors.map((a: any) => a.name).join(", ")}`
      : "";
    metaTitle = `${product.title}${authorLine} | AG Classics`;
  }

  if (!metaDescription) {
    // strip HTML tags and trim to 160 chars
    const plain = product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    metaDescription = plain.length > 160 ? plain.slice(0, 157) + "..." : plain;
  }

  if (!metaKeywords) {
    // auto keywords: title words + author names + category names
    const titleWords   = product.title.split(" ").slice(0, 5).join(", ");
    const authorNames  = product.authors?.map((a: any) => a.name).join(", ") || "";
    const categoryNames = product.categories?.map((c: any) => c.name).join(", ") || "";
    metaKeywords = [titleWords, authorNames, categoryNames]
      .filter(Boolean)
      .join(", ");
  }

  const productUrl = `${SITE_URL}/product/${slug}`;
  const imageUrl   = `${API_URL}${product.main_image}`;

  return {
    title:       metaTitle,
    description: metaDescription,
    keywords:    metaKeywords,

    // ── Open Graph (Facebook / WhatsApp previews) ──────────────────────────
    openGraph: {
      title:       metaTitle,
      description: metaDescription,
      url:         productUrl,
      siteName:    "AG Classics",
      type:        "website",
      images: [
        {
          url:    imageUrl,
          width:  800,
          height: 600,
          alt:    product.title,
        },
      ],
    },

    // ── Twitter Card ───────────────────────────────────────────────────────
    twitter: {
      card:        "summary_large_image",
      title:       metaTitle,
      description: metaDescription,
      images:      [imageUrl],
    },

    // ── Canonical URL ──────────────────────────────────────────────────────
    alternates: {
      canonical: productUrl,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function SingleProductMainBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug }  = await params;
  const product   = await getProduct(slug);

  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type":    "Product",
    "@id":      `${SITE_URL}/product/${slug}#product`,
    name:       product.title,
    image: [
      `${API_URL}${product.main_image}`,
      ...product.gallery.map((g: any) => `${API_URL}${g.image_path}`),
    ],
    description: product.description.replace(/<[^>]+>/g, ""),
    sku:         product.id.toString(),
    brand: {
      "@type": "Brand",
      name:    "AG Classics",
    },
    ...(product.authors?.length > 0 && {
      author: product.authors.map((a: any) => ({
        "@type": "Person",
        name:    a.name,
      })),
    }),
    offers: {
      "@type":         "Offer",
      url:             `${SITE_URL}/product/${slug}`,
      priceCurrency:   "INR",
      price:           product.sell_price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:   "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductPage product={product} />
    </>
  );
}