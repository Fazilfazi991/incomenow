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
    expect(payload).not.toContain("implementationPlanVersion");
  });
});
