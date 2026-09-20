export type PublicAccountState = "signed-out" | "active" | "inactive" | "unavailable";

export type PublicAccountSnapshot = {
  configuration: "ready" | "missing";
  hasUser: boolean;
  access: "active" | "inactive" | "unavailable";
};

export function resolvePublicAccountState(snapshot: PublicAccountSnapshot): PublicAccountState {
  if (snapshot.configuration === "missing") return "unavailable";
  if (snapshot.access === "unavailable") return "unavailable";
  if (!snapshot.hasUser) return "signed-out";
  return snapshot.access;
}
