import { membershipConfig } from "./membership-config";

export const membershipStates = ["pending", "active", "cancel_at_period_end", "expired", "cancelled"] as const;
export type MembershipState = typeof membershipStates[number];
export type MembershipWindow = { state: MembershipState; startsAt: string | null; entitlementEndsAt: string | null };

/** Pure specification for the future DB projection, never an authorization check. */
export function consumesActiveSlot(window: MembershipWindow, now = Date.now()) {
  if (window.state !== "active" && window.state !== "cancel_at_period_end") return false;
  const start = window.startsAt === null ? NaN : Date.parse(window.startsAt);
  const end = window.entitlementEndsAt === null ? NaN : Date.parse(window.entitlementEndsAt);
  return Number.isFinite(now) && Number.isFinite(start) && Number.isFinite(end) && start <= now && now < end;
}

/** Only feed this validated aggregate from a trusted server/database response. */
export function resolveCapacityState({ active, reserved = 0, checkoutEnabled = membershipConfig.fullMembership.checkoutAvailable, waitlistEnabled = false }: { active: number; reserved?: number; checkoutEnabled?: boolean; waitlistEnabled?: boolean }) {
  const capacity = membershipConfig.fullMembership.capacity;
  if (![active, reserved].every(value => Number.isInteger(value) && value >= 0) || active + reserved > capacity) return null;
  const available = capacity - active;
  const allocatable = available - reserved;
  return { capacity, active, reserved, available, allocatable, full: active === capacity, paidMembershipOpen: checkoutEnabled && allocatable > 0, waitlistEnabled };
}
