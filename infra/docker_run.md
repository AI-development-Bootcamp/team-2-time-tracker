# Docker Development Environment

## First Time Setup

1. **Navigate to the infra directory:**
   ```bash
   cd infra
   ```

2. **Start the development environment:**
   ```bash
   docker compose -f compose.dev.yml up -d --build
   ```

   This will automatically:
   - ✅ Start PostgreSQL database
   - ✅ Wait for database to be ready
   - ✅ Push Prisma schema to database
   - ✅ Generate Prisma client
   - ✅ Seed database with development users:
     - **Admin:** admin@company.com | Password: Password1!
     - **Employee:** employee@company.com | Password: Password1!
   - ✅ Start server with hot-reload on port 3000

## Accessing the Application

- **Server:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api/docs
- **Database:** localhost:5432

## View Logs

```bash
docker compose -f compose.dev.yml logs -f server
```

Press `Ctrl+C` to stop viewing logs (server keeps running).

## Subsequent Runs

After first setup, you can start without `--build`:

```bash
docker compose -f compose.dev.yml up -d
```

Use `--build` only when:
- Dependencies change (package.json)
- Dockerfile changes
- Source code in shared types changes

## Stop the Environment

```bash
docker compose -f compose.dev.yml down
```

## Fresh Start (Reset Database)

To completely reset and start fresh:

```bash
docker compose -f compose.dev.yml down -v
docker compose -f compose.dev.yml up -d --build
```

The `-v` flag removes volumes (deletes database data).

## Common Commands

```bash
# Check status of containers
docker compose -f compose.dev.yml ps

# Restart only the server
docker compose -f compose.dev.yml restart server

# View server logs (last 50 lines)
docker compose -f compose.dev.yml logs --tail=50 server

# Execute command in server container
docker compose -f compose.dev.yml exec server sh

# Stop and remove everything including volumes
docker compose -f compose.dev.yml down -v --remove-orphans
```

## Troubleshooting

### Server won't start
```bash
docker compose -f compose.dev.yml logs server
```

### Database connection issues
```bash
docker compose -f compose.dev.yml logs postgres
```

### Rebuild from scratch
```bash
docker compose -f compose.dev.yml down -v --remove-orphans
docker compose -f compose.dev.yml build --no-cache
docker compose -f compose.dev.yml up -d
```