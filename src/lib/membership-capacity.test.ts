import { describe, expect, it } from "vitest";
import { demoMembershipCount, membershipLaunch, resolveMembershipStats } from "./membership-capacity";

describe("honest membership capacity presentation", () => {
  it("uses an isolated demo only for development and design preview", () => {
    for (const environment of [{ NODE_ENV: "development" }, { NODE_ENV: "production", VERCEL_ENV: "preview" }]) {
      expect(resolveMembershipStats({ environment })).toEqual({ active: demoMembershipCount, available: 600 - demoMembershipCount, capacity: 600, source: "demo", allocation: "open" });
    }
  });
  it("never invents occupancy for production or an unknown environment", () => {
    for (const environment of [{ NODE_ENV: "production" }, { NODE_ENV: "production", VERCEL_ENV: "production" }, {}]) {
      expect(resolveMembershipStats({ environment })).toEqual({ active: null, available: null, capacity: 600, source: "unavailable", allocation: "unknown" });
    }
  });
  it("derives availability from a verified server count, including full and empty", () => {
    expect(resolveMembershipStats({ verifiedActive: 243 })).toMatchObject({ active: 243, available: 357, source: "verified", allocation: "open" });
    expect(resolveMembershipStats({ verifiedActive: 600 })).toMatchObject({ active: 600, available: 0, allocation: "full" });
    expect(resolveMembershipStats({ verifiedActive: 0 })).toMatchObject({ active: 0, available: 600, source: "verified" });
  });
  it("fails closed for malformed or over-capacity counts", () => {
    for (const verifiedActive of [-1, 601, 1.5, NaN, Infinity]) {
      expect(resolveMembershipStats({ verifiedActive, environment: { NODE_ENV: "production" } })).toMatchObject({ active: null, available: null, source: "unavailable" });
    }
    expect(membershipLaunch).toMatchObject({ amountMinor: 1499, currency: "USD", capacity: 600, checkoutAvailable: false });
  });
  it("does not advertise reserved slots as available",()=>{
    expect(resolveMembershipStats({verifiedActive:599,verifiedReserved:1})).toMatchObject({active:599,available:0,allocation:"full"});
  });
});
