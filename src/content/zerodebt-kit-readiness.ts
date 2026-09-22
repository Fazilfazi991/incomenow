import "server-only";

export const zeroDebtDemoEvidence = [
  { label: "TypeScript", value: "Passed" },
  { label: "ESLint", value: "Zero warnings" },
  { label: "Vitest", value: "227 passed · 12 skipped" },
  { label: "Production build", value: "53 routes verified" },
  { label: "Responsive review", value: "1440 → 320px" },
  { label: "External writes", value: "Blocked in demo" },
] as const;

export const zeroDebtDemoWalkthrough = [
  "Open Overview and identify remaining debt, cash flow, balances, progress, and the synthetic-demo notice.",
  "Review Debts and Debt Strategy; compare the deterministic Avalanche and Snowball ordering.",
  "Use Quick Entry with synthetic data and confirm the review step appears before a local write.",
  "Inspect Transactions and Accounts to see income, expenses, transfers, and account-owned balances together.",
  "Open Telegram and Ask ZeroDebt; verify both are labelled walkthroughs with provider calls disabled.",
] as const;

export const zeroDebtProductScope = [
  { feature: "Debt portfolio and payments", purpose: "Record balances, APR, minimums, history, and progress.", evidence: "Implemented and verified with synthetic data" },
  { feature: "Income, expenses, accounts, and transfers", purpose: "Connect payoff decisions to monthly cash flow and available balances.", evidence: "Implemented and verified with synthetic data" },
  { feature: "Avalanche and Snowball scenarios", purpose: "Compare deterministic payoff order, dates, and interest estimates.", evidence: "Implemented and covered by tests" },
  { feature: "Budgets, goals, forecast, heatmap, and net worth", purpose: "Extend the workspace beyond a single debt calculator.", evidence: "Routes built and rendered" },
  { feature: "Telegram Quick Entry", purpose: "Draft and confirm entries through a linked bot.", evidence: "Implemented in source; demo simulation only" },
  { feature: "Ask ZeroDebt AI", purpose: "Interpret an approved user-scoped snapshot while deterministic logic owns totals.", evidence: "Implemented in source; provider disabled in demo" },
  { feature: "Subscriptions and advertising", purpose: "Potential future revenue layers.", evidence: "Not integrated" },
] as const;

export const zeroDebtRebrandFiles = [
  { path: "app/layout.tsx", purpose: "Application metadata and root shell" },
  { path: "app/manifest.ts", purpose: "Install name, description, colors, and app icons" },
  { path: "app/page.tsx", purpose: "Public landing-page identity and positioning" },
  { path: "components/brand-logo.tsx", purpose: "Light and dark logo rendering" },
  { path: "components/sidebar-nav.tsx", purpose: "Product navigation identity" },
  { path: "app/privacy/page.tsx", purpose: "Privacy commitments that must match the new operator" },
  { path: "app/terms/page.tsx", purpose: "Terms, ownership, and limitation copy" },
  { path: "app/support/page.tsx", purpose: "Support routes and contact expectations" },
  { path: "public/brand/*", purpose: "Logos, browser icons, app icons, and maskable assets" },
] as const;

export const zeroDebtCodexPrompts = [
  "In the ZeroDebt repository, inventory brand-facing copy and assets in app/layout.tsx, app/manifest.ts, app/page.tsx, components/brand-logo.tsx, components/sidebar-nav.tsx, app/privacy/page.tsx, app/terms/page.tsx, app/support/page.tsx, and public/brand/. Report proposed changes first. Do not change financial calculations, authentication, database policy, or provider configuration.",
  "Replace the approved product name and supplied owned logo assets across the verified brand files. Preserve accessibility labels, light/dark behaviour, icon sizes, and responsive layout. Do not invent legal entity details, support addresses, financial claims, or credentials; flag missing owner inputs.",
  "Review the completed rebrand at desktop and 390px widths in both themes. Check metadata, manifest icons, landing page, auth, Overview, navigation, Privacy, Terms, and Support. Report stale identity strings, inaccessible alternatives, overflow, or broken assets without deploying or connecting services.",
] as const;

export const zeroDebtTelegramArchitecture = [
  "POST /api/telegram/webhook validates Telegram's secret header before processing an update.",
  "Account linking uses a random 192-bit single-use token; only its SHA-256 hash is stored and it expires after ten minutes.",
  "Connection and confirmation recheck the ZeroDebt user, Telegram user and chat, account, and debt ownership.",
  "Drafts expire after twenty minutes and require explicit confirm, edit, or cancel before any write.",
  "Idempotency protection, per-user throttles, and non-sensitive logging reduce replay and abuse risk.",
] as const;

export const zeroDebtTelegramEnvironment = [
  "TELEGRAM_BOT_TOKEN — server-only token for the isolated bot",
  "TELEGRAM_WEBHOOK_SECRET — server-only secret checked on webhook requests",
  "NEXT_PUBLIC_APP_URL — reviewed HTTPS origin used to build the webhook route",
  "TELEGRAM_OCR_SERVICE_URL — optional private receipt-OCR service",
  "TELEGRAM_OCR_SERVICE_TOKEN — optional server-only OCR authentication token",
] as const;

export const zeroDebtAiControls = [
  "Keep provider API keys server-only and make absence of a key a supported disabled state.",
  "Build context from the authenticated user's records and remove internal IDs, auth data, email, and Telegram identifiers.",
  "Calculate balances, category totals, payoff power, Avalanche/Snowball comparisons, and simulations deterministically before interpretation.",
  "Set input/output limits, timeout, monthly usage allowance, rapid-request throttle, and cost alerts.",
  "Document provider data sharing, retention, deletion, logging, incident response, and the user-facing disclaimer.",
] as const;

export const zeroDebtLaunchChecks = [
  "Authentication, ownership checks, RLS, least privilege, and server-side validation are tested.",
  "Deletion, export, retention, backup, recovery, audit logging, and incident ownership are documented.",
  "Financial-information and optional-AI disclosures are accurate and readable where decisions happen.",
  "Critical normal, edge, failure, replay, and provider-outage flows have evidence.",
  "Keyboard access, contrast, reduced motion, screen-reader labels, mobile layouts, and performance are reviewed.",
  "Provider accounts, credentials, billing, cost alerts, support, status communication, and rollback have named owners.",
] as const;

export const zeroDebtGrowthPaths = [
  { title: "Search education", detail: "Publish accurate payoff-method, budgeting, and debt-progress explainers with explicit assumptions." },
  { title: "Free tools", detail: "Offer bounded calculators or checklists that are useful without capturing sensitive information." },
  { title: "Product-led content", detail: "Show how to form a repeatable monthly review routine using synthetic examples." },
  { title: "Social and community", detail: "Teach without shame, urgency, or soliciting personal balances in public channels." },
  { title: "Referrals", detail: "Reward genuine invitations transparently and monitor quality, abuse, and retained use." },
] as const;

export const zeroDebtOperatingMetrics = [
  { group: "Usefulness", metrics: "Activation, first debt entered, payoff plan viewed, useful recurring actions" },
  { group: "Retention", metrics: "Weekly and monthly return, cohort retention, reactivation, deletion" },
  { group: "Reliability", metrics: "Error rate, failed writes, provider outages, webhook retries, recovery tests" },
  { group: "Trust", metrics: "Support themes, privacy requests, complaints, AI disable rate, ad opt-outs" },
  { group: "Economics", metrics: "Hosting, database, email, AI/API, support, premium revenue, ad revenue, gross margin" },
] as const;
