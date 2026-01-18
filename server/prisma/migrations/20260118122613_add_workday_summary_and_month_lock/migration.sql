-- CreateEnum
CREATE TYPE "WorkdayStatus" AS ENUM ('MISSING', 'FULL', 'EXCEPTION');

-- CreateTable
CREATE TABLE "month_locks" (
    "id" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "locked_at" TIMESTAMP(3) NOT NULL,
    "locked_by_admin_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3),
    "unlocked_by_admin_id" TEXT,

    CONSTRAINT "month_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workday_summaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "work_date" DATE NOT NULL,
    "target_minutes" INTEGER NOT NULL DEFAULT 540,
    "work_minutes" INTEGER NOT NULL DEFAULT 0,
    "absence_minutes" INTEGER NOT NULL DEFAULT 0,
    "status" "WorkdayStatus" NOT NULL DEFAULT 'MISSING',
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_month_id" TEXT,
    "is_submitted" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3),
    "requires_exact_total" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workday_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "month_locks_month_key" ON "month_locks"("month");

-- CreateIndex
CREATE INDEX "month_locks_month_idx" ON "month_locks"("month");

-- CreateIndex
CREATE INDEX "workday_summaries_user_id_work_date_idx" ON "workday_summaries"("user_id", "work_date");

-- CreateIndex
CREATE INDEX "workday_summaries_is_locked_idx" ON "workday_summaries"("is_locked");

-- CreateIndex
CREATE UNIQUE INDEX "workday_summaries_user_id_work_date_key" ON "workday_summaries"("user_id", "work_date");

-- AddForeignKey
ALTER TABLE "month_locks" ADD CONSTRAINT "month_locks_locked_by_admin_id_fkey" FOREIGN KEY ("locked_by_admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "month_locks" ADD CONSTRAINT "month_locks_unlocked_by_admin_id_fkey" FOREIGN KEY ("unlocked_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workday_summaries" ADD CONSTRAINT "workday_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workday_summaries" ADD CONSTRAINT "workday_summaries_locked_month_id_fkey" FOREIGN KEY ("locked_month_id") REFERENCES "month_locks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
