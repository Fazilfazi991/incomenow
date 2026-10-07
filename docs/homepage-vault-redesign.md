# IncomeNow homepage review

The homepage now presents IncomeNow as a limited business opportunity vault and a workspace for execution. This is a local review build; no commit, push, external preview deployment, or production deployment was performed.

## Files and components

- `src/app/page.tsx`: server entry, homepage metadata, Barlow Condensed font, safe public data and account-state wiring.
- `src/components/homepage/vault-home.tsx` and `vault-home.css`: `VaultHomepage`, account-aware membership action, all homepage sections, scoped dark theme and responsive rules.
- `src/components/homepage/membership-capacity.tsx`: reusable capacity instrument with verified, illustrative-preview, and unknown-occupancy states.
- `src/components/homepage/execution-flow.tsx`: keyboard-operable six-stage execution selector.
- `src/lib/membership-capacity.ts`: centralized presentation price, capacity, isolated mock count, validation and derived availability.
- `src/components/public-site.tsx`, `public-mobile-menu.tsx`, `public-idea-gallery.tsx`: opt-in homepage appearance and labels; default appearances and existing account-aware actions remain available.
- `src/components/homepage/homepage.test.tsx`, `src/lib/membership-capacity.test.ts`, `src/app/public-pages.test.tsx`: new state/interaction tests and updated homepage assertions.
- `DESIGN.md`, `.impeccable/design.json`, and `.impeccable/surfaces/src-app-page-tsx.md`: scoped homepage design guidance.
- Two `.webp.json` provenance sidecars describe reuse of the existing Pergola and Clinic public cover artwork. Their pixels were not regenerated.

Pre-existing analytics, acquisition, authentication, and other working-tree changes were preserved. They are outside this homepage change.

## Homepage sections

1. Hero with exploration/process actions and capacity instrument.
2. Operating plans and the discover-to-grow progression.
3. Opportunity vault with the two published, public-safe kits.
4. Interactive execution system and opportunity-to-business path.
5. The 600-active-member model and allocation display.
6. Rationale for intentionally limited membership.
7. Choose, unlock, build, and launch steps.
8. $14.99/month membership presentation and the existing separate US$1 starter.
9. Current published opportunities.
10. Final exploration action.

An additional FAQ explains payment/access truth and avoids income guarantees.

## Preserved behavior

Public content comes from the existing public projection, not protected idea resources. Gallery previews contain safe summaries. Membership, starter, login, and registration routes retain their existing implementation. Full members receive a library action; signup alone does not grant paid access. The starter continues to cover its existing idea/project scope. No authentication architecture, entitlement enforcement, checkout, production data, or protected resource delivery was changed for this redesign.

## Capacity and future data

`membershipLaunch` in `src/lib/membership-capacity.ts` defines the presentation-only US$14.99 monthly offer and capacity of 600. `demoMembershipCount` is 200 in the same file. The resolver uses this fixture only in development or a Vercel preview environment and visibly labels it as illustrative. Availability is always derived as `capacity - active`; it is never an independent fixture.

A production build without a trusted count displays the 600 maximum and explicitly unpublished occupancy. It does not present 200 users or imply zero users. The resolver accepts only an integer verified count between zero and capacity; it also derives open/full/unknown allocation state.

Later, a server-only function can obtain the count of active full memberships from the authoritative subscription system/Supabase and pass it as `verifiedActive`. Do not use profile metadata or client state. Billing enforcement, atomic capacity allocation, cancellation reopening, and waitlist enrollment require separate implementation; the display does not enforce the cap or grant access.

## Validation

- Full suite: 45 files, 171 tests passed.
- Typecheck and ESLint passed.
- Production build passed using `next build --webpack`.
- After the final heading placement correction, the 11 relevant homepage/capacity/public-page tests passed again and the production build was repeated.
- Browser inspections at 1440, 1024, 768, 430, 390, and 320 pixels: loaded artwork/text, readable mobile capacity component, complete footer, no horizontal overflow.
- Browser checks: keyboard execution-stage selection, public opportunity dialog, Escape/focus restoration, mobile navigation and account/starter registration destinations.
- Anonymous route checks: homepage, membership, login, and registration return 200; member catalogue, protected idea route, and protected source delivery redirect to login.
- Existing automated tests cover public account states and entitlement boundaries. No signed-in production session, payment, account creation, or hosted Supabase mutation was performed.
- Independent design review and bounded verdict: both material findings resolved, with no observed fix-induced regression. Scoped design documentation and reused artwork provenance are complete.

The existing local Next package is a junction outside this checkout. Default Turbopack failed to resolve that environment arrangement; the supported webpack production build passed. No production bundler configuration was changed.

## Preview and remaining work

- Production-mode local review: http://localhost:3200 — honest unknown occupancy.
- Development mode provides the visibly illustrative 200/600 fixture; its captures are saved in the local review folder. Only the production-mode server is left running for review.
- Final capture evidence and finish review are in `.impeccable/review/` (local ignored output).

The owner confirms membership is open. Stripe checkout remains disconnected; signup is available without paid activation. Live member counts, capacity enforcement, and waitlist handling remain future work under the brief's explicit exclusions. The preserved `/membership` route still presents the full-membership price as unconfigured; the new $14.99 presentation is scoped to the homepage. Signed-in browser verification requires an account session and was not performed. The homepage is ready for owner review before any deployment.
