import { describe, expect, it } from "vitest";
import { resolvePublicAccountState } from "./public-account";

describe("public account state", () => {
  it("keeps public rendering neutral when configuration is missing", () => {
    expect(resolvePublicAccountState({ configuration: "missing", hasUser: false, access: "unavailable" })).toBe("unavailable");
  });

  it("distinguishes signed-out visitors from authenticated access states", () => {
    expect(resolvePublicAccountState({ configuration: "ready", hasUser: false, access: "inactive" })).toBe("signed-out");
    expect(resolvePublicAccountState({ configuration: "ready", hasUser: true, access: "inactive" })).toBe("inactive");
    expect(resolvePublicAccountState({ configuration: "ready", hasUser: true, access: "active" })).toBe("active");
    expect(resolvePublicAccountState({ configuration: "ready", hasUser: true, access: "unavailable" })).toBe("unavailable");
  });

  it("does not present an authentication lookup failure as signed out", () => {
    expect(resolvePublicAccountState({ configuration: "ready", hasUser: false, access: "unavailable" })).toBe("unavailable");
  });
});
