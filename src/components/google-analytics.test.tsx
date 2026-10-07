import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleAnalytics } from "./google-analytics";

const route = vi.hoisted(() => ({ pathname: "/membership" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next/script", () => ({ default: ({ onReady }: { onReady: () => void }) => <button onClick={onReady}>Load analytics</button> }));

type TestWindow = Window & { dataLayer?: IArguments[]; gtag?: (...args: unknown[]) => void; "ga-disable-G-TEST123"?: boolean };
const analyticsWindow = window as unknown as TestWindow;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete analyticsWindow.dataLayer;
  delete analyticsWindow.gtag;
  delete analyticsWindow["ga-disable-G-TEST123"];
  route.pathname = "/membership";
});

describe("Google Analytics privacy boundaries", () => {
  it("uses the gtag queue format and excludes URL secrets from measured pageviews", () => {
    window.history.replaceState({}, "", "/membership?token=private#secret");
    vi.spyOn(document, "referrer", "get").mockReturnValue("https://example.test/auth/callback?code=private");
    const view = render(<GoogleAnalytics measurementId="G-TEST123" />);
    fireEvent.click(screen.getByRole("button", { name: "Load analytics" }));
    const events = analyticsWindow.dataLayer!.map((entry) => Array.from(entry));
    expect(events[1]).toEqual(["config", "G-TEST123", expect.objectContaining({ send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false })]);
    expect(events[2]).toEqual(["event", "page_view", expect.objectContaining({ page_location: `${window.location.origin}/membership`, page_referrer: "https://example.test" })]);
    expect(JSON.stringify(events)).not.toContain("private");
    expect(JSON.stringify(events)).not.toContain("secret");

    route.pathname = "/app/projects/private-project";
    view.rerender(<GoogleAnalytics measurementId="G-TEST123" />);
    expect(analyticsWindow["ga-disable-G-TEST123"]).toBe(true);
    expect(analyticsWindow.dataLayer).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Load analytics" })).toBeNull();

    route.pathname = "/privacy";
    view.rerender(<GoogleAnalytics measurementId="G-TEST123" />);
    expect(analyticsWindow["ga-disable-G-TEST123"]).toBe(false);
    expect(Array.from(analyticsWindow.dataLayer![3])).toEqual(["event", "page_view", expect.objectContaining({ page_location: `${window.location.origin}/privacy` })]);
  });

  it("does not load Google scripts when an authentication route is opened directly", () => {
    route.pathname = "/auth/callback";
    render(<GoogleAnalytics measurementId="G-TEST123" />);
    expect(screen.queryByRole("button", { name: "Load analytics" })).toBeNull();
    expect(analyticsWindow.dataLayer).toBeUndefined();
    expect(analyticsWindow["ga-disable-G-TEST123"]).toBe(true);
  });
});
