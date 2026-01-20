# Build stage
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY shared/types/package.json ./shared/types/
COPY client/packages/utils/package.json ./client/packages/utils/
COPY client/packages/ui/package.json ./client/packages/ui/
COPY client/packages/api-client/package.json ./client/packages/api-client/
COPY client/apps/employee/package.json ./client/apps/employee/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build-time argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build all dependencies in order
RUN pnpm --filter @shared/types build
RUN pnpm --filter @client/utils build
RUN pnpm --filter @client/ui build
RUN pnpm --filter @client/api-client build
RUN pnpm --filter @client/employee build

# Production - serve with nginx
FROM nginx:alpine
COPY --from=builder /app/client/apps/employee/dist /usr/share/nginx/html
COPY infra/nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
