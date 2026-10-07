import { describe, expect, it } from "vitest";
import { isTrackableAcquisitionRequest, normalizeSourceKey, sanitizeLandingPath, sanitizeReferrer } from "./acquisition";

describe("acquisition request filtering", () => {
  it("accepts customer pages and rejects internal or automated traffic", () => {
    expect(isTrackableAcquisitionRequest("/membership", "Mozilla/5.0")).toBe(true);
    expect(isTrackableAcquisitionRequest("/admin/race", "Mozilla/5.0")).toBe(false);
    expect(isTrackableAcquisitionRequest("/", "Googlebot/2.1")).toBe(false);
    expect(isTrackableAcquisitionRequest("/health", "Mozilla/5.0")).toBe(false);
  });

  it("normalizes only bounded source keys", () => {
    expect(normalizeSourceKey(" Team_A ")).toBe("team_a");
    expect(normalizeSourceKey("bad source")) .toBeNull();
    expect(normalizeSourceKey("x")) .toBeNull();
  });

  it("keeps safe paths and strips referrer query data", () => {
    expect(sanitizeLandingPath("/membership?offer=starter")).toBe("/membership?offer=starter");
    expect(sanitizeLandingPath("https://evil.test")) .toBe("/");
    expect(sanitizeReferrer("https://example.test/path?email=private#section")).toBe("https://example.test/path");
  });
});
