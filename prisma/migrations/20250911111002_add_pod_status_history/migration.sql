-- CreateTable
CREATE TABLE "PodStatusHistory" (
    "id" TEXT NOT NULL,
    "podId" TEXT NOT NULL,
    "status" TEXT,
    "subStatus" TEXT,
    "previousStatus" TEXT,
    "previousSubStatus" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PodStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PodStatusHistory_podId_idx" ON "PodStatusHistory"("podId");

-- CreateIndex
CREATE INDEX "PodStatusHistory_changedById_idx" ON "PodStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "PodStatusHistory_createdAt_idx" ON "PodStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "PodStatusHistory" ADD CONSTRAINT "PodStatusHistory_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodStatusHistory" ADD CONSTRAINT "PodStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
