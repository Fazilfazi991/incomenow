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
});
