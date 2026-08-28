import { describe, expect, it } from "vitest";

import { SESSION_COOKIE_CEILING_SECONDS } from "@/config/session";

// The backend caps APP_JWT_TTL at 24h (internal/api/config.go). Login lifetime
// is meant to be controlled there alone, which only holds while this cookie
// outlives the app token: were the cookie shorter it would expire first, and
// changing the session length would need edits in both repos again.
const BACKEND_MAX_JWT_TTL_SECONDS = 24 * 60 * 60;

describe("session cookie ceiling", () => {
  it("is never shorter than the longest token the backend can issue", () => {
    expect(SESSION_COOKIE_CEILING_SECONDS).toBeGreaterThanOrEqual(BACKEND_MAX_JWT_TTL_SECONDS);
  });
});
