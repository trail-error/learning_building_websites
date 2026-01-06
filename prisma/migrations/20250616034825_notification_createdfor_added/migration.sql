-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "createdForId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
