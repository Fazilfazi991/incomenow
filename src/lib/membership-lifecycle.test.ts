import { describe, expect, it } from "vitest";
import { consumesActiveSlot, resolveCapacityState, type MembershipState } from "./membership-lifecycle";

const startsAt = "2026-10-01T00:00:00Z";
const entitlementEndsAt = "2026-11-01T00:00:00Z";
const now = Date.parse("2026-10-07T00:00:00Z");
describe("future authoritative membership projection specification", () => {
  it.each(["active", "cancel_at_period_end"] as const)("keeps %s allocated through the paid window", state => {
    expect(consumesActiveSlot({ state, startsAt, entitlementEndsAt }, now)).toBe(true);
    expect(consumesActiveSlot({ state, startsAt, entitlementEndsAt }, Date.parse(entitlementEndsAt))).toBe(false);
  });
  it.each(["pending", "expired", "cancelled"] as MembershipState[])("does not treat %s as paid access", state => {
    expect(consumesActiveSlot({ state, startsAt, entitlementEndsAt }, now)).toBe(false);
  });
  it("rejects missing, malformed, and future entitlement windows", () => {
    for (const window of [{ startsAt: null, entitlementEndsAt }, { startsAt, entitlementEndsAt: null }, { startsAt: "bad", entitlementEndsAt }, { startsAt: entitlementEndsAt, entitlementEndsAt: "2026-12-01" }]) {
      expect(consumesActiveSlot({ state: "active", ...window }, now)).toBe(false);
    }
  });
  it("reserves the last slot without presenting it as a paid member", () => {
    expect(resolveCapacityState({ active: 599, reserved: 1, checkoutEnabled: true })).toMatchObject({ available: 1, allocatable: 0, active: 599, full: false, paidMembershipOpen: false });
    expect(resolveCapacityState({ active: 600, checkoutEnabled: true })).toMatchObject({ available: 0, full: true, paidMembershipOpen: false });
    expect(resolveCapacityState({ active: 599 })).toMatchObject({ paidMembershipOpen: false });
  });
  it("fails closed on invalid or overcommitted counts", () => {
    for (const counts of [{ active: 601 }, { active: 599, reserved: 2 }, { active: NaN }, { active: -1 }, { active: 1.5 }]) expect(resolveCapacityState(counts)).toBeNull();
  });
});
