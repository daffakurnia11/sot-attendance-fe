import { describe, expect, it } from "vitest";

import { paginateItems } from "@/components/atoms";

describe("paginateItems", () => {
  it("returns independent ten-row pages without changing input", () => {
    const items = Array.from({ length: 21 }, (_, index) => index + 1);
    expect(paginateItems(items, 1)).toEqual(items.slice(0, 10));
    expect(paginateItems(items, 2)).toEqual(items.slice(10, 20));
    expect(paginateItems(items, 3)).toEqual([21]);
    expect(paginateItems(items, 99)).toEqual([21]);
    expect(items).toHaveLength(21);
  });
});
