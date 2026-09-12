import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchMemberRecords } from "./member-records-api";

export function loadMemberRecords() {
  return loadForMember("/my-records", fetchMemberRecords);
}
