import { type ClassValue,clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Whether Auth.js writes its session cookie under the `__Secure-` prefix.
 *
 * Mirrors the rule Auth.js applies when setting the cookie: secure on an HTTPS
 * origin. getToken must be told the same, or it looks for the unprefixed
 * cookie, derives the wrong decryption salt, and returns null instead of
 * failing loudly.
 */
export function resolveSecureCookies(authURL: string | undefined, nodeEnv: string) {
  return authURL ? authURL.startsWith("https://") : nodeEnv === "production";
}
