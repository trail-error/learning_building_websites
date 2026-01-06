/*
  Warnings:

  - You are about to drop the column `preloadTicketNumber` on the `Pod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pod" DROP COLUMN "preloadTicketNumber",
ADD COLUMN     "preloadTicketNumber1" TEXT,
ADD COLUMN     "preloadTicketNumber2" TEXT,
ADD COLUMN     "preloadTicketNumber3" TEXT;
