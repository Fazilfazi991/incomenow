import "server-only";

import { publishedIdeas } from "./ideas";
import { toPublicIdea } from "./public-idea";
import { withPrivateResourceAvailability } from "@/lib/private-resources.server";

export async function getPublicIdeas() {
  const provisionedIdeas = await Promise.all(publishedIdeas.map(withPrivateResourceAvailability));
  return provisionedIdeas.map(toPublicIdea);
}
