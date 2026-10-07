import { describe, expect, it } from "vitest";
import { getGoogleAnalyticsId, getSiteOrigin, isProductionSite, isPublicSitePath } from "./site-config";

describe("production search and analytics boundaries", () => {
  it("requires an explicit HTTPS custom origin without credentials or URL data", () => {
    expect(getSiteOrigin("https://www.millionmonk.com/")).toBe("https://www.millionmonk.com");
    for (const origin of ["", "invalid", "http://millionmonk.com", "https://user:pass@millionmonk.com", "https://millionmonk.com/path", "https://millionmonk.com?token=secret", "https://millionmonk.com#secret", "https://incomenow.vercel.app", "https://localhost"]) {
      expect(getSiteOrigin(origin)).toBeNull();
    }
  });

  it("never enables production tracking for development or Vercel previews", () => {
    expect(isProductionSite({ NODE_ENV: "production", VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionSite({ NODE_ENV: "production", VERCEL_ENV: "preview" })).toBe(false);
    expect(isProductionSite({ NODE_ENV: "development" })).toBe(false);
  });

  it("limits Google measurement to public pages, excluding auth and customer routes", () => {
    for (const path of ["/", "/membership", "/privacy"]) expect(isPublicSitePath(path)).toBe(true);
    for (const path of ["/auth/callback", "/reset-password", "/login", "/app/ideas/pergola", "/app/projects/customer-id", "/account/settings", "/admin/race", "/preview/explore"]) expect(isPublicSitePath(path)).toBe(false);
    expect(getGoogleAnalyticsId("G-ABC123")).toBe("G-ABC123");
    expect(getGoogleAnalyticsId("G-ABC\";alert(1)")).toBeNull();
    expect(getGoogleAnalyticsId(undefined)).toBeNull();
  });
});
