# Auth Module

Backend authentication module providing user authentication, token management, and password operations.

## Overview

The auth module handles:
- User login with email/password
- JWT access token generation and verification
- Refresh token management with database persistence
- Password hashing and verification
- Password change functionality
- User logout and token revocation

## Functions

### `login(email, password, rememberMe?)`

Authenticates a user with email and password.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | User's email address |
| `password` | `string` | Yes | User's password |
| `rememberMe` | `boolean` | No | Extends refresh token expiry to 30 days (default: 7 days) |

**Returns:** `Promise<LoginResponse>`

```typescript
interface LoginResponse {
  token: string;           // JWT access token
  refreshToken: string;    // Refresh token for token renewal
  expiresIn: number;       // Token expiry in seconds
  user: {
    id: string;
    fullName: string;
    email: string;
    role: 'EMPLOYEE' | 'ADMIN';
  };
  mustChangePassword: boolean;
}
```

**Example:**
```typescript
const result = await authService.login('user@example.com', 'Password123!', true);
console.log(result.token);  // JWT token
```

**Throws:**
- `UnauthorizedError` - Invalid credentials or inactive account

---

### `refreshAccessToken(refreshToken)`

Generates a new access token using a valid refresh token.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refreshToken` | `string` | Yes | Valid refresh token from login |

**Returns:** `Promise<{ token: string; expiresIn: number }>`

**Example:**
```typescript
const { token } = await authService.refreshAccessToken('dGhpcyBpcyBhIHJlZnJlc2g...');
```

**Throws:**
- `UnauthorizedError` - Invalid/expired refresh token or inactive user

---

### `changePassword(userId, currentPassword, newPassword)`

Changes a user's password and revokes all their refresh tokens.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | `string` | Yes | User's UUID |
| `currentPassword` | `string` | Yes | Current password for verification |
| `newPassword` | `string` | Yes | New password (min 8 chars, uppercase, lowercase, number) |

**Returns:** `Promise<void>`

**Example:**
```typescript
await authService.changePassword('user-uuid', 'OldPass123!', 'NewPass456!');
```

**Throws:**
- `UnauthorizedError` - User not found
- `BadRequestError` - Current password is incorrect

**Side Effects:**
- All refresh tokens for the user are revoked (forces re-login on all devices)

---

### `logout(refreshToken)`

Logs out a user by revoking their refresh token.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refreshToken` | `string` | Yes | Refresh token to revoke |

**Returns:** `Promise<void>`

**Example:**
```typescript
await authService.logout('dGhpcyBpcyBhIHJlZnJlc2g...');
```

---

### `getCurrentUser(userId)`

Retrieves the current user's profile.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | `string` | Yes | User's UUID |

**Returns:** `Promise<UserProfile>`

```typescript
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN';
  isActive: boolean;
}
```

**Throws:**
- `UnauthorizedError` - User not found

---

### `verifyAccessToken(token)`

Verifies a JWT access token and returns the payload.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | `string` | Yes | JWT access token |

**Returns:** `TokenPayload`

```typescript
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}
```

**Throws:**
- `UnauthorizedError` - Invalid or expired token

---

### `hashPassword(password)`

Hashes a password using bcrypt with 12 rounds.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `password` | `string` | Yes | Plain text password |

**Returns:** `Promise<string>` - Hashed password

**Example:**
```typescript
const hash = await authService.hashPassword('Password123!');
```

## Middleware

### `authenticate`

Express middleware that validates JWT tokens from the Authorization header.

**Usage:**
```typescript
router.get('/protected', authenticate, controller.handler);
```

**Behavior:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature and expiry
3. Loads user from database to verify active status
4. Attaches user to `req.user`

**Throws:**
- `UnauthorizedError` - Missing/invalid token or inactive user

---

### `requireRole(roles)`

Middleware factory for role-based access control.

| Parameter | Type | Description |
|-----------|------|-------------|
| `roles` | `string[]` | Allowed roles |

**Usage:**
```typescript
router.get('/admin-only', authenticate, requireRole(['ADMIN']), handler);
```

---

### `requireAdmin`

Pre-configured middleware that requires ADMIN role.

**Usage:**
```typescript
router.get('/admin-only', authenticate, requireAdmin, handler);
```

## Related Functions

- `authRepo.findUserByEmail()` - Database lookup by email
- `authRepo.findUserById()` - Database lookup by ID
- `authRepo.createRefreshToken()` - Store refresh token
- `authRepo.revokeRefreshToken()` - Revoke single token
- `authRepo.revokeAllUserRefreshTokens()` - Revoke all user tokens

## Edge Cases

1. **Inactive User Login**: Returns `UnauthorizedError` with "Account is deactivated"
2. **Expired Refresh Token**: Database query filters by `expiresAt` and `revokedAt`
3. **Password Change**: All devices are logged out (refresh tokens revoked)
4. **Token Refresh with Inactive User**: Checks user status before issuing new token
