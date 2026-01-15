-- =========================
-- Global Constants (for reference in application code)
-- =========================
-- WORKDAY_MINUTES = 540 (9 hours)
-- HALF_DAY_MINUTES = 270 (4.5 hours)
-- FULL_DAY_MINUTES = 540 (9 hours)

-- =========================
-- Extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- ENUM Types
-- =========================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE entity_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('OPEN', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE work_location AS ENUM ('OFFICE', 'CLIENT', 'HOME');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE absence_type AS ENUM ('VACATION', 'SICK', 'RESERVES', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE absence_status AS ENUM ('PENDING_DOCUMENT', 'SUBMITTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE time_entry_source AS ENUM ('MANUAL', 'TIMER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_type AS ENUM ('TOTAL_HOURS', 'ENTRY_EXIT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_entity AS ENUM (
    'USER','CLIENT','PROJECT','TASK','TASK_ASSIGNMENT',
    'TIME_ENTRY','ABSENCE','MONTH_LOCK'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'CREATE','UPDATE','STATUS_CHANGE','RESET_PASSWORD',
    'LOCK_MONTH','UNLOCK_MONTH'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- Users
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name             text NOT NULL,
  email                 text NOT NULL UNIQUE,
  password_hash         text NOT NULL,
  role                  user_role NOT NULL DEFAULT 'EMPLOYEE',
  is_active             boolean NOT NULL DEFAULT true,
  must_change_password  boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =========================
-- Clients / Projects / Tasks
-- =========================
CREATE TABLE IF NOT EXISTS clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text NULL,
  status        entity_status NOT NULL DEFAULT 'ACTIVE',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

CREATE TABLE IF NOT EXISTS projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES clients(id),
  name        text NOT NULL,
  status      entity_status NOT NULL DEFAULT 'ACTIVE',
  report_type report_type NOT NULL DEFAULT 'TOTAL_HOURS',
  start_date  date NULL,
  end_date    date NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_projects_client_status ON projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_client_name ON projects(client_id, name);

CREATE TABLE IF NOT EXISTS tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id),
  name        text NOT NULL,
  status      task_status NOT NULL DEFAULT 'OPEN',
  start_date  date NULL,
  end_date    date NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_task_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_name ON tasks(project_id, name);

-- =========================
-- Task Assignments (user <-> task)
-- =========================
CREATE TABLE IF NOT EXISTS task_assignments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(id),
  task_id              uuid NOT NULL REFERENCES tasks(id),
  assigned_by_admin_id uuid NOT NULL REFERENCES users(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_task_assignments_user_task UNIQUE(user_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(task_id);

-- =========================
-- Month Locks (close/reopen month)
-- month stored as YYYY-MM-01
-- =========================
CREATE TABLE IF NOT EXISTS month_locks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month                date NOT NULL UNIQUE,
  locked_at            timestamptz NOT NULL,
  locked_by_admin_id   uuid NOT NULL REFERENCES users(id),
  unlocked_at          timestamptz NULL,
  unlocked_by_admin_id uuid NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_month_locks_month ON month_locks(month);

-- =========================
-- Workday Summaries (monthly calendar + status + lock + submit)
-- =========================
CREATE TABLE IF NOT EXISTS workday_summaries (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(id),
  work_date            date NOT NULL,
  target_minutes       int NOT NULL DEFAULT 540,
  work_minutes         int NOT NULL DEFAULT 0,
  absence_minutes      int NOT NULL DEFAULT 0,
  status               text NOT NULL DEFAULT 'MISSING', -- FULL/MISSING/EXCEPTION
  is_locked            boolean NOT NULL DEFAULT false,
  locked_month_id      uuid NULL REFERENCES month_locks(id),
  is_submitted         boolean NOT NULL DEFAULT false,
  submitted_at         timestamptz NULL,
  requires_exact_total boolean NOT NULL DEFAULT false,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_workday_summaries_user_date UNIQUE(user_id, work_date),
  CONSTRAINT chk_workday_summary_target CHECK (target_minutes > 0),
  CONSTRAINT chk_workday_summary_nonneg CHECK (work_minutes >= 0 AND absence_minutes >= 0)
);

CREATE INDEX IF NOT EXISTS idx_workday_summaries_user_date ON workday_summaries(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_workday_summaries_locked ON workday_summaries(is_locked);

-- =========================
-- Timers (advanced feature)
-- =========================
CREATE TABLE IF NOT EXISTS timers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  work_date       date NOT NULL,
  started_at      timestamptz NOT NULL,
  stopped_at      timestamptz NULL,
  duration_minutes int NULL,
  is_running      boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timers_user_date ON timers(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_timers_user_running ON timers(user_id, is_running);

-- =========================
-- Time Entries (multiple per day)
-- =========================
CREATE TABLE IF NOT EXISTS time_entries (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id),
  work_date          date NOT NULL,
  location           work_location NOT NULL,
  start_time         time NOT NULL,
  end_time           time NOT NULL,
  duration_minutes   int NOT NULL,
  task_id            uuid NOT NULL REFERENCES tasks(id),
  description        text NOT NULL,
  source             time_entry_source NOT NULL DEFAULT 'MANUAL',
  timer_id           uuid NULL REFERENCES timers(id),

  is_deleted         boolean NOT NULL DEFAULT false,
  deleted_at         timestamptz NULL,
  deleted_by_user_id uuid NULL REFERENCES users(id),

  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_time_entries_time CHECK (end_time > start_time),
  CONSTRAINT chk_time_entries_duration CHECK (duration_minutes > 0),
  CONSTRAINT chk_time_entries_description_length CHECK (char_length(description) BETWEEN 10 AND 500)
);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_task ON time_entries(user_id, task_id);

-- fast read of "active" entries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date_not_deleted
  ON time_entries(user_id, work_date)
  WHERE is_deleted = false;

-- =========================
-- Absence Requests (user input: single date or range)
-- no holidays; weekends excluded when generating absence_days in service
-- =========================
CREATE TABLE IF NOT EXISTS absence_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id),
  type        absence_type NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  is_half_day boolean NOT NULL DEFAULT false,
  status      absence_status NOT NULL DEFAULT 'SUBMITTED',
  note        text NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_absence_request_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_absence_requests_user_range ON absence_requests(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_absence_requests_status ON absence_requests(status);
CREATE INDEX IF NOT EXISTS idx_absence_requests_type ON absence_requests(type);

-- =========================
-- Absence Days (expanded to workdays only, excluding Fri/Sat - Israeli workweek is Sun-Thu)
-- minutes: HALF_DAY_MINUTES (270) or FULL_DAY_MINUTES (540) - see global constants
-- =========================
CREATE TABLE IF NOT EXISTS absence_days (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id  uuid NOT NULL REFERENCES absence_requests(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES users(id),
  work_date           date NOT NULL,
  minutes             int NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  -- Uses global constants: HALF_DAY_MINUTES=270, FULL_DAY_MINUTES=540
  CONSTRAINT chk_absence_days_minutes CHECK (minutes IN (270, 540)),
  CONSTRAINT uq_absence_days_unique UNIQUE(user_id, work_date, absence_request_id)
);

CREATE INDEX IF NOT EXISTS idx_absence_days_user_date ON absence_days(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_absence_days_request ON absence_days(absence_request_id);

-- =========================
-- Absence Documents (allowed to upload even after month lock)
-- =========================
CREATE TABLE IF NOT EXISTS absence_documents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id  uuid NOT NULL REFERENCES absence_requests(id) ON DELETE CASCADE,
  file_url            text NOT NULL,
  file_name           text NULL,
  mime_type           text NULL,
  file_size           int NULL,
  uploaded_by_user_id uuid NOT NULL REFERENCES users(id),
  uploaded_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_absence_documents_request ON absence_documents(absence_request_id);

-- =========================
-- Audit Logs (admin changes)
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   uuid NOT NULL REFERENCES users(id),
  entity     audit_entity NOT NULL,
  entity_id  uuid NOT NULL,
  action     audit_action NOT NULL,
  old_value  jsonb NULL,
  new_value  jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_time ON audit_logs(admin_id, created_at);
