-- CreateTable
CREATE TABLE "AutofillPod" (
    "id" TEXT NOT NULL,
    "pod" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "clli" TEXT NOT NULL,
    "router1" TEXT NOT NULL,
    "router2" TEXT NOT NULL,
    "podProgramType" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "routerType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutofillPod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutofillPod_pod_key" ON "AutofillPod"("pod");
