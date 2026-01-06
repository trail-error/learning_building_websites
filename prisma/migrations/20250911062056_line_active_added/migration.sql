-- AlterTable
ALTER TABLE "AutofillPod" ADD COLUMN     "linkToActivePreloads" TEXT,
ADD COLUMN     "linkToActiveTds" TEXT;

-- AlterTable
ALTER TABLE "Pod" ADD COLUMN     "linkToActivePreloads" TEXT,
ADD COLUMN     "linkToActiveTds" TEXT;
