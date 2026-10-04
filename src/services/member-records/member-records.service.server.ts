import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchMemberRecords } from "./member-records-api";

export function loadMemberRecords(discordUserID?: string) {
  return loadForMember("/my-records", (url, token) => fetchMemberRecords(url, token, fetch, discordUserID));
}
