# IncomeNow design map

The approved export is located at `stitch/stitch_incomenow_explore_ideas_dashboard/`. Each named folder contains `screen.png` and `code.html` unless noted. Screenshots are the visual authority; exported markup is structural reference only.

The design-system source is `editorial_venture_discovery/DESIGN.md`. It defines the forest/sage palette, Manrope + Inter typography, spacing, radii, and component conventions.

| Screen | Reference folders | Variants | Planned route | Phase status |
| --- | --- | --- | --- | --- |
| Explore Ideas | `incomenow_explore_ideas_desktop`, `incomenow_explore_ideas_mobile` | Desktop/mobile | `/preview/explore`, `/app/explore` | Preview implemented in Phase 1; protected member route added in Phase 2A |
| Saved Ideas | `incomenow_saved_ideas_desktop`, `incomenow_saved_ideas_mobile` | Desktop/mobile | `/preview/saved`, `/app/saved` | Preview implemented in Phase 1; account-synced member route added in Phase 2B |
| Idea #001 detail | `incomenow_idea_detail_desktop`, `incomenow_idea_detail_mobile` | Desktop/mobile | `/preview/ideas/pergola-quotation-follow-up-crm` | Implemented in Phase 1 |
| Idea #003 detail | `incomenow_idea_003_automation_desktop`, `incomenow_idea_003_automation_mobile` | Desktop/mobile | `/preview/ideas/quotation-follow-up-automation` | Implemented in Phase 1 |
| Idea #004 detail | No dedicated export; inherits approved idea-detail system | Missing dedicated reference | `/preview/ideas/local-service-lead-generation` | Implemented in Phase 1 with brief-authorized content |
| My Projects | `incomenow_my_projects_desktop`, `incomenow_my_projects_mobile` | Desktop/mobile | `/app/projects` | Implemented with real member-owned project state in Phase 2B |
| Project workspace | `incomenow_project_workspace_desktop`, `incomenow_project_workspace_mobile` | Desktop/mobile | `/app/projects/[projectId]` | Implemented with versioned stages, tasks, notes, and resources in Phase 2B |
| Latest Updates | `incomenow_latest_updates_desktop`, `incomenow_latest_updates_mobile` | Desktop/mobile | `/app/updates` | Deferred |
| Getting Started | `incomenow_getting_started_desktop`, `incomenow_getting_started_mobile` | Desktop/mobile | `/app/getting-started` | Deferred |
| Help & Support | `incomenow_help_support_desktop`, `incomenow_help_support_mobile` | Desktop/mobile | `/app/support` | Deferred |
| Account settings | `incomenow_account_settings_desktop`, `incomenow_account_settings_mobile` | Desktop/mobile | `/app/account` | Deferred |
| Membership & billing | `incomenow_membership_billing_desktop`, `incomenow_membership_billing_mobile` | Desktop/mobile | `/app/account/membership` | Deferred |
| Public homepage | `incomenow_public_homepage_desktop`, `incomenow_public_homepage_mobile` | Desktop/mobile | `/` | Deferred |
| Membership page | `incomenow_membership_desktop`, `incomenow_membership_mobile` | Desktop/mobile | `/membership` | Deferred |
| Log in | `incomenow_log_in_desktop_2`, `incomenow_log_in_mobile_2` | Variant 2 selected for its split editorial/form composition and clearer service-backed states | `/login` | Implemented in Phase 2A |
| Create account | `incomenow_create_account_desktop_2`, `incomenow_create_account_mobile_2` | Variant 2 selected to match login composition and membership-separation copy | `/register` | Implemented in Phase 2A |
| Verify email | `incomenow_verify_email_desktop`, `incomenow_verify_email_mobile` | Desktop/mobile | `/verify-email` | Implemented in Phase 2A |
| Forgot/reset password | No dedicated export; inherits selected authentication composition | Missing dedicated reference | `/forgot-password`, `/reset-password` | Implemented in Phase 2A using approved auth visual language |
| Account access | No dedicated export; inherits account/auth visual system | Missing dedicated reference | `/account/access` | Implemented in Phase 2A with explicit active, inactive, and unavailable states |
| Admin overview | `incomenow_admin_overview_desktop`, `incomenow_admin_overview_mobile` | Desktop/mobile | `/admin` | Deferred |
| Admin users | `incomenow_admin_users_desktop`, `incomenow_admin_users_mobile` | Desktop/mobile | `/admin/users` | Deferred |
| Admin subscriptions | `incomenow_admin_subscriptions_desktop`, `incomenow_admin_subscriptions_mobile` | Desktop/mobile | `/admin/subscriptions` | Deferred |

## Reference notes

- The workspace contains `stitch/`, not the brief's suggested `reference/stitch/`; the existing export was preserved without relocation.
- IDEA #004 has library-card references but no dedicated detail screen.
- Login and create-account variant 2 references were selected for Phase 2A; variant 1 exports remain preserved as alternates.
- No standalone icons, photographs, font files, or downloadable resource assets were exported. UI schematics are rebuilt semantically; whole-page screenshots are never embedded.
- Several screenshot PNGs are unusually narrow while retaining 1600px height. Their paired HTML uses conventional responsive breakpoints, so screenshot proportions are treated as scaled captures rather than literal CSS viewport widths.
