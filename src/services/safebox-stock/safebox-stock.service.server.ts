import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchSafeboxStock } from "./safebox-stock-api";

export async function loadSafeboxStock(path: string) {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), path));
  if (!accessToken) return null;
  return fetchSafeboxStock(goAPIURL, accessToken).catch(() => null);
}
