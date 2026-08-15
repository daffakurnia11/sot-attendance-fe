import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";

import { fetchAttendance } from "./attendance-api";

export async function loadAttendance(personal = false) {
  const requestHeaders = await headers();
  const token = await getToken({
    req: new Request("http://localhost/attendance-recap", { headers: requestHeaders }),
    secret: serverEnv.AUTH_SECRET,
  });
  if (typeof token?.appAccessToken !== "string") return null;
  return fetchAttendance(goAPIURL, token.appAccessToken, undefined, fetch, personal).catch(() => null);
}
