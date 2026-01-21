# Users Module

Backend user management module for admin operations on user accounts.

## Overview

The users module handles:
- Listing users with filtering and pagination
- Creating new user accounts
- Updating user information
- Activating/deactivating user accounts
- Resetting user passwords (admin action)

> **Note:** All endpoints in this module require ADMIN role.

## Functions

### `listUsers(params)`

Retrieves a paginated list of users with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params.page` | `number` | Yes | Page number (1-indexed) |
| `params.pageSize` | `number` | Yes | Items per page (max 100) |
| `params.status` | `'active' \| 'inactive'` | No | Filter by active status |
| `params.role` | `'EMPLOYEE' \| 'ADMIN'` | No | Filter by role |
| `params.query` | `string` | No | Search in name/email |

**Returns:** `Promise<ListUsersResponse>`

```typescript
interface ListUsersResponse {
  users: AdminUserDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Example:**
```typescript
const result = await usersService.listUsers({
  page: 1,
  pageSize: 20,
  status: 'active',
  role: 'EMPLOYEE',
  query: 'john',
});
```

---

### `getUserById(id)`

Retrieves a single user by their ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | User's UUID |

**Returns:** `Promise<AdminUserDto>`

```typescript
interface AdminUserDto {
  id: string;
  fullName: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN';
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Throws:**
- `NotFoundError` - User not found

---

### `createUser(data)`

Creates a new user account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data.email` | `string` | Yes | Unique email address |
| `data.password` | `string` | Yes | Initial password (8+ chars) |
| `data.fullName` | `string` | Yes | User's full name (2-100 chars) |
| `data.role` | `'EMPLOYEE' \| 'ADMIN'` | Yes | User role |

**Returns:** `Promise<AdminUserDto>`

**Example:**
```typescript
const user = await usersService.createUser({
  email: 'new@example.com',
  password: '[DEFAULT_SEED_PASSWORD]',
  fullName: 'New Employee',
  role: 'EMPLOYEE',
});
```

**Side Effects:**
- Password is hashed with bcrypt (12 rounds)
- `mustChangePassword` is set to `true`

**Throws:**
- `BadRequestError` - Email already exists

---

### `updateUser(id, data)`

Updates a user's information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | User's UUID |
| `data.fullName` | `string` | No | New full name |
| `data.email` | `string` | No | New email address |

**Returns:** `Promise<AdminUserDto>`

**Throws:**
- `NotFoundError` - User not found
- `BadRequestError` - Email already in use by another user

---

### `updateUserStatus(id, isActive)`

Activates or deactivates a user account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | User's UUID |
| `isActive` | `boolean` | Yes | New active status |

**Returns:** `Promise<AdminUserDto>`

**Example:**
```typescript
// Deactivate user
await usersService.updateUserStatus('user-uuid', false);

// Reactivate user
await usersService.updateUserStatus('user-uuid', true);
```

**Throws:**
- `NotFoundError` - User not found

**Side Effects:**
- Deactivated users cannot log in or refresh tokens

---

### `resetUserPassword(id, newPassword, requireChangeOnLogin?)`

Resets a user's password (admin action).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | User's UUID |
| `newPassword` | `string` | Yes | New password |
| `requireChangeOnLogin` | `boolean` | No | Force password change on next login (default: true) |

**Returns:** `Promise<void>`

**Example:**
```typescript
await usersService.resetUserPassword('user-uuid', '[DEFAULT_SEED_PASSWORD]', true);
```

**Throws:**
- `NotFoundError` - User not found

## API Endpoints

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/admin/users` | `listUsers` | List users with filtering |
| POST | `/admin/users` | `createUser` | Create new user |
| GET | `/admin/users/:id` | `getUser` | Get user by ID |
| PUT | `/admin/users/:id` | `updateUser` | Update user info |
| PUT | `/admin/users/:id/status` | `updateUserStatus` | Toggle active status |
| POST | `/admin/users/:id/reset-password` | `resetPassword` | Reset password |

## Validation Schemas

### `createUserSchema`

```typescript
{
  fullName: string (2-100 chars),
  email: string (valid email, lowercase),
  password: string (8+ chars, uppercase, lowercase, number),
  role: 'EMPLOYEE' | 'ADMIN'
}
```

### `updateUserSchema`

```typescript
{
  fullName?: string (2-100 chars),
  email?: string (valid email, lowercase)
}
```

### `updateUserStatusSchema`

```typescript
{
  isActive: boolean
}
```

### `resetPasswordSchema`

```typescript
{
  newPassword: string (8+ chars, uppercase, lowercase, number),
  requireChangeOnLogin?: boolean (default: true)
}
```

## Related Functions

- `usersRepo.findAllUsers()` - Database query with filters
- `usersRepo.findUserById()` - Get user by ID
- `usersRepo.findUserByEmail()` - Check email uniqueness
- `usersRepo.createUser()` - Insert new user
- `usersRepo.updateUser()` - Update user fields
- `usersRepo.updateUserStatus()` - Update isActive flag
- `usersRepo.resetUserPassword()` - Update password hash

## Edge Cases

1. **Self-Deactivation**: Admins can deactivate themselves (use caution)
2. **Email Uniqueness**: Emails are stored lowercase for comparison
3. **Password Reset**: Does NOT revoke existing tokens (use with deactivation for immediate lockout)
