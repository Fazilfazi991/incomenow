import "server-only";

import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { getAccountAccessContext, getIdeaAccessDecision } from "./membership.server";
import { resolvePublicAccountState, type PublicAccountState } from "./public-account";

export async function getPublicAccountState(): Promise<PublicAccountState> {
  try {
    const context = await getAccountAccessContext();
    return resolvePublicAccountState({
      configuration: context.configuration,
      authentication: context.authentication,
      fullMembership: context.fullMembership,
      starterAccess: getIdeaAccessDecision(context, STARTER_IDEA_ID).source === "starter"
        ? "active"
        : context.ideaGrantLookup === "unavailable"
          ? "unavailable"
          : "inactive",
    });
  } catch {
    return "unavailable";
  }
}
