import { describe, expect, it } from "vitest";
import { ideas } from "./ideas";
import { toIdeaCatalogEntry } from "./idea-catalog";

describe("authenticated catalogue projection", () => {
  it("keeps protected sections, plan versions, and resource identifiers out of browse payloads", () => {
    const source = ideas[0];
    const projected = toIdeaCatalogEntry(source);
    const payload = JSON.stringify(projected);

    expect(Object.keys(projected.resources[0]).sort()).toEqual(["label", "type"]);
    expect(payload).not.toContain(source.resources[0].id);
    expect(payload).not.toContain(source.resources[0].externalUrl);
    expect(payload).not.toContain(source.resources[1].downloadPath);
    expect(projected).not.toHaveProperty("implementationPlanVersion");
    expect(payload).not.toContain("crm-validate");
    expect(payload).not.toContain("region-segment");
    expect(payload).not.toContain("Starter readiness and operating responsibilities");
  });
});
