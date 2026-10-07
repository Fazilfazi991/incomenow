import type { MetadataRoute } from "next";
import { getSiteOrigin, isProductionSite, publicSitePaths } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  if (!origin || !isProductionSite(process.env)) return [];
  return publicSitePaths.map((path) => ({ url: `${origin}${path === "/" ? "" : path}` }));
}
