import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";
import { settingsValuesSchema, updateSettings } from "@/services/settings";

export async function PATCH(request: Request) {
  const token = await getToken({ req: request, secret: serverEnv.AUTH_SECRET });
  if (typeof token?.appAccessToken !== "string") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = settingsValuesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  try {
    return NextResponse.json(await updateSettings(goAPIURL, token.appAccessToken, parsed.data));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Settings unavailable" }, { status: 502 });
  }
}
