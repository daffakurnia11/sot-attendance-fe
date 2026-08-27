import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchMemberProfile } from "./member-profile-api";

export async function loadMemberProfile() {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), "/settings"));
  if (!accessToken) return null;
  return fetchMemberProfile(goAPIURL, accessToken).catch(() => null);
}
