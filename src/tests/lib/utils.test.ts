import { describe, expect, it } from "vitest";

import { cn } from "@/lib";

describe("cn", () => {
  it("merges conflicting Tailwind utilities", () => {
    expect(cn("px-2", false, "px-4")).toBe("px-4");
  });
});
