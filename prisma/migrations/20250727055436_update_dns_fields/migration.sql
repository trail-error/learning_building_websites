/*
  Warnings:

  - You are about to drop the column `dnsAdds` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `dnsAddsIsNA` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `dnsAddsTicket` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `dnsDeletes` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `dnsDeletesIsNA` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `dnsDeletesTicket` on the `Pod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pod" DROP COLUMN "dnsAdds",
DROP COLUMN "dnsAddsIsNA",
DROP COLUMN "dnsAddsTicket",
DROP COLUMN "dnsDeletes",
DROP COLUMN "dnsDeletesIsNA",
DROP COLUMN "dnsDeletesTicket",
ADD COLUMN     "dns" TIMESTAMP(3),
ADD COLUMN     "dnsIsNA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dnsTicketAddsDeletes" TEXT,
ADD COLUMN     "dnsTicketChanges" TEXT;
