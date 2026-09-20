import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsClient } from "@/components/projects-client";
import { getMemberProjects } from "@/lib/workspace.server";

export const metadata: Metadata = { title: "My projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getMemberProjects();
  return <Suspense fallback={<div className="page-loading">Loading your projects…</div>}><ProjectsClient projects={projects} /></Suspense>;
}
