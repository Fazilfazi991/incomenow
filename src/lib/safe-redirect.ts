const ideaPath = /^\/app\/ideas\/[a-z0-9-]+$/;
const projectPath = /^\/app\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function safeInternalDestination(value: string | null | undefined, fallback = "/account/access") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    const url = new URL(value, "https://incomenow.invalid");
    if (url.origin !== "https://incomenow.invalid") return fallback;
    const destination = `${url.pathname}${url.search}`;
    const allowed = ["/account/access", "/account/settings", "/account/getting-started", "/app/explore", "/app/saved", "/app/projects"].includes(url.pathname)
      || ideaPath.test(url.pathname)
      || projectPath.test(url.pathname);
    return allowed ? destination : fallback;
  } catch {
    return fallback;
  }
}

export function safeOnboardingDestination(value: string | null | undefined) {
  const destination = safeInternalDestination(value, "/account/access");
  return new URL(destination, "https://incomenow.invalid").pathname === "/account/getting-started"
    ? "/account/access"
    : destination;
}

export function getTrustedAppOrigin() {
  const configured = process.env.APP_ORIGIN;
  if (!configured) return null;

  try {
    const origin = new URL(configured);
    const isLocal = origin.hostname === "localhost" || origin.hostname === "127.0.0.1";
    if (origin.pathname !== "/" || origin.search || origin.hash) return null;
    if (origin.protocol !== "https:" && !(isLocal && origin.protocol === "http:")) return null;
    return origin.origin;
  } catch {
    return null;
  }
}
