# Tasks: Admin Entities Module

**Spec**: `spec.md`

This module handles CRUD operations for clients, projects, and tasks with date range validation.

## 1. Database Schema

**NOTE**: This module owns the database schema for Client, Project, and Task entities. Implement these schema changes FIRST before proceeding with backend logic.

### 1.1 Prisma Models
- [x] 1.1.1 Add Client model to `prisma/schema.prisma` (id, name, status: ACTIVE/INACTIVE, createdAt, updatedAt)
- [x] 1.1.2 Add Project model to `prisma/schema.prisma` (id, name, clientId, reportType: TOTAL_HOURS/DETAILED, status: ACTIVE/INACTIVE, startDate?, endDate?, createdAt, updatedAt)
- [x] 1.1.3 Add Task model to `prisma/schema.prisma` (id, name, projectId, status: OPEN/CLOSED, startDate?, endDate?, createdAt, updatedAt)
- [x] 1.1.4 Add relations: Client.projects[], Project.client, Project.tasks[], Task.project
- [x] 1.1.5 Create migration for all entity tables
- [x] 1.1.6 Add necessary indexes for query optimization (clientId, projectId)
- [x] 1.1.7 Add status enums: ClientStatus, ProjectStatus, TaskStatus, ReportType

## 2. Backend - Clients Module

### 2.1 Module Structure
- [x] 2.1.1 Create `server/src/modules/admin/entities/clients.routes.ts`
- [x] 2.1.2 Create `server/src/modules/admin/entities/clients.controller.ts`
- [x] 2.1.3 Create `server/src/modules/admin/entities/clients.service.ts`
- [x] 2.1.4 Create `server/src/modules/admin/entities/clients.repo.ts`

### 2.2 Client CRUD Endpoints
- [x] 2.2.1 Implement `GET /admin/clients` endpoint
- [x] 2.2.2 Implement `POST /admin/clients` endpoint
- [x] 2.2.3 Set default status to ACTIVE on creation
- [x] 2.2.4 Implement `GET /admin/clients/:id` endpoint
- [x] 2.2.5 Implement `PUT /admin/clients/:id` endpoint
- [x] 2.2.6 Implement `PUT /admin/clients/:id/status` endpoint

## 3. Backend - Projects Module

### 3.1 Module Structure
- [x] 3.1.1 Create `server/src/modules/admin/entities/projects.routes.ts`
- [x] 3.1.2 Create `server/src/modules/admin/entities/projects.controller.ts`
- [x] 3.1.3 Create `server/src/modules/admin/entities/projects.service.ts`
- [x] 3.1.4 Create `server/src/modules/admin/entities/projects.repo.ts`

### 3.2 Project CRUD Endpoints
- [x] 3.2.1 Implement `GET /admin/projects` endpoint
- [x] 3.2.2 Add filtering by clientId query parameter
- [x] 3.2.3 Implement `POST /admin/projects` endpoint
- [x] 3.2.4 Set default status to ACTIVE on creation
- [x] 3.2.5 Set default reportType to TOTAL_HOURS on creation
- [x] 3.2.6 Implement `GET /admin/projects/:id` endpoint
- [x] 3.2.7 Implement `PUT /admin/projects/:id` endpoint
- [x] 3.2.8 Implement `PUT /admin/projects/:id/status` endpoint
- [x] 3.2.9 Implement `PUT /admin/projects/:id/report-type` endpoint

### 3.3 Project Date Validation
- [x] 3.3.1 Validate endDate >= startDate on create/update
- [x] 3.3.2 Return VALIDATION_001 error if date range invalid
- [x] 3.3.3 Allow NULL values for startDate and endDate
- [x] 3.3.4 When updating project dates, validate all child tasks within new range
- [x] 3.3.5 Return VALIDATION_002 error if any child tasks fall outside new date range
- [x] 3.3.6 Include list of conflicting task IDs and their dates in error response
- [ ] 3.3.7 Frontend should display conflicting tasks and offer options: cancel update or adjust task dates first

## 4. Backend - Tasks Module

### 4.1 Module Structure
- [x] 4.1.1 Create `server/src/modules/admin/entities/tasks.routes.ts`
- [x] 4.1.2 Create `server/src/modules/admin/entities/tasks.controller.ts`
- [x] 4.1.3 Create `server/src/modules/admin/entities/tasks.service.ts`
- [x] 4.1.4 Create `server/src/modules/admin/entities/tasks.repo.ts`

### 4.2 Task CRUD Endpoints
- [x] 4.2.1 Implement `GET /admin/tasks` endpoint
- [x] 4.2.2 Add filtering by projectId query parameter
- [x] 4.2.3 Implement `POST /admin/tasks` endpoint
- [x] 4.2.4 Set default status to OPEN on creation
- [x] 4.2.5 Implement `GET /admin/tasks/:id` endpoint
- [x] 4.2.6 Implement `PUT /admin/tasks/:id` endpoint
- [x] 4.2.7 Implement `PUT /admin/tasks/:id/status` endpoint
- [x] 4.2.8 Prevent closing task if it has associated time entries

### 4.3 Task Date Validation
- [x] 4.3.1 Validate endDate >= startDate on create/update
- [x] 4.3.2 Return VALIDATION_001 error if date range invalid
- [x] 4.3.3 Allow NULL values for startDate and endDate
- [x] 4.3.4 Validate task dates within parent project dates (if both are set)
- [x] 4.3.5 Return VALIDATION_001 error if task dates outside project range
- [x] 4.3.6 Allow any valid task dates if project has NULL dates

## 5. Frontend - Entity Management

### 5.1 Clients Page
- [ ] 5.1.1 Create `client/apps/admin/src/pages/ClientsPage.tsx`
- [ ] 5.1.2 Implement clients data table with TanStack Table
- [ ] 5.1.3 Add create client button
- [ ] 5.1.4 Add edit action for each row
- [ ] 5.1.5 Add status toggle for each row
- [ ] 5.1.6 Display status badge (ACTIVE/INACTIVE)

### 5.2 Projects Page
- [ ] 5.2.1 Create `client/apps/admin/src/pages/ProjectsPage.tsx`
- [ ] 5.2.2 Implement projects data table with TanStack Table
- [ ] 5.2.3 Add client filter dropdown
- [ ] 5.2.4 Add create project button
- [ ] 5.2.5 Add edit action for each row
- [ ] 5.2.6 Add status toggle for each row
- [ ] 5.2.7 Add report type toggle/dropdown for each row
- [ ] 5.2.8 Display client name in table
- [ ] 5.2.9 Display date ranges in table
- [ ] 5.2.10 Handle VALIDATION_002 error: show dialog with conflicting tasks and their dates
- [ ] 5.2.11 Provide option to navigate to tasks page to adjust conflicting task dates

### 5.3 Tasks Page
- [ ] 5.3.1 Create `client/apps/admin/src/pages/TasksPage.tsx`
- [ ] 5.3.2 Implement tasks data table with TanStack Table
- [ ] 5.3.3 Add project filter dropdown
- [ ] 5.3.4 Add create task button
- [ ] 5.3.5 Add edit action for each row
- [ ] 5.3.6 Add status toggle for each row
- [ ] 5.3.7 Display project name in table
- [ ] 5.3.8 Display status badge (OPEN/CLOSED)
- [ ] 5.3.9 Display date ranges in table

### 5.4 Shared Components
- [ ] 5.4.1 Create `EntityFormDrawer.tsx` reusable component
- [ ] 5.4.2 Support client, project, and task forms
- [ ] 5.4.3 Add date range picker for projects and tasks
- [ ] 5.4.4 Add validation for date ranges in forms
- [ ] 5.4.5 Create `StatusBadge.tsx` component (if not exists)
- [ ] 5.4.6 Handle soft delete via status change

### 5.5 State Management
- [ ] 5.5.1 Create Zustand store for clients state
- [ ] 5.5.2 Create Zustand store for projects state
- [ ] 5.5.3 Create Zustand store for tasks state
- [ ] 5.5.4 Implement CRUD actions for each entity type

## 6. Shared Types & DTOs

### 6.1 DTOs
- [x] 6.1.1 Create `shared/types/src/dtos/admin-entities.dto.ts`
- [x] 6.1.2 Define Client DTOs (Create, Update, UpdateStatus, Response)
- [x] 6.1.3 Define Project DTOs (Create, Update, UpdateStatus, UpdateReportType, Response)
- [x] 6.1.4 Define Task DTOs (Create, Update, UpdateStatus, Response)
- [x] 6.1.5 Include date fields (startDate, endDate) in DTOs

### 6.2 Validation Schemas
- [x] 6.2.1 Create `shared/types/src/zod/admin-entities.schema.ts`
- [x] 6.2.2 Add Zod schemas for all client DTOs
- [x] 6.2.3 Add Zod schemas for all project DTOs
- [x] 6.2.4 Add Zod schemas for all task DTOs
- [x] 6.2.5 Add date range validation logic (endDate >= startDate)

### 6.3 Exports
- [x] 6.3.1 Export admin-entities DTOs from `shared/types/src/index.ts`

## 7. Testing

### 7.1 Backend Tests
- [x] 7.1.1 Write unit tests for clients.service.ts (APPLIED)
- [x] 7.1.2 Write unit tests for projects.service.ts (APPLIED)
- [x] 7.1.3 Write unit tests for tasks.service.ts (APPLIED)
- [x] 7.1.4 Write integration tests for clients CRUD endpoints (APPLIED)
- [x] 7.1.5 Write integration tests for projects CRUD endpoints (APPLIED)
- [x] 7.1.6 Write integration tests for tasks CRUD endpoints (APPLIED)
- [x] 7.1.7 Test project date validation logic (APPLIED)
- [x] 7.1.8 Test task date validation against project dates (APPLIED)
- [x] 7.1.9 Test preventing task close when time entries exist (APPLIED)

### 7.2 Frontend Tests
- [ ] 7.2.1 Write tests for ClientsPage.tsx
- [ ] 7.2.2 Write tests for ProjectsPage.tsx
- [ ] 7.2.3 Write tests for TasksPage.tsx
- [ ] 7.2.4 Write tests for EntityFormDrawer.tsx
- [ ] 7.2.5 Write tests for entity stores

## 8. Documentation

### 8.1 API Documentation
- [x] 8.1.1 Document all clients endpoints in Swagger
- [x] 8.1.2 Document all projects endpoints in Swagger
- [x] 8.1.3 Document all tasks endpoints in Swagger
- [x] 8.1.4 Add request/response examples for all endpoints
- [x] 8.1.5 Document date validation rules
- [x] 8.1.6 Document soft delete pattern

### 8.2 Code Documentation
- [ ] 8.2.1 Add JSDoc comments to entities services
- [ ] 8.2.2 Document date validation logic
