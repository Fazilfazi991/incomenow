import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreClient } from "@/components/explore-client";
import { toIdeaCatalogEntry } from "@/content/idea-catalog";
import { ideas } from "@/content/ideas";

export const metadata: Metadata = { title: "Explore ideas" };

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading the idea library…</div>}>
      <ExploreClient source={ideas.map(toIdeaCatalogEntry)} />
    </Suspense>
  );
}
