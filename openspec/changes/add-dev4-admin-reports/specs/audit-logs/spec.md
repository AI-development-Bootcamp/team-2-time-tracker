# Audit Logs Capability

## ADDED Requirements

### Requirement: Audit Logging Service
The system SHALL provide a shared audit logging service that can be used by all modules.

#### Scenario: Log admin action
- **WHEN** admin performs any action (create, update, delete, status change)
- **THEN** audit log entry is automatically created

#### Scenario: Log format
- **WHEN** audit log is created
- **THEN** entry includes entity type, entityId, action, adminId, oldValue, newValue, and timestamp

### Requirement: List Audit Logs
The system SHALL allow admins to view audit logs with filtering and pagination.

#### Scenario: List audit logs
- **WHEN** admin requests `GET /admin/audit-logs`
- **THEN** response contains paginated list of audit log entries

#### Scenario: Filter by entity
- **WHEN** admin requests logs with `entity=USER` query parameter
- **THEN** response contains only logs for USER entity

#### Scenario: Filter by entity ID
- **WHEN** admin requests logs with `entityId` query parameter
- **THEN** response contains only logs for that specific entity

#### Scenario: Filter by admin
- **WHEN** admin requests logs with `adminId` query parameter
- **THEN** response contains only logs created by that admin

#### Scenario: Filter by action
- **WHEN** admin requests logs with `action=UPDATE` query parameter
- **THEN** response contains only UPDATE actions

#### Scenario: Filter by date range
- **WHEN** admin requests logs with `fromDate` and `toDate` parameters
- **THEN** response contains only logs within the date range

### Requirement: Get Audit Log
The system SHALL return a single audit log entry with full details.

#### Scenario: Get audit log
- **WHEN** admin requests `GET /admin/audit-logs/:id`
- **THEN** response contains full audit log entry with oldValue and newValue

### Requirement: Audit Log Data Model
The system SHALL store audit logs with entity type, entityId, action, adminId, oldValue, newValue, and timestamps.

#### Scenario: Value tracking
- **WHEN** entity is updated
- **THEN** audit log stores both oldValue and newValue as JSON

#### Scenario: Admin identification
- **WHEN** audit log is created
- **THEN** adminId and adminName are stored for identification

### Requirement: Supported Audit Actions
The system SHALL log CREATE, UPDATE, STATUS_CHANGE, RESET_PASSWORD, LOCK_MONTH, and UNLOCK_MONTH actions.

#### Scenario: Create action
- **WHEN** admin creates entity
- **THEN** audit log has action: CREATE with newValue only

#### Scenario: Update action
- **WHEN** admin updates entity
- **THEN** audit log has action: UPDATE with both oldValue and newValue

#### Scenario: Status change action
- **WHEN** admin changes entity status
- **THEN** audit log has action: STATUS_CHANGE

#### Scenario: Password reset action
- **WHEN** admin resets user password
- **THEN** audit log has action: RESET_PASSWORD (password not stored in values)

#### Scenario: Month lock action
- **WHEN** admin locks month
- **THEN** audit log has action: LOCK_MONTH

#### Scenario: Month unlock action
- **WHEN** admin unlocks month
- **THEN** audit log has action: UNLOCK_MONTH

