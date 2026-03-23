import type { Metadata } from "next";
import TermsAndConditionsPage from "@/components/terms-and-conditions/TermsAndConditionsPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "Terms & Conditions | AG Classics",

  description:
    "Read the official Terms and Conditions of AG Classics — your destination for curated eBooks across all genres. Learn about purchases, digital downloads, refunds, intellectual property, and governing law.",

  keywords: [
    "AG Classics terms and conditions",
    "eBook platform terms India",
    "digital book purchase policy",
    "AG Classics legal",
    "public domain books terms",
    "ebook download policy",
  ],

  alternates: {
    canonical: `${SITE_URL}/terms`,
  },

  openGraph: {
    title: "Terms & Conditions | AG Classics",
    description:
      "Official Terms and Conditions governing your use of AG Classics — curated eBooks for readers who read with intention.",
    url: `${SITE_URL}/terms`,
    siteName: "AG Classics",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | AG Classics",
    description:
      "Read the official Terms and Conditions of AG Classics, your curated eBook platform.",
  },
};

/* Structured Data */
const jsonLd = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "TermsOfService",
  name: "Terms & Conditions",
  url: `${siteUrl}/terms`,
  description:
    "Terms and Conditions governing the purchase and use of digital eBooks on AG Classics.",
  publisher: {
    "@type": "Organization",
    name: "AG Classics",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
    },
  },
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(SITE_URL)),
        }}
      />
      <TermsAndConditionsPage />
    </>
  );
}