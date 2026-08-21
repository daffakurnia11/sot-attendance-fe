import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchCraftingRecipes } from "./crafting-api";

export async function loadCraftingRecipes() {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), "/crafting-calculator"));
  if (!accessToken) return null;
  return fetchCraftingRecipes(goAPIURL, accessToken).catch(() => null);
}
