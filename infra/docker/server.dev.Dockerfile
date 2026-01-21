FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace and package files first for better caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY server/package.json ./server/
COPY shared/types/package.json ./shared/types/

# Copy Prisma schema before install (needed for postinstall script)
COPY server/prisma ./server/prisma

# Install ALL dependencies (including dev) - CI=true prevents TTY issues
RUN CI=true pnpm install --frozen-lockfile

# Now copy the rest of the source code
COPY server ./server
COPY shared ./shared
COPY infra ./infra

# Build shared types
RUN pnpm --filter @shared/types build

# Make entrypoint script executable
RUN chmod +x /app/infra/docker/dev-entrypoint.sh

WORKDIR /app/server

EXPOSE 3000

ENTRYPOINT ["/app/infra/docker/dev-entrypoint.sh"]
CMD ["pnpm", "dev"]
