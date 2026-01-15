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

### Requirement: Soft Delete Pattern
The system SHALL use soft delete (status change) for all entities instead of physical deletion.

#### Scenario: Deactivate instead of delete
- **WHEN** admin deactivates an entity
- **THEN** entity status is set to INACTIVE but record remains in database

#### Scenario: Inactive entities excluded
- **WHEN** entity is set to INACTIVE
- **THEN** entity is excluded from active listings but remains accessible for historical data

