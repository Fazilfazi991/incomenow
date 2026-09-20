"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CirclePause, FileText, LoaderCircle, Play, Save, X } from "lucide-react";
import { loadStageNoteAction, saveStageNoteAction, setProjectPausedAction, setTaskCompletedAction } from "@/app/app/actions";
import type { MemberProjectWorkspace } from "@/lib/workspace.server";
import { IdeaResourceAction, resourceAvailabilityLabel } from "./idea-resource-action";

const stageCopy: Record<string, { title: string; summary?: string }> = {
  "crm-validate": { title: "Check the customer problem" },
  "crm-adapt": { title: "Explore and tailor the example" },
  "crm-offer": { title: "Decide what you will sell", summary: "Define the setup, training, handover, and support you will include." },
  "crm-research": { title: "Find suitable potential customers" },
  "crm-pilot": { title: "Show the example and agree a first project" },
  "crm-launch": { title: "Test, hand over, and support" },
};

const taskCopy: Record<string, { title: string; description?: string }> = {
  "scope-sheet": {
    title: "List what your customer will receive",
    description: "Your package might include branding changes, agreed configuration, and a handover session. Confirm the actual work before quoting.",
  },
  "ownership-support": { title: "Agree ownership and support limits" },
  "field-inventory": { title: "List the information the customer needs" },
  "scope-trim": { title: "Remove what the customer does not need" },
  "permission-tests": { title: "Check who can see and change information" },
  "recovery-ownership": { title: "Agree backup, recovery, and ownership" },
};

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

function displayStage(stage: MemberProjectWorkspace["stages"][number]) {
  return { ...stage, title: stageCopy[stage.id]?.title ?? stage.title, summary: stageCopy[stage.id]?.summary ?? stage.summary };
}

function displayTask(task: MemberProjectWorkspace["stages"][number]["tasks"][number]) {
  return { ...task, title: taskCopy[task.id]?.title ?? task.title, description: taskCopy[task.id]?.description ?? task.description };
}

export function ProjectWorkspace({ initialProject, selectedStageId }: { initialProject: MemberProjectWorkspace; selectedStageId: string }) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const selected = project.stages.find((stage) => stage.id === selectedStageId) ?? project.stages[0];
  const selectedDisplay = displayStage(selected);
  const [draft, setDraft] = useState(selected.note.content);
  const [savedContent, setSavedContent] = useState(selected.note.content);
  const [revision, setRevision] = useState(selected.note.revision);
  const [savedAt, setSavedAt] = useState(selected.note.updated_at);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = draft !== savedContent;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const requiredStages = useMemo(() => project.stages.filter((stage) => stage.tasks.some((task) => task.required)), [project.stages]);
  const completedStageCount = requiredStages.filter((stage) => stage.tasks.filter((task) => task.required).every((task) => task.completedAt)).length;
  const progressPercent = requiredStages.length ? Math.round((completedStageCount / requiredStages.length) * 100) : 0;
  const complete = requiredStages.length > 0 && completedStageCount === requiredStages.length;
  const currentFocus = requiredStages.find((stage) => stage.tasks.some((task) => task.required && !task.completedAt));
  const paused = Boolean(project.pausedAt);

  const saveNote = async () => {
    setFeedback(null);
    setConflict(false);
    const result = await saveStageNoteAction(project.id, selected.id, draft, revision);
    if (!result.ok) {
      setFeedback(result.error);
      setConflict(result.code === "conflict");
      return false;
    }
    const saved = result.data!;
    setSavedContent(saved.content);
    setDraft(saved.content);
    setRevision(saved.revision);
    setSavedAt(saved.updatedAt);
    setProject((current) => ({ ...current, stages: current.stages.map((stage) => stage.id === selected.id ? { ...stage, note: { content: saved.content, revision: saved.revision, updated_at: saved.updatedAt } } : stage) }));
    setFeedback("Note saved to your account.");
    return true;
  };

  const reviewLatestNote = async () => {
    const result = await loadStageNoteAction(project.id, selected.id);
    if (!result.ok) return setFeedback(result.error);
    setSavedContent(result.data!.content);
    setRevision(result.data!.revision);
    setSavedAt(result.data!.updatedAt);
    setConflict(false);
    setFeedback("Latest saved version loaded for comparison. Your draft is unchanged.");
  };

  const navigate = (href: string) => {
    if (dirty) setNavigationTarget(href);
    else router.push(href);
  };

  const toggleTask = (taskId: string, completed: boolean) => {
    const previous = project;
    setFeedback(null);
    setPendingTask(taskId);
    setProject((current) => ({ ...current, stages: current.stages.map((stage) => stage.id === selected.id ? { ...stage, tasks: stage.tasks.map((task) => task.id === taskId ? { ...task, completedAt: completed ? new Date().toISOString() : null } : task) } : stage) }));
    startTransition(async () => {
      const result = await setTaskCompletedAction(project.id, selected.id, taskId, completed);
      setPendingTask(null);
      if (!result.ok) {
        setProject(previous);
        setFeedback(result.error);
      } else {
        setProject((current) => ({ ...current, stages: current.stages.map((stage) => stage.id === selected.id ? { ...stage, tasks: stage.tasks.map((task) => task.id === taskId ? { ...task, completedAt: result.data?.completedAt ?? null } : task) } : stage) }));
        router.refresh();
      }
    });
  };

  const togglePaused = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await setProjectPausedAction(project.id, !paused);
      if (!result.ok) setFeedback(result.error);
      else {
        setProject((current) => ({ ...current, pausedAt: paused ? null : new Date().toISOString() }));
        router.refresh();
      }
    });
  };

  const resources = selected.resourceIds.map((id) => project.idea.resources.find((resource) => resource.id === id)).filter((resource): resource is NonNullable<typeof resource> => Boolean(resource));
  const kitTitle = project.idea.kitTitle ?? project.idea.title;
  const currentFocusTitle = currentFocus ? displayStage(currentFocus).title : selectedDisplay.title;

  return (
    <div className="workspace-page">
      <header className="workspace-hero">
        <button className="workspace-back" type="button" onClick={() => navigate(`/app/ideas/${project.idea.slug}`)}><ArrowLeft size={16} /> Back to kit</button>
        <div className="workspace-title-row">
          <div><div className="tag-row"><span className="tag strong">IDEA #{project.idea.displayNumber}</span><span className={`project-status ${complete ? "complete" : paused ? "paused" : "active"}`}>{complete ? "Complete" : paused ? "Paused" : "Active"}</span></div><h1>My checklist — {kitTitle}</h1><p>Use this optional checklist to track your preparation.</p></div>
          <button type="button" className="text-button workspace-pause" onClick={togglePaused} disabled={pending || complete}>{pending ? <LoaderCircle className="control-spinner" size={16} /> : paused ? <Play size={16} /> : <CirclePause size={16} />}{paused ? "Resume checklist" : complete ? "Checklist complete" : "Pause checklist"}</button>
        </div>
        <div className="workspace-progress"><div><span>{paused ? `Paused · ${currentFocusTitle}` : `Current step: ${currentFocusTitle}`}</span><strong>{completedStageCount}/{requiredStages.length} steps · {progressPercent}%</strong></div><div className="progress-track"><i style={{ width: `${progressPercent}%` }} /></div></div>
      </header>

      {feedback ? <div className={conflict ? "status-note warning" : feedback.includes("saved") || feedback.includes("loaded") ? "status-note success" : "status-note error"} role={feedback.includes("saved") || feedback.includes("loaded") ? "status" : "alert"}><span>{feedback}</span>{conflict ? <button type="button" onClick={reviewLatestNote}>Review latest saved version</button> : null}<button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss"><X size={15} /></button></div> : null}

      <main className="workspace-content">
        <details className="all-steps">
          <summary>Your steps <span>{selected.position} of {project.stages.length}</span><ChevronDown size={17} /></summary>
          <ol>{project.stages.map((stage) => {
            const stageComplete = stage.tasks.filter((task) => task.required).every((task) => task.completedAt);
            const stageDisplay = displayStage(stage);
            return <li key={stage.id}><button type="button" className={stage.id === selected.id ? "active" : ""} onClick={() => navigate(`/app/projects/${project.id}?stage=${stage.id}`)}><span>{stageComplete ? <Check size={14} /> : stage.position}</span><span><strong>{stageDisplay.title}</strong><small>{stage.tasks.filter((task) => task.completedAt).length}/{stage.tasks.length} items</small></span></button></li>;
          })}</ol>
        </details>

        <section className="workspace-stage-heading"><div><span>Current step {selected.position} of {project.stages.length}</span><h2>{selectedDisplay.title}</h2><p>{selectedDisplay.summary}</p></div>{selected.condition ? <div className="stage-condition">{selected.condition}</div> : null}</section>

        <section className="workspace-panel checklist-panel">
          <div className="workspace-panel-heading"><div><h3>What to prepare</h3><p>Progress counts required items only.</p></div><span>{selected.tasks.filter((task) => task.completedAt).length}/{selected.tasks.length}</span></div>
          <div className="workspace-task-list">{selected.tasks.map((task) => {
            const checked = Boolean(task.completedAt);
            const taskDisplay = displayTask(task);
            return <label className={checked ? "workspace-task checked" : "workspace-task"} key={task.id}><input type="checkbox" checked={checked} disabled={paused || pendingTask === task.id} onChange={(event) => toggleTask(task.id, event.target.checked)} /><span className="task-check">{pendingTask === task.id ? <LoaderCircle className="control-spinner" size={15} /> : checked ? <Check size={15} /> : null}</span><span><strong>{taskDisplay.title}</strong><small>{taskDisplay.description}</small></span>{task.required ? <em>Required</em> : <em>Optional</em>}</label>;
          })}</div>
        </section>

        <details className="workspace-panel notes-panel notes-disclosure">
          <summary><div><h3>{draft ? "My notes" : "Add a personal note"}</h3><p>Private to your account · last saved {formatSavedAt(savedAt)}</p></div><span>{dirty ? "Unsaved" : draft ? "Saved" : "Optional"}<ChevronDown size={16} /></span></summary>
          <div className="notes-body">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} disabled={paused} placeholder="Record a decision, question, or next follow-up…" aria-label={`Notes for ${selectedDisplay.title}`} />
            <div className="notes-actions"><span>{draft.length}/4,000</span><button type="button" className="text-button" disabled={!dirty || paused || pending} onClick={() => setDraft(savedContent)}>Cancel changes</button><button type="button" className="primary-button" disabled={!dirty || paused || pending} onClick={() => startTransition(async () => { await saveNote(); })}>{pending ? <LoaderCircle className="control-spinner" size={16} /> : <Save size={16} />}Save note</button></div>
          </div>
        </details>

        {resources.length ? <section className="workspace-panel resources-panel"><div className="workspace-panel-heading"><div><h3>Helpful resources</h3><p>Use only the items relevant to this step.</p></div></div><div className="workspace-resources">{resources.map((resource) => <article key={resource.id}><span><FileText size={17} /></span><div><strong>{resource.label}</strong><p>{resource.description}</p><IdeaResourceAction resource={resource} /></div><em>{resourceAvailabilityLabel(resource.availability)}</em></article>)}</div></section> : null}

        <div className="workspace-next"><button type="button" className="secondary-button" disabled={selected.position === 1} onClick={() => navigate(`/app/projects/${project.id}?stage=${project.stages[selected.position - 2]?.id}`)}>Previous step</button><button type="button" className="primary-button" disabled={selected.position === project.stages.length} onClick={() => navigate(`/app/projects/${project.id}?stage=${project.stages[selected.position]?.id}`)}>Next step <ArrowRight size={15} /></button></div>
      </main>

      {navigationTarget ? <div className="decision-backdrop" role="presentation"><div className="decision-dialog" role="dialog" aria-modal="true" aria-labelledby="unsaved-title"><h2 id="unsaved-title">Save your note?</h2><p>You have unsaved changes. Save them, discard them, or stay here to keep editing.</p><div><button type="button" className="secondary-button" onClick={() => setNavigationTarget(null)}>Stay here</button><button type="button" className="text-button danger" onClick={() => { const target = navigationTarget; setDraft(savedContent); setNavigationTarget(null); router.push(target); }}>Discard changes</button><button type="button" className="primary-button" onClick={() => startTransition(async () => { if (await saveNote()) { const target = navigationTarget; setNavigationTarget(null); if (target) router.push(target); } })}>Save and continue</button></div></div></div> : null}
    </div>
  );
}
