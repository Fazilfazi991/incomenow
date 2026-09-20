import { describe, expect, it } from "vitest";
import { loginSchema, registrationSchema, resetPasswordSchema } from "./auth-validation";

describe("auth input validation", () => {
  it("validates account emails", () => {
    expect(registrationSchema.safeParse({ displayName: "Alex", email: "invalid", password: "long-enough-password" }).success).toBe(false);
    expect(registrationSchema.safeParse({ displayName: "Alex", email: "alex@example.com", password: "long-enough-password" }).success).toBe(true);
  });

  it("requires twelve characters for new and reset passwords", () => {
    expect(registrationSchema.safeParse({ email: "alex@example.com", password: "short" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "short" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "twelve-chars+" }).success).toBe(true);
  });

  it("does not reject an existing short password during login", () => {
    expect(loginSchema.safeParse({ email: "alex@example.com", password: "legacy" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "alex@example.com", password: "" }).success).toBe(false);
  });
});
