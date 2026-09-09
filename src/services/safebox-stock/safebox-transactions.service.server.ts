import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchSafeboxTransactions } from "./safebox-stock-api";

export async function loadSafeboxTransactions(path: string, safebox: "public" | "boss") {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), path));
  if (!accessToken) return null;
  return fetchSafeboxTransactions(goAPIURL, accessToken, safebox).catch(() => null);
}
