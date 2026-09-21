import "server-only";

import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { publishedIdeas, getIdeaBySlug } from "@/content/ideas";
import { toIdeaCatalogEntry, type IdeaCatalogEntry } from "@/content/idea-catalog";
import type { Idea } from "@/content/idea-schema";
import { createClient } from "./supabase/server";
import { getIdeaAccessDecision, requireVerifiedAccount } from "./membership.server";

export type CatalogueAccess = "full" | "starter" | "starter-available" | "locked" | "not-published" | "unavailable";

export type BrowseableIdea = IdeaCatalogEntry & {
  access: CatalogueAccess;
  projectId: string | null;
};

export type IdeaRouteContent =
  | { kind: "full"; idea: Idea; access: "full" | "starter"; projectId: string | null }
  | { kind: "preview"; idea: IdeaCatalogEntry; access: Exclude<CatalogueAccess, "full" | "starter"> };

function catalogueAccess(
  ideaId: string,
  decision: ReturnType<typeof getIdeaAccessDecision>,
): CatalogueAccess {
  if (decision.status === "active") return decision.source === "full-membership" ? "full" : "starter";
  if (decision.status === "unavailable") return "unavailable";
  return ideaId === STARTER_IDEA_ID ? "starter-available" : "locked";
}

export async function getBrowseableIdeaCatalog(): Promise<BrowseableIdea[]> {
  const context = await requireVerifiedAccount("/app/explore");
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("id, idea_id");
  const projectByIdea = new Map((projects ?? []).map((project) => [project.idea_id, project.id]));

  return publishedIdeas.map((idea) => {
    const decision = getIdeaAccessDecision(context, idea.id);
    return {
      ...toIdeaCatalogEntry(idea),
      access: decision.status === "active" && !idea.detailAvailable ? "not-published" : catalogueAccess(idea.id, decision),
      projectId: projectByIdea.get(idea.id) ?? null,
    };
  });
}

export async function getIdeaRouteContent(slug: string): Promise<IdeaRouteContent | null> {
  const idea = getIdeaBySlug(slug);
  if (!idea?.published) return null;

  const context = await requireVerifiedAccount(`/app/ideas/${encodeURIComponent(slug)}`);
  const decision = getIdeaAccessDecision(context, idea.id);
  const access = catalogueAccess(idea.id, decision);
  if (decision.status !== "active" || !idea.detailAvailable) {
    return {
      kind: "preview",
      idea: toIdeaCatalogEntry(idea),
      access: decision.status === "active" ? "not-published" : access as Exclude<CatalogueAccess, "full" | "starter">,
    };
  }

  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("id").eq("idea_id", idea.id).maybeSingle();
  return {
    kind: "full",
    idea,
    access: decision.source === "full-membership" ? "full" : "starter",
    projectId: project?.id ?? null,
  };
}
