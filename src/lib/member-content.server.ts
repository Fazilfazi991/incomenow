import "server-only";

import { ideas, getIdeaBySlug } from "@/content/ideas";
import { toIdeaCatalogEntry } from "@/content/idea-catalog";
import { requireActiveMembership } from "./membership.server";

export async function getProtectedIdeaCatalog() {
  await requireActiveMembership("/app/explore");
  return ideas.map(toIdeaCatalogEntry);
}

export async function getProtectedIdea(slug: string) {
  await requireActiveMembership(`/app/ideas/${encodeURIComponent(slug)}`);
  const idea = getIdeaBySlug(slug);
  return idea?.detailAvailable ? idea : null;
}
