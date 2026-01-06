"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type { Pod, LogIssue, SearchCriteria, PodStatusHistory } from "@/lib/types";
import { createTransaction } from "@/lib/transaction";
import { differenceInDays } from "date-fns";
import moment from 'moment-business-days';
import { determineRouterType } from "@/lib/utils";

// Helper function to convert string dates to Date objects or null
function parseDate(dateStr: string | null, isNA = false): Date | null {
  if (isNA || !dateStr) return null;
  try {
    // Use moment to parse the date string
    const momentDate = moment(dateStr, "YYYY-MM-DD")
    return momentDate.isValid() ? momentDate.toDate() : new Date(dateStr);
  } catch (e) {
    return null;
  }
}

// Helper function to convert Date objects to string dates or null
function formatDate(date: Date | null): string | null {
  if (!date) return null;
  // Use moment to format as YYYY-MM-DD
  return moment(date).format("YYYY-MM-DD");
}

// Helper function to calculate total elapsed time
function calculateTotalElapsedTime(
  assignedEngineerDate: Date | null,
  lcmComplete: Date | null
): number {
  if (!assignedEngineerDate) return 0;

  const endDate = lcmComplete || new Date();
  return differenceInDays(endDate, assignedEngineerDate);
}

// Helper function to calculate time in current status
function formatTimeInCurrentStatus(
  subStatus: string,
  subStatusLastChanged: Date | null
): string {
  if (!subStatusLastChanged) return `${subStatus} - N/A`;

  const days = differenceInDays(new Date(), subStatusLastChanged)+1;
  return `${subStatus} - ${days} days`;
}

// Helper function to create status history records
async function createStatusHistory(
  podId: string,
  currentStatus: string,
  currentSubStatus: string,
  previousStatus?: string,
  previousSubStatus?: string,
  changedById?: string
): Promise<void> {
  try {
    // Create status history record if status changed
    if (previousStatus && previousStatus !== currentStatus) {
      await prisma.podStatusHistory.create({
        data: {
          podId,
          status: currentStatus,
          previousStatus,
          changedById,
        },
      });
    }

    // Create substatus history record if substatus changed
    if (previousSubStatus && previousSubStatus !== currentSubStatus) {
      await prisma.podStatusHistory.create({
        data: {
          podId,
          subStatus: currentSubStatus,
          previousSubStatus,
          changedById,
        },
      });
    }
  } catch (error) {
    console.error("Error creating status history:", error);
    // Don't throw error to avoid breaking the main operation
  }
}


// Convert Pod from client to database format
function clientToDatabasePod(pod: Pod) {
  // Calculate total elapsed time
  const assignedEngineerDate = parseDate(pod.assignedEngineerDate || null);
  const lcmComplete = parseDate(pod.lcmComplete, pod.lcmCompleteIsNA);
  const totalElapsedTime = calculateTotalElapsedTime(
    assignedEngineerDate,
    lcmComplete
  );

  // Format time in current status
  const subStatusLastChanged = parseDate(pod.subStatusLastChanged || null);
  const timeInCurrentStatus = formatTimeInCurrentStatus(
    pod.subStatus,
    subStatusLastChanged
  );

  // SLA Calculated NBD automation using moment.js
  let slaCalculatedNbd = parseDate(pod.slaCalculatedNbd, pod.slaCalculatedNbdIsNA)
  if (pod.podWorkableDate && pod.podTypeOriginal) {
    const workableDate = parseDate(pod.podWorkableDate, pod.podWorkableDateIsNA)
    let days = 0
    if (pod.podTypeOriginal === 'FFA') days = 22
    else if (pod.podTypeOriginal === 'Greenfield') days = 10
    else if (pod.podTypeOriginal === 'Brownfield Upgrades') days = 15
    if (workableDate && days > 0) {
      // Use .toDate() instead of ._d to avoid TypeScript error
      slaCalculatedNbd = moment(workableDate).businessAdd(days).toDate();
    }
  }

  return {
    pod: pod.pod,
    internalPodId: pod.internalPodId,
    type: pod.type,
    assignedEngineer: pod.assignedEngineer,
    status: pod.status,
    subStatus: pod.subStatus,
    org: pod.org,
    priority: pod.priority || 9999,
    creationTimestamp: parseDate(
      pod.creationTimestamp,
      pod.creationTimestampIsNA
    ),
    podTypeOriginal: pod.podTypeOriginal,
    creationTimestampIsNA: pod.creationTimestampIsNA || false,
    slaCalculatedNbd,
    slaCalculatedNbdIsNA: pod.slaCalculatedNbdIsNA || false,
    podWorkableDate: parseDate(pod.podWorkableDate, pod.podWorkableDateIsNA),
    podWorkableDateIsNA: pod.podWorkableDateIsNA || false,
    totalElapsedCycleTime: totalElapsedTime, // Use calculated value
    workableCycleTime: pod.workableCycleTime,
    timeInCurrentStatus: timeInCurrentStatus, // Use formatted value
    clli: pod.clli,
    city: pod.city,
    state: pod.state,
    routerType: pod.routerType,
    router1: pod.router1,
    router2: pod.router2,
    podProgramType: pod.podProgramType,
    tenantName: pod.tenantName,
    currentLepVersion: pod.currentLepVersion,
    lepVersionToBeApplied: pod.lepVersionToBeApplied,
    podType: pod.podType,
    special: pod.special,
    lepAssessment: parseDate(pod.lepAssessment, pod.lepAssessmentIsNA),
    lepAssessmentIsNA: pod.lepAssessmentIsNA || false,
    dlpTemplateUpdates: parseDate(
      pod.dlpTemplateUpdates,
      pod.dlpTemplateUpdatesIsNA
    ),
    dlpTemplateUpdatesIsNA: pod.dlpTemplateUpdatesIsNA || false,
    ipAcquisition: parseDate(pod.ipAcquisition, pod.ipAcquisitionIsNA),
    ipAcquisitionIsNA: pod.ipAcquisitionIsNA || false,
    ipAllocation: parseDate(pod.ipAllocation, pod.ipAllocationIsNA),
    ipAllocationIsNA: pod.ipAllocationIsNA || false,
    conversionFileUpdate: parseDate(
      pod.conversionFileUpdate,
      pod.conversionFileUpdateIsNA
    ),
    conversionFileUpdateIsNA: pod.conversionFileUpdateIsNA || false,
    conversionFileValidation: parseDate(
      pod.conversionFileValidation,
      pod.conversionFileValidationIsNA
    ),
    conversionFileValidationIsNA: pod.conversionFileValidationIsNA || false,
    pepGeneration: parseDate(pod.pepGeneration, pod.pepGenerationIsNA),
    pepGenerationIsNA: pod.pepGenerationIsNA || false,
    connectitTdsCreation: parseDate(
      pod.connectitTdsCreation,
      pod.connectitTdsCreationIsNA
    ),
    connectitTdsCreationIsNA: pod.connectitTdsCreationIsNA || false,
    connectitPreloadCreation: parseDate(
      pod.connectitPreloadCreation,
      pod.connectitPreloadCreationIsNA
    ),
    connectitPreloadCreationIsNA: pod.connectitPreloadCreationIsNA || false,
    checklistCreation: parseDate(
      pod.checklistCreation,
      pod.checklistCreationIsNA
    ),
    checklistCreationIsNA: pod.checklistCreationIsNA || false,
    vmDeleteList: parseDate(pod.vmDeleteList, pod.vmDeleteListIsNA),
    vmDeleteListIsNA: pod.vmDeleteListIsNA || false,
    vmDeletesComplete: parseDate(
      pod.vmDeletesComplete,
      pod.vmDeletesCompleteIsNA
    ),
    vmDeletesCompleteIsNA: pod.vmDeletesCompleteIsNA || false,
    lcmNetworkDeletes: parseDate(
      pod.lcmNetworkDeletes,
      pod.lcmNetworkDeletesIsNA
    ),
    lcmNetworkDeletesIsNA: pod.lcmNetworkDeletesIsNA || false,
    lcmNetworkDeletesTicket: pod.lcmNetworkDeletesTicket || null,
    macdCreation: parseDate(pod.macdCreation, pod.macdCreationIsNA),
    macdCreationIsNA: pod.macdCreationIsNA || false,
    atsMacdApproval: parseDate(pod.atsMacdApproval, pod.atsMacdApprovalIsNA),
    atsMacdApprovalIsNA: pod.atsMacdApprovalIsNA || false,
    lcmNetworkDeleteCompletion: parseDate(
      pod.lcmNetworkDeleteCompletion,
      pod.lcmNetworkDeleteCompletionIsNA
    ),
    lcmNetworkDeleteCompletionIsNA: pod.lcmNetworkDeleteCompletionIsNA || false,
    dlpUploads: parseDate(pod.dlpUploads, pod.dlpUploadsIsNA),
    dlpUploadsIsNA: pod.dlpUploadsIsNA || false,
    cdmLoad: parseDate(pod.cdmLoad, pod.cdmLoadIsNA),
    cdmLoadIsNA: pod.cdmLoadIsNA || false,
    inServiceVavAudit: parseDate(
      pod.inServiceVavAudit,
      pod.inServiceVavAuditIsNA
    ),
    inServiceVavAuditIsNA: pod.inServiceVavAuditIsNA || false,
    globalCvaasAudit: parseDate(pod.globalCvaasAudit, pod.globalCvaasAuditIsNA),
    globalCvaasAuditIsNA: pod.globalCvaasAuditIsNA || false,
    dns: parseDate(pod.dns, pod.dnsIsNA),
    dnsIsNA: pod.dnsIsNA || false,
    dnsTicketAddsDeletes: pod.dnsTicketAddsDeletes || null,
    dnsTicketChanges: pod.dnsTicketChanges || null,
    lcmAddTicket: parseDate(pod.lcmAddTicket, pod.lcmAddTicketIsNA),
    lcmAddTicketIsNA: pod.lcmAddTicketIsNA || false,
    lcmAddTicketNumber: pod.lcmAddTicketNumber || null,
    preloadTicketSubmitted: parseDate(
      pod.preloadTicketSubmitted,
      pod.preloadTicketSubmittedIsNA
    ),
    preloadTicketSubmittedIsNA: pod.preloadTicketSubmittedIsNA || false,
    preloadTicketNumber1: pod.preloadTicketNumber1 || null,
    preloadTicketNumber2: pod.preloadTicketNumber2 || null,
    preloadTicketNumber3: pod.preloadTicketNumber3 || null,
    ixcRoamingSmop: parseDate(pod.ixcRoamingSmop, pod.ixcRoamingSmopIsNA),
    ixcRoamingSmopIsNA: pod.ixcRoamingSmopIsNA || false,
    ixcRoamingSmopTicket: pod.ixcRoamingSmopTicket || null,
    gtmVvmSmop: parseDate(pod.gtmVvmSmop, pod.gtmVvmSmopIsNA),
    gtmVvmSmopIsNA: pod.gtmVvmSmopIsNA || false,
    gtmVvmSmopTicket: pod.gtmVvmSmopTicket || null,
    otherRouting: parseDate(pod.otherRouting, pod.otherRoutingIsNA),
    otherRoutingIsNA: pod.otherRoutingIsNA || false,
    publishPep: parseDate(pod.publishPep, pod.publishPepIsNA),
    publishPepIsNA: pod.publishPepIsNA || false,
    ticketNotificationEmail: parseDate(
      pod.ticketNotificationEmail,
      pod.ticketNotificationEmailIsNA
    ),
    ticketNotificationEmailIsNA: pod.ticketNotificationEmailIsNA || false,
    myloginsRequest: parseDate(pod.myloginsRequest, pod.myloginsRequestIsNA),
    myloginsRequestIsNA: pod.myloginsRequestIsNA || false,
    lcmComplete: parseDate(pod.lcmComplete, pod.lcmCompleteIsNA),
    lcmCompleteIsNA: pod.lcmCompleteIsNA || false,
    preloadComplete: parseDate(pod.preloadComplete, pod.preloadCompleteIsNA),
    preloadCompleteIsNA: pod.preloadCompleteIsNA || false,
    completedDate:
      pod.completedDate !== undefined
        ? parseDate(pod.completedDate, pod.completedDateIsNA)
        : null,
    completedDateIsNA: pod.completedDateIsNA || false,
    shouldDisplay: pod.shouldDisplay !== undefined ? pod.shouldDisplay : true,
    createdById: pod.createdById || null,
    notes: pod.notes || null,
    projectManagers: pod.projectManagers || null,
    linkToActiveTds: pod.linkToActiveTds || null,
    linkToActivePreloads: pod.linkToActivePreloads || null,
  };
}

// Convert Pod from database to client format
function databaseToClientPod(pod: any): Pod {
  // Calculate total elapsed time
  const totalElapsedTime = calculateTotalElapsedTime(
    pod.assignedEngineerDate,
    pod.lcmComplete
  );

  // Format time in current status

  const timeInCurrentStatus = formatTimeInCurrentStatus(
    pod.subStatus,
    pod.subStatusLastChanged
  );

  
  return {
    id: pod.id, // Include the id field
    pod: pod.pod,
    internalPodId: pod.internalPodId,
    type: pod.type,
    assignedEngineer: pod.assignedEngineer,
    assignedEngineerDate: formatDate(pod.assignedEngineerDate),
    status: pod.status as any,
    subStatus: pod.subStatus as any,
    subStatusLastChanged: formatDate(pod.subStatusLastChanged),
    org: pod.org as any,
    priority: pod.priority,
    creationTimestamp: formatDate(pod.creationTimestamp),
    creationTimestampIsNA: pod.creationTimestampIsNA,
    slaCalculatedNbd: formatDate(pod.slaCalculatedNbd),
    slaCalculatedNbdIsNA: pod.slaCalculatedNbdIsNA,
    podWorkableDate: formatDate(pod.podWorkableDate),
    podWorkableDateIsNA: pod.podWorkableDateIsNA,
    totalElapsedCycleTime: totalElapsedTime, // Use calculated value
    workableCycleTime: pod.workableCycleTime,
    timeInCurrentStatus: timeInCurrentStatus, // Use formatted value
    clli: pod.clli,
    city: pod.city,
    state: pod.state,
    routerType: pod.routerType,
    router1: pod.router1,
    router2: pod.router2,
    podProgramType: pod.podProgramType,
    tenantName: pod.tenantName,
    currentLepVersion: pod.currentLepVersion,
    lepVersionToBeApplied: pod.lepVersionToBeApplied,
    podType: pod.podType as any,
    podTypeOriginal: pod.podTypeOriginal,
    special: pod.special,
    lepAssessment: formatDate(pod.lepAssessment),
    lepAssessmentIsNA: pod.lepAssessmentIsNA,
    dlpTemplateUpdates: formatDate(pod.dlpTemplateUpdates),
    dlpTemplateUpdatesIsNA: pod.dlpTemplateUpdatesIsNA,
    ipAcquisition: formatDate(pod.ipAcquisition),
    ipAcquisitionIsNA: pod.ipAcquisitionIsNA,
    ipAllocation: formatDate(pod.ipAllocation),
    ipAllocationIsNA: pod.ipAllocationIsNA,
    conversionFileUpdate: formatDate(pod.conversionFileUpdate),
    conversionFileUpdateIsNA: pod.conversionFileUpdateIsNA,
    conversionFileValidation: formatDate(pod.conversionFileValidation),
    conversionFileValidationIsNA: pod.conversionFileValidationIsNA,
    pepGeneration: formatDate(pod.pepGeneration),
    pepGenerationIsNA: pod.pepGenerationIsNA,
    connectitTdsCreation: formatDate(pod.connectitTdsCreation),
    connectitTdsCreationIsNA: pod.connectitTdsCreationIsNA,
    connectitPreloadCreation: formatDate(pod.connectitPreloadCreation),
    connectitPreloadCreationIsNA: pod.connectitPreloadCreationIsNA,
    checklistCreation: formatDate(pod.checklistCreation),
    checklistCreationIsNA: pod.checklistCreationIsNA,
    vmDeleteList: formatDate(pod.vmDeleteList),
    vmDeleteListIsNA: pod.vmDeleteListIsNA,
    vmDeletesComplete: formatDate(pod.vmDeletesComplete),
    vmDeletesCompleteIsNA: pod.vmDeletesCompleteIsNA,
    lcmNetworkDeletes: formatDate(pod.lcmNetworkDeletes),
    lcmNetworkDeletesIsNA: pod.lcmNetworkDeletesIsNA,
    lcmNetworkDeletesTicket: pod.lcmNetworkDeletesTicket,
    macdCreation: formatDate(pod.macdCreation),
    macdCreationIsNA: pod.macdCreationIsNA,
    atsMacdApproval: formatDate(pod.atsMacdApproval),
    atsMacdApprovalIsNA: pod.atsMacdApprovalIsNA,
    lcmNetworkDeleteCompletion: formatDate(pod.lcmNetworkDeleteCompletion),
    lcmNetworkDeleteCompletionIsNA: pod.lcmNetworkDeleteCompletionIsNA,
    dlpUploads: formatDate(pod.dlpUploads),
    dlpUploadsIsNA: pod.dlpUploadsIsNA,
    cdmLoad: formatDate(pod.cdmLoad),
    cdmLoadIsNA: pod.cdmLoadIsNA,
    inServiceVavAudit: formatDate(pod.inServiceVavAudit),
    inServiceVavAuditIsNA: pod.inServiceVavAuditIsNA,
    globalCvaasAudit: formatDate(pod.globalCvaasAudit),
    globalCvaasAuditIsNA: pod.globalCvaasAuditIsNA,
    dns: formatDate(pod.dns),
    dnsIsNA: pod.dnsIsNA,
    dnsTicketAddsDeletes: pod.dnsTicketAddsDeletes,
    dnsTicketChanges: pod.dnsTicketChanges,
    lcmAddTicket: formatDate(pod.lcmAddTicket),
    lcmAddTicketIsNA: pod.lcmAddTicketIsNA,
    lcmAddTicketNumber: pod.lcmAddTicketNumber,
    preloadTicketSubmitted: formatDate(pod.preloadTicketSubmitted),
    preloadTicketSubmittedIsNA: pod.preloadTicketSubmittedIsNA,
    preloadTicketNumber1: pod.preloadTicketNumber1,
    preloadTicketNumber2: pod.preloadTicketNumber2,
    preloadTicketNumber3: pod.preloadTicketNumber3,
    ixcRoamingSmop: formatDate(pod.ixcRoamingSmop),
    ixcRoamingSmopIsNA: pod.ixcRoamingSmopIsNA,
    ixcRoamingSmopTicket: pod.ixcRoamingSmopTicket,
    gtmVvmSmop: formatDate(pod.gtmVvmSmop),
    gtmVvmSmopIsNA: pod.gtmVvmSmopIsNA,
    gtmVvmSmopTicket: pod.gtmVvmSmopTicket,
    otherRouting: formatDate(pod.otherRouting),
    otherRoutingIsNA: pod.otherRoutingIsNA,
    publishPep: formatDate(pod.publishPep),
    publishPepIsNA: pod.publishPepIsNA,
    ticketNotificationEmail: formatDate(pod.ticketNotificationEmail),
    ticketNotificationEmailIsNA: pod.ticketNotificationEmailIsNA,
    myloginsRequest: formatDate(pod.myloginsRequest),
    myloginsRequestIsNA: pod.myloginsRequestIsNA,
    lcmComplete: formatDate(pod.lcmComplete),
    lcmCompleteIsNA: pod.lcmCompleteIsNA,
    preloadComplete: formatDate(pod.preloadComplete),
    preloadCompleteIsNA: pod.preloadCompleteIsNA,
    completedDate: pod.completedDate
      ? formatDate(pod.completedDate)
      : undefined,
    completedDateIsNA: pod.completedDateIsNA,
    shouldDisplay: pod.shouldDisplay,
    createdById: pod.createdById,
    notes: pod.notes,
    projectManagers: pod.projectManagers,
    linkToActiveTds: pod.linkToActiveTds,
    linkToActivePreloads: pod.linkToActivePreloads,
  };
}

// Convert LogIssue from client to database format
function clientToDatabaseLogIssue(logIssue: LogIssue) {
  return {
    pod: logIssue.pod,
    dateOpened:
      parseDate(logIssue.dateOpened, !Boolean(logIssue.dateOpened)) ||
      new Date(),

    lepVersionBeingApplied: logIssue.lepVersionBeingApplied,
    status: logIssue.status,
    rootCauseOwner: logIssue.rootCauseOwner,
    resolutionOwner: logIssue.resolutionOwner,
    description: logIssue.description,
    notes: logIssue.notes,
    createdById: logIssue.createdById || null,
  };
}

// Convert LogIssue from database to client format
function databaseToClientLogIssue(logIssue: any): LogIssue {
  return {
    id: logIssue.id,
    pod: logIssue.pod,
    dateOpened: formatDate(logIssue.dateOpened) || "",

    lepVersionBeingApplied: logIssue.lepVersionBeingApplied,
    status: logIssue.status,
    rootCauseOwner: logIssue.rootCauseOwner,
    resolutionOwner: logIssue.resolutionOwner,
    description: logIssue.description,
    notes: logIssue.notes,
    createdById: logIssue.createdById,
  };
}

// Update the updatePod function to handle subStatus changes
export async function updatePod(pod: Pod, userId: string) {

  try {
    // Check if pod and id are defined
    if (!pod) {
      return { success: false, message: "No POD data provided" };
    }

    if (!pod.id) {
      return { success: false, message: "POD ID is required for updates" };
    }

    // Get original pod for comparison
    const originalPod = await prisma.pod.findUnique({
      where: { id: pod.id },
    });

    if (!originalPod) {
      return { success: false, message: "POD not found" };
    }

    // Check if subStatus has changed
    const subStatusChanged = originalPod.subStatus !== pod.subStatus;

    // If assignedEngineer is being set for the first time, record the date
    const assignedEngineerDate =
      pod.assignedEngineer && !originalPod.assignedEngineerDate
        ? new Date()
        : originalPod.assignedEngineerDate;

    // Convert client data to database format
    const dbPod = clientToDatabasePod(pod);

    console.log("dbPod", dbPod);
    console.log("origfinal pod", originalPod.assignedEngineer);
    console.log("db pod", dbPod.assignedEngineer);
    
    const updatedPod = await prisma.pod.update({
      where: {
        id: pod.id, // Use the ID for updating
      },
      data: {
        ...dbPod,

        subStatusLastChanged: subStatusChanged
          ? new Date()
          : originalPod.subStatusLastChanged,
        assignedEngineerDate: assignedEngineerDate,
      },
    });

    // Create status history records if status or substatus changed
    await createStatusHistory(
      updatedPod.id,
      updatedPod.status,
      updatedPod.subStatus,
      originalPod.status,
      originalPod.subStatus,
      userId
    );

    console.log("original pod", originalPod);
    console.log("updated pod", updatedPod);

    if (
      updatedPod.assignedEngineer.trim() != originalPod.assignedEngineer.trim()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          email: {
            equals: updatedPod.assignedEngineer.trim(),
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
               createdForId: user.id,
              message: `Pod ${updatedPod.pod} has been Assigned to you`,
              createdById: userId
            },
          })
        )
      );
    }

    if (
      updatedPod.lcmAddTicket?.toDateString() !=
      originalPod.lcmAddTicket?.toDateString()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          role: {
            equals: "PRIORITY",
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message: `LCM Add Ticket was submitted for the ${updatedPod.pod}  on
              ${updatedPod.lcmAddTicket?.toDateString()} `,
              createdById: userId
            },
          })
        )
      );
    }

    if (
      updatedPod.lcmComplete?.toDateString() !=
      originalPod.lcmComplete?.toDateString()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          role: {
            equals: "PRIORITY",
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message: `POD ${updatedPod.pod}  has completed LCM processes on ${updatedPod.lcmComplete?.toDateString()}`,
              createdById: userId
            },
          })
        )
      );
    }


    if (
      updatedPod.lcmNetworkDeleteCompletion?.toDateString() !=
      originalPod.lcmNetworkDeleteCompletion?.toDateString()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          role: {
            equals: "PRIORITY",
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message: `LCM network deletes ticket has been submitted
              for the pod ${updatedPod.pod} on ${updatedPod.lcmNetworkDeleteCompletion?.toDateString()}`,
              createdById: userId
            },
          })
        )
      );
    }

    if (
      updatedPod.preloadTicketSubmitted?.toDateString() !=
      originalPod.preloadTicketSubmitted?.toDateString()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          role: {
            equals: "PRIORITY",
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message: `preload ticket has been submitted for the pod
              ${updatedPod.pod} on ${updatedPod.preloadTicketSubmitted?.toDateString()}`,
              createdById: userId
            },
          })
        )
      );
    }

    if (
      updatedPod.preloadComplete?.toDateString() !=
      originalPod.preloadComplete?.toDateString()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          role: {
            equals: "PRIORITY",
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message: `Pod ${updatedPod.pod} has completed preloads on ${updatedPod.preloadComplete?.toDateString()}.`,
              createdById: userId
            },
          })
        )
      );
    }


    if (
      updatedPod.vmDeleteList?.toDateString() !=
      originalPod.vmDeleteList?.toDateString()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          role: {
            equals: "PRIORITY",
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message: `VM Delete ticket has been submitted for the Pod ${updatedPod.pod}
              on ${updatedPod.vmDeleteList?.toDateString()}`,
              createdById: userId
            },
          })
        )
      );
    }

    if (
      updatedPod.vmDeletesComplete?.toDateString() !=
      originalPod.vmDeletesComplete?.toDateString()
    ) {
      const otherUsers = await prisma.user.findMany({
        where: {
          role: {
            equals: "PRIORITY",
          },
        },
      });

      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message: `VM Deletes have been completed for the pod ${updatedPod.pod} on
              ${updatedPod.vmDeleteList?.toDateString()}`,
              createdById: userId
            },
          })
        )
      );
    }
    // Record transaction with changes
    const changes = {
      before: originalPod,
      after: updatedPod,
    };

    await createTransaction({
      entityType: "Pod",
      entityId: pod.id,
      action: "update",
      details: JSON.stringify(changes),
      podId: pod.id,
      createdById: userId,
    });

    revalidatePath("/main");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Error updating pod:", error);
    return { success: false, message: "Failed to update POD" };
  }
}

// Keep all other functions the same...

// POD Actions with pagination and search
export async function getPods(
  page = 1,
  pageSize = 10,
  searchCriteria: SearchCriteria[] = [],
  userId?: string
) {
  try {

   
    // Get user role to determine visibility
    let userRole = null;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      userRole = user?.role;
    }

    console.log("user role", userRole,"userId",userId);
    // Create search conditions with proper typing
    const whereConditions: {
      isHistory: boolean;
      isDeleted: boolean; // Add isDeleted condition
      AND?: Array<Record<string, any>>;
      OR?: Array<Record<string, any>>;
    } = {
      isHistory: false,
      isDeleted: false, // Only return non-deleted pods
    };

    // Filter based on shouldDisplay field and user role
    if (userRole === "SUPER_ADMIN" || userRole === "PRIORITY") {
      // SUPER_ADMIN can see all pods
    }  else {
      // Other roles (REGULAR, ADMIN) can only see pods where shouldDisplay is true
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        { shouldDisplay: true }
      ];
    }

    // Handle special case for Priority search
    const prioritySearch = searchCriteria.find(
      (criteria) => criteria.field === "priority"
    );
    const otherCriteria = searchCriteria.filter(
      (criteria) => criteria.field !== "priority"
    );

    // Apply other criteria
    if (otherCriteria.length > 0) {
      whereConditions.AND = otherCriteria.map((criteria) => ({
        [criteria.field]: {
          contains: criteria.value,
          mode: "insensitive" as const,
        },
      }));
    }

    // Special handling for priority - if priority is selected, get all records with priority < 9999
    if (prioritySearch) {
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        { priority: { lt: 9999 } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.pod.count({
      where: whereConditions,
    });


    // Get paginated data
    const pods = await prisma.pod.findMany({
      where: whereConditions,
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    console.log("where conditions", whereConditions,"pods count",pods.length,"total count",totalCount); 

    return {
      pods: pods.map(databaseToClientPod),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching pods:", error);
    return {
      pods: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function getHistoryPods(
  page = 1,
  pageSize = 10,
  searchCriteria: SearchCriteria[] = []
) {
  try {
    // Create search conditions with proper typing
    const whereConditions: {
      isHistory: boolean;
      isDeleted: boolean; // Add isDeleted condition
      AND?: Array<Record<string, any>>;
      OR?: Array<Record<string, any>>;
    } = {
      isHistory: true,
      isDeleted: false, // Only return non-deleted pods
    };

    // Handle special case for Priority search
    const prioritySearch = searchCriteria.find(
      (criteria) => criteria.field === "priority"
    );
    const otherCriteria = searchCriteria.filter(
      (criteria) => criteria.field !== "priority"
    );

    // Apply other criteria
    if (otherCriteria.length > 0) {
      whereConditions.AND = otherCriteria.map((criteria) => ({
        [criteria.field]: {
          contains: criteria.value,
          mode: "insensitive" as const,
        },
      }));
    }

    // Special handling for priority - if priority is selected, get all records with priority < 9999
    if (prioritySearch) {
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        { priority: { lt: 9999 } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.pod.count({
      where: whereConditions,
    });

    // Get paginated data
    const pods = await prisma.pod.findMany({
      where: whereConditions,
      orderBy: {
        completedDate: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      pods: pods.map(databaseToClientPod),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching history pods:", error);
    return {
      pods: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function updatePodPriority(
  podId: string,
  priority: number,
  userId: string
) {
  try {
    // Get original pod for comparison
    const originalPod = await prisma.pod.findUnique({
      where: { id: podId },
    });

    if (!originalPod) {
      return { success: false, message: "POD not found" };
    }

    const updatedPod = await prisma.pod.update({
      where: { id: podId },
      data: { priority },
    });

    // Record transaction with changes
    const changes = {
      before: { priority: originalPod.priority },
      after: { priority: updatedPod.priority },
    };

    await createTransaction({
      entityType: "Pod",
      entityId: podId,
      action: "update_priority",
      details: JSON.stringify(changes),
      podId: podId,
      createdById: userId,
    });

    revalidatePath("/main");
    return { success: true };
  } catch (error) {
    console.error("Error updating pod priority:", error);
    return { success: false, message: "Failed to update POD priority" };
  }
}

export async function deletePod(podId: string, userId: string) {
  try {
    // Find the pod
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
    });

    if (!pod) {
      return { success: false, message: "POD not found" };
    }

    // Record transaction before soft deletion
    await createTransaction({
      entityType: "Pod",
      entityId: podId,
      action: "delete",
      details: JSON.stringify(pod),
      createdById: userId,
    });

    // Soft delete the pod by setting isDeleted to true
    await prisma.pod.update({
      where: { id: podId },
      data: { isDeleted: true },
    });

    revalidatePath("/main");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pod:", error);
    return { success: false, message: "Failed to delete POD" };
  }
}

export async function completePod(podId: string, userId: string) {
  try {
    // Find the pod by its pod identifier and isHistory=false
    const pod = await prisma.pod.findFirst({
      where: {
        pod: podId,
        isHistory: false,
        isDeleted: false, // Only find non-deleted pods
      },
    });

    if (!pod) {
      return { success: false, message: "POD not found" };
    }

    // Update the pod status to Complete but don't move to history
    const updatedPod = await prisma.pod.update({
      where: {
        id: pod.id, // Use the ID for updating
      },
      data: {
        status: "Complete",
        isHistory: true,
        completedDate: new Date(),
      },
    });

    // Record transaction
    const changes = {
      before: { status: pod.status, completedDate: pod.completedDate },
      after: {
        status: updatedPod.status,
        completedDate: updatedPod.completedDate,
      },
    };

    await createTransaction({
      entityType: "Pod",
      entityId: pod.id,
      action: "complete",
      details: JSON.stringify(changes),
      podId: pod.id,
      createdById: userId,
    });

    revalidatePath("/main");
    return { success: true };
  } catch (error) {
    console.error("Error completing pod:", error);
    return { success: false, message: "Failed to complete POD" };
  }
}

export async function checkPodExists(podId: string) {
  try {
    // Check if pod exists in the active (non-history) section
    const pod = await prisma.pod.findFirst({
      where: {
        pod: podId,
        isHistory: false,
        isDeleted: false, // Only check non-deleted pods
      },
    });
    return !!pod;
  } catch (error) {
    console.error("Error checking pod existence:", error);
    return false;
  }
}

export async function moveToActive(podId: string, userId: string) {
  try {
    // Find the pod by its pod identifier and isHistory=true
    const pod = await prisma.pod.findFirst({
      where: {
        pod: podId,
        isHistory: true,
        isDeleted: false, // Only find non-deleted pods
      },
    });

    if (!pod) {
      return { success: false, message: "POD not found in history" };
    }

    // Check if a pod with the same identifier already exists in the active section
    const existingActivePod = await prisma.pod.findFirst({
      where: {
        pod: podId,
        isHistory: false,
        isDeleted: false, // Only check non-deleted pods
      },
    });

    if (existingActivePod) {
      return {
        success: false,
        message: `A POD with ID "${podId}" already exists in the active PODs.`,
      };
    }

    // Determine router type based on router1 and router2
    const determinedRouterType = determineRouterType(pod.router1, pod.router2);
    const finalRouterType = pod.routerType || determinedRouterType;

    // Update the pod
    const updatedPod = await prisma.pod.update({
      where: {
        id: pod.id, // Use the ID for updating
      },
      data: {
        isHistory: false,
        completedDate: null,
        routerType: finalRouterType,
      },
    });

    // Record transaction
    const changes = {
      before: { isHistory: pod.isHistory, completedDate: pod.completedDate },
      after: {
        isHistory: updatedPod.isHistory,
        completedDate: updatedPod.completedDate,
      },
    };

    await createTransaction({
      entityType: "Pod",
      entityId: pod.id,
      action: "move_to_active",
      details: JSON.stringify(changes),
      podId: pod.id,
      createdById: userId,
    });

    revalidatePath("/main");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Error moving pod to active:", error);
    return { success: false, message: "Failed to move POD to active" };
  }
}

// Add a function to move a Pod to history (when its status is Complete)
export async function moveToHistory(podId: string, userId: string) {
  try {
    // Find the pod by its pod identifier and isHistory=false
    const pod = await prisma.pod.findFirst({
      where: {
        id: podId,
        isHistory: false,
        isDeleted: false, // Only find non-deleted pods
      },
    });

    if (!pod) {
      return { success: false, message: "POD not found" };
    }

    // Check if status is Complete
    if (pod.status !== "Complete") {
      return {
        success: false,
        message:
          "POD must have status 'Complete' before it can be moved to history",
      };
    }

    // Update the pod
    const updatedPod = await prisma.pod.update({
      where: {
        id: pod.id, // Use the ID for updating
      },
      data: {
        isHistory: true,
        completedDate: pod.completedDate || new Date(),
      },
    });

    // Record transaction
    const changes = {
      before: { isHistory: pod.isHistory, completedDate: pod.completedDate },
      after: {
        isHistory: updatedPod.isHistory,
        completedDate: updatedPod.completedDate,
      },
    };

    await createTransaction({
      entityType: "Pod",
      entityId: pod.id,
      action: "move_to_history",
      details: JSON.stringify(changes),
      podId: pod.id,
      createdById: userId,
    });

    revalidatePath("/main");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Error moving pod to history:", error);
    return { success: false, message: "Failed to move POD to history" };
  }
}

// LogIssue Actions with pagination and search
export async function getLogIssues(page = 1, pageSize = 10, searchQuery = "") {
  try {
    // Create search conditions
    const searchCondition: any = searchQuery
      ? {
        OR: [
          { pod: { contains: searchQuery, mode: "insensitive" } },
          {
            lepVersionBeingApplied: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          { status: { contains: searchQuery, mode: "insensitive" } },
          { rootCauseOwner: { contains: searchQuery, mode: "insensitive" } },
          { resolutionOwner: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
        ],
        isDeleted: false, // Only return non-deleted log issues
      }
      : { isDeleted: false }; // Only return non-deleted log issues

    // Get total count for pagination
    const totalCount = await prisma.logIssue.count({
      where: searchCondition,
    });

    // Get paginated data
    const logIssues = await prisma.logIssue.findMany({
      where: searchCondition,
      orderBy: {
        dateOpened: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
      logIssues: logIssues.map(databaseToClientLogIssue),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching log issues:", error);
    return {
      logIssues: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function addLogIssue(logIssue: LogIssue, userId: string) {
  try {
    const createdLogIssue = await prisma.logIssue.create({
      data: {
        ...clientToDatabaseLogIssue(logIssue),
        createdById: userId,
      },
    });

    // Notification logic for LogIssue creation
    // Get the created log issue with creator info
    const logIssueWithCreator = await prisma.logIssue.findUnique({
      where: { id: createdLogIssue.id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (logIssueWithCreator) {
      const creatorEmail = logIssueWithCreator.createdBy?.email || "Unknown";
      const message = `New log issue created for POD ${logIssueWithCreator.pod} by ${creatorEmail}`;
      const resolutionOwners = logIssueWithCreator.resolutionOwner || [];

      if (resolutionOwners.length > 0) {
        // Find users by email (resolution owners)
        const users = await prisma.user.findMany({
          where: {
            email: {
              in: resolutionOwners,
            },
            id: {
              not: userId, // Don't notify the creator
            },
          },
        });
        // Create notifications for resolution owners
        await Promise.all(
          users.map((user) =>
            prisma.notification.create({
              data: {
                userId: user.id,
                createdForId: user.id,
                message: `You were assigned as a resolution owner for log issue on POD ${logIssueWithCreator.pod}`,
                podId: logIssueWithCreator.pod,
                logIssueId: logIssueWithCreator.id,
                createdById: userId,
              },
            })
          )
        );
      }

      // Notify ADMIN and SUPER_ADMIN users (except creator and resolution owners)
      const otherUsers = await prisma.user.findMany({
        where: {
          email: {
            notIn: [...resolutionOwners, creatorEmail],
          },
          OR: [
            { role: "ADMIN" },
            { role: "SUPER_ADMIN" },
          ],
          id: {
            not: userId,
          },
        },
      });
      await Promise.all(
        otherUsers.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              message,
              podId: logIssueWithCreator.pod,
              logIssueId: logIssueWithCreator.id,
              createdById: userId,
            },
          })
        )
      );
    }

    // Record transaction
    await createTransaction({
      entityType: "LogIssue",
      entityId: createdLogIssue.id,
      action: "create",
      details: JSON.stringify(createdLogIssue),
      logIssueId: createdLogIssue.id,
      createdById: userId,
    });

    revalidatePath("/log-issues");
    return { success: true };
  } catch (error) {
    console.error("Error adding log issue:", error);
    return { success: false, message: "Failed to add log issue" };
  }
}

export async function updateLogIssue(logIssue: LogIssue, userId: string) {
  try {
    if (!logIssue.id) {
      return {
        success: false,
        message: "Log issue ID is required for updates",
      };
    }

    // Get original log issue for comparison
    const originalLogIssue = await prisma.logIssue.findUnique({
      where: { id: logIssue.id },
    });

    if (!originalLogIssue) {
      return { success: false, message: "Log issue not found" };
    }

    const updatedLogIssue = await prisma.logIssue.update({
      where: { id: logIssue.id },
      data: clientToDatabaseLogIssue(logIssue),
    });

    // Record transaction with changes
    const changes = {
      before: originalLogIssue,
      after: updatedLogIssue,
    };

    await createTransaction({
      entityType: "LogIssue",
      entityId: logIssue.id,
      action: "update",
      details: JSON.stringify(changes),
      logIssueId: logIssue.id,
      createdById: userId,
    });

    // Notification logic for LogIssue updates
    // Get the updated log issue with creator info
    const logIssueWithCreator = await prisma.logIssue.findUnique({
      where: { id: logIssue.id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (logIssueWithCreator) {
      const creatorEmail = logIssueWithCreator.createdBy?.email || "Unknown";
      const message = `Log issue updated for POD ${logIssueWithCreator.pod} by ${creatorEmail}`;
      // Get all users who are resolution owners
 

      const previousLogIssueData = originalLogIssue.resolutionOwner;
      const latestLogIssueData = logIssueWithCreator.resolutionOwner;

      const newResolutionOwners = latestLogIssueData.filter(item => !previousLogIssueData.includes(item));

      if (newResolutionOwners.length > 0) {
        // Find users by email
        const users = await prisma.user.findMany({
          where: {
            email: {
              in: newResolutionOwners,
            },
            id: {
              not: userId, // Don't notify the updater
            },
          },
        });
        // Create notifications for resolution owners
        await Promise.all(
          users.map((user) =>
            prisma.notification.create({
              data: {
                userId: user.id,
                createdForId: user.id,
                message: `You were assigned as a resolution owner for log issue on POD ${logIssueWithCreator.pod}`,
                podId: logIssueWithCreator.pod,
                logIssueId: logIssueWithCreator.id,
                createdById: userId,
              },
            })
          )
        );


        const otherUsers = await prisma.user.findMany({
          where: {
            email: {
              notIn: [...newResolutionOwners, creatorEmail],
            },
            OR: [
              { role: "ADMIN" },
              { role: "SUPER_ADMIN" },
            ],
            id: {
              not: userId,
            },
          },
        });
        await Promise.all(
          otherUsers.map((user) =>
            prisma.notification.create({
              data: {
                userId: user.id,
                message,
                podId: logIssueWithCreator.pod,
                logIssueId: logIssueWithCreator.id,
                createdById: userId,
              },
            })
          )
        );
      }
      // Also notify other users (optional)

    }

    revalidatePath("/log-issues");
    return { success: true };
  } catch (error) {
    console.error("Error updating log issue:", error);
    return { success: false, message: "Failed to update log issue" };
  }
}

// Export data to Excel
export async function exportPodsToExcel(
  isHistory: boolean,
  searchCriteria: SearchCriteria[] = [],
  userId?: string
) {
  try {
    // Get user role to determine visibility
    let userRole = null;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      userRole = user?.role;
    }

    // Create search conditions with proper typing
    const whereConditions: {
      isHistory: boolean;
      isDeleted: boolean; // Add isDeleted condition
      AND?: Array<Record<string, any>>;
    } = {
      isHistory,
      isDeleted: false, // Only export non-deleted pods
    };

    // Filter based on shouldDisplay field and user role
    if (userRole === "SUPER_ADMIN") {
      // SUPER_ADMIN can see all pods
    } else if (userRole === "PRIORITY") {
      // PRIORITY users can see pods where shouldDisplay is false (created by PRIORITY users)
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        { shouldDisplay: false }
      ];
    } else {
      // Other roles (REGULAR, ADMIN) can only see pods where shouldDisplay is true
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        { shouldDisplay: true }
      ];
    }

    if (searchCriteria.length > 0) {
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        ...searchCriteria.map((criteria) => ({
          [criteria.field]: {
            contains: criteria.value,
            mode: "insensitive" as const,
          },
        }))
      ];
    }

    // Get all pods matching criteria
    const pods = await prisma.pod.findMany({
      where: whereConditions,
      orderBy: isHistory
        ? { completedDate: "desc" }
        : [{ priority: "asc" }, { createdAt: "desc" }],
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      pods: pods.map(databaseToClientPod),
    };
  } catch (error) {
    console.error("Error exporting pods:", error);
    return { success: false, message: "Failed to export PODs" };
  }
}

function cleanPayload(payload: Record<string, any>) {
  const cleaned: Record<string, any> = {};

  for (const key in payload) {
    const value = payload[key];
    if (value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export async function addPod(pod: Pod, userId: string) {
  try {
    const dbPod = clientToDatabasePod(pod);

    // Set the assignedEngineerDate if assignedEngineer is provided
    const assignedEngineerDate = pod.assignedEngineer ? new Date() : null;

    // Set subStatusLastChanged to current date
    const subStatusLastChanged = new Date();

    // Get the user's role to determine shouldDisplay
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    // Set shouldDisplay to false if created by PRIORITY user, true otherwise
    const shouldDisplay = user?.role !== "PRIORITY";

    const finalObject: any = cleanPayload({
      ...dbPod,
      assignedEngineerDate,
      subStatusLastChanged,
      shouldDisplay,
      createdById: userId,
    });

    console.log("final object is", finalObject);

    if (!finalObject || typeof finalObject !== "object") {
      throw new Error("Invalid payload object");
    }

    const createdPod = await prisma.pod.create({
      data: finalObject,
    });

    // Create initial status history record for new POD
    await createStatusHistory(
      createdPod.id,
      createdPod.status,
      createdPod.subStatus,
      undefined, // No previous status for new POD
      undefined, // No previous substatus for new POD
      userId
    );

    // Notification logic (similar to updatePod)
    // 1. Notify assignedEngineer if set
    if (createdPod.assignedEngineer) {
      const assignedUsers = await prisma.user.findMany({
        where: {
          email: {
            equals: createdPod.assignedEngineer.trim(),
          },
        },
      });
      await Promise.all(
        assignedUsers.map((user) =>
          prisma.notification.create({
            data: {
               createdForId: user.id,
              userId: user.id,
              message: `Pod ${createdPod.pod} has been Assigned to you`,
              createdById: userId,
            },
          })
        )
      );
    }

    // 2. Notify PRIORITY users for each relevant date field if set
    const priorityUsers = await prisma.user.findMany({
      where: {
        role: {
          equals: "PRIORITY",
        },
      },
    });
    const notifyPriority = async (field: keyof typeof createdPod, message: (date: Date) => string) => {
      const date = createdPod[field] as Date | null;
      if (date) {
        await Promise.all(
          priorityUsers.map((user) =>
            prisma.notification.create({
              data: {
                userId: user.id,
                message: message(date),
                createdById: userId,
              },
            })
          )
        );
      }
    };
    await notifyPriority("lcmAddTicket", (date) => `LCM Add Ticket was submitted for the ${createdPod.pod} on ${date.toDateString()}`);
    await notifyPriority("lcmComplete", (date) => `POD ${createdPod.pod} has completed LCM processes on ${date.toDateString()}`);
    await notifyPriority("lcmNetworkDeleteCompletion", (date) => `LCM network deletes ticket has been submitted for the pod ${createdPod.pod} on ${date.toDateString()}`);
    await notifyPriority("preloadTicketSubmitted", (date) => `preload ticket has been submitted for the pod ${createdPod.pod} on ${date.toDateString()}`);
    await notifyPriority("preloadComplete", (date) => `Pod ${createdPod.pod} has completed preloads on ${date.toDateString()}.`);
    await notifyPriority("vmDeleteList", (date) => `VM Delete ticket has been submitted for the Pod ${createdPod.pod} on ${date.toDateString()}`);
    await notifyPriority("vmDeletesComplete", (date) => `VM Deletes have been completed for the pod ${createdPod.pod} on ${date.toDateString()}`);

    // Record transaction
    await createTransaction({
      entityType: "Pod",
      entityId: createdPod.id,
      action: "create",
      details: JSON.stringify(createdPod),
      podId: createdPod.id,
      createdById: userId,
    });

    revalidatePath("/main");
    return { success: true };
  } catch (error) {
    console.error("Error adding pod:", error);
    return { success: false, message: "Failed to add POD" };
  }
}

export async function getPodByPodId(podId: string) {
  try {
    const pod = await prisma.pod.findFirst({
      where: { 
        pod: podId,
        isDeleted: false 
      },
      select: {
        pod: true,
        city: true,
        state: true,
        clli: true,
        router1: true,
        router2: true,
        podProgramType: true,
        tenantName: true,
        routerType: true,
      }
    });
    
    return pod;
  } catch (error) {
    console.error("Error fetching pod by pod ID:", error);
    return null;
  }
}

export async function getExistingPodsForAutoFill() {
  try {
    const pods = await prisma.pod.findMany({
      where: { 
        isDeleted: false 
      },
      select: {
        pod: true,
        city: true,
        state: true,
        clli: true,
        router1: true,
        router2: true,
        podProgramType: true,
        tenantName: true,
        routerType: true,
      }
    });
    
    // Create a map for quick lookup
    const podMap = new Map();
    pods.forEach(pod => {
      podMap.set(pod.pod, pod);
    });
    
    return podMap;
  } catch (error) {
    console.error("Error fetching existing pods for auto-fill:", error);
    return new Map();
  }
}

export async function getAutofillDataByPodId(podId: string) {
  try {
    const autofillData = await prisma.autofillPod.findUnique({
      where: { 
        pod: podId
      }
    });
    
    return autofillData;
  } catch (error) {
    console.error("Error fetching autofill data for pod:", error);
    return null;
  }
}

export async function togglePodVisibility(podId: string, userId: string) {
  try {
    // Check if user is SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== "SUPER_ADMIN") {
      return { success: false, message: "Only SUPER_ADMIN can toggle pod visibility" };
    }

    // Get current pod
    const currentPod = await prisma.pod.findUnique({
      where: { id: podId }
    });

    if (!currentPod) {
      return { success: false, message: "POD not found" };
    }

    // Toggle shouldDisplay
    const updatedPod = await prisma.pod.update({
      where: { id: podId },
      data: { shouldDisplay: !currentPod.shouldDisplay }
    });

    // Record transaction
    await createTransaction({
      entityType: "Pod",
      entityId: podId,
      action: "toggle_visibility",
      details: JSON.stringify({ 
        previousVisibility: currentPod.shouldDisplay, 
        newVisibility: updatedPod.shouldDisplay 
      }),
      podId: podId,
      createdById: userId,
    });

    return { success: true, message: "Pod visibility updated successfully" };
  } catch (error) {
    console.error("Error toggling pod visibility:", error);
    return { success: false, message: "Failed to toggle pod visibility" };
  }
}

export async function addDuplicatePod(pod: Pod, userId: string) {
  try {
    // Check if pod already exists in main page (isHistory: false, isDeleted: false)
    const existingPod = await prisma.pod.findFirst({
      where: {
        pod: pod.pod,
        isHistory: false,
        isDeleted: false
      }
    });

    if (existingPod) {
      return { 
        success: false, 
        message: `POD ${pod.pod} already exists on the main page. Cannot duplicate.` 
      };
    }

    // Convert to database format and create the pod
    const dbPod = clientToDatabasePod(pod);
    
    // Set the assignedEngineerDate if assignedEngineer is provided
    const assignedEngineerDate = pod.assignedEngineer ? new Date() : null;
    
    // Set subStatusLastChanged to current date
    const subStatusLastChanged = new Date();
    
    const finalObject: any = cleanPayload({
      ...dbPod,
      assignedEngineerDate,
      subStatusLastChanged,
      createdById: userId,
    });
    
    console.log("Creating duplicate pod with data:", finalObject);
    
    const createdPod = await prisma.pod.create({
      data: finalObject,
    });
    
    console.log("Successfully created duplicate pod:", createdPod.id);
    
    // Record transaction
    await createTransaction({
      entityType: "Pod",
      entityId: createdPod.id,
      action: "create_duplicate",
      details: JSON.stringify({ originalPod: pod.pod, createdPodId: createdPod.id }),
      podId: createdPod.id,
      createdById: userId,
    });
    
    revalidatePath("/main");
    return { success: true };
  } catch (error) {
    console.error("Error adding duplicate pod:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to add duplicate POD";
    return { success: false, message: errorMessage };
  }
}
