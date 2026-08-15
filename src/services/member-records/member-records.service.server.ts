import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchMemberRecords } from "./member-records-api";

export async function loadMemberRecords() {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), "/my-records"));
  if (!accessToken) return null;
  return fetchMemberRecords(goAPIURL, accessToken).catch(() => null);
}
