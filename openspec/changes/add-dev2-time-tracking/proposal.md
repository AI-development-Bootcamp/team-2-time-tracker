# Change: Developer 2 - Time Tracking Core (Timer, Entries, Workday)

## Why

Time tracking is the core functionality of the system. Employees need to record their work hours through either a server-side timer or manual entries. The system must track daily progress against the 9-hour standard (540 minutes) and manage workday submissions. This enables accurate payroll processing and project billing.

## What Changes

### Timer System
- Server-side timer to ensure continuity even if browser is closed
- Start/stop timer with automatic time entry creation
- Only one active timer per user
- Timer banner visible across all pages

### Time Entries
- Manual time entry creation (only when timer is off)
- Edit and delete entries (soft delete)
- Batch entry creation for multiple tasks
- Entry history with filtering and pagination

### Workday Management
- Daily summary calculation (work minutes + absence minutes)
- Submit/cancel workday functionality
- Monthly calendar view with status indicators
- Blocking validation: cannot submit unless exactly 540 minutes allocated

### Selector Dropdowns
- Client/Project/Task cascading selectors
- Auto-select when only one option available
- Sort by usage frequency or alphabetically

## Impact

- **Affected specs**: `timer`, `time-entries`, `workday`, `selectors`
- **Affected code**:
  - `server/src/modules/timer/*`
  - `server/src/modules/time-reports/*`
  - `server/src/modules/selectors/*`
  - `client/apps/employee/src/pages/DailyReportPage.tsx`
  - `client/apps/employee/src/components/TimerCard.tsx`
  - `client/apps/employee/src/components/WorkdayProgress.tsx`
  - `client/apps/employee/src/components/TimeEntryForm.tsx`
  - `client/apps/employee/src/components/FrequentSelectors.tsx`
- **Dependencies**: Developer 1 (auth, users, infrastructure)
- **Blocks**: Developer 4 (reports need time entry data)
- **Shared with**: Developer 3 (workday summary calculation)

## References

- Business rules: `project-features/projectsummery.md` (Section 4.2, 5)
- Database schema: `project-features/schemes.md` (timers, time_entries, workday_summaries)
- API endpoints: `project-features/endpoints.md` (Timer, Time Entries, Workday sections)
- DTOs: `project-features/dtos.md` (Timer, Time Entries, Workday sections)
- Developer rules: `server/CLAUDE.md`, `client/CLAUDE.md`
