-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "ipHash" TEXT;

-- CreateTable
CREATE TABLE "SmsLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsLog_businessId_createdAt_idx" ON "SmsLog"("businessId", "createdAt");

-- AddForeignKey
ALTER TABLE "SmsLog" ADD CONSTRAINT "SmsLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
