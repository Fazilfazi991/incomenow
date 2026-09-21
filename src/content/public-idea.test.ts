import { describe, expect, it } from "vitest";
import { ideas, publishedIdeas } from "./ideas";
import { toPublicIdea } from "./public-idea";

describe("public idea projection", () => {
  it("selects only the approved stable records", () => {
    expect(publishedIdeas.map((idea) => idea.id)).toEqual(["idea-001", "idea-002"]);
    expect(ideas.filter((idea) => !idea.published).map((idea) => idea.id)).toEqual(["idea-003", "idea-004", "idea-005", "idea-034"]);
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
});
