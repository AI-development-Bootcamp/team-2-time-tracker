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

## ADDED Requirements - Document Management

### Requirement: Document Upload
The system SHALL allow users to upload documents to absence requests.

#### Scenario: Upload document to absence
- **WHEN** user uploads document via `POST /absences/:id/documents`
- **THEN** file is stored in IDrive e2 at path `/absences/{userId}/{absenceId}/{uuid}-{timestamp}.{ext}`
- **AND** document metadata is saved to `absence_documents` table

#### Scenario: File type validation
- **WHEN** user uploads file with unsupported type
- **THEN** response is `{ "error": { "code": "VALIDATION_001", "message": "Invalid file type" } }` with status 400

#### Scenario: File size validation
- **WHEN** user uploads file larger than 10MB
- **THEN** response is `{ "error": { "code": "VALIDATION_001", "message": "File size exceeds 10MB" } }` with status 400

#### Scenario: Upload updates status
- **WHEN** document uploaded to absence with status PENDING_DOCUMENT
- **THEN** absence status changes to SUBMITTED

### Requirement: Document Storage (IDrive e2)
The system SHALL store uploaded documents in IDrive e2 S3-compatible storage.

#### Scenario: S3-compatible upload
- **WHEN** document is uploaded
- **THEN** file is stored using AWS SDK v3 S3 client
- **AND** file URL is stored in `absence_documents.file_url`

#### Scenario: Unique file naming
- **WHEN** document is uploaded
- **THEN** file name is generated as `{uuid}-{timestamp}.{ext}`
- **AND** file path includes userId and absenceId for organization

### Requirement: Document Download
The system SHALL allow users to download their absence documents.

#### Scenario: Download with signed URL
- **WHEN** user requests `GET /absences/:id/documents/:docId/download`
- **THEN** system generates signed URL from IDrive e2
- **AND** returns redirect to signed URL or streams file content

#### Scenario: Download authorization
- **WHEN** user attempts to download document not belonging to them
- **THEN** response is `{ "error": { "code": "AUTH_003" } }` with status 403

### Requirement: Document Deletion
The system SHALL allow users to delete their absence documents.

#### Scenario: Delete document
- **WHEN** user submits `DELETE /absences/:id/documents/:docId`
- **THEN** file is deleted from IDrive e2
- **AND** record is deleted from `absence_documents` table

#### Scenario: Delete updates status
- **WHEN** last document deleted from SICK/RESERVES absence
- **THEN** absence status changes to PENDING_DOCUMENT

### Requirement: Month Lock Exception for Documents
The system SHALL allow document upload even when month is locked.

#### Scenario: Upload to locked month
- **WHEN** user uploads document to absence in locked month
- **THEN** upload succeeds (bypasses month lock validation)
- **AND** document metadata is saved

### Requirement: Document Listing
The system SHALL list all documents attached to an absence request.

#### Scenario: List documents
- **WHEN** user requests `GET /absences/:id/documents`
- **THEN** response contains array of documents with metadata (id, fileName, mimeType, fileSize, uploadedAt)

## ADDED Requirements - UI Components

### Requirement: Hebrew Date Picker
The system SHALL provide Hebrew-localized date picker component.

#### Scenario: Hebrew locale display
- **WHEN** date picker is rendered
- **THEN** month names displayed in Hebrew (e.g., "נובמבר 2025")
- **AND** day names displayed in Hebrew (e.g., "יום א'", "יום ב'")
- **AND** week starts from right (RTL layout)

#### Scenario: Weekend exclusion in UI
- **WHEN** date picker is rendered
- **THEN** Friday and Saturday are disabled and visually distinguished

#### Scenario: Range selection visual feedback
- **WHEN** user selects date range
- **THEN** start and end dates have blue circle
- **AND** dates between have light blue background
- **AND** workday count is displayed (e.g., "סה"כ ימי דיווח: 2 ימים")

### Requirement: Document Uploader Component
The system SHALL provide drag-and-drop document uploader.

#### Scenario: Drag-and-drop upload
- **WHEN** user drags file over dropzone
- **THEN** dropzone shows visual feedback
- **WHEN** user drops file
- **THEN** file validation runs
- **AND** upload starts if valid

#### Scenario: Upload progress display
- **WHEN** document is uploading
- **THEN** progress indicator is displayed
- **AND** upload can be tracked by user

#### Scenario: Document status display
- **WHEN** no document uploaded
- **THEN** UI displays "חסר קובץ"
- **WHEN** document uploaded
- **THEN** UI displays file name with appropriate icon

### Requirement: Absence Type Dropdown
The system SHALL display absence types with emoji icons.

#### Scenario: Type selection with emojis
- **WHEN** dropdown is opened
- **THEN** options displayed with emojis:
  - "מחלה 😷"
  - "חופשה 🏝️"
  - "חצי יום ⏰"
  - "יום מלא 🗓️"
  - "מילואים 🪖"

### Requirement: Mobile-First Responsive Design
The system SHALL provide mobile-optimized absence reporting interface.

#### Scenario: Mobile layout
- **WHEN** UI is rendered on mobile device
- **THEN** components are optimized for touch interaction
- **AND** layout adapts to small screen size
- **AND** all interactive elements have sufficient touch target size (min 44x44px)
