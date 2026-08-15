import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchDashboard } from "./dashboard-api";

export async function loadDashboard() {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), "/dashboard"));
  if (!accessToken) return null;
  return fetchDashboard(goAPIURL, accessToken).catch(() => null);
}
