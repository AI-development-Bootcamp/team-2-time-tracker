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

#### Scenario: Future date blocked
- **WHEN** user attempts to create entry with `workDate` in the future
- **THEN** response is validation error with status 400

#### Scenario: Past date allowed
- **WHEN** user creates entry for a past date (not in locked month)
- **THEN** entry is created successfully

### Requirement: ReportType Behavior
The system SHALL handle time entries differently based on the project's reportType (TOTAL_HOURS vs ENTRY_EXIT).

#### Scenario: TOTAL_HOURS project entry
- **WHEN** user creates entry for a task under a project with `reportType: TOTAL_HOURS`
- **THEN** entry is created with startTime and endTime for that specific task, allowing multiple entries per day

#### Scenario: ENTRY_EXIT project entry
- **WHEN** user creates entry for a task under a project with `reportType: ENTRY_EXIT`
- **THEN** entry represents workday entry/exit times, and only one entry per day is allowed for that project

#### Scenario: ENTRY_EXIT single entry validation
- **WHEN** user attempts to create second entry for ENTRY_EXIT project on the same date
- **THEN** response is `{ "error": { "code": "VALIDATION_001", "message": "Only one entry per day allowed for ENTRY_EXIT projects" } }` with status 400

#### Scenario: ENTRY_EXIT duration validation
- **WHEN** user creates entry for ENTRY_EXIT project
- **THEN** system validates that duration equals 540 minutes with tolerance of ±5 minutes for rounding (535-545 minutes accepted)

#### Scenario: ENTRY_EXIT single entry per project
- **WHEN** user has tasks from multiple ENTRY_EXIT projects
- **THEN** user can create one entry per ENTRY_EXIT project per day (restriction is per-project, not global)

#### Scenario: ENTRY_EXIT multiple projects same day
- **WHEN** user creates entry for ENTRY_EXIT project A, then attempts entry for ENTRY_EXIT project B on same date
- **THEN** second entry is created successfully (one entry per project allowed)

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

#### Scenario: Cannot change workDate on update
- **WHEN** user attempts to update entry with different `workDate`
- **THEN** response is validation error with status 400 (workDate is immutable)

#### Scenario: Can change taskId on update
- **WHEN** user updates entry with different `taskId` (assigned to user)
- **THEN** entry is updated with new task and workday summary is recalculated

#### Scenario: Cannot change to unassigned task
- **WHEN** user attempts to update entry with `taskId` not assigned to them
- **THEN** response is `{ "error": { "code": "VALIDATION_001", "message": "Task not assigned" } }` with status 400

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

#### Scenario: Batch same date requirement
- **WHEN** user submits batch entries
- **THEN** all entries must have the same `workDate` (validation error if mixed dates)

#### Scenario: Batch time overlap detection
- **WHEN** batch entries have overlapping time ranges for the same task
- **THEN** system validates and rejects batch with error indicating overlapping times

#### Scenario: Batch entries can overlap for different tasks
- **WHEN** batch entries have overlapping time ranges but for different tasks
- **THEN** entries are created successfully (overlaps allowed across different tasks)

#### Scenario: Batch ENTRY_EXIT restriction
- **WHEN** batch includes entries for ENTRY_EXIT project
- **THEN** batch is rejected (ENTRY_EXIT projects allow only one entry per day)

#### Scenario: Batch with mixed report types allowed
- **WHEN** batch includes entries for both TOTAL_HOURS and ENTRY_EXIT projects
- **THEN** entries are validated according to their respective project's reportType rules (ENTRY_EXIT entries must be one per project per day)

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
