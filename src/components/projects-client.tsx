"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, CirclePause, FolderKanban, LoaderCircle, Play, Search, X } from "lucide-react";
import { setProjectPausedAction } from "@/app/app/actions";
import type { MemberProjectSummary } from "@/lib/workspace.server";

type ProjectFilter = "all" | "active" | "paused" | "complete";

function projectState(project: MemberProjectSummary): Exclude<ProjectFilter, "all"> {
  if (project.progress.isComplete) return "complete";
  return project.pausedAt ? "paused" : "active";
}

export function ProjectsClient({ projects }: { projects: MemberProjectSummary[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const filter = (searchParams.get("status") as ProjectFilter | null) ?? "all";
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const results = useMemo(() => projects.filter((project) => {
    const matchesStatus = filter === "all" || projectState(project) === filter;
    const haystack = `${project.idea.title} ${project.idea.displayNumber} ${project.currentStageTitle}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase().trim());
  }), [filter, projects, query]);

  const update = (values: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => value && value !== "all" ? next.set(key, value) : next.delete(key));
    router.replace(`/app/projects${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const togglePaused = (project: MemberProjectSummary) => {
    setFeedback(null);
    setPendingId(project.id);
    startTransition(async () => {
      const result = await setProjectPausedAction(project.id, !project.pausedAt);
      setPendingId(null);
      if (!result.ok) setFeedback(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="page-stack projects-page">
      <header className="page-heading">
        <div><h1>My projects</h1><p>Continue active work, resume a paused plan, or review completed progress.</p></div>
        <Link className="primary-button" href="/app/explore">Start from an idea <ArrowRight size={16} /></Link>
      </header>

      {feedback ? <div className="status-note error" role="alert">{feedback}<button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss"><X size={15} /></button></div> : null}

      <section className="project-controls" aria-label="Project filters">
        <label className="search-field"><Search size={18} /><span className="sr-only">Search projects</span><input value={query} onChange={(event) => update({ q: event.target.value })} placeholder="Search your projects..." />{query ? <button type="button" onClick={() => update({ q: "" })} aria-label="Clear search"><X size={16} /></button> : null}</label>
        <div className="chip-row">
          {(["all", "active", "paused", "complete"] as const).map((status) => <button type="button" className={filter === status ? "filter-chip active" : "filter-chip"} key={status} onClick={() => update({ status })}>{status === "all" ? `All (${projects.length})` : `${status[0].toUpperCase()}${status.slice(1)} (${projects.filter((project) => projectState(project) === status).length})`}</button>)}
        </div>
      </section>

      {!projects.length ? (
        <section className="empty-state"><FolderKanban size={29} /><h2>No projects yet</h2><p>Open a detailed idea and start its implementation plan. Saving an idea does not create a project.</p><Link className="primary-button" href="/app/explore">Explore ideas <ArrowRight size={16} /></Link></section>
      ) : results.length ? (
        <section className="project-grid" aria-label="Project results">
          {results.map((project) => {
            const state = projectState(project);
            return (
              <article className="project-card" key={project.id}>
                <div className="project-card-top"><span className={`project-status ${state}`}>{state === "complete" ? <CheckCircle2 size={14} /> : state === "paused" ? <CirclePause size={14} /> : <Play size={14} />}{state === "complete" ? "Complete" : state === "paused" ? "Paused" : "Active"}</span><span>IDEA #{project.idea.displayNumber}</span></div>
                <div><h2>{project.idea.title}</h2><p>{project.progress.isComplete ? "Implementation checklist complete." : `Current focus: ${project.currentStageTitle}`}</p>{!project.progress.isComplete ? <p className="project-next-action"><strong>Next action:</strong> {project.nextActionTitle}</p> : null}</div>
                <div className="project-progress"><div><span>{project.progress.completed} of {project.progress.total} stages complete</span><strong>{project.progress.percent}%</strong></div><div className="progress-track"><i style={{ width: `${project.progress.percent}%` }} /></div></div>
                <div className="project-card-actions"><Link className="primary-button" href={`/app/projects/${project.id}`}>{state === "complete" ? "Review project" : "Continue project"} <ArrowRight size={15} /></Link><div className="project-card-secondary"><Link className="text-button" href={`/app/ideas/${project.idea.slug}`}>View original idea</Link>{state !== "complete" ? <button type="button" className="text-button" disabled={pending && pendingId === project.id} onClick={() => togglePaused(project)}>{pending && pendingId === project.id ? <LoaderCircle className="control-spinner" size={15} /> : project.pausedAt ? <Play size={15} /> : <CirclePause size={15} />}{project.pausedAt ? "Resume" : "Pause"}</button> : null}</div></div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-state"><Search size={27} /><h2>No projects match</h2><p>Change the search or status filter to find your project.</p><button type="button" className="secondary-button" onClick={() => router.replace("/app/projects")} >Clear filters</button></section>
      )}
    </div>
  );
}
