FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY . .

RUN pnpm install --no-frozen-lockfile

# Generate Prisma client (needed by @repo/db which packages import)
RUN cd packages/db && pnpm exec prisma generate

# Build workspace packages
RUN pnpm --filter='./packages/*' build

# Build widget
RUN cd apps/widget && pnpm exec next build

EXPOSE 3001

CMD ["sh", "-c", "cd apps/widget && pnpm start"]
