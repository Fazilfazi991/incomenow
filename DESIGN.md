---
name: IncomeNow
description: A premium public opportunity vault alongside the approved member implementation workspace.
colors:
  vault-carbon: "#0d1110"
  vault-surface: "#151b18"
  vault-panel: "#1b231e"
  vault-ink: "#f0f3e9"
  vault-muted: "#b1bcb3"
  vault-accent: "#c5f783"
  vault-accent-hover: "#d6ffa7"
  vault-rule: "#354139"
  public-canvas: "#f8fafc"
  public-ink: "#101828"
  public-line: "#d9e1e9"
  digital-cyan: "#22c7d6"
  digital-blue: "#2563eb"
  digital-violet: "#6d4ce8"
  canvas: "#eefdf3"
  canvas-paper: "#f6f7f4"
  surface: "#ffffff"
  surface-low: "#e8f7ed"
  surface-mid: "#e2f2e8"
  surface-high: "#ddece2"
  forest: "#102d25"
  action: "#197a56"
  action-hover: "#136043"
  ink: "#18251f"
  muted: "#5b6b63"
  line: "#d5dfd9"
  line-soft: "#e4e7e1"
  navigation-active: "#caeadc"
  selection-mint: "#9bf5c8"
  activity-amber: "#9b6819"
  activity-blue: "#276b9d"
  activity-violet: "#6854a1"
  activity-coral: "#a64f43"
  activity-cyan: "#247780"
  activity-rose: "#994f6b"
  warning-bg: "#fff4d6"
  warning-ink: "#684b00"
  error: "#9a221b"
  error-bg: "#ffdad6"
typography:
  vault-display:
    fontFamily: "Barlow Condensed, Manrope, sans-serif"
    fontSize: "clamp(4rem, 7.7vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  vault-headline:
    fontFamily: "Barlow Condensed, Manrope, sans-serif"
    fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  vault-body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
  vault-instrument-label:
    fontFamily: "ui-monospace, monospace"
    fontSize: "10px"
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.25rem)"
    fontWeight: 760
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.2vw, 3rem)"
    fontWeight: 750
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.32
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.07em"
rounded:
  vault-control: "6px"
  vault-card: "12px"
  vault-seat: "2px"
  tag: "7px"
  control: "9px"
  compact-card: "13px"
  panel: "14px"
  card: "16px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "28px"
motion:
  press: "120ms ease-out"
  state: "180ms ease-out"
  enter: "320ms cubic-bezier(.16, 1, .3, 1)"
  reduced: "0.01ms"
components:
  vault-button-accent:
    backgroundColor: "{colors.vault-accent}"
    textColor: "{colors.vault-carbon}"
    rounded: "{rounded.vault-control}"
    padding: "14px 22px"
    height: "52px"
  vault-button-accent-hover:
    backgroundColor: "{colors.vault-accent-hover}"
    textColor: "{colors.vault-carbon}"
  vault-button-outline:
    textColor: "{colors.vault-ink}"
    rounded: "{rounded.vault-control}"
    padding: "14px 22px"
    height: "52px"
  vault-capacity:
    backgroundColor: "{colors.vault-surface}"
    textColor: "{colors.vault-ink}"
    rounded: "{rounded.vault-card}"
  vault-membership-card:
    backgroundColor: "{colors.vault-surface}"
    textColor: "{colors.vault-ink}"
    rounded: "{rounded.vault-card}"
    padding: "30px"
  vault-stage-selected:
    backgroundColor: "{colors.vault-accent}"
    textColor: "{colors.vault-carbon}"
    padding: "17px"
    height: "88px"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    typography: "{typography.body-small}"
    rounded: "{rounded.control}"
    padding: "9px 16px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.forest}"
    typography: "{typography.body-small}"
    rounded: "{rounded.control}"
    padding: "9px 16px"
    height: "42px"
  search-field:
    backgroundColor: "{colors.surface-low}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "10px"
    padding: "0 13px"
    height: "43px"
  credential-field:
    backgroundColor: "#fbfdfb"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.control}"
    padding: "0 13px"
    height: "47px"
  authentication-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "38px"
    width: "min(520px, 100%)"
  project-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "22px"
  workspace-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "18px"
  project-status-active:
    backgroundColor: "#e3f4ea"
    textColor: "#176044"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 9px"
  project-status-paused:
    backgroundColor: "#fff1cf"
    textColor: "#765000"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 9px"
  project-status-complete:
    backgroundColor: "#dcefe6"
    textColor: "#0c5c3d"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 9px"
  stage-selector-active:
    backgroundColor: "#dff1e7"
    textColor: "{colors.forest}"
    typography: "{typography.body-small}"
    rounded: "{rounded.control}"
    padding: "9px"
  checklist-row:
    backgroundColor: "#f5f8f5"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "10px"
    padding: "13px"
  stage-note-field:
    backgroundColor: "#fbfdfb"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "10px"
    padding: "13px"
  stage-resource-row:
    backgroundColor: "#f4f8f5"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "10px"
    padding: "11px"
  filter-chip:
    backgroundColor: "{colors.surface-low}"
    textColor: "{colors.forest}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: "6px 15px"
    height: "33px"
  filter-chip-active:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
  idea-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  metadata-tag:
    backgroundColor: "{colors.surface-mid}"
    textColor: "{colors.forest}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "3px 10px"
    height: "24px"
  navigation-active:
    backgroundColor: "{colors.navigation-active}"
    textColor: "{colors.action}"
    rounded: "8px"
    padding: "9px 14px"
    height: "42px"
  public-idea-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "22px"
  membership-offer-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "20px"
    padding: "34px"
  inverse-final-cta:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.surface}"
    padding: "68px 0"
---

# Design System: IncomeNow

## Overview

**Creative North Star: "The Opportunity Vault and Workspace"**

The homepage is the owner's approved premium opportunity vault: carbon planes, mineral-white copy, sharp lime allocation markings, fine structural rules, and condensed display lettering. Its signature is a readable capacity instrument beside the promise, followed by numbered opportunity files and an execution-stage selector. The implementation resolves the brief's anime-tech energy through original precise interface geometry.

The vault direction is scoped to `/` through an opt-in appearance. Existing member, authentication, starter, membership, and other routes retain their approved Manrope/Inter, emerald, white, and sage systems. The member workspace remains editorial and operational: information is grouped with compact metadata, schematic previews, restrained elevation, and explicit account-owned status. Saved Ideas, My Projects, and focused implementation kits preserve their existing visual grammar.

Artwork carries subject only; offer terms, access, resource availability, progress, and interface labels remain live HTML. The homepage presents the approved $14.99 monthly offer and maximum 600 active memberships while keeping registration, paid entitlement, and pending Stripe checkout separate. Production occupancy is unknown unless a verified count is supplied; labelled preview fixtures never represent customer activity. The membership route shares the same approved US$14.99/month configuration and 600-active model; checkout remains disconnected.

**Key Characteristics:**

- Homepage carbon planes, mineral-white text, and one lime action and allocation voice.
- Homepage Barlow Condensed display headings, Manrope card titles, Inter reading copy, and monospace instrument labels.
- A capacity instrument that communicates the model without fabricated occupancy.
- Numbered opportunity files and a keyboard-operable execution selector.
- Preserved sage member surfaces, bounded white authentication cards, and emerald operational controls.
- Separate public disclosure navigation and persistent member mobile navigation.
- Account-owned work shows honest status, required-task progress, save feedback, and recovery.
- Functional motion acknowledges input and selection; reduced motion removes movement.

## Colors

The homepage uses carbon, mineral-white, and lime under its vault appearance. Other public surfaces retain cool-white/slate treatment; member and authentication screens retain sage/emerald. These are route-scoped systems.

### Primary

- **Vault Lime** (`vault-accent`, `vault-accent-hover`): Homepage actions, selected execution stages, allocation plane, and capacity markings; hover lightens the action fill.
- **Focused Emerald** (`action`): The sole primary action voice for buttons, active filters, progress marks, and functional icons.
- **Deep Emerald** (`action-hover`): The hover state for committed actions; it deepens the control without introducing another hue.

### Secondary

- **Blueprint Forest** (`forest`): The structural anchor for navigation, strong labels, inverse feedback, and editorial emphasis.
- **Navigation Sage** (`navigation-active`): The selected-navigation field that makes location obvious without competing with primary actions.

### Tertiary

- **Selection Mint** (`selection-mint`): A bright but controlled mint for text selection and rare positive emphasis.
- **Caution Paper / Caution Ink** (`warning-bg`, `warning-ink`): A warm pair for local-preview limitations and recoverable notices.
- **Error Brick / Error Wash** (`error`, `error-bg`): A restrained red pair for genuine errors and warning callouts.
- **Kit Activity Accents** (`activity-amber`, `activity-blue`, `activity-violet`, `activity-coral`, `activity-cyan`, `activity-rose`): Scope-limited identifiers for Pergola activity cards and section headers. They distinguish tasks; they never replace Focused Emerald for primary actions or become a site-wide theme.

### Neutral

- **Vault Carbon / Surface / Panel** (`vault-carbon`, `vault-surface`, `vault-panel`): Homepage canvas, bounded cards and alternate sections, then preview/dialog and hover planes.
- **Mineral White / Vault Muted / Structural Rule** (`vault-ink`, `vault-muted`, `vault-rule`): Homepage reading hierarchy and one-pixel structural boundaries.
- **Sage Canvas** (`canvas`): The principal application background and quiet connective tissue between modules.
- **Warm Paper** (`canvas-paper`): A subtly warmer inset plane for metrics, unavailable states, and demonstration framing.
- **Structural White** (`surface`): The card, panel, sidebar, and control surface.
- **Low, Mid, and High Sage Surfaces** (`surface-low`, `surface-mid`, `surface-high`): Tonal layers for inputs, tags, member chips, compact previews, and secondary panels.
- **Editorial Ink** (`ink`): The dominant text color; dark and legible without the harshness of absolute black.
- **Quiet Slate Sage** (`muted`): Supporting copy, metadata, timestamps, and annotations.
- **Botanical Line / Soft Line** (`line`, `line-soft`): Crisp control boundaries and quieter structural card dividers.

### Named Rules

**The One Action Voice Rule.** Vault Lime carries homepage interaction; Focused Emerald carries incumbent operational interaction. Keep one action voice within each route.

**The Scoped Vault Rule.** Carbon/lime belongs to the homepage appearance; preserve other route palettes until separately authorized.

## Typography

**Homepage Display Font:** Barlow Condensed (600 and 700 loaded on `/`; display headings use 600, with Manrope and sans-serif fallback).

**Incumbent Display Font:** Manrope (with ui-sans-serif, system-ui, sans-serif fallback)

**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif fallback)

**Character:** Manrope is geometric, compact, and architectural; Inter is neutral and quiet under dense operational content. Together they make numbered ideas feel considered and specific rather than promotional.

### Hierarchy

- **Vault Display**: Hero uses `vault-display`; at 800px and below it becomes 64px, and at 600px and below uses `clamp(3.8rem, 15vw, 5.1rem)`. Closing display uses `clamp(3.8rem, 7vw, 6rem)`, becoming `clamp(3.6rem, 14.5vw, 5rem)` on mobile.
- **Vault Headline**: Shared section titles use `vault-headline`; mobile resolves to 41px. Allocation and offer sections use the same condensed voice at larger local sizes.
- **Vault Measurement**: Capacity numerals use Barlow Condensed, weight 600, tabular figures, 88px/unit line-height. Price uses 72px. These are presentation measures, not member progress styles.
- **Vault Copy**: Hero description uses `vault-body`; card copy uses 14px/1.65 and benefits/process descriptions use 13px/1.7. Card titles remain Manrope at 22px, becoming 21px on mobile.
- **Vault Instrument Labels**: Monospace identifies instruments, files, allocation, and numbered processes. Heading eyebrows are not part of the system.

Incumbent member/authentication and other-route roles remain unchanged:

- **Display** (760, fluid up to 3.25rem, 1.05): Idea-detail titles and the most consequential route headings.
- **Headline** (750, fluid up to 3rem, 1.04): Library and shortlist page titles; compresses to 27px on mobile.
- **Title** (700, 18px, 1.32): Idea-card names and strong module headings; cards reduce this to 15px on mobile.
- **Body** (400, 16px, 1.55): Default reading copy, with long-form passages held near 72–74 characters.
- **Body Small** (400, 13px, 1.55): Card descriptions, compact notices, and supporting interface text.
- **Label** (650, 11px, 0.07em tracking): Context rows, section annotations, and resource headings; uppercase is reserved for compact navigational metadata.

### Named Rules

**The Two-Voice Rule.** Incumbent headings and milestones use Manrope with Inter operational copy. The homepage adds Barlow Condensed display headings and numerals while retaining Manrope card titles and Inter reading copy.

**The Compact Metadata Rule.** Uppercase and tracking belong to short labels, never to paragraphs or primary actions.

## Layout

The homepage uses an opt-in vault public shell. Its relative, opaque header and page container cap at 1320px with 40px inline padding; the desktop header has an 88px minimum height. The hero uses a 1.3:1 composition with a 72px gap and 76px/84px vertical padding. The capacity instrument remains a readable complete component. Opportunities use two columns with 24px gutters, benefits and onboarding use four columns, and stage tabs use six. Allocation and offer sections have separate two-column compositions.

At 1100px, major gaps compress and hero proportions become 1.2:1. At 800px, gutters become 24px, stage tabs form three-by-two rows, benefits/onboarding become two columns, and hero actions stack. At 600px, gutters become 20px, header minimum becomes 72px, hero/opportunity/offer/allocation/FAQ layouts become single columns, and the dial retains a 240px diameter. Onboarding becomes numbered rows. At 360px, gutters become 16px and benefits become one column. Public navigation retains its shared 767px disclosure breakpoint independently of vault content stacking.

Other public routes retain their horizontal header, centered 1180px content, 48px total gutters, and 980px/767px/360px responsive patterns. The membership first viewport, starter offer, and authentication entry flow keep existing styling. The old homepage motion-media and miniature library-preview direction is retired on `/`.

The desktop shell uses a fixed 228px navigation rail and a centered content region capped at 1320px. Page content begins with 20px/24px/56px block-and-inline padding, while the Explore grid presents three equal columns with 22px gutters above 1120px, two columns from 768–1120px, and one column below 768px. Detail pages pair flexible content with a 278px quick-facts rail, collapsing to one column below 900px.

At 767px and below, the sidebar becomes a 58px safe-area-aware top bar plus a persistent four-item bottom navigation. Page padding tightens to 16px/12px/28px, filters reflow into a full-width search row and paired controls, horizontal chip rows remain scrollable, and cards compact without hiding the primary action. A 360px guard breakpoint stacks the narrowest action and metric layouts.

Spacing follows a compact 4/8/12/16/20/24/28px rhythm. Larger separations are structural: 38–58px between detail sections and 56px of desktop page-end breathing room.

Authentication uses a bounded white card, never a full-bleed form. On desktop the card is capped at 520px inside a pale-sage workspace beside an editorial context panel. At 767px and below, the context panel gives way to a compact task mark and an in-card account/membership separation note; the card remains visibly bounded within the sage field with 14px side gutters.

Account-synced Saved Ideas reuses the comparison grid and filter grammar instead of inventing a second card system. Its account ownership is communicated in the heading, empty state, removal feedback, and Undo treatment. Project lists use a two-column desktop grid and a single column below 768px; cards lead with status, current focus, next action, required-stage progress, and one primary continuation action.

The implementation-kit hub is a responsive activity map inside the existing member shell. Its activity count comes from the selected idea rather than a seven-card assumption: Pergola has seven activities and Clinic has ten. The compact hero exposes only resources genuinely available for that kit, then arranges outcome cards in a varied 12-column desktop composition. At 980px cards settle into two columns; below 768px they become one complete activity per row. Selecting a card opens one naturally scrolling activity view with Back to kit, a native compact selector, and a single onward action. Query-string section state provides direct links, refresh safety, and browser history without shipping protected full-kit content as client state.

The project workspace is capped at 1440px and stays separate from kit activities. A compact white project header establishes identity, status, the derived current focus, and overall required-stage progress. The checklist keeps one selected step, disclosed step navigation, private notes, resources, pause state, and required-task progress. Below 768px, panels tighten, checklist metadata wraps beneath task copy, note actions may wrap, and the primary project and note actions expand to the available width.

The Clinic kit follows the same focused-view grammar with ten operations-software activities. Its enquiry-to-next-action diagram is explicitly an example to confirm with the clinic. The inspected public synthetic demo, protected setup guide, and owner-approved sanitised source package are available to active full members; availability is paired with the unchanged production-configuration, privacy/security, backup/recovery, and customer-acceptance boundary. The protected UAE clinic finder uses a verification-first research ledger: compact summary facts and filters lead to restrained desktop rows, mobile cards, public-route indicators, and one source-backed detail disclosure at a time. HIGH/MEDIUM stays a research-quality label, not a sales score; WhatsApp actions appear only for clinic-published routes. Demo and source matrices separate observation, interaction testing, source inspection, sanitisation, release approval, and local code checks. The planning calculator uses compact local-state inputs and separates one-time delivery labour, one entered period of recurring technical costs, modelled fees, and projected gross margin; package cards are scope examples, not price recommendations. The tools matrix and copy/download discovery questionnaire remain readable at 320px, and the sensitive-information notice appears alongside the questionnaire before any real clinic data would be used. None of these interactions writes checklist progress, contact history, or clinic answers centrally.

The selected stage and the current focus are separate concepts. Selection answers “what am I viewing?” and is expressed by the active stage control plus the “Viewing stage” heading. Current focus answers “where is the next unfinished required work?” and remains project-level truth in the header and project cards even when the member reviews another stage. Completion and percentage are derived from required work; optional tasks never inflate progress.

**The Whole-Card Mobile Rule.** Mobile prioritizes one complete decision unit at a time: one card column, full-width action, and persistent navigation.

**The Separate-Shell Rule.** Public pages use the public header, footer, section rhythm, and disclosure menu; protected member routes keep the rail and persistent mobile bottom navigation.

**The Evidence-Before-Entry Rule.** The homepage pairs its promise with capacity and immediate exploration actions; safe opportunity files provide product evidence before account entry.

**The Selection-Is-Explanation Rule.** Homepage stage selection changes explanatory content only; it never advances project work or represents a customer outcome.

**The Work-First Workspace Rule.** On desktop, the active work surface owns the wide left column; navigation and reference material support it from the right rail. Below 900px, navigation precedes work and resources follow it.

**The Kit-Is-Not-Progress Rule.** Opening, reading, downloading, or copying from a kit activity never advances the personal checklist. Only confirmed persisted checklist work creates continuation or completion treatment.

**The Selected-Is-Not-Current Rule.** Never relabel a reviewed stage as the project’s current focus unless it is actually the next unfinished required stage.

## Elevation & Depth

The homepage uses flat tonal layers and structural rules. Its header, opportunity cards, mobile menu, and preview dialog explicitly remove shadows. Fine-pointer card hover rises 3px without adding a shadow; dialog backdrop uses `rgba(3, 8, 5, .86)`. Member cards and other incumbent routes retain their existing shadow vocabulary; temporary panels and messages receive stronger diffusion.

### Shadow Vocabulary

- **Ambient Rest** (`0 1px 2px rgba(16, 45, 37, 0.05)`): Default cards, panels, boards, and the trust strip.
- **Card Lift** (`0 6px 18px rgba(16, 45, 37, 0.08), 0 1px 3px rgba(16, 45, 37, 0.05)`): Hovered idea cards only.
- **Popover Float** (`0 12px 32px -4px rgba(16, 45, 37, 0.16)`): Advanced filters and anchored disclosure panels.
- **Toast Float** (`0 12px 32px rgba(16, 45, 37, 0.22)`): High-priority reversible feedback above navigation.
- **Authentication Focus** (`0 8px 30px rgba(16, 45, 37, 0.07)`): The bounded desktop credential card; mobile tightens this to a smaller 6px/20px diffusion.
- **Membership Offer Lift** (`0 24px 50px rgba(16, 45, 37, 0.11)`): The paired starter and full-membership offer cards in the membership split hero.
- **Quick Preview Focus** (`0 30px 80px rgba(0, 0, 0, 0.28)`): The public idea dialog or mobile sheet above its dimmed backdrop.

### Named Rules

**The Flat-by-Default Rule.** A shadow must communicate hierarchy, hover, or transient UI; it is not decoration.

## Shapes

The homepage uses 6px action/stage-control corners, 12px instrument/opportunity/allocation/offer corners, 2px allocation-cell corners, and one-pixel boundaries.

The incumbent form language balances modular discipline with approachable softness. Large cards, authentication cards, and filter panels use 16px corners, while authentication cards tighten to 14px on mobile; inset panels and standard containers use 13–14px corners, controls use 8–10px corners, and compact metadata tags use 7px corners. The existing membership offer card uses 20px, and the quick-preview dialog uses 18px before becoming an 18px top-corner sheet on mobile. Counts, filter chips, resource pills, and avatars use circular or pill geometry. Borders stay at 1px and use botanical neutral lines; clipping is reserved for previews, cards, dialogs, and layered containers.

**The Nested Radius Rule.** Incumbent nested paper surfaces use tighter child corners; the vault retains its own compact control/card scale.

## Components

Components feel tactile and confident: quiet at rest, exact in hierarchy, and visibly responsive without ornamental effects.

### Homepage Vault Components

The public shell and gallery expose an opt-in vault appearance; reuse safe structured `PublicIdea` records rather than hardcoding an opportunity page.

- **Actions:** Accent/outline actions use 52px minimum height, 6px corners, 14px/22px padding, 14px copy at weight 650, and 24px icon gap. Accent hover uses `vault-accent-hover`; outline hover uses `vault-panel`. Focus uses a 2px lime outline with 5px offset, becoming carbon on the lime allocation plane.
- **Capacity:** A bounded surface, functional header/footer, decorative SVG dial, tabular numeral, literal caption, and 40px model-link target. Unknown production occupancy shows the maximum without a filled occupancy arc. Verified counts may draw the proportional arc; preview fixtures are explicitly labelled. Presentation neither enforces the cap nor grants entitlement.
- **Opportunity files:** Numbered header, reused cover, metadata, Manrope title, summary, and lime Open opportunity action. Covers use a 2.3 aspect ratio and `saturate(.65)`, becoming 1.8 on mobile. The shared keyboard-safe preview uses dark panels and keeps protected content omitted.
- **Execution selector:** Six tabs select one explanation and three outputs. Arrow Left/Right, Home, and End move selection and focus. The selected tab owns the tab stop and ARIA relationships identify the shared panel. Selection never changes project progress.
- **Allocation:** The lime plane carries the 600-active model with a bordered 10-column seat field. Unknown occupancy remains an explicit maximum; demo/verified values carry their source. No waitlist enrollment is simulated.
- **Monthly offer:** A bounded card presents $14.99/month, included scope, account-aware action, and pending Stripe truth. Full members open their library; signup never grants membership. The US$1 Pergola starter remains separate and unchanged.
- **FAQ/close:** Native disclosures use structural dividers, 14px questions, and 13px answers. Closing capacity text follows heading and body, before the exploration action; it is not a heading eyebrow.
- **Cover provenance:** `public/artwork/marketing/modern/pergola-kit.webp` and `public/artwork/ideas/clinic-operations-crm.webp` are unchanged reused assets. Adjacent `.webp.json` files record reuse; original generation prompts are unavailable and have not been reconstructed.

### Motion

- **Vault feedback:** CTA press uses 120ms scale .98; fine-pointer opportunity hover uses 180ms translateY(-3px); stage copy uses a 180ms opacity fade. Easing is `cubic-bezier(.16, 1, .3, 1)`. Reduced motion removes animation and transforms and reduces transition duration to .01ms. Animated counts, looping backgrounds, and delayed entrances are absent.
- **Press (120ms):** Buttons and activity cards compress to 0.98–0.99 scale on activation; navigation is never delayed for the effect.
- **State (180ms):** Hover, border, shadow, tab, disclosure, and icon changes use short ease-out transitions.
- **Enter (320ms):** A newly selected kit view fades and rises by 10px while focus moves to its heading. The transition runs once per view and does not lock controls.
- **Acknowledgement:** Copy, note-save, task-save, and genuine stage-completion feedback use one brief confirmation treatment and literal saved/copy wording.
- **Reduced motion:** `prefers-reduced-motion: reduce` collapses non-essential transitions and animations to 0.01ms, removes smooth scrolling, and prevents repeating motion.

### Buttons

- **Shape:** Compact rounded rectangle with 9px corners and a minimum 42px height.
- **Primary:** Focused Emerald fill, Structural White text, 9px/16px padding, and bold 14px copy.
- **Hover / Focus:** Deep Emerald on hover; all keyboard focus uses a 3px translucent emerald outline with 2px offset.
- **Secondary:** Structural White with Botanical Line border and dark forest text; hover shifts to Low Sage Surface.
- **Ghost:** Transparent or Low Sage Surface with emerald text for low-priority reset and dismiss actions.

### Chips

- **Style:** Filter chips are fully pill-shaped with a Low Sage Surface fill, forest text, 6px/15px padding, and a minimum 33px height. Compact metadata tags use 7px corners instead of pills.
- **State:** The active filter becomes solid Focused Emerald with white text. Hovered inactive chips expose a slightly stronger botanical border.

### Cards / Containers

- **Corner Style:** 16px on desktop idea cards and major panels; 13px on compact mobile cards.
- **Background:** Structural White over Sage Canvas, with pale-sage schematic preview fields nested inside.
- **Shadow Strategy:** Ambient Rest at rest and Card Lift with a 2px upward translation on hover.
- **Border:** One Soft Line at rest, strengthening to Botanical Line on hover.
- **Internal Padding:** 20px on desktop idea cards and 12px on mobile.
- **Authentication Card:** A white card capped at 520px with 38px desktop padding, a quiet botanical outline, and Authentication Focus shadow. Mobile keeps the card bounded, reduces padding to 24px/20px, and uses a 14px radius.

### Inputs / Fields

- **Search Style:** Low Sage Surface, 10px corners, 43px minimum height, 13px horizontal padding, and no visible border at rest.
- **Credential Style:** Near-white paper fill, 9px corners, 47px minimum height, 13px horizontal padding, and a visible 1px botanical boundary. A compact bold label sits above; optional/required/identity metadata stays smaller and quieter on the same line.
- **Credential Affordances:** Password visibility and leading identity icons live inside the field boundary as quiet, icon-only controls; related recovery links align with the field label.
- **Focus:** Focus-within or direct focus shifts the boundary to Focused Emerald and adds a 3px translucent emerald ring.
- **Error:** Invalid credential fields use a restrained brick boundary and place one concise error line directly below the field.
- **Placeholder:** Search placeholders use a slightly quieter sage than body copy while remaining fully opaque.

### Navigation

- **Desktop:** A fixed white 228px rail with 42px rows, 8px corners, 19px outline icons, and a sage selected field. Support and account links are visually separated by an uppercase micro-label.
- **Mobile:** A translucent white top bar and four-column bottom navigation stay fixed, safe-area-aware, and lightly blurred. Active state uses emerald text and weight rather than a filled tab.

### Public Shell and Navigation

- **Desktop:** Homepage uses its relative carbon header; other public routes retain the sticky translucent wordmark/section-link/account-action header without member-rail chrome. The footer uses the darkest forest field, a short product statement, only implemented routes, and the explicit “No income guarantees” note.
- **Mobile:** A 40px disclosure control opens a bounded menu below the wordmark, dark on the homepage and white on other routes. Navigation links and the correct account state stack as full-width actions; this menu closes when a destination is chosen.
- **Account awareness:** Signed-out, registered-preview, starter, full-membership, and temporarily unavailable states route visitors to registration, access review, the canonical starter idea/project, or the broader library without implying that checkout or entitlement activation is available.

### Homepage Hero

The homepage pairs a concise condensed promise and exploration/process actions with a full capacity instrument. It contains no looping hero film or miniature library UI. Mobile presents the instrument after the copy as a complete readable component.

### Public Idea Cards and Quick Preview

Outside the homepage, public cards retain schematic visual language; homepage cards use the vault files above. Both expose only a deliberately safe summary projection. Each card combines the schematic, solution type, idea number, title, summary, and one “Quick preview” action. The desktop quick preview is a centered two-column dialog; below 768px it becomes a full-width bottom sheet. It traps keyboard focus, closes with Escape or the close control, restores focus to its trigger, and always labels the content as a public summary with protected implementation material omitted.

### Public FAQ

FAQ rows use native disclosure semantics, one botanical divider per row, a Manrope question, and an emerald chevron that rotates when open. Answers stay inline beneath their question; do not replace the list with tabs, a carousel, or a custom accordion state machine.

### Membership Offer, Scope, and Access Steps

The membership page presents two explicit offers without simulating checkout. The primary Starter Pass shows US$1/USD, one-time, the canonical Pergola kit, and one personal project; it does not claim renewal, lifetime access, or a configured duration. The separate monthly membership presents US$14.99/USD per month and a maximum of 600 active members, and covers all included published ideas, execution kits, resources, and projects. Cancellation at period end retains access and its slot until actual entitlement end. Account-aware actions never ask starter or full members to buy redundant access. A paired scope panel keeps the boundary between product access and member responsibility explicit, while the access steps separate signup, offer review, future payment, and server-recorded entitlement. On mobile the offer cards and steps become one readable vertical sequence.

### Inverse Final CTA

Other public pages retain a deep-forest band, white heading, muted mint copy, and account-aware actions. The homepage uses its centered surface/carbon closing section. It is an invitation to inspect or enter the existing flow, never a countdown, earnings promise, or simulated checkout.

### Idea Preview

Each card contains a pale-sage schematic rather than decorative photography. Pipeline columns, dispatch rows, workflow nodes, wireframes, scores, or metrics visualize the opportunity type with white inset modules, botanical strokes, and compact uppercase annotations.

### Bookmark and Feedback

Bookmark controls are outline-first and become subtle sage surfaces on hover. Removal feedback appears in a forest toast with a mint Undo action; on mobile the toast sits above the persistent bottom navigation.

### Project Workspace

The Pergola member journey is kit-first. Catalogue, saved, and project entry points lead with **Open kit**; the persisted project is explicitly secondary as **My checklist**. The kit hero uses the member-facing title “Pergola Business Kit” and keeps the working demo and protected source download directly available. Meaningful persisted work receives a compact checklist continuation; an empty/new checklist receives no fabricated percentage.

The default kit view shows only seven activity cards: opportunity, CRM demo, software, customisation, potential customers, sales conversation, and delivery. Full content is never repeated below the cards. Each activity opens as one focused server-selected view through a validated `section` URL parameter. Old `#section-*` anchors redirect to their matching activity. Sections remain independently available after entitlement verification; there are no sequencing locks.

Opportunity uses customer/problem/offer cards and a proposed-model flow. Demo uses the real external URL, observed module names, and synthetic/reset limitations. Software distinguishes inspected source-package capabilities from the hosted demo and still-unverified production operation. Setup keeps the protected ZIP and offline/UAT boundary visible, adds a twelve-part inspected guide, and offers safe copyable Codex prompts without secrets. Customer research includes a protected 77-business member list with search, filters, copy feedback, source links, and a CSV download; its copy consistently describes possible research targets rather than confirmed buyers. Sales supplies five editable templates—introduction, phone opening, follow-up, demo structure, and proposal outline—with local-only drafts and clipboard confirmation that never implies sending. Delivery adds a twelve-point handover guide while retaining the existing one-project checklist and deriving saved completion only from genuine persisted stages.

Project cards and the checklist share compact Active, Paused, and Complete pills. Active and Complete use restrained sage/green pairs; Paused alone shifts to warm caution paper. Status is always labeled in text and, where space permits, reinforced with an icon rather than communicated by color alone.

Progress is a restrained 7px emerald track on a tonal-sage base. It is paired with completed/total copy and a tabular percentage, and is calculated from required stages only. Do not promote it into a chart or metric tile.

Step navigation is disclosed behind one compact **Your steps** control. Numbered or checked markers appear only when the member opens it; the selected step receives a pale-sage field and emerald marker. This avoids a permanent project-management rail and keeps the current step as the single page heading.

Checklist rows are quiet paper-like insets with a custom square check, task title, explanatory copy, and an explicit Required or Optional label. Checked rows use emerald confirmation and subdued strike-through copy. Paused projects remain readable while task and note controls are disabled.

Personal notes are collapsed behind **Add a personal note** or **My notes**. Opening and closing the native disclosure never unmounts or clears the draft. The bounded plain-text field, character count, Save action, saved/unsaved feedback, conflict handling, and leave-page protection remain unchanged.

Stage resources remain a separate supporting panel. Each row combines a quiet functional icon, title, description, and an honest availability pill such as Sample or Not connected; an explicit no-resource message replaces empty decoration.

### Account-Synced Saved Ideas

Account-synced Saved Ideas preserves the idea-card comparison unit, filter controls, and mobile full-width card action. Removal is a low-emphasis text action with a reversible forest toast; the empty state explains that the shortlist follows the account. Saving is distinct from starting a project, and the copy must preserve that separation.

## Do's and Don'ts

### Do:

- **Do** preserve the sage/white/tonal-sage hierarchy in member/authentication routes and the carbon/surface/panel hierarchy on the homepage.
- **Do** reserve Focused Emerald for incumbent operational interaction and Vault Lime for homepage action, selection, and allocation.
- **Do** pair Manrope headings with Inter utility copy and keep metadata compact.
- **Do** use schematic previews and explicit evidence labels to make ideas comparable.
- **Do** keep mobile navigation persistent and safe-area-aware while presenting one complete card per row.
- **Do** keep authentication forms inside a bounded white card over the sage field, including on mobile.
- **Do** keep the derived current focus visible even when another stage is selected for review.
- **Do** derive progress and completion from required work, while labeling optional tasks honestly.
- **Do** keep checklist, notes, and resources as distinct paper planes with explicit saved, unsaved, paused, empty, and unavailable states.
- **Do** keep the Pergola kit title, supporting sentence, demo action, protected source access, and honest customer-list state visible early on mobile.
- **Do** keep checklist progress, pause/resume, all-step navigation, and personal notes visually secondary to the kit.
- **Do** use the separate public shell for homepage and membership routes, including the horizontal desktop navigation and disclosure-based mobile menu.
- **Do** keep public idea cards and quick previews on the explicit safe projection; label them as summaries and keep implementation plans and protected resources out.
- **Do** keep US$1/USD one-time Pergola starter scope separate from the shared approved US$14.99 monthly presentation and 600-active model, pending Stripe checkout, and server-recorded paid entitlement.
- **Do** pair persuasive public sections with concrete product-shaped evidence, responsibility boundaries, and native FAQ disclosures.
- **Do** keep closing invitations consistent with their route appearance and existing destinations.
- **Do** label fixture counts and unknown production occupancy and distinguish the maximum 600-active model from implemented enforcement.

### Don't:

- **Don't** introduce hustle-culture styling, speculative earnings graphics, neon tickers, or unsupported urgency.
- **Don't** turn the member library into a generic analytics dashboard of charts and KPI tiles.
- **Don't** add decorative gradients, glass panels, or heavy shadows that weaken the paper-and-sage material system.
- **Don't** saturate passive member surfaces when sage hierarchy suffices; the homepage allocation plane is a scoped lime exception.
- **Don't** hide sample, unavailable, readiness, or evidence states behind aspirational copy.
- **Don't** treat selecting a stage as advancing the project or changing its current focus.
- **Don't** turn progress into dashboard theater, count optional tasks toward completion, or merge notes and resources into the checklist.
- **Don't** restore a permanent stage rail, expose “Plan v1,” or make project-management language the first thing a Pergola member sees.
- **Don't** reuse the signed-in sidebar or mobile bottom navigation on public pages.
- **Don't** expose protected plan details, resource identifiers, private customer data, or member-only implementation material in public cards, dialogs, or client bundles.
- **Don't** change the approved homepage price or invent starter duration, renewal, lifetime access, checkout availability, refund rights, testimonials, customer counts, demand validation, licence permissions, release cadence, or income outcomes.
- **Don't** let account creation read as payment confirmation or active membership; authentication and entitlement remain separate truths.
