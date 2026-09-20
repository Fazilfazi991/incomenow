import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreClient } from "@/components/explore-client";
import { getBrowseableIdeaCatalog } from "@/lib/member-content.server";

export const metadata: Metadata = { title: "Member idea library" };
export const dynamic = "force-dynamic";

export default async function MemberExplorePage() {
  const catalog = await getBrowseableIdeaCatalog();
  return (
    <Suspense fallback={<div className="page-loading">Loading the member library…</div>}>
      <ExploreClient source={catalog} mode="member" />
    </Suspense>
  );
}
