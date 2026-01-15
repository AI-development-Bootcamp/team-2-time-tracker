# Tasks: Developer 2 - Time Tracking Core (Timer, Entries, Workday)

## 1. Database Schema

### 1.1 Prisma Models
- [ ] 1.1.1 Add Timer model to `prisma/schema.prisma`
- [ ] 1.1.2 Add TimeEntry model with soft delete fields
- [ ] 1.1.3 Add WorkdaySummary model
- [ ] 1.1.4 Create migration for timer, time_entries, workday_summaries tables
- [ ] 1.1.5 Add necessary indexes for query optimization

## 2. Timer Implementation

### 2.1 Backend Timer Module
- [ ] 2.1.1 Create `timer.routes.ts`
- [ ] 2.1.2 Create `timer.controller.ts`
- [ ] 2.1.3 Create `timer.service.ts`
- [ ] 2.1.4 Create `timer.repo.ts`

### 2.2 Timer Endpoints
- [ ] 2.2.1 Implement `POST /timer/start` (start timer for today)
- [ ] 2.2.2 Implement `POST /timer/stop` (stop timer, create entry)
- [ ] 2.2.3 Implement `GET /timer/status` (get current timer status)
- [ ] 2.2.4 Implement `DELETE /timer/cancel` (cancel without saving)

### 2.3 Timer Business Logic
- [ ] 2.3.1 Validate only one timer running per user
- [ ] 2.3.2 Calculate elapsed time server-side
- [ ] 2.3.3 Convert timer to time entry on stop
- [ ] 2.3.4 Prevent timer start if month is locked

### 2.4 Frontend Timer Implementation
- [ ] 2.4.1 Create `TimerCard.tsx` component
- [ ] 2.4.2 Create timer Zustand store (`timer.store.ts`)
- [ ] 2.4.3 Implement real-time counter display (updates every second)
- [ ] 2.4.4 Create fixed timer banner component (visible on all pages)
- [ ] 2.4.5 Implement pulsing/animated active indicator
- [ ] 2.4.6 Add quick stop button in banner
- [ ] 2.4.7 Handle timer persistence across page navigation

## 3. Time Entries Implementation

### 3.1 Backend Time Entries Module
- [ ] 3.1.1 Create `timeReports.routes.ts`
- [ ] 3.1.2 Create `timeReports.controller.ts`
- [ ] 3.1.3 Create `timeReports.service.ts`
- [ ] 3.1.4 Create `timeReports.repo.ts`

### 3.2 Time Entry Endpoints
- [ ] 3.2.1 Implement `POST /time-entries` (create entry)
- [ ] 3.2.2 Implement `GET /time-entries/:id` (get single entry)
- [ ] 3.2.3 Implement `PUT /time-entries/:id` (update entry)
- [ ] 3.2.4 Implement `DELETE /time-entries/:id` (soft delete)
- [ ] 3.2.5 Implement `GET /time-entries/history` (paginated history)
- [ ] 3.2.6 Implement `POST /time-entries/batch` (batch create)

### 3.3 Time Entry Business Logic
- [ ] 3.3.1 Validate timer is not running before manual entry
- [ ] 3.3.2 Validate end_time > start_time
- [ ] 3.3.3 Validate description length (10-500 chars)
- [ ] 3.3.4 Validate task is assigned to user
- [ ] 3.3.5 Validate month is not locked
- [ ] 3.3.6 Calculate duration_minutes automatically
- [ ] 3.3.7 Recalculate workday summary on entry CRUD

### 3.4 Frontend Time Entry Components
- [ ] 3.4.1 Create `TimeEntryForm.tsx` (modal for add/edit)
- [ ] 3.4.2 Create `TimeEntryList.tsx` component
- [ ] 3.4.3 Create time entry history page
- [ ] 3.4.4 Implement inline editing in list
- [ ] 3.4.5 Add delete confirmation dialog

## 4. Workday Implementation

### 4.1 Backend Workday Module
- [ ] 4.1.1 Create `workday.service.ts`
- [ ] 4.1.2 Integrate workday with time-reports routes

### 4.2 Workday Endpoints
- [ ] 4.2.1 Implement `GET /workday/:date` (daily summary)
- [ ] 4.2.2 Implement `POST /workday/:date/submit` (submit day)
- [ ] 4.2.3 Implement `POST /workday/:date/cancel` (cancel submission)
- [ ] 4.2.4 Implement `GET /workday/calendar/:month` (monthly view)

### 4.3 Workday Business Logic
- [ ] 4.3.1 Calculate workday summary (work + absence minutes)
- [ ] 4.3.2 Validate total equals 540 before submit
- [ ] 4.3.3 Validate month not locked
- [ ] 4.3.4 Validate day not already submitted
- [ ] 4.3.5 Update workday status (FULL/MISSING/EXCEPTION)

### 4.4 Frontend Workday Components
- [ ] 4.4.1 Create `WorkdayProgress.tsx` component
- [ ] 4.4.2 Implement progress bar with color coding (red/green/orange)
- [ ] 4.4.3 Create daily summary card
- [ ] 4.4.4 Create monthly calendar view component
- [ ] 4.4.5 Create workday store (`workday.store.ts`)

## 5. Selectors Implementation

### 5.1 Backend Selectors Module
- [ ] 5.1.1 Create `selectors.routes.ts`
- [ ] 5.1.2 Create `selectors.controller.ts`
- [ ] 5.1.3 Create `selectors.service.ts`
- [ ] 5.1.4 Create `selectors.repo.ts`

### 5.2 Selector Endpoints
- [ ] 5.2.1 Implement `GET /selectors/clients` (with frequency sort)
- [ ] 5.2.2 Implement `GET /selectors/projects` (filter by client)
- [ ] 5.2.3 Implement `GET /selectors/tasks` (filter by project)
- [ ] 5.2.4 Implement `GET /my/assignments` (user's task assignments)
- [ ] 5.2.5 Implement `GET /my/statistics/:month` (user monthly stats)

### 5.3 Selector Business Logic
- [ ] 5.3.1 Filter selectors by user's task assignments
- [ ] 5.3.2 Sort by usage frequency (count user's time entries)
- [ ] 5.3.3 Track reportType for task display

### 5.4 Frontend Selector Components
- [ ] 5.4.1 Create `FrequentSelectors.tsx` (cascading dropdowns)
- [ ] 5.4.2 Implement auto-select when single option
- [ ] 5.4.3 Implement cascade behavior (client -> project -> task)
- [ ] 5.4.4 Add frequency sorting toggle

## 6. Dashboard Page

### 6.1 Employee Dashboard
- [ ] 6.1.1 Create `DailyReportPage.tsx`
- [ ] 6.1.2 Integrate TimerCard component
- [ ] 6.1.3 Integrate WorkdayProgress component
- [ ] 6.1.4 Integrate TimeEntryForm (modal)
- [ ] 6.1.5 Integrate TimeEntryList for today's entries
- [ ] 6.1.6 Integrate FrequentSelectors in form

## 7. Shared DTOs

### 7.1 Add DTOs to @shared/types
- [ ] 7.1.1 Create `timer.dto.ts`
- [ ] 7.1.2 Create `timeReports.dto.ts`
- [ ] 7.1.3 Create Zod schemas for timer operations
- [ ] 7.1.4 Create Zod schemas for time entry operations

## 8. Testing

### 8.1 Backend Tests
- [ ] 8.1.1 Write unit tests for timer.service.ts
- [ ] 8.1.2 Write unit tests for timeReports.service.ts
- [ ] 8.1.3 Write unit tests for workday.service.ts
- [ ] 8.1.4 Write integration tests for timer endpoints
- [ ] 8.1.5 Write integration tests for time-entries endpoints
- [ ] 8.1.6 Achieve minimum 60% coverage

### 8.2 Frontend Tests
- [ ] 8.2.1 Write tests for TimerCard component
- [ ] 8.2.2 Write tests for TimeEntryForm component
- [ ] 8.2.3 Write tests for WorkdayProgress component

## 9. Documentation

### 9.1 API Documentation
- [ ] 9.1.1 Document timer endpoints in Swagger
- [ ] 9.1.2 Document time-entries endpoints in Swagger
- [ ] 9.1.3 Document workday endpoints in Swagger
- [ ] 9.1.4 Document selectors endpoints in Swagger
