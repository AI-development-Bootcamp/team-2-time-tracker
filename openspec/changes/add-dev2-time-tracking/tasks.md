# Tasks: Developer 2 - Time Tracking Core

> Tasks organized by OpenSpec capability

## 1. Database Schema (Shared)

- [x] 1.1 Add Timer model to `prisma/schema.prisma`
- [x] 1.2 Add TimeEntry model with soft delete fields
- [x] 1.3 Add WorkdaySummary model
- [x] 1.4 Create migration for timer, time_entries, workday_summaries tables
- [x] 1.5 Add necessary indexes for query optimization

---

## 2. Timer Capability (specs/timer)

### Backend
- [x] 2.1 Create `timer.routes.ts`
- [x] 2.2 Create `timer.controller.ts`
- [x] 2.3 Create `timer.service.ts`
- [x] 2.4 Create `timer.repo.ts`

### Endpoints
- [x] 2.5 Implement `POST /timer/start` (start timer for today)
- [x] 2.6 Implement `POST /timer/stop` (stop timer, create entry)
- [x] 2.7 Implement `GET /timer/status` (get current timer status)
- [x] 2.8 Implement `DELETE /timer/cancel` (cancel without saving)

### Business Logic
- [x] 2.9 Validate only one timer running per user
- [x] 2.10 Calculate elapsed time server-side based on startedAt and current server time
- [x] 2.11 Convert timer to time entry on stop
- [x] 2.12 Prevent timer start if month is locked
- [x] 2.13 Validate workDate is today (not past or future)
- [x] 2.14 Ensure elapsed time calculation uses server-side computation

### Frontend
- [x] 2.15 Create `TimerCard.tsx` component
- [x] 2.16 Create timer Zustand store (`timer.store.ts`)
- [x] 2.17 Implement real-time counter display (updates every second)
- [x] 2.18 Create fixed timer banner component (visible on all pages)
- [x] 2.19 Implement pulsing/animated active indicator
- [x] 2.20 Add quick stop button in banner
- [x] 2.21 Handle timer persistence across page navigation
- [x] 2.22 Ensure banner follows Figma design specifications

### DTOs & Testing
- [x] 2.23 Create `timer.dto.ts` in @shared/types
- [x] 2.24 Create Zod schemas for timer operations
- [x] 2.25 Write unit tests for timer.service.ts
- [x] 2.26 Write integration tests for timer endpoints
- [x] 2.27 Write tests for TimerCard component
- [x] 2.28 Document timer endpoints in Swagger

---

## 3. Time Entries Capability (specs/time-entries)

### Backend
- [x] 3.1 Create `timeReports.routes.ts`
- [x] 3.2 Create `timeReports.controller.ts`
- [x] 3.3 Create `timeReports.service.ts`
- [x] 3.4 Create `timeReports.repo.ts`
- [x] 3.5 Register routes in main application

### Endpoints
- [x] 3.6 Implement `POST /time-entries` (create entry)
- [x] 3.7 Implement `GET /time-entries/:id` (get single entry)
- [x] 3.8 Implement `PUT /time-entries/:id` (update entry)
- [x] 3.9 Implement `DELETE /time-entries/:id` (soft delete)
- [x] 3.10 Implement `GET /time-entries/history` (paginated history)
- [x] 3.11 Implement `POST /time-entries/batch` (batch create)

### Business Logic
- [x] 3.12 Validate timer is not running before manual entry
- [x] 3.13 Validate end_time > start_time
- [x] 3.14 Validate description length (10-500 chars)
- [x] 3.15 Validate task is assigned to user
- [x] 3.16 Validate month is not locked
- [x] 3.17 Calculate duration_minutes automatically
- [x] 3.18 Recalculate workday summary on entry CRUD
- [x] 3.19 Validate future dates are blocked
- [x] 3.20 Implement ReportType-specific validation (ENTRY_EXIT single entry per project per day)
- [x] 3.21 Validate ENTRY_EXIT entries are within 535-545 minutes (540 ± 5 tolerance)
- [x] 3.22 Implement batch entry same-date validation
- [x] 3.23 Implement batch entry time overlap detection (reject for same task, allow for different)
- [x] 3.24 Validate workDate is immutable on update
- [x] 3.25 Allow taskId change on update (with assignment validation)

### Frontend
- [x] 3.26 Create `TimeEntryForm.tsx` (modal for add/edit)
- [x] 3.27 Create `TimeEntryList.tsx` component
- [x] 3.28 Create time entry history page
- [ ] 3.29 Implement inline editing in list
- [x] 3.30 Add delete confirmation dialog

### DTOs & Testing
- [x] 3.31 Create `timeReports.dto.ts` in @shared/types
- [x] 3.32 Create Zod schemas for time entry operations
- [x] 3.33 Write unit tests for timeReports.service.ts
- [x] 3.34 Write integration tests for time-entries endpoints
- [ ] 3.35 Write tests for TimeEntryForm component (blocked by 3.26)
- [x] 3.36 Document time-entries endpoints in Swagger

---

## 4. Workday Capability (specs/workday)

### Backend
- [ ] 4.1 Create `workday.service.ts`
- [ ] 4.2 Integrate workday with time-reports routes

### Endpoints
- [ ] 4.3 Implement `GET /workday/:date` (daily summary)
- [ ] 4.4 Implement `POST /workday/:date/submit` (submit day)
- [ ] 4.5 Implement `POST /workday/:date/cancel` (cancel submission)
- [ ] 4.6 Implement `GET /workday/calendar/:month` (monthly view)

### Business Logic
- [ ] 4.7 Calculate workday summary (work + absence minutes)
- [ ] 4.8 Validate total equals 540 before submit
- [ ] 4.9 Validate month not locked
- [ ] 4.10 Validate day not already submitted
- [ ] 4.11 Update workday status (FULL/MISSING/EXCEPTION) on retrieval and entry/absence changes
- [ ] 4.12 Implement automatic workday creation on first entry/absence
- [ ] 4.13 Implement immediate lock propagation when month is locked
- [ ] 4.14 Handle workday retrieval for dates with no entries (create on-the-fly)
- [ ] 4.15 Validate timer is stopped before allowing workday submission

### Frontend
- [ ] 4.16 Create `WorkdayProgress.tsx` component
- [ ] 4.17 Implement progress bar with color coding (red/green/orange)
- [ ] 4.18 Create daily summary card
- [ ] 4.19 Create monthly calendar view component (show all days, mark weekends)
- [ ] 4.20 Create workday store (`workday.store.ts`)

### Testing & Documentation
- [ ] 4.21 Write unit tests for workday.service.ts
- [ ] 4.22 Write tests for WorkdayProgress component
- [ ] 4.23 Document workday endpoints in Swagger

---

## 5. Selectors Capability (specs/selectors)

### Backend
- [ ] 5.1 Create `selectors.routes.ts`
- [ ] 5.2 Create `selectors.controller.ts`
- [ ] 5.3 Create `selectors.service.ts`
- [ ] 5.4 Create `selectors.repo.ts`

### Endpoints
- [ ] 5.5 Implement `GET /selectors/clients` (with frequency sort)
- [ ] 5.6 Implement `GET /selectors/projects` (filter by client)
- [ ] 5.7 Implement `GET /selectors/tasks` (filter by project)
- [ ] 5.8 Implement `GET /my/assignments` (user's task assignments)
- [ ] 5.9 Implement `GET /my/statistics/:month` (user monthly stats)

### Business Logic
- [ ] 5.10 Filter selectors by user's task assignments
- [ ] 5.11 Sort by usage frequency (count user's time entries)
- [ ] 5.12 Track reportType for task display

### Frontend
- [ ] 5.13 Create `FrequentSelectors.tsx` (cascading dropdowns)
- [ ] 5.14 Implement auto-select when single option (trigger after data fetch)
- [ ] 5.15 Implement cascade behavior (client -> project -> task)
- [ ] 5.16 Add frequency sorting toggle
- [ ] 5.17 Ensure auto-select is undoable by user
- [ ] 5.18 Implement cascade auto-select (parent selection triggers child check)

### Documentation
- [ ] 5.19 Document selectors endpoints in Swagger

---

## 6. Dashboard Integration (Cross-Cutting)

- [ ] 6.1 Create `DailyReportPage.tsx`
- [ ] 6.2 Integrate TimerCard component
- [ ] 6.3 Integrate WorkdayProgress component
- [ ] 6.4 Integrate TimeEntryForm (modal)
- [ ] 6.5 Integrate TimeEntryList for today's entries
- [ ] 6.6 Integrate FrequentSelectors in form

---

## 7. Testing Coverage

- [ ] 7.1 Achieve minimum 60% backend test coverage
- [ ] 7.2 Verify all critical user flows have integration tests
- [ ] 7.3 Ensure all frontend components have unit tests
