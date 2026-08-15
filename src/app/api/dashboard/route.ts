import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken } from "@/lib/session.server";
import { fetchDashboard } from "@/services/dashboard";

export async function GET(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await fetchDashboard(goAPIURL, accessToken));
  } catch {
    return NextResponse.json({ error: "Dashboard unavailable" }, { status: 502 });
  }
}
