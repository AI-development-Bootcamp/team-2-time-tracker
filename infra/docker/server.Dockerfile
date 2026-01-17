FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY server/package.json ./server/
COPY shared/types/package.json ./shared/types/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/types/node_modules ./shared/types/node_modules
COPY . .
RUN pnpm --filter @shared/types build
RUN pnpm --filter server build

# Production
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/shared/types/dist ./shared/types/dist
COPY --from=builder /app/shared/types/package.json ./shared/types/
COPY --from=builder /app/server/prisma ./server/prisma

WORKDIR /app/server
RUN pnpm install --prod

EXPOSE 3000
CMD ["node", "dist/app.js"]
