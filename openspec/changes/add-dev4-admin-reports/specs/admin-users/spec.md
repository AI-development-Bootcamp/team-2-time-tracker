# Admin Users Capability

## ADDED Requirements

### Requirement: List Users
The system SHALL allow admins to list all users with filtering and pagination.

#### Scenario: List users
- **WHEN** admin requests `GET /admin/users`
- **THEN** response contains paginated list of users with pagination metadata

#### Scenario: Filter by status
- **WHEN** admin requests users with `status=active` query parameter
- **THEN** response contains only active users

#### Scenario: Filter by role
- **WHEN** admin requests users with `role=EMPLOYEE` query parameter
- **THEN** response contains only employees

#### Scenario: Search users
- **WHEN** admin requests users with `query` parameter
- **THEN** response contains users matching name or email

### Requirement: Create User
The system SHALL allow admins to create new users.

#### Scenario: Create user
- **WHEN** admin submits `POST /admin/users` with valid user data
- **THEN** user is created with hashed password and `mustChangePassword: true` flag

#### Scenario: Email uniqueness
- **WHEN** admin attempts to create user with existing email
- **THEN** response is validation error with status 400

#### Scenario: Password strength
- **WHEN** admin creates user with weak password
- **THEN** response is validation error requiring strong password

### Requirement: Get User
The system SHALL return a single user by ID with full details.

#### Scenario: Get user
- **WHEN** admin requests `GET /admin/users/:id`
- **THEN** response contains user details including role, status, and timestamps

### Requirement: Update User
The system SHALL allow admins to update user details.

#### Scenario: Update user
- **WHEN** admin submits `PUT /admin/users/:id` with changes
- **THEN** user is updated and audit log is created

#### Scenario: Email update validation
- **WHEN** admin updates email to existing email
- **THEN** response is validation error with status 400

### Requirement: User Status Management
The system SHALL allow admins to activate or deactivate users.

#### Scenario: Deactivate user
- **WHEN** admin submits `PUT /admin/users/:id/status` with `isActive: false`
- **THEN** user is deactivated and cannot log in

#### Scenario: Activate user
- **WHEN** admin submits `PUT /admin/users/:id/status` with `isActive: true`
- **THEN** user is activated and can log in

#### Scenario: Status change audit
- **WHEN** admin changes user status
- **THEN** audit log records the status change

### Requirement: Reset Password
The system SHALL allow admins to reset user passwords.

#### Scenario: Reset password
- **WHEN** admin submits `POST /admin/users/:id/reset-password` with new password
- **THEN** user password is updated and `mustChangePassword` flag is set

#### Scenario: Require change on login
- **WHEN** admin resets password with `requireChangeOnLogin: true`
- **THEN** user must change password on next login

#### Scenario: Password reset audit
- **WHEN** admin resets password
- **THEN** audit log records the password reset action

