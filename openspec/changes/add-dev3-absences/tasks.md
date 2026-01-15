# Tasks: Developer 3 - Absences & Document Management

## 1. Database Schema

### 1.1 Prisma Models
- [ ] 1.1.1 Add AbsenceRequest model to `prisma/schema.prisma`
- [ ] 1.1.2 Add AbsenceDay model (expanded workdays)
- [ ] 1.1.3 Add AbsenceDocument model
- [ ] 1.1.4 Create migration for absence tables
- [ ] 1.1.5 Add indexes for query optimization

## 2. Absences Implementation

### 2.1 Backend Absences Module
- [ ] 2.1.1 Create `absences.routes.ts`
- [ ] 2.1.2 Create `absences.controller.ts`
- [ ] 2.1.3 Create `absences.service.ts`
- [ ] 2.1.4 Create `absences.repo.ts`

### 2.2 Absence Endpoints
- [ ] 2.2.1 Implement `POST /absences` (create absence request)
- [ ] 2.2.2 Implement `GET /absences` (list user's absences)
- [ ] 2.2.3 Implement `GET /absences/:id` (get single absence)
- [ ] 2.2.4 Implement `PUT /absences/:id` (update absence)
- [ ] 2.2.5 Implement `DELETE /absences/:id` (delete absence)

### 2.3 Absence Business Logic
- [ ] 2.3.1 Implement date range expansion algorithm
- [ ] 2.3.2 Exclude Friday-Saturday (Israeli weekend)
- [ ] 2.3.3 Calculate half-day (270) vs full-day (540) minutes
- [ ] 2.3.4 Set status to PENDING_DOCUMENT for SICK/RESERVES without document
- [ ] 2.3.5 Validate month not locked before create/update/delete
- [ ] 2.3.6 Validate no overlapping absences
- [ ] 2.3.7 Update workday summaries on absence CRUD

### 2.4 Frontend Absence Components
- [ ] 2.4.1 Create `AbsenceForm.tsx` component
- [ ] 2.4.2 Create `AbsenceList.tsx` component
- [ ] 2.4.3 Create `AbsenceCalendar.tsx` (visual calendar view)
- [ ] 2.4.4 Implement Hebrew date picker (react-day-picker)
- [ ] 2.4.5 Create absence Zustand store (`absence.store.ts`)

### 2.5 Absence Page
- [ ] 2.5.1 Create `AbsencePage.tsx`
- [ ] 2.5.2 Integrate AbsenceForm
- [ ] 2.5.3 Integrate AbsenceList with pagination
- [ ] 2.5.4 Add filter by type/status

## 3. Document Management

### 3.1 Backend Documents Module
- [ ] 3.1.1 Create `absences.documents.ts` (upload handler)
- [ ] 3.1.2 Configure multer for file uploads
- [ ] 3.1.3 Configure file storage (local or cloud)

### 3.2 Document Endpoints
- [ ] 3.2.1 Implement `POST /absences/:id/documents` (upload document)
- [ ] 3.2.2 Implement `GET /absences/:id/documents` (list documents)
- [ ] 3.2.3 Implement `GET /absences/:id/documents/:docId/download` (download)
- [ ] 3.2.4 Implement `DELETE /absences/:id/documents/:docId` (delete)

### 3.3 Document Business Logic
- [ ] 3.3.1 Validate file types (PDF, JPG, PNG only)
- [ ] 3.3.2 Validate file size (max 10MB)
- [ ] 3.3.3 Generate unique file names
- [ ] 3.3.4 Update absence status when document uploaded for PENDING_DOCUMENT
- [ ] 3.3.5 Allow document upload even if month is locked

### 3.4 Frontend Document Components
- [ ] 3.4.1 Create `DocumentUploader.tsx` (react-dropzone)
- [ ] 3.4.2 Create `DocumentList.tsx` component
- [ ] 3.4.3 Create `DocumentPreview.tsx` (image/PDF preview)
- [ ] 3.4.4 Implement drag-and-drop upload
- [ ] 3.4.5 Implement upload progress indicator

## 4. Israeli Workweek Logic

### 4.1 Date Utilities
- [ ] 4.1.1 Create `isIsraeliWorkday(date)` utility (Sun-Thu)
- [ ] 4.1.2 Create `expandDateRange(startDate, endDate)` utility
- [ ] 4.1.3 Create `getWorkdaysInRange(startDate, endDate)` utility

### 4.2 Hebrew Locale
- [ ] 4.2.1 Configure date-fns Hebrew locale
- [ ] 4.2.2 Format dates in Hebrew display format
- [ ] 4.2.3 Configure date picker with Hebrew locale

## 5. Shared DTOs

### 5.1 Add DTOs to @shared/types
- [ ] 5.1.1 Create `absences.dto.ts`
- [ ] 5.1.2 Create Zod schemas for absence validation
- [ ] 5.1.3 Add AbsenceType and AbsenceStatus enums

## 6. Testing

### 6.1 Backend Tests
- [ ] 6.1.1 Write unit tests for absences.service.ts
- [ ] 6.1.2 Write unit tests for date expansion algorithm
- [ ] 6.1.3 Write integration tests for absence endpoints
- [ ] 6.1.4 Write integration tests for document upload
- [ ] 6.1.5 Achieve minimum 60% coverage

### 6.2 Frontend Tests
- [ ] 6.2.1 Write tests for AbsenceForm component
- [ ] 6.2.2 Write tests for DocumentUploader component
- [ ] 6.2.3 Write tests for date picker Hebrew locale

## 7. Documentation

### 7.1 API Documentation
- [ ] 7.1.1 Document absence endpoints in Swagger
- [ ] 7.1.2 Document document upload endpoints in Swagger
- [ ] 7.1.3 Document file type and size limits
