import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken } from "@/lib/session.server";
import { calculateCraftingBatch, craftingBatchRequestSchema, fetchCraftingRecipes } from "@/services/crafting";

export async function GET(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await fetchCraftingRecipes(goAPIURL, accessToken));
  } catch {
    return NextResponse.json({ error: "Crafting recipes unavailable" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = craftingBatchRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid crafting request" }, { status: 422 });
  try {
    return NextResponse.json(await calculateCraftingBatch(goAPIURL, accessToken, parsed.data));
  } catch {
    return NextResponse.json({ error: "Crafting calculation unavailable" }, { status: 502 });
  }
}
