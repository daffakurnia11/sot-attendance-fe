import "server-only";

import { randomUUID } from "node:crypto";

import { BackendAuthError } from "./auth-api";

export type SafeAuthErrorCode = "AUTHENTICATION_FAILED" | "AUTH_SERVICE_UNAVAILABLE" | "MEMBER_NOT_REGISTERED";

type AuthFailure = Readonly<{
  code: SafeAuthErrorCode;
  internalCode: string;
  status?: number;
}>;

type AuthLog = (message: string) => void;

export function createAuthFailureReference() {
  return randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
}

export function classifyDiscordAuthFailure(error: unknown): AuthFailure {
  if (!(error instanceof BackendAuthError)) {
    return { code: "AUTHENTICATION_FAILED", internalCode: "UNEXPECTED_AUTH_ERROR" };
  }

  if (error.code === "MEMBER_NOT_REGISTERED") {
    return { code: "MEMBER_NOT_REGISTERED", internalCode: error.code, status: error.status };
  }

  if (error.code === "BACKEND_UNAVAILABLE") {
    return { code: "AUTH_SERVICE_UNAVAILABLE", internalCode: error.code, status: error.status };
  }

  return { code: "AUTHENTICATION_FAILED", internalCode: error.code, status: error.status };
}

export function logDiscordAuthFailure(
  input: Readonly<{
    failure: AuthFailure;
    phase: "backend_exchange" | "identity_verification" | "missing_access_token";
    reference: string;
  }>,
  log: AuthLog = console.error,
) {
  log(
    JSON.stringify({
      event: "discord_auth_failed",
      reference: input.reference,
      phase: input.phase,
      code: input.failure.internalCode,
      status: input.failure.status,
    }),
  );
}

export function logAuthJsError(error: Error, log: AuthLog = console.error) {
  const typedError = error as Error & { type?: unknown };
  log(
    JSON.stringify({
      event: "authjs_error",
      reference: createAuthFailureReference(),
      type: typeof typedError.type === "string" ? typedError.type : error.name,
    }),
  );
}
