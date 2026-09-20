"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Bookmark, Filter, RotateCcw, Search, X } from "lucide-react";
import { getIdeaById } from "@/content/ideas";
import type { SolutionType } from "@/content/idea-schema";
import { filterIdeas, type IdeaSort } from "@/lib/idea-filter";
import { IdeaCard } from "./idea-card";
import { useBookmarks } from "./bookmark-provider";

const solutionOptions: Array<SolutionType | "all"> = ["all", "Custom CRM", "Lead-generation website", "Automation", "Web tool", "Digital service"];

export function SavedClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { savedIds, remove, save, storageAvailable } = useBookmarks();
  const query = searchParams.get("q") ?? "";
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);

  const type = (searchParams.get("type") as SolutionType | "all" | null) ?? "all";
  const sort = (searchParams.get("sort") as IdeaSort | null) ?? "recent";
  const savedIdeas = useMemo(() => savedIds.map(getIdeaById).filter((idea): idea is NonNullable<typeof idea> => Boolean(idea)), [savedIds]);
  const results = filterIdeas(savedIdeas, { query: searchParams.get("q") ?? "", solutionType: type, sort });

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "recent")) next.delete(key);
      else next.set(key, value);
    });
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false }));
  };

  const resetFilters = () => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const removeWithUndo = (ideaId: string) => {
    remove(ideaId);
    setLastRemoved(ideaId);
  };

  const undo = () => {
    if (lastRemoved) save(lastRemoved);
    setLastRemoved(null);
  };

  return (
    <div className="page-stack">
      <header className="page-heading saved-heading">
        <div>
          <div className="context-row"><span className="preview-dot" /> Local preview — sample data</div>
          <h1>Saved ideas</h1>
          <p>Keep a shortlist of opportunities you want to compare, validate, or revisit.</p>
        </div>
        <Link className="secondary-button" href="/preview/explore">Browse ideas <ArrowRight size={16} /></Link>
      </header>

      {!storageAvailable ? <div className="status-note">Your browser blocked local storage. Bookmarks will last only until this page is closed.</div> : null}

      <section className="filter-panel saved-filter-panel" aria-label="Saved idea controls">
        <div className="filter-top-row">
          <form className="search-field" role="search" onSubmit={(event) => { event.preventDefault(); updateParams({ q: query.trim() }); }}>
            <Search aria-hidden="true" size={19} />
            <input value={query} onChange={(event) => updateParams({ q: event.target.value })} placeholder="Search your saved ideas..." aria-label="Search saved ideas" />
            {query ? <button type="button" onClick={() => updateParams({ q: "" })} aria-label="Clear search"><X size={17} /></button> : null}
          </form>
          <label className="select-control"><span className="sr-only">Sort saved ideas</span><select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}><option value="recent">Recently saved</option><option value="number">Idea #</option><option value="title">Title A–Z</option></select></label>
        </div>
        <div className="saved-filter-bottom">
          <div className="chip-row" role="group" aria-label="Filter saved ideas by solution type">
            {solutionOptions.map((option) => <button type="button" key={option} className={type === option ? "filter-chip active" : "filter-chip"} onClick={() => updateParams({ type: option })}>{option === "all" ? "All types" : option === "Custom CRM" ? "Custom CRMs" : option === "Lead-generation website" ? "Lead-generation websites" : option === "Automation" ? "Automations" : option === "Web tool" ? "Web tools" : "Digital services"}</button>)}
          </div>
          <p className="result-count">Showing {results.length} saved {results.length === 1 ? "opportunity" : "opportunities"}</p>
        </div>
      </section>

      {!savedIdeas.length ? (
        <section className="empty-state saved-empty">
          <Bookmark aria-hidden="true" size={28} />
          <h2>Your shortlist starts here</h2>
          <p>Save promising ideas from the exploration library to compare their workflows and resources here.</p>
          <Link className="primary-button" href="/preview/explore">Explore ideas <ArrowRight size={16} /></Link>
        </section>
      ) : results.length ? (
        <section className="idea-grid saved-grid" aria-label="Saved idea results">
          {results.map((idea) => <div className="saved-card-wrap" key={idea.id}><IdeaCard idea={idea} savedView onRemove={() => removeWithUndo(idea.id)} /><button type="button" className="remove-link" onClick={() => removeWithUndo(idea.id)}>Remove from saved</button></div>)}
        </section>
      ) : (
        <section className="empty-state">
          <Filter aria-hidden="true" size={26} />
          <h2>No saved ideas match</h2>
          <p>Try another search or clear the filters to see your full shortlist.</p>
          <button type="button" className="secondary-button" onClick={resetFilters}><RotateCcw size={16} /> Clear search & filters</button>
        </section>
      )}

      {lastRemoved ? (
        <div className="undo-toast" role="status">
          <span>Idea removed from saved.</span>
          <button type="button" onClick={undo}>Undo</button>
          <button type="button" aria-label="Dismiss" onClick={() => setLastRemoved(null)}><X size={16} /></button>
        </div>
      ) : null}
    </div>
  );
}
