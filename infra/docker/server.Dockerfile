# Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy all package files for workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY server/package.json ./server/
COPY shared/types/package.json ./shared/types/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build shared types and server
RUN pnpm --filter @shared/types build

# Use ARG for build-time only - prisma generate only needs schema, not a real DB
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN cd server && npx prisma generate
RUN pnpm --filter server build

# Production stage
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts and node_modules from builder (includes generated prisma client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/shared/types/dist ./shared/types/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/prisma.config.ts ./server/prisma.config.ts
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/server

EXPOSE 3000

# Run migrations and start server
# DATABASE_URL will come from runtime environment (Render sets this)
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx dist/app.js"]
