-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REGULAR', 'ADMIN', 'PRIORITY', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'REGULAR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL,
    "pod" TEXT NOT NULL,
    "internalPodId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assignedEngineer" TEXT NOT NULL,
    "assignedEngineerDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "subStatus" TEXT NOT NULL,
    "subStatusLastChanged" TIMESTAMP(3),
    "org" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 9999,
    "creationTimestamp" TIMESTAMP(3),
    "creationTimestampIsNA" BOOLEAN NOT NULL DEFAULT false,
    "slaCalculatedNbd" TIMESTAMP(3),
    "slaCalculatedNbdIsNA" BOOLEAN NOT NULL DEFAULT false,
    "podWorkableDate" TIMESTAMP(3),
    "podWorkableDateIsNA" BOOLEAN NOT NULL DEFAULT false,
    "totalElapsedCycleTime" INTEGER NOT NULL DEFAULT 0,
    "workableCycleTime" INTEGER NOT NULL DEFAULT 0,
    "timeInCurrentStatus" TEXT NOT NULL DEFAULT '',
    "clli" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "routerType" TEXT NOT NULL DEFAULT '',
    "router1" TEXT NOT NULL DEFAULT '',
    "router2" TEXT NOT NULL DEFAULT '',
    "podProgramType" TEXT NOT NULL DEFAULT '',
    "tenantName" TEXT NOT NULL DEFAULT '',
    "currentLepVersion" TEXT NOT NULL DEFAULT '',
    "lepVersionToBeApplied" TEXT NOT NULL DEFAULT '',
    "podType" TEXT NOT NULL DEFAULT '',
    "special" BOOLEAN NOT NULL DEFAULT false,
    "lepAssessment" TIMESTAMP(3),
    "lepAssessmentIsNA" BOOLEAN NOT NULL DEFAULT false,
    "dlpTemplateUpdates" TIMESTAMP(3),
    "dlpTemplateUpdatesIsNA" BOOLEAN NOT NULL DEFAULT false,
    "ipAcquisition" TIMESTAMP(3),
    "ipAcquisitionIsNA" BOOLEAN NOT NULL DEFAULT false,
    "ipAllocation" TIMESTAMP(3),
    "ipAllocationIsNA" BOOLEAN NOT NULL DEFAULT false,
    "conversionFileUpdate" TIMESTAMP(3),
    "conversionFileUpdateIsNA" BOOLEAN NOT NULL DEFAULT false,
    "conversionFileValidation" TIMESTAMP(3),
    "conversionFileValidationIsNA" BOOLEAN NOT NULL DEFAULT false,
    "pepGeneration" TIMESTAMP(3),
    "pepGenerationIsNA" BOOLEAN NOT NULL DEFAULT false,
    "connectitTdsCreation" TIMESTAMP(3),
    "connectitTdsCreationIsNA" BOOLEAN NOT NULL DEFAULT false,
    "connectitPreloadCreation" TIMESTAMP(3),
    "connectitPreloadCreationIsNA" BOOLEAN NOT NULL DEFAULT false,
    "checklistCreation" TIMESTAMP(3),
    "checklistCreationIsNA" BOOLEAN NOT NULL DEFAULT false,
    "vmDeleteList" TIMESTAMP(3),
    "vmDeleteListIsNA" BOOLEAN NOT NULL DEFAULT false,
    "vmDeletesComplete" TIMESTAMP(3),
    "vmDeletesCompleteIsNA" BOOLEAN NOT NULL DEFAULT false,
    "lcmNetworkDeletes" TIMESTAMP(3),
    "lcmNetworkDeletesIsNA" BOOLEAN NOT NULL DEFAULT false,
    "lcmNetworkDeletesTicket" TEXT,
    "macdCreation" TIMESTAMP(3),
    "macdCreationIsNA" BOOLEAN NOT NULL DEFAULT false,
    "atsMacdApproval" TIMESTAMP(3),
    "atsMacdApprovalIsNA" BOOLEAN NOT NULL DEFAULT false,
    "lcmNetworkDeleteCompletion" TIMESTAMP(3),
    "lcmNetworkDeleteCompletionIsNA" BOOLEAN NOT NULL DEFAULT false,
    "dlpUploads" TIMESTAMP(3),
    "dlpUploadsIsNA" BOOLEAN NOT NULL DEFAULT false,
    "cdmLoad" TIMESTAMP(3),
    "cdmLoadIsNA" BOOLEAN NOT NULL DEFAULT false,
    "inServiceVavAudit" TIMESTAMP(3),
    "inServiceVavAuditIsNA" BOOLEAN NOT NULL DEFAULT false,
    "globalCvaasAudit" TIMESTAMP(3),
    "globalCvaasAuditIsNA" BOOLEAN NOT NULL DEFAULT false,
    "dnsDeletes" TIMESTAMP(3),
    "dnsDeletesIsNA" BOOLEAN NOT NULL DEFAULT false,
    "dnsDeletesTicket" TEXT,
    "dnsAdds" TIMESTAMP(3),
    "dnsAddsIsNA" BOOLEAN NOT NULL DEFAULT false,
    "dnsAddsTicket" TEXT,
    "lcmAddTicket" TIMESTAMP(3),
    "lcmAddTicketIsNA" BOOLEAN NOT NULL DEFAULT false,
    "lcmAddTicketNumber" TEXT,
    "preloadTicketSubmitted" TIMESTAMP(3),
    "preloadTicketSubmittedIsNA" BOOLEAN NOT NULL DEFAULT false,
    "preloadTicketNumber" TEXT,
    "ixcRoamingSmop" TIMESTAMP(3),
    "ixcRoamingSmopIsNA" BOOLEAN NOT NULL DEFAULT false,
    "ixcRoamingSmopTicket" TEXT,
    "gtmVvmSmop" TIMESTAMP(3),
    "gtmVvmSmopIsNA" BOOLEAN NOT NULL DEFAULT false,
    "gtmVvmSmopTicket" TEXT,
    "otherRouting" TIMESTAMP(3),
    "otherRoutingIsNA" BOOLEAN NOT NULL DEFAULT false,
    "publishPep" TIMESTAMP(3),
    "publishPepIsNA" BOOLEAN NOT NULL DEFAULT false,
    "ticketNotificationEmail" TIMESTAMP(3),
    "ticketNotificationEmailIsNA" BOOLEAN NOT NULL DEFAULT false,
    "myloginsRequest" TIMESTAMP(3),
    "myloginsRequestIsNA" BOOLEAN NOT NULL DEFAULT false,
    "lcmComplete" TIMESTAMP(3),
    "lcmCompleteIsNA" BOOLEAN NOT NULL DEFAULT false,
    "preloadComplete" TIMESTAMP(3),
    "preloadCompleteIsNA" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "completedDateIsNA" BOOLEAN NOT NULL DEFAULT false,
    "isHistory" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Pod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogIssue" (
    "id" TEXT NOT NULL,
    "pod" TEXT NOT NULL,
    "dateOpened" TIMESTAMP(3) NOT NULL,
    "dateOpenedIsNA" BOOLEAN NOT NULL DEFAULT false,
    "lepVersionBeingApplied" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rootCauseOwner" TEXT NOT NULL,
    "resolutionOwner" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "podId" TEXT,
    "logIssueId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "podId" TEXT,
    "logIssueId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PodToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PodToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CreatedBy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CreatedBy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "_PodToTransaction_B_index" ON "_PodToTransaction"("B");

-- CreateIndex
CREATE INDEX "_CreatedBy_B_index" ON "_CreatedBy"("B");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pod" ADD CONSTRAINT "Pod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogIssue" ADD CONSTRAINT "LogIssue_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_logIssueId_fkey" FOREIGN KEY ("logIssueId") REFERENCES "LogIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_logIssueId_fkey" FOREIGN KEY ("logIssueId") REFERENCES "LogIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodToTransaction" ADD CONSTRAINT "_PodToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "Pod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodToTransaction" ADD CONSTRAINT "_PodToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CreatedBy" ADD CONSTRAINT "_CreatedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Pod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CreatedBy" ADD CONSTRAINT "_CreatedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
