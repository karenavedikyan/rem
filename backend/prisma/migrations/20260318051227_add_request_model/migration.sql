-- CreateTable
CREATE TABLE "Request" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "stage" TEXT,
    "objectType" TEXT,
    "comment" TEXT,
    "serviceId" TEXT,
    "serviceTitle" TEXT,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Request_createdAt_idx" ON "Request"("createdAt");
