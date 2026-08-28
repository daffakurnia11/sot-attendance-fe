/**
 * Longest the Auth.js session cookie may live.
 *
 * This is a ceiling, not the login lifetime. `APP_JWT_TTL` on the backend is
 * the single control: the jwt callback in `auth.ts` clears the session as soon
 * as the app token's `expires_at` passes, and the Go API rejects the token
 * itself. The backend caps that TTL at 24h, so matching the cap here guarantees
 * the cookie is never the shorter of the two — which is what previously forced
 * session length to be changed in two repositories at once.
 */
export const SESSION_COOKIE_CEILING_SECONDS = 86_400;
