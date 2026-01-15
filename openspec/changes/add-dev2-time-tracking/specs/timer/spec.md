# Timer Capability

## ADDED Requirements

### Requirement: Server-Side Timer
The system SHALL track timer state on the server to ensure continuity even if the user closes the browser.

#### Scenario: Timer persists after browser close
- **WHEN** user starts timer and closes browser
- **THEN** timer continues running on server and elapsed time is preserved

#### Scenario: Timer state restored on login
- **WHEN** user logs in with an active timer
- **THEN** timer status shows running with correct elapsed time

### Requirement: Start Timer
The system SHALL allow users to start a timer for the current day only.

#### Scenario: Start timer for today
- **WHEN** user submits `POST /timer/start` with `workDate` as today
- **THEN** timer starts and response contains `id` and `startedAt` timestamp

#### Scenario: Cannot start timer for past date
- **WHEN** user attempts to start timer for a past date
- **THEN** response is validation error with status 400

#### Scenario: Cannot start if timer already running
- **WHEN** user attempts to start timer while one is already running
- **THEN** response is `{ "error": { "code": "TIMER_001", "message": "Timer already running" } }` with status 409

#### Scenario: Cannot start timer if month locked
- **WHEN** user attempts to start timer and the current month is locked
- **THEN** response is `{ "error": { "code": "WORKDAY_001", "message": "Day/Month is locked" } }` with status 400

### Requirement: Stop Timer
The system SHALL allow users to stop a running timer and automatically create a time entry.

#### Scenario: Stop timer creates entry
- **WHEN** user submits `POST /timer/stop` with `taskId`, `location`, and `description`
- **THEN** timer stops and a time entry is created with calculated duration

#### Scenario: Stop requires task selection
- **WHEN** user stops timer without providing `taskId`
- **THEN** response is validation error with status 400

#### Scenario: No active timer
- **WHEN** user attempts to stop timer with no timer running
- **THEN** response is `{ "error": { "code": "TIMER_002", "message": "No active timer" } }` with status 400

### Requirement: Timer Status
The system SHALL return the current timer status including whether running and elapsed time.

#### Scenario: Timer running status
- **WHEN** user requests `GET /timer/status` with active timer
- **THEN** response contains `isRunning: true`, `timer` object, and `elapsedMinutes`

#### Scenario: No timer status
- **WHEN** user requests `GET /timer/status` with no active timer
- **THEN** response contains `isRunning: false` and `timer: null`

### Requirement: Cancel Timer
The system SHALL allow users to cancel a running timer without creating a time entry.

#### Scenario: Cancel discards time
- **WHEN** user submits `DELETE /timer/cancel`
- **THEN** timer is stopped and no time entry is created

### Requirement: Single Active Timer
The system SHALL enforce that each user can have at most one active timer at any time.

#### Scenario: One timer per user
- **WHEN** user has a running timer
- **THEN** starting another timer fails with TIMER_001 error

### Requirement: Timer Banner Display
The system SHALL display a fixed banner at the top of all pages when a timer is running.

#### Scenario: Banner visibility
- **WHEN** timer is running
- **THEN** banner is visible on all pages with elapsed time and stop button

#### Scenario: Real-time update
- **WHEN** timer is running
- **THEN** elapsed time display updates every second

#### Scenario: Pulsing indicator
- **WHEN** timer is running
- **THEN** banner shows animated pulsing indicator to draw attention

#### Scenario: Quick stop action
- **WHEN** user clicks stop button in banner
- **THEN** stop timer modal opens to collect task, location, description

### Requirement: Timer Data Model
The system SHALL store timer data with id, userId, workDate, startedAt, stoppedAt, durationMinutes, and isRunning fields.

#### Scenario: Timer creation
- **WHEN** timer is started
- **THEN** record is created with `isRunning: true`, `startedAt` timestamp, and null `stoppedAt`

#### Scenario: Timer completion
- **WHEN** timer is stopped
- **THEN** record is updated with `isRunning: false`, `stoppedAt` timestamp, and calculated `durationMinutes`
