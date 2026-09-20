export type PublicAccountState = "signed-out" | "full" | "starter" | "registered" | "unavailable";

export type PublicAccountSnapshot = {
  configuration: "ready" | "missing";
  authentication: "verified" | "signed-out" | "unavailable";
  fullMembership: "active" | "inactive" | "unavailable";
  starterAccess: "active" | "inactive" | "unavailable";
};

export function resolvePublicAccountState(snapshot: PublicAccountSnapshot): PublicAccountState {
  if (snapshot.configuration === "missing" || snapshot.authentication === "unavailable") return "unavailable";
  if (snapshot.authentication === "signed-out") return "signed-out";
  if (snapshot.fullMembership === "active") return "full";
  if (snapshot.starterAccess === "active") return "starter";
  if (snapshot.fullMembership === "unavailable" || snapshot.starterAccess === "unavailable") return "unavailable";
  return "registered";
}
