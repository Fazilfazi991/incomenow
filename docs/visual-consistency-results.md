# Modern public direction and approved hero motion

## Result

The limited owner-review slice now uses the approved modern digital direction on the public homepage hero, interactive How it works explanation, and three public example covers. The rejected warm/printed-kit visual direction is no longer rendered in these surfaces. Existing account and protected member routes remain functionally unchanged.

The owner-supplied motion graphic is the hero’s sole visual. It sits beside—not behind—the headline and calls to action in a contained 16:9 charcoal media surface. The removed large “Illustrative Product Walkthrough” interface is no longer mounted by the homepage.

## Hero media behavior

- Preferred source: `/media/incomenow-hero-motion-loop.webm` (1280×720, 7.2 seconds, 599 KB).
- MP4 fallback: `/media/incomenow-hero-motion-loop.mp4` (1280×720, 7.2 seconds, 1.19 MB).
- Poster: `/media/incomenow-hero-poster.webp` (1280×720, 37 KB), derived from the closing approved frame.
- Autoplay is muted and `playsInline`; no native controls are exposed.
- The video loops continuously. FFmpeg rotates the timeline at the original midpoint and crossfades the original end/start boundary over 0.8 seconds, so the exported boundary returns to the same continuous source moment instead of hard-cutting.
- Intersection and page-visibility handling pause playback when the media is below 35% visibility or the browser tab is hidden, then resume without remounting.
- Reduced-motion users never receive a mounted video element; they receive the poster. Rejected autoplay also leaves the same poster visible.
- The media owns an explicit 16:9 aspect ratio and intrinsic 1280×720 dimensions. Production browser measurement reported CLS 0 before the hero integration; the final player preserves the same explicit layout contract.
- The 16:9 composition remains readable as a contained player at 390px and 320px. A dedicated portrait asset is a future enhancement, not part of this responsive prototype.
- The browser prefers the 599 KB VP9 WebM and retains the 1.19 MB H.264 MP4 fallback. A browser selects one source rather than loading both videos simultaneously.

## Account-aware actions

- Eligible visitor: **Try IncomeNow for US$1**.
- Starter: **Open your starter**.
- Full member: **Open idea library**.
- Unavailable access: **Check account access** in the hero; the homepage header suppresses its duplicate unavailable-state action.
- Secondary action: **Browse ideas**.

## Verification

- TypeScript: pass.
- ESLint: pass.
- Vitest/Testing Library: 97 tests across 28 files pass.
- Optimized Next.js production build: pass.
- Browser widths: 1440, 768, 390, and 320 pixels pass without horizontal overflow.
- Desktop autoplay: confirmed advancing, muted, inline, controls false, loop true, intrinsic 1280×720.
- Offscreen pause: confirmed with the video paused after the hero moved substantially outside the viewport.
- Reduced motion: confirmed with zero video elements mounted and the poster loaded.
- Fresh production browser console: no warnings or errors. A separate saved local browser profile carried an already-used Supabase refresh token and emitted the existing handled server-side auth warning; that stale session is outside the hero-media change.
- Production layout shift check: CLS 0.
- Browser Back and public navigation: pass.

## Evidence

- `artifacts/modern-motion/approved-video-hero-desktop-1440.png`
- `artifacts/modern-motion/approved-video-hero-tablet-768.png`
- `artifacts/modern-motion/approved-video-hero-mobile-390.png`
- `artifacts/modern-motion/approved-video-hero-mobile-320.png`
- `artifacts/modern-motion/loop-boundary-contact-sheet.png`
- `artifacts/modern-motion/cover-contact-sheet.png`

Local owner-review route: `http://localhost:3000/` while the development server is running. No push or deployment was performed.
