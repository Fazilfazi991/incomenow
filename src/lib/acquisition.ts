export const ACQUISITION_VISITOR_COOKIE = "incomenow_vid";
export const ACQUISITION_SESSION_COOKIE = "incomenow_sid";
export const ACQUISITION_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;
export const ACQUISITION_SESSION_MAX_AGE = 60 * 30;

const BOT_PATTERN = /bot\b|crawler|spider|headless|lighthouse|pagespeed|uptime|monitoring|healthcheck|preview/i;
const SOURCE_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{1,49}$/;

export function isTrackableAcquisitionRequest(pathname: string, userAgent: string) {
  if (!pathname.startsWith("/") || pathname.startsWith("/api/") || pathname.startsWith("/admin")) return false;
  if (pathname === "/favicon.ico" || pathname === "/health" || pathname === "/robots.txt") return false;
  return !BOT_PATTERN.test(userAgent);
}

export function normalizeSourceKey(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return SOURCE_KEY_PATTERN.test(normalized) ? normalized : null;
}

export function sanitizeLandingPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value.slice(0, 500);
}

export function sanitizeReferrer(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return null;
  }
}
