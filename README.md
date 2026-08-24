# SOT Attendance Frontend

Dark Next.js member interface for SOT attendance. Authentication uses Discord only through Auth.js.

## Architecture

The source follows the Dafkur frontend boundaries:

- `src/app`: thin App Router routes, layouts, API handlers, and route-owned actions
- `src/components`: atoms, organisms, templates, and providers
- `src/config`: application routes and stable configuration
- `src/data`: JSON-first interface copy
- `src/lib`: framework-neutral helpers and server-only environment validation
- `src/services`: external API clients; browser components never call Go directly
- `src/styles`: shared design tokens
- `src/tests`: tests mirroring the source domains

Dependencies flow from routes to templates, organisms, and atoms. Server secrets stay in `env.server.ts`; interactive Ant Design components stay behind client boundaries.

## Local setup

```sh
cp .env.example .env.local
pnpm dev
```

Create a Discord OAuth application and set its redirect URL to:

```text
http://localhost:3000/api/auth/callback/discord
```

Required environment variables:

- `AUTH_SECRET`
- `AUTH_SESSION_MAX_AGE_SECONDS` (optional; defaults to 900; keep equal to backend `APP_JWT_TTL`)
- `AUTH_URL` (`http://localhost:3000` locally; public HTTPS origin in production)
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `GO_API_URL` (server-only Go API origin; `http://127.0.0.1:8080` locally)

Login lifetime is adjustable without rebuilding. Set frontend
`AUTH_SESSION_MAX_AGE_SECONDS` and backend `APP_JWT_TTL` to equivalent values
(for example `3600` and `1h`). Effective lifetime is whichever expires first.

Generate `AUTH_SECRET` with `pnpm exec auth secret`.

Discord OAuth exchange happens inside Auth.js server callback. Auth.js forwards Discord access token to `GO_API_URL`, receives app JWT, stores it only inside encrypted HTTP-only Auth.js JWT, and exposes member metadata to session. Browser never receives Go API URL, Discord access token, or app JWT.

## Authentication troubleshooting

Failed Discord sign-ins write one-line JSON to frontend server logs. Match UI
reference with `reference` field in log:

```json
{
  "event": "discord_auth_failed",
  "reference": "A1B2C3D4E5",
  "phase": "backend_exchange",
  "code": "BACKEND_UNAVAILABLE",
  "status": 503
}
```

Logs contain only safe phase, code, status, and reference metadata. Discord
tokens, application secrets, usernames, raw provider payloads, and backend error
messages are never logged.

`BACKEND_UNAVAILABLE` means Discord OAuth completed but frontend could not reach
Go token-exchange API. Check API and database dependency separately:

```sh
curl -i http://127.0.0.1:8080/healthz
cd ../sot-attendance-go && make local-logs
```

Auth.js provider failures such as callback or OAuth configuration errors use
`{"event":"authjs_error", ...}`. Their safe `type` identifies failure class
without printing provider response or credentials.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI runs all four on every pull request. `pnpm build` is part of the gate because a change can pass lint and type-check and still fail to compile.

## Deployment

`.github/workflows/ci.yml` builds a standalone image on every push to `main`, publishes it to `ghcr.io/<owner>/<repo>`, and deploys it over SSH.

The image ships no `NEXT_PUBLIC_*` values, so nothing is inlined at build time. `AUTH_SECRET`, the Discord credentials, and `GO_API_URL` are injected at runtime from `.env.production` on the host and never appear in an image layer.

### Droplet prerequisites

Copy `compose.production.yaml` into the deploy directory and create `.env.production` alongside it from `.env.production.example`. The deploy job refuses to restart anything when that file is missing or when `AUTH_SECRET` or `GO_API_URL` is blank.

### Repository configuration

Create a `production` environment and set these secrets:

| Secret               | Purpose                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `DO_HOST`            | Droplet hostname or IP                                                   |
| `DO_USER`            | SSH user                                                                 |
| `DO_SSH_PRIVATE_KEY` | SSH private key for that user                                            |
| `DO_APP_DIR`         | Deploy directory holding `compose.production.yaml` and `.env.production` |
| `GHCR_USERNAME`      | GHCR account used by the droplet to pull                                 |
| `GHCR_TOKEN`         | Personal access token with `read:packages`                               |

Pushing to GHCR uses the built-in `GITHUB_TOKEN`; `GHCR_USERNAME` and `GHCR_TOKEN` are only for the pull side on the droplet.

The deploy pins the exact image digest, writes it to `FRONTEND_IMAGE` in `.env` on the droplet, and then blocks on the container `HEALTHCHECK` (`/api/health`). A crash-looping image fails the deploy instead of reporting success. Roll back by pointing `FRONTEND_IMAGE` at a previous digest and running `docker compose -f compose.production.yaml up -d`.
