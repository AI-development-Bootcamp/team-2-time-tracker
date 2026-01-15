# Documents Capability

## ADDED Requirements

### Requirement: Upload Document to Absence
The system SHALL allow users to upload documents to their absence requests.

#### Scenario: Successful document upload
- **WHEN** user uploads document via `POST /absences/:id/documents` with valid file
- **THEN** file is stored in IDrive e2 at path `/absences/{userId}/{absenceId}/{uuid}-{timestamp}.{ext}`
- **AND** document metadata is saved to `absence_documents` table with file_url, file_name, mime_type, file_size
- **AND** response includes document DTO with id, fileName, mimeType, fileSize, uploadedAt

#### Scenario: File type validation
- **WHEN** user uploads file with type other than PDF, JPG, or PNG
- **THEN** response is `{ "error": { "code": "VALIDATION_001", "message": "Only PDF, JPG, and PNG files are allowed" } }` with status 400

#### Scenario: File size validation
- **WHEN** user uploads file larger than 10MB
- **THEN** response is `{ "error": { "code": "VALIDATION_001", "message": "File size exceeds 10MB limit" } }` with status 400

#### Scenario: Upload to non-existent absence
- **WHEN** user uploads document to absenceId that doesn't exist
- **THEN** response is `{ "error": { "code": "NOT_FOUND" } }` with status 404

#### Scenario: Upload to other user's absence
- **WHEN** user uploads document to absence belonging to another user
- **THEN** response is `{ "error": { "code": "AUTH_003" } }` with status 403

#### Scenario: Status update on upload
- **WHEN** document uploaded to absence with status PENDING_DOCUMENT
- **THEN** absence status is automatically updated to SUBMITTED

#### Scenario: Upload bypasses month lock
- **WHEN** user uploads document to absence in locked month
- **THEN** upload succeeds (month lock validation is bypassed for documents)
- **AND** document is saved successfully

### Requirement: IDrive e2 Storage Integration
The system SHALL use IDrive e2 S3-compatible storage for document files.

#### Scenario: S3-compatible upload with AWS SDK
- **WHEN** document is uploaded
- **THEN** system uses AWS SDK v3 `@aws-sdk/client-s3` to upload to IDrive e2
- **AND** connection uses configured endpoint, access key, secret key, and bucket name

#### Scenario: Unique file naming
- **WHEN** document is uploaded
- **THEN** file name is generated as `{uuid}-{timestamp}.{ext}`
- **AND** prevents file name collisions across all users

#### Scenario: Folder structure
- **WHEN** document is uploaded
- **THEN** file is stored in folder structure `/absences/{userId}/{absenceId}/`
- **AND** enables organized storage and easier cleanup

### Requirement: List Absence Documents
The system SHALL return list of documents attached to an absence request.

#### Scenario: List documents for absence
- **WHEN** user requests `GET /absences/:id/documents`
- **THEN** response contains array of documents with metadata (id, fileName, mimeType, fileSize, uploadedAt)

#### Scenario: List for non-existent absence
- **WHEN** user requests documents for absenceId that doesn't exist
- **THEN** response is `{ "error": { "code": "NOT_FOUND" } }` with status 404

#### Scenario: List for other user's absence
- **WHEN** user requests documents for absence belonging to another user
- **THEN** response is `{ "error": { "code": "AUTH_003" } }` with status 403

### Requirement: Download Document
The system SHALL allow users to download their absence documents.

#### Scenario: Download with signed URL
- **WHEN** user requests `GET /absences/:id/documents/:docId/download`
- **THEN** system generates time-limited signed URL using `@aws-sdk/s3-request-presigner`
- **AND** returns redirect (302) to signed URL OR streams file content directly

#### Scenario: Download authorization
- **WHEN** user attempts to download document not belonging to their absence
- **THEN** response is `{ "error": { "code": "AUTH_003" } }` with status 403

#### Scenario: Download non-existent document
- **WHEN** user requests download for documentId that doesn't exist
- **THEN** response is `{ "error": { "code": "NOT_FOUND" } }` with status 404

### Requirement: Delete Document
The system SHALL allow users to delete documents from their absence requests.

#### Scenario: Successful deletion
- **WHEN** user submits `DELETE /absences/:id/documents/:docId`
- **THEN** file is deleted from IDrive e2 storage
- **AND** record is deleted from `absence_documents` table
- **AND** response is `{ "success": true, "message": "Document deleted" }`

#### Scenario: Status update on deletion
- **WHEN** last document is deleted from SICK absence
- **THEN** absence status is updated to PENDING_DOCUMENT
- **WHEN** last document is deleted from RESERVES absence
- **THEN** absence status is updated to PENDING_DOCUMENT
- **WHEN** last document is deleted from VACATION or OTHER absence
- **THEN** absence status remains SUBMITTED (document not required)

#### Scenario: Delete authorization
- **WHEN** user attempts to delete document not belonging to their absence
- **THEN** response is `{ "error": { "code": "AUTH_003" } }` with status 403

#### Scenario: Delete non-existent document
- **WHEN** user deletes documentId that doesn't exist
- **THEN** response is `{ "error": { "code": "NOT_FOUND" } }` with status 404

#### Scenario: Storage cleanup on delete
- **WHEN** document is deleted
- **THEN** file is removed from IDrive e2
- **AND** if file deletion fails, database record is still deleted
- **AND** error is logged but operation is considered successful

### Requirement: Document Metadata Storage
The system SHALL store document metadata in the database.

#### Scenario: Metadata fields
- **WHEN** document is uploaded
- **THEN** record is created with:
  - `id` (UUID, auto-generated)
  - `absence_request_id` (foreign key to absence_requests)
  - `file_url` (full path to file in IDrive e2)
  - `file_name` (original or custom file name)
  - `mime_type` (e.g., "application/pdf", "image/jpeg", "image/png")
  - `file_size` (in bytes)
  - `uploaded_by_user_id` (foreign key to users)
  - `uploaded_at` (timestamp)

#### Scenario: Cascade delete on absence deletion
- **WHEN** absence request is deleted
- **THEN** related documents in `absence_documents` table are automatically deleted (CASCADE)
- **AND** files in IDrive e2 storage are also deleted

### Requirement: Error Handling
The system SHALL handle storage errors gracefully.

#### Scenario: IDrive e2 connection failure
- **WHEN** upload fails due to IDrive e2 connection error
- **THEN** response is `{ "error": { "code": "SERVER_ERROR", "message": "Storage service unavailable" } }` with status 500
- **AND** error is logged with full details

#### Scenario: IDrive e2 authentication failure
- **WHEN** upload fails due to invalid credentials
- **THEN** response is `{ "error": { "code": "SERVER_ERROR", "message": "Storage authentication failed" } }` with status 500
- **AND** error is logged for admin investigation

#### Scenario: Disk space limitation
- **WHEN** upload fails due to storage quota exceeded
- **THEN** response is `{ "error": { "code": "SERVER_ERROR", "message": "Storage quota exceeded" } }` with status 500

### Requirement: Multipart Upload Support
The system SHALL handle multipart/form-data uploads.

#### Scenario: Multer middleware configuration
- **WHEN** document upload endpoint is called
- **THEN** multer middleware processes multipart/form-data
- **AND** uses memory storage (not disk storage)
- **AND** validates file before saving to IDrive e2

#### Scenario: Form field name
- **WHEN** file is uploaded
- **THEN** form field name is `file`
- **AND** optional field `fileName` can customize the display name

#### Scenario: Custom file name
- **WHEN** user provides `fileName` in form data
- **THEN** custom name is stored in `file_name` column
- **AND** actual storage file name remains `{uuid}-{timestamp}.{ext}`
