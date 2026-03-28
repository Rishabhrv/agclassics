import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export async function GET() {
  try {
    // 1. Hit the base endpoint and request the max limit allowed by your backend
    const res = await fetch(`${API_URL}/api/ag-classics?limit=48`, { 
      cache: "no-store" 
    });
    
    const data = await res.json();

    // 2. Extract the products array from your Express response object
    // Default to an empty array if something goes wrong
    const products = data.products || [];

    const urls = products
      // Note: Your Express route already filters by "status = 'published'", 
      // so you technically don't need this filter, but it's safe to keep.
      .filter((p: any) => p.status === "published") 
      .map((p: any) => `
        <url>
          <loc>${SITE_URL}/product/${p.slug}</loc>
          <lastmod>${new Date(p.created_at).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
      `)
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}