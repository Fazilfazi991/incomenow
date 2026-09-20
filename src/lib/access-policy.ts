export type EntitlementRecord = {
  enabled: boolean;
  starts_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};

export type AccessStatus = "active" | "inactive" | "unavailable";

export function evaluateEntitlement(record: EntitlementRecord | null, now = new Date()): Exclude<AccessStatus, "unavailable"> {
  if (!record || !record.enabled || record.revoked_at) return "inactive";

  const startsAt = record.starts_at ? new Date(record.starts_at) : null;
  const expiresAt = record.expires_at ? new Date(record.expires_at) : null;
  if (startsAt && startsAt > now) return "inactive";
  if (expiresAt && expiresAt <= now) return "inactive";
  return "active";
}
