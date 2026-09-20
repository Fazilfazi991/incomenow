import { afterEach, describe, expect, it } from "vitest";
import { getTrustedAppOrigin, safeInternalDestination, safeOnboardingDestination } from "./safe-redirect";

describe("safe internal redirects", () => {
  it("accepts only the protected application destinations", () => {
    expect(safeInternalDestination("/account/access?confirmed=true")).toBe("/account/access?confirmed=true");
    expect(safeInternalDestination("/account/settings")).toBe("/account/settings");
    expect(safeInternalDestination("/membership?offer=starter")).toBe("/membership?offer=starter");
    expect(safeInternalDestination("/account/getting-started?next=%2Fapp%2Fexplore")).toBe("/account/getting-started?next=%2Fapp%2Fexplore");
    expect(safeInternalDestination("/app/explore?q=crm")).toBe("/app/explore?q=crm");
    expect(safeInternalDestination("/app/ideas/quotation-follow-up")).toBe("/app/ideas/quotation-follow-up");
    expect(safeInternalDestination("/app/saved?type=Automation")).toBe("/app/saved?type=Automation");
    expect(safeInternalDestination("/app/projects")).toBe("/app/projects");
    expect(safeInternalDestination("/app/projects/123e4567-e89b-42d3-a456-426614174000?stage=crm-validate")).toBe("/app/projects/123e4567-e89b-42d3-a456-426614174000?stage=crm-validate");
  });

  it("rejects external, protocol-relative, backslash, and unrelated destinations", () => {
    for (const destination of ["https://evil.test", "//evil.test/path", "/\\evil.test", "/preview/explore", "/app/ideas", "/app/projects/not-a-uuid", "/app/admin"] ) {
      expect(safeInternalDestination(destination)).toBe("/account/access");
    }
  });
});

describe("onboarding continuation redirects", () => {
  it("preserves allowed deep links without allowing an onboarding loop", () => {
    expect(safeOnboardingDestination("/app/saved?q=crm")).toBe("/app/saved?q=crm");
    expect(safeOnboardingDestination("/account/getting-started?next=%2Faccount%2Fgetting-started")).toBe("/account/access");
    expect(safeOnboardingDestination("https://evil.test")).toBe("/account/access");
  });
});

describe("trusted application origin", () => {
  const original = process.env.APP_ORIGIN;
  afterEach(() => {
    if (original === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = original;
  });

  it("accepts HTTPS and explicit local HTTP origins without paths", () => {
    process.env.APP_ORIGIN = "https://incomenow.in";
    expect(getTrustedAppOrigin()).toBe("https://incomenow.in");
    process.env.APP_ORIGIN = "http://localhost:3000";
    expect(getTrustedAppOrigin()).toBe("http://localhost:3000");
  });

  it("rejects insecure remote or path-bearing origins", () => {
    process.env.APP_ORIGIN = "http://incomenow.in";
    expect(getTrustedAppOrigin()).toBeNull();
    process.env.APP_ORIGIN = "https://incomenow.in/auth";
    expect(getTrustedAppOrigin()).toBeNull();
  });
});
