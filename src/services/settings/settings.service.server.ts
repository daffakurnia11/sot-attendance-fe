import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchSettings } from "./settings-api";

export async function loadSettings() {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), "/settings"));
  if (!accessToken) return null;
  return fetchSettings(goAPIURL, accessToken).catch(() => null);
}
