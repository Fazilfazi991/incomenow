import "server-only";

import { publishedIdeas } from "./ideas";
import { toPublicIdea } from "./public-idea";

export function getPublicIdeas() {
  return publishedIdeas.map(toPublicIdea);
}
