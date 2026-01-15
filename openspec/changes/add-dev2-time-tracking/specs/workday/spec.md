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
