import { describe, expect, it } from "vitest";
import { ideas, publishedIdeas } from "./ideas";
import { toPublicIdea } from "./public-idea";

describe("public idea projection", () => {
  it("selects only the approved stable records", () => {
    expect(publishedIdeas.map((idea) => idea.id)).toEqual(["idea-001", "idea-002", "idea-003", "idea-004", "idea-005"]);
    expect(ideas.filter((idea) => !idea.published).map((idea) => idea.id)).toEqual(["idea-034"]);
  });

  it("serialises only explicitly permitted public fields", () => {
    const source = Object.assign({}, ideas[0], {
      privateSecret: "never-serialize-this",
      privateDownloadUrl: "https://private.invalid/signed-file",
    });
    const payload = JSON.stringify(toPublicIdea(source));

    expect(Object.keys(toPublicIdea(source)).sort()).toEqual([
      "coverArt",
      "displayNumber",
      "id",
      "intendedCustomer",
      "previewVariant",
      "problemStatement",
      "resourceTypes",
      "solutionType",
      "summary",
      "technicalRequirements",
      "title",
    ]);
    expect(payload).not.toContain("never-serialize-this");
    expect(payload).not.toContain("private.invalid");
    expect(payload).not.toContain(source.slug);
    expect(payload).not.toContain(source.resources[0].id);
    expect(payload).not.toContain(source.resources[0].externalUrl);
    expect(payload).not.toContain(source.resources[1].downloadPath);
    expect(payload).not.toContain("implementationPlanVersion");
  });

  it("uses the scoped modern cover without exposing the extra source field", () => {
    const payload = toPublicIdea(ideas[0]);
    expect(payload.coverArt.src).toBe("/artwork/marketing/modern/pergola-kit.webp");
    expect(payload).not.toHaveProperty("publicCoverArt");
  });

  it("exposes only aggregate resource availability for the Clinic prospect dataset", () => {
    const clinic = ideas.find((idea) => idea.id === "idea-002")!;
    const payload = JSON.stringify(toPublicIdea(clinic));

    expect(payload).toContain("UAE clinic prospect list");
    expect(payload).toContain("Clinic CRM source");
    expect(payload).not.toContain("clinic-uae-potential-customers");
    expect(payload).not.toContain("/app/resources/clinic-source");
    expect(payload).not.toMatch(/primaryEmail|primaryPhone|whatsappNumber|contactFormUrl|bookingUrl|sourceUrl/);
  });

  it("publishes the ZeroDebt safe preview without protected sections or source coordinates", () => {
    const zeroDebt = ideas.find((idea) => idea.id === "idea-004")!;
    const projected = toPublicIdea(zeroDebt);
    const payload = JSON.stringify(projected);

    expect(projected.safePreview?.productFlow).toHaveLength(4);
    expect(payload).toContain("Turn scattered debt balances");
    expect(payload).not.toContain("zerodebt-license-approval");
    expect(payload).not.toContain("app/api/telegram/webhook");
    expect(payload).not.toContain("e5d3b4f600993414a5a277f64bc6d0c95da02c3e");
    expect(payload).not.toContain("FinancePublic.git");
    expect(payload).not.toContain("implementationPlanVersion");
  });

  it("keeps Resumi implementation sections and source location out of the public payload", () => {
    const resumi = ideas.find((idea) => idea.id === "idea-005")!;
    const payload = JSON.stringify(toPublicIdea(resumi));

    expect(payload).toContain("Resumi — Resume Builder SaaS Kit");
    expect(payload).toContain("Sanitised source package");
    expect(payload).not.toContain("resumi-source");
    expect(payload).not.toContain("resumiDistributionState");
    expect(payload).not.toContain("3ed78e615e746cb9e7e70d3f53625532bfeda9bd");
    expect(payload).not.toContain("https://github.com");
  });
});
