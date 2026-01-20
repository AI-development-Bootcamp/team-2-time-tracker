# Time Tracker

A simple and efficient solution for reporting work hours. Employees can log hours easily and accurately, while managers gain clear visibility. Designed to improve accuracy, organization, and transparency in time reporting.

## Project Structure

```
team-2-time-tracker/
├── server/              # Backend API (Express + Prisma)
├── client/              # Frontend applications
│   ├── apps/
│   │   ├── Admin/       # Admin dashboard
│   │   └── employee/    # Employee portal
│   └── packages/
│       ├── ui/          # Shared UI components
│       ├── api-client/  # API client library
│       └── utils/       # Shared utilities
└── shared/
    └── types/           # Shared TypeScript types
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL (or your preferred database)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd team-2-time-tracker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the `server` directory:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/timetracker
JWT_SECRET=your-very-secure-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=2h
CORS_ORIGIN=http://localhost:5173

# IDrive e2 Storage (Optional - for file uploads)
# If not configured, file upload feature will be disabled
IDRIVE_ACCESS_KEY=your_access_key
IDRIVE_SECRET_KEY=your_secret_key
IDRIVE_BUCKET=your_bucket_name
IDRIVE_ENDPOINT=https://endpoint.idrivee2.com
IDRIVE_REGION=us-east-1
```

**Note:** File upload functionality (for absence documents) requires IDrive e2 storage configuration. If these environment variables are not set, users will receive an error message when attempting to upload files, but they can still create absence requests without attachments.

### 4. Set up the database

```bash
cd server
pnpm prisma migrate dev --name init
pnpm prisma generate
```

### 5. Seed the database (optional)

```bash
pnpm prisma db seed
```

### 6. Start development servers

**Backend:**
```bash
cd server
pnpm dev
```

**Frontend (Admin):**
```bash
cd client/apps/Admin
pnpm dev
```

**Frontend (Employee):**
```bash
cd client/apps/employee
pnpm dev
```

Or run all from root:
```bash
pnpm dev
```

## API Documentation

Once the server is running, access the Swagger documentation at:
- http://localhost:3000/api/docs

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Authenticate user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Admin User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Admin |
| POST | `/api/admin/users` | Create new user | Admin |
| GET | `/api/admin/users/:id` | Get user by ID | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| PUT | `/api/admin/users/:id/status` | Enable/disable user | Admin |
| POST | `/api/admin/users/:id/reset-password` | Reset user password | Admin |

## Scripts

### Server

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` - Run ESLint

### Client

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint

## Tech Stack

### Backend
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt password hashing
- Zod validation
- Winston logging

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Zustand (state management)
- TanStack Query
- Radix UI (components)
- react-hook-form + Zod

## Testing

### Backend Tests
```bash
cd server
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage report
```

### Frontend Tests
```bash
cd client/apps/employee
pnpm test
```

## Project Architecture

### Backend

The backend follows a layered architecture:

```
src/
├── config/           # Configuration (env, jwt, swagger)
├── middlewares/      # Express middlewares
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   └── users/        # User management module
├── shared/           # Shared utilities (errors, logger)
└── app.ts           # Application entry point
```

Each module contains:
- `*.routes.ts` - Route definitions
- `*.controller.ts` - Request handlers
- `*.service.ts` - Business logic
- `*.repo.ts` - Database operations
- `*.schemas.ts` - Validation schemas

### Frontend

The frontend uses a monorepo structure with shared packages:

- `@client/ui` - Reusable UI components
- `@client/api-client` - API client and hooks
- `@client/utils` - Shared utilities

## License

MIT
