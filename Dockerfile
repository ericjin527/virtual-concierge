FROM node:22-alpine AS base
RUN npm install -g pnpm@10.33.2

# ── Install all workspace deps ────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/widget/package.json ./apps/widget/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/scheduler/package.json ./packages/scheduler/package.json
COPY packages/agent/package.json ./packages/agent/package.json
COPY packages/integrations/package.json ./packages/integrations/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
RUN pnpm install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .
# Generate Prisma client
RUN cd packages/db && pnpm exec prisma generate
# Build the API
RUN cd apps/api && pnpm exec nest build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN npm install -g pnpm@10.33.2
WORKDIR /app

# Copy workspace manifests for production install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/widget/package.json ./apps/widget/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/scheduler/package.json ./packages/scheduler/package.json
COPY packages/agent/package.json ./packages/agent/package.json
COPY packages/integrations/package.json ./packages/integrations/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
RUN pnpm install --frozen-lockfile --prod

# Copy built output and source packages (needed for workspace: imports)
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.modules.yaml ./node_modules/.modules.yaml 2>/dev/null || true

# Copy source packages (used directly via workspace:* — no build step needed)
COPY packages/db/src ./packages/db/src
COPY packages/types/src ./packages/types/src
COPY packages/scheduler/src ./packages/scheduler/src
COPY packages/agent/src ./packages/agent/src
COPY packages/integrations/src ./packages/integrations/src

EXPOSE 3002
CMD ["node", "apps/api/dist/main"]
