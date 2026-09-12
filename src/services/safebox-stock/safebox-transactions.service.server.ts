import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchSafeboxTransactions } from "./safebox-stock-api";

export function loadSafeboxTransactions(path: string, safebox: "public" | "boss") {
  return loadForMember(path, (apiURL, accessToken) => fetchSafeboxTransactions(apiURL, accessToken, safebox));
}
