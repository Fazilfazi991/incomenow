import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountSavedClient } from "@/components/account-saved-client";
import { getBrowseableIdeaCatalog } from "@/lib/member-content.server";
import { getMemberBookmarks } from "@/lib/workspace.server";

export const metadata: Metadata = { title: "Saved ideas" };
export const dynamic = "force-dynamic";

export default async function SavedIdeasPage() {
  const [bookmarks, catalog] = await Promise.all([getMemberBookmarks(), getBrowseableIdeaCatalog()]);
  return (
    <Suspense fallback={<div className="page-loading">Loading your saved ideas…</div>}>
      <AccountSavedClient initialIdeaIds={bookmarks.map((bookmark) => bookmark.ideaId)} catalog={catalog} />
    </Suspense>
  );
}
