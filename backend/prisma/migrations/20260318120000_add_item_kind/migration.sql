-- CreateEnum
CREATE TYPE "ItemKind" AS ENUM ('SERVICE', 'PRODUCT');

-- AlterTable: add itemKind, make stage/taskType nullable
ALTER TABLE "Service" ADD COLUMN "itemKind" "ItemKind" NOT NULL DEFAULT 'SERVICE';

-- Make stage and taskType nullable (for products)
ALTER TABLE "Service" ALTER COLUMN "stage" DROP NOT NULL;
ALTER TABLE "Service" ALTER COLUMN "taskType" DROP NOT NULL;

-- Drop old index that included stage/taskType
DROP INDEX IF EXISTS "Service_isActive_stage_city_taskType_idx";

-- Create new indexes
CREATE INDEX "Service_isActive_city_idx" ON "Service"("isActive", "city");
CREATE INDEX "Service_isActive_itemKind_city_idx" ON "Service"("isActive", "itemKind", "city");
