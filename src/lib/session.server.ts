import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

import { auth } from "@/auth";

import { goAPIURL, serverEnv, useSecureCookies } from "./env.server";

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

/**
 * Runs a server-side API read on behalf of the signed-in member.
 *
 * Every server component loads the same way: take the token out of the
 * incoming headers, bail out to null when there is none, and swallow upstream
 * failures so a page renders its empty state instead of a 500. `path` is only
 * the cookie-scoping URL getToken needs, not the API route.
 */
export async function loadForMember<T>(
  path: string,
  read: (apiURL: string, accessToken: string) => Promise<T>,
): Promise<T | null> {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), path));
  if (!accessToken) return null;
  return read(goAPIURL, accessToken).catch(() => null);
}

/**
 * Wraps a route handler with the gate every authenticated route repeats:
 * reject a missing app token with 401, optionally reject a non-admin with 403,
 * and turn an unexpected upstream failure into a 502 the client can retry.
 *
 * Validation failures stay inside the handler — return the 400/422 response
 * rather than throwing, so it is reported as-is instead of as a 502.
 */
export function memberRoute(
  unavailable: string,
  handle: (accessToken: string, request: Request) => Promise<Response>,
  options: { admin?: boolean } = {},
) {
  return async function route(request: Request): Promise<Response> {
    const accessToken = await getAppAccessToken(request);
    if (!accessToken) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (options.admin && !(await isAdminSession())) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      return await handle(accessToken, request);
    } catch {
      return Response.json({ error: unavailable }, { status: 502 });
    }
  };
}
