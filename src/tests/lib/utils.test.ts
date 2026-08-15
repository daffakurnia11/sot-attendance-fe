import { describe, expect, it } from "vitest";

import { cn } from "@/lib";
import { resolveSecureCookies } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting Tailwind utilities", () => {
    expect(cn("px-2", false, "px-4")).toBe("px-4");
  });
});

describe("resolveSecureCookies", () => {
  it("uses prefixed cookies on an HTTPS origin", () => {
    expect(resolveSecureCookies("https://sot.dafkur.com", "production")).toBe(true);
  });

  it("uses unprefixed cookies on a plain HTTP origin", () => {
    expect(resolveSecureCookies("http://localhost:3000", "development")).toBe(false);
  });

  it("does not treat a production build as secure when the origin is HTTP", () => {
    expect(resolveSecureCookies("http://localhost:3000", "production")).toBe(false);
  });

  it("falls back to the build mode when no origin is configured", () => {
    expect(resolveSecureCookies(undefined, "production")).toBe(true);
    expect(resolveSecureCookies(undefined, "development")).toBe(false);
  });
});
