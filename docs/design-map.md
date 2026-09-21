# IncomeNow design map

The approved export is located at `stitch/stitch_incomenow_explore_ideas_dashboard/`. Each named folder contains `screen.png` and `code.html` unless noted. Screenshots are the visual authority; exported markup is structural reference only.

The design-system source is `editorial_venture_discovery/DESIGN.md`. It defines the forest/sage palette, Manrope + Inter typography, spacing, radii, and component conventions.

| Screen | Reference folders | Variants | Planned route | Phase status |
| --- | --- | --- | --- | --- |
| Explore Ideas | `incomenow_explore_ideas_desktop`, `incomenow_explore_ideas_mobile` | Desktop/mobile | `/preview/explore`, `/app/explore` | Authenticated catalogue uses the canonical publication state and currently exposes only IDEA #001 and #002 |
| Saved Ideas | `incomenow_saved_ideas_desktop`, `incomenow_saved_ideas_mobile` | Desktop/mobile | `/preview/saved`, `/app/saved` | Preview implemented in Phase 1; account-synced member route added in Phase 2B |
| Idea #001 detail | `incomenow_idea_detail_desktop`, `incomenow_idea_detail_mobile` | Desktop/mobile | `/preview/ideas/pergola-quotation-follow-up-crm`, `/app/ideas/pergola-quotation-follow-up-crm` | Phase 3C makes Pergola the starter idea, with safe locked preview and full server-authorized detail states |
| Idea #002 detail | No dedicated Stitch export; reuses the approved modern kit hub | Responsive app implementation | `/app/ideas/clinic-operations-crm` | Published as a full-member Clinic Operations CRM kit; registered and Pergola Starter accounts receive a safe locked preview |
| Idea #003 detail | `incomenow_idea_003_automation_desktop`, `incomenow_idea_003_automation_mobile` | Desktop/mobile | `/preview/ideas/quotation-follow-up-automation` | Historical development preview only; unpublished and unavailable through ordinary member/public catalogue routes |
| Idea #004 detail | No dedicated export; inherits approved idea-detail system | Missing dedicated reference | `/preview/ideas/local-service-lead-generation` | Historical development preview only; unpublished and unavailable through ordinary member/public catalogue routes |
| My Projects | `incomenow_my_projects_desktop`, `incomenow_my_projects_mobile` | Desktop/mobile | `/app/projects` | Implemented with real member-owned project state in Phase 2B |
| Project workspace | `incomenow_project_workspace_desktop`, `incomenow_project_workspace_mobile` | Desktop/mobile | `/app/projects/[projectId]` | Implemented with versioned stages, tasks, notes, and resources in Phase 2B |
| Latest Updates | `incomenow_latest_updates_desktop`, `incomenow_latest_updates_mobile` | Desktop/mobile | `/app/updates` | Deferred |
| Getting Started | `incomenow_getting_started_desktop`, `incomenow_getting_started_mobile` | Desktop/mobile | `/account/getting-started` | Implemented as optional account onboarding in Phase 3B |
| Help & Support | `incomenow_help_support_desktop`, `incomenow_help_support_mobile` | Desktop/mobile | `/app/support` | Deferred |
| Account settings | `incomenow_account_settings_desktop`, `incomenow_account_settings_mobile` | Desktop/mobile | `/account/settings` | Implemented for every verified account in Phase 3B |
| Membership & billing | `incomenow_membership_billing_desktop`, `incomenow_membership_billing_mobile` | Desktop/mobile | `/app/account/membership` | Deferred |
| Public homepage | `incomenow_public_homepage_desktop`, `incomenow_public_homepage_mobile` | Desktop/mobile | `/` | Phase 3C adds the prominent US$1 starter path while preserving public-safe previews |
| Membership page | `incomenow_membership_desktop`, `incomenow_membership_mobile` | Desktop/mobile | `/membership` | Phase 3C presents the US$1 one-time Pergola starter beside the separately unpriced monthly offer; checkout remains disabled |
| Log in | `incomenow_log_in_desktop_2`, `incomenow_log_in_mobile_2` | Variant 2 selected for its split editorial/form composition and clearer service-backed states | `/login` | Implemented in Phase 2A |
| Create account | `incomenow_create_account_desktop_2`, `incomenow_create_account_mobile_2` | Variant 2 selected to match login composition and membership-separation copy | `/register` | Implemented in Phase 2A |
| Verify email | `incomenow_verify_email_desktop`, `incomenow_verify_email_mobile` | Desktop/mobile | `/verify-email` | Implemented in Phase 2A |
| Forgot/reset password | No dedicated export; inherits selected authentication composition | Missing dedicated reference | `/forgot-password`, `/reset-password` | Implemented in Phase 2A using approved auth visual language |
| Account access | No dedicated export; inherits account/auth visual system | Missing dedicated reference | `/account/access` | Phase 3C distinguishes registered preview, starter, full-membership, and unavailable states |
| Admin overview | `incomenow_admin_overview_desktop`, `incomenow_admin_overview_mobile` | Desktop/mobile | `/admin` | Deferred |
| Admin users | `incomenow_admin_users_desktop`, `incomenow_admin_users_mobile` | Desktop/mobile | `/admin/users` | Deferred |
| Admin subscriptions | `incomenow_admin_subscriptions_desktop`, `incomenow_admin_subscriptions_mobile` | Desktop/mobile | `/admin/subscriptions` | Deferred |

## Reference notes

- The workspace contains `stitch/`, not the brief's suggested `reference/stitch/`; the existing export was preserved without relocation.
- IDEA #004 has library-card references but no dedicated detail screen.
- Login and create-account variant 2 references were selected for Phase 2A; variant 1 exports remain preserved as alternates.
- No standalone icons, photographs, font files, or downloadable resource assets were exported. UI schematics are rebuilt semantically; whole-page screenshots are never embedded.
- Several screenshot PNGs are unusually narrow while retaining 1600px height. Their paired HTML uses conventional responsive breakpoints, so screenshot proportions are treated as scaled captures rather than literal CSS viewport widths.
- Phase 3A keeps its public header/footer separate from the authentication shell and persistent member navigation. At 767px and below, the public header uses its approved disclosure menu; it never renders member-only navigation or a fabricated avatar.
- Phase 3B removes Stitch fixture controls and sample identity/billing claims. Its account shell remains available without paid access.
- Phase 3C opens the member shell and safe catalogue to every verified account, labels starter and full access separately, and keeps locked idea pages within the same editorial detail grammar without rendering paid sections or start controls.
- Publication now comes from each canonical idea record. IDEA #001 and #002 are published; unfinished IDEA #003, #004, #005, and #034 remain preserved for development but do not enter ordinary catalogue, homepage, search, count, saved-discovery, or direct-member flows.
- Clinic reuses the kit hub as a ten-activity system rather than a long page. Its calculator, tools matrix, discovery questionnaire, workflow diagram, and unavailable-resource panels use the existing member visual language and responsive breakpoints.
- The reusable public quick preview becomes a bottom sheet on mobile. It is driven only by the explicit public projection and does not link to preview-mode routes.
