import type { Metadata } from "next";
import PrivacyPolicyPage from "@/components/privacy-policy/PrivacyPolicyPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "Privacy Policy | AG Classics",

  description:
    "Read the Privacy Policy of AG Classics — your curated eBook platform. Learn how we collect, use, and protect your personal data when you browse and purchase digital books.",

  keywords: [
    "AG Classics privacy policy",
    "eBook platform privacy India",
    "digital book store data protection",
    "AG Classics data policy",
    "ebook purchase privacy",
    "public domain books privacy",
  ],

  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },

  openGraph: {
    title: "Privacy Policy | AG Classics",
    description:
      "Understand how AG Classics collects, uses, and safeguards your personal data across our curated eBook platform.",
    url: `${SITE_URL}/privacy-policy`,
    siteName: "AG Classics",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | AG Classics",
    description:
      "Learn how AG Classics protects and manages your personal data on our curated eBook platform.",
  },
};

const jsonLd = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "PrivacyPolicy",
  name: "Privacy Policy",
  url: `${siteUrl}/privacy-policy`,
  description:
    "Privacy Policy outlining how AG Classics collects, uses, and protects personal data for readers and eBook purchasers.",
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
      <PrivacyPolicyPage />
    </>
  );
}