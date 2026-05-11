import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/wishlist",
          "/cart",
          "/account/profile",
          "/account/orders",
          "/account/subscriptions",
          "/account/payments"
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}