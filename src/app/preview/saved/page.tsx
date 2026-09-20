import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedClient } from "@/components/saved-client";
import { ideas } from "@/content/ideas";
import { toIdeaCatalogEntry } from "@/content/idea-catalog";

export const metadata: Metadata = { title: "Saved ideas" };

export default function SavedPage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading your saved ideas…</div>}>
      <SavedClient catalog={ideas.map(toIdeaCatalogEntry)} />
    </Suspense>
  );
}
