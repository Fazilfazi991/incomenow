import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireVerifiedAccount, getIdeaAccessDecision, getClinicProspects } = vi.hoisted(() => ({
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
  getClinicProspects: vi.fn(),
}));

vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));
vi.mock("@/lib/clinic-prospects.server", () => ({ getClinicProspects }));

import { GET } from "./route";

const record = {
  id: "clinic-prospect-0123456789abcdef",
  companyName: "Example Clinic",
  website: "https://clinic.example/",
  country: "United Arab Emirates" as const,
  emirate: "Dubai" as const,
  city: "Dubai" as const,
  area: "Jumeirah",
  clinicType: "Dental Clinic" as const,
  mainServices: "General dentistry",
  primaryEmail: "hello@clinic.example",
  primaryPhone: "+97145550100",
  contactFormUrl: "https://clinic.example/contact",
  bookingUrl: "https://clinic.example/book",
  whatsappStatus: "available" as const,
  whatsappNumber: "+971505550100",
  sourceUrl: "https://clinic.example/contact",
  lastChecked: "2026-09-21",
  researchPriority: "HIGH" as const,
};

describe("protected Clinic prospect export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
    getClinicProspects.mockResolvedValue([record]);
  });

  it("propagates signed-out account handling before reading protected data", async () => {
    const signedOut = new Error("signed-out redirect");
    requireVerifiedAccount.mockRejectedValue(signedOut);
    await expect(GET()).rejects.toBe(signedOut);
    expect(getIdeaAccessDecision).not.toHaveBeenCalled();
    expect(getClinicProspects).not.toHaveBeenCalled();
  });

  it("denies free, Starter, revoked, and expired access before reading protected data", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(getClinicProspects).not.toHaveBeenCalled();
  });

  it("does not treat a non-membership idea grant as Clinic prospect access", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(getClinicProspects).not.toHaveBeenCalled();
  });

  it("fails closed when the current access lookup is unavailable", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "unavailable", source: null });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(getClinicProspects).not.toHaveBeenCalled();
  });

  it("returns the member-safe private CSV only for active full membership", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();
    const csv = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="clinic-uae-potential-customers.csv"');
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(csv).toContain('"Example Clinic"');
    expect(csv).not.toMatch(/Priority Reason|Research Notes|Email Source URL|Phone Source URL|Email Status/);
  });

  it("fails closed without leaking a server path when the projection is unavailable", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    getClinicProspects.mockRejectedValue(new Error("missing local file"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("The clinic research export is temporarily unavailable.");
  });
});
