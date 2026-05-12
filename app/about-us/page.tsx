import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

/* ═══════════════════════════════════════════════════════════════════
   ENV & CONSTANTS
═══════════════════════════════════════════════════════════════════ */
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agclassics.in";
const SITE_NAME = "AG Classics";

/* ═══════════════════════════════════════════════════════════════════
   SEO METADATA
═══════════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  title: `About Us | ${SITE_NAME} - Curated Digital Library`,
  description:
    "Discover AG Classics, India's foremost curated digital library. We preserve and provide instant access to timeless literature, philosophy, and enduring masterpieces for the intentional reader.",
  keywords: [
    "AG Classics",
    "curated digital library",
    "classic literature",
    "timeless books",
    "philosophy books",
    "book preservation",
    "digital library India",
    "intentional reading",
    "rare books digitized"
  ],
  alternates: {
    canonical: `${SITE_URL}/about-us`,
  },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Discover AG Classics, India's foremost curated digital library. We preserve and provide instant access to timeless literature, philosophy, and enduring masterpieces for the intentional reader.",
    url: `${SITE_URL}/about-us`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/logo/AGClassicLogosquare.png`, // Add a fallback OG image to your public folder
        width: 1200,
        height: 630,
        alt: "AG Classics - Guardians of Timeless Words",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_NAME}`,
    description:
      "Preserving the legacy of human thought. Discover India's foremost curated digital library of timeless classics.",
    images: [`${SITE_URL}/images/logo/AGClassicLogosquare.png`], // Add a fallback OG image to your public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE  (Server Component)
═══════════════════════════════════════════════════════════════════ */
export default function Page() {
  // JSON-LD Schema for Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": `${SITE_URL}/logo.png`, // Ensure you have a logo in your public folder
        "description": "India's foremost curated digital library built for intentional readers, preserving timeless literature and enduring masterpieces.",
        "sameAs": [
          // Uncomment and add your social links here
          // "https://twitter.com/agclassics",
          // "https://instagram.com/agclassics"
        ]
      },
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about-us/#webpage`,
        "url": `${SITE_URL}/about-us`,
        "name": `About Us | ${SITE_NAME}`,
        "isPartOf": {
          "@id": `${SITE_URL}/#website`
        },
        "about": {
          "@id": `${SITE_URL}/#organization`
        },
        "description": "AG Classics exists at the intersection of preservation and discovery, offering a hand-selected digital library of history's most important books."
      }
    ]
  };

  return (
    <>
      {/* Inject JSON-LD structured data into the <head> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Your full "use client" about UI */}
      <AboutPage />
    </>
  );
}