import { MemberShell } from "@/components/member-shell";
import { MemberBookmarkProvider } from "@/components/member-bookmark-provider";
import { requireActiveMembership } from "@/lib/membership.server";
import { getMemberSavedIdeaIds } from "@/lib/workspace.server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const context = await requireActiveMembership("/app/explore");
  const savedIds = await getMemberSavedIdeaIds("/app/explore");
  const email = context.user?.email ?? "";
  const name = context.displayName || email.split("@")[0] || "IncomeNow member";
  return (
    <MemberBookmarkProvider userId={context.user!.id} initialSavedIds={savedIds}>
      <MemberShell mode="member" identity={{ name, email }}>{children}</MemberShell>
    </MemberBookmarkProvider>
  );
}
