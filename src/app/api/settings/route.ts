import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken } from "@/lib/session.server";
import { settingsValuesSchema, updateSettings } from "@/services/settings";

export async function PATCH(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = settingsValuesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  try {
    return NextResponse.json(await updateSettings(goAPIURL, accessToken, parsed.data));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Settings unavailable" }, { status: 502 });
  }
}
