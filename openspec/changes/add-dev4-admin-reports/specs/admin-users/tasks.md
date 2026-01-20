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
- [x] 1.3.5 Implement `GET /admin/users/:id` (get user details)
- [x] 1.3.6 Implement `PUT /admin/users/:id` (update user)
- [x] 1.3.7 Validate email uniqueness on update

### 1.4 User Status Management
- [x] 1.4.1 Implement `PUT /admin/users/:id/status` endpoint
- [x] 1.4.2 Support activate user (isActive: true)
- [x] 1.4.3 Support deactivate user (isActive: false)

### 1.5 Password Reset
- [x] 1.5.1 Implement `POST /admin/users/:id/reset-password` endpoint
- [x] 1.5.2 Hash and update user password
- [x] 1.5.3 Set `mustChangePassword` flag based on request

## 2. Frontend - Admin Users

### 2.1 User Forms & Actions
- [ ] 2.1.1 Create `UserForm.tsx` component for creating new user
- [ ] 2.1.2 Add form validation (email, password strength)
- [ ] 2.1.3 Create `UserStatusToggle.tsx` component

### 2.2 State Management
- [ ] 2.2.1 Create Zustand store for users state
- [ ] 2.2.2 Implement fetch users action
- [ ] 2.2.3 Implement create user action
- [ ] 2.2.4 Implement status toggle action

## 3. Shared Types & DTOs

### 3.1 DTOs
- [ ] 3.1.1 Create `shared/types/src/dtos/admin-users.dto.ts`
- [ ] 3.1.2 Define `ListUsersQueryDto` (with filters and pagination)
- [ ] 3.1.3 Define `CreateUserDto`
- [ ] 3.1.4 Define `UpdateUserDto`
- [ ] 3.1.5 Define `UpdateUserStatusDto`
- [ ] 3.1.6 Define `ResetPasswordDto`
- [ ] 3.1.7 Define `UserResponseDto`
- [ ] 3.1.8 Define `UsersListResponseDto` (with pagination)

### 3.2 Validation Schemas
- [ ] 3.2.1 Create `shared/types/src/zod/admin-users.schema.ts`
- [ ] 3.2.2 Add Zod schema for ListUsersQueryDto
- [ ] 3.2.3 Add Zod schema for CreateUserDto
- [ ] 3.2.4 Add Zod schema for UpdateUserDto
- [ ] 3.2.5 Add Zod schema for UpdateUserStatusDto
- [ ] 3.2.6 Add Zod schema for ResetPasswordDto

### 3.3 Exports
- [ ] 3.3.1 Export admin-users DTOs from `shared/types/src/index.ts`

## 4. Testing

### 4.1 Backend Tests
- [ ] 4.1.1 Write unit tests for users.service.ts
- [ ] 4.1.2 Write integration tests for user listing endpoint
- [ ] 4.1.3 Write integration tests for user creation endpoint
- [ ] 4.1.4 Write integration tests for user update endpoint
- [ ] 4.1.5 Write integration tests for status update endpoint
- [ ] 4.1.6 Write integration tests for password reset endpoint
- [ ] 4.1.7 Test email uniqueness validation
- [ ] 4.1.8 Test password strength validation

### 4.2 Frontend Tests
- [ ] 4.2.1 Write tests for UsersPage.tsx
- [ ] 4.2.2 Write tests for UserForm.tsx
- [ ] 4.2.3 Write tests for UserStatusToggle.tsx
- [ ] 4.2.4 Write tests for users store

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
- [ ] 5.2.1 Add JSDoc comments to users.service.ts
- [ ] 5.2.2 Add JSDoc comments to users.controller.ts
