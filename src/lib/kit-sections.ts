import type { IdeaSection } from "@/content/idea-schema";

export const kitSectionSlugs = [
  "opportunity", "demo", "software", "setup", "customers", "sales", "delivery",
  "clinics", "conversation", "pricing", "tools", "discovery",
] as const;

export type KitSectionSlug = (typeof kitSectionSlugs)[number];

export type KitActivityMeta = {
  slug: KitSectionSlug;
  sectionId: string;
  title: string;
  description: string;
  actionLabel: string;
  accent: "amber" | "blue" | "violet" | "coral" | "cyan" | "rose" | "emerald";
};

const pergolaActivities: readonly KitActivityMeta[] = [
  { slug: "opportunity", sectionId: "opportunity", title: "Discover the opportunity", description: "Understand the customer, the workflow problem, and the proposed service model.", actionLabel: "Explore opportunity", accent: "amber" },
  { slug: "demo", sectionId: "demo", title: "Explore the CRM", description: "Inspect the synthetic-data example and see which operating areas were observed.", actionLabel: "Explore CRM", accent: "blue" },
  { slug: "software", sectionId: "software", title: "Get your software", description: "Review the included foundation and the capabilities you could shape for a customer.", actionLabel: "View software", accent: "violet" },
  { slug: "setup", sectionId: "setup", title: "Make it your own", description: "Turn the foundation into a bounded, customer-specific setup and test plan.", actionLabel: "Plan setup", accent: "coral" },
  { slug: "customers", sectionId: "customers", title: "Find potential customers", description: "Choose who to research and use practical questions without inventing a prospect list.", actionLabel: "Start research", accent: "cyan" },
  { slug: "sales", sectionId: "sales", title: "Start the conversation", description: "Adapt editable outreach, call, and follow-up templates to what you learn.", actionLabel: "Open templates", accent: "rose" },
  { slug: "delivery", sectionId: "delivery", title: "Deliver the implementation", description: "Use the existing personal checklist to scope, test, hand over, and support the work.", actionLabel: "Review delivery", accent: "emerald" },
];

const clinicActivities: readonly KitActivityMeta[] = [
  { slug: "opportunity", sectionId: "clinic-opportunity", title: "Why this opportunity", description: "Understand the administrative workflow and possible service layers without making demand claims.", actionLabel: "Explore opportunity", accent: "amber" },
  { slug: "demo", sectionId: "clinic-demo", title: "Explore the Clinic CRM", description: "Open the inspected synthetic demo and separate observed screens from untested interactions.", actionLabel: "Explore demo", accent: "blue" },
  { slug: "software", sectionId: "clinic-software", title: "Get the software", description: "Review the sanitised package evidence, release-approval gate, and sensitive-data boundary.", actionLabel: "Review evidence", accent: "violet" },
  { slug: "setup", sectionId: "clinic-setup", title: "Setup & customise", description: "Use the verified commands and fourteen-step guide while keeping production work explicitly unverified.", actionLabel: "Open setup guide", accent: "coral" },
  { slug: "clinics", sectionId: "clinic-prospecting", title: "Find clinics", description: "Explore the protected UAE clinic dataset, then extend it through careful official-source research.", actionLabel: "Explore clinics", accent: "cyan" },
  { slug: "conversation", sectionId: "clinic-conversation", title: "Start the conversation", description: "Adapt editable email, phone, follow-up, demo, and proposal templates.", actionLabel: "Open templates", accent: "rose" },
  { slug: "pricing", sectionId: "clinic-pricing", title: "Price your offer", description: "Model delivery cost and gross margin from your own assumptions—not an earnings promise.", actionLabel: "Open planner", accent: "emerald" },
  { slug: "tools", sectionId: "clinic-tools", title: "Tools you'll need", description: "Review the actual Next.js, pnpm, Supabase, Vercel, communication, and ownership requirements.", actionLabel: "Review tools", accent: "blue" },
  { slug: "discovery", sectionId: "clinic-discovery", title: "Understand the clinic", description: "Use and download a clean discovery questionnaire without storing clinic answers here.", actionLabel: "Open questions", accent: "violet" },
  { slug: "delivery", sectionId: "clinic-delivery", title: "Deliver the project", description: "Use the versioned personal checklist to scope, test, deploy, and hand over responsibly.", actionLabel: "Review delivery", accent: "emerald" },
];

const activitiesByIdea: Record<string, readonly KitActivityMeta[]> = {
  "idea-001": pergolaActivities,
  "idea-002": clinicActivities,
};

export const legacyKitHashMap: Record<string, KitSectionSlug> = {
  "section-overview": "opportunity",
  "section-demo-preview": "demo",
  "section-workflow": "software",
  "section-resources": "setup",
  "section-customer-discovery": "customers",
  "section-sales-kit": "sales",
  "section-action-plan": "delivery",
};

export function getKitActivities(ideaId: string) {
  return activitiesByIdea[ideaId] ?? [];
}

export function isInteractiveKitIdea(ideaId: string) {
  return getKitActivities(ideaId).length > 0;
}

export function isKitSectionSlug(ideaId: string, value: unknown): value is KitSectionSlug {
  return typeof value === "string" && getKitActivities(ideaId).some((activity) => activity.slug === value);
}

export function getKitActivity(ideaId: string, slug: KitSectionSlug) {
  const activity = getKitActivities(ideaId).find((item) => item.slug === slug);
  if (!activity) throw new Error(`Unknown kit activity: ${ideaId}/${slug}`);
  return activity;
}

export function getKitSection(sections: IdeaSection[], activity: KitActivityMeta) {
  return sections.find((section) => section.id === activity.sectionId) ?? null;
}

export function kitSectionHref(basePath: string, slug: KitSectionSlug) {
  return `${basePath}?section=${slug}`;
}
