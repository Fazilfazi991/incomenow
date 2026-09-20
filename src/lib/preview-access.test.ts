import { describe, expect, it } from "vitest";
import { isPreviewEnabled } from "./preview-access";

describe("preview access", () => {
  it("is available during local development", () => {
    expect(isPreviewEnabled({ NODE_ENV: "development" })).toBe(true);
  });

  it("is server-disabled by default in production", () => {
    expect(isPreviewEnabled({ NODE_ENV: "production" })).toBe(false);
  });

  it("requires an explicit production preview flag", () => {
    expect(isPreviewEnabled({ NODE_ENV: "production", ENABLE_PREVIEW_ROUTES: "true" })).toBe(true);
  });
});

