# Admin Assignments Capability

## ADDED Requirements

### Requirement: List Assignments
The system SHALL allow admins to view all task-user assignments.

#### Scenario: List all assignments
- **WHEN** admin requests `GET /admin/assignments`
- **THEN** response contains all task-user assignments

#### Scenario: Filter by user
- **WHEN** admin requests assignments with `userId` query parameter
- **THEN** response contains only assignments for that user

#### Scenario: Filter by task
- **WHEN** admin requests assignments with `taskId` query parameter
- **THEN** response contains only assignments for that task

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

