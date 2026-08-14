import "server-only";

import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must contain at least 32 characters"),
    AUTH_URL: z.url().optional(),
    AUTH_DISCORD_ID: z.string().min(1).optional(),
    AUTH_DISCORD_SECRET: z.string().min(1).optional(),
    GO_API_URL: z.url().optional(),
  })
  .refine(
    ({ AUTH_DISCORD_ID, AUTH_DISCORD_SECRET }) =>
      Boolean(AUTH_DISCORD_ID) === Boolean(AUTH_DISCORD_SECRET),
    { message: "AUTH_DISCORD_ID and AUTH_DISCORD_SECRET must be configured together" },
  )
  .refine(
    ({ NODE_ENV, GO_API_URL }) => NODE_ENV !== "production" || Boolean(GO_API_URL),
    { message: "GO_API_URL is required in production" },
  );

export const serverEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
  AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
  GO_API_URL: process.env.GO_API_URL,
});

export const isDiscordAuthConfigured = Boolean(
  serverEnv.AUTH_DISCORD_ID && serverEnv.AUTH_DISCORD_SECRET,
);

export const goAPIURL = serverEnv.GO_API_URL ?? "http://127.0.0.1:8080";
