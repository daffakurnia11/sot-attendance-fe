import { describe, expect, it, vi } from "vitest";

import { BackendAuthError } from "@/services/auth";
import {
  classifyDiscordAuthFailure,
  logAuthJsError,
  logDiscordAuthFailure,
} from "@/services/auth/auth-observability.server";

describe("auth observability", () => {
  it("classifies unavailable backend separately from invalid credentials", () => {
    expect(classifyDiscordAuthFailure(new BackendAuthError("BACKEND_UNAVAILABLE", 503))).toEqual({
      code: "AUTH_SERVICE_UNAVAILABLE",
      internalCode: "BACKEND_UNAVAILABLE",
      status: 503,
    });
  });

  it("logs structured failure metadata without sensitive error messages", () => {
    const log = vi.fn();
    const failure = classifyDiscordAuthFailure(new BackendAuthError("BACKEND_UNAVAILABLE", 503));

    logDiscordAuthFailure({ failure, phase: "backend_exchange", reference: "ABC123" }, log);

    expect(JSON.parse(log.mock.calls[0][0])).toEqual({
      event: "discord_auth_failed",
      reference: "ABC123",
      phase: "backend_exchange",
      code: "BACKEND_UNAVAILABLE",
      status: 503,
    });
  });

  it("logs only safe Auth.js error type", () => {
    const log = vi.fn();
    const error = Object.assign(new Error("client secret must never appear"), { type: "OAuthCallbackError" });

    logAuthJsError(error, log);

    const output = log.mock.calls[0][0] as string;
    expect(JSON.parse(output)).toMatchObject({ event: "authjs_error", type: "OAuthCallbackError" });
    expect(output).not.toContain("client secret must never appear");
  });
});
