import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from 'moment-timezone'

// Timezone constant - Central Time
export const TIMEZONE = 'America/Chicago'

// Helper function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format dates in Central Time
export function formatDateInCentralTime(date: Date | string | null | undefined, formatStr: string = 'MM-DD-YYYY'): string {
  if (!date) return 'Not Set'
  try {
    // Parse the date with strict format to avoid locale issues
    let momentDate = moment(date);
    
    // If the date is a string that looks like ISO format, parse it more carefully
    if (typeof date === 'string' && date.includes('T')) {
      momentDate = moment(date, moment.ISO_8601);
    }
    
    if (!momentDate.isValid()) {
      momentDate = moment(date, 'YYYY-MM-DD');
    }
    
    return momentDate.tz(TIMEZONE).format(formatStr)
  } catch (e) {
    return 'Invalid Date'
  }
}

// Helper function to get current date/time in Central Time
export function getCurrentDateInCentralTime(): Date {
  return moment().tz(TIMEZONE).toDate()
}

// Helper function to parse date string in Central Time
export function parseDateInCentralTime(dateStr: string | null, isNA = false): Date | null {
  if (isNA || !dateStr) return null
  try {
    const m = moment.tz(dateStr, TIMEZONE)
    return m.isValid() ? m.toDate() : null
  } catch (e) {
    return null
  }
}

// Helper function to format date string in Central Time for database storage
export function formatDateForDB(date: Date | null): string | null {
  if (!date) return null
  return moment(date).tz(TIMEZONE).format('YYYY-MM-DD')
}

// Helper function to get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case "Complete":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Blocked":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "Paused":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Reject":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "Engineering":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Data Management":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Submited":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
    case "Revision":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    case "Decom":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    case "Initial":
      return "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
    // Log issue statuses
    case "Open":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "In Progress":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Closed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    default:
      return "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
  }
}

// Helper function to get row color based on status
export function getRowColor(status: string): string {

  return "";
  switch (status) {
    case "Complete":
      return "bg-green-50 dark:bg-green-950/30"
    case "Blocked":
      return "bg-red-50 dark:bg-red-950/30"
    case "Paused":
      return "bg-yellow-50 dark:bg-yellow-950/30"
    case "Reject":
      return "bg-orange-50 dark:bg-orange-950/30"
    case "Open":
      return "bg-blue-50 dark:bg-blue-950/30"
    case "In Progress":
      return "bg-purple-50 dark:bg-purple-950/30"
    case "Resolved":
      return "bg-green-50 dark:bg-green-950/30"
    default:
      return ""
  }
}

// Helper function to format field name for display
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// Helper function to get missing fields for completion
export function getMissingFields(pod: any): string[] {
  const missingFields: string[] = []

  // Check if all required date fields have a value or "N/A"
  const dateFields = [
    "slaCalculatedNbd",
    "podWorkableDate",
    "lepAssessment",
    "dlpTemplateUpdates",
    "ipAcquisition",
    "ipAllocation",
    "conversionFileUpdate",
    "conversionFileValidation",
    "pepGeneration",
    "connectitTdsCreation",
    "connectitPreloadCreation",
    "checklistCreation",
    "vmDeleteList",
    "vmDeletesComplete",
    "lcmNetworkDeletes",
    "macdCreation",
    "atsMacdApproval",
    "lcmNetworkDeleteCompletion",
    "dlpUploads",
    "cdmLoad",
    "inServiceVavAudit",
    "globalCvaasAudit",
    "dns",
    "lcmAddTicket",
    "preloadTicketSubmitted",
    "ixcRoamingSmop",
    "gtmVvmSmop",
    "otherRouting",
    "publishPep",
    "ticketNotificationEmail",
    "myloginsRequest",
    "lcmComplete",
    "preloadComplete",
  ]

  // Check date fields
  dateFields.forEach((field) => {
    const hasValue = pod[field] !== null && pod[field] !== undefined && pod[field] !== ""
    const isNA = pod[`${field}IsNA`]
    if (!hasValue && !isNA) {
      missingFields.push(formatFieldName(field))
    }
  })

  // Check ticket number requirements
  if (pod.lcmAddTicket && !pod.lcmAddTicketIsNA && !pod.lcmAddTicketNumber) {
    missingFields.push("LCM Add Ticket Number")
  }
  if (pod.lcmNetworkDeletes && !pod.lcmNetworkDeletesIsNA && !pod.lcmNetworkDeletesTicket) {
    missingFields.push("LCM Network Deletes Ticket")
  }
  if (pod.dns && !pod.dnsIsNA && !pod.dnsTicketAddsDeletes && !pod.dnsTicketChanges) {
    missingFields.push("DNS Ticket (Adds/Deletes or Changes)")
  }
  if (pod.preloadTicketSubmitted && !pod.preloadTicketSubmittedIsNA && !pod.preloadTicketNumber1 && !pod.preloadTicketNumber2 && !pod.preloadTicketNumber3) {
    missingFields.push("Preload Ticket Number (at least one)")
  }
  if (pod.ixcRoamingSmop && !pod.ixcRoamingSmopIsNA && !pod.ixcRoamingSmopTicket) {
    missingFields.push("IXC Roaming SMOP Ticket")
  }
  if (pod.gtmVvmSmop && !pod.gtmVvmSmopIsNA && !pod.gtmVvmSmopTicket) {
    missingFields.push("GTM/VVM SMOP Ticket")
  }

  // Check if all other required fields are filled
  const requiredFields = [
    "pod",
    "internalPodId",
    "podTypeOriginal",
    "assignedEngineer",
    "status",
    "subStatus",
    "org",
    "creationTimestamp",
    "totalElapsedCycleTime",
    "workableCycleTime",
    "clli",
    "city",
    "state",
    "routerType",
    "router1",
    "router2",
    "podProgramType",
    "tenantName",
    "currentLepVersion",
    "lepVersionToBeApplied",
    "podType",
  ]

  requiredFields.forEach((field) => {
    if (pod[field] === null || pod[field] === undefined || pod[field] === "") {
      missingFields.push(formatFieldName(field))
    }
  })

  return missingFields
}

// Helper function to check if all required fields are filled
export function isCompletable(pod: any): boolean {
  const missingFields = getMissingFields(pod)
  return missingFields.length === 0
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Filter pods based on search query
export function filterPods(pods: any[], query: string): any[] {
  if (!query) return pods

  const lowerCaseQuery = query.toLowerCase()

  return pods.filter((pod) => {
    return (
      pod.pod.toLowerCase().includes(lowerCaseQuery) ||
      pod.internalPodId.toLowerCase().includes(lowerCaseQuery) ||
      pod.type.toLowerCase().includes(lowerCaseQuery) ||
      pod.assignedEngineer.toLowerCase().includes(lowerCaseQuery) ||
      pod.status.toLowerCase().includes(lowerCaseQuery) ||
      (pod.subStatus && pod.subStatus.toLowerCase().includes(lowerCaseQuery)) ||
      (pod.tenantName && pod.tenantName.toLowerCase().includes(lowerCaseQuery))
    )
  })
}

// Paginate pods
export function paginatePods(pods: any[], page: number, pageSize: number): any[] {
  const startIndex = (page - 1) * pageSize
  return pods.slice(startIndex, startIndex + pageSize)
}

// Helper function to determine router type based on router1 and router2 endings
export function determineRouterType(router1?: string, router2?: string): string {
  if (!router1 || !router2) return '';
  
  const router1EndsWithJl1 = router1.toLowerCase().endsWith('jl1');
  const router2EndsWithJl1 = router2.toLowerCase().endsWith('jl1');
  const router1EndsWithJl3 = router1.toLowerCase().endsWith('jl3');
  const router2EndsWithJl3 = router2.toLowerCase().endsWith('jl3');
  
  if (router1EndsWithJl1 && router2EndsWithJl1) {
    return 'Rleaf';
  } else if (router1EndsWithJl3 && router2EndsWithJl3) {
    return 'NCX';
  }
  
  return '';
}