-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('VACATION', 'SICK', 'RESERVES', 'OTHER');

-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('PENDING_DOCUMENT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "absence_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AbsenceType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_half_day" BOOLEAN NOT NULL DEFAULT false,
    "status" "AbsenceStatus" NOT NULL DEFAULT 'SUBMITTED',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absence_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absence_days" (
    "id" TEXT NOT NULL,
    "absence_request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "work_date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absence_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absence_documents" (
    "id" TEXT NOT NULL,
    "absence_request_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "uploaded_by_user_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absence_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_absence_requests_user_range" ON "absence_requests"("user_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_absence_requests_status" ON "absence_requests"("status");

-- CreateIndex
CREATE INDEX "idx_absence_requests_type" ON "absence_requests"("type");

-- CreateIndex
CREATE INDEX "idx_absence_days_user_date" ON "absence_days"("user_id", "work_date");

-- CreateIndex
CREATE INDEX "idx_absence_days_request" ON "absence_days"("absence_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "absence_days_user_id_work_date_absence_request_id_key" ON "absence_days"("user_id", "work_date", "absence_request_id");

-- CreateIndex
CREATE INDEX "idx_absence_documents_request" ON "absence_documents"("absence_request_id");

-- AddForeignKey
ALTER TABLE "absence_requests" ADD CONSTRAINT "absence_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_days" ADD CONSTRAINT "absence_days_absence_request_id_fkey" FOREIGN KEY ("absence_request_id") REFERENCES "absence_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_days" ADD CONSTRAINT "absence_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_documents" ADD CONSTRAINT "absence_documents_absence_request_id_fkey" FOREIGN KEY ("absence_request_id") REFERENCES "absence_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_documents" ADD CONSTRAINT "absence_documents_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
