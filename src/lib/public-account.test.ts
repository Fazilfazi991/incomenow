import { describe, expect, it } from "vitest";
import { resolvePublicAccountState } from "./public-account";

describe("public account state", () => {
  it("keeps public rendering neutral when configuration is missing", () => {
    expect(resolvePublicAccountState({ configuration: "missing", authentication: "unavailable", fullMembership: "unavailable", starterAccess: "unavailable" })).toBe("unavailable");
  });

  it("distinguishes signed-out, registered, starter, and full access", () => {
    expect(resolvePublicAccountState({ configuration: "ready", authentication: "signed-out", fullMembership: "inactive", starterAccess: "inactive" })).toBe("signed-out");
    expect(resolvePublicAccountState({ configuration: "ready", authentication: "verified", fullMembership: "inactive", starterAccess: "inactive" })).toBe("registered");
    expect(resolvePublicAccountState({ configuration: "ready", authentication: "verified", fullMembership: "inactive", starterAccess: "active" })).toBe("starter");
    expect(resolvePublicAccountState({ configuration: "ready", authentication: "verified", fullMembership: "active", starterAccess: "inactive" })).toBe("full");
    expect(resolvePublicAccountState({ configuration: "ready", authentication: "verified", fullMembership: "unavailable", starterAccess: "inactive" })).toBe("unavailable");
  });

  it("does not present an authentication lookup failure as signed out", () => {
    expect(resolvePublicAccountState({ configuration: "ready", authentication: "unavailable", fullMembership: "unavailable", starterAccess: "unavailable" })).toBe("unavailable");
  });
});
