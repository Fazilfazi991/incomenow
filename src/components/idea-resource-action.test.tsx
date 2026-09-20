import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Idea } from "@/content/idea-schema";
import { IdeaResourceAction, resourceAvailabilityLabel } from "./idea-resource-action";

const demoResource: Idea["resources"][number] = {
  id: "crm-demo",
  label: "Public CRM demo",
  type: "demo",
  availability: "available",
  description: "Visitor-accessible dashboard example.",
  externalUrl: "https://universalpergola-public-demo.vercel.app/dashboard",
  actionLabel: "Open CRM demo",
  notice: "Demonstration uses synthetic data. Changes reset on reload.",
};

describe("IdeaResourceAction", () => {
  afterEach(cleanup);

  it("opens the verified original demo URL in a separate protected tab", () => {
    render(<IdeaResourceAction resource={demoResource} />);

    const link = screen.getByRole("link", { name: "Open CRM demo (opens in a new tab)" });
    expect(link).toHaveAttribute("href", demoResource.externalUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Opens in a new tab")).toBeVisible();
    expect(screen.getByText(demoResource.notice!)).toBeVisible();
    expect(resourceAvailabilityLabel(demoResource.availability)).toBe("Available");
  });

  it("does not render an action for an unavailable download", () => {
    render(<IdeaResourceAction resource={{ ...demoResource, availability: "not-connected", externalUrl: undefined, actionLabel: undefined }} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(resourceAvailabilityLabel("not-connected")).toBe("Not connected");
  });

  it("keeps protected downloads on the same origin", () => {
    render(<IdeaResourceAction resource={{
      ...demoResource,
      type: "source",
      externalUrl: undefined,
      downloadPath: "/app/resources/pergola-source",
      actionLabel: "Download source ZIP",
    }} />);

    const link = screen.getByRole("link", { name: "Download source ZIP" });
    expect(link).toHaveAttribute("href", "/app/resources/pergola-source");
    expect(link).not.toHaveAttribute("target");
    expect(screen.getByText("Protected member download")).toBeVisible();
  });

  it("shows a disabled label when a promised resource has not been supplied", () => {
    render(<IdeaResourceAction resource={{ ...demoResource, availability: "not-connected", externalUrl: undefined, actionLabel: "View potential customers" }} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("View potential customers")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Not yet supplied")).toBeVisible();
  });
});
