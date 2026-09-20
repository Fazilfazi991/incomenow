import { beforeEach, describe, expect, it, vi } from "vitest";

const { readFile, requireVerifiedAccount, getIdeaAccessDecision } = vi.hoisted(() => ({
  readFile: vi.fn(),
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({ default: { readFile }, readFile }));
vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));

import { GET } from "./route";

describe("protected Pergola source download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
  });

  it("refuses the archive when a fresh idea-access decision is inactive", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(readFile).not.toHaveBeenCalled();
  });

  it("returns an attachment only after the account and idea checks pass", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    readFile.mockResolvedValue(Buffer.from("zip-content"));

    const response = await GET();

    expect(requireVerifiedAccount).toHaveBeenCalledWith("/app/resources/pergola-source");
    expect(getIdeaAccessDecision).toHaveBeenCalledWith(expect.anything(), "idea-001");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="universalpergola-main.zip"');
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
