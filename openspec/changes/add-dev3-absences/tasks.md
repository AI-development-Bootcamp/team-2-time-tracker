# Tasks: Developer 3 - Absences & Document Management

## Overview

This document contains **detailed implementation tasks** for the Absences & Document Management feature. The implementation includes:

- **Backend**: RESTful API endpoints, business logic, IDrive e2 integration
- **Frontend**: Mobile-first UI components with Hebrew/RTL support
- **Database**: Prisma models for absence requests, days, and documents
- **File Storage**: IDrive e2 (S3-compatible) for document uploads
- **Testing**: Unit and integration tests (60% coverage minimum)

### Key Features
✅ Single-day and date-range absence reporting
✅ Hebrew date picker with Israeli workweek (Sun-Thu)
✅ Document upload (PDF, JPG, PNG) up to 10MB
✅ Automatic workday expansion (excludes Fri/Sat)
✅ Half-day (270 min) and full-day (540 min) support
✅ Status tracking: `PENDING_DOCUMENT` / `SUBMITTED`
✅ Month lock validation
✅ RTL/Hebrew UI with mobile-first design

### Screenshots Reference
UI designs are located in `/Screenshots`:
- `דיווח העדרות ידני יום בודד.png` - Single day absence form
- `דיווח לפי טווח ימים.png` - Date range absence form
- `דרופ דאון פתוח.png` - Absence type dropdown
- `העדרות לפי ימים קלנדר פתוח.png` - Calendar with single selection
- `קלנדר עם טווח בחירה.png` - Calendar with range selection

---

## 1. Database Schema

### 1.1 Prisma Models
- [x] 1.1.1 Add AbsenceRequest model to `prisma/schema.prisma`
- [x] 1.1.2 Add AbsenceDay model (expanded workdays)
- [x] 1.1.3 Add AbsenceDocument model
- [x] 1.1.4 Create migration for absence tables
- [x] 1.1.5 Add indexes for query optimization

## 2. Absences Implementation

### 2.1 Backend Absences Module
- [x] 2.1.1 Create `absences.routes.ts`
- [x] 2.1.2 Create `absences.controller.ts`
- [x] 2.1.3 Create `absences.service.ts`
- [x] 2.1.4 Create `absences.repo.ts`

### 2.2 Absence Endpoints
- [x] 2.2.1 Implement `POST /absences` (create absence request)
- [x] 2.2.2 Implement `GET /absences` (list user's absences)
- [x] 2.2.3 Implement `GET /absences/:id` (get single absence)
- [x] 2.2.4 Implement `PUT /absences/:id` (update absence)
- [x] 2.2.5 Implement `DELETE /absences/:id` (delete absence)

### 2.3 Absence Business Logic
- [x] 2.3.1 Implement date range expansion algorithm
- [x] 2.3.2 Exclude Friday-Saturday (Israeli weekend)
- [x] 2.3.3 Calculate half-day (270) vs full-day (540) minutes (only for VACATION)
- [x] 2.3.4 Set status to PENDING_DOCUMENT for SICK/RESERVES without document
- [x] 2.3.5 Validate month not locked before create/update/delete
- [x] 2.3.6 Validate no overlapping absences
- [x] 2.3.7 Update workday summaries on absence CRUD

### 2.4 UI Design System Components
- [x] 2.4.1 Create base UI components (if not exist in `client/packages/ui/`)
  - [x] 2.4.1.1 DatePicker component with Hebrew locale (react-day-picker)
  - [x] 2.4.1.2 Dropdown/Select component with RTL support
  - [x] 2.4.1.3 Button component (primary/secondary variants)
  - [x] 2.4.1.4 Modal/Sheet component for mobile
  - [x] 2.4.1.5 Tabs component (for "דיווח עבודה" / "דיווח העדרות")

### 2.5 Absence Form Component (`AbsenceForm.tsx`)
- [x] 2.5.1 Create form structure with react-hook-form + Zod validation
- [x] 2.5.2 Implement tab switching between "דיווח עבודה" and "דיווח העדרות"
- [x] 2.5.3 Add absence type dropdown with 4 options:
  - [x] 2.5.3.1 "חופשה - חצי יום 🏖️" (VACATION + isHalfDay=true)
  - [x] 2.5.3.2 "חופשה - יום מלא 🏖️" (VACATION + isHalfDay=false)
  - [x] 2.5.3.3 "מחלה 😷" (SICK, always full day)
  - [x] 2.5.3.4 "מילואים 🚨" (RESERVES, always full day)
  - [x] 2.5.3.5 Display emoji icons for each option
  - [x] 2.5.3.6 Implement dropdown open/close states
  - [x] 2.5.3.7 Add selected value display with emoji
- [x] 2.5.4 Implement single date selection mode
  - [x] 2.5.4.1 Show single date input field
  - [x] 2.5.4.2 Open calendar picker on click
  - [x] 2.5.4.3 Display selected date in Hebrew format (DD/MM/YY)
- [x] 2.5.5 Implement date range selection mode ("מלא את הזמנים" section)
  - [x] 2.5.5.1 Add "תאריך התחלה" input field
  - [x] 2.5.5.2 Add "תאריך סיום" input field
  - [x] 2.5.5.3 Show calendar with range selection
  - [x] 2.5.5.4 Highlight selected range in calendar (blue background)
  - [x] 2.5.5.5 Display calculated workdays count ("סה"כ ימי דיווח: 2 ימים")
  - [x] 2.5.5.6 Show "שמירה" and "ניקה" buttons in calendar modal
- [x] 2.5.6 Implement document upload section ("צירוף קבצים רלוונטים")
  - [x] 2.5.6.1 Create dropzone area with dashed border
  - [x] 2.5.6.2 Show upload icon and text "לחץ כאן להעלאת הקובץ"
  - [x] 2.5.6.3 Display supported formats (PDF / PNG / JPG)
  - [x] 2.5.6.4 Show "חסר קובץ" when no document attached
  - [x] 2.5.6.5 Show uploaded document with file name when document exists
- [x] 2.5.7 Add note/description field (או)
- [x] 2.5.8 Add submit button ("שמירה") with validation
- [x] 2.5.9 Add close button (X) in top-left corner
- [x] 2.5.10 Implement mobile-responsive layout
- [x] 2.5.11 Add RTL support for all form elements

### 2.6 Hebrew Date Picker Component (`HebrewDatePicker.tsx`)
- [x] 2.6.1 Configure react-day-picker with Hebrew locale (date-fns)
- [x] 2.6.2 Display Hebrew month names (נובמבר 2025)
- [x] 2.6.3 Display Hebrew day names (יום א', יום ב', etc.)
- [x] 2.6.4 Implement single date selection mode
  - [x] 2.6.4.1 Highlight selected date with blue circle
  - [x] 2.6.4.2 Show navigation arrows (< >)
- [x] 2.6.5 Implement date range selection mode
  - [x] 2.6.5.1 Allow start date selection (blue circle)
  - [x] 2.6.5.2 Allow end date selection (blue circle)
  - [x] 2.6.5.3 Highlight range between dates (light blue background)
  - [x] 2.6.5.4 Display current month/year header with navigation
- [x] 2.6.6 Exclude Friday-Saturday (disable non-workdays)
- [x] 2.6.7 Add modal presentation for mobile
- [x] 2.6.8 Implement RTL layout (week starts from right)

### 2.7 Document Uploader Component (`DocumentUploader.tsx`)
- [x] 2.7.1 Integrate react-dropzone for drag-and-drop
- [x] 2.7.2 Create dropzone UI with dashed border (blue)
- [x] 2.7.3 Add upload icon (folder with arrow)
- [x] 2.7.4 Display "לחץ כאן להעלאת הקובץ" text
- [x] 2.7.5 Show supported file types (PDF / PNG / JPG)
- [x] 2.7.6 Validate file type (PDF, JPG, PNG only)
- [x] 2.7.7 Validate file size (max 10MB)
- [x] 2.7.8 Show upload progress indicator during upload
- [x] 2.7.9 Display uploaded document state
  - [x] 2.7.9.1 Show file name when uploaded
  - [x] 2.7.9.2 Show appropriate icon for file type
  - [x] 2.7.9.3 Change dropzone appearance when file exists
- [x] 2.7.10 Show "חסר קובץ" message when required but missing
- [x] 2.7.11 Add error handling for failed uploads

### 2.8 Absence Page (`AbsencePage.tsx`)
- [x] 2.8.1 Create page layout with mobile-first design
- [x] 2.8.2 Add page header "דיווח העדרות"
- [x] 2.8.3 Add sub-header based on mode:
  - [x] 2.8.3.1 "יום בודד" for single date
  - [x] 2.8.3.2 "לפי טווח ימים" for date range
- [x] 2.8.4 Integrate AbsenceForm component
- [x] 2.8.5 Add bottom "Search zone" section (pink background)
- [ ] 2.8.6 Implement form submission logic (TODO: wire up actual API calls)
- [x] 2.8.7 Add success/error notifications
- [x] 2.8.8 Handle navigation back on success

### 2.9 Absence Store (`absence.store.ts`)
- [x] 2.9.1 Create Zustand store for absence state
- [x] 2.9.2 Add state for form mode (single date / date range)
- [x] 2.9.3 Add state for selected absence type
- [x] 2.9.4 Add state for selected date(s)
- [x] 2.9.5 Add state for uploaded document
- [x] 2.9.6 Add actions for creating absence
- [x] 2.9.7 Add actions for uploading document
- [x] 2.9.8 Integrate with TanStack Query for API calls

### 2.10 API Integration (`client/apps/employee/src/api/absencesApi.ts`)
- [x] 2.10.1 Create API client methods using axios
  - [x] 2.10.1.1 `createAbsence(data)` - POST /absences
  - [x] 2.10.1.2 `getAbsences(params)` - GET /absences
  - [x] 2.10.1.3 `getAbsenceById(id)` - GET /absences/:id
  - [x] 2.10.1.4 `updateAbsence(id, data)` - PUT /absences/:id
  - [x] 2.10.1.5 `deleteAbsence(id)` - DELETE /absences/:id
- [x] 2.10.2 Create document upload methods
  - [x] 2.10.2.1 `uploadDocument(absenceId, file)` - POST /absences/:id/documents (multipart/form-data)
  - [x] 2.10.2.2 `getDocuments(absenceId)` - GET /absences/:id/documents
  - [x] 2.10.2.3 `downloadDocument(absenceId, docId)` - GET /absences/:id/documents/:docId/download
  - [x] 2.10.2.4 `deleteDocument(absenceId, docId)` - DELETE /absences/:id/documents/:docId
- [x] 2.10.3 Create TanStack Query hooks
  - [x] 2.10.3.1 `useCreateAbsence()` mutation hook
  - [x] 2.10.3.2 `useAbsences()` query hook with pagination
  - [x] 2.10.3.3 `useAbsenceById(id)` query hook
  - [x] 2.10.3.4 `useUploadDocument()` mutation hook with progress tracking
  - [x] 2.10.3.5 `useDeleteDocument()` mutation hook
- [x] 2.10.4 Add error handling and Hebrew error messages
- [x] 2.10.5 Add loading states for all operations
- [x] 2.10.6 Configure query invalidation on mutations

## 3. Document Management

### 3.1 IDrive e2 Storage Setup
- [ ] 3.1.1 Install AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- [ ] 3.1.2 Create `server/src/config/storage.ts` configuration file
  - [ ] 3.1.2.1 Configure S3-compatible client for IDrive e2
  - [ ] 3.1.2.2 Add environment variables (IDRIVE_ACCESS_KEY, IDRIVE_SECRET_KEY, IDRIVE_BUCKET, IDRIVE_ENDPOINT)
  - [ ] 3.1.2.3 Add region configuration
  - [ ] 3.1.2.4 Validate credentials on startup
- [ ] 3.1.3 Create `server/src/shared/storage.service.ts`
  - [ ] 3.1.3.1 Implement `uploadFile(file, path)` method
  - [ ] 3.1.3.2 Implement `deleteFile(fileUrl)` method
  - [ ] 3.1.3.3 Implement `getSignedUrl(fileUrl)` method for downloads
  - [ ] 3.1.3.4 Add error handling for storage operations
- [ ] 3.1.4 Create folder structure in bucket (`/absences/{userId}/{absenceId}/`)
- [ ] 3.1.5 Generate unique file names (UUID + timestamp + original extension)

### 3.2 Backend Documents Module
- [ ] 3.2.1 Create `server/src/modules/absences/absences.documents.ts`
- [ ] 3.2.2 Configure multer middleware for memory storage
  - [ ] 3.2.2.1 Set file size limit (10MB)
  - [ ] 3.2.2.2 Add file type filter (PDF, JPG, PNG)
  - [ ] 3.2.2.3 Add custom error messages in Hebrew
- [ ] 3.2.3 Create `server/src/config/upload.ts` for upload configuration

### 3.3 Document Endpoints
- [ ] 3.3.1 Implement `POST /absences/:id/documents` (upload document)
  - [ ] 3.3.1.1 Add multer middleware for file handling
  - [ ] 3.3.1.2 Validate absence exists and belongs to user
  - [ ] 3.3.1.3 Upload file to IDrive e2 using storage.service
  - [ ] 3.3.1.4 Save document metadata to absence_documents table
  - [ ] 3.3.1.5 Update absence status to SUBMITTED if was PENDING_DOCUMENT
  - [ ] 3.3.1.6 Return document DTO with file_url
- [ ] 3.3.2 Implement `GET /absences/:id/documents` (list documents)
  - [ ] 3.3.2.1 Validate absence belongs to user
  - [ ] 3.3.2.2 Return list of documents with metadata
- [ ] 3.3.3 Implement `GET /absences/:id/documents/:docId/download` (download)
  - [ ] 3.3.3.1 Validate user has access to document
  - [ ] 3.3.3.2 Generate signed URL from IDrive e2
  - [ ] 3.3.3.3 Return redirect to signed URL or stream file
- [ ] 3.3.4 Implement `DELETE /absences/:id/documents/:docId` (delete)
  - [ ] 3.3.4.1 Validate user owns the document
  - [ ] 3.3.4.2 Delete file from IDrive e2
  - [ ] 3.3.4.3 Delete record from absence_documents table
  - [ ] 3.3.4.4 Update absence status to PENDING_DOCUMENT if needed

### 3.4 Document Business Logic
- [ ] 3.4.1 Validate file types (PDF, JPG, PNG only) in multer middleware
- [ ] 3.4.2 Validate file size (max 10MB) in multer middleware
- [ ] 3.4.3 Generate unique file paths: `/absences/{userId}/{absenceId}/{uuid}-{timestamp}.{ext}`
- [ ] 3.4.4 Update absence status logic:
  - [ ] 3.4.4.1 When document uploaded for PENDING_DOCUMENT → change to SUBMITTED
  - [ ] 3.4.4.2 When last document deleted for SICK/RESERVES → change to PENDING_DOCUMENT
- [ ] 3.4.5 Allow document upload even if month is locked (bypass lock validation)
- [ ] 3.4.6 Add security checks: verify user can only access their own documents

## 4. Styling & Responsive Design

### 4.1 CSS Modules / BEM Styles
- [ ] 4.1.1 Create `AbsenceForm.module.css`
  - [ ] 4.1.1.1 Mobile-first responsive layout
  - [ ] 4.1.1.2 RTL support for form elements
  - [ ] 4.1.1.3 Tab switcher styles
  - [ ] 4.1.1.4 Dropdown styles with emoji support
  - [ ] 4.1.1.5 Date input field styles
  - [ ] 4.1.1.6 Button styles (primary: dark blue #2C3E50, secondary: white)
- [ ] 4.1.2 Create `HebrewDatePicker.module.css`
  - [ ] 4.1.2.1 Calendar modal styles
  - [ ] 4.1.2.2 Date cell styles (selected: blue circle, range: light blue background)
  - [ ] 4.1.2.3 RTL layout (week starts from right)
  - [ ] 4.1.2.4 Header navigation styles
  - [ ] 4.1.2.5 Disabled days styles (Friday-Saturday)
- [ ] 4.1.3 Create `DocumentUploader.module.css`
  - [ ] 4.1.3.1 Dropzone styles (dashed border: blue)
  - [ ] 4.1.3.2 Upload icon styles
  - [ ] 4.1.3.3 File type text styles
  - [ ] 4.1.3.4 Uploaded file display styles
  - [ ] 4.1.3.5 Progress indicator styles
- [ ] 4.1.4 Create `AbsencePage.module.css`
  - [ ] 4.1.4.1 Page header styles
  - [ ] 4.1.4.2 "Search zone" bottom section (pink background)
  - [ ] 4.1.4.3 Close button (X) styles
  - [ ] 4.1.4.4 Mobile-responsive layout

### 4.2 Theme Integration
- [ ] 4.2.1 Use existing color palette from design system
- [ ] 4.2.2 Ensure consistency with other pages
- [ ] 4.2.3 Add dark mode support (if applicable)

## 5. Israeli Workweek Logic

### 5.1 Date Utilities (`client/packages/utils/src/date.ts`)
- [ ] 5.1.1 Create `isIsraeliWorkday(date)` utility (Sun-Thu, returns boolean)
- [ ] 5.1.2 Create `expandDateRange(startDate, endDate)` utility (returns Date[])
- [ ] 5.1.3 Create `getWorkdaysInRange(startDate, endDate)` utility (excludes Fri/Sat)
- [ ] 5.1.4 Create `calculateWorkdayCount(startDate, endDate)` utility
- [ ] 5.1.5 Add unit tests for date utilities

### 5.2 Hebrew Locale Configuration
- [ ] 5.2.1 Install date-fns with Hebrew locale (`date-fns/locale/he`)
- [ ] 5.2.2 Configure date-fns Hebrew locale globally
- [ ] 5.2.3 Create date formatting utilities
  - [ ] 5.2.3.1 `formatHebrewDate(date)` - returns "DD/MM/YY"
  - [ ] 5.2.3.2 `formatHebrewMonthYear(date)` - returns "נובמבר 2025"
  - [ ] 5.2.3.3 `formatHebrewDayName(date)` - returns "יום א'"
- [ ] 5.2.4 Configure react-day-picker with Hebrew locale

## 6. Shared DTOs

### 6.1 Add DTOs to @shared/types
- [x] 6.1.1 Create `absences.dto.ts` with all DTOs
  - [x] 6.1.1.1 `CreateAbsenceRequestDto`
  - [x] 6.1.1.2 `UpdateAbsenceRequestDto`
  - [x] 6.1.1.3 `AbsenceRequestDto`
  - [x] 6.1.1.4 `AbsenceDayDto`
  - [x] 6.1.1.5 `AbsenceDocumentDto`
  - [x] 6.1.1.6 `ListAbsencesResponseDto`
  - [x] 6.1.1.7 `CreateAbsenceResponseDto`
  - [x] 6.1.1.8 `UploadAbsenceDocumentResponseDto`
- [x] 6.1.2 Create Zod schemas for absence validation
  - [x] 6.1.2.1 `createAbsenceSchema` (type, startDate, endDate, isHalfDay, note)
  - [x] 6.1.2.2 `updateAbsenceSchema`
  - [x] 6.1.2.3 Validate date range (endDate >= startDate)
  - [x] 6.1.2.4 Validate note max length (500 chars)
- [x] 6.1.3 Add AbsenceType enum (`VACATION`, `SICK`, `RESERVES`) - 3 types only
- [x] 6.1.4 Add AbsenceStatus enum (`PENDING_DOCUMENT`, `SUBMITTED`)
- [x] 6.1.5 Export all types from `@shared/types` index

## 7. Testing

### 7.1 Backend Tests
- [x] 7.1.1 Write unit tests for absences.service.ts
  - [x] 7.1.1.1 Test date range expansion (single day, multi-day, with weekends)
  - [x] 7.1.1.2 Test workday calculation (excludes Fri/Sat)
  - [x] 7.1.1.3 Test half-day vs full-day minutes calculation
  - [x] 7.1.1.4 Test PENDING_DOCUMENT status logic
  - [x] 7.1.1.5 Test overlapping absence validation
  - [x] 7.1.1.6 Test month lock validation
- [ ] 7.1.2 Write unit tests for storage.service.ts
  - [ ] 7.1.2.1 Test file upload to IDrive e2
  - [ ] 7.1.2.2 Test file deletion
  - [ ] 7.1.2.3 Test signed URL generation
- [x] 7.1.3 Write integration tests for absence endpoints
  - [x] 7.1.3.1 Test POST /absences (success, validation errors)
  - [x] 7.1.3.2 Test GET /absences (pagination, filtering)
  - [x] 7.1.3.3 Test PUT /absences/:id (update, locked month)
  - [x] 7.1.3.4 Test DELETE /absences/:id
- [x] 7.1.4 Write integration tests for document upload
  - [x] 7.1.4.1 Test POST /absences/:id/documents (file validation)
  - [x] 7.1.4.2 Test status update on document upload
  - [x] 7.1.4.3 Test document download
  - [x] 7.1.4.4 Test document deletion
- [ ] 7.1.5 Achieve minimum 60% code coverage

### 7.2 Frontend Tests
- [ ] 7.2.1 Write tests for AbsenceForm component
  - [ ] 7.2.1.1 Test form validation
  - [ ] 7.2.1.2 Test single date selection
  - [ ] 7.2.1.3 Test date range selection
  - [ ] 7.2.1.4 Test absence type selection
  - [ ] 7.2.1.5 Test form submission
- [ ] 7.2.2 Write tests for DocumentUploader component
  - [ ] 7.2.2.1 Test file type validation
  - [ ] 7.2.2.2 Test file size validation
  - [ ] 7.2.2.3 Test drag-and-drop
  - [ ] 7.2.2.4 Test upload progress
- [ ] 7.2.3 Write tests for HebrewDatePicker component
  - [ ] 7.2.3.1 Test Hebrew locale rendering
  - [ ] 7.2.3.2 Test weekend exclusion
  - [ ] 7.2.3.3 Test range selection
- [x] 7.2.4 Write tests for date utilities
  - [x] 7.2.4.1 Test isIsraeliWorkday()
  - [x] 7.2.4.2 Test expandDateRange()
  - [x] 7.2.4.3 Test getWorkdaysInRange()

## 8. Documentation

### 8.1 API Documentation
- [ ] 8.1.1 Document absence endpoints in Swagger
  - [ ] 8.1.1.1 Add examples for each endpoint
  - [ ] 8.1.1.2 Document request/response schemas
  - [ ] 8.1.1.3 Document error responses
- [ ] 8.1.2 Document document upload endpoints in Swagger
  - [ ] 8.1.2.1 Document multipart/form-data format
  - [ ] 8.1.2.2 Document file type and size limits
  - [ ] 8.1.2.3 Add upload examples
- [ ] 8.1.3 Update endpoints.md with any changes

### 8.2 Component Documentation
- [ ] 8.2.1 Add JSDoc comments to all components
- [ ] 8.2.2 Document props and usage examples
- [ ] 8.2.3 Add README.md in components folder

## 9. Environment Configuration

### 9.1 Server Environment Variables
- [ ] 9.1.1 Add IDrive e2 variables to `.env.example`
  ```
  IDRIVE_ACCESS_KEY=your_access_key
  IDRIVE_SECRET_KEY=your_secret_key
  IDRIVE_BUCKET=your_bucket_name
  IDRIVE_ENDPOINT=https://endpoint.idrivee2.com
  IDRIVE_REGION=us-east-1
  ```
- [ ] 9.1.2 Update environment validation in `server/src/config/env.ts`
- [ ] 9.1.3 Document setup instructions in server README

## 10. Deployment Preparation

### 10.1 Build & Deployment
- [ ] 10.1.1 Test build process for both client and server
- [ ] 10.1.2 Verify environment variables are set in production
- [ ] 10.1.3 Test IDrive e2 connection in staging environment
- [ ] 10.1.4 Update Docker configuration if needed

### 10.2 Database Migration
- [ ] 10.2.1 Generate production-ready migration SQL
- [ ] 10.2.2 Test migration on staging database
- [ ] 10.2.3 Prepare rollback script
- [ ] 10.2.4 Document migration steps
