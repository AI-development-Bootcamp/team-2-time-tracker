# Time Entries Capability

## ADDED Requirements

### Requirement: Create Time Entry
The system SHALL allow users to create manual time entries when no timer is running.

#### Scenario: Create manual entry
- **WHEN** user submits `POST /time-entries` with valid data and timer is not running
- **THEN** entry is created with `source: MANUAL` and workday summary is recalculated

#### Scenario: Timer running blocks manual entry
- **WHEN** user attempts to create entry while timer is running
- **THEN** response is `{ "error": { "code": "TIMER_001", "message": "Timer already running" } }` with status 409

#### Scenario: Locked month blocks entry
- **WHEN** user attempts to create entry for a date in a locked month
- **THEN** response is `{ "error": { "code": "WORKDAY_001", "message": "Day/Month is locked" } }` with status 400

#### Scenario: Task assignment validation
- **WHEN** user attempts to create entry with a task not assigned to them
- **THEN** response is `{ "error": { "code": "VALIDATION_001", "message": "Task not assigned" } }` with status 400

### Requirement: Time Entry Validation
The system SHALL validate that end time is after start time and description is 10-500 characters.

#### Scenario: End time before start time
- **WHEN** user submits entry with `endTime` before `startTime`
- **THEN** response is validation error with status 400

#### Scenario: Description too short
- **WHEN** user submits entry with description less than 10 characters
- **THEN** response is validation error with status 400

#### Scenario: Description too long
- **WHEN** user submits entry with description more than 500 characters
- **THEN** response is validation error with status 400

### Requirement: Get Time Entry
The system SHALL return a single time entry by ID with task, project, and client information.

#### Scenario: Get existing entry
- **WHEN** user requests `GET /time-entries/:id` for their own entry
- **THEN** response contains full entry details including nested task/project/client

#### Scenario: Get other user's entry
- **WHEN** user requests entry belonging to another user
- **THEN** response is `{ "error": { "code": "AUTH_003", "message": "Insufficient permissions" } }` with status 403

### Requirement: Update Time Entry
The system SHALL allow users to update their own time entries if the month is not locked.

#### Scenario: Update entry
- **WHEN** user submits `PUT /time-entries/:id` with valid changes
- **THEN** entry is updated and workday summary is recalculated

#### Scenario: Cannot update other user's entry
- **WHEN** user attempts to update another user's entry
- **THEN** response is `{ "error": { "code": "AUTH_003" } }` with status 403

#### Scenario: Cannot update in locked month
- **WHEN** user attempts to update entry in a locked month
- **THEN** response is `{ "error": { "code": "WORKDAY_001" } }` with status 400

### Requirement: Delete Time Entry
The system SHALL soft-delete time entries by setting is_deleted flag.

#### Scenario: Soft delete entry
- **WHEN** user submits `DELETE /time-entries/:id`
- **THEN** entry is marked as deleted, not physically removed

#### Scenario: Deleted entry excluded from calculations
- **WHEN** entry is soft deleted
- **THEN** workday summary is recalculated excluding the deleted entry

### Requirement: Time Entry History
The system SHALL return paginated time entry history with filtering options.

#### Scenario: Get history
- **WHEN** user requests `GET /time-entries/history`
- **THEN** response contains paginated list of entries with pagination metadata

#### Scenario: Filter by date range
- **WHEN** user requests history with `fromDate` and `toDate` parameters
- **THEN** response contains only entries within the date range

#### Scenario: Filter by client/project/task
- **WHEN** user requests history with `clientId`, `projectId`, or `taskId` filter
- **THEN** response contains only matching entries

### Requirement: Batch Create Time Entries
The system SHALL allow creating multiple time entries in a single request.

#### Scenario: Batch create success
- **WHEN** user submits `POST /time-entries/batch` with array of valid entries
- **THEN** all entries are created and response contains created entries with updated workday summary

#### Scenario: Batch validation failure
- **WHEN** any entry in batch fails validation
- **THEN** entire batch is rejected with validation errors

### Requirement: Time Entry Data Model
The system SHALL store time entries with id, userId, workDate, location, startTime, endTime, durationMinutes, taskId, description, source, timerId (optional), soft delete fields, and timestamps.

#### Scenario: Duration calculation
- **WHEN** entry is created or updated
- **THEN** `durationMinutes` is automatically calculated from `startTime` and `endTime`

#### Scenario: Source tracking
- **WHEN** entry is created from timer
- **THEN** `source` is set to `TIMER` and `timerId` references the timer

### Requirement: Workday Summary Recalculation
The system SHALL recalculate the workday summary whenever time entries are created, updated, or deleted.

#### Scenario: Entry creation updates summary
- **WHEN** new entry is created
- **THEN** workday's `workMinutes` is updated to sum of all entry durations

#### Scenario: Entry deletion updates summary
- **WHEN** entry is deleted
- **THEN** workday's `workMinutes` is reduced by deleted entry's duration
