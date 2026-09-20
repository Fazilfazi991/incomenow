import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IdeaDetail } from "@/components/idea-detail";
import { getProtectedIdea } from "@/lib/member-content.server";
import { getMemberProjectIdForIdea } from "@/lib/workspace.server";

export const metadata: Metadata = { title: "Member idea" };
export const dynamic = "force-dynamic";

type IdeaPageProps = { params: Promise<{ slug: string }> };

export default async function MemberIdeaPage({ params }: IdeaPageProps) {
  const { slug } = await params;
  const idea = await getProtectedIdea(slug);
  if (!idea) notFound();
  const existingProjectId = await getMemberProjectIdForIdea(idea.id);

  return (
    <div className="idea-route">
      <div className="route-bar">
        <Link href="/app/explore"><ArrowLeft size={16} /> Back to ideas</Link>
        <span>Member access verified</span>
      </div>
      <IdeaDetail idea={idea} mode="member" existingProjectId={existingProjectId} />
    </div>
  );
}
