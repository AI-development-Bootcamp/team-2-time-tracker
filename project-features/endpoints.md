# API Endpoints Documentation

> **Version:** 1.0 | **Last Updated:** 2026-01-14
>
> This document provides a complete reference for all API endpoints in the Time Tracking System.
> All endpoints return a standard response wrapper (see [Response Format](#response-format)).

---

## Table of Contents

1.  [Overview](#1-overview)
2.  [Authentication](#2-authentication-endpoints)
3.  [Workday](#3-workday-endpoints)
4.  [Time Entries](#4-time-entries-endpoints)
5.  [Timer](#5-timer-endpoints)
6.  [Absences](#6-absences-endpoints)
7.  [Selectors](#7-selectors-endpoints)
8.  [Admin - Users](#8-admin---users-endpoints)
9.  [Admin - Entities](#9-admin---entities-endpoints)
10. [Admin - Assignments](#10-admin---assignments-endpoints)
11. [Admin - Reports](#11-admin---reports-endpoints)
12. [Admin - Month Locks](#12-admin---month-locks-endpoints)
13. [Admin - Audit Logs](#13-admin---audit-logs-endpoints)
14. [Response Format](#response-format)
15. [Error Codes](#error-codes)
16. [Shared DTOs & Enums](#16-shared-dtos--enums)
17. [Constants](#17-constants)

---

## 1. Overview

| Property          | Value                                      |
| :---------------- | :----------------------------------------- |
| **Base URL**      | `/api/v1`                                  |
| **Auth**          | JWT Bearer Token                           |
| **Content-Type**  | `application/json` (unless file upload)   |
| **Date Format**   | `YYYY-MM-DD` (ISO 8601)                    |
| **DateTime**      | `YYYY-MM-DDTHH:mm:ss.sssZ` (ISO 8601 UTC) |

### Role Legend

| Icon | Role         | Description                      |
| :--- | :----------- | :------------------------------- |
| 🔓   | Public       | No authentication required       |
| 👤   | Authenticated | Requires valid JWT               |
| 🛡️   | Admin Only   | Requires `role: ADMIN`           |

---

### `GET /health` 🔓

Health check endpoint for monitoring and deployment verification.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-14T13:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 2. Authentication Endpoints

### `POST /auth/login` 🔓

Authenticates a user and returns JWT tokens.

| Parameter    | Location | Type    | Required | Description                   |
| :----------- | :------- | :------ | :------- | :---------------------------- |
| `email`      | Body     | string  | ✓        | User email (lowercase)        |
| `password`   | Body     | string  | ✓        | User password (min 8 chars)   |
| `rememberMe` | Body     | boolean |          | Extend session (30 days)      |

**Request DTO:** `LoginRequestDto`
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "rememberMe": true
}
```

**Response DTO:** `LoginResponseDto`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2...",
    "expiresIn": 7200,
    "user": { "id": "uuid", "fullName": "...", "email": "...", "role": "EMPLOYEE" },
    "mustChangePassword": true
  }
}
```

---

### `POST /auth/refresh` 🔓

Refreshes an expired access token using a valid refresh token.

| Parameter       | Location | Type   | Required | Description        |
| :-------------- | :------- | :----- | :------- | :----------------- |
| `refreshToken`  | Body     | string | ✓        | Valid refresh token |

**Request DTO:** `RefreshTokenRequestDto`

**Response DTO:** `RefreshTokenResponseDto`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUz...",
    "expiresIn": 7200
  }
}
```

---

### `POST /auth/change-password` 👤

Changes the password for the currently authenticated user.

| Parameter          | Location | Type   | Required | Description                                  |
| :----------------- | :------- | :----- | :------- | :------------------------------------------- |
| `currentPassword`  | Body     | string | ✓        | Current password                             |
| `newPassword`      | Body     | string | ✓        | New password (8+ chars, upper, lower, num, special) |
| `confirmPassword`  | Body     | string | ✓        | Must match `newPassword`                     |

**Request DTO:** `ChangePasswordRequestDto`

**Response DTO:** `OkResponseDto`

---

### `GET /auth/me` 👤

Returns the profile of the currently authenticated user.

**Response DTO:** `MeResponseDto`
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "fullName": "Israel Israeli",
    "email": "israel@example.com",
    "role": "EMPLOYEE",
    "isActive": true,
      }
}
```

---

### `POST /auth/logout` 👤

Invalidates the current refresh token, ending the session.

| Parameter      | Location | Type   | Required | Description           |
| :------------- | :------- | :----- | :------- | :-------------------- |
| `refreshToken` | Body     | string | ✓        | Token to invalidate   |

**Request DTO:** `LogoutRequestDto`

**Response DTO:** `OkResponseDto`

---

## 3. Workday Endpoints

### `GET /workday/:date` 👤

Retrieves the workday summary for a specific date.

| Parameter | Location | Type | Required | Description           |
| :-------- | :------- | :--- | :------- | :-------------------- |
| `date`    | Path     | Date | ✓        | `YYYY-MM-DD` format   |

**Response DTO:** `GetWorkdayResponseDto`

> [!TIP]
> This endpoint returns all time entries and absences for the day, along with a calculated `summary` object showing remaining/over minutes.

---

### `POST /workday/:date/submit` 👤

Submits the workday for approval. Fails if time is not fully allocated.

| Parameter | Location | Type | Required | Description         |
| :-------- | :------- | :--- | :------- | :------------------ |
| `date`    | Path     | Date | ✓        | `YYYY-MM-DD` format |

**Response DTO:** `SubmitWorkdayResponseDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | Month must not be locked | `WORKDAY_001` |
| 2 | Total minutes (work + absence) must equal 540 | `WORKDAY_002` |
| 3 | Day must not already be submitted | `WORKDAY_003` |

> [!WARNING]
> A day cannot be submitted if `unallocatedMinutes > 0`. This is a **blocking** validation - submission is rejected until all 540 minutes are allocated.

---

### `POST /workday/:date/cancel` 👤

Cancels a previously submitted workday (only if month is not locked).

| Parameter | Location | Type | Required | Description         |
| :-------- | :------- | :--- | :------- | :------------------ |
| `date`    | Path     | Date | ✓        | `YYYY-MM-DD` format |

**Response DTO:** `CancelWorkdayResponseDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | Month must not be locked | `WORKDAY_001` |
| 2 | Day must be currently submitted | `WORKDAY_004` |

---

### `GET /workday/calendar/:month` 👤

Retrieves the monthly calendar view with daily status indicators.

| Parameter | Location | Type   | Required | Description       |
| :-------- | :------- | :----- | :------- | :---------------- |
| `month`   | Path     | string | ✓        | `YYYY-MM` format  |

**Response DTO:** `GetMonthlyCalendarResponseDto`

---

## 4. Time Entries Endpoints

### `POST /time-entries` 👤

Creates a new time entry.

| Parameter     | Location | Type         | Required | Description                              |
| :------------ | :------- | :----------- | :------- | :--------------------------------------- |
| `workDate`    | Body     | Date         | ✓        | `YYYY-MM-DD`, not in the future          |
| `startTime`   | Body     | Time         | ✓        | `HH:MM` (24h)                            |
| `endTime`     | Body     | Time         | ✓        | `HH:MM`, must be > `startTime`           |
| `location`    | Body     | WorkLocation | ✓        | `OFFICE` \| `CLIENT` \| `HOME`           |
| `taskId`      | Body     | UUID         | ✓        | Must be assigned to the user             |
| `description` | Body     | string       | ✓        | 10-500 characters                        |

**Request DTO:** `CreateTimeEntryRequestDto`

**Response DTO:** `UpsertTimeEntryResponseDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | Timer must NOT be running | `TIMER_001` |
| 2 | Work date must not be in a locked month | `WORKDAY_001` |
| 3 | Task must be assigned to the user | `VALIDATION_001` |
| 4 | Description must be 10-500 characters | `VALIDATION_001` |

> [!IMPORTANT]
> Manual entries can only be created when the timer is **not running**.

---

### `GET /time-entries/:id` 👤

Retrieves a single time entry by ID.

| Parameter | Location | Type | Required | Description   |
| :-------- | :------- | :--- | :------- | :------------ |
| `id`      | Path     | UUID | ✓        | Time entry ID |

**Response DTO:** `TimeEntryDto`

---

### `PUT /time-entries/:id` 👤

Updates an existing time entry.

| Parameter | Location | Type | Required | Description       |
| :-------- | :------- | :--- | :------- | :---------------- |
| `id`      | Path     | UUID | ✓        | Time entry ID     |

**Request DTO:** `UpdateTimeEntryRequestDto` (all fields optional)

**Response DTO:** `UpsertTimeEntryResponseDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | Entry must belong to the user | `AUTH_003` |
| 2 | Work date must not be in a locked month | `WORKDAY_001` |
| 3 | If description provided, must be 10-500 characters | `VALIDATION_001` |

---

### `DELETE /time-entries/:id` 👤

Soft-deletes a time entry.

| Parameter | Location | Type | Required | Description   |
| :-------- | :------- | :--- | :------- | :------------ |
| `id`      | Path     | UUID | ✓        | Time entry ID |

**Response DTO:** `DeleteTimeEntryResponseDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | Entry must belong to the user | `AUTH_003` |
| 2 | Work date must not be in a locked month | `WORKDAY_001` |

---

### `GET /time-entries/history` 👤

Retrieves paginated time entry history with filters.

| Parameter       | Location | Type         | Required | Description                  |
| :-------------- | :------- | :----------- | :------- | :--------------------------- |
| `page`          | Query    | number       |          | Default: 1                   |
| `pageSize`      | Query    | number       |          | Default: 20, Max: 100        |
| `fromDate`      | Query    | Date         |          | Start of range               |
| `toDate`        | Query    | Date         |          | End of range                 |
| `clientId`      | Query    | UUID         |          | Filter by client             |
| `projectId`     | Query    | UUID         |          | Filter by project            |
| `taskId`        | Query    | UUID         |          | Filter by task               |
| `location`      | Query    | WorkLocation |          | Filter by location           |
| `submittedOnly` | Query    | boolean      |          | Only submitted days          |

**Response DTO:** `GetHistoryResponseDto`

---

### `POST /time-entries/batch` 👤

Creates multiple time entries at once (for reporting on multiple tasks in one day).

| Parameter | Location | Type                       | Required | Description                  |
| :-------- | :------- | :------------------------- | :------- | :--------------------------- |
| `entries` | Body     | CreateTimeEntryRequestDto[] | ✓        | Array of time entries to create |

**Request DTO:** `BatchCreateTimeEntriesRequestDto`

**Response DTO:**
```json
{
  "success": true,
  "data": {
    "created": [ /* TimeEntryDto[] */ ],
    "workday": { /* WorkdaySummaryDto */ }
  }
}
```

---

## 5. Timer Endpoints

### `POST /timer/start` 👤

Starts the server-side timer for the current day.

| Parameter  | Location | Type | Required | Description                      |
| :--------- | :------- | :--- | :------- | :------------------------------- |
| `workDate` | Body     | Date | ✓        | Must be today (`YYYY-MM-DD`)     |

**Request DTO:** `StartTimerRequestDto`

**Response DTO:** `StartTimerResponseDto`

> [!CAUTION]
> Only **one timer** can be running at a time per user.

---

### `POST /timer/stop` 👤

Stops the running timer and creates a time entry.

| Parameter     | Location | Type         | Required | Description                  |
| :------------ | :------- | :----------- | :------- | :--------------------------- |
| `taskId`      | Body     | UUID         | ✓        | Task worked on               |
| `location`    | Body     | WorkLocation | ✓        | Where work was done          |
| `description` | Body     | string       | ✓        | Description of work (10+ chars) |

**Request DTO:** `StopTimerRequestDto`

**Response DTO:** `StopTimerResponseDto`

---

### `GET /timer/status` 👤

Returns the current timer status (running or not).

**Response DTO:** `TimerStatusResponseDto`
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "timer": { "id": "...", "startedAt": "2026-01-14T08:00:00Z", ... },
    "elapsedMinutes": 125
  }
}
```

---

### `DELETE /timer/cancel` 👤

Cancels the running timer without creating a time entry.

**Response DTO:** `OkResponseDto`

> [!WARNING]
> This discards all elapsed time. Use `POST /timer/stop` to save the time.

---

## 6. Absences Endpoints

### `POST /absences` 👤

Creates a new absence request.

| Parameter   | Location | Type        | Required | Description                        |
| :---------- | :------- | :---------- | :------- | :--------------------------------- |
| `type`      | Body     | AbsenceType | ✓        | `VACATION` \| `SICK` \| `RESERVES` \| `OTHER` |
| `startDate` | Body     | Date        | ✓        | Start of absence                   |
| `endDate`   | Body     | Date        | ✓        | End of absence (>= startDate)      |
| `isHalfDay` | Body     | boolean     | ✓        | Half day (270 min) or full (540)   |
| `note`      | Body     | string      |          | Optional note (max 500 chars)      |

**Request DTO:** `CreateAbsenceRequestDto`

**Response DTO:** `CreateAbsenceResponseDto`

> [!NOTE]
> `SICK` and `RESERVES` types will automatically set status to `PENDING_DOCUMENT` if no file is attached.

---

### `GET /absences` 👤

Lists the user's absence requests.

| Parameter  | Location | Type   | Required | Description        |
| :--------- | :------- | :----- | :------- | :----------------- |
| `page`     | Query    | number |          | Default: 1         |
| `pageSize` | Query    | number |          | Default: 20        |

**Response DTO:** `ListAbsencesResponseDto`

---

### `GET /absences/:id` 👤

Gets a single absence request by ID.

**Response DTO:** `AbsenceRequestDto`

---

### `PUT /absences/:id` 👤

Updates an absence request.

**Request DTO:** `UpdateAbsenceRequestDto`

**Response DTO:** `UpdateAbsenceResponseDto`

---

### `DELETE /absences/:id` 👤

Deletes an absence request (if month is not locked).

**Response DTO:** `DeleteAbsenceResponseDto`

---

### `POST /absences/:id/documents` 👤

Uploads a document for an absence (multipart/form-data).

| Parameter  | Location  | Type   | Required | Description                     |
| :--------- | :-------- | :----- | :------- | :------------------------------ |
| `id`       | Path      | UUID   | ✓        | Absence request ID              |
| `file`     | FormData  | File   | ✓        | PDF, JPG, or PNG (max 10MB)     |
| `fileName` | FormData  | string |          | Custom file name (optional)     |

**Response DTO:** `UploadAbsenceDocumentResponseDto`

---

### `GET /absences/:id/documents` 👤

Lists all documents attached to an absence.

**Response DTO:** `ListAbsenceDocumentsResponseDto`

---

### `GET /absences/:id/documents/:docId/download` 👤

Downloads a specific document file.

| Parameter | Location | Type | Required | Description        |
| :-------- | :------- | :--- | :------- | :----------------- |
| `id`      | Path     | UUID | ✓        | Absence request ID |
| `docId`   | Path     | UUID | ✓        | Document ID        |

**Response:** Binary file stream with `Content-Disposition: attachment`

---

### `DELETE /absences/:id/documents/:docId` 👤

Deletes a document from an absence request.

| Parameter | Location | Type | Required | Description        |
| :-------- | :------- | :--- | :------- | :----------------- |
| `id`      | Path     | UUID | ✓        | Absence request ID |
| `docId`   | Path     | UUID | ✓        | Document ID        |

**Response DTO:** `OkResponseDto`

---

## 7. Selectors Endpoints

These endpoints return lightweight lists for use in dropdown menus.

### `GET /selectors/clients` 👤

| Parameter | Location | Type   | Required | Description                     |
| :-------- | :------- | :----- | :------- | :------------------------------ |
| `sort`    | Query    | string |          | `alpha` (default) or `frequency` |

**Response DTO:** `GetSelectorsResponseDto<ClientSelectorDto>`

---

### `GET /selectors/projects` 👤

| Parameter  | Location | Type   | Required | Description              |
| :--------- | :------- | :----- | :------- | :----------------------- |
| `clientId` | Query    | UUID   |          | Filter by client         |
| `sort`     | Query    | string |          | `alpha` or `frequency`   |

**Response DTO:** `GetSelectorsResponseDto<ProjectSelectorDto>`

---

### `GET /selectors/tasks` 👤

| Parameter   | Location | Type   | Required | Description            |
| :---------- | :------- | :----- | :------- | :--------------------- |
| `projectId` | Query    | UUID   |          | Filter by project      |
| `sort`      | Query    | string |          | `alpha` or `frequency` |

**Response DTO:** `GetSelectorsResponseDto<TaskSelectorDto>`

> [!TIP]
> Use `sort=frequency` to show the user's most-used items first.

---

### `GET /my/assignments` 👤

Returns all task assignments for the current user.

**Response DTO:** `UserAssignmentsDto`
```json
{
  "success": true,
  "data": {
    "tasks": [
      { "id": "...", "name": "...", "projectName": "...", "clientName": "..." }
    ],
    "totalTasks": 5
  }
}
```

---

### `GET /my/statistics/:month` 👤

Returns the current user's monthly statistics.

| Parameter | Location | Type   | Required | Description     |
| :-------- | :------- | :----- | :------- | :-------------- |
| `month`   | Path     | string | ✓        | `YYYY-MM`       |

**Response DTO:** `MonthlyStatisticsDto`
```json
{
  "success": true,
  "data": {
    "totalWorkDays": 22,
    "submittedDays": 18,
    "missingDays": 4,
    "totalWorkMinutes": 9720,
    "totalAbsenceMinutes": 0,
    "completionPercentage": 82
  }
}
```

---

## 8. Admin - Users Endpoints

### `GET /admin/users` 🛡️

Lists all users with filtering and pagination.

| Parameter  | Location | Type     | Required | Description                  |
| :--------- | :------- | :------- | :------- | :--------------------------- |
| `page`     | Query    | number   |          | Default: 1                   |
| `pageSize` | Query    | number   |          | Default: 20                  |
| `status`   | Query    | string   |          | `active` or `inactive`       |
| `role`     | Query    | UserRole |          | `EMPLOYEE` or `ADMIN`        |
| `query`    | Query    | string   |          | Search in name/email         |

**Response DTO:** `ListUsersResponseDto`

---

### `POST /admin/users` 🛡️

Creates a new user.

| Parameter  | Location | Type     | Required | Description                   |
| :--------- | :------- | :------- | :------- | :---------------------------- |
| `fullName` | Body     | string   | ✓        | 2-100 characters              |
| `email`    | Body     | string   | ✓        | Unique, valid email           |
| `password` | Body     | string   | ✓        | Strong password (8+ chars)    |
| `role`     | Body     | UserRole | ✓        | `EMPLOYEE` or `ADMIN`         |

**Request DTO:** `AdminCreateUserRequestDto`

**Response DTO:** `AdminUserResponseDto`

---

### `GET /admin/users/:id` 🛡️

Gets a single user by ID.

**Response DTO:** `AdminUserResponseDto`

---

### `PUT /admin/users/:id` 🛡️

Updates user details.

**Request DTO:** `AdminUpdateUserRequestDto`

**Response DTO:** `AdminUserResponseDto`

---

### `PUT /admin/users/:id/status` 🛡️

Activates or deactivates a user.

| Parameter  | Location | Type    | Required | Description                 |
| :--------- | :------- | :------ | :------- | :-------------------------- |
| `isActive` | Body     | boolean | ✓        | `true` = active             |

**Request DTO:** `AdminUpdateUserStatusRequestDto`

**Response DTO:** `AdminUserResponseDto`

---

### `POST /admin/users/:id/reset-password` 🛡️

Resets a user's password.

| Parameter              | Location | Type    | Required | Description                       |
| :--------------------- | :------- | :------ | :------- | :-------------------------------- |
| `newPassword`          | Body     | string  | ✓        | New strong password               |
| `requireChangeOnLogin` | Body     | boolean |          | Default: `true`                   |

**Request DTO:** `AdminResetPasswordRequestDto`

**Response DTO:** `OkResponseDto`

---

## 9. Admin - Entities Endpoints

### Clients

#### `GET /admin/clients` 🛡️

Lists all clients.

**Response DTO:** `ListClientsResponseDto`

#### `POST /admin/clients` 🛡️

Creates a new client.

| Parameter     | Location | Type   | Required | Description              |
| :------------ | :------- | :----- | :------- | :----------------------- |
| `name`        | Body     | string | ✓        | Client name              |
| `description` | Body     | string |          | Optional description     |

**Request DTO:** `AdminCreateClientRequestDto`

**Response DTO:** `ClientDto`

#### `GET /admin/clients/:id` 🛡️

Retrieves a single client.

**Response DTO:** `ClientDto`

#### `PUT /admin/clients/:id` 🛡️

Updates client details.

**Request DTO:** `AdminUpdateClientRequestDto`

#### `PUT /admin/clients/:id/status` 🛡️

Updates client status.

| Parameter | Location     | Type         | Required | Description          |
| :-------- | :----------- | :----------- | :------- | :------------------- |
| `status`  | Body         | EntityStatus | ✓        | `ACTIVE` or `INACTIVE` |

---

### Projects

#### `GET /admin/projects` 🛡️

Lists all projects.

| Parameter  | Location | Type | Required | Description       |
| :--------- | :------- | :--- | :------- | :---------------- |
| `clientId` | Query    | UUID |          | Filter by client  |

**Response DTO:** `ListProjectsResponseDto`

#### `POST /admin/projects` 🛡️

Creates a new project.

| Parameter   | Location | Type   | Required | Description                    |
| :---------- | :------- | :----- | :------- | :----------------------------- |
| `clientId`  | Body     | UUID   | ✓        | Client ID                      |
| `name`      | Body     | string | ✓        | Project name                   |
| `startDate` | Body     | Date   |          | Project start date (YYYY-MM-DD)|
| `endDate`   | Body     | Date   |          | Project end date (YYYY-MM-DD)  |

**Request DTO:** `AdminCreateProjectRequestDto`

**Response DTO:** `ProjectDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | If both dates provided, endDate must be >= startDate | `VALIDATION_001` |

#### `GET /admin/projects/:id` 🛡️

Retrieves a single project.

**Response DTO:** `ProjectDto`

#### `PUT /admin/projects/:id` 🛡️

Updates project details.

| Parameter   | Location | Type   | Required | Description                    |
| :---------- | :------- | :----- | :------- | :----------------------------- |
| `name`      | Body     | string |          | Project name                   |
| `startDate` | Body     | Date   |          | Project start date (YYYY-MM-DD)|
| `endDate`   | Body     | Date   |          | Project end date (YYYY-MM-DD)  |

**Request DTO:** `AdminUpdateProjectRequestDto`

**Response DTO:** `ProjectDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | If both dates provided, endDate must be >= startDate | `VALIDATION_001` |
| 2 | All child tasks must have dates within new project date range | `VALIDATION_001` |

#### `PUT /admin/projects/:id/status` 🛡️

Updates project status.

| Parameter | Location     | Type         | Required | Description          |
| :-------- | :----------- | :----------- | :------- | :------------------- |
| `status`  | Body         | EntityStatus | ✓        | `ACTIVE` or `INACTIVE` |

---

#### `PUT /admin/projects/:id/report-type` 🛡️

Updates the project's report type (determines how employees report time for this project).

| Parameter    | Location | Type       | Required | Description                          |
| :----------- | :------- | :--------- | :------- | :----------------------------------- |
| `reportType` | Body     | ReportType | ✓        | `TOTAL_HOURS` or `ENTRY_EXIT`        |

**Request DTO:** `AdminUpdateProjectReportTypeRequestDto`

**Response DTO:** `ProjectDto`

> [!NOTE]
> - `TOTAL_HOURS`: Employee reports start time and end time for each task (סכום שעות)
> - `ENTRY_EXIT`: Employee reports entry and exit times for the workday (כניסה/יציאה)

---

### Tasks

#### `GET /admin/tasks` 🛡️

Lists all tasks.

| Parameter   | Location | Type | Required | Description       |
| :---------- | :------- | :--- | :------- | :---------------- |
| `projectId` | Query    | UUID |          | Filter by project |

**Response DTO:** `ListTasksResponseDto`

#### `POST /admin/tasks` 🛡️

Creates a new task.

| Parameter   | Location | Type   | Required | Description                 |
| :---------- | :------- | :----- | :------- | :-------------------------- |
| `projectId` | Body     | UUID   | ✓        | Project ID                  |
| `name`      | Body     | string | ✓        | Task name                   |
| `startDate` | Body     | Date   |          | Task start date (YYYY-MM-DD)|
| `endDate`   | Body     | Date   |          | Task end date (YYYY-MM-DD)  |

**Request DTO:** `AdminCreateTaskRequestDto`

**Response DTO:** `TaskDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | If both dates provided, endDate must be >= startDate | `VALIDATION_001` |
| 2 | Task dates must be within parent project date range | `VALIDATION_001` |

#### `GET /admin/tasks/:id` 🛡️

Retrieves a single task.

**Response DTO:** `TaskDto`

#### `PUT /admin/tasks/:id` 🛡️

Updates task details.

| Parameter   | Location | Type   | Required | Description                 |
| :---------- | :------- | :----- | :------- | :-------------------------- |
| `name`      | Body     | string |          | Task name                   |
| `startDate` | Body     | Date   |          | Task start date (YYYY-MM-DD)|
| `endDate`   | Body     | Date   |          | Task end date (YYYY-MM-DD)  |

**Request DTO:** `AdminUpdateTaskRequestDto`

**Response DTO:** `TaskDto`

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | If both dates provided, endDate must be >= startDate | `VALIDATION_001` |
| 2 | Task dates must be within parent project date range | `VALIDATION_001` |

#### `PUT /admin/tasks/:id/status` 🛡️

Updates task status.

| Parameter | Location   | Type       | Required | Description      |
| :-------- | :--------- | :--------- | :------- | :--------------- |
| `status`  | Body       | TaskStatus | ✓        | `OPEN` or `CLOSED` |

**Validation Rules:**

| Rule | Validation | Error Code |
| :--- | :--------- | :--------- |
| 1 | Cannot close task if it has associated time entries | `VALIDATION_001` |

---

## 10. Admin - Assignments Endpoints

### `GET /admin/assignments` 🛡️

Lists all task-user assignments.

| Parameter | Location | Type | Required | Description         |
| :-------- | :------- | :--- | :------- | :------------------ |
| `userId`  | Query    | UUID |          | Filter by user      |
| `taskId`  | Query    | UUID |          | Filter by task      |

**Response DTO:** `ListAssignmentsResponseDto`

---

### `POST /admin/assignments` 🛡️

Creates a single assignment.

| Parameter | Location | Type | Required | Description |
| :-------- | :------- | :--- | :------- | :---------- |
| `userId`  | Body     | UUID | ✓        | User ID     |
| `taskId`  | Body     | UUID | ✓        | Task ID     |

**Request DTO:** `AdminCreateAssignmentRequestDto`

**Response DTO:** `AssignmentDto`

---

### `POST /admin/assignments/bulk` 🛡️

Creates multiple assignments at once (cartesian product).

| Parameter | Location | Type   | Required | Description       |
| :-------- | :------- | :----- | :------- | :---------------- |
| `userIds` | Body     | UUID[] | ✓        | Array of user IDs |
| `taskIds` | Body     | UUID[] | ✓        | Array of task IDs |

**Request DTO:** `AdminCreateBulkAssignmentsRequestDto`

**Response DTO:** `BulkAssignmentsResponseDto`

---

### `DELETE /admin/assignments/:id` 🛡️

Removes an assignment.

**Response DTO:** `OkResponseDto`

---

## 11. Admin - Reports Endpoints

### `GET /admin/reports/dashboard` 🛡️

Returns the admin dashboard overview.

**Response DTO:** `AdminDashboardResponseDto`

---

### `GET /admin/reports/users/:userId/monthly/:month` 🛡️

Returns a detailed monthly report for a specific user.

| Parameter | Location | Type   | Required | Description     |
| :-------- | :------- | :----- | :------- | :-------------- |
| `userId`  | Path     | UUID   | ✓        | User ID         |
| `month`   | Path     | string | ✓        | `YYYY-MM`       |

**Response DTO:** `AdminGetUserMonthlyReportResponseDto`

---

### `GET /admin/reports/users/:userId/monthly/:month/export` 🛡️

Exports a user's monthly report as CSV file.

| Parameter | Location | Type   | Required | Description     |
| :-------- | :------- | :----- | :------- | :-------------- |
| `userId`  | Path     | UUID   | ✓        | User ID         |
| `month`   | Path     | string | ✓        | `YYYY-MM`       |
| `format`  | Query    | string |          | `csv` (default) |

**Response:** CSV file with `Content-Type: text/csv`

---

### `GET /admin/users/:userId/time-entries` 🛡️

Lists time entries for a specific user (admin view).

| Parameter  | Location | Type   | Required | Description         |
| :--------- | :------- | :----- | :------- | :------------------ |
| `userId`   | Path     | UUID   | ✓        | User ID             |
| `fromDate` | Query    | Date   |          | Start of range      |
| `toDate`   | Query    | Date   |          | End of range        |
| `page`     | Query    | number |          | Default: 1          |
| `pageSize` | Query    | number |          | Default: 20         |

**Response DTO:** `GetHistoryResponseDto`

---

### `PUT /admin/users/:userId/time-entries/:id` 🛡️

Updates a time entry for a specific user (admin edit).

| Parameter | Location | Type | Required | Description   |
| :-------- | :------- | :--- | :------- | :------------ |
| `userId`  | Path     | UUID | ✓        | User ID       |
| `id`      | Path     | UUID | ✓        | Time entry ID |

**Request DTO:** `UpdateTimeEntryRequestDto`

**Response DTO:** `UpsertTimeEntryResponseDto`

> [!NOTE]
> All admin edits are automatically logged in the Audit Log.

---

### `DELETE /admin/users/:userId/time-entries/:id` 🛡️

Deletes a time entry for a specific user (admin delete).

| Parameter | Location | Type | Required | Description   |
| :-------- | :------- | :--- | :------- | :------------ |
| `userId`  | Path     | UUID | ✓        | User ID       |
| `id`      | Path     | UUID | ✓        | Time entry ID |

**Response DTO:** `DeleteTimeEntryResponseDto`

---

### `POST /admin/users/:userId/time-entries` 🛡️

Creates a time entry for a specific user (admin create).

| Parameter     | Location | Type         | Required | Description                  |
| :------------ | :------- | :----------- | :------- | :--------------------------- |
| `userId`      | Path     | UUID         | ✓        | User ID                      |
| `workDate`    | Body     | Date         | ✓        | Work date                    |
| `startTime`   | Body     | Time         | ✓        | Start time                   |
| `endTime`     | Body     | Time         | ✓        | End time                     |
| `location`    | Body     | WorkLocation | ✓        | Work location                |
| `taskId`      | Body     | UUID         | ✓        | Task ID                      |
| `description` | Body     | string       | ✓        | Description                  |

**Request DTO:** `CreateTimeEntryRequestDto`

**Response DTO:** `UpsertTimeEntryResponseDto`

---

### `GET /admin/users/:userId/absences` 🛡️

Lists absences for a specific user (admin view).

| Parameter  | Location | Type   | Required | Description         |
| :--------- | :------- | :----- | :------- | :------------------ |
| `userId`   | Path     | UUID   | ✓        | User ID             |
| `page`     | Query    | number |          | Default: 1          |
| `pageSize` | Query    | number |          | Default: 20         |

**Response DTO:** `ListAbsencesResponseDto`

---

### `PUT /admin/users/:userId/absences/:id` 🛡️

Updates an absence request for a specific user (admin edit).

| Parameter | Location | Type | Required | Description        |
| :-------- | :------- | :--- | :------- | :----------------- |
| `userId`  | Path     | UUID | ✓        | User ID            |
| `id`      | Path     | UUID | ✓        | Absence request ID |

**Request DTO:** `UpdateAbsenceRequestDto`

**Response DTO:** `UpdateAbsenceResponseDto`

> [!NOTE]
> All admin edits are automatically logged in the Audit Log.

---

### `POST /admin/users/:userId/absences` 🛡️

Creates an absence request for a specific user (admin create).

| Parameter   | Location | Type        | Required | Description                        |
| :---------- | :------- | :---------- | :------- | :--------------------------------- |
| `userId`    | Path     | UUID        | ✓        | User ID                            |
| `type`      | Body     | AbsenceType | ✓        | Absence type                       |
| `startDate` | Body     | Date        | ✓        | Start date                         |
| `endDate`   | Body     | Date        | ✓        | End date                           |
| `isHalfDay` | Body     | boolean     | ✓        | Half day or full                   |
| `note`      | Body     | string      |          | Optional note                      |

**Request DTO:** `CreateAbsenceRequestDto`

**Response DTO:** `CreateAbsenceResponseDto`

---

## 12. Admin - Month Locks Endpoints

### `GET /admin/month-locks` 🛡️

Lists all month lock records.

**Response DTO:** `ListMonthLocksResponseDto`

---

### `GET /admin/month-locks/status/:month` 🛡️

Checks if a specific month is locked.

| Parameter | Location | Type   | Required | Description           |
| :-------- | :------- | :----- | :------- | :-------------------- |
| `month`   | Path     | string | ✓        | `YYYY-MM` format      |

**Response DTO:** `GetMonthLockStatusResponseDto`

---

### `POST /admin/month-locks/lock` 🛡️

Locks a month, preventing any edits to workdays/entries.

| Parameter | Location | Type   | Required | Description           |
| :-------- | :------- | :----- | :------- | :-------------------- |
| `month`   | Body     | string | ✓        | `YYYY-MM-01` format   |
| `reason`  | Body     | string |          | Optional reason       |

**Request DTO:** `LockMonthRequestDto`

**Response DTO:** `LockMonthResponseDto`

---

### `POST /admin/month-locks/unlock` 🛡️

Unlocks a previously locked month.

| Parameter | Location | Type   | Required | Description         |
| :-------- | :------- | :----- | :------- | :------------------ |
| `month`   | Body     | string | ✓        | `YYYY-MM-01` format |
| `reason`  | Body     | string |          | Optional reason     |

**Request DTO:** `UnlockMonthRequestDto`

**Response DTO:** `UnlockMonthResponseDto`

---

## 13. Admin - Audit Logs Endpoints

### `GET /admin/audit-logs` 🛡️

Retrieves paginated audit logs with filtering.

| Parameter  | Location | Type        | Required | Description             |
| :--------- | :------- | :---------- | :------- | :---------------------- |
| `page`     | Query    | number      |          | Default: 1              |
| `pageSize` | Query    | number      |          | Default: 20             |
| `entity`   | Query    | AuditEntity |          | `USER`, `CLIENT`, etc.  |
| `entityId` | Query    | UUID        |          | Specific entity ID      |
| `adminId`  | Query    | UUID        |          | Filter by admin         |
| `action`   | Query    | AuditAction |          | `CREATE`, `UPDATE`, etc.|
| `fromDate` | Query    | DateTime    |          | Start date              |
| `toDate`   | Query    | DateTime    |          | End date                |

**Response DTO:** `ListAuditLogsResponseDto`

---

### `GET /admin/audit-logs/:id` 🛡️

Retrieves a single audit log entry with full details.

| Parameter | Location | Type | Required | Description  |
| :-------- | :------- | :--- | :------- | :----------- |
| `id`      | Path     | UUID | ✓        | Audit log ID |

**Response DTO:** `AuditLogDto`

---

## 14. Response Format

All API responses follow a consistent wrapper format.

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": { ... },
    "fields": [
      { "field": "email", "errors": ["Must be a valid email"] }
    ]
  }
}
```

---

## 15. Error Codes

| Code            | HTTP Status | Description                        |
| :-------------- | :---------- | :--------------------------------- |
| `AUTH_001`      | 401         | Invalid credentials                |
| `AUTH_002`      | 401         | Token expired                      |
| `AUTH_003`      | 403         | Insufficient permissions           |
| `WORKDAY_001`   | 400         | Day/Month is locked                |
| `WORKDAY_002`   | 400         | Not fully allocated (must equal 540 minutes) |
| `WORKDAY_003`   | 400         | Already submitted                  |
| `WORKDAY_004`   | 400         | Day not submitted (cannot cancel)  |
| `TIMER_001`     | 409         | Timer already running              |
| `TIMER_002`     | 400         | No active timer                    |
| `VALIDATION_001`| 400         | Validation error (field constraints)|
| `VALIDATION_002`| 400         | Overlapping absence                |
| `VALIDATION_003`| 400         | Missing required document          |
| `VALIDATION_004`| 400         | Task not assigned to user          |
| `NOT_FOUND`     | 404         | Resource not found                 |
| `SERVER_ERROR`  | 500         | Internal server error              |

---

## 16. Shared DTOs & Enums

### Enums

#### `UserRole`
* `EMPLOYEE`
* `ADMIN`

#### `EntityStatus`
* `ACTIVE`
* `INACTIVE`

#### `TaskStatus`
* `OPEN`
* `CLOSED`

#### `WorkLocation`
* `OFFICE`
* `CLIENT`
* `HOME`

#### `AbsenceType`
* `VACATION`
* `SICK`
* `RESERVES`
* `OTHER`

#### `AbsenceStatus`
* `PENDING_DOCUMENT`
* `SUBMITTED`

#### `TimeEntrySource`
* `MANUAL`
* `TIMER`

#### `ReportType`
* `TOTAL_HOURS` 
* `ENTRY_EXIT` 

#### `AuditEntity`
* `USER`
* `CLIENT`
* `PROJECT`
* `TASK`
* `TASK_ASSIGNMENT`
* `TIME_ENTRY`
* `ABSENCE`
* `MONTH_LOCK`

#### `AuditAction`
* `CREATE`
* `UPDATE`
* `STATUS_CHANGE`
* `RESET_PASSWORD`
* `LOCK_MONTH`
* `UNLOCK_MONTH`

### Shared DTOs

#### `PaginationDto`
| Field        | Type    | Description            |
| :----------- | :------ | :--------------------- |
| `page`       | number  | Current page (1-based) |
| `pageSize`   | number  | Items per page         |
| `total`      | number  | Total items            |
| `totalPages` | number  | Total pages            |
| `hasNext`    | boolean | Has next page          |
| `hasPrev`    | boolean | Has previous page      |

---

## 17. Constants

| Constant              | Value   | Description                  |
| :-------------------- | :------ | :--------------------------- |
| `WORKDAY_MINUTES`     | `540`   | 9 hours in minutes           |
| `HALF_DAY_MINUTES`    | `270`   | 4.5 hours in minutes         |
| `FULL_DAY_MINUTES`    | `540`   | Full day absence in minutes  |
| `TOKEN_EXPIRY_SECONDS`| `7200`  | JWT access token (2 hours)   |
| `REFRESH_TOKEN_DAYS`  | `30`    | Refresh token validity       |
| `MAX_FILE_SIZE_MB`    | `10`    | Max upload file size         |

> **Note:** Workweek is Sunday-Thursday (Israeli calendar). Friday and Saturday are excluded from workday calculations.

---

*End of API Documentation*
