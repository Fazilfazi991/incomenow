import { z } from "zod";

export const interestOptions = [
  { id: "custom-crm", label: "Custom CRM", description: "Organize leads, follow-ups, and client work." },
  { id: "lead-generation-website", label: "Lead-generation website", description: "Turn a focused website into qualified enquiries." },
  { id: "automation", label: "Automation", description: "Remove repetitive handoffs and admin work." },
  { id: "web-tool", label: "Web tool", description: "Build a useful calculator, portal, or workflow." },
  { id: "digital-service", label: "Digital service", description: "Package specialist work into a clear offer." },
] as const;

export const experienceOptions = [
  { id: "just-starting", label: "Just starting", description: "I want practical ideas with a gentle learning curve." },
  { id: "adapting-tools", label: "Adapting tools", description: "I can combine existing platforms and templates." },
  { id: "comfortable-with-code", label: "Comfortable with code", description: "I’m ready to build and customize the technical parts." },
] as const;

export const approachOptions = [
  { id: "client-service", label: "Client service", description: "Solve a specific problem for individual customers." },
  { id: "reusable-product", label: "Reusable product", description: "Build once and sell or deliver repeatedly." },
  { id: "exploring", label: "Still exploring", description: "Keep the options broad while I find a direction." },
] as const;

const interestIds = interestOptions.map((option) => option.id) as [InterestId, ...InterestId[]];
const experienceIds = experienceOptions.map((option) => option.id) as [ExperienceId, ...ExperienceId[]];
const approachIds = approachOptions.map((option) => option.id) as [ApproachId, ...ApproachId[]];

export type InterestId = (typeof interestOptions)[number]["id"];
export type ExperienceId = (typeof experienceOptions)[number]["id"];
export type ApproachId = (typeof approachOptions)[number]["id"];
export type OnboardingState = "unanswered" | "completed" | "skipped";

export const accountPreferencesSchema = z.object({
  interestCategories: z.array(z.enum(interestIds)).max(interestOptions.length).refine(
    (values) => new Set(values).size === values.length,
    "Choose each interest only once.",
  ),
  experienceLevel: z.enum(experienceIds).nullable(),
  preferredApproach: z.enum(approachIds).nullable(),
  revision: z.number().int().nonnegative(),
});

export type AccountPreferenceInput = z.infer<typeof accountPreferencesSchema>;

export type AccountPreferences = AccountPreferenceInput & {
  onboardingState: OnboardingState;
  updatedAt: string | null;
};

export const emptyAccountPreferences: AccountPreferences = {
  interestCategories: [],
  experienceLevel: null,
  preferredApproach: null,
  onboardingState: "unanswered",
  revision: 0,
  updatedAt: null,
};

export function hasAnsweredPreferences(preferences: Pick<AccountPreferences, "interestCategories" | "experienceLevel" | "preferredApproach">) {
  return preferences.interestCategories.length > 0 || preferences.experienceLevel !== null || preferences.preferredApproach !== null;
}
