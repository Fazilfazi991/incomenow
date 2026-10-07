"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AcquisitionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const url = new URL(window.location.href);
    const sourceKey = url.searchParams.get("src");
    const landingPath = `${url.pathname}${url.search}${url.hash}`;

    void (async () => {
      try {
        const response = await fetch("/api/acquisition/visit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sourceKey, landingPath, referrer: document.referrer }),
          cache: "no-store",
          keepalive: true,
        });
        const result = response.ok ? await response.json() as { tracked?: boolean } : null;
        if (sourceKey && result?.tracked) {
          url.searchParams.delete("src");
          window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
        }
      } catch {
        // Attribution is best-effort for anonymous traffic; never block navigation.
      }
    })();
  }, [pathname]);

  return null;
}
