import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PergolaProspect } from "@/lib/pergola-prospects";
import { ProspectExplorer } from "./prospect-explorer";

const records: PergolaProspect[] = [
  { id: "prospect-0123456789abcdef", companyName: "Arizona Pergola", website: "https://arizona.example/", country: "United States", stateRegion: "Arizona", city: "Phoenix", category: "Pergola Installer", businessModel: "Installer", primaryEmail: "hello@arizona.example", primaryPhone: null, hasQuoteForm: true, quoteUrl: "https://arizona.example/quote", sourceUrl: "https://arizona.example/contact", lastChecked: "2026-09-19", researchPriority: "HIGH" },
  { id: "prospect-fedcba9876543210", companyName: "Texas Covers", website: "https://texas.example/", country: "United States", stateRegion: "Texas", city: "Austin", category: "Patio Cover", businessModel: "Contractor", primaryEmail: null, primaryPhone: "+15555550199", hasQuoteForm: false, quoteUrl: null, sourceUrl: "https://texas.example/contact", lastChecked: "2026-09-18", researchPriority: "MEDIUM" },
];

describe("ProspectExplorer", () => {
  afterEach(cleanup);

  it("searches and filters while reporting the derived result count and zero state", async () => {
    const user = userEvent.setup();
    render(<ProspectExplorer downloadPath="/app/resources/pergola-potential-customers" records={records} />);
    expect(screen.getByRole("heading", { name: "2 businesses" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Filter by contact availability"), "email");
    expect(screen.getByRole("heading", { name: "1 business" })).toBeInTheDocument();
    expect(screen.getByText("Arizona Pergola")).toBeInTheDocument();
    expect(screen.queryByText("Texas Covers")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Search company or domain"), "no match");
    expect(screen.getByRole("heading", { name: "No matching businesses" })).toBeInTheDocument();
  });

  it("shows clipboard confirmation only after a successful copy", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<ProspectExplorer downloadPath="/app/resources/pergola-potential-customers" records={records} />);
    await user.click(screen.getByRole("button", { name: "Copy email for Arizona Pergola" }));
    expect(writeText).toHaveBeenCalledWith("hello@arizona.example");
    expect(screen.getByText("Copied")).toBeInTheDocument();
  });

  it("exposes the protected CSV and available source actions without horizontal-spreadsheet markup", () => {
    render(<ProspectExplorer downloadPath="/app/resources/pergola-potential-customers" records={records} />);
    expect(screen.getByRole("link", { name: "Download member CSV" })).toHaveAttribute("href", "/app/resources/pergola-potential-customers");
    expect(screen.getAllByRole("link", { name: /Website/ })).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Quote form/ })).toHaveAttribute("href", "https://arizona.example/quote");
  });
});
