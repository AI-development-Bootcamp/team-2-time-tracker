# Change: Developer 3 - Absences & Document Management

## Why

Employees need to report absences (vacation, sick leave, military reserves) and attach supporting documents (medical certificates, military orders). The system must handle Israeli workweek rules (Sun-Thu), expand date ranges to individual workdays, and enforce document requirements for certain absence types.

## What Changes

### Absence Requests
- Create absence requests with type, date range, half/full day option
- Automatic expansion to individual workdays (excluding Fri/Sat)
- Status tracking: SUBMITTED or PENDING_DOCUMENT
- Edit/delete absences (if month not locked)

### Document Management
- Upload documents (PDF, JPG, PNG) up to 10MB to IDrive e2 storage
- Attach documents to absence requests
- Download and delete documents
- Documents can be uploaded even after month lock
- File storage path: `/absences/{userId}/{absenceId}/{uuid}-{timestamp}.{ext}`
- Status indication: Display uploaded file name or "חסר קובץ" message

### Absence Days Calculation
- Expand date range to individual workdays
- Exclude Friday-Saturday (Israeli weekend)
- Support half-day (270 min) and full-day (540 min) absences
- Integrate with workday summary calculations

### UI Components (Mobile-First, RTL, Hebrew)
- **AbsencePage**: Main page with "דיווח העדרות" header
- **AbsenceForm**: Tabbed form with single-date and date-range modes
  - Absence type dropdown with emojis (מחלה 😷, חופשה 🏝️, חצי יום ⏰, יום מלא 🗓️, מילואים 🪖)
  - Date input fields with Hebrew formatting (DD/MM/YY)
  - Document upload section with drag-and-drop
  - Note/description field
- **HebrewDatePicker**: Calendar with Hebrew locale (react-day-picker)
  - Hebrew month names (נובמבר 2025) and day names (יום א', יום ב', etc.)
  - Single date or range selection with blue highlighting
  - Disabled Friday-Saturday (non-workdays)
  - RTL layout (week starts from right)
  - Display workday count for range selection
- **DocumentUploader**: File upload component (react-dropzone)
  - Drag-and-drop zone with dashed border
  - File validation (PDF/JPG/PNG, max 10MB)
  - Progress indicator during upload
  - Display "חסר קובץ" or uploaded file name

## Impact

- **Affected specs**:
  - `absences` - [specs/absences/spec.md](specs/absences/spec.md)
  - `documents` - [specs/documents/spec.md](specs/documents/spec.md)
- **Affected code**:
  - `server/src/modules/absences/*` (routes, controller, service, repo, documents handler)
  - `server/src/config/storage.ts` (IDrive e2 configuration)
  - `server/src/config/upload.ts` (multer configuration)
  - `server/src/shared/storage.service.ts` (S3-compatible operations)
  - `client/apps/employee/src/pages/AbsencePage.tsx`
  - `client/apps/employee/src/components/AbsenceForm.tsx`
  - `client/apps/employee/src/components/HebrewDatePicker.tsx`
  - `client/apps/employee/src/components/DocumentUploader.tsx`
  - `client/apps/employee/src/api/absencesApi.ts`
  - `client/apps/employee/src/stores/absence.store.ts`
  - `client/packages/utils/src/date.ts` (Israeli workweek utilities)
  - `client/packages/ui/src/components/*` (shared UI components)
- **New dependencies**:
  - `@aws-sdk/client-s3` - IDrive e2 storage integration
  - `@aws-sdk/s3-request-presigner` - Signed URL generation
  - `date-fns/locale/he` - Hebrew date formatting
- **Infrastructure**: IDrive e2 bucket configuration with credentials
- **Dependencies**: Developer 1 (auth, users, infrastructure)
- **Blocks**: Developer 4 (reports include absence data)
- **Shared with**: Developer 2 (workday summary calculation)

## References

- Business rules: `project-features/projectsummery.md` (Section 4.3, 5)
- Database schema: `project-features/schemes.md` (absence_requests, absence_days, absence_documents)
- API endpoints: `project-features/endpoints.md` (Absences section)
- DTOs: `project-features/dtos.md` (Absences section)
- Developer rules: `server/CLAUDE.md`, `client/CLAUDE.md`
- UI designs: `Screenshots/` directory
  - `דיווח העדרות ידני יום בודד.png` - Single day absence form
  - `דיווח לפי טווח ימים.png` - Date range absence form
  - `דרופ דאון פתוח.png` - Absence type dropdown
  - `העדרות לפי ימים קלנדר פתוח.png` - Calendar with single selection
  - `קלנדר עם טווח בחירה.png` - Calendar with range selection
