import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";

import { fetchSettings } from "./settings-api";

export async function loadSettings() {
  const requestHeaders = await headers();
  const token = await getToken({ req: new Request("http://localhost/settings", { headers: requestHeaders }), secret: serverEnv.AUTH_SECRET });
  if (typeof token?.appAccessToken !== "string") return null;
  return fetchSettings(goAPIURL, token.appAccessToken).catch(() => null);
}
