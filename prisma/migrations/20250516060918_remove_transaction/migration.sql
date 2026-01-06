/*
  Warnings:

  - You are about to drop the `_CreatedBy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PodToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_logIssueId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_podId_fkey";

-- DropForeignKey
ALTER TABLE "_CreatedBy" DROP CONSTRAINT "_CreatedBy_A_fkey";

-- DropForeignKey
ALTER TABLE "_CreatedBy" DROP CONSTRAINT "_CreatedBy_B_fkey";

-- DropForeignKey
ALTER TABLE "_PodToTransaction" DROP CONSTRAINT "_PodToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_PodToTransaction" DROP CONSTRAINT "_PodToTransaction_B_fkey";

-- AlterTable
ALTER TABLE "Pod" ALTER COLUMN "totalElapsedCycleTime" DROP DEFAULT,
ALTER COLUMN "totalElapsedCycleTime" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "workableCycleTime" DROP DEFAULT,
ALTER COLUMN "workableCycleTime" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "timeInCurrentStatus" DROP NOT NULL,
ALTER COLUMN "timeInCurrentStatus" DROP DEFAULT,
ALTER COLUMN "clli" DROP DEFAULT,
ALTER COLUMN "city" DROP DEFAULT,
ALTER COLUMN "state" DROP DEFAULT,
ALTER COLUMN "routerType" DROP DEFAULT,
ALTER COLUMN "router1" DROP DEFAULT,
ALTER COLUMN "router2" DROP DEFAULT,
ALTER COLUMN "podProgramType" DROP DEFAULT,
ALTER COLUMN "tenantName" DROP DEFAULT,
ALTER COLUMN "currentLepVersion" DROP DEFAULT,
ALTER COLUMN "lepVersionToBeApplied" DROP DEFAULT,
ALTER COLUMN "podType" DROP DEFAULT,
ALTER COLUMN "special" DROP DEFAULT;

-- DropTable
DROP TABLE "_CreatedBy";

-- DropTable
DROP TABLE "_PodToTransaction";
