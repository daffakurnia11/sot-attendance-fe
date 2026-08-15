import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchAttendance } from "./attendance-api";

export async function loadAttendance(personal = false) {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), "/attendance-recap"));
  if (!accessToken) return null;
  return fetchAttendance(goAPIURL, accessToken, undefined, fetch, personal).catch(() => null);
}
