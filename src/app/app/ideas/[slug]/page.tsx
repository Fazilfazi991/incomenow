import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IdeaDetail } from "@/components/idea-detail";
import { LockedIdeaDetail } from "@/components/locked-idea-detail";
import { getIdeaRouteContent } from "@/lib/member-content.server";

export const metadata: Metadata = { title: "Member idea" };
export const dynamic = "force-dynamic";

type IdeaPageProps = { params: Promise<{ slug: string }> };

export default async function MemberIdeaPage({ params }: IdeaPageProps) {
  const { slug } = await params;
  const content = await getIdeaRouteContent(slug);
  if (!content) notFound();

  return (
    <div className="idea-route">
      <div className="route-bar">
        <Link href="/app/explore"><ArrowLeft size={16} /> Back to ideas</Link>
        <span>{content.kind === "full" ? content.access === "starter" ? "Starter idea access verified" : "Full membership access verified" : "Safe catalogue preview"}</span>
      </div>
      {content.kind === "full"
        ? <IdeaDetail idea={content.idea} mode="member" existingProjectId={content.projectId} />
        : <LockedIdeaDetail idea={content.idea} access={content.access} />}
    </div>
  );
}
