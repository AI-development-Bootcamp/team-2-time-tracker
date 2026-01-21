# Build stage
FROM node:20-alpine AS builder
# Install openssl for Prisma
RUN apk add --no-cache openssl && \
    corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# 1. Copy workspace and package files (for caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY server/package.json ./server/
COPY shared/types/package.json ./shared/types/

# 2. FIX: Copy the prisma schema BEFORE install 
# This prevents the ELIFECYCLE error during pnpm install
COPY server/prisma ./server/prisma

# 3. Install all dependencies
RUN pnpm install --frozen-lockfile

# 4. Copy the rest of the source code
COPY . .

# 5. Build shared types and the server
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm --filter @shared/types build && \
    cd server && npx prisma generate && \
    cd .. && pnpm --filter server build

# --- Production stage ---
FROM node:20-alpine AS runner
# Install openssl (required for Prisma runtime)
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts and necessary node_modules from builder
# Note: We copy the root node_modules as well for workspace support
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/shared/types/dist ./shared/types/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/package.json ./package.json

# If you use a custom prisma config, uncomment this:
# COPY --from=builder /app/server/prisma.config.ts ./server/prisma.config.ts

WORKDIR /app/server

EXPOSE 3000

# Run migrations and start the app
# Using sh -c allows us to chain the migration and start commands
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
