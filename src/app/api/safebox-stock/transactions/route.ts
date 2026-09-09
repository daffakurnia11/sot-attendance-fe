import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, isAdminSession } from "@/lib/session.server";
import { fetchSafeboxTransactions } from "@/services/safebox-stock";

export async function GET(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminSession())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const safebox = new URL(request.url).searchParams.get("safebox");
  if (safebox !== "public" && safebox !== "boss") {
    return NextResponse.json({ error: "Safebox must be public or boss" }, { status: 400 });
  }
  try {
    return NextResponse.json(await fetchSafeboxTransactions(goAPIURL, accessToken, safebox));
  } catch {
    return NextResponse.json({ error: "Safebox transactions unavailable" }, { status: 502 });
  }
}
