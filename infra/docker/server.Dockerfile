FROM node:20-alpine AS base

ARG PNPM_VERSION=9.15.0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

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
RUN pnpm --filter @shared/types build && pnpm --filter server build

# Production
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=nodejs:nodejs /app/server/package.json ./server/
COPY --from=builder --chown=nodejs:nodejs /app/shared/types/dist ./shared/types/dist
COPY --from=builder --chown=nodejs:nodejs /app/shared/types/package.json ./shared/types/

WORKDIR /app/server
COPY --from=builder --chown=nodejs:nodejs /app/server/prisma ./prisma
RUN pnpm install --prod

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/app.js"]
