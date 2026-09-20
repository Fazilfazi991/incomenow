import "server-only";

import { getAccountAccessContext } from "./membership.server";
import { resolvePublicAccountState, type PublicAccountState } from "./public-account";

export async function getPublicAccountState(): Promise<PublicAccountState> {
  try {
    const context = await getAccountAccessContext();
    return resolvePublicAccountState({
      configuration: context.configuration,
      authentication: context.authentication,
      access: context.access,
    });
  } catch {
    return "unavailable";
  }
}
