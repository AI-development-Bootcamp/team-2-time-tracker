# Admin Reports Capability

## ADDED Requirements

### Requirement: Admin Dashboard
The system SHALL provide an admin dashboard with overview statistics and key metrics.

#### Scenario: Dashboard overview
- **WHEN** admin requests `GET /admin/reports/dashboard`
- **THEN** response contains active users count, active projects count, today's statistics, and month completion rate

#### Scenario: Today's statistics
- **WHEN** dashboard is requested
- **THEN** response includes count of users currently working, absent, and late

#### Scenario: Month completion rate
- **WHEN** dashboard is requested
- **THEN** response includes percentage of submitted workdays for the current month

### Requirement: User Monthly Report
The system SHALL provide detailed monthly reports for individual users.

#### Scenario: Get monthly report
- **WHEN** admin requests `GET /admin/reports/users/:userId/monthly/:month`
- **THEN** response contains user info, period summary, and daily breakdown with time entries and absences

#### Scenario: Monthly summary calculation
- **WHEN** monthly report is requested
- **THEN** response includes target minutes, actual work minutes, absence minutes, and balance for the month

#### Scenario: Daily breakdown
- **WHEN** monthly report is requested
- **THEN** response includes array of daily summaries with status, minutes, and submission state

### Requirement: CSV Export
The system SHALL allow exporting user monthly reports as CSV files.

#### Scenario: Export monthly report
- **WHEN** admin requests `GET /admin/reports/users/:userId/monthly/:month/export`
- **THEN** response is CSV file with proper headers and Hebrew character support

#### Scenario: CSV format
- **WHEN** CSV is exported
- **THEN** file includes date, work minutes, absence minutes, status, and submission date columns

### Requirement: Admin Time Entry Management
The system SHALL allow admins to view, create, edit, and delete time entries for any user.

#### Scenario: View user time entries
- **WHEN** admin requests `GET /admin/users/:userId/time-entries`
- **THEN** response contains paginated list of user's time entries with filtering options

#### Scenario: Admin edit time entry
- **WHEN** admin submits `PUT /admin/users/:userId/time-entries/:id` with changes
- **THEN** entry is updated and audit log is created

#### Scenario: Admin create time entry
- **WHEN** admin submits `POST /admin/users/:userId/time-entries` with entry data
- **THEN** entry is created for the specified user and audit log is created

#### Scenario: Admin delete time entry
- **WHEN** admin submits `DELETE /admin/users/:userId/time-entries/:id`
- **THEN** entry is soft deleted and audit log is created

#### Scenario: Admin edits bypass month lock
- **WHEN** admin edits entry in a locked month
- **THEN** edit is allowed (admin override) and audit log records the override

### Requirement: Admin Absence Management
The system SHALL allow admins to view, create, and edit absence requests for any user.

#### Scenario: View user absences
- **WHEN** admin requests `GET /admin/users/:userId/absences`
- **THEN** response contains paginated list of user's absence requests

#### Scenario: Admin edit absence
- **WHEN** admin submits `PUT /admin/users/:userId/absences/:id` with changes
- **THEN** absence is updated and audit log is created

#### Scenario: Admin create absence
- **WHEN** admin submits `POST /admin/users/:userId/absences` with absence data
- **THEN** absence is created for the specified user and audit log is created

