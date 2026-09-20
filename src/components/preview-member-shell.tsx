"use client";

import { useBookmarks } from "./bookmark-provider";
import { MemberShell } from "./member-shell";

export function PreviewMemberShell({ children }: { children: React.ReactNode }) {
  const { savedIds } = useBookmarks();
  return <MemberShell mode="preview" savedCount={savedIds.length}>{children}</MemberShell>;
}
