FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY . .

RUN pnpm install --no-frozen-lockfile

RUN cd packages/db && pnpm exec prisma generate

RUN pnpm --filter='./packages/*' build

RUN cd apps/web && pnpm exec next build

EXPOSE 3000

CMD ["sh", "-c", "cd apps/web && pnpm exec next start -p ${PORT:-3000}"]
