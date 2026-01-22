# Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl && \
    corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# 1. Copy ONLY the workspace configuration and package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY server/package.json ./server/
COPY shared/types/package.json ./shared/types/

# 2. THE FIX: Install dependencies while ignoring scripts.
# This stops the 'postinstall' error because Prisma won't try to run 'generate' yet.
RUN pnpm install --frozen-lockfile --ignore-scripts

# 3. NOW copy everything else (including your schema and source code)
COPY . .

# 4. Manually run the generation and builds now that all files are present
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN cd server && npx prisma generate && \
    cd .. && pnpm --filter @shared/types build && \
    pnpm --filter server build

# --- Production stage ---
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary artifacts from builder
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

# Start command - resolve failed migration as applied, then deploy and start app
# Using tsx instead of node to handle ESM module resolution
# Note: Seeding is handled automatically by app startup based on NODE_ENV
CMD ["sh", "-c", "npx prisma migrate resolve --applied 20260121105119_init 2>/dev/null || true && npx prisma migrate deploy && pnpm db:seed:prod && npx tsx dist/server/src/app.js"]