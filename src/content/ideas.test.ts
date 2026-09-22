import { describe, expect, it } from "vitest";
import { ideas } from "./ideas";
import { zeroDebtSourceDownloadEnabled, zeroDebtSourceState } from "./zerodebt-source-state";

describe("idea catalogue artwork and claims", () => {
  it("provides one local, descriptive cover for every catalogue idea", () => {
    expect(ideas).toHaveLength(6);
    expect(new Set(ideas.map((idea) => idea.coverArt.src)).size).toBe(ideas.length);
    ideas.forEach((idea) => {
      expect(idea.coverArt.src).toMatch(/^\/artwork\/ideas\/[a-z0-9-]+\.webp$/);
      expect(idea.coverArt.alt.length).toBeGreaterThan(20);
    });
  });

  it("publishes the five completed kits with distinct covers", () => {
    const published = ideas.filter((idea) => idea.published);
    expect(published.map((idea) => idea.id)).toEqual(["idea-001", "idea-002", "idea-003", "idea-004", "idea-005"]);
    expect(published.map((idea) => idea.coverArt.src)).toEqual([
      "/artwork/ideas/pergola-business-kit.webp",
      "/artwork/ideas/clinic-operations-crm.webp",
      "/artwork/ideas/quotation-follow-up-automation.webp",
      "/artwork/ideas/zerodebt-personal-finance-saas.webp",
      "/artwork/ideas/resumi-resume-builder-saas.webp",
    ]);
  });

  it("does not advertise unsupported speed, margin, or compatibility claims", () => {
    const catalogueCopy = ideas.map((idea) => `${idea.summary} ${idea.cardNote}`).join(" ");
    expect(catalogueCopy).not.toMatch(/high-margin|launch:\s*2 weeks|works with your tools/i);
  });
});

describe("AI Accounting & Finance Operations kit", () => {
  const accounting = ideas.find((idea) => idea.id === "idea-003")!;

  it("publishes twelve focused full-member activities on immutable plan version two", () => {
    expect(accounting.slug).toBe("ai-accounting-finance-operations");
    expect(accounting.published).toBe(true);
    expect(accounting.sections).toHaveLength(12);
    expect(accounting.implementationPlanVersion).toBe("2");
  });

  it("keeps the local demo and source unavailable while publishing only the protected guide", () => {
    const demo = accounting.resources.find((resource) => resource.id === "accounting-demo")!;
    const source = accounting.resources.find((resource) => resource.id === "accounting-source")!;
    const guide = accounting.resources.find((resource) => resource.id === "accounting-setup-guide")!;

    expect(demo.availability).toBe("not-connected");
    expect(demo.externalUrl).toBeUndefined();
    expect(source.availability).toBe("not-connected");
    expect(source.externalUrl).toBeUndefined();
    expect(source.downloadPath).toBeUndefined();
    expect(guide).toMatchObject({ availability: "available", downloadPath: "/app/resources/accounting-setup-guide" });
  });

  it("states the synthetic-data, optional-AI, and professional-advice boundaries", () => {
    const copy = JSON.stringify(accounting);
    expect(copy).toMatch(/browser-local synthetic data/i);
    expect(copy).toMatch(/AI is optional, disabled by default/i);
    expect(copy).toMatch(/does not replace professional accounting, tax, legal, financial, or audit advice/i);
    expect(copy).toMatch(/do not imply accounting expertise, guaranteed savings, compliance, production readiness, or proven demand/i);
  });
});

describe("ZeroDebt Personal Finance SaaS kit", () => {
  const zeroDebt = ideas.find((idea) => idea.id === "idea-004")!;

  it("uses the approved identity, safe preview, and thirteen-stage plan", () => {
    expect(zeroDebt.slug).toBe("zerodebt-personal-finance-saas");
    expect(zeroDebt.solutionType).toBe("Consumer SaaS");
    expect(zeroDebt.sections).toHaveLength(13);
    expect(zeroDebt.implementationPlanVersion).toBe("2");
    expect(zeroDebt.sections.find((section) => section.type === "action-plan")?.stages).toHaveLength(13);
    expect(zeroDebt.safePreview?.resourceTeasers).toHaveLength(5);
  });

  it("publishes the approved synthetic demo while keeping source redistribution disabled", () => {
    const demo = zeroDebt.resources.find((resource) => resource.id === "zerodebt-demo")!;
    const source = zeroDebt.resources.find((resource) => resource.id === "zerodebt-source")!;
    expect(demo).toMatchObject({
      availability: "available",
      externalUrl: "https://zerodebt-public-demo.vercel.app",
      actionLabel: "Open ZeroDebt demo",
      notice: "Synthetic financial data · Changes reset",
    });
    expect(source.availability).toBe("not-connected");
    expect(demo).not.toHaveProperty("downloadPath");
    expect(source).not.toHaveProperty("externalUrl");
    expect(source).not.toHaveProperty("downloadPath");
    expect(source.notice).toBe("Source release approval pending.");
    expect(zeroDebtSourceState.technicalSourceInspected).toBe(true);
    expect(zeroDebtSourceState.redistributionApproved).toBe(false);
    expect(zeroDebtSourceState.publicDemoDeployed).toBe(true);
    expect(zeroDebtSourceDownloadEnabled).toBe(false);
    expect(JSON.stringify(zeroDebt)).toMatch(/not financial advice|financial advice/i);
    expect(JSON.stringify(zeroDebt)).not.toMatch(/guaranteed income|earn \$?\d|guaranteed return/i);
  });
});

describe("Resumi Resume Builder SaaS kit", () => {
  const resumi = ideas.find((idea) => idea.id === "idea-005")!;

  it("uses the approved identity, full-member access shape, and fourteen focused activities", () => {
    expect(resumi.slug).toBe("resumi-resume-builder-saas");
    expect(resumi.title).toBe("Resumi — Resume Builder SaaS Kit");
    expect(resumi.sections).toHaveLength(14);
    expect(resumi.implementationPlanVersion).toBe("1");
    expect(resumi.published).toBe(true);
    expect(resumi.detailAvailable).toBe(true);
  });

  it("links the verified live product while keeping source release disabled", () => {
    expect(resumi.resources.find((resource) => resource.id === "resumi-demo")).toMatchObject({
      availability: "available",
      externalUrl: "https://resumi.live",
      actionLabel: "Open Resumi",
    });
    expect(resumi.resources.find((resource) => resource.id === "resumi-builder")).toMatchObject({
      availability: "available",
      externalUrl: "https://www.resumi.live/builder/guest",
      actionLabel: "Try the resume builder",
    });
    expect(resumi.resources.find((resource) => resource.id === "resumi-source")).toMatchObject({
      availability: "not-connected",
      description: "Source package prepared — release approval required.",
    });
  });

  it("keeps product, ATS, AI, payments, privacy, public-source and outcome claims accurate", () => {
    const copy = JSON.stringify(resumi);
    expect(copy).toMatch(/No generative AI provider is connected/i);
    expect(copy).toMatch(/paid plans are not offered/i);
    expect(copy).toMatch(/public repository is public|GitHub repository is public/i);
    expect(copy).toMatch(/real resumes can contain extensive personal information/i);
    expect(copy).not.toMatch(/guaranteed interview|guaranteed job|ATS certified|exclusive source/i);
  });
});

describe("Clinic Operations CRM kit", () => {
  const clinic = ideas.find((idea) => idea.id === "idea-002")!;

  it("uses the stable identity, approved summary, and ten focused activities", () => {
    expect(clinic.slug).toBe("clinic-operations-crm");
    expect(clinic.summary).toBe("A practical clinic operations system you can adapt, demonstrate, and offer to independent clinics.");
    expect(clinic.sections).toHaveLength(10);
    expect(clinic.implementationPlanVersion).toBe("1");
  });

  it("publishes the inspected demo, protected guide, and Clinic prospect export while approval-gating source", () => {
    expect(clinic.resources).toHaveLength(4);
    expect(clinic.resources.find((resource) => resource.id === "clinic-demo")).toMatchObject({
      availability: "available",
      externalUrl: "https://besmile-public-demo.vercel.app/admin",
      actionLabel: "Open Clinic CRM demo",
    });
    expect(clinic.resources.find((resource) => resource.id === "clinic-setup-guide")).toMatchObject({
      availability: "available",
      downloadPath: "/app/resources/clinic-setup-guide",
      actionLabel: "Download setup guide",
    });
    const approvedSource = clinic.resources.find((resource) => resource.id === "clinic-source")!;
    const prospects = clinic.resources.find((resource) => resource.id === "clinic-prospects")!;
    expect(approvedSource).toMatchObject({
      availability: "available",
      downloadPath: "/app/resources/clinic-source",
      actionLabel: "Download source ZIP",
      description: "Source package available.",
    });
    expect(approvedSource.externalUrl).toBeUndefined();
    expect(approvedSource.notice).toMatch(/production configuration.*privacy\/security review.*backups.*recovery.*customer-specific acceptance/i);
    expect(prospects).toMatchObject({
      availability: "available",
      downloadPath: "/app/resources/clinic-uae-potential-customers",
      actionLabel: "Download clinic CSV",
    });
    expect(prospects.externalUrl).toBeUndefined();
  });

  it("states the healthcare and privacy boundary", () => {
    const copy = JSON.stringify(clinic);
    expect(copy).toMatch(/not an EHR, EMR/i);
    expect(copy).toMatch(/does not certify HIPAA, GDPR, DHA, DOH, MOHAP/i);
    expect(copy).toMatch(/prescriptions, medical and insurance document categories/i);
    expect(copy).not.toMatch(/HIPAA ready|DHA compliant|GDPR certified/i);
  });

  it("keeps the demo walkthrough honest about untested actions", () => {
    const demo = clinic.sections.find((section) => section.id === "clinic-demo")!;
    expect(JSON.stringify(demo)).toMatch(/Public; no sign-in/);
    expect(JSON.stringify(demo)).toMatch(/Write actions.*Not tested/);
    expect(JSON.stringify(demo)).toMatch(/Follow-ups/);
  });
});

describe("Pergola demo resource", () => {
  const pergola = ideas.find((idea) => idea.id === "idea-001")!;
  const demo = pergola.resources.find((resource) => resource.id === "crm-demo")!;

  it("publishes the verified original dashboard URL with its visitor warning", () => {
    expect(demo).toMatchObject({
      availability: "available",
      externalUrl: "https://universalpergola-public-demo.vercel.app/dashboard",
      actionLabel: "Open CRM demo",
      notice: "Demonstration uses synthetic data. Changes reset on reload.",
    });
  });

  it("connects the protected source, setup guide, and member-safe prospect export", () => {
    const source = pergola.resources.find((resource) => resource.id === "crm-source")!;
    const guide = pergola.resources.find((resource) => resource.id === "crm-guide")!;
    const discovery = pergola.resources.find((resource) => resource.id === "crm-discovery")!;

    expect(source.availability).toBe("available");
    expect(source.externalUrl).toBeUndefined();
    expect(source.downloadPath).toBe("/app/resources/pergola-source");
    expect(source.actionLabel).toBe("Download source ZIP");
    expect(source.description).toMatch(/offline\/UAT foundation/i);
    expect(guide).toMatchObject({ availability: "available", downloadPath: "/app/resources/pergola-setup-guide" });
    expect(discovery.availability).toBe("available");
    expect(discovery.externalUrl).toBeUndefined();
    expect(discovery.downloadPath).toBe("/app/resources/pergola-potential-customers");
    expect(discovery.description).toMatch(/member-safe projection/i);
  });

  it("orders the member kit from opportunity through delivery", () => {
    expect(pergola.kitTitle).toBe("Pergola Business Kit");
    expect(pergola.sections.map((section) => section.type)).toEqual([
      "overview",
      "demo-preview",
      "workflow",
      "resources",
      "customer-discovery",
      "sales-kit",
      "action-plan",
    ]);
  });

  it("describes observed navigation without presenting actions as verified", () => {
    const preview = pergola.sections.find((section) => section.type === "demo-preview")!;

    expect(preview.description).toContain("commercial documents");
    expect(preview.description).toContain("categories");
    expect(preview.description).toMatch(/individual records, actions.+were not tested/i);
    expect(preview.metrics).toContainEqual({ label: "Actions", value: "Not tested" });
  });

  it("provides inspected setup steps and five editable sales templates without fabricating results", () => {
    const setup = pergola.sections.find((section) => section.type === "resources")!;
    const sales = pergola.sections.find((section) => section.type === "sales-kit")!;

    expect(setup.steps).toHaveLength(4);
    expect(setup.steps?.map((step) => step.detail).join(" ")).toMatch(/offline\/UAT foundation/i);
    expect(sales.items.filter((item) => item.template).map((item) => item.kind)).toEqual(["email", "call", "follow-up", "demo", "proposal"]);
    expect(sales.items.filter((item) => item.template).every((item) => item.template?.includes("["))).toBe(true);
  });
});
