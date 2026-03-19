import type { Metadata } from "next";
import AuthorPage from "@/components/authors/AuthorPage";

const API_URL  = process.env.NEXT_PUBLIC_API_URL!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

type Props = {
  params: Promise<{ slug: string }>;
};

/* ─────────────────────────────
   Data helper
───────────────────────────── */
async function getAuthor(slug: string) {
  try {
    const res = await fetch(
      `${API_URL}/api/ag-classics/authors/slug/${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/* ─────────────────────────────
   Dynamic SEO Metadata
───────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthor(slug);

  if (!data?.author) {
    return {
      title: "Author Not Found | AG Classics",
      description: "The requested author could not be found in the AG Classics collection.",
    };
  }

  const { author } = data;
  const description =
    author.bio?.slice(0, 155).replace(/\s+\S*$/, "…") ||
    `Explore books by ${author.name} in the AG Classics collection.`;

  const images = author.profile_image
    ? [{ url: `${API_URL}${author.profile_image}`, width: 800, height: 800, alt: author.name }]
    : [];

  return {
    metadataBase: new URL(SITE_URL),

    title: `${author.name} | AG Classics`,
    description,

    alternates: {
      canonical: `${SITE_URL}/ag-classics/authors/${author.slug}`,
    },

    openGraph: {
      title: `${author.name} | AG Classics`,
      description,
      url: `${SITE_URL}/ag-classics/authors/${author.slug}`,
      type: "profile",
      siteName: "AG Classics",
      images,
    },

    twitter: {
      card: "summary_large_image",
      title: `${author.name} | AG Classics`,
      description,
      images: images.map((img) => img.url),
    },

    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

/* ─────────────────────────────
   Page + JSON-LD Schema
───────────────────────────── */
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const data = await getAuthor(slug);

  /* If author not found, still render the client component
     which will show its own 404 state. */
  if (!data?.author) {
    return <AuthorPage params={Promise.resolve({ slug })} />;
  }

  const { author, books = [] } = data;

  /* Person schema */
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/ag-classics/authors/${author.slug}`,
    name: author.name,
    url: `${SITE_URL}/ag-classics/authors/${author.slug}`,
    description: author.bio || "",
    ...(author.profile_image && {
      image: {
        "@type": "ImageObject",
        url: `${API_URL}${author.profile_image}`,
        width: 800,
        height: 800,
      },
    }),
    worksFor: {
      "@type": "Organization",
      name: "AG Classics",
      url: SITE_URL,
    },
    ...(books.length > 0 && {
      author: books.map((book: { title: string; slug: string; isbn?: string }) => ({
        "@type": "Book",
        name: book.title,
        url: `${SITE_URL}/ag-classics/${book.slug}`,
        ...(book.isbn && { isbn: book.isbn }),
      })),
    }),
  };

  /* BreadcrumbList schema */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",        item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "AG Classics", item: `${SITE_URL}/ag-classics` },
      { "@type": "ListItem", position: 3, name: author.name,   item: `${SITE_URL}/ag-classics/authors/${author.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AuthorPage params={Promise.resolve({ slug })} />
    </>
  );
}