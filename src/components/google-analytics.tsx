"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { isPublicSitePath } from "@/lib/site-config";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const lastPage = useRef<string | null>(null);
  const publicPage = isPublicSitePath(pathname);

  useEffect(() => {
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow[`ga-disable-${measurementId}`] = !publicPage;
    if (!publicPage) {
      lastPage.current = null;
      return;
    }
    if (!ready || lastPage.current === pathname) return;
    analyticsWindow.gtag?.("event", "page_view", {
      send_to: measurementId,
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
      page_referrer: (() => { try { return document.referrer ? new URL(document.referrer).origin : ""; } catch { return ""; } })(),
    });
    lastPage.current = pathname;
  }, [measurementId, pathname, publicPage, ready]);

  if (!publicPage) return null;
  return <Script
    id="google-analytics"
    src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
    strategy="afterInteractive"
    onReady={() => {
      const analyticsWindow = window as unknown as AnalyticsWindow;
      analyticsWindow.dataLayer ??= [];
      analyticsWindow.gtag ??= function () {
        // gtag consumes Arguments objects, rather than dataLayer event arrays.
        // eslint-disable-next-line prefer-rest-params
        analyticsWindow.dataLayer!.push(arguments);
      };
      analyticsWindow.gtag("js", new Date());
      analyticsWindow.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: `${window.location.origin}${window.location.pathname}`,
        page_referrer: "",
      });
      setReady(true);
    }}
  />;
}
