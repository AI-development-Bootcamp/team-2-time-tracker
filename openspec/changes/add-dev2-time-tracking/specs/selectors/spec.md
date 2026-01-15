# Selectors Capability

## ADDED Requirements

### Requirement: Client Selector
The system SHALL provide a list of clients that have tasks assigned to the current user.

#### Scenario: Get clients for user
- **WHEN** user requests `GET /selectors/clients`
- **THEN** response contains only clients with projects having tasks assigned to the user

#### Scenario: Sort by frequency
- **WHEN** user requests with `sort=frequency`
- **THEN** clients are sorted by user's time entry count (descending)

#### Scenario: Sort alphabetically
- **WHEN** user requests with `sort=alpha` (default)
- **THEN** clients are sorted alphabetically by name

### Requirement: Project Selector
The system SHALL provide a list of projects filtered by client that have tasks assigned to the current user.

#### Scenario: Get projects for client
- **WHEN** user requests `GET /selectors/projects?clientId=:id`
- **THEN** response contains only projects under that client with assigned tasks

#### Scenario: Get all assigned projects
- **WHEN** user requests `GET /selectors/projects` without clientId
- **THEN** response contains all projects with assigned tasks across all clients

### Requirement: Task Selector
The system SHALL provide a list of tasks filtered by project that are assigned to the current user.

#### Scenario: Get tasks for project
- **WHEN** user requests `GET /selectors/tasks?projectId=:id`
- **THEN** response contains only tasks under that project assigned to the user

#### Scenario: Task includes report type
- **WHEN** tasks are retrieved
- **THEN** each task includes `reportType` from its project for UI display

### Requirement: Auto-Select Single Option
The system SHALL automatically select the only option when a selector dropdown has exactly one item.

#### Scenario: Auto-select single client
- **WHEN** user has tasks assigned under only one client
- **THEN** that client is auto-selected in the form

#### Scenario: Auto-select single project
- **WHEN** selected client has only one project with assigned tasks
- **THEN** that project is auto-selected

#### Scenario: Auto-select single task
- **WHEN** selected project has only one assigned task
- **THEN** that task is auto-selected

### Requirement: Cascade Selection Behavior
The system SHALL cascade selection changes through the client-project-task hierarchy.

#### Scenario: Client selection triggers project check
- **WHEN** client is selected (manual or auto)
- **THEN** system checks if project should auto-select

#### Scenario: Project selection triggers task check
- **WHEN** project is selected (manual or auto)
- **THEN** system checks if task should auto-select

#### Scenario: Client change clears downstream
- **WHEN** user changes selected client
- **THEN** project and task selections are cleared

### Requirement: Auto-Select Timing
The system SHALL trigger auto-selection at specific points in the component lifecycle.

#### Scenario: Auto-select on data load
- **WHEN** selector data is loaded and exactly one option exists
- **THEN** that option is automatically selected immediately after data fetch completes

#### Scenario: Auto-select cascade trigger
- **WHEN** parent selector is selected (manually or auto) and child selector has one option
- **THEN** child option is auto-selected after parent selection is confirmed

#### Scenario: Auto-select undoable
- **WHEN** option is auto-selected
- **THEN** user can manually change the selection to a different option

#### Scenario: Auto-select prevents manual selection
- **WHEN** auto-select occurs
- **THEN** dropdown still shows all options, allowing user to override if needed

### Requirement: User Assignments
The system SHALL return all task assignments for the current user with task, project, and client details.

#### Scenario: Get user assignments
- **WHEN** user requests `GET /my/assignments`
- **THEN** response contains list of assigned tasks with `projectName` and `clientName`

### Requirement: User Monthly Statistics
The system SHALL return monthly statistics for the current user.

#### Scenario: Get monthly stats
- **WHEN** user requests `GET /my/statistics/:month` with format `YYYY-MM`
- **THEN** response contains `totalWorkDays`, `submittedDays`, `missingDays`, `totalWorkMinutes`, `totalAbsenceMinutes`, `completionPercentage`

### Requirement: Frequency Tracking
The system SHALL track usage frequency by counting time entries per client/project/task for each user.

#### Scenario: Frequency calculation
- **WHEN** selector is sorted by frequency
- **THEN** items are ordered by count of user's time entries (most used first)

#### Scenario: New items appear
- **WHEN** user has no entries for a newly assigned task
- **THEN** task appears in list with `usageCount: 0`

### Requirement: Selector DTOs
The system SHALL return selector items with id, name, and usageCount fields.

#### Scenario: Client selector format
- **WHEN** clients are retrieved
- **THEN** each item contains `{ id, name, usageCount }`

#### Scenario: Project selector format
- **WHEN** projects are retrieved
- **THEN** each item contains `{ id, name, clientId, usageCount }`

#### Scenario: Task selector format
- **WHEN** tasks are retrieved
- **THEN** each item contains `{ id, name, projectId, reportType, usageCount }`
