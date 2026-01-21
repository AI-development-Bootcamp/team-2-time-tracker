# Admin Assignments Capability

## ADDED Requirements

### Requirement: List Assignments
The system SHALL allow admins to view all task-user assignments with expanded details.

#### Scenario: List all assignments
- **WHEN** admin requests `GET /admin/assignments`
- **THEN** response contains all task-user assignments with expanded details:
  - User information (id, fullName, email)
  - Task information (id, name)
  - Project information (id, name)
  - Client information (id, name)

#### Scenario: Filter by user
- **WHEN** admin requests assignments with `userId` query parameter
- **THEN** response contains only assignments for that user

#### Scenario: Filter by task
- **WHEN** admin requests assignments with `taskId` query parameter
- **THEN** response contains only assignments for that task

#### Scenario: Filter by project
- **WHEN** admin requests assignments with `projectId` query parameter
- **THEN** response contains only assignments for tasks belonging to that project

#### Scenario: Search by employee name
- **WHEN** admin requests assignments with `userName` query parameter (search term)
- **THEN** response contains only assignments for users whose fullName matches the search term (case-insensitive, partial match)

### Requirement: Create Assignment
The system SHALL allow admins to assign tasks to users.

#### Scenario: Create single assignment
- **WHEN** admin submits `POST /admin/assignments` with userId and taskId
- **THEN** assignment is created and audit log is created

#### Scenario: Duplicate assignment prevention
- **WHEN** admin attempts to create duplicate assignment
- **THEN** response is validation error or assignment is ignored (idempotent)

### Requirement: Bulk Assignments
The system SHALL allow admins to create multiple assignments in a single operation using cartesian product.

#### Scenario: Bulk create assignments
- **WHEN** admin submits `POST /admin/assignments/bulk` with arrays of userIds and taskIds
- **THEN** all combinations (cartesian product) are created as assignments

#### Scenario: Bulk assignment example
- **WHEN** admin submits userIds [1, 2] and taskIds [A, B]
- **THEN** assignments are created: (1,A), (1,B), (2,A), (2,B)

#### Scenario: Bulk assignment audit
- **WHEN** bulk assignments are created
- **THEN** audit log records the bulk operation

### Requirement: Remove Assignment
The system SHALL allow admins to remove task assignments.

#### Scenario: Delete assignment
- **WHEN** admin submits `DELETE /admin/assignments/:id`
- **THEN** assignment is removed and audit log is created

#### Scenario: Cannot remove if time entries exist
- **WHEN** admin attempts to remove assignment with existing time entries
- **THEN** response is validation error explaining constraint (or allow with warning)

