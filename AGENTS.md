<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SOT frontend architecture

- Framework: Next.js App Router, React, TypeScript, Tailwind CSS, Ant Design, Auth.js.
- `src/app` is routing and orchestration only. Keep pages thin.
- Components flow `templates -> organisms -> atoms`; lower layers never import higher layers.
- Put client boundaries only around interactive Ant Design components and providers.
- Keep environment secrets in `src/lib/*.server.ts`. Never expose them through `NEXT_PUBLIC_*`.
- Keep stable routes in `src/config`, interface copy in `src/data`, and shared helpers in `src/lib`.
- Keep Go API access in server-only services. Never expose `GO_API_URL`, Discord OAuth tokens, or app JWTs to browser session data.
- Use kebab-case file and folder names. Every component module has an `index.ts` barrel.
- Tests live in `src/tests` and mirror the source domain.
- Before handoff, run `pnpm lint`, `pnpm test`, and `git diff --check`.
- Do not change the Discord-only authentication contract without explicit authorization.
