-- DropForeignKey
ALTER TABLE "absence_days" DROP CONSTRAINT "absence_days_user_id_fkey";

-- DropForeignKey
ALTER TABLE "absence_requests" DROP CONSTRAINT "absence_requests_user_id_fkey";

-- AddForeignKey
ALTER TABLE "absence_requests" ADD CONSTRAINT "absence_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_days" ADD CONSTRAINT "absence_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_absence_days_request" RENAME TO "absence_days_absence_request_id_idx";

-- RenameIndex
ALTER INDEX "idx_absence_days_user_date" RENAME TO "absence_days_user_id_work_date_idx";

-- RenameIndex
ALTER INDEX "idx_absence_documents_request" RENAME TO "absence_documents_absence_request_id_idx";

-- RenameIndex
ALTER INDEX "idx_absence_requests_status" RENAME TO "absence_requests_status_idx";

-- RenameIndex
ALTER INDEX "idx_absence_requests_type" RENAME TO "absence_requests_type_idx";

-- RenameIndex
ALTER INDEX "idx_absence_requests_user_range" RENAME TO "absence_requests_user_id_start_date_end_date_idx";
