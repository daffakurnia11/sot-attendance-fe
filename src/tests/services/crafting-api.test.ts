import { describe, expect, it } from "vitest";

import {
  calculateCrafting,
  calculateCraftingBatch,
  craftingBatchRequestSchema,
  craftingRequestSchema,
  fetchCraftingRecipes,
} from "@/services/crafting";

const recipes = {
  recipes: [{ weapon_code: "desert_eagle", weapon_name: "Desert Eagle", output_quantity: 1, crafting_time_seconds: 8 }],
};

const calculation = {
  weapon_code: "desert_eagle",
  weapon_name: "Desert Eagle",
  requested_quantity: 3,
  output_quantity_per_craft: 1,
  craft_count: 3,
  crafting_time_seconds: 24,
  ingredients: [{ item_code: "iron", item_name: "Iron", quantity_per_craft: 25, total_quantity: 75 }],
};

const batchCalculation = {
  recipes: [calculation],
  total_requested_quantity: 3,
  total_craft_count: 3,
  total_crafting_time_seconds: 24,
  ingredients: [{ item_code: "iron", item_name: "Iron", total_quantity: 75 }],
};

describe("crafting API", () => {
  it("loads and validates recipe options", async () => {
    const fetcher = async () => new Response(JSON.stringify(recipes));
    await expect(fetchCraftingRecipes("http://api.test", "token", fetcher as typeof fetch)).resolves.toEqual(recipes);
  });

  it("sends validated calculation input", async () => {
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ weapon_code: "desert_eagle", quantity: 3 });
      return new Response(JSON.stringify(calculation));
    };
    await expect(
      calculateCrafting(
        "http://api.test",
        "token",
        { weapon_code: "desert_eagle", quantity: 3 },
        fetcher as typeof fetch,
      ),
    ).resolves.toEqual(calculation);
  });

  it("rejects zero, fractional, and excessive quantities", () => {
    for (const quantity of [0, 1.5, 10_001]) {
      expect(craftingRequestSchema.safeParse({ weapon_code: "desert_eagle", quantity }).success).toBe(false);
    }
  });

  it("sends multiple recipes and validates combined totals", async () => {
    const input = { recipes: [{ weapon_code: "desert_eagle", quantity: 3 }] };
    const fetcher = async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(url)).toBe("http://api.test/api/v1/crafting/calculate-batch");
      expect(JSON.parse(String(init?.body))).toEqual(input);
      return new Response(JSON.stringify(batchCalculation));
    };
    await expect(calculateCraftingBatch("http://api.test", "token", input, fetcher as typeof fetch)).resolves.toEqual(
      batchCalculation,
    );
  });

  it("rejects duplicate recipes", () => {
    expect(
      craftingBatchRequestSchema.safeParse({
        recipes: [
          { weapon_code: "mp9", quantity: 1 },
          { weapon_code: "mp9", quantity: 2 },
        ],
      }).success,
    ).toBe(false);
  });
});
