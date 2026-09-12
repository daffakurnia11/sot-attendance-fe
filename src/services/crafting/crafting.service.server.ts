import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchCraftingRecipes } from "./crafting-api";

export function loadCraftingRecipes() {
  return loadForMember("/crafting-calculator", fetchCraftingRecipes);
}
