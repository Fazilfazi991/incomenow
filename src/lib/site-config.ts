import type { Metadata } from "next";

export const publicSitePaths = ["/", "/membership", "/privacy"] as const;

export function getSiteOrigin(value = process.env.SITE_URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".vercel.app")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isPublicSitePath(pathname: string): boolean {
  return publicSitePaths.some((path) => path === pathname);
}

export function getGoogleAnalyticsId(value: string | undefined): string | null {
  return value && /^G-[A-Z0-9]+$/.test(value) ? value : null;
}

export function isProductionSite(environment: Record<string, string | undefined>): boolean {
  return environment.NODE_ENV === "production" && (!environment.VERCEL_ENV || environment.VERCEL_ENV === "production");
}

export function publicPageMetadata(path: string): Metadata {
  const origin = getSiteOrigin();
  const index = Boolean(origin) && isProductionSite(process.env);
  return { alternates: origin ? { canonical: `${origin}${path}` } : undefined, robots: { index, follow: index } };
}
