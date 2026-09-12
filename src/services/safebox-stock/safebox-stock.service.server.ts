import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchSafeboxStock } from "./safebox-stock-api";

export function loadSafeboxStock(path: string) {
  return loadForMember(path, fetchSafeboxStock);
}
