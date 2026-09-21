"use client";

import Link from "next/link";
import { startTransition, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CircleAlert, Filter, FolderKanban, RotateCcw, Search, Sparkles, X } from "lucide-react";
import type { IdeaCatalogEntry } from "@/content/idea-catalog";
import type { BrowseableIdea } from "@/lib/member-content.server";
import type { Readiness, SolutionType } from "@/content/idea-schema";
import { filterIdeas, hasActiveFilters, type IdeaFilters, type IdeaSort } from "@/lib/idea-filter";
import { IdeaCard } from "./idea-card";

const solutionOptions: Array<SolutionType | "all"> = [
  "all",
  "Custom CRM",
  "Lead-generation website",
  "Automation",
  "Web tool",
  "Digital service",
];

function ExploreAccountFeature({ source }: { source: BrowseableIdea[] }) {
  const pergola = source.find((idea) => idea.id === "idea-001");
  const fullMember = source.some((idea) => idea.access === "full");

  if (!pergola) return null;
  if (pergola.access === "unavailable") {
    return (
      <aside className="explore-account-feature warning">
        <CircleAlert aria-hidden="true" size={19} />
        <div><strong>Access temporarily unavailable</strong><span>Your safe catalogue is still here while the account check is retried.</span></div>
        <Link href="/app/explore">Retry</Link>
      </aside>
    );
  }

  if (pergola.access === "starter" || fullMember) {
    const continueChecklist = Boolean(pergola.projectId);
    return (
      <aside className="explore-account-feature active">
        <FolderKanban aria-hidden="true" size={19} />
        <div>
          <strong>{fullMember ? "Continue your library" : "Your Pergola starter"}</strong>
          <span>{continueChecklist ? "Your saved Pergola checklist is ready." : fullMember ? "Open any included published kit." : "Open the kit and choose your next activity."}</span>
        </div>
        <Link href={continueChecklist ? `/app/projects/${pergola.projectId}` : `/app/ideas/${pergola.slug}`}>
          {continueChecklist ? "Continue checklist" : "Open kit"} <ArrowRight aria-hidden="true" size={15} />
        </Link>
      </aside>
    );
  }

  return (
    <aside className="explore-account-feature">
      <Sparkles aria-hidden="true" size={19} />
      <div><strong>Start with the Pergola kit for US$1</strong><span>One focused business kit and one personal project.</span></div>
      <Link href="/membership?offer=starter#starter-offer">Review starter <ArrowRight aria-hidden="true" size={15} /></Link>
    </aside>
  );
}

export function ExploreClient({ source, mode = "preview" }: { source: Array<IdeaCatalogEntry | BrowseableIdea>; mode?: "preview" | "member" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: IdeaFilters = useMemo(() => ({
    query: searchParams.get("q") ?? "",
    solutionType: (searchParams.get("type") as SolutionType | "all" | null) ?? "all",
    industry: searchParams.get("industry") ?? "",
    readiness: (searchParams.get("readiness") as Readiness | "all" | null) ?? "all",
    sort: (searchParams.get("sort") as IdeaSort | null) ?? "recent",
  }), [searchParams]);

  const query = filters.query ?? "";
  const industries = useMemo(() => [...new Set(source.flatMap((idea) => idea.industries))].sort(), [source]);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "recent")) next.delete(key);
      else next.set(key, value);
    });
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false }));
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    updateParams({ q: query.trim() });
  };

  const reset = () => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const results = filterIdeas(source, filters);
  const active = hasActiveFilters(filters);
  const additionalCount = Number(Boolean(filters.industry)) + Number(filters.readiness !== "all");

  return (
    <div className="page-stack">
      <header className="page-heading explore-heading">
        <div>
          <div className="context-row"><span className="preview-dot" /> {mode === "member" ? "Your idea library" : "Local sample library"}</div>
          <h1>Explore ideas</h1>
          <p>Find a business idea, explore the kit, and choose your next move.</p>
        </div>
        {mode === "member" ? <ExploreAccountFeature source={source as BrowseableIdea[]} /> : null}
      </header>

      <section className="filter-panel" aria-label="Idea discovery controls">
        <div className="filter-top-row">
          <form className="search-field" role="search" onSubmit={submitSearch}>
            <Search aria-hidden="true" size={19} />
            <input value={query} onChange={(event) => updateParams({ q: event.target.value })} placeholder="Search ideas, industries, types, or IDEA #..." aria-label="Search ideas" />
            {query ? <button type="button" onClick={() => updateParams({ q: "" })} aria-label="Clear search"><X size={17} /></button> : null}
          </form>

          <label className="select-control">
            <span className="sr-only">Sort ideas</span>
            <select value={filters.sort} onChange={(event) => updateParams({ sort: event.target.value })}>
              <option value="recent">Recently added</option>
              <option value="number">Idea #</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>

          <details className="advanced-filters">
            <summary><Filter aria-hidden="true" size={17} /> Filters {additionalCount ? <b>{additionalCount}</b> : null}</summary>
            <div className="advanced-panel">
              <label>Industry
                <select value={filters.industry} onChange={(event) => updateParams({ industry: event.target.value })}>
                  <option value="">All industries</option>
                  {industries.map((industry) => <option key={industry}>{industry}</option>)}
                </select>
              </label>
              <label>Implementation readiness
                <select value={filters.readiness} onChange={(event) => updateParams({ readiness: event.target.value })}>
                  <option value="all">All readiness states</option>
                  <option value="Concept ready">Concept ready</option>
                  <option value="Sample blueprint">Sample blueprint</option>
                  <option value="Setup ready">Setup ready</option>
                </select>
              </label>
              {active ? <button type="button" className="text-button" onClick={reset}><RotateCcw size={15} />Reset all</button> : null}
            </div>
          </details>
        </div>

        <div className="chip-row" role="group" aria-label="Filter by solution type">
          {solutionOptions.map((type) => (
            <button
              type="button"
              key={type}
              className={(filters.solutionType ?? "all") === type ? "filter-chip active" : "filter-chip"}
              onClick={() => updateParams({ type })}
            >
              {type === "all" ? "All ideas" : type === "Custom CRM" ? "Custom CRMs" : type === "Lead-generation website" ? "Lead-generation websites" : type === "Automation" ? "Automations" : type === "Web tool" ? "Web tools" : "Digital services"}
            </button>
          ))}
        </div>

        <p className="result-count">Showing {results.length} practical {results.length === 1 ? "opportunity" : "opportunities"}</p>
      </section>

      {results.length ? (
        <section className="idea-grid idea-grid-transition" aria-label="Idea results" key={searchParams.toString()}>
          {results.map((idea) => <IdeaCard idea={idea} key={idea.id} basePath={mode === "member" ? "/app/ideas" : "/preview/ideas"} bookmarkMode={mode} access={"access" in idea ? idea.access : undefined} projectId={"projectId" in idea ? idea.projectId : null} />)}
        </section>
      ) : (
        <section className="empty-state">
          <Search aria-hidden="true" size={26} />
          <h2>No matching opportunities</h2>
          <p>Try a different search or reset the filters to see the full sample library.</p>
          <button type="button" className="secondary-button" onClick={reset}><RotateCcw size={16} /> Clear search & filters</button>
        </section>
      )}
    </div>
  );
}
