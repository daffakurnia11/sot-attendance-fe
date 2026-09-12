import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchAttendance } from "./attendance-api";

export function loadAttendance(personal = false) {
  return loadForMember("/attendance-recap", (apiURL, accessToken) =>
    fetchAttendance(apiURL, accessToken, undefined, fetch, personal),
  );
}
