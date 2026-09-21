import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IdeaDetail } from "@/components/idea-detail";
import { InteractiveIdeaKit, type KitProjectProgress } from "@/components/interactive-idea-kit";
import { LockedIdeaDetail } from "@/components/locked-idea-detail";
import { projectStageCopy } from "@/content/project-copy";
import { isInteractiveKitIdea, isKitSectionSlug } from "@/lib/kit-sections";
import { getIdeaRouteContent } from "@/lib/member-content.server";
import { getClinicProspects } from "@/lib/clinic-prospects.server";
import { getPergolaProspects } from "@/lib/pergola-prospects.server";
import { getMemberProject } from "@/lib/workspace.server";

export const metadata: Metadata = { title: "Member idea" };
export const dynamic = "force-dynamic";

type IdeaPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ section?: string | string[] }>;
};

export default async function MemberIdeaPage({ params, searchParams }: IdeaPageProps) {
  const { slug } = await params;
  const requestedSection = (await searchParams).section;
  const content = await getIdeaRouteContent(slug);
  if (!content) notFound();

  const hasInteractiveKit = content.kind === "full" && isInteractiveKitIdea(content.idea.id);
  const selectedSection = hasInteractiveKit && typeof requestedSection === "string" && isKitSectionSlug(content.idea.id, requestedSection) ? requestedSection : null;
  if (hasInteractiveKit && requestedSection !== undefined && !selectedSection) redirect(`/app/ideas/${encodeURIComponent(slug)}`);

  let projectProgress: KitProjectProgress | null = null;
  const prospects = hasInteractiveKit && selectedSection === "customers" ? await getPergolaProspects() : [];
  const clinicProspects = hasInteractiveKit && content.idea.id === "idea-002" && selectedSection === "clinics" && content.access === "full"
    ? await getClinicProspects()
    : null;
  if (hasInteractiveKit && content.projectId) {
    const project = await getMemberProject(content.projectId);
    if (project) {
      const requiredStages = project.stages.filter((stage) => stage.tasks.some((task) => task.required));
      const stageProgress = requiredStages.map((stage) => ({
        id: stage.id,
        title: projectStageCopy(stage).title,
        complete: stage.tasks.filter((task) => task.required).every((task) => Boolean(task.completedAt)),
      }));
      const meaningful = project.stages.some((stage) => stage.tasks.some((task) => Boolean(task.completedAt)) || Boolean(stage.note.content.trim()));
      const currentStage = stageProgress.find((stage) => !stage.complete);
      projectProgress = {
        id: project.id,
        meaningful,
        isComplete: project.progress.isComplete,
        paused: Boolean(project.pausedAt),
        completedStageCount: stageProgress.filter((stage) => stage.complete).length,
        totalStageCount: stageProgress.length,
        currentStageTitle: project.progress.isComplete ? "Review your completed checklist" : currentStage?.title ?? project.currentStageTitle,
        nextActionTitle: project.nextActionTitle,
        stages: stageProgress,
      };
    }
  }

  return (
    <div className="idea-route">
      <div className="route-bar">
        <Link href="/app/explore"><ArrowLeft size={16} /> Back to ideas</Link>
        <span>{content.kind === "full" ? content.access === "starter" ? "Starter idea access verified" : "Full membership access verified" : "Safe catalogue preview"}</span>
      </div>
      {content.kind === "full"
        ? hasInteractiveKit
          ? <InteractiveIdeaKit basePath={`/app/ideas/${content.idea.slug}`} clinicProspects={clinicProspects} idea={content.idea} project={projectProgress} prospects={prospects} selectedSection={selectedSection} />
          : <IdeaDetail idea={content.idea} mode="member" existingProjectId={content.projectId} />
        : <LockedIdeaDetail idea={content.idea} access={content.access} />}
    </div>
  );
}
