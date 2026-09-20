"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Bookmark, Filter, RotateCcw, Search, X } from "lucide-react";
import type { SolutionType } from "@/content/idea-schema";
import type { BrowseableIdea } from "@/lib/member-content.server";
import { filterIdeas, type IdeaSort } from "@/lib/idea-filter";
import { IdeaCard } from "./idea-card";
import { useMemberBookmarks } from "./member-bookmark-provider";

const solutionOptions: Array<SolutionType | "all"> = ["all", "Custom CRM", "Lead-generation website", "Automation", "Web tool", "Digital service"];

export function AccountSavedClient({ initialIdeaIds, catalog }: { initialIdeaIds: string[]; catalog: BrowseableIdea[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { savedIds, setSaved, feedback, clearFeedback } = useMemberBookmarks();
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);
  const orderedIds = useMemo(() => [...savedIds].sort((a, b) => initialIdeaIds.indexOf(a) - initialIdeaIds.indexOf(b)), [initialIdeaIds, savedIds]);
  const ideaById = useMemo(() => new Map(catalog.map((idea) => [idea.id, idea])), [catalog]);
  const savedIdeas = useMemo(() => orderedIds.map((ideaId) => ideaById.get(ideaId)).filter((idea): idea is BrowseableIdea => Boolean(idea)), [ideaById, orderedIds]);
  const query = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") as SolutionType | "all" | null) ?? "all";
  const sort = (searchParams.get("sort") as IdeaSort | null) ?? "recent";
  const results = filterIdeas(savedIdeas, { query, solutionType: type, sort });

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "recent")) next.delete(key);
      else next.set(key, value);
    });
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false }));
  };

  return (
    <div className="page-stack">
      <header className="page-heading saved-heading">
        <div><h1>Saved ideas</h1><p>Keep a shortlist of opportunities you want to compare, validate, or turn into a project.</p></div>
        <Link className="secondary-button" href="/app/explore">Browse ideas <ArrowRight size={16} /></Link>
      </header>

      {feedback ? <div className="status-note error" role="alert">{feedback}<button type="button" onClick={clearFeedback} aria-label="Dismiss"><X size={15} /></button></div> : null}

      <section className="filter-panel saved-filter-panel" aria-label="Saved idea controls">
        <div className="filter-top-row">
          <form className="search-field" role="search" onSubmit={(event) => { event.preventDefault(); updateParams({ q: query.trim() }); }}>
            <Search aria-hidden="true" size={19} /><input value={query} onChange={(event) => updateParams({ q: event.target.value })} placeholder="Search your saved ideas..." aria-label="Search saved ideas" />
            {query ? <button type="button" onClick={() => updateParams({ q: "" })} aria-label="Clear search"><X size={17} /></button> : null}
          </form>
          <label className="select-control"><span className="sr-only">Sort saved ideas</span><select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}><option value="recent">Recently saved</option><option value="number">Idea #</option><option value="title">Title A–Z</option></select></label>
        </div>
        <div className="saved-filter-bottom">
          <div className="chip-row" role="group" aria-label="Filter saved ideas by solution type">
            {solutionOptions.map((option) => <button type="button" key={option} className={type === option ? "filter-chip active" : "filter-chip"} onClick={() => updateParams({ type: option })}>{option === "all" ? "All types" : option}</button>)}
          </div>
          <p className="result-count">Showing {results.length} saved {results.length === 1 ? "opportunity" : "opportunities"}</p>
        </div>
      </section>

      {!savedIdeas.length ? (
        <section className="empty-state saved-empty"><Bookmark aria-hidden="true" size={28} /><h2>Your shortlist starts here</h2><p>Save promising ideas from the exploration library. Your shortlist follows this account across sessions.</p><Link className="primary-button" href="/app/explore">Explore ideas <ArrowRight size={16} /></Link></section>
      ) : results.length ? (
        <section className="idea-grid saved-grid" aria-label="Saved idea results">
          {results.map((idea) => <div className="saved-card-wrap" key={idea.id}><IdeaCard idea={idea} savedView bookmarkMode="member" basePath="/app/ideas" access={idea.access} projectId={idea.projectId} onRemove={() => setLastRemoved(idea.id)} /><button type="button" className="remove-link" onClick={async () => { if (await setSaved(idea.id, false)) setLastRemoved(idea.id); }}>Remove from saved</button></div>)}
        </section>
      ) : (
        <section className="empty-state"><Filter aria-hidden="true" size={26} /><h2>No saved ideas match</h2><p>Try another search or clear the filters to see your full shortlist.</p><button type="button" className="secondary-button" onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}><RotateCcw size={16} /> Clear search & filters</button></section>
      )}

      {lastRemoved ? <div className="undo-toast" role="status"><span>Idea removed from your account.</span><button type="button" onClick={async () => { await setSaved(lastRemoved, true); setLastRemoved(null); }}>Undo</button><button type="button" aria-label="Dismiss" onClick={() => setLastRemoved(null)}><X size={16} /></button></div> : null}
    </div>
  );
}
