-- Remove duplicate indexes
DROP INDEX IF EXISTS "month_locks_month_idx";
DROP INDEX IF EXISTS "workday_summaries_user_id_work_date_idx";

-- Add CHECK constraints for date ranges in projects table
ALTER TABLE "projects" ADD CONSTRAINT "projects_date_range_check" CHECK (
  "start_date" IS NULL OR "end_date" IS NULL OR "start_date" <= "end_date"
);

-- Add CHECK constraints for date ranges in tasks table
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_date_range_check" CHECK (
  "start_date" IS NULL OR "end_date" IS NULL OR "start_date" <= "end_date"
);
