import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken } from "@/lib/session.server";
import { fetchAttendance } from "@/services/attendance";

export async function GET(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const month = new URL(request.url).searchParams.get("month") ?? undefined;
  try {
    return NextResponse.json(await fetchAttendance(goAPIURL, accessToken, month, fetch, true));
  } catch {
    return NextResponse.json({ error: "Attendance unavailable" }, { status: 502 });
  }
}
