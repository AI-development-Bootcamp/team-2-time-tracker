# =============================================================================
# STAGE 1: deps - Install all dependencies with build tools
# =============================================================================
FROM node:20-alpine AS deps

# Install build tools for native modules (bcrypt) and OpenSSL for Prisma
RUN apk add --no-cache openssl python3 make g++ && \
    corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace config files (cached layer)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY server/package.json ./server/
COPY shared/types/package.json ./shared/types/

# Install all dependencies (skip postinstall scripts - prisma generate needs schema files)
RUN pnpm install --frozen-lockfile --ignore-scripts

# =============================================================================
# STAGE 2: builder - Generate Prisma client and build shared types
# =============================================================================
FROM deps AS builder

# Copy source code
COPY tsconfig.base.json ./
COPY shared/types/ ./shared/types/
COPY server/ ./server/

# Build shared types (server depends on it)
RUN pnpm --filter @shared/types build

# Generate Prisma client
RUN cd server && npx prisma generate

# =============================================================================
# STAGE 3: runner - Production image using tsx
# =============================================================================
FROM node:20-alpine AS runner

# Install only runtime dependencies
RUN apk add --no-cache openssl && \
    corepack enable && corepack prepare pnpm@9 --activate && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules (includes tsx and generated Prisma client)
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/server/node_modules ./server/node_modules

# Copy source code (tsx runs TypeScript directly)
COPY --from=builder --chown=appuser:nodejs /app/server/src ./server/src
COPY --from=builder --chown=appuser:nodejs /app/shared/types/src ./shared/types/src
COPY --from=builder --chown=appuser:nodejs /app/shared/types/dist ./shared/types/dist

# Copy Prisma files for runtime migrations
COPY --from=builder --chown=appuser:nodejs /app/server/prisma ./server/prisma
COPY --from=builder --chown=appuser:nodejs /app/server/prisma.config.ts ./server/prisma.config.ts

# Copy tsconfig files for tsx
COPY --from=builder --chown=appuser:nodejs /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder --chown=appuser:nodejs /app/server/tsconfig.json ./server/tsconfig.json

# Copy package files for module resolution
COPY --from=builder --chown=appuser:nodejs /app/server/package.json ./server/package.json
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json

WORKDIR /app/server

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run migrations, seed production user, then start server using tsx
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx src/db/seed-production.ts && npx tsx src/app.ts"]
