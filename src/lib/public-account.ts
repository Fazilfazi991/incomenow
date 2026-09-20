export type PublicAccountState = "signed-out" | "active" | "inactive" | "unavailable";

export type PublicAccountSnapshot = {
  configuration: "ready" | "missing";
  authentication: "verified" | "signed-out" | "unavailable";
  access: "active" | "inactive" | "unavailable";
};

export function resolvePublicAccountState(snapshot: PublicAccountSnapshot): PublicAccountState {
  if (snapshot.configuration === "missing") return "unavailable";
  if (snapshot.authentication === "unavailable") return "unavailable";
  if (snapshot.access === "unavailable") return "unavailable";
  if (snapshot.authentication === "signed-out") return "signed-out";
  return snapshot.access;
}
