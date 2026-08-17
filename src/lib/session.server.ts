import "server-only";

import { getToken } from "next-auth/jwt";

import { auth } from "@/auth";

import { serverEnv, useSecureCookies } from "./env.server";

/**
 * Reads the Go API access token out of the Auth.js session cookie.
 *
 * Single entry point on purpose: getToken needs `secureCookie` to pick the
 * right cookie name and decryption salt, and omitting it fails by returning
 * null rather than by throwing. Spread across call sites that turns into a
 * whole app of empty pages with no error anywhere.
 */
export async function getAppAccessToken(request: Request): Promise<string | null> {
  const token = await getToken({
    req: request,
    secret: serverEnv.AUTH_SECRET,
    secureCookie: useSecureCookies,
  });
  return typeof token?.appAccessToken === "string" ? token.appAccessToken : null;
}

/** Builds the request getToken needs from server-component headers. */
export function requestFromHeaders(requestHeaders: Headers, path: string): Request {
  return new Request(new URL(path, "http://localhost"), { headers: requestHeaders });
}

/**
 * Whether the signed-in member holds the administrator role.
 *
 * Read from the session, so it can lag a role change by up to the token
 * lifetime. That is a display concern only: the Go API re-checks the database
 * on every roster-wide request, so a demoted admin sees the page but no data.
 */
export async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  return session?.user?.member?.is_admin === true;
}
