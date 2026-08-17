import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { translateMessage } from "@/i18n/i18n-provider";
import { en, id } from "@/i18n/messages";

describe("translations", () => {
  it("keeps Indonesian dictionary aligned with English source keys", () => {
    expect(Object.keys(id).sort()).toEqual(Object.keys(en).sort());
  });

  it("translates Indonesian UI copy", () => {
    expect(translateMessage("id", "Attendance Recap")).toBe("Rekap Absensi");
    expect(translateMessage("id", "connected")).toBe("terhubung");
  });

  it("interpolates translated variables", () => {
    expect(translateMessage("id", "{count} attendance days", { count: 3 })).toBe("3 hari absensi");
  });

  it("preserves English product terminology", () => {
    expect(translateMessage("id", "Dashboard")).toBe("Dashboard");
    expect(translateMessage("id", "Playtime")).toBe("Playtime");
    expect(translateMessage("id", "Payslip")).toBe("Payslip");
  });
});

describe("translation coverage", () => {
  // The dictionaries are keyed by their English source string, so a literal
  // passed to t() that was never registered renders the raw English in both
  // locales and fails silently. This walks the UI and asserts every literal is
  // registered, which the key-alignment test above cannot catch.
  const literalCall = /\b(?:t|translate)\(\s*"((?:[^"\\]|\\.)*)"/g;
  // Only DashboardPage and PageHeader translate their props. Scoping to those
  // two matters: PlayerList also takes a `title`, renders it verbatim, and is
  // passed the product name "CFX", which must not be translated.
  const headerTag = /<(?:DashboardPage|PageHeader)\b[\s\S]{0,600}/g;
  const translatedProps = /\b(?:description|eyebrow|title)="((?:[^"\\]|\\.)*)"/g;

  function walk(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return walk(path);
      return entry.name.endsWith(".tsx") ? [path] : [];
    });
  }

  it("registers every literal passed to the translator", () => {
    const registered = new Set(Object.keys(en));
    const missing: string[] = [];

    for (const file of [...walk("src/components"), ...walk("src/app")]) {
      const source = readFileSync(file, "utf8");
      const scopes = [source, ...Array.from(source.matchAll(headerTag), (match) => match[0])];
      const found = new Set<string>();
      for (const literal of source.matchAll(literalCall)) found.add(literal[1]);
      for (const scope of scopes.slice(1)) {
        for (const prop of scope.matchAll(translatedProps)) found.add(prop[1]);
      }
      for (const literal of found) {
        if (!registered.has(literal)) missing.push(`${file}: ${literal}`);
      }
    }

    expect(missing).toEqual([]);
  });
});
