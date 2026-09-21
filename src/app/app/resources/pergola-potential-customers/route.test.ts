import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireVerifiedAccount, getIdeaAccessDecision, getPergolaProspects } = vi.hoisted(() => ({
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
  getPergolaProspects: vi.fn(),
}));

vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));
vi.mock("@/lib/pergola-prospects.server", () => ({ getPergolaProspects }));

import { GET } from "./route";

const record = {
  id: "prospect-0123456789abcdef",
  companyName: "Example Pergola",
  website: "https://example.com/",
  country: "United States",
  stateRegion: "Arizona",
  city: "Phoenix",
  category: "Pergola Installer",
  businessModel: "Installer",
  primaryEmail: "hello@example.com",
  primaryPhone: "+15555550100",
  hasQuoteForm: true,
  quoteUrl: "https://example.com/quote",
  sourceUrl: "https://example.com/contact",
  lastChecked: "2026-09-19",
  researchPriority: "HIGH" as const,
};

describe("protected Pergola potential-customer export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
    getPergolaProspects.mockResolvedValue([record]);
  });

  it("does not read or return prospect data without current IDEA #001 access", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(getPergolaProspects).not.toHaveBeenCalled();
  });

  it("returns a private UTF-8 CSV containing only the approved projection", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    const response = await GET();
    const csv = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="pergola-potential-customers.csv"');
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(csv).toContain('"Company name"');
    expect(csv).toContain('"Example Pergola"');
    expect(csv).not.toMatch(/Outreach Status|All Emails|Google Search Query|Contact Name/);
  });
});
