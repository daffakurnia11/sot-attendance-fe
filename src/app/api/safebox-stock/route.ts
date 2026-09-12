import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import {
  fetchSafeboxStock,
  SafeboxTransactionAPIError,
  safeboxTransactionSchema,
  transactSafeboxStock,
} from "@/services/safebox-stock/safebox-stock-api";

export const GET = memberRoute(
  "Safebox stock unavailable",
  async (accessToken) => Response.json(await fetchSafeboxStock(goAPIURL, accessToken)),
  { admin: true },
);

export const POST = memberRoute(
  "Safebox transaction unavailable",
  async (accessToken, request) => {
    const parsed = safeboxTransactionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Invalid safebox transaction" }, { status: 400 });
    try {
      await transactSafeboxStock(goAPIURL, accessToken, parsed.data);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      // A 4xx from the Go API is a rejected transaction, not an outage: the
      // reason (insufficient stock, replayed idempotency key) belongs to the
      // caller, so it is passed through rather than flattened into a 502.
      if (error instanceof SafeboxTransactionAPIError && error.status >= 400 && error.status < 500) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  },
  { admin: true },
);
