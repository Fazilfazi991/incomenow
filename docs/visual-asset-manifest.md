# Visual asset manifest

## Current public direction

The owner-review direction is **Modern Opportunity Workspace**: cool-white and charcoal structure, recognisable emerald actions, controlled cyan/blue/violet illustration accents, crisp digital objects, and deliberate depth. The previous warm **Tangible Fieldwork** / printed-kit direction is retired for new public assets.

All current owner-review covers were generated for IncomeNow with OpenAI’s built-in image-generation tool on 2026-09-21. They use no stock photography, remote hotlinks, third-party logos, readable generated lettering, or recognisable people. The source generations were center-cropped to 16:10, resized to 1280×800, and exported as WebP with bundled Pillow.

## Owner-review assets

| Path | Size | Placement | Accessible description | Prompt subject |
| --- | ---: | --- | --- | --- |
| `/artwork/marketing/modern/pergola-kit.webp` | 1280×800 · 86 KB | Public Pergola card/dialog and homepage starter preview | A contemporary pergola model connected to a clean digital workflow | Aluminum-and-timber pergola paired with enquiry, quotation, schedule, and handoff nodes in a cool studio |
| `/artwork/marketing/modern/automation-kit.webp` | 1280×800 · 30 KB | Public automation card/dialog | A clean quotation, calendar, task, and completion workflow | Connected quotation, calendar, task, and completion objects on cool-white and charcoal planes |
| `/artwork/marketing/modern/lead-website-kit.webp` | 1280×800 · 50 KB | Public lead-website card/dialog | A modern enquiry website connected to location pins and a service van | Text-free browser/enquiry composition with map routing, location pins, service van, and tool case |
| `/media/incomenow-hero-motion-loop.webm` | 1280×720 · 599 KB · 7.2 s | Public homepage hero, preferred source | Seamless IncomeNow opportunity-to-offer loop | VP9 derivative of the owner-supplied marketing media |
| `/media/incomenow-hero-motion-loop.mp4` | 1280×720 · 1.19 MB · 7.2 s | Public homepage hero, compatibility fallback | Seamless IncomeNow opportunity-to-offer loop | H.264 derivative of the owner-supplied marketing media |
| `/media/incomenow-hero-motion.mp4` | 1280×720 · 1.82 MB · 8 s | Preserved public source; not loaded by the hero | Approved IncomeNow opportunity-to-offer motion graphic | Owner-supplied original marketing media |
| `/media/incomenow-hero-poster.webp` | 1280×720 · 37 KB | Hero poster and reduced-motion fallback | Pergola kit connected to its demo, source, guide, and offer panel | Closing frame derived from the owner-approved motion graphic |

The How it works visual remains a semantic React/HTML/CSS composition so controls, labels, focus, and safe public content remain inspectable and accessible. The browser selects one hero source; it does not load both. The VP9 WebM materially reduces transfer size versus the H.264 fallback. Both derivatives rotate the timeline at the original midpoint and use an 0.8-second crossfade over the original end/start boundary, leaving the exported start and end on the same continuous point.

## Verified product evidence

| Path | Size | Placement | Accessible description | Provenance |
| --- | ---: | --- | --- | --- |
| `/artwork/ideas/zerodebt-personal-finance-saas.webp` | 1440×900 · 43 KB | IDEA #004 catalogue, safe preview, and protected demo activity | The verified ZeroDebt overview showing synthetic debt, cash-flow, and payoff information | Browser capture of the Phase 1 local synthetic demo at verified commit `b0763b7`; no real account or financial data |

This screenshot is product evidence, not generated imagery. Its synthetic-demo notice remains visible in the image, and nearby live HTML repeats the public-deployment and financial-information boundaries.

## Legacy local assets

The earlier illustrations under `/artwork/ideas/` and `/artwork/marketing/` remain local because existing member routes reference them. They are not the approved direction for new public work. The verified ZeroDebt screenshot above is the documented exception. `/artwork/marketing/homepage-hero.webp` is no longer rendered on the homepage. Do not propagate or regenerate the legacy warm set while this limited direction awaits owner review.

## Runtime rules

- Render raster covers with `next/image` through the shared `ArtworkImage` component.
- Keep titles, offer terms, access state, resource availability, progress, and all interface labels in live HTML.
- Never present generated imagery as a verified software screenshot.
- Keep public cover selection in the explicit safe projection; never serialize protected sections, resource identifiers, download paths, customer information, or account data.
- Preserve descriptive alternative text and the accessible local fallback.
- New public imagery must remain cool-neutral and modern; do not reintroduce rustic desks, printed kits, sepia/golden-hour grading, vintage props, lifestyle leaves/scenery, money graphics, crypto, excessive neon, or glowing AI-orb motifs.
