import { NextResponse } from "next/server";
import { z } from "zod";

import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { craftingStoreStockRequestSchema } from "@/services/crafting";

export const POST = memberRoute(
  "Crafting stock unavailable",
  async (accessToken, request) => {
    const parsed = craftingStoreStockRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Invalid crafting stock request" }, { status: 422 });
    const response = await fetch(new URL("/api/v1/crafting/store-stock", goAPIURL), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const parsedError = z.object({ error: z.object({ message: z.string() }) }).safeParse(payload);
      return NextResponse.json(
        { error: parsedError.success ? parsedError.data.error.message : "Crafting stock could not be stored" },
        { status: response.status },
      );
    }
    return new NextResponse(null, { status: 204 });
  },
  { admin: true },
);
