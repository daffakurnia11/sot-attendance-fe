FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
# corepack resolves the exact pnpm version from the packageManager field.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# This app has no NEXT_PUBLIC_* values, so nothing real is inlined into the
# client bundle and there is nothing to configure at build time. Both values
# below exist only to satisfy the zod schema in src/lib/env.server.ts, which
# runs during `next build` and requires GO_API_URL whenever NODE_ENV is
# production. The real AUTH_SECRET and GO_API_URL are injected at RUNTIME by
# compose from .env.production and must never be baked into an image layer.
RUN AUTH_SECRET=build-only-secret-at-least-32-characters-long \
    GO_API_URL=http://127.0.0.1:8080 \
    pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server.js"]
