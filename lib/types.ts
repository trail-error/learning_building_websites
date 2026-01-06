// Define all the types used in the application

export type Status =
  | "Initial"
  | "Engineering"
  | "Data Management"
  | "Submitted"
  | "Complete"
  | "Revision"
  | "Blocked"
  | "Paused"
  | "Reject"
  | "Decom"

export type SubStatus =
  | "Assignment"
  | "Assessment"
  | "Conversion File"
  | "Ready"
  | "Normalization Required"
  | "PEP Generation"
  | "TDS Generation"
  | "Preload Generation"
  | "Services Connectivity"
  | "NPB"
  | "VM Deletes"
  | "Network Deletes"
  | "MACD Approval"
  | "DLP"
  | "CDM"
  | "CVaaS"
  | "DNS Deletes"
  | "DNS Adds"
  | "Network Adds/MACD"
  | "Preload Deletes"
  | "Preload Adds"
  | "LEP Update"
  | "PEP Update"
  | "ORT Not Complete"
  | "Tenant Definition"

export type Org = "ATS" | "DNS Ops" | "ENG" | "LABS" | "LCM" | "VNF Ops" | "PMO"

export type PodType = "eUPF" | "MS UPF" | "AIA"

export type UserRole = "REGULAR" | "ADMIN" | "PRIORITY" | "SUPER_ADMIN"

// Main POD type with all fields
export interface Pod {
  id?: string // Optional for new pods, required for updates
  pod: string // Unique identifier within active or history section
  internalPodId: string
  type: string
  assignedEngineer: string
  assignedEngineerDate?: string | null // New field
  status: Status
  subStatus: SubStatus
  subStatusLastChanged?: string | null // New field
  org: Org
  priority: number // New field for priority
  creationTimestamp: string | null
  creationTimestampIsNA?: boolean
  slaCalculatedNbd: string | null
  slaCalculatedNbdIsNA?: boolean
  podWorkableDate: string | null
  podWorkableDateIsNA?: boolean
  totalElapsedCycleTime: number
  workableCycleTime: number
  timeInCurrentStatus: string
  clli: string
  city: string
  state: string
  routerType: string
  router1: string
  router2: string
  podProgramType: string
  tenantName: string
  currentLepVersion: string
  lepVersionToBeApplied: string
  podType: PodType // Label as 'Tenant Requirements' in UI
  podTypeOriginal: string // Label as 'Pod Type' in UI
  special: boolean
  lepAssessment: string | null
  lepAssessmentIsNA?: boolean
  dlpTemplateUpdates: string | null
  dlpTemplateUpdatesIsNA?: boolean
  ipAcquisition: string | null
  ipAcquisitionIsNA?: boolean
  ipAllocation: string | null
  ipAllocationIsNA?: boolean
  conversionFileUpdate: string | null
  conversionFileUpdateIsNA?: boolean
  conversionFileValidation: string | null
  conversionFileValidationIsNA?: boolean
  pepGeneration: string | null
  pepGenerationIsNA?: boolean
  connectitTdsCreation: string | null
  connectitTdsCreationIsNA?: boolean
  connectitPreloadCreation: string | null
  connectitPreloadCreationIsNA?: boolean
  checklistCreation: string | null
  checklistCreationIsNA?: boolean
  vmDeleteList: string | null
  vmDeleteListIsNA?: boolean
  vmDeletesComplete: string | null
  vmDeletesCompleteIsNA?: boolean
  lcmNetworkDeletes: string | null
  lcmNetworkDeletesIsNA?: boolean
  lcmNetworkDeletesTicket?: string | null // New field
  macdCreation: string | null
  macdCreationIsNA?: boolean
  atsMacdApproval: string | null
  atsMacdApprovalIsNA?: boolean
  lcmNetworkDeleteCompletion: string | null
  lcmNetworkDeleteCompletionIsNA?: boolean
  dlpUploads: string | null
  dlpUploadsIsNA?: boolean
  cdmLoad: string | null
  cdmLoadIsNA?: boolean
  inServiceVavAudit: string | null
  inServiceVavAuditIsNA?: boolean
  globalCvaasAudit: string | null
  globalCvaasAuditIsNA?: boolean
  dns: string | null
  dnsIsNA?: boolean
  dnsTicketAddsDeletes?: string | null // DNS Adds/Deletes ticket number
  dnsTicketChanges?: string | null // DNS Changes ticket number
  lcmAddTicket: string | null
  lcmAddTicketIsNA?: boolean
  lcmAddTicketNumber?: string | null // New field
  preloadTicketSubmitted: string | null
  preloadTicketSubmittedIsNA?: boolean
  preloadTicketNumber1?: string | null // First preload ticket number
  preloadTicketNumber2?: string | null // Second preload ticket number
  preloadTicketNumber3?: string | null // Third preload ticket number
  ixcRoamingSmop: string | null
  ixcRoamingSmopIsNA?: boolean
  ixcRoamingSmopTicket?: string | null // New field
  gtmVvmSmop: string | null
  gtmVvmSmopIsNA?: boolean
  gtmVvmSmopTicket?: string | null // New field
  otherRouting: string | null
  otherRoutingIsNA?: boolean
  publishPep: string | null
  publishPepIsNA?: boolean
  ticketNotificationEmail: string | null
  ticketNotificationEmailIsNA?: boolean
  myloginsRequest: string | null
  myloginsRequestIsNA?: boolean
  lcmComplete: string | null
  lcmCompleteIsNA?: boolean
  preloadComplete: string | null
  preloadCompleteIsNA?: boolean
  completedDate?: string | null
  completedDateIsNA?: boolean
  notes?: string | null
  projectManagers?: string | null
  linkToActiveTds?: string | null
  linkToActivePreloads?: string | null
  shouldDisplay?: boolean
  createdById?: string | null
}

// Log & Issues type
export interface LogIssue {
  id: string
  pod: string
  dateOpened: string
  lepVersionBeingApplied: string
  status: string
  rootCauseOwner: string
  resolutionOwner: string[]
  description: string
  notes: string
  createdById?: string
}

export interface Transaction {
  id: string
  entityType: string
  entityId: string
  action: string
  details: string
  podId?: string
  logIssueId?: string
  createdById: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface PodStatusHistory {
  id: string
  podId: string
  status?: string | null
  subStatus?: string | null
  previousStatus?: string | null
  previousSubStatus?: string | null
  changedById?: string | null
  createdAt: string
}

export interface SearchCriteria {
  field: string
  value: string | boolean
}

export interface AutofillPod {
  id?: string
  pod: string
  internalPodId?: string
  type?: string
  assignedEngineer?: string
  status?: string
  subStatus?: string
  org?: string
  priority?: number
  totalElapsedCycleTime?: number
  workableCycleTime?: number
  timeInCurrentStatus?: string
  city?: string
  state?: string
  clli?: string
  router1?: string
  router2?: string
  routerType?: string
  podProgramType?: string
  tenantName?: string
  currentLepVersion?: string
  lepVersionToBeApplied?: string
  podType?: string
  podTypeOriginal?: string
  special?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AutofillExcelRow {
  pod: string
  internalPodId?: string
  podTypeOriginal?: string
  podProgramType?: string
  projectManagers?: string
  clli?: string
  city?: string
  state?: string
  routerType?: string
  router1?: string
  router2?: string
  tenantName?: string
}
