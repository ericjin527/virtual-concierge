FROM node:22-alpine

# Install pnpm — must match packageManager field
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

# Copy everything (node_modules excluded via .dockerignore)
COPY . .

# Install all deps
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client
RUN cd packages/db && pnpm exec prisma generate

# Build NestJS API
RUN cd apps/api && pnpm exec nest build

EXPOSE 3002

CMD ["node", "apps/api/dist/main"]
