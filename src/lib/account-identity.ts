import type { User } from "@supabase/supabase-js";

export type AuthenticationMethod = "Email and password" | "Google";

export function getAuthenticationMethods(user: Pick<User, "identities">): AuthenticationMethod[] {
  const providers = new Set((user.identities ?? []).map((identity) => identity.provider));
  const methods: AuthenticationMethod[] = [];
  if (providers.has("email")) methods.push("Email and password");
  if (providers.has("google")) methods.push("Google");
  return methods;
}
