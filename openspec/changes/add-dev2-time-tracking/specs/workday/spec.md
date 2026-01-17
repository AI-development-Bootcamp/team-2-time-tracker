# Workday Capability

## ADDED Requirements

### Requirement: Daily Workday Summary
The system SHALL provide a daily summary showing time entries, absences, and allocation status.

#### Scenario: Get workday summary
- **WHEN** user requests `GET /workday/:date`
- **THEN** response contains `date`, `status`, `isLocked`, `isSubmitted`, `summary`, `timeEntries`, and `absences`

#### Scenario: Summary calculation
- **WHEN** workday summary is retrieved
- **THEN** `summary` contains `targetMinutes: 540`, `workMinutes`, `absenceMinutes`, `totalMinutes`, `balanceMinutes`, `completionPercentage`

### Requirement: Workday Status Indicator
The system SHALL calculate workday status based on total allocated minutes.

#### Scenario: Missing status
- **WHEN** `totalMinutes` (work + absence) is less than 540
- **THEN** status is `MISSING`

#### Scenario: Full status
- **WHEN** `totalMinutes` equals 540
- **THEN** status is `FULL`

#### Scenario: Exception status
- **WHEN** `totalMinutes` exceeds 540
- **THEN** status is `EXCEPTION`

### Requirement: Workday Status Calculation Timing
The system SHALL calculate workday status whenever workday summary is retrieved or when entries/absences are created, updated, or deleted.

#### Scenario: Status calculated on retrieval
- **WHEN** workday summary is retrieved via `GET /workday/:date`
- **THEN** status is calculated based on current `totalMinutes` value

#### Scenario: Status updated on entry change
- **WHEN** time entry is created, updated, or deleted
- **THEN** workday status is recalculated and updated in database

#### Scenario: Status updated on absence change
- **WHEN** absence is created, updated, or deleted
- **THEN** workday status is recalculated and updated in database

### Requirement: Submit Workday
The system SHALL allow users to submit a workday only when exactly 540 minutes are allocated.

#### Scenario: Submit complete day
- **WHEN** user submits `POST /workday/:date/submit` with `totalMinutes` equal to 540
- **THEN** workday is marked as submitted with timestamp

#### Scenario: Submit incomplete day blocked
- **WHEN** user attempts to submit with `totalMinutes` not equal to 540
- **THEN** response is `{ "error": { "code": "WORKDAY_002", "message": "Not fully allocated" } }` with status 400

#### Scenario: Submit locked month blocked
- **WHEN** user attempts to submit in a locked month
- **THEN** response is `{ "error": { "code": "WORKDAY_001", "message": "Day/Month is locked" } }` with status 400

#### Scenario: Already submitted blocked
- **WHEN** user attempts to submit an already submitted day
- **THEN** response is `{ "error": { "code": "WORKDAY_003", "message": "Already submitted" } }` with status 400

#### Scenario: Submit with timer running blocked
- **WHEN** user attempts to submit workday while timer is still running
- **THEN** response is `{ "error": { "code": "TIMER_001", "message": "Timer must be stopped before submitting workday" } }` with status 409

### Requirement: Cancel Workday Submission
The system SHALL allow users to cancel a submitted workday if the month is not locked.

#### Scenario: Cancel submission
- **WHEN** user submits `POST /workday/:date/cancel` for a submitted day
- **THEN** workday submission is cancelled

#### Scenario: Cancel unsubmitted blocked
- **WHEN** user attempts to cancel a day that is not submitted
- **THEN** response is `{ "error": { "code": "WORKDAY_004", "message": "Day not submitted" } }` with status 400

#### Scenario: Cancel locked month blocked
- **WHEN** user attempts to cancel in a locked month
- **THEN** response is `{ "error": { "code": "WORKDAY_001" } }` with status 400

### Requirement: Monthly Calendar View
The system SHALL provide a monthly calendar view showing daily status for each workday.

#### Scenario: Get monthly calendar
- **WHEN** user requests `GET /workday/calendar/:month` with format `YYYY-MM`
- **THEN** response contains array of `CalendarDayDto` for each day and monthly summary

#### Scenario: Calendar day status
- **WHEN** calendar is retrieved
- **THEN** each day shows `date`, `status`, `isLocked`, `isSubmitted`, `minutes`

#### Scenario: Calendar shows all days
- **WHEN** monthly calendar is requested
- **THEN** response includes all days of the month, including weekends

#### Scenario: Weekend display
- **WHEN** calendar includes Friday or Saturday
- **THEN** those days show `status: EXCEPTION` or special indicator (not counted in workday calculations)

#### Scenario: Calendar workday filtering
- **WHEN** calendar is displayed
- **THEN** only Sunday-Thursday days are included in workday calculations and status indicators

### Requirement: Workday Progress Display
The system SHALL display a visual progress indicator showing daily hour allocation status.

#### Scenario: Incomplete display (red)
- **WHEN** `totalMinutes` is less than 540
- **THEN** progress indicator is red

#### Scenario: Complete display (green)
- **WHEN** `totalMinutes` equals 540
- **THEN** progress indicator is green

#### Scenario: Over-reported display (orange)
- **WHEN** `totalMinutes` exceeds 540
- **THEN** progress indicator is orange

### Requirement: Workday Target
The system SHALL use 540 minutes (9 hours) as the standard daily target.

#### Scenario: Default target
- **WHEN** workday summary is created
- **THEN** `targetMinutes` defaults to 540

### Requirement: Workday Data Model
The system SHALL store workday summaries with userId, workDate, targetMinutes, workMinutes, absenceMinutes, status, isLocked, lockedMonthId, isSubmitted, submittedAt, and timestamps.

#### Scenario: Workday creation
- **WHEN** first entry or absence is created for a date
- **THEN** workday summary is automatically created if not exists

#### Scenario: Lock propagation
- **WHEN** month is locked
- **THEN** all workdays in that month have `isLocked: true` and `lockedMonthId` set

#### Scenario: Lock propagation timing
- **WHEN** month is locked
- **THEN** all existing workdays in that month are immediately updated with `isLocked: true`

#### Scenario: New workday in locked month
- **WHEN** user attempts to create entry/absence in locked month
- **THEN** creation is blocked before workday summary would be created

#### Scenario: Workday auto-creation
- **WHEN** first time entry or absence is created for a date
- **THEN** workday summary is automatically created with default values

#### Scenario: Workday view before entries
- **WHEN** user requests workday for a date with no entries or absences
- **THEN** response contains calculated workday summary with `workMinutes: 0`, `absenceMinutes: 0`, `status: MISSING` (workday record is created on-the-fly, not persisted until first entry/absence)
