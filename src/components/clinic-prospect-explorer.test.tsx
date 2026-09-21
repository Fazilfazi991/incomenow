import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ClinicProspect } from "@/lib/clinic-prospects";
import { ClinicProspectExplorer } from "./clinic-prospect-explorer";

const records: ClinicProspect[] = [
  { id: "clinic-prospect-0123456789abcdef", companyName: "Example Dental", website: "https://dental.example/", country: "United Arab Emirates", emirate: "Dubai", city: "Dubai", area: "Jumeirah", clinicType: "Dental Clinic", mainServices: "General dentistry", primaryEmail: "hello@dental.example", primaryPhone: "+97145550100", contactFormUrl: "https://dental.example/contact", bookingUrl: "https://dental.example/book", whatsappStatus: "available", whatsappNumber: "+971505550100", sourceUrl: "https://dental.example/contact", lastChecked: "2026-09-21", researchPriority: "HIGH" },
  { id: "clinic-prospect-fedcba9876543210", companyName: "Example Physio", website: "https://physio.example/", country: "United Arab Emirates", emirate: "Abu Dhabi", city: "Abu Dhabi", area: "Al Bateen", clinicType: "Physiotherapy / Chiropractic Clinic", mainServices: "Physiotherapy", primaryEmail: null, primaryPhone: "+97125550100", contactFormUrl: null, bookingUrl: null, whatsappStatus: "unknown", whatsappNumber: null, sourceUrl: "https://physio.example/", lastChecked: "2026-09-21", researchPriority: "MEDIUM" },
];

describe("ClinicProspectExplorer", () => {
  afterEach(cleanup);

  it("combines filters, reports a live count, and clears an empty result", async () => {
    const user = userEvent.setup();
    render(<ClinicProspectExplorer downloadPath="/app/resources/clinic-uae-potential-customers" records={records} salesTemplatesPath="/app/ideas/clinic-operations-crm?section=conversation" />);
    expect(screen.getByRole("heading", { name: "2 clinics" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Filter by city"), "Dubai");
    await user.selectOptions(screen.getByLabelText("Filter by contact availability"), "whatsapp");
    expect(screen.getByRole("heading", { name: "1 clinic" })).toBeInTheDocument();
    expect(screen.getByText("Example Dental")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Search clinic, domain, area, or service"), "no match");
    expect(screen.getByRole("heading", { name: "No matching clinics" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("heading", { name: "2 clinics" })).toBeInTheDocument();
  });

  it("shows details and user-initiated external actions without implying outreach", async () => {
    const user = userEvent.setup();
    render(<ClinicProspectExplorer downloadPath="/app/resources/clinic-uae-potential-customers" records={records} salesTemplatesPath="/app/ideas/clinic-operations-crm?section=conversation" />);
    await user.click(screen.getAllByRole("button", { name: "View details" })[0]);
    expect(screen.getByRole("link", { name: /Open WhatsApp/ })).toHaveAttribute("href", "https://wa.me/971505550100");
    expect(screen.getByRole("link", { name: /Open contact form/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Open sales templates" })).toHaveAttribute("href", "/app/ideas/clinic-operations-crm?section=conversation");
    expect(screen.queryByText(/contacted/i)).not.toBeInTheDocument();
  });

  it("confirms copy only after clipboard success and does not offer unknown WhatsApp", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<ClinicProspectExplorer downloadPath="/app/resources/clinic-uae-potential-customers" records={records} salesTemplatesPath="/app/ideas/clinic-operations-crm?section=conversation" />);
    await user.click(screen.getAllByRole("button", { name: "View details" })[0]);
    await user.click(screen.getByRole("button", { name: "Copy email" }));
    expect(writeText).toHaveBeenCalledWith("hello@dental.example");
    expect(screen.getByRole("button", { name: "Email copied" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close details" }));
    await user.click(screen.getAllByRole("button", { name: "View details" })[1]);
    expect(screen.queryByRole("link", { name: /Open WhatsApp/ })).not.toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("links to the protected member CSV and explains research priority", () => {
    render(<ClinicProspectExplorer downloadPath="/app/resources/clinic-uae-potential-customers" records={records} salesTemplatesPath="/app/ideas/clinic-operations-crm?section=conversation" />);
    expect(screen.getByRole("link", { name: "Download member CSV" })).toHaveAttribute("href", "/app/resources/clinic-uae-potential-customers");
    expect(screen.getByText(/Research priority is not a sales-probability score/i)).toBeInTheDocument();
  });
});
