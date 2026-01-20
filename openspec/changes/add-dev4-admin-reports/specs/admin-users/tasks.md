# Tasks: Admin Users Module

**Spec**: `spec.md`

This module handles user management functionality for administrators.

## 1. Backend - Admin Users Module

### 1.1 Module Structure
- [x] 1.1.1 Create `server/src/modules/users/users.routes.ts` (exists)
- [x] 1.1.2 Create `server/src/modules/users/users.controller.ts` (exists)
- [x] 1.1.3 Create `server/src/modules/users/users.service.ts` (exists)
- [x] 1.1.4 Create `server/src/modules/users/users.repo.ts` (exists)

### 1.2 User Listing & Filtering
- [x] 1.2.1 Implement `GET /admin/users` endpoint with pagination
- [ ] 1.2.2 Add filtering by employee name
- [x] 1.2.3 Add pagination metadata to response

### 1.3 User CRUD Operations
- [x] 1.3.1 Implement `POST /admin/users` (create user)
- [x] 1.3.2 Validate email uniqueness
- [ ] 1.3.3 Validate password strength requirements
- [x] 1.3.4 Set `mustChangePassword: true` flag on creation (defaults to true in repo)
- [ ] 1.3.5 Integrate audit logging on user creation (requires audit-logs module)
- [x] 1.3.6 Implement `GET /admin/users/:id` (get user details)
- [x] 1.3.7 Implement `PUT /admin/users/:id` (update user)
- [x] 1.3.8 Validate email uniqueness on update
- [ ] 1.3.9 Integrate audit logging on user update (requires audit-logs module)

### 1.4 User Status Management
- [x] 1.4.1 Implement `PUT /admin/users/:id/status` endpoint
- [x] 1.4.2 Support activate user (isActive: true)
- [x] 1.4.3 Support deactivate user (isActive: false)
- [ ] 1.4.4 Integrate audit logging for status changes (requires audit-logs module)

### 1.5 Password Reset
- [x] 1.5.1 Implement `POST /admin/users/:id/reset-password` endpoint
- [x] 1.5.2 Hash and update user password
- [x] 1.5.3 Set `mustChangePassword` flag based on request
- [ ] 1.5.4 Integrate audit logging for password reset - sanitize password field (requires audit-logs module)

## 2. Frontend - Admin Users

### 2.1 User Forms & Actions
- [x] 2.1.1 Create `CreateUserModal.tsx` component for creating new user
- [x] 2.1.2 Add form validation (email, password strength) using Zod + react-hook-form
- [x] 2.1.3 Add error translation utilities for Hebrew error messages
- [x] 2.1.4 Create `ModalIcon.tsx` component for modal headers
- [ ] 2.1.5 Create `UserStatusToggle.tsx` component

### 2.2 API Client
- [x] 2.2.1 Create `usersApi.ts` with HTTP client wrapper
- [x] 2.2.2 Implement createUser API method
- [x] 2.2.3 Implement getUsers API method
- [x] 2.2.4 Implement getUserById API method
- [x] 2.2.5 Implement updateUser API method
- [x] 2.2.6 Implement updateUserStatus API method
- [x] 2.2.7 Implement resetPassword API method

### 2.3 State Management (Optional - using API client directly)
- [ ] 2.3.1 Create Zustand store for users state (currently using direct API calls)
- [ ] 2.3.2 Implement fetch users action
- [ ] 2.3.3 Implement create user action
- [ ] 2.3.4 Implement status toggle action

## 3. Shared Types & DTOs

### 3.1 DTOs
- [x] 3.1.1 Create `shared/types/src/dtos/admin-users.dto.ts`
- [x] 3.1.2 Define `PaginationDto` (with pagination metadata)
- [x] 3.1.3 Define `AdminCreateUserRequestDto`
- [x] 3.1.4 Define `AdminUpdateUserRequestDto`
- [x] 3.1.5 Define `AdminUpdateUserStatusRequestDto`
- [x] 3.1.6 Define `AdminResetPasswordRequestDto`
- [x] 3.1.7 Define `AdminUserDto` (response DTO)
- [x] 3.1.8 Define `AdminUserResponseDto` (wrapper)
- [x] 3.1.9 Define `ListUsersResponseDto` (with pagination)

### 3.2 Validation Schemas
- [x] 3.2.1 Create `client/apps/Admin/src/schemas/user.schema.ts` (client-side validation)
- [x] 3.2.2 Add Zod schema for CreateUserFormData with Hebrew error messages
- [ ] 3.2.3 Create `shared/types/src/zod/admin-users.schema.ts` (shared validation - optional)
- [ ] 3.2.4 Add server-side Zod schemas if needed

### 3.3 Exports
- [x] 3.3.1 Export admin-users DTOs from `shared/types/src/index.ts`

## 4. Testing

### 4.1 Backend Tests
- [x] 4.1.1 Write unit tests for users.service.ts (18 tests covering all methods)
- [x] 4.1.2 Write unit tests for users.controller.ts
- [x] 4.1.3 Test user listing with pagination and filters
- [x] 4.1.4 Test user creation with password hashing
- [x] 4.1.5 Test user update functionality
- [x] 4.1.6 Test status update functionality
- [x] 4.1.7 Test password reset with requireChangeOnLogin flag
- [x] 4.1.8 Test email uniqueness validation (case-insensitive)
- [x] 4.1.9 Test requireChangeOnLogin=true for newly created users
- [ ] 4.1.10 Write integration tests for endpoints
- [ ] 4.1.11 Test password strength validation
- [ ] 4.1.12 Test audit log integration

### 4.2 Frontend Tests
- [ ] 4.2.1 Write tests for DashboardPage.tsx
- [ ] 4.2.2 Write tests for CreateUserModal.tsx
- [ ] 4.2.3 Write tests for ModalIcon.tsx
- [ ] 4.2.4 Write tests for usersApi client
- [ ] 4.2.5 Write tests for error translation utilities
- [ ] 4.2.6 Write tests for form validation schemas

## 5. Documentation

### 5.1 API Documentation
- [ ] 5.1.1 Document `GET /admin/users` in Swagger
- [ ] 5.1.2 Document `POST /admin/users` in Swagger
- [ ] 5.1.3 Document `GET /admin/users/:id` in Swagger
- [ ] 5.1.4 Document `PUT /admin/users/:id` in Swagger
- [ ] 5.1.5 Document `PUT /admin/users/:id/status` in Swagger
- [ ] 5.1.6 Document `POST /admin/users/:id/reset-password` in Swagger
- [ ] 5.1.7 Add request/response examples for all endpoints

### 5.2 Code Documentation
- [x] 5.2.1 Add JSDoc comments to usersApi.ts (client)
- [x] 5.2.2 Add JSDoc comments to CreateUserModal.tsx
- [x] 5.2.3 Add JSDoc comments to ModalIcon.tsx
- [x] 5.2.4 Add JSDoc comments to user.schema.ts
- [x] 5.2.5 Add JSDoc comments to errorMessages.ts utility
- [ ] 5.2.6 Add JSDoc comments to users.service.ts (server)
- [ ] 5.2.7 Add JSDoc comments to users.controller.ts (server)

## 6. Additional Features Implemented

### 6.1 UI Components
- [x] 6.1.1 Create CreateUserModal with full form implementation
- [x] 6.1.2 Add Hebrew UI with RTL support
- [x] 6.1.3 Implement real-time form validation with error messages
- [x] 6.1.4 Add loading states during form submission
- [x] 6.1.5 Add password requirements hint

### 6.2 Utilities
- [x] 6.2.1 Create error translation utility (English → Hebrew)
- [x] 6.2.2 Add network error detection helper
- [x] 6.2.3 Add auth error detection helper

### 6.3 Styling
- [x] 6.3.1 Create CreateUserModal.css with BEM naming convention
- [x] 6.3.2 Create ModalIcon.css with gradient design
- [x] 6.3.3 Add RTL support for forms and buttons
- [x] 6.3.4 Add mobile responsive design

### 6.4 Dependencies
- [x] 6.4.1 Add react-hook-form (v7.71.1)
- [x] 6.4.2 Add @hookform/resolvers (v5.2.2)
- [x] 6.4.3 Add zod (v4.3.5)
- [x] 6.4.4 Add lucide-react (v0.562.0)
