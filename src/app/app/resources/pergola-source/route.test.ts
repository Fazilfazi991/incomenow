import { beforeEach, describe, expect, it, vi } from "vitest";

const { readVerifiedPrivateResource, requireVerifiedAccount, getIdeaAccessDecision } = vi.hoisted(() => ({
  readVerifiedPrivateResource: vi.fn(),
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
}));

vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));
vi.mock("@/lib/private-resources.server", () => ({ readVerifiedPrivateResource }));

import { GET } from "./route";

describe("protected Pergola source download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
  });

  it("propagates the verified-account guard before reading the archive", async () => {
    const signedOut = new Error("signed-out redirect");
    requireVerifiedAccount.mockRejectedValue(signedOut);
    await expect(GET()).rejects.toBe(signedOut);
    expect(getIdeaAccessDecision).not.toHaveBeenCalled();
    expect(readVerifiedPrivateResource).not.toHaveBeenCalled();
  });

  it.each(["registered/free", "expired grant", "revoked grant"])("refuses the archive for %s access", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(readVerifiedPrivateResource).not.toHaveBeenCalled();
  });

  it("returns an attachment only after the account and idea checks pass", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    readVerifiedPrivateResource.mockResolvedValue(Buffer.from("zip-content"));

    const response = await GET();

    expect(requireVerifiedAccount).toHaveBeenCalledWith("/app/resources/pergola-source");
    expect(getIdeaAccessDecision).toHaveBeenCalledWith(expect.anything(), "idea-001");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="universalpergola-main.zip"');
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(readVerifiedPrivateResource).toHaveBeenCalledWith("pergola-source");
  });

  it("fails closed when the access lookup is unavailable", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "unavailable", source: null });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(readVerifiedPrivateResource).not.toHaveBeenCalled();
  });

  it("fails closed when the approved local package is missing or incorrect", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    readVerifiedPrivateResource.mockRejectedValue(new Error("missing or invalid"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
