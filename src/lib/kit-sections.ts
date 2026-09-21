import type { IdeaSection } from "@/content/idea-schema";

export const kitSectionSlugs = [
  "opportunity",
  "demo",
  "software",
  "setup",
  "customers",
  "sales",
  "delivery",
] as const;

export type KitSectionSlug = (typeof kitSectionSlugs)[number];

export type KitActivityMeta = {
  slug: KitSectionSlug;
  sectionType: IdeaSection["type"];
  title: string;
  description: string;
  actionLabel: string;
  accent: "amber" | "blue" | "violet" | "coral" | "cyan" | "rose" | "emerald";
};

export const kitActivities: readonly KitActivityMeta[] = [
  { slug: "opportunity", sectionType: "overview", title: "Discover the opportunity", description: "Understand the customer, the workflow problem, and the proposed service model.", actionLabel: "Explore opportunity", accent: "amber" },
  { slug: "demo", sectionType: "demo-preview", title: "Explore the CRM", description: "Inspect the synthetic-data example and see which operating areas were observed.", actionLabel: "Explore CRM", accent: "blue" },
  { slug: "software", sectionType: "workflow", title: "Get your software", description: "Review the included foundation and the capabilities you could shape for a customer.", actionLabel: "View software", accent: "violet" },
  { slug: "setup", sectionType: "resources", title: "Make it your own", description: "Turn the foundation into a bounded, customer-specific setup and test plan.", actionLabel: "Plan setup", accent: "coral" },
  { slug: "customers", sectionType: "customer-discovery", title: "Find potential customers", description: "Choose who to research and use practical questions without inventing a prospect list.", actionLabel: "Start research", accent: "cyan" },
  { slug: "sales", sectionType: "sales-kit", title: "Start the conversation", description: "Adapt editable outreach, call, and follow-up templates to what you learn.", actionLabel: "Open templates", accent: "rose" },
  { slug: "delivery", sectionType: "action-plan", title: "Deliver the implementation", description: "Use the existing personal checklist to scope, test, hand over, and support the work.", actionLabel: "Review delivery", accent: "emerald" },
] as const;

export const legacyKitHashMap: Record<string, KitSectionSlug> = {
  "section-overview": "opportunity",
  "section-demo-preview": "demo",
  "section-workflow": "software",
  "section-resources": "setup",
  "section-customer-discovery": "customers",
  "section-sales-kit": "sales",
  "section-action-plan": "delivery",
};

export function isKitSectionSlug(value: unknown): value is KitSectionSlug {
  return typeof value === "string" && kitSectionSlugs.includes(value as KitSectionSlug);
}

export function getKitActivity(slug: KitSectionSlug) {
  return kitActivities.find((activity) => activity.slug === slug)!;
}

export function getKitSection(sections: IdeaSection[], slug: KitSectionSlug) {
  const activity = getKitActivity(slug);
  return sections.find((section) => section.type === activity.sectionType) ?? null;
}

export function kitSectionHref(basePath: string, slug: KitSectionSlug) {
  return `${basePath}?section=${slug}`;
}
