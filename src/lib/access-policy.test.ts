import { describe, expect, it } from "vitest";
import { evaluateEntitlement, type EntitlementRecord } from "./access-policy";

const now = new Date("2026-09-20T12:00:00.000Z");
const active: EntitlementRecord = { enabled: true, starts_at: null, expires_at: null, revoked_at: null };

describe("membership entitlement policy", () => {
  it("requires a record that is explicitly enabled", () => {
    expect(evaluateEntitlement(null, now)).toBe("inactive");
    expect(evaluateEntitlement({ ...active, enabled: false }, now)).toBe("inactive");
    expect(evaluateEntitlement(active, now)).toBe("active");
  });

  it("rejects future, expired, and revoked grants", () => {
    expect(evaluateEntitlement({ ...active, starts_at: "2026-09-21T00:00:00.000Z" }, now)).toBe("inactive");
    expect(evaluateEntitlement({ ...active, expires_at: "2026-09-20T12:00:00.000Z" }, now)).toBe("inactive");
    expect(evaluateEntitlement({ ...active, revoked_at: "2026-09-19T00:00:00.000Z" }, now)).toBe("inactive");
  });

  it("accepts a grant within its active window", () => {
    expect(evaluateEntitlement({ ...active, starts_at: "2026-09-19T00:00:00.000Z", expires_at: "2026-09-21T00:00:00.000Z" }, now)).toBe("active");
  });
});
