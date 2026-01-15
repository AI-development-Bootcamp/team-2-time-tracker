# Absences Capability

## ADDED Requirements

### Requirement: Create Absence Request
The system SHALL allow users to create absence requests with type, date range, and half/full day option.

#### Scenario: Create vacation absence
- **WHEN** user submits `POST /absences` with `type: VACATION`, `startDate`, `endDate`, `isHalfDay: false`
- **THEN** absence request is created and individual absence days are generated

#### Scenario: Create sick leave without document
- **WHEN** user creates absence with `type: SICK` and no document attached
- **THEN** absence status is set to `PENDING_DOCUMENT`

#### Scenario: Create military reserves without document
- **WHEN** user creates absence with `type: RESERVES` and no document attached
- **THEN** absence status is set to `PENDING_DOCUMENT`

#### Scenario: Locked month blocks creation
- **WHEN** user attempts to create absence in a locked month
- **THEN** response is `{ "error": { "code": "WORKDAY_001" } }` with status 400

### Requirement: Absence Types
The system SHALL support four absence types: VACATION, SICK, RESERVES, and OTHER.

#### Scenario: Type validation
- **WHEN** user submits absence with invalid type
- **THEN** response is validation error with status 400

### Requirement: Absence Status Tracking
The system SHALL track absence status as SUBMITTED or PENDING_DOCUMENT.

#### Scenario: Status SUBMITTED
- **WHEN** absence type is VACATION/OTHER, or SICK/RESERVES with document
- **THEN** status is `SUBMITTED`

#### Scenario: Status PENDING_DOCUMENT
- **WHEN** absence type is SICK/RESERVES without document
- **THEN** status is `PENDING_DOCUMENT`

#### Scenario: Status updated on document upload
- **WHEN** document is uploaded to PENDING_DOCUMENT absence
- **THEN** status changes to `SUBMITTED`

### Requirement: Date Range Expansion
The system SHALL expand absence date ranges to individual workdays, excluding Friday and Saturday.

#### Scenario: Expand weekday range
- **WHEN** absence spans Sunday to Thursday
- **THEN** 5 individual absence_days records are created

#### Scenario: Exclude Friday-Saturday
- **WHEN** absence spans Thursday to Sunday
- **THEN** only Thursday and Sunday absence_days are created (Friday-Saturday excluded)

#### Scenario: Single day absence
- **WHEN** startDate equals endDate
- **THEN** one absence_day record is created

### Requirement: Half-Day Absences
The system SHALL support half-day absences with 270 minutes allocation per day.

#### Scenario: Half-day absence
- **WHEN** absence is created with `isHalfDay: true`
- **THEN** each absence_day has `minutes: 270`

#### Scenario: Full-day absence
- **WHEN** absence is created with `isHalfDay: false`
- **THEN** each absence_day has `minutes: 540`

### Requirement: List User Absences
The system SHALL return paginated list of the user's absence requests.

#### Scenario: List absences
- **WHEN** user requests `GET /absences`
- **THEN** response contains paginated list of user's absences with documents

### Requirement: Get Single Absence
The system SHALL return a single absence request with all related days and documents.

#### Scenario: Get absence details
- **WHEN** user requests `GET /absences/:id`
- **THEN** response contains absence with `absenceDays` and `documents` arrays

### Requirement: Update Absence Request
The system SHALL allow users to update their absence requests if month is not locked.

#### Scenario: Update absence dates
- **WHEN** user submits `PUT /absences/:id` with new dates
- **THEN** absence_days are recalculated for new range

#### Scenario: Locked month blocks update
- **WHEN** user attempts to update absence in locked month
- **THEN** response is `{ "error": { "code": "WORKDAY_001" } }` with status 400

### Requirement: Delete Absence Request
The system SHALL allow users to delete absence requests if month is not locked.

#### Scenario: Delete absence
- **WHEN** user submits `DELETE /absences/:id`
- **THEN** absence request and related absence_days are deleted

#### Scenario: Delete updates workday
- **WHEN** absence is deleted
- **THEN** workday summaries are recalculated for affected dates

### Requirement: No Overlapping Absences
The system SHALL prevent creating absences that overlap with existing absences.

#### Scenario: Overlapping dates rejected
- **WHEN** user creates absence overlapping with existing absence
- **THEN** response is `{ "error": { "code": "VALIDATION_002", "message": "Overlapping absence" } }` with status 400

### Requirement: Workday Integration
The system SHALL update workday summaries when absences are created, updated, or deleted.

#### Scenario: Absence adds to workday
- **WHEN** absence_day is created
- **THEN** workday's `absenceMinutes` increases by the day's minutes

#### Scenario: Absence deletion updates workday
- **WHEN** absence is deleted
- **THEN** workday's `absenceMinutes` decreases by removed minutes

### Requirement: Israeli Workweek Support
The system SHALL use Israeli workweek (Sunday-Thursday) for absence calculations.

#### Scenario: Friday excluded
- **WHEN** absence includes a Friday
- **THEN** Friday is excluded from absence_days

#### Scenario: Saturday excluded
- **WHEN** absence includes a Saturday
- **THEN** Saturday is excluded from absence_days

### Requirement: Absence Data Model
The system SHALL store absence requests with id, userId, type, startDate, endDate, isHalfDay, status, note, and timestamps.

#### Scenario: Absence request creation
- **WHEN** absence is created
- **THEN** record is stored with auto-generated UUID and timestamps

### Requirement: Absence Day Data Model
The system SHALL store individual absence days with id, absenceRequestId, userId, workDate, minutes, and timestamps.

#### Scenario: Absence day linkage
- **WHEN** absence request is created
- **THEN** absence_days are linked via `absenceRequestId` foreign key

#### Scenario: Cascade delete
- **WHEN** absence request is deleted
- **THEN** related absence_days are automatically deleted (CASCADE)
