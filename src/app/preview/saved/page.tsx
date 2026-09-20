import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedClient } from "@/components/saved-client";

export const metadata: Metadata = { title: "Saved ideas" };

export default function SavedPage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading your saved ideas…</div>}>
      <SavedClient />
    </Suspense>
  );
}

