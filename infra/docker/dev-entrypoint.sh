#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
# Wait for database to be ready
until echo "SELECT 1" | pnpm exec prisma db execute --stdin > /dev/null 2>&1; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Pushing Prisma schema to database..."
pnpm exec prisma db push --accept-data-loss

echo "🔧 Generating Prisma client..."
pnpm exec prisma generate

echo "🌱 Running database seed..."
pnpm db:seed

echo "🚀 Starting server..."
exec "$@"
