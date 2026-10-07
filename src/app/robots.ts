import type { MetadataRoute } from "next";
import { getSiteOrigin, isProductionSite } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  if (!origin || !isProductionSite(process.env)) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/account/", "/admin/", "/api/", "/auth/", "/preview/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
