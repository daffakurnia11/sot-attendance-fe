import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken } from "@/lib/session.server";
import { memberProfileSchema, updateMemberProfile } from "@/services/member-profile";

export async function PATCH(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = memberProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Character name must contain 1 to 80 characters." }, { status: 400 });
  try {
    return NextResponse.json(await updateMemberProfile(goAPIURL, accessToken, parsed.data));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Profile unavailable" },
      { status: 502 },
    );
  }
}
