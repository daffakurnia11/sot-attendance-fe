import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, isAdminSession } from "@/lib/session.server";
import {
  fetchSafeboxStock,
  SafeboxTransactionAPIError,
  safeboxTransactionSchema,
  transactSafeboxStock,
} from "@/services/safebox-stock/safebox-stock-api";

export async function GET(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminSession())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await fetchSafeboxStock(goAPIURL, accessToken));
  } catch {
    return NextResponse.json({ error: "Safebox stock unavailable" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminSession())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = safeboxTransactionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid safebox transaction" }, { status: 400 });
  try {
    await transactSafeboxStock(goAPIURL, accessToken, parsed.data);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof SafeboxTransactionAPIError && error.status >= 400 && error.status < 500) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Safebox transaction unavailable" }, { status: 502 });
  }
}
