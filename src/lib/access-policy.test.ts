import { describe, expect, it } from "vitest";
import { evaluateEntitlement, evaluateIdeaAccess, type EntitlementRecord, type IdeaGrantRecord } from "./access-policy";

const now = new Date("2026-09-20T12:00:00.000Z");
const active: EntitlementRecord = { enabled: true, starts_at: null, expires_at: null, revoked_at: null };
const starterGrant: IdeaGrantRecord = { ...active, idea_id: "idea-001", offer_code: "starter-pergola-v1" };

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

describe("idea capability policy", () => {
  it("lets full membership authorise any included idea without imposing the starter cap", () => {
    expect(evaluateIdeaAccess({ ideaId: "idea-004", fullMembership: "active", grants: [], grantLookup: "ready", now })).toEqual({
      status: "active",
      source: "full-membership",
    });
  });

  it("lets an active grant authorise only its bound idea", () => {
    expect(evaluateIdeaAccess({ ideaId: "idea-001", fullMembership: "inactive", grants: [starterGrant], grantLookup: "ready", now })).toEqual({ status: "active", source: "starter" });
    expect(evaluateIdeaAccess({ ideaId: "idea-003", fullMembership: "inactive", grants: [starterGrant], grantLookup: "ready", now })).toEqual({ status: "inactive", source: null });
  });

  it("fails closed for expired grants and unresolved lookups", () => {
    expect(evaluateIdeaAccess({ ideaId: "idea-001", fullMembership: "inactive", grants: [{ ...starterGrant, expires_at: now.toISOString() }], grantLookup: "ready", now })).toEqual({ status: "inactive", source: null });
    expect(evaluateIdeaAccess({ ideaId: "idea-001", fullMembership: "unavailable", grants: [], grantLookup: "ready", now })).toEqual({ status: "unavailable", source: null });
    expect(evaluateIdeaAccess({ ideaId: "idea-001", fullMembership: "inactive", grants: [], grantLookup: "unavailable", now })).toEqual({ status: "unavailable", source: null });
  });

  it("accepts a specific valid grant even when full membership lookup is unavailable", () => {
    expect(evaluateIdeaAccess({ ideaId: "idea-001", fullMembership: "unavailable", grants: [starterGrant], grantLookup: "ready", now })).toEqual({ status: "active", source: "starter" });
  });
});
