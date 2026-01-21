# User Management Capability

## ADDED Requirements

### Requirement: User Data Model
The system SHALL store users with id (UUID), fullName, email (unique), passwordHash, role (EMPLOYEE/ADMIN), isActive (boolean), mustChangePassword (boolean), createdAt, and updatedAt fields.

#### Scenario: User creation
- **WHEN** admin creates a new user
- **THEN** user is stored with auto-generated UUID, hashed password, and timestamps

#### Scenario: Email uniqueness
- **WHEN** attempting to create user with existing email
- **THEN** operation fails with validation error

### Requirement: User Roles
The system SHALL support two user roles: EMPLOYEE (regular user) and ADMIN (administrative user).

#### Scenario: Default role
- **WHEN** user is created without explicit role
- **THEN** role defaults to EMPLOYEE

#### Scenario: Role determines access
- **WHEN** user authenticates
- **THEN** JWT token contains role claim used for authorization

### Requirement: User Active Status
The system SHALL track user active status and prevent inactive users from authenticating.

#### Scenario: Default active status
- **WHEN** user is created
- **THEN** isActive defaults to true

#### Scenario: Inactive user blocked
- **WHEN** inactive user attempts to login
- **THEN** authentication fails with AUTH_001 error

### Requirement: Soft Delete Users
The system SHALL implement soft delete for users by setting isActive to false, preserving data integrity with related records.

#### Scenario: User deactivation
- **WHEN** admin deactivates a user
- **THEN** isActive is set to false, user data is preserved

#### Scenario: Deactivated user data preserved
- **WHEN** user is deactivated
- **THEN** related time entries, absences remain accessible for reporting

### Requirement: User Profile Access
The system SHALL allow authenticated users to view their own profile information but not modify it directly (admin-only modification).

#### Scenario: View own profile
- **WHEN** authenticated user requests `GET /profile`
- **THEN** response contains user's fullName, email, role

#### Scenario: Cannot modify own profile
- **WHEN** user attempts to update their own fullName or email
- **THEN** operation is rejected (admin-only)

### Requirement: Login Page
The system SHALL provide a login page with email and password fields, Hebrew RTL layout, and mobile-first responsive design.

#### Scenario: Successful login flow
- **WHEN** user enters valid credentials and submits
- **THEN** user is redirected to dashboard

#### Scenario: Error display
- **WHEN** login fails
- **THEN** error message is displayed in Hebrew

#### Scenario: Mobile responsive
- **WHEN** page is viewed on mobile device
- **THEN** form is centered and readable with appropriate touch targets

### Requirement: Change Password Page
The system SHALL provide a change password page with current password, new password, and confirm password fields.

#### Scenario: Password change flow
- **WHEN** user submits matching valid passwords
- **THEN** password is changed and user is redirected to dashboard

#### Scenario: Inline validation
- **WHEN** passwords do not match
- **THEN** error is shown inline before submission

### Requirement: Protected Route Wrapper
The system SHALL provide a route wrapper component that redirects unauthenticated users to the login page.

#### Scenario: Unauthenticated access
- **WHEN** unauthenticated user navigates to protected route
- **THEN** user is redirected to login page

#### Scenario: Authenticated access
- **WHEN** authenticated user navigates to protected route
- **THEN** route content is rendered

#### Scenario: Token expiry redirect
- **WHEN** user's token expires during session
- **THEN** user is redirected to login after failed refresh

### Requirement: Auth State Management
The system SHALL manage authentication state in a Zustand store with token, user info, and login/logout actions.

#### Scenario: Login stores state
- **WHEN** user logs in successfully
- **THEN** token and user info are stored in Zustand store

#### Scenario: Logout clears state
- **WHEN** user logs out
- **THEN** store is cleared and user is redirected to login

#### Scenario: State persists on refresh
- **WHEN** page is refreshed
- **THEN** auth state is restored from stored token (if valid)

### Requirement: API Client Configuration
The system SHALL configure axios with base URL, JWT token injection, and automatic token refresh on 401 responses.

#### Scenario: Token injection
- **WHEN** authenticated request is made
- **THEN** Authorization header contains `Bearer {token}`

#### Scenario: Auto refresh on 401
- **WHEN** API returns 401 and refresh token is valid
- **THEN** token is refreshed and request is retried

#### Scenario: Logout on refresh failure
- **WHEN** refresh token is invalid
- **THEN** user is logged out and redirected to login
