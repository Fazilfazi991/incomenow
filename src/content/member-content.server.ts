import "server-only";

import { ideas, getIdeaBySlug } from "./ideas";
import { toIdeaCatalogEntry } from "./idea-catalog";
import { requireActiveMembership } from "@/lib/membership.server";

export async function getProtectedIdeaCatalog() {
  await requireActiveMembership("/app/explore");
  return ideas.map(toIdeaCatalogEntry);
}

export async function getProtectedIdea(slug: string) {
  await requireActiveMembership(`/app/ideas/${slug}`);
  const idea = getIdeaBySlug(slug);
  return idea?.detailAvailable ? idea : null;
}
