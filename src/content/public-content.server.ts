import "server-only";

import { ideas } from "./ideas";
import { isPublicIdeaId, toPublicIdea } from "./public-idea";

export function getPublicIdeas() {
  return ideas.filter((idea) => isPublicIdeaId(idea.id)).map(toPublicIdea);
}
