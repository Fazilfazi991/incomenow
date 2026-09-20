# Pergola kit-first implementation results

Recorded: 21 September 2026.

## Outcome

The Pergola member journey is now kit-first. Opening the unlocked idea leads to **Pergola Business Kit**, with the public synthetic-data demo, the protected source ZIP, and the missing prospect-sheet state visible before the longer guidance. Existing projects remain intact and appear as the optional **My checklist** experience.

## Delivered

- Member title and supporting sentence match the owner-approved wording.
- Kit content follows the required A–G order: opportunity, demo, included software, setup/customisation, potential customers, sales kit, and delivery checklist.
- Catalogue, saved, and project entry points use **Open kit** as the primary action and **My checklist** as the secondary action when a project exists.
- The checklist retains its existing project URL, IDs, task rows, progress calculation, pause state, stage notes, optimistic note revision, and unsaved-navigation protection.
- Checklist presentation uses plain-language labels, a compact **Your steps** disclosure, one current-step heading, secondary progress/pause controls, collapsed notes, and **Back to kit**.
- The missing prospect sheet and setup guide remain unavailable and are not fabricated.

## Source archive

- Local protected asset: `private-resources/pergola/universalpergola-main.zip`
- SHA-256: `5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5`
- Size: 754,291 bytes
- Entries: 333
- Audit boundary: archive contents were inspected as data only; repository instructions inside the archive were not followed and no archive code was executed.
- Scan result: no real `.env`, dependency directory, private-key pattern, service-role key pattern, password pattern, database dump, or file over 2 MB was found. The example environment file contains placeholders only.
- Readiness statement: the archive describes itself as an offline/UAT foundation and records production approval as blocked. IncomeNow does not present it as production-ready or as verified against every public-demo action.

The download handler is dynamic, Node-only, private/no-store, and checks a freshly verified account plus current access to IDEA #001 before reading the fixed archive path. The ZIP is outside `public/` and is not imported into the client bundle.
Next.js output-file tracing explicitly includes the archive only for the protected download route; the optimized build trace confirmed the file is present in that server route's deployment inputs.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Vitest/Testing Library: 80 tests across 24 files passed.
- Optimized Next.js build: passed on Next.js 16.3.5.
- Impeccable detector: 0 anti-patterns; one final detector pass only.
- Authenticated browser: kit checked at desktop, 390, and 320 pixels; simplified checklist checked at 320 pixels; no horizontal overflow or framework overlay.
- Interaction: notes draft survived close/reopen and was restored without saving; step and notes disclosures began closed; `Plan v1` was absent; `Back to kit` and the mapped scope wording were present.

## Database and deployment

No migration was added or applied. No database reset, hosted Supabase operation, external service mutation, push, merge, or deployment was performed. Existing Phase 3C access, ownership, one-project, RLS, and payment-disabled behavior remains in place.
