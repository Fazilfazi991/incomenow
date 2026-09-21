import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("narrow mobile layout", () => {
  it("contains the idea section navigation while preserving its internal scroll", () => {
    const mobileRules = stylesheet.slice(
      stylesheet.indexOf("@media (max-width: 767px)"),
      stylesheet.indexOf("@media (max-width: 360px)"),
    );
    const sectionNavRule = mobileRules.match(/\.section-nav\s*\{([^}]*)\}/)?.[1];

    expect(stylesheet).toMatch(/\.section-nav\s*\{[^}]*overflow-x:\s*auto/);
    expect(sectionNavRule).toContain("max-width: 100%");
    expect(sectionNavRule).toContain("margin: 8px 0 0");
    expect(sectionNavRule).not.toMatch(/margin:[^;]*-\d/);
  });

  it("defines shared kit motion and removes non-essential movement for reduced-motion users", () => {
    expect(stylesheet).toMatch(/--motion-press:\s*120ms/);
    expect(stylesheet).toMatch(/--motion-state:\s*180ms/);
    expect(stylesheet).toMatch(/--motion-enter:\s*320ms/);
    const reducedMotionRules = stylesheet.slice(stylesheet.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reducedMotionRules).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(reducedMotionRules).toMatch(/animation-iteration-count:\s*1\s*!important/);
  });

  it("stacks the interactive kit to one column and guards the narrowest viewport", () => {
    const mobileRules = stylesheet.slice(
      stylesheet.indexOf("@media (max-width: 767px)"),
      stylesheet.indexOf("/* Public website */"),
    );
    expect(mobileRules).toMatch(/\.kit-activity-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
    expect(mobileRules).toMatch(/\.sales-workbench\s*\{[^}]*grid-template-columns:\s*1fr/);
    expect(mobileRules).toMatch(/\.delivery-stage-map\s*\{[^}]*grid-template-columns:\s*1fr/);
  });
});

describe("public homepage hero", () => {
  it("uses explicit compact spacing below the navigation instead of viewport-filling height", () => {
    const modernPublicRules = stylesheet.slice(stylesheet.indexOf("/* Modern digital public showcase"));
    const heroRule = modernPublicRules.match(/\.public-hero\s*\{([^}]*)\}/)?.[1];

    expect(heroRule).toContain("min-height: auto");
    expect(heroRule).toContain("padding-block: 48px 72px");
  });
});
