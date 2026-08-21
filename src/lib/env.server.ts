import "server-only";

import { z } from "zod";

import { resolveSecureCookies } from "./utils";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must contain at least 32 characters"),
    AUTH_SESSION_MAX_AGE_SECONDS: z.coerce.number().int().min(60).max(86_400).default(900),
    AUTH_URL: z.url().optional(),
    AUTH_DISCORD_ID: z.string().min(1).optional(),
    AUTH_DISCORD_SECRET: z.string().min(1).optional(),
    GO_API_URL: z.url().optional(),
  })
  .refine(({ AUTH_DISCORD_ID, AUTH_DISCORD_SECRET }) => Boolean(AUTH_DISCORD_ID) === Boolean(AUTH_DISCORD_SECRET), {
    message: "AUTH_DISCORD_ID and AUTH_DISCORD_SECRET must be configured together",
  })
  .refine(({ NODE_ENV, GO_API_URL }) => NODE_ENV !== "production" || Boolean(GO_API_URL), {
    message: "GO_API_URL is required in production",
  });

export const serverEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_SESSION_MAX_AGE_SECONDS: process.env.AUTH_SESSION_MAX_AGE_SECONDS,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
  AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
  GO_API_URL: process.env.GO_API_URL,
});

export const isDiscordAuthConfigured = Boolean(serverEnv.AUTH_DISCORD_ID && serverEnv.AUTH_DISCORD_SECRET);

export const goAPIURL = serverEnv.GO_API_URL ?? "http://127.0.0.1:8080";

// Auth.js prefixes its session cookie with `__Secure-` when the origin is
// HTTPS. getToken defaults to the unprefixed name and derives its decryption
// salt from that name, so it silently returns null on an HTTPS deployment
// unless told which scheme is in use. Mirrors the rule Auth.js applies when it
// writes the cookie.
export const useSecureCookies = resolveSecureCookies(serverEnv.AUTH_URL, serverEnv.NODE_ENV);
