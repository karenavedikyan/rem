-- AlterTable
ALTER TABLE "Request" ADD COLUMN "partnerId" UUID;
ALTER TABLE "Request" ADD COLUMN "partnerName" TEXT;

-- CreateIndex
CREATE INDEX "Request_partnerId_createdAt_idx" ON "Request"("partnerId", "createdAt");
