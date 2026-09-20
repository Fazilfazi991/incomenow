import { notFound } from "next/navigation";
import { BookmarkProvider } from "@/components/bookmark-provider";
import { PreviewMemberShell } from "@/components/preview-member-shell";
import { isPreviewEnabled } from "@/lib/preview-access";

export const dynamic = "force-dynamic";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  if (!isPreviewEnabled(process.env)) notFound();

  return (
    <BookmarkProvider>
      <PreviewMemberShell>{children}</PreviewMemberShell>
    </BookmarkProvider>
  );
}
