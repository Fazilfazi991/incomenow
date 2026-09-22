export const RESUMI_IDEA_ID = "idea-005";

export const resumiDemoEvidence = [
  { feature: "Public homepage", observed: "Observed live", exercised: "Opened", notes: "Free-launch positioning, template gallery, builder and account routes were visible." },
  { feature: "Guest resume builder", observed: "Observed live", exercised: "Synthetic draft created", notes: "No account was required. The page said guest drafts are saved in the browser and may sync to Resumi." },
  { feature: "Resume sections", observed: "Observed live", exercised: "Personal details, summary and experience", notes: "Education, skills, projects, certificates, languages, achievements, references and custom sections were also visible." },
  { feature: "Resume-quality score", observed: "Observed live", exercised: "Score changed with synthetic content", notes: "The score and recommendations are rule-based guidance, not ATS certification or an outcome guarantee." },
  { feature: "Template switching", observed: "Observed live", exercised: "Changed template", notes: "Synthetic content remained while the visual template changed." },
  { feature: "Preview", observed: "Observed live", exercised: "Preview opened", notes: "The preview displayed the synthetic draft and zoom controls." },
  { feature: "PDF download", observed: "Observed live", exercised: "A4 option submitted", notes: "The download dialog completed without a page error; the browser harness did not independently capture the resulting file." },
  { feature: "Cover letter", observed: "Observed live", exercised: "Rule-based draft generated", notes: "The draft used resume fields and user inputs. No generative AI provider was involved." },
  { feature: "Account and dashboard", observed: "Observed live", exercised: "Signed-out redirect checked", notes: "Login and signup were visible; the protected dashboard redirected to login. No account was created." },
  { feature: "Paid plans", observed: "Future/disabled", exercised: "Pricing page inspected", notes: "The live page says paid plans are not offered or enabled and no card is required during launch." },
] as const;

export const resumiSoftwareScope = [
  { feature: "Guest resume builder", purpose: "Create a draft without an account", live: "Observed live", source: "Inspected", local: "Locally verified" },
  { feature: "Authenticated resume storage", purpose: "Store account-owned resumes in Supabase", live: "Included but not exercised", source: "Inspected", local: "Build verified" },
  { feature: "Multiple resumes", purpose: "Create and manage more than one saved resume", live: "Included but not exercised", source: "Inspected", local: "Build verified" },
  { feature: "Resume sections", purpose: "Capture personal details, summary, experience, education, skills and supporting sections", live: "Observed live", source: "Inspected", local: "Locally verified" },
  { feature: "Template switching", purpose: "Change presentation without replacing resume content", live: "Observed live", source: "Inspected", local: "Locally verified" },
  { feature: "Live preview", purpose: "Review the selected template while editing", live: "Observed live", source: "Inspected", local: "Locally verified" },
  { feature: "PDF generation", purpose: "Render the finished document in the browser", live: "Observed live", source: "Inspected", local: "Build verified" },
  { feature: "Resume-quality / ATS-style score", purpose: "Apply deterministic checks and recommendations", live: "Observed live", source: "Inspected", local: "Locally verified" },
  { feature: "Job-description matching", purpose: "Compare local keywords with resume content", live: "Not available", source: "Code retained", local: "Not surfaced" },
  { feature: "Cover letters", purpose: "Create an editable rule-based draft", live: "Observed live", source: "Inspected", local: "Build verified" },
  { feature: "Generative AI writing", purpose: "Future writing assistance", live: "Not available", source: "Placeholder only", local: "Not connected" },
  { feature: "Admin and anonymous lead capture", purpose: "Review guest activity and captured resume data", live: "Included but not exercised", source: "Inspected", local: "Security review required" },
  { feature: "Billing", purpose: "Create a future one-time Stripe Checkout session", live: "Future/disabled", source: "Partial code retained", local: "No webhook or entitlement completion verified" },
] as const;

export const resumiRebrandLocations = [
  "app/layout.tsx and page metadata for the product name, description and canonical site URL",
  "components/app/BrandLogo.tsx plus public/brand/resumi-logo.png for the in-product identity",
  "app/globals.css and component utility classes for colour and typography decisions",
  "SUPABASE_AUTH_SETUP.md and Supabase email templates for email identity and approved redirects",
  "app/about, contact, help, privacy-policy and footer components for support and legal information",
  "lib/site-url.ts, robots.ts and sitemap.ts for domain-aware discovery metadata",
] as const;

export const resumiCodexPrompts = [
  "Inspect this Resumi repository and identify every location where the product name, logo, domain, support contact and brand colours are configured. Report the files before editing. Do not read or print environment values.",
  "Inspect the resume template system. Explain how a template receives resume data and how template selection is persisted before adding a new design. Do not change existing templates yet.",
  "Review the guest resume flow for privacy and abuse risks. Focus on anonymous server actions, service-role use, retention, rate limiting and consent. Do not connect to production services.",
  "Map the retained Stripe checkout code, then list the missing webhook, server-side entitlement, refund and failure-state work. Keep payments disabled.",
] as const;

export const resumiTemplateGuide = [
  "Templates are React components in components/resume-templates and are selected through lib/resume/template-registry.ts.",
  "ResumeRenderer passes the same typed resume data and section order into the selected layout, so switching templates does not intentionally replace content.",
  "Shared typography and section helpers centralise headings, contact blocks, skill lists, spacing and page-safe rendering.",
  "The registry records categories, layout type, photo support and availability. Source inspection found fourteen registered templates and all were configured free in launch mode.",
  "A new template needs a registry entry, a renderer branch, realistic long-content tests, print/PDF checks and mobile builder checks.",
] as const;

export const resumiScoringNotes = [
  "The score is calculated locally from deterministic content checks; it does not submit a resume to an employer ATS.",
  "Checks cover contact details, summary length and wording, skills, dated experience, quantified bullets, projects, education, certifications, languages and basic formatting signals.",
  "Recommendations identify missing or weak inputs. Adding an empty section can lower the score because completeness rules apply.",
  "A keyword-overlap job-match helper exists in source, but the live tools page marks job-description matching unavailable.",
  "Employers, job descriptions and ATS products differ. Treat the output as resume-quality / ATS-style guidance, never certification or a guaranteed pass.",
] as const;

export const resumiAiStates = [
  { state: "Live now", items: ["Structured resume assistant questions", "Deterministic score and recommendations", "Rule-based cover-letter draft"] },
  { state: "Code retained but disabled", items: ["Local keyword-overlap job matcher", "Stripe Checkout session creation"] },
  { state: "Future concept", items: ["Generative summary or bullet writing", "Grammar and tone review", "Skill suggestions", "LinkedIn bio and interview preparation"] },
] as const;

export const resumiGrowthChannels = [
  "Useful resume and CV examples built for a clear search intent",
  "Country- and audience-specific guidance with reviewed original examples",
  "Student, fresher and career-change resources",
  "Short-form demonstrations that lead to a genuinely useful free tool",
  "University and job-seeker communities where promotion is permitted",
  "Product directories, referral mechanics and relevant partnerships",
] as const;

export const resumiSeoChecklist = [
  "Keep the existing templates, resume-examples, cover-letter, tools, robots and sitemap routes useful and internally connected.",
  "Create one high-quality page per meaningful intent, such as Software Engineer Resume Example or UAE Resume Format.",
  "Include an original example, role-specific guidance, common mistakes and a relevant builder action.",
  "Avoid hundreds of thin doorway pages, duplicated role swaps or claims that the product guarantees interviews.",
  "Measure impressions, builder starts and completed downloads before expanding a content cluster.",
] as const;

export const resumiLaunchChecklist = [
  "Choose the brand, domain, support identity and owner-approved assets.",
  "Configure a production Supabase project, authentication redirects, secure admin access and least-privilege policies.",
  "Review privacy, terms, retention, deletion, backups and recovery before handling real resume data.",
  "Verify guest and account builders, template switching, long content, photos, preview and PDF output on mobile and desktop.",
  "Decide the free/premium boundary; keep Stripe disabled until webhook, entitlement, refund and failure flows are tested.",
  "Configure consent-aware analytics, initial original SEO content, support ownership and launch monitoring.",
] as const;

export const resumiOperatingMetrics = [
  "Visitor → builder start",
  "Builder start → meaningful content entered",
  "Meaningful content → preview",
  "Preview → PDF download",
  "Guest → account creation, where relevant",
  "Return usage and additional resume creation",
  "Premium conversion only after paid plans are deliberately enabled",
] as const;

export const resumiPrivacyBoundary = [
  "Resumes can contain names, email addresses, phone numbers, location, employment history, education, photographs and other personal information.",
  "The source can sync a guest draft and contact fields through a server action into an anonymous-resumes table when an admin service-role key is configured.",
  "Before production use, define consent, access control, retention, deletion, secure storage, admin access, backups, recovery and incident responsibilities.",
  "The inspected source is not certified for any privacy or security regime. Complete an application-security and privacy review for the intended market.",
] as const;
