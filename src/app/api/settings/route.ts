import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { settingsValuesSchema, updateSettings } from "@/services/settings";

export const PATCH = memberRoute("Settings unavailable", async (accessToken, request) => {
  const parsed = settingsValuesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid settings" }, { status: 400 });
  try {
    return NextResponse.json(await updateSettings(goAPIURL, accessToken, parsed.data));
  } catch (error) {
    // The Go API explains why an update was rejected; that message is useful
    // to the admin editing the form, so it is surfaced instead of swallowed.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Settings unavailable" },
      { status: 502 },
    );
  }
});
