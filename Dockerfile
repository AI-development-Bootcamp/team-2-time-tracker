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
# STAGE 2: builder - Compile TypeScript and generate Prisma client
# =============================================================================
FROM deps AS builder

# Copy source code
COPY tsconfig.base.json ./
COPY shared/types/ ./shared/types/
COPY server/ ./server/

# Build shared types first (server depends on it)
RUN pnpm --filter @shared/types build

# Generate Prisma client (uses fallback URL in prisma.config.ts)
RUN cd server && npx prisma generate

# Build server TypeScript
RUN pnpm --filter server build

# =============================================================================
# STAGE 3: runner - Minimal production image
# =============================================================================
FROM node:20-alpine AS runner

# Install only runtime dependencies
RUN apk add --no-cache openssl && \
    corepack enable && corepack prepare pnpm@9 --activate && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules (includes generated Prisma client)
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/server/node_modules ./server/node_modules

# Copy compiled code
COPY --from=builder --chown=appuser:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=appuser:nodejs /app/shared/types/dist ./shared/types/dist

# Copy Prisma files for runtime migrations
COPY --from=builder --chown=appuser:nodejs /app/server/prisma ./server/prisma
COPY --from=builder --chown=appuser:nodejs /app/server/prisma.config.ts ./server/prisma.config.ts

# Copy package files for module resolution
COPY --from=builder --chown=appuser:nodejs /app/server/package.json ./server/package.json
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json

WORKDIR /app/server

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
