import "server-only";

import { z } from "zod";

const memberSchema = z.object({
  id: z.number().int().positive(),
  discord_user_id: z.string().regex(/^\d+$/),
  username: z.string().min(1),
  display_name: z.string().min(1),
  character_name: z.string(),
});

const authResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("Bearer"),
  expires_at: z.iso.datetime(),
  member: memberSchema,
});

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type AppMember = z.infer<typeof memberSchema>;
export type BackendAuth = z.infer<typeof authResponseSchema>;

export class BackendAuthError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
    this.name = "BackendAuthError";
  }
}

export async function exchangeDiscordToken(
  baseURL: string,
  discordAccessToken: string,
  fetcher: typeof fetch = fetch,
): Promise<BackendAuth> {
  const endpoint = new URL("/api/v1/auth/discord", baseURL);
  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${discordAccessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new BackendAuthError("BACKEND_UNAVAILABLE", 503);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsedError = errorResponseSchema.safeParse(payload);
    throw new BackendAuthError(
      parsedError.success ? parsedError.data.error.code : "BACKEND_AUTH_FAILED",
      response.status,
    );
  }

  const parsed = authResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new BackendAuthError("INVALID_BACKEND_RESPONSE", 502);
  }
  return parsed.data;
}
