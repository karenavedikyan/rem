-- Add optional list of promotion IDs controlled by partner banner override.
ALTER TABLE "Partner"
ADD COLUMN "promotionIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
