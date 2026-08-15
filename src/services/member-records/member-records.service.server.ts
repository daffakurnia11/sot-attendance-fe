import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";

import { fetchMemberRecords } from "./member-records-api";

export async function loadMemberRecords() {
  const requestHeaders = await headers();
  const token = await getToken({
    req: new Request("http://localhost/my-records", { headers: requestHeaders }),
    secret: serverEnv.AUTH_SECRET,
  });
  if (typeof token?.appAccessToken !== "string") return null;
  return fetchMemberRecords(goAPIURL, token.appAccessToken).catch(() => null);
}
