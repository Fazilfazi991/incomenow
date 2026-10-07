/** Presentation configuration only. This does not grant access or enforce billing. */
import { membershipConfig } from "./membership-config";

export const membershipLaunch = membershipConfig.fullMembership;

export type MembershipStats = {
  capacity: number;
  active: number | null;
  available: number | null;
  source: "demo" | "verified" | "unavailable";
  allocation: "open" | "full" | "unknown";
};

// Isolated visual fixture. Never used for a production deployment.
export const demoMembershipCount = 200;

export function resolveMembershipStats({
  verifiedActive,
  verifiedReserved = 0,
  environment = process.env,
}: {
  verifiedActive?: number | null;
  verifiedReserved?: number;
  environment?: Record<string, string | undefined>;
} = {}): MembershipStats {
  const capacity = membershipLaunch.capacity;
  const verified = typeof verifiedActive === "number" && Number.isInteger(verifiedActive) && verifiedActive >= 0 && verifiedActive <= capacity
    && Number.isInteger(verifiedReserved) && verifiedReserved>=0 && verifiedActive+verifiedReserved<=capacity;
  const preview = environment.NODE_ENV === "development" || environment.VERCEL_ENV === "preview";
  const source = verified ? "verified" : preview ? "demo" : "unavailable";
  const active = verified ? verifiedActive : preview ? demoMembershipCount : null;
  return {
    capacity,
    active,
    available: active === null ? null : capacity - active - (verified?verifiedReserved:0),
    source,
    allocation: active === null ? "unknown" : active + (verified?verifiedReserved:0) === capacity ? "full" : "open",
  };
}
