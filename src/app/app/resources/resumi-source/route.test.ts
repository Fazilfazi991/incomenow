import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
  distribution: {
    technicalPackageReady: true as boolean,
    redistributionApproved: false as boolean,
    inspectedSourceCommit: "3ed78e615e746cb9e7e70d3f53625532bfeda9bd",
    packageName: "resumi-resume-builder-distribution.zip",
    packageSha256: "" as string,
    packageSizeBytes: 0 as number,
    packageEntryCount: 0,
    statusLabel: "Source package prepared — release approval required.",
  },
}));

vi.mock("node:fs/promises", () => ({
  default: { readFile: mocks.readFile },
  readFile: mocks.readFile,
}));
vi.mock("@/lib/membership.server", () => ({
  requireVerifiedAccount: mocks.requireVerifiedAccount,
  getIdeaAccessDecision: mocks.getIdeaAccessDecision,
}));
vi.mock("@/content/resumi-distribution", () => ({
  resumiDistributionState: mocks.distribution,
  resumiDistributionDownloadEnabled: () => mocks.distribution.technicalPackageReady && mocks.distribution.redistributionApproved,
}));

import { GET } from "./route";

const fixture = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

describe("protected Resumi distribution archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
    mocks.distribution.technicalPackageReady = true;
    mocks.distribution.redistributionApproved = false;
    mocks.distribution.packageSha256 = createHash("sha256").update(fixture).digest("hex").toUpperCase();
    mocks.distribution.packageSizeBytes = fixture.byteLength;
    mocks.readFile.mockResolvedValue(fixture);
  });

  it("runs the verified-account guard before any package check", async () => {
    const signedOut = new Error("signed-out redirect");
    mocks.requireVerifiedAccount.mockRejectedValue(signedOut);
    await expect(GET()).rejects.toBe(signedOut);
    expect(mocks.getIdeaAccessDecision).not.toHaveBeenCalled();
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it.each(["registered/free", "expired full membership", "revoked full membership"])("denies %s before reading the package", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("denies Pergola Starter access", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("fails closed when the access lookup is unavailable", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "unavailable", source: null });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("keeps the technically prepared package locked for a full member", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();
    expect(response.status).toBe(423);
    expect(await response.text()).toBe("Source package release is not approved.");
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("would serve only the fixed verified package after explicit approval", async () => {
    mocks.distribution.redistributionApproved = true;
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();
    const downloaded = Buffer.from(await response.arrayBuffer());
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="resumi-resume-builder-distribution.zip"');
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(mocks.readFile).toHaveBeenCalledWith(expect.stringMatching(/private-resources[\\/]resumi[\\/]resumi-resume-builder-distribution\.zip$/));
    expect(createHash("sha256").update(downloaded).digest("hex").toUpperCase()).toBe(mocks.distribution.packageSha256);
  });

  it("fails closed when an approved package hash does not match", async () => {
    mocks.distribution.redistributionApproved = true;
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    mocks.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x05]));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("The approved source package is temporarily unavailable.");
  });
});
