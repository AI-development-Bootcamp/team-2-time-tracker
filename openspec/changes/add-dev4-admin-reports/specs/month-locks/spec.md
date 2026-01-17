# Month Locks Capability

## ADDED Requirements

### Requirement: List Month Locks
The system SHALL allow admins to view all month lock records.

#### Scenario: List all locks
- **WHEN** admin requests `GET /admin/month-locks`
- **THEN** response contains all month lock records with lock/unlock history

### Requirement: Check Lock Status
The system SHALL allow checking if a specific month is locked.

#### Scenario: Check month status
- **WHEN** admin requests `GET /admin/month-locks/status/:month`
- **THEN** response indicates whether month is locked and who locked it

#### Scenario: Unlocked month
- **WHEN** month is not locked
- **THEN** response indicates `isLocked: false`

### Requirement: Lock Month
The system SHALL allow admins to lock a month, preventing all edits to workdays and time entries.

#### Scenario: Lock month
- **WHEN** admin submits `POST /admin/month-locks/lock` with month and optional reason
- **THEN** month is locked and audit log is created

#### Scenario: Lock prevents edits
- **WHEN** month is locked
- **THEN** users cannot create, update, or delete time entries for dates in that month

#### Scenario: Lock prevents workday submission
- **WHEN** month is locked
- **THEN** users cannot submit or cancel workdays for dates in that month

#### Scenario: Lock prevents timer start
- **WHEN** month is locked and user attempts to start timer for date in that month
- **THEN** timer start fails with WORKDAY_001 error

#### Scenario: Lock prevents absence edits
- **WHEN** month is locked
- **THEN** users cannot create, update, or delete absences for dates in that month

#### Scenario: Admin override
- **WHEN** admin edits time entry in locked month
- **THEN** edit is allowed (admin override) and audit log records the override

### Requirement: Unlock Month
The system SHALL allow admins to unlock a previously locked month.

#### Scenario: Unlock month
- **WHEN** admin submits `POST /admin/month-locks/unlock` with month and optional reason
- **THEN** month is unlocked and audit log is created

#### Scenario: Unlock restores edits
- **WHEN** month is unlocked
- **THEN** users can again create, update, and delete entries for dates in that month

### Requirement: Lock History
The system SHALL track who locked/unlocked months and when.

#### Scenario: Lock history
- **WHEN** month lock is viewed
- **THEN** response includes lockedByAdminId, lockedAt, unlockedByAdminId, and unlockedAt fields

