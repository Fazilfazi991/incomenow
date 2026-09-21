import { describe, expect, it } from "vitest";
import { ideas } from "./ideas";
import { isPublicIdeaId, publicIdeaIds, toPublicIdea } from "./public-idea";

describe("public idea projection", () => {
  it("selects only the approved stable records", () => {
    expect(ideas.filter((idea) => isPublicIdeaId(idea.id)).map((idea) => idea.id)).toEqual(publicIdeaIds);
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
});
