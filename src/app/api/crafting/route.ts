import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { calculateCraftingBatch, craftingBatchRequestSchema, fetchCraftingRecipes } from "@/services/crafting";

export const GET = memberRoute("Crafting recipes unavailable", async (accessToken) =>
  Response.json(await fetchCraftingRecipes(goAPIURL, accessToken)),
);

export const POST = memberRoute("Crafting calculation unavailable", async (accessToken, request) => {
  const parsed = craftingBatchRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid crafting request" }, { status: 422 });
  return Response.json(await calculateCraftingBatch(goAPIURL, accessToken, parsed.data));
});
