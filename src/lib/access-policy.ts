export type EntitlementRecord = {
  enabled: boolean;
  starts_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};

export type AccessStatus = "active" | "inactive" | "unavailable";

export type IdeaGrantRecord = EntitlementRecord & {
  idea_id: string;
  offer_code: string;
};

export type IdeaAccessDecision = {
  status: AccessStatus;
  source: "full-membership" | "starter" | null;
};

export function evaluateEntitlement(record: EntitlementRecord | null, now = new Date()): Exclude<AccessStatus, "unavailable"> {
  if (!record || !record.enabled || record.revoked_at) return "inactive";

  const startsAt = record.starts_at ? new Date(record.starts_at) : null;
  const expiresAt = record.expires_at ? new Date(record.expires_at) : null;
  if (startsAt && startsAt > now) return "inactive";
  if (expiresAt && expiresAt <= now) return "inactive";
  return "active";
}

export function evaluateIdeaAccess({
  ideaId,
  fullMembership,
  grants,
  grantLookup,
  now = new Date(),
}: {
  ideaId: string;
  fullMembership: AccessStatus;
  grants: readonly IdeaGrantRecord[];
  grantLookup: "ready" | "unavailable";
  now?: Date;
}): IdeaAccessDecision {
  if (fullMembership === "active") return { status: "active", source: "full-membership" };

  const matchingGrant = grants.find((grant) => grant.idea_id === ideaId);
  if (matchingGrant && evaluateEntitlement(matchingGrant, now) === "active") {
    return { status: "active", source: "starter" };
  }

  if (fullMembership === "unavailable" || grantLookup === "unavailable") {
    return { status: "unavailable", source: null };
  }

  return { status: "inactive", source: null };
}
