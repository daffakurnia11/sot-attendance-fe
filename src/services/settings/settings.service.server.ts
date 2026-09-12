import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchSettings } from "./settings-api";

export function loadSettings() {
  return loadForMember("/settings", fetchSettings);
}
