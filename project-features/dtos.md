# Data Transfer Objects (DTOs)

> **Version:** 1.0 | **Last Updated:** 2026-01-15
>
> This document defines the structure of all Data Transfer Objects (DTOs) used in the Time Tracking System API.
> All Date/Time fields are ISO 8601 strings unless otherwise specified.

---

## Table of Contents

1. [Shared & Common](#1-shared--common)
2. [Enums](#2-enums)
3. [Authentication](#3-authentication)
4. [Workday](#4-workday)
5. [Time Entries](#5-time-entries)
6. [Timer](#6-timer)
7. [Absences](#7-absences)
8. [Selectors](#8-selectors)
9. [Admin - Users](#9-admin---users)
10. [Admin - Entities](#10-admin---entities)
11. [Admin - Assignments](#11-admin---assignments)
12. [Admin - Reports](#12-admin---reports)
13. [Admin - Month Locks](#13-admin---month-locks)
14. [Admin - Audit Logs](#14-admin---audit-logs)

---

## 1. Shared & Common

### `OkResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

### `PaginationDto`
**Usage:** Server -> Client
```json
{
  "page": 1,
  "pageSize": 20,
  "total": 100,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

### `ErrorResponseDto`
**Usage:** Server -> Client
```json
{
  "success": false,
  "error": { /* ErrorMessageDto */ }
}
```

### `ErrorMessageDto`
**Usage:** Server -> Client
```json
{
  "code": "AUTH_001",
  "message": "Invalid credentials",
  "details": {},
  "fields": [
    { "field": "email", "errors": ["Must be a valid email"] }
  ]
}
```

---

## 2. Enums

### `UserRole`
* `EMPLOYEE`
* `ADMIN`

### `EntityStatus`
* `ACTIVE`
* `INACTIVE`

### `TaskStatus`
* `OPEN`
* `CLOSED`

### `WorkLocation`
* `OFFICE`
* `CLIENT`
* `HOME`

### `AbsenceType`
* `VACATION`
* `SICK`
* `RESERVES`
* `OTHER`

### `AbsenceStatus`
* `PENDING_DOCUMENT`
* `SUBMITTED`

### `TimeEntrySource`
* `MANUAL`
* `TIMER`

### `ReportType`
* `TOTAL_HOURS` - דיווח סכום שעות (שעת התחלה וסיום)
* `ENTRY_EXIT` - דיווח כניסה/יציאה (שעת כניסה ושעת יציאה למשרד)

### `AuditEntity`
* `USER`, `CLIENT`, `PROJECT`, `TASK`, `TASK_ASSIGNMENT`, `TIME_ENTRY`, `ABSENCE`, `MONTH_LOCK`

### `AuditAction`
* `CREATE`, `UPDATE`, `STATUS_CHANGE`, `RESET_PASSWORD`, `LOCK_MONTH`, `UNLOCK_MONTH`

---

## 3. Authentication

### `LoginRequestDto`
**Usage:** Client -> Server
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

### `LoginResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2o...",
    "expiresIn": 7200,
    "user": { /* UserDto */ },
    "mustChangePassword": false
  }
}
```

### `UserDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "EMPLOYEE"
}
```

### `RefreshTokenRequestDto`
**Usage:** Client -> Server
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2o..."
}
```

### `RefreshTokenResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "expiresIn": 7200
  }
}
```

### `ChangePasswordRequestDto`
**Usage:** Client -> Server
```json
{
  "currentPassword": "OldPassword1!",
  "newPassword": "NewPassword1!",
  "confirmPassword": "NewPassword1!"
}
```

### `MeResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": { /* MeUserDto */ }
}
```

### `MeUserDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "EMPLOYEE",
  "isActive": true
}
```

### `LogoutRequestDto`
**Usage:** Client -> Server
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2o..."
}
```

---

## 4. Workday

### `GetWorkdayResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "date": "2026-01-15",
    "status": "MISSING", // FULL, MISSING, EXCEPTION
    "isLocked": false,
    "isSubmitted": false,
    "summary": { /* WorkdaySummaryDto */ },
    "timeEntries": [ /* TimeEntryDto[] */ ],
    "absences": [ /* AbsenceRequestDto[] */ ]
  }
}
```

### `WorkdaySummaryDto`
**Usage:** Server -> Client
```json
{
  "targetMinutes": 540,
  "workMinutes": 480,
  "absenceMinutes": 0,
  "totalMinutes": 480,
  "balanceMinutes": -60,
  "completionPercentage": 88,
  "isLocked": false,
  "lockedMonthId": null,
  "isSubmitted": false,
  "submittedAt": null,
  "requiresExactTotal": false
}
```

### `SubmitWorkdayResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "date": "2026-01-15",
    "isSubmitted": true,
    "submittedAt": "2026-01-15T17:30:00Z"
  }
}
```

### `CancelWorkdayResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "message": "Workday submission cancelled"
}
```

### `GetMonthlyCalendarResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "month": "2026-01",
    "days": [ /* CalendarDayDto[] */ ],
    "summary": {
      "totalTargetMinutes": 11880,
      "totalWorkMinutes": 11500,
      "balanceMinutes": -380
    }
  }
}
```

### `CalendarDayDto`
**Usage:** Server -> Client
```json
{
  "date": "2026-01-01",
  "status": "FULL", // FULL, MISSING, EXCEPTION
  "isLocked": true,
  "isSubmitted": true,
  "minutes": 540
}
```

---

## 5. Time Entries

### `TimeEntryDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "workDate": "2026-01-15",
  "startTime": "09:00",
  "endTime": "10:30",
  "durationMinutes": 90,
  "location": "OFFICE",
  "description": "Working on API design",
  "source": "MANUAL", // MANUAL, TIMER
  "task": {
    "id": "uuid",
    "name": "API Development",
    "project": { "id": "uuid", "name": "Time Tracker" },
    "client": { "id": "uuid", "name": "Internal" }
  }
}
```

### `CreateTimeEntryRequestDto`
**Usage:** Client -> Server
```json
{
  "workDate": "2026-01-15",
  "startTime": "09:00",
  "endTime": "10:30",
  "location": "OFFICE",
  "taskId": "uuid",
  "description": "Meeting with team"
}
```

### `UpdateTimeEntryRequestDto`
**Usage:** Client -> Server
```json
{
  "startTime": "09:15", // all fields optional
  "endTime": "10:45",
  "description": "Updated description"
}
```

### `UpsertTimeEntryResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": { /* TimeEntryDto */ }
}
```

### `DeleteTimeEntryResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isDeleted": true
  }
}
```

### `GetHistoryResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "entries": [ /* TimeEntryDto[] */ ],
    "pagination": { /* PaginationDto */ }
  }
}
```

### `BatchCreateTimeEntriesRequestDto`
**Usage:** Client -> Server
```json
{
  "entries": [
    { /* CreateTimeEntryRequestDto */ },
    { /* CreateTimeEntryRequestDto */ }
  ]
}
```

### `BatchCreateTimeEntriesResponseDto`
**Usage:** Server -> Client
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

## 6. Timer

### `StartTimerRequestDto`
**Usage:** Client -> Server
```json
{
  "workDate": "2026-01-15"
}
```

### `StartTimerResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "startedAt": "2026-01-15T09:00:00Z"
  }
}
```

### `StopTimerRequestDto`
**Usage:** Client -> Server
```json
{
  "taskId": "uuid",
  "location": "HOME",
  "description": "Finished coding task"
}
```

### `StopTimerResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": { /* TimeEntryDto */ }
}
```

### `TimerStatusResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "elapsedMinutes": 45,
    "timer": { /* TimerDto */ }
  }
}
```

### `TimerDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "userId": "uuid",
  "workDate": "2026-01-15",
  "startedAt": "2026-01-15T09:00:00Z",
  "stoppedAt": null,
  "durationMinutes": null,
  "isRunning": true,
  "createdAt": "2026-01-15T09:00:00Z",
  "updatedAt": "2026-01-15T09:00:00Z"
}
```

---

## 7. Absences

### `AbsenceRequestDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "SICK",
  "startDate": "2026-02-01",
  "endDate": "2026-02-03",
  "isHalfDay": false,
  "status": "PENDING_DOCUMENT",
  "note": "Flu",
  "documents": [ /* AbsenceDocumentDto[] */ ],
  "absenceDays": [ /* AbsenceDayDto[] */ ],
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

### `AbsenceDayDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "absenceRequestId": "uuid",
  "userId": "uuid",
  "workDate": "2026-02-01",
  "minutes": 540,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### `AbsenceDocumentDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "fileName": "cert.pdf",
  "fileUrl": "...",
  "fileSize": 102400,
  "mimeType": "application/pdf",
  "uploadedByUserId": "uuid",
  "uploadedAt": "2026-01-15T10:00:00Z"
}
```

### `CreateAbsenceRequestDto`
**Usage:** Client -> Server
```json
{
  "type": "VACATION",
  "startDate": "2026-03-10",
  "endDate": "2026-03-15",
  "isHalfDay": false,
  "note": "Family trip"
}
```

### `CreateAbsenceResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": { /* AbsenceRequestDto */ }
}
```

### `UpdateAbsenceRequestDto`
**Usage:** Client -> Server
```json
{
  "endDate": "2026-03-16",
  "note": "Extended trip"
}
```

### `UpdateAbsenceResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": { /* AbsenceRequestDto */ }
}
```

### `DeleteAbsenceResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "message": "Absence request deleted"
}
```

### `ListAbsencesResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "items": [ /* AbsenceRequestDto[] */ ],
    "pagination": { /* PaginationDto */ }
  }
}
```

### `UploadAbsenceDocumentResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileName": "sick_note.pdf",
    "url": "https://storage..."
  }
}
```

### `ListAbsenceDocumentsResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": [ /* AbsenceDocumentDto[] */ ]
}
```

---

## 8. Selectors

### `GetSelectorsResponseDto<T>`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "selector item" } // T[]
  ]
}
```

### `ClientSelectorDto`
**Usage:** Server -> Client
```json
{ "id": "uuid", "name": "Google", "usageCount": 150 }
```

### `ProjectSelectorDto`
**Usage:** Server -> Client
```json
{ "id": "uuid", "name": "Android App", "clientId": "uuid", "usageCount": 50 }
```

### `TaskSelectorDto`
**Usage:** Server -> Client
```json
{ "id": "uuid", "name": "Bug Fixes", "projectId": "uuid", "reportType": "TOTAL_HOURS", "usageCount": 10 }
```

### `UserAssignmentsDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "tasks": [ /* UserAssignmentDto[] */ ],
    "totalTasks": 1
  }
}
```

### `UserAssignmentDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "name": "Design Review",
  "projectId": "uuid",
  "projectName": "Website Redesign",
  "clientName": "Acme Corp",
  "reportType": "TOTAL_HOURS"
}
```

### `MonthlyStatisticsDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "totalWorkDays": 22,
    "submittedDays": 20,
    "missingDays": 2,
    "totalWorkMinutes": 10500,
    "totalAbsenceMinutes": 540,
    "completionPercentage": 91
  }
}
```

---

## 9. Admin - Users

### `AdminUserDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "fullName": "Jane Admin",
  "email": "jane@example.com",
  "role": "ADMIN",
  "isActive": true,
  "mustChangePassword": false,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

### `AdminUserResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": { /* AdminUserDto */ }
}
```

### `ListUsersResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "users": [ /* AdminUserDto[] */ ], // Inner DTO is just the user object from above
    "pagination": { /* PaginationDto */ }
  }
}
```

### `AdminCreateUserRequestDto`
**Usage:** Client -> Server
```json
{
  "fullName": "New Employee",
  "email": "new@example.com",
  "password": "InitialPassword1!",
  "role": "EMPLOYEE"
}
```

### `AdminUpdateUserRequestDto`
**Usage:** Client -> Server
```json
{
  "fullName": "Updated Name",
  "email": "updated@example.com"
}
```

### `AdminUpdateUserStatusRequestDto`
**Usage:** Client -> Server
```json
{
  "isActive": false
}
```

### `AdminResetPasswordRequestDto`
**Usage:** Client -> Server
```json
{
  "newPassword": "ResetPassword123!",
  "requireChangeOnLogin": true
}
```

---

## 10. Admin - Entities

### `ClientDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "description": "Enterprise software client",
  "status": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### `ProjectDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "name": "Rocket System",
  "clientId": "uuid",
  "status": "ACTIVE",
  "reportType": "TOTAL_HOURS",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### `TaskDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "name": "Guidance System",
  "projectId": "uuid",
  "status": "OPEN",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### `AdminCreateClientRequestDto`
**Usage:** Client -> Server
```json
{
  "name": "New Client",
  "description": "Optional client description"
}
```

### `AdminUpdateClientRequestDto`
**Usage:** Client -> Server
```json
{ "name": "Updated Client Name" }
```

### `ListClientsResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": [ /* ClientDto[] */ ]
}
```

### `AdminCreateProjectRequestDto`
**Usage:** Client -> Server
```json
{
  "clientId": "uuid",
  "name": "New Project"
}
```

### `AdminUpdateProjectRequestDto`
**Usage:** Client -> Server
```json
{ "name": "Updated Project Name" }
```

### `AdminUpdateProjectReportTypeRequestDto`
**Usage:** Client -> Server
```json
{ "reportType": "ENTRY_EXIT" }
```

### `ListProjectsResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": [ /* ProjectDto[] */ ]
}
```

### `AdminCreateTaskRequestDto`
**Usage:** Client -> Server
```json
{
  "projectId": "uuid",
  "name": "New Task"
}
```

### `AdminUpdateTaskRequestDto`
**Usage:** Client -> Server
```json
{ "name": "Updated Task Name" }
```

### `ListTasksResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": [ /* TaskDto[] */ ]
}
```

---

## 11. Admin - Assignments

### `AssignmentDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "userId": "uuid",
  "taskId": "uuid",
  "assignedByAdminId": "admin-uuid",
  "createdAt": "..."
}
```

### `ListAssignmentsResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": [ /* AssignmentDto[] */ ]
}
```

### `AdminCreateAssignmentRequestDto`
**Usage:** Client -> Server
```json
{
  "userId": "uuid",
  "taskId": "uuid"
}
```

### `AdminCreateBulkAssignmentsRequestDto`
**Usage:** Client -> Server
```json
{
  "userIds": ["uuid1", "uuid2"],
  "taskIds": ["uuidA", "uuidB"]
}
```

### `BulkAssignmentsResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "createdCount": 4,
    "assignments": [ /* AssignmentDto[] */ ]
  }
}
```

---

## 12. Admin - Reports

### `AdminDashboardResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "activeUsers": 50,
    "activeProjects": 12,
    "todayStats": { /* DashboardStatsDto */ },
    "monthCompletionRate": 85
  }
}
```

### `DashboardStatsDto`
**Usage:** Server -> Client
```json
{
  "working": 35,
  "absent": 5,
  "late": 2
}
```

### `AdminGetUserMonthlyReportResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "John Doe" },
    "period": "2026-01",
    "summary": { "target": 1000, "actual": 950, "balance": -50 },
    "dailyBreakdown": [ /* CalendarDayDto[] */ ]
  }
}
```

---

## 13. Admin - Month Locks

### `LockMonthRequestDto`
**Usage:** Client -> Server
```json
{
  "month": "2026-01-01", // first day of month
  "reason": "Payroll processed"
}
```

### `MonthLockDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "month": "2026-01-01",
  "lockedAt": "...",
  "lockedByAdminId": "admin-uuid",
  "unlockedAt": null,
  "unlockedByAdminId": null
}
```

### `LockMonthResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": { /* MonthLockDto */ }
}
```

### `UnlockMonthRequestDto`
**Usage:** Client -> Server
```json
{
  "month": "2026-01-01",
  "reason": "Correction needed"
}
```

### `UnlockMonthResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "message": "Month unlocked"
}
```

### `ListMonthLocksResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": [ /* MonthLockDto[] */ ]
}
```

### `GetMonthLockStatusResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "month": "2026-01",
    "isLocked": true,
    "lockedByAdminId": "admin-id",
    "lockedAt": "..."
  }
}
```

---

## 14. Admin - Audit Logs

### `AuditLogDto`
**Usage:** Server -> Client
```json
{
  "id": "uuid",
  "entity": "USER",
  "entityId": "uuid",
  "action": "UPDATE",
  "adminId": "admin-uuid",
  "adminName": "Jane Admin",
  "oldValue": { "role": "EMPLOYEE" },
  "newValue": { "role": "ADMIN" },
  "createdAt": "..."
}
```

### `ListAuditLogsResponseDto`
**Usage:** Server -> Client
```json
{
  "success": true,
  "data": {
    "logs": [ /* AuditLogDto[] */ ],
    "pagination": { /* PaginationDto */ }
  }
}
```
