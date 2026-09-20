import { describe, expect, it } from "vitest";
import { getAuthenticationMethods } from "./account-identity";

describe("authentication method labels", () => {
  it("uses linked identity providers rather than guessing from email", () => {
    expect(getAuthenticationMethods({ identities: [{ provider: "google" }, { provider: "email" }] as never })).toEqual([
      "Email and password",
      "Google",
    ]);
  });

  it("does not invent a method when provider data is unavailable", () => {
    expect(getAuthenticationMethods({ identities: [] })).toEqual([]);
  });
});
