-- Create table for service reviews.
CREATE TABLE "ServiceReview" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "serviceId" UUID NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "authorName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ServiceReview_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

-- Indexes
CREATE INDEX "ServiceReview_serviceId_createdAt_idx" ON "ServiceReview" ("serviceId", "createdAt");

-- Foreign keys
ALTER TABLE "ServiceReview"
ADD CONSTRAINT "ServiceReview_serviceId_fkey"
FOREIGN KEY ("serviceId")
REFERENCES "Service"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
