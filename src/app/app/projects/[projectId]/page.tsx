import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/project-workspace";
import { getMemberProject } from "@/lib/workspace.server";

export const metadata: Metadata = { title: "Project workspace" };
export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ stage?: string }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await getMemberProject(projectId);
  if (!project) notFound();
  const requestedStage = (await searchParams).stage;
  const selectedStageId = project.stages.some((stage) => stage.id === requestedStage)
    ? requestedStage!
    : project.stages.find((stage) => !stage.progress.isComplete)?.id ?? project.stages[0]?.id;
  if (!selectedStageId) notFound();
  return <ProjectWorkspace key={selectedStageId} initialProject={project} selectedStageId={selectedStageId} />;
}
