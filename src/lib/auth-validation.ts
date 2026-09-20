import { z } from "zod";

const email = z.string().trim().email("Enter a valid email address.").max(254);
const newPassword = z.string().min(12, "Use at least 12 characters.").max(128, "Use no more than 128 characters.");

export const registrationSchema = z.object({
  displayName: z.string().trim().max(100, "Use no more than 100 characters.").optional(),
  email,
  password: newPassword,
});

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password.").max(128) });
export const emailSchema = z.object({ email });
export const resetPasswordSchema = z.object({ password: newPassword });

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialAuthState: AuthActionState = { status: "idle" };

export function validationState(error: z.ZodError): AuthActionState {
  return { status: "error", message: "Check the highlighted fields and try again.", fieldErrors: error.flatten().fieldErrors };
}
