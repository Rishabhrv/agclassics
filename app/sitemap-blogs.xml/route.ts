import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export async function GET() {
  const now = new Date().toISOString();

  const staticPages = [
    { path: "/blog/10-best-self-development-books-for-2026",                     priority: "1.0", changefreq: "daily" },
    { path: "/blog/sun-tzu-art-of-war-summary-and-lessons",                      priority: "1.0", changefreq: "daily" },
    { path: "/blog/10-best-business-books",                                      priority: "1.0", changefreq: "daily" },
    { path: "/blog/why-public-domain-books-are-still-relevant",                  priority: "1.0", changefreq: "daily" },
    { path: "/blog/the-history-of-public-domain-literature",                     priority: "1.0", changefreq: "daily" },
    { path: "/blog/10-classic-books-everyone-should-read-once",                  priority: "1.0", changefreq: "daily" },
    { path: "/blog/how-books-enter-the-public-domain",                           priority: "1.0", changefreq: "daily" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`).join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}