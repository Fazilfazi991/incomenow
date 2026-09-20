import "server-only";

import { getAccountAccessContext } from "./membership.server";
import { resolvePublicAccountState, type PublicAccountState } from "./public-account";

export async function getPublicAccountState(): Promise<PublicAccountState> {
  try {
    const context = await getAccountAccessContext();
    return resolvePublicAccountState({
      configuration: context.configuration,
      hasUser: Boolean(context.user),
      access: context.access,
    });
  } catch {
    return "unavailable";
  }
}
