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
- Upload documents (PDF, JPG, PNG) up to 10MB
- Attach documents to absence requests
- Download and delete documents
- Documents can be uploaded even after month lock

### Absence Days Calculation
- Expand date range to individual workdays
- Exclude Friday-Saturday (Israeli weekend)
- Support half-day (270 min) and full-day (540 min) absences
- Integrate with workday summary calculations

## Impact

- **Affected specs**: `absences`, `documents`
- **Affected code**:
  - `server/src/modules/absences/*`
  - `server/src/modules/documents/*`
  - `server/src/config/upload.ts`
  - `client/apps/employee/src/pages/AbsencePage.tsx`
  - `client/apps/employee/src/components/AbsenceForm.tsx`
  - `client/apps/employee/src/components/AbsenceCalendar.tsx`
  - `client/apps/employee/src/components/DocumentUploader.tsx`
- **Dependencies**: Developer 1 (auth, users, infrastructure)
- **Blocks**: Developer 4 (reports include absence data)
- **Shared with**: Developer 2 (workday summary calculation)

## References

- Business rules: `project-features/projectsummery.md` (Section 4.3, 5)
- Database schema: `project-features/schemes.md` (absence_requests, absence_days, absence_documents)
- API endpoints: `project-features/endpoints.md` (Absences section)
- DTOs: `project-features/dtos.md` (Absences section)
- Developer rules: `server/CLAUDE.md`, `client/CLAUDE.md`
