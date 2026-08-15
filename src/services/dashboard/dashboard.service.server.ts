import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";

import { fetchDashboard } from "./dashboard-api";

export async function loadDashboard() {
  const requestHeaders = await headers();
  const token = await getToken({
    req: new Request("http://localhost/dashboard", { headers: requestHeaders }),
    secret: serverEnv.AUTH_SECRET,
  });
  if (typeof token?.appAccessToken !== "string") return null;
  return fetchDashboard(goAPIURL, token.appAccessToken).catch(() => null);
}
