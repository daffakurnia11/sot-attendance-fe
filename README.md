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
- `AUTH_URL` (`http://localhost:3000` locally; public HTTPS origin in production)
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `GO_API_URL` (server-only Go API origin; `http://127.0.0.1:8080` locally)

Generate `AUTH_SECRET` with `pnpm exec auth secret`.

Discord OAuth exchange happens inside Auth.js server callback. Auth.js forwards Discord access token to `GO_API_URL`, receives app JWT, stores it only inside encrypted HTTP-only Auth.js JWT, and exposes member metadata to session. Browser never receives Go API URL, Discord access token, or app JWT.

## Checks

```sh
pnpm lint
pnpm test
```
