-- Add optional marketplace image for catalog services.
ALTER TABLE "Service"
ADD COLUMN "imageUrl" TEXT;
