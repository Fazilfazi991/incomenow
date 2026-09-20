---
name: Editorial Venture Discovery
colors:
  surface: '#eefdf3'
  surface-dim: '#ceded4'
  surface-bright: '#eefdf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e8f7ed'
  surface-container: '#e2f2e8'
  surface-container-high: '#ddece2'
  surface-container-highest: '#d7e6dc'
  on-surface: '#111e18'
  on-surface-variant: '#3f4943'
  inverse-surface: '#26332d'
  inverse-on-surface: '#e5f4eb'
  outline: '#6f7a72'
  outline-variant: '#bec9c1'
  surface-tint: '#006c4a'
  primary: '#006041'
  on-primary: '#ffffff'
  primary-container: '#197a56'
  on-primary-container: '#acffd4'
  inverse-primary: '#80d8ad'
  secondary: '#47645a'
  on-secondary: '#ffffff'
  secondary-container: '#c9eadd'
  on-secondary-container: '#4d6a60'
  tertiary: '#4f5552'
  on-tertiary: '#ffffff'
  tertiary-container: '#676d6a'
  on-tertiary-container: '#eaefeb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9bf5c8'
  primary-fixed-dim: '#80d8ad'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005237'
  secondary-fixed: '#c9eadd'
  secondary-fixed-dim: '#aecdc1'
  on-secondary-fixed: '#022019'
  on-secondary-fixed-variant: '#304c43'
  tertiary-fixed: '#dfe4e0'
  tertiary-fixed-dim: '#c2c8c4'
  on-tertiary-fixed: '#171d1b'
  on-tertiary-fixed-variant: '#424845'
  background: '#eefdf3'
  on-background: '#111e18'
  surface-variant: '#d7e6dc'
typography:
  display-hero:
    fontFamily: Manrope
    fontSize: 3.25rem
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.35'
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: '1.55'
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: '1.25'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an editorial, structured, and pragmatic workspace for modern entrepreneurs and builders. It deliberately strips away hustle-culture hyperbole, neon tickers, and speculative hype in favor of institutional clarity, measured authority, and tactile calm.

### Core Tenets
- **Pragmatic Editorialism:** Balances dense, high-utility business breakdowns with generous breathing room and disciplined typographic hierarchy.
- **Architectural Grounding:** Built on deep forest anchors, paper-tinted neutral planes, and crisp micro-borders that evoke structured physical stationery and execution blueprints.
- **Utilitarian Elegance:** Information density is managed via purposeful metadata pills, contextual workspaces, and low-friction interactive states.

## Colors

The palette relies on organic, botanical-rooted mineral tones paired with high-contrast functional values.

### Color Tokens
- **Canvas (`#F6F7F4`):** Warm, calming paper base that reduces screen fatigue over extended deep-dive reading.
- **Surface (`#FFFFFF`):** High-clarity elevated white for structural cards, data modules, and execution boards.
- **Brand Navy/Forest (`#102D25`):** Structural anchor used for persistent navigation rails, mastheads, and editorial emphasis.
- **Action Primary (`#197A56`):** Focused emerald for core actions, buttons, and active workflow milestones. Active hover resolves to `#136043`.
- **Text Dominant (`#18251F`):** Deep charcoal with subtle olive undertones, ensuring high legibility without harsh absolute black contrast.
- **Text Muted (`#5B6B63`):** Neutral slate-sage for subtext, metadata labels, timestamps, and structural annotations.
- **Surface Muted / Tag Neutral (`#EDF2EE`):** Soft sage base for inactive chips, input borders (`#D5DFD9`), and secondary panels.

### Semantic Badges & Resource Accents
Soft, tinted pill backgrounds with matching high-contrast text:
- **Demo / Interactive:** Background `#E6F4EA`, Text `#137333`, Border `#CEEAD6`
- **Source Code / Technical:** Background `#E8F0FE`, Text `#1A73E8`, Border `#D2E3FC`
- **Setup Guide / Docs:** Background `#FEF7E0`, Text `#B06000`, Border `#FEEFC3`
- **Workflow / Automation:** Background `#F3E8FD`, Text `#7627BB`, Border `#E9D2FD`
- **Templates / Assets:** Background `#FCE8E6`, Text `#C5221F`, Border `#FAD2CF`

## Typography

Manrope delivers architectural geometric confidence in titles and numeric milestones, while Inter ensures neutral, uncompromised legibility for execution specs, operational steps, and tabular data. 

### Usage Rules
- `display-hero` is reserved strictly for directory milestones and top-level workspace landing banners.
- Numbers within metrics, financial breakdowns, and potential yield estimators must use tabular figures (`font-variant-numeric: tabular-nums`).
- All subheadings below `headline-sm` convert to `label-md` or `label-sm` with upper/medium sentence case to preserve structured modular hierarchies.

## Layout & Spacing

A disciplined 12-column grid anchors the workspace layout across large screens, transitioning to an 8-column layout on tablets and a single-column stack on mobile devices.

### Breakpoints & Flow
- **Desktop (>= 1200px):** 12 columns, fixed sidebar or top nav, content container max width `1280px`, outer margin `2.5rem`, column gutter `1.5rem`.
- **Tablet (768px – 1199px):** 8 columns, collapsible secondary metadata drawer, outer margin `1.5rem`, gutter `1rem`.
- **Mobile (< 768px):** Single column vertical flow, bottom navigation drawer or condensed app bar, outer margin `1rem`, gutter `1rem`.

Cards and modular panels utilize internal padding intervals of `space-md` (16px) for utility items and `space-lg` (24px) for full idea briefs.

## Elevation & Depth

Visual hierarchy uses flat micro-boundaries and delicate ambient diffusion instead of aggressive drop shadows.

### Elevation Hierarchy
- **Level 0 (Base Canvas):** `#F6F7F4` completely flat.
- **Level 1 (Default Cards & Boards):** Pure white `#FFFFFF` surface with a crisp 1px structural outline of `#E4E7E1`. Shadow: `0 1px 2px rgba(16, 45, 37, 0.04)`.
- **Level 2 (Hover / Active Cards):** Lifted state upon hover or active selection. Outline shifts to `#D5DFD9`. Shadow: `0 4px 12px rgba(16, 45, 37, 0.07), 0 1px 3px rgba(16, 45, 37, 0.04)`.
- **Level 3 (Modals, Overlays & Popovers):** `#FFFFFF` surface with `#D5DFD9` boundary. Shadow: `0 12px 32px -4px rgba(16, 45, 37, 0.12), 0 4px 8px -2px rgba(16, 45, 37, 0.04)`.

## Shapes

The geometric framework balances approachable softness with modular discipline, centered on a 14–16px baseline radius.

### Corner Radii
- **Standard Cards, Panels & Modals:** `rounded-lg` (16px / `1rem`).
- **Form Inputs, Buttons & Tab Bars:** `rounded-md` (8px / `0.5rem`).
- **Status Pills, Category Tags & Interactive Badges:** Fully pill-shaped (`9999px`) for quick visual scanning.

## Components

### Buttons
- **Primary:** Solid `#197A56` fill, white `#FFFFFF` text, `rounded-md` (8px), height 40px (padding 0 16px). Hover: `#136043`. Active: transform scale `0.99`.
- **Secondary / Outline:** Background transparent or `#FFFFFF`, border 1px solid `#D5DFD9`, text `#18251F`. Hover: background `#EDF2EE`, border `#C4D1C9`.
- **Tertiary / Ghost:** Text `#102D25`, background transparent. Hover: background `#EDF2EE`.

### Cards (Idea & Workspace Cards)
- Background `#FFFFFF`, border 1px solid `#E4E7E1`, corner radius 16px, padding 20px–24px.
- Subtle transition on hover: translateY(-2px), border color `#D5DFD9`, elevation Level 2.
- Internal structure: Metadata row at top (Category tag + complexity indicator), bold Manrope title, 2-line Inter summary, bottom resource badge stack + action link.

### Chips & Resource Badges
- **Resource Badges (Demo, Source, Setup, Workflow, Template):** Pill radius (9999px), height 24px, typography `label-sm`, padding `2px 10px`. Colors defined in the semantic accent palette.
- **Filter Chips:** Height 32px, `rounded-md` (8px) or pill, background `#EDF2EE`, border 1px solid `#D5DFD9`, text `#18251F`. Active state: background `#102D25`, text `#FFFFFF`, border `#102D25`.

### Input Fields & Controls
- **Text Inputs:** Height 40px, background `#FFFFFF`, border 1px solid `#D5DFD9`, text `#18251F`, placeholder `#5B6B63`, radius 8px. Focus: border 1.5px solid `#197A56`, outline 2px soft ring `rgba(25, 122, 86, 0.15)`.
- **Checkboxes & Radios:** 18px size, border 1.5px solid `#D5DFD9`, radius 4px (checkbox) or 50% (radio). Checked state: fill `#197A56`, border `#197A56`, inner icon pure white.

### Lists & Workspace Rows
- Alternating or border-divided rows (`#E4E7E1`), padding `12px 16px`, hover state tint `#F6F7F4`.
- Left icon/status indicator aligned with title, secondary details set to `body-sm` (`#5B6B63`), pinned action items docked right.

### Icons
- Clean, 1.5px outline stroke weight (Lucide standard). Size: 16px inside buttons/badges, 20px for navigational items. Tint matched directly to adjacent text token.