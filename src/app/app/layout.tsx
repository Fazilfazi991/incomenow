import { MemberShell } from "@/components/member-shell";
import { MemberBookmarkProvider } from "@/components/member-bookmark-provider";
import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";
import { getMemberSavedIdeaIds } from "@/lib/workspace.server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const context = await requireVerifiedAccount("/app/explore");
  const savedIds = await getMemberSavedIdeaIds("/app/explore");
  const email = context.user?.email ?? "";
  const name = context.displayName || email.split("@")[0] || "IncomeNow account";
  const starter = getIdeaAccessDecision(context, STARTER_IDEA_ID);
  const accessLabel = context.fullMembership === "active"
    ? "Full membership"
    : starter.status === "active" && starter.source === "starter"
      ? "Starter access"
      : context.fullMembership === "unavailable" || context.ideaGrantLookup === "unavailable"
        ? "Access check unavailable"
        : "Registered browsing";
  return (
    <MemberBookmarkProvider userId={context.user!.id} initialSavedIds={savedIds}>
      <MemberShell mode="member" accessLabel={accessLabel} identity={{ name, email }}>{children}</MemberShell>
    </MemberBookmarkProvider>
  );
}
