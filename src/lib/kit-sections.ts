import type { IdeaSection } from "@/content/idea-schema";

export const kitSectionSlugs = [
  "opportunity", "demo", "software", "setup", "customers", "sales", "delivery",
  "clinics", "conversation", "pricing", "tools", "discovery",
  "accounting-workflow", "ai-workflow", "prospects", "packages", "project",
  "product", "source", "rebrand", "telegram", "ai", "business-model",
  "subscriptions", "advertising", "launch", "growth", "operate",
  "templates", "ats", "premium", "seo",
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
  { slug: "software", sectionId: "clinic-software", title: "Get the software", description: "Download the approved sanitised package and review its production, privacy, and sensitive-data boundaries.", actionLabel: "Get the software", accent: "violet" },
  { slug: "setup", sectionId: "clinic-setup", title: "Setup & customise", description: "Use the verified commands and fourteen-step guide while keeping production work explicitly unverified.", actionLabel: "Open setup guide", accent: "coral" },
  { slug: "clinics", sectionId: "clinic-prospecting", title: "Find clinics", description: "Explore the protected UAE clinic dataset, then extend it through careful official-source research.", actionLabel: "Explore clinics", accent: "cyan" },
  { slug: "conversation", sectionId: "clinic-conversation", title: "Start the conversation", description: "Adapt editable email, phone, follow-up, demo, and proposal templates.", actionLabel: "Open templates", accent: "rose" },
  { slug: "pricing", sectionId: "clinic-pricing", title: "Price your offer", description: "Model delivery cost and gross margin from your own assumptions—not an earnings promise.", actionLabel: "Open planner", accent: "emerald" },
  { slug: "tools", sectionId: "clinic-tools", title: "Tools you'll need", description: "Review the actual Next.js, pnpm, Supabase, Vercel, communication, and ownership requirements.", actionLabel: "Review tools", accent: "blue" },
  { slug: "discovery", sectionId: "clinic-discovery", title: "Understand the clinic", description: "Use and download a clean discovery questionnaire without storing clinic answers here.", actionLabel: "Open questions", accent: "violet" },
  { slug: "delivery", sectionId: "clinic-delivery", title: "Deliver the project", description: "Use the versioned personal checklist to scope, test, deploy, and hand over responsibly.", actionLabel: "Review delivery", accent: "emerald" },
];

const accountingActivities: readonly KitActivityMeta[] = [
  { slug: "opportunity", sectionId: "accounting-opportunity", title: "Why this opportunity", description: "Investigate the operating problem, customer boundary, and responsible service model.", actionLabel: "Explore opportunity", accent: "amber" },
  { slug: "demo", sectionId: "accounting-demo", title: "Explore the accounting software", description: "Review the verified local synthetic demo evidence without presenting localhost as a public resource.", actionLabel: "Review demo evidence", accent: "blue" },
  { slug: "software", sectionId: "accounting-software", title: "Get the software", description: "See the inspected capability scope, technical evidence, and blocked redistribution state.", actionLabel: "Review software", accent: "violet" },
  { slug: "setup", sectionId: "accounting-setup", title: "Setup & customise", description: "Use the protected guide, verified commands, safe prompts, and customer-owned configuration boundary.", actionLabel: "Open setup guide", accent: "coral" },
  { slug: "accounting-workflow", sectionId: "accounting-workflow", title: "Understand the accounting workflow", description: "Map records, reviews, approvals, posting, reconciliation, reporting, and month-end ownership.", actionLabel: "Map the workflow", accent: "cyan" },
  { slug: "ai-workflow", sectionId: "accounting-ai", title: "Optional AI-assisted workflow", description: "Separate implemented hooks from disabled demo behaviour, unconfigured services, and untested output.", actionLabel: "Review AI boundary", accent: "rose" },
  { slug: "prospects", sectionId: "accounting-prospects", title: "Find potential customers", description: "Research suitable service businesses without inventing buyers, contacts, or demand.", actionLabel: "Plan research", accent: "cyan" },
  { slug: "conversation", sectionId: "accounting-conversation", title: "Start the conversation", description: "Adapt editable outreach, discovery-call, follow-up, demo, and proposal templates.", actionLabel: "Open templates", accent: "rose" },
  { slug: "pricing", sectionId: "accounting-pricing", title: "Price the service", description: "Model costs, hours, fees, and projected gross margin from your own assumptions.", actionLabel: "Open planner", accent: "emerald" },
  { slug: "packages", sectionId: "accounting-packages", title: "Choose a package", description: "Compare example implementation structures without fixed prices or promised results.", actionLabel: "Compare packages", accent: "blue" },
  { slug: "delivery", sectionId: "accounting-delivery", title: "Deliver safely", description: "Use a practical handover checklist with finance-data, professional-review, and AI boundaries.", actionLabel: "Review handover", accent: "violet" },
  { slug: "project", sectionId: "accounting-project", title: "Start your project", description: "Create one private, version-pinned full-member workspace and continue your saved progress.", actionLabel: "Open project plan", accent: "emerald" },
];

const zeroDebtActivities: readonly KitActivityMeta[] = [
  { slug: "opportunity", sectionId: "zerodebt-opportunity", title: "Understand the opportunity", description: "Frame the consumer problem, trust boundary, validation work, and possible business models.", actionLabel: "Explore opportunity", accent: "amber" },
  { slug: "demo", sectionId: "zerodebt-demo", title: "Explore ZeroDebt", description: "Review the verified synthetic demo, evidence, and boundaries before making product claims.", actionLabel: "Explore demo", accent: "blue" },
  { slug: "product", sectionId: "zerodebt-product", title: "Shape the product", description: "Choose a bounded feature set, quick-entry workflow, deterministic calculations, and data safeguards.", actionLabel: "Shape product", accent: "violet" },
  { slug: "source", sectionId: "zerodebt-source", title: "Review the source", description: "Separate technical inspection from the still-pending redistribution approval gate.", actionLabel: "Review source", accent: "coral" },
  { slug: "rebrand", sectionId: "zerodebt-rebrand", title: "Rebrand the app", description: "Update the identity, legal surfaces, and assets using verified paths and acceptance checks.", actionLabel: "Open rebrand guide", accent: "cyan" },
  { slug: "telegram", sectionId: "zerodebt-telegram", title: "Configure Telegram", description: "Plan isolated bot setup, secure linking, confirmation, limits, and webhook deployment.", actionLabel: "Review Telegram", accent: "blue" },
  { slug: "ai", sectionId: "zerodebt-ai", title: "Evaluate Ask ZeroDebt AI", description: "Choose data, provider, cost, monitoring, and disable controls before enabling AI.", actionLabel: "Review AI", accent: "violet" },
  { slug: "business-model", sectionId: "zerodebt-business-model", title: "Model the business", description: "Compare free, premium, advertising, and partnership paths with your own assumptions.", actionLabel: "Open planner", accent: "emerald" },
  { slug: "subscriptions", sectionId: "zerodebt-subscriptions", title: "Plan subscriptions", description: "Map tiers, payment events, entitlement, cancellation, tax, and support without connecting live billing.", actionLabel: "Plan subscriptions", accent: "rose" },
  { slug: "advertising", sectionId: "zerodebt-advertising", title: "Evaluate advertising", description: "Decide whether ads fit the trust model, then define policy, placement, metrics, and a kill switch.", actionLabel: "Review advertising", accent: "amber" },
  { slug: "launch", sectionId: "zerodebt-launch", title: "Prepare the launch", description: "Work through privacy, security, accessibility, reliability, support, and ownership checks.", actionLabel: "Open launch guide", accent: "coral" },
  { slug: "growth", sectionId: "zerodebt-growth", title: "Plan growth", description: "Choose useful SEO, free-tool, content, community, social, or referral experiments.", actionLabel: "Plan growth", accent: "cyan" },
  { slug: "operate", sectionId: "zerodebt-operate", title: "Operate and improve", description: "Use the personal 13-stage project and a clear product, cost, privacy, and reliability review rhythm.", actionLabel: "Open operating plan", accent: "emerald" },
];

const resumiActivities: readonly KitActivityMeta[] = [
  { slug: "opportunity", sectionId: "resumi-opportunity", title: "Why this opportunity", description: "Understand why job seekers need more than a PDF and how a consumer SaaS differs from client delivery.", actionLabel: "Explore opportunity", accent: "amber" },
  { slug: "demo", sectionId: "resumi-demo", title: "Explore Resumi", description: "Walk through the live product with fictional information and separate observed features from untested ones.", actionLabel: "Explore Resumi", accent: "blue" },
  { slug: "product", sectionId: "resumi-product", title: "Understand the product", description: "Review the real user journey, software scope and personal-data boundary.", actionLabel: "Review product", accent: "violet" },
  { slug: "source", sectionId: "resumi-source", title: "Get the source", description: "Review the sanitised package state, public-repository boundary and release blockers.", actionLabel: "Review package", accent: "coral" },
  { slug: "rebrand", sectionId: "resumi-rebrand", title: "Rebrand your version", description: "Map the inspected identity, domain, metadata, email and legal touchpoints before editing.", actionLabel: "Open rebrand guide", accent: "cyan" },
  { slug: "templates", sectionId: "resumi-templates", title: "Customise resume templates", description: "Understand the component registry, shared data model and PDF-sensitive design checks.", actionLabel: "Open template guide", accent: "rose" },
  { slug: "ats", sectionId: "resumi-ats", title: "Understand ATS & scoring", description: "Explain the deterministic resume-quality guidance and its limitations accurately.", actionLabel: "Review scoring", accent: "emerald" },
  { slug: "ai", sectionId: "resumi-ai", title: "Add AI & career tools", description: "Separate live rule-based tools, retained code and future AI concepts before integrating a provider.", actionLabel: "Review tool states", accent: "blue" },
  { slug: "business-model", sectionId: "resumi-business-model", title: "Choose your business model", description: "Compare monetisation approaches and model a conservative scenario from your own assumptions.", actionLabel: "Open scenario planner", accent: "violet" },
  { slug: "premium", sectionId: "resumi-premium", title: "Add premium plans", description: "Map the retained Stripe code and the missing entitlement, webhook and support work without enabling payments.", actionLabel: "Review premium path", accent: "coral" },
  { slug: "growth", sectionId: "resumi-growth", title: "Grow your users", description: "Choose realistic acquisition channels for one audience without traffic promises.", actionLabel: "Plan acquisition", accent: "cyan" },
  { slug: "seo", sectionId: "resumi-seo", title: "Build SEO traffic", description: "Create original resume content around real search intent while avoiding thin doorway pages.", actionLabel: "Open SEO guide", accent: "rose" },
  { slug: "launch", sectionId: "resumi-launch", title: "Launch your product", description: "Prepare infrastructure, privacy, quality, support, content and monitoring before release.", actionLabel: "Open launch checklist", accent: "amber" },
  { slug: "operate", sectionId: "resumi-operate", title: "Operate & improve", description: "Define funnel metrics and use the immutable personal project plan to keep improving responsibly.", actionLabel: "Open operating plan", accent: "emerald" },
];

const activitiesByIdea: Record<string, readonly KitActivityMeta[]> = {
  "idea-001": pergolaActivities,
  "idea-002": clinicActivities,
  "idea-003": accountingActivities,
  "idea-004": zeroDebtActivities,
  "idea-005": resumiActivities,
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
