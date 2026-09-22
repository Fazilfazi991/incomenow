# Resumi source inspection

Date: 2026-09-21

## Inspected source

- Repository: public Resumi GitHub repository supplied for IDEA #005
- Inspected commit: `3ed78e615e746cb9e7e70d3f53625532bfeda9bd`
- Working copy was inspected and validated outside the IncomeNow repository. No hosted service, production database, account or payment mutation was performed.

## Stack and capability map

- Next.js 16.2.9, React 19 and TypeScript
- Supabase SSR/client libraries for authentication and persisted resume/account data
- `jsPDF` and `html-to-image` for browser-side document rendering
- A Stripe Checkout session route retained behind disabled launch configuration
- Fourteen registered resume templates in source; all are configured as free in the inspected launch state
- Deterministic resume-quality scoring, rule-based cover-letter drafting and a retained local keyword-overlap helper
- No connected generative-AI provider was found

The live public site was checked with synthetic details. Guest editing, content sections, score changes, template switching, preview, the PDF dialog and rule-based cover-letter generation were exercised. The browser harness did not independently capture the resulting PDF. Account-only storage and dashboard behavior were not exercised because no account was created. Paid plans were visibly disabled.

## Local verification

- Fresh dependency install completed for inspection.
- ESLint passed.
- TypeScript passed.
- The optimized Next.js production build passed and generated 29 routes.
- Microsoft Defender reported no threats in the sanitized staging tree.
- The source repository remained clean after inspection artifacts were removed.

## Security and privacy findings

The source is buildable, but it is not production-ready. The following require resolution before launch or member distribution:

1. **Critical — profile privilege boundary.** The inspected `profiles_update_own` row-level policy allows an authenticated user to update their profile row without restricting privileged columns such as `plan`. This can permit self-promotion to an administrative plan unless column grants, a constrained RPC or another server-only entitlement boundary is added.
2. **Critical — vulnerable production dependencies.** The production audit reported 25 advisories: 1 low, 10 moderate, 12 high and 2 critical. The current Next.js 16.2.9 release is within ranges affected by critical advisories and requires a verified upgrade to a patched release.
3. **High — anonymous resume capture.** A guest server action can use the Supabase service role to store resume/contact fields, user-agent, referrer and campaign data. No effective authentication, rate limit or consent enforcement was observed around that server-side write. Define consent, retention, deletion, abuse controls and access logging before use.
4. **High — incomplete paid entitlement flow.** A checkout-session route exists, but no completed webhook-to-entitlement lifecycle was verified. Payments must remain disabled until webhook authenticity, idempotency, refunds, failures and server-side access grants are implemented and tested.
5. **Database hardening.** Explicit table/function grants should complement RLS. The security-definer coupon function needs a fixed `search_path` and deliberate execute grants.

No committed production `.env`, private key, service-role JWT, Stripe secret, credential-bearing URL, database dump or machine-path artifact was found in the inspected tracked tree. This is a pattern-based inspection, not an independent security audit.

## Licence and asset boundary

- No source `LICENSE` file was found. Public GitHub visibility does not itself grant redistribution rights or exclusivity.
- The supplied brand archive contains logo variants, mockups and a palette image, but no conclusive rights grant. The source also includes a profile-photo image whose origin and commercial rights were not established.
- These product assets were excluded from the sanitized distribution package pending owner decisions. Any future rebrand must use owner-approved or independently licensed assets.

## Remaining production work

Patch and re-audit dependencies; fix RLS/privilege boundaries; review all service-role paths; define privacy/retention/deletion; add automated source tests; verify long-content PDF output across browsers; configure backups/recovery; complete legal and asset-rights review; and test authentication, email, analytics and any later payment flow in an approved environment.
