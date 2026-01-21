# Admin Entities Capability

## ADDED Requirements

### Requirement: Client Management
The system SHALL allow admins to perform CRUD operations on clients.

#### Scenario: List clients
- **WHEN** admin requests `GET /admin/clients`
- **THEN** response contains all clients with status information

#### Scenario: Create client
- **WHEN** admin submits `POST /admin/clients` with client data
- **THEN** client is created with `status: ACTIVE` and audit log is created

#### Scenario: Get client
- **WHEN** admin requests `GET /admin/clients/:id`
- **THEN** response contains client details

#### Scenario: Update client
- **WHEN** admin submits `PUT /admin/clients/:id` with changes
- **THEN** client is updated and audit log is created

#### Scenario: Update client status
- **WHEN** admin submits `PUT /admin/clients/:id/status` with status
- **THEN** client status is updated and audit log is created

### Requirement: Project Management
The system SHALL allow admins to perform CRUD operations on projects.

#### Scenario: List projects
- **WHEN** admin requests `GET /admin/projects`
- **THEN** response contains all projects with client association

#### Scenario: Filter projects by client
- **WHEN** admin requests projects with `clientId` query parameter
- **THEN** response contains only projects for that client

#### Scenario: Filter projects by user
- **WHEN** admin requests projects with `userId` query parameter
- **THEN** response contains only projects that have tasks assigned to that user

#### Scenario: Get project with assigned users
- **WHEN** admin requests `GET /admin/projects/:id`
- **THEN** response includes `assignedUsers` array with user details (id, fullName, email)

#### Scenario: Get all users for a project
- **WHEN** admin requests `GET /admin/projects/:id/users`
- **THEN** response contains list of all users assigned to tasks in that project

#### Scenario: Create project
- **WHEN** admin submits `POST /admin/projects` with project data
- **THEN** project is created with `status: ACTIVE` and default `reportType: TOTAL_HOURS`

#### Scenario: Get project
- **WHEN** admin requests `GET /admin/projects/:id`
- **THEN** response contains project details including reportType

#### Scenario: Update project
- **WHEN** admin submits `PUT /admin/projects/:id` with changes
- **THEN** project is updated and audit log is created

#### Scenario: Update project status
- **WHEN** admin submits `PUT /admin/projects/:id/status` with status
- **THEN** project status is updated and audit log is created

#### Scenario: Update project report type
- **WHEN** admin submits `PUT /admin/projects/:id/report-type` with reportType
- **THEN** project reportType is updated and audit log is created

### Requirement: Project Date Management
The system SHALL allow admins to set and validate project date ranges.

#### Scenario: Create project with dates
- **WHEN** admin submits `POST /admin/projects` with startDate and endDate
- **THEN** project is created with validated date range

#### Scenario: Invalid project date range
- **WHEN** admin submits project with endDate < startDate
- **THEN** response is validation error with code VALIDATION_001

#### Scenario: Update project dates
- **WHEN** admin updates project dates
- **THEN** system validates all child tasks are within new date range
- **THEN** response is error if any tasks fall outside new range

#### Scenario: Project dates are optional
- **WHEN** admin creates or updates project without dates
- **THEN** project is saved with NULL date values

### Requirement: Task Management
The system SHALL allow admins to perform CRUD operations on tasks.

#### Scenario: List tasks
- **WHEN** admin requests `GET /admin/tasks`
- **THEN** response contains all tasks with project association

#### Scenario: Filter tasks by project
- **WHEN** admin requests tasks with `projectId` query parameter
- **THEN** response contains only tasks for that project

#### Scenario: Create task
- **WHEN** admin submits `POST /admin/tasks` with task data
- **THEN** task is created with `status: OPEN`

#### Scenario: Get task
- **WHEN** admin requests `GET /admin/tasks/:id`
- **THEN** response contains task details

#### Scenario: Update task
- **WHEN** admin submits `PUT /admin/tasks/:id` with changes
- **THEN** task is updated and audit log is created

#### Scenario: Update task status
- **WHEN** admin submits `PUT /admin/tasks/:id/status` with status
- **THEN** task status is updated and audit log is created

#### Scenario: Cannot close task with time entries
- **WHEN** admin attempts to close a task (status = CLOSED) that has associated time entries
- **THEN** response is validation error with code VALIDATION_001
- **THEN** error message explains that task has logged time

### Requirement: Task Date Management
The system SHALL allow admins to set task dates within project boundaries.

#### Scenario: Create task with dates
- **WHEN** admin submits `POST /admin/tasks` with startDate and endDate
- **THEN** task dates are validated against parent project dates

#### Scenario: Task dates outside project range
- **WHEN** admin submits task with dates outside parent project date range
- **THEN** response is validation error with code VALIDATION_001
- **THEN** error message explains task dates must be within project dates

#### Scenario: Invalid task date range
- **WHEN** admin submits task with endDate < startDate
- **THEN** response is validation error with code VALIDATION_001

#### Scenario: Task dates are optional
- **WHEN** admin creates or updates task without dates
- **THEN** task is saved with NULL date values

#### Scenario: Task dates validation with NULL project dates
- **WHEN** parent project has NULL dates
- **THEN** task dates can be any valid range (no parent constraint)

### Requirement: Soft Delete Pattern
The system SHALL use soft delete (status change) for all entities instead of physical deletion.

#### Scenario: Deactivate instead of delete
- **WHEN** admin deactivates an entity
- **THEN** entity status is set to INACTIVE but record remains in database

#### Scenario: Inactive entities excluded
- **WHEN** entity is set to INACTIVE
- **THEN** entity is excluded from active listings but remains accessible for historical data

