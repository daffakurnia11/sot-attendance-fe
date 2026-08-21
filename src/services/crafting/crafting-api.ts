import { z } from "zod";

const recipeSchema = z.object({
  weapon_code: z.string().min(1),
  weapon_name: z.string().min(1),
  output_quantity: z.number().int().positive(),
  crafting_time_seconds: z.number().int().positive(),
});

export const craftingRecipesSchema = z.object({ recipes: z.array(recipeSchema) });

const calculatedIngredientSchema = z.object({
  item_code: z.string().min(1),
  item_name: z.string().min(1),
  quantity_per_craft: z.number().int().positive(),
  total_quantity: z.number().int().positive(),
});

export const craftingCalculationSchema = z.object({
  weapon_code: z.string().min(1),
  weapon_name: z.string().min(1),
  requested_quantity: z.number().int().min(1).max(10_000),
  output_quantity_per_craft: z.number().int().positive(),
  craft_count: z.number().int().positive(),
  crafting_time_seconds: z.number().int().positive(),
  ingredients: z.array(calculatedIngredientSchema),
});

export const craftingRequestSchema = z.object({
  weapon_code: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(10_000),
});

export const craftingBatchRequestSchema = z.object({
  recipes: z
    .array(craftingRequestSchema)
    .min(1)
    .max(20)
    .refine((recipes) => new Set(recipes.map((recipe) => recipe.weapon_code)).size === recipes.length, {
      message: "Each weapon recipe may only be selected once",
    }),
});

export const craftingBatchCalculationSchema = z.object({
  recipes: z.array(craftingCalculationSchema).min(1).max(20),
  total_requested_quantity: z.number().int().positive(),
  total_craft_count: z.number().int().positive(),
  total_crafting_time_seconds: z.number().int().positive(),
  ingredients: z.array(
    z.object({
      item_code: z.string().min(1),
      item_name: z.string().min(1),
      total_quantity: z.number().int().positive(),
    }),
  ),
});

export type CraftingRecipes = z.infer<typeof craftingRecipesSchema>;
export type CraftingCalculation = z.infer<typeof craftingCalculationSchema>;
export type CraftingRequest = z.infer<typeof craftingRequestSchema>;
export type CraftingBatchRequest = z.infer<typeof craftingBatchRequestSchema>;
export type CraftingBatchCalculation = z.infer<typeof craftingBatchCalculationSchema>;

export async function fetchCraftingRecipes(baseURL: string, accessToken: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(new URL("/api/v1/crafting/recipes", baseURL), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Crafting recipes API returned ${response.status}`);
  const parsed = craftingRecipesSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Crafting recipes API returned invalid data");
  return parsed.data;
}

export async function calculateCrafting(
  baseURL: string,
  accessToken: string,
  input: CraftingRequest,
  fetcher: typeof fetch = fetch,
) {
  const payload = craftingRequestSchema.parse(input);
  const response = await fetcher(new URL("/api/v1/crafting/calculate", baseURL), {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Crafting calculator API returned ${response.status}`);
  const parsed = craftingCalculationSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Crafting calculator API returned invalid data");
  return parsed.data;
}

export async function calculateCraftingBatch(
  baseURL: string,
  accessToken: string,
  input: CraftingBatchRequest,
  fetcher: typeof fetch = fetch,
) {
  const payload = craftingBatchRequestSchema.parse(input);
  const response = await fetcher(new URL("/api/v1/crafting/calculate-batch", baseURL), {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Crafting batch calculator API returned ${response.status}`);
  const parsed = craftingBatchCalculationSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Crafting batch calculator API returned invalid data");
  return parsed.data;
}
