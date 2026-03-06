-- Create extension for UUID generation in PostgreSQL.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE "PartnerType" AS ENUM ('MASTER', 'COMPANY', 'STORE');
CREATE TYPE "ServiceStage" AS ENUM ('PLANNING', 'ROUGH', 'ENGINEERING', 'FINISHING', 'FURNITURE');
CREATE TYPE "ServiceTaskType" AS ENUM (
  'SANUZEL',
  'KITCHEN',
  'ELECTRICAL',
  'PLUMBING',
  'TILING',
  'PAINTING',
  'FLOORING',
  'WINDOWS',
  'DESIGN',
  'GENERAL'
);

-- Create Partner table
CREATE TABLE "Partner" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "PartnerType" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "city" TEXT NOT NULL DEFAULT 'Краснодар',
  "areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- Create Service table
CREATE TABLE "Service" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "partnerId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "stage" "ServiceStage" NOT NULL,
  "taskType" "ServiceTaskType" NOT NULL,
  "minPrice" INTEGER,
  "maxPrice" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "city" TEXT NOT NULL DEFAULT 'Краснодар',
  "areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "rating" DOUBLE PRECISION,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Partner_isApproved_city_idx" ON "Partner" ("isApproved", "city");
CREATE INDEX "Partner_type_idx" ON "Partner" ("type");
CREATE INDEX "Service_partnerId_idx" ON "Service" ("partnerId");
CREATE INDEX "Service_isActive_stage_city_taskType_idx" ON "Service" ("isActive", "stage", "city", "taskType");

-- Foreign keys
ALTER TABLE "Service"
ADD CONSTRAINT "Service_partnerId_fkey"
FOREIGN KEY ("partnerId")
REFERENCES "Partner"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
