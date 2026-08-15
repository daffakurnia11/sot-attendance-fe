import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";
import { fetchDashboard } from "@/services/dashboard";

export async function GET(request: Request) {
  const token = await getToken({ req: request, secret: serverEnv.AUTH_SECRET });
  if (typeof token?.appAccessToken !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await fetchDashboard(goAPIURL, token.appAccessToken));
  } catch {
    return NextResponse.json({ error: "Dashboard unavailable" }, { status: 502 });
  }
}
