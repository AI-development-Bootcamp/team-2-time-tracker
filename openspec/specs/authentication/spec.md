# authentication Specification

## Purpose
TBD - created by archiving change add-dev1-setup-auth. Update Purpose after archive.
## Requirements
### Requirement: User Login
The system SHALL authenticate users with email and password, returning a JWT access token and refresh token upon successful authentication.

#### Scenario: Successful login
- **WHEN** user submits valid email and password to `POST /auth/login`
- **THEN** response contains `token`, `refreshToken`, `expiresIn: 7200`, and `user` object with status 200

#### Scenario: Invalid credentials
- **WHEN** user submits incorrect email or password
- **THEN** response is `{ "success": false, "error": { "code": "AUTH_001", "message": "Invalid credentials" } }` with status 401

#### Scenario: Inactive user login attempt
- **WHEN** user with `isActive: false` attempts to login
- **THEN** response is `{ "success": false, "error": { "code": "AUTH_001", "message": "Invalid credentials" } }` with status 401

#### Scenario: Remember me extends session
- **WHEN** user logs in with `rememberMe: true`
- **THEN** refresh token validity extends to 30 days instead of default

### Requirement: Token Refresh
The system SHALL allow refreshing an expired access token using a valid refresh token.

#### Scenario: Successful token refresh
- **WHEN** valid refresh token is submitted to `POST /auth/refresh`
- **THEN** response contains new `token` and `expiresIn` with status 200

#### Scenario: Invalid refresh token
- **WHEN** invalid or expired refresh token is submitted
- **THEN** response is `{ "success": false, "error": { "code": "AUTH_002", "message": "Token expired" } }` with status 401

#### Scenario: Blacklisted refresh token
- **WHEN** a previously invalidated refresh token is submitted
- **THEN** response is `{ "success": false, "error": { "code": "AUTH_002", "message": "Token expired" } }` with status 401

### Requirement: Password Change
The system SHALL allow authenticated users to change their password by providing current and new password.

#### Scenario: Successful password change
- **WHEN** user submits correct current password and valid new password to `POST /auth/change-password`
- **THEN** password is updated and response is `{ "success": true }` with status 200

#### Scenario: Incorrect current password
- **WHEN** user submits incorrect current password
- **THEN** response is `{ "success": false, "error": { "code": "AUTH_001", "message": "Invalid credentials" } }` with status 401

#### Scenario: Weak new password
- **WHEN** new password does not meet complexity requirements (8+ chars, upper, lower, number, special)
- **THEN** response is validation error with status 400

#### Scenario: Passwords do not match
- **WHEN** `newPassword` and `confirmPassword` do not match
- **THEN** response is validation error with status 400

### Requirement: Mandatory Password Change
The system SHALL require users with `mustChangePassword: true` to change their password before accessing other features.

#### Scenario: First login redirect
- **WHEN** user logs in and `mustChangePassword` is true in response
- **THEN** frontend redirects to change password page

#### Scenario: Flag cleared after change
- **WHEN** user successfully changes password
- **THEN** `mustChangePassword` is set to false in database

### Requirement: Current User Profile
The system SHALL return the authenticated user's profile information.

#### Scenario: Get current user
- **WHEN** authenticated user requests `GET /auth/me`
- **THEN** response contains `id`, `fullName`, `email`, `role`, `isActive` with status 200

#### Scenario: Unauthenticated request
- **WHEN** request to `GET /auth/me` has no valid token
- **THEN** response is `{ "success": false, "error": { "code": "AUTH_002", "message": "Token expired" } }` with status 401

### Requirement: User Logout
The system SHALL invalidate the refresh token on logout, preventing further token refreshes.

#### Scenario: Successful logout
- **WHEN** user submits refresh token to `POST /auth/logout`
- **THEN** token is blacklisted and response is `{ "success": true }` with status 200

#### Scenario: Subsequent refresh fails
- **WHEN** user attempts to refresh after logout
- **THEN** refresh fails with AUTH_002 error

### Requirement: JWT Access Token
The system SHALL issue JWT access tokens with 2-hour (7200 seconds) expiry containing user ID, email, and role claims.

#### Scenario: Token contains claims
- **WHEN** JWT is decoded
- **THEN** payload contains `sub` (user ID), `email`, `role`, `iat`, `exp`

#### Scenario: Token expires
- **WHEN** token is older than 2 hours
- **THEN** API requests with this token return AUTH_002 error

### Requirement: Role-Based Access Control
The system SHALL restrict endpoints based on user role (EMPLOYEE or ADMIN).

#### Scenario: Employee accessing admin endpoint
- **WHEN** employee requests an admin-only endpoint
- **THEN** response is `{ "success": false, "error": { "code": "AUTH_003", "message": "Insufficient permissions" } }` with status 403

#### Scenario: Admin accessing admin endpoint
- **WHEN** admin requests an admin-only endpoint
- **THEN** request proceeds normally

### Requirement: Rate Limiting on Auth Endpoints
The system SHALL rate limit authentication endpoints to prevent brute force attacks.

#### Scenario: Rate limit exceeded
- **WHEN** more than 100 login attempts in 15 minutes from same IP
- **THEN** subsequent requests return status 429 (Too Many Requests)

### Requirement: Password Security
The system SHALL hash passwords using bcrypt with a minimum of 12 rounds and never store or log plain-text passwords.

#### Scenario: Password stored securely
- **WHEN** user is created with password
- **THEN** database contains bcrypt hash, not plain text

#### Scenario: Password not logged
- **WHEN** login request is logged
- **THEN** log entry does not contain password field

