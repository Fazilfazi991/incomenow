import { describe, expect, it } from "vitest";
import { accountPreferencesSchema, emptyAccountPreferences, hasAnsweredPreferences } from "./account-preferences";

describe("account preference contract", () => {
  it("accepts fully empty optional preferences", () => {
    expect(accountPreferencesSchema.safeParse(emptyAccountPreferences).success).toBe(true);
  });

  it("accepts stable valid identifiers", () => {
    expect(accountPreferencesSchema.safeParse({
      interestCategories: ["custom-crm", "automation"],
      experienceLevel: "adapting-tools",
      preferredApproach: "client-service",
      revision: 3,
    }).success).toBe(true);
  });

  it("rejects duplicate and unknown values", () => {
    expect(accountPreferencesSchema.safeParse({
      interestCategories: ["automation", "automation"], experienceLevel: null, preferredApproach: null, revision: 0,
    }).success).toBe(false);
    expect(accountPreferencesSchema.safeParse({
      interestCategories: ["made-up"], experienceLevel: null, preferredApproach: null, revision: 0,
    }).success).toBe(false);
  });

  it("distinguishes an answered draft from an intentionally empty choice", () => {
    expect(hasAnsweredPreferences(emptyAccountPreferences)).toBe(false);
    expect(hasAnsweredPreferences({ ...emptyAccountPreferences, preferredApproach: "exploring" })).toBe(true);
  });
});
