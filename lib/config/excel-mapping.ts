// Excel column mapping configuration
export type ExcelColumnType = 'string' | 'number' | 'date' | 'boolean'

export interface ExcelColumnMapping {
  excelColumn: string;
  fieldName: string;
  required?: boolean;
  type?: ExcelColumnType;
}

export const EXCEL_COLUMN_MAPPINGS: ExcelColumnMapping[] = [
  { excelColumn: "POD", fieldName: "pod", required: true, type: 'string' },
  { excelColumn: "Internal POD ID", fieldName: "internalPodId", type: 'string' },
  { excelColumn: "POD Type", fieldName: "podTypeOriginal", type: 'string' },
  { excelColumn: "POD Program Type", fieldName: "podProgramType", type: 'string' },
  { excelColumn: "Assigned Engineer", fieldName: "assignedEngineer", type: 'string' },
  { excelColumn: "Status", fieldName: "status", type: 'string' },
  { excelColumn: "Sub Status", fieldName: "subStatus", type: 'string' },
  { excelColumn: "Org", fieldName: "org", type: 'string' },
  { excelColumn: "Creation Timestamp", fieldName: "creationTimestamp", type: 'date' },
  { excelColumn: "Project Managers", fieldName: "projectManagers", type: 'string' },
  { excelColumn: "Priority", fieldName: "priority", type: 'number' },
  { excelColumn: "SLA Calculated NBD", fieldName: "slaCalculatedNbd", type: 'date' },
  { excelColumn: "POD Workable Date", fieldName: "podWorkableDate", type: 'date' },
  { excelColumn: "Total Elapsed Cycle Time", fieldName: "totalElapsedCycleTime", type: 'number' },
  { excelColumn: "Workable Cycle Time", fieldName: "workableCycleTime", type: 'number' },
  { excelColumn: "Time In Current Status", fieldName: "timeInCurrentStatus", type: 'string' },
  { excelColumn: "CLLI", fieldName: "clli", type: 'string' },
  { excelColumn: "City", fieldName: "city", type: 'string' },
  { excelColumn: "State", fieldName: "state", type: 'string' },
  { excelColumn: "Router Type", fieldName: "routerType", type: 'string' },
  { excelColumn: "Router 1", fieldName: "router1", type: 'string' },
  { excelColumn: "Router 2", fieldName: "router2", type: 'string' },
  { excelColumn: "Tenant Name", fieldName: "tenantName", type: 'string' },
  { excelColumn: "Current LEP Version", fieldName: "currentLepVersion", type: 'string' },
  { excelColumn: "LEP Version To Be Applied", fieldName: "lepVersionToBeApplied", type: 'string' },
  { excelColumn: "Tenant Requirements", fieldName: "podType", type: 'string' },
  { excelColumn: "Notes", fieldName: "notes", type: 'string' },
  { excelColumn: "Link to Active TDS", fieldName: "linkToActiveTds", type: 'string' },
  { excelColumn: "Link to Active Preloads", fieldName: "linkToActivePreloads", type: 'string' },
  { excelColumn: "LEP Assessment (FFA only)", fieldName: "lepAssessment", type: 'string' },
  { excelColumn: "DLP Template Updates", fieldName: "dlpTemplateUpdates", type: 'string' },
  { excelColumn: "IP Acquisition", fieldName: "ipAcquisition", type: 'string' },
  { excelColumn: "IP Allocation", fieldName: "ipAllocation", type: 'string' },
  { excelColumn: "Conversion File Update", fieldName: "conversionFileUpdate", type: 'string' },
  { excelColumn: "Conversion File Validation", fieldName: "conversionFileValidation", type: 'string' },
  { excelColumn: "PEP Generation", fieldName: "pepGeneration", type: 'string' },
  { excelColumn: "Checklist Creation", fieldName: "checklistCreation", type: 'string' },
  { excelColumn: "ConnectIT TDS Creation", fieldName: "connectitTdsCreation", type: 'string' },
  { excelColumn: "ConnectIT Preload Creation", fieldName: "connectitPreloadCreation", type: 'string' },
  { excelColumn: "VM Delete List", fieldName: "vmDeleteList", type: 'string' },
  { excelColumn: "VM Deletes Complete", fieldName: "vmDeletesComplete", type: 'string' },
  { excelColumn: "LCM Network Delete Completion", fieldName: "lcmNetworkDeleteCompletion", type: 'string' },
  { excelColumn: "DLP Uploads", fieldName: "dlpUploads", type: 'string' },
  { excelColumn: "CDM Load", fieldName: "cdmLoad", type: 'string' },
  { excelColumn: "In-Service VAV Audit", fieldName: "inServiceVavAudit", type: 'string' },
  { excelColumn: "Global CVaaS Audit", fieldName: "globalCvaasAudit", type: 'string' },
  { excelColumn: "DNS", fieldName: "dns", type: 'string' },
  { excelColumn: "MACD Creation", fieldName: "macdCreation", type: 'string' },
  { excelColumn: "ATS MACD Approval", fieldName: "atsMacdApproval", type: 'string' },
  { excelColumn: "LCM Add Ticket", fieldName: "lcmAddTicket", type: 'string' },
  { excelColumn: "Preload Ticket Submitted", fieldName: "preloadTicketSubmitted", type: 'string' },
  { excelColumn: "IXC Roaming SMOP", fieldName: "ixcRoamingSmop", type: 'string' },
  { excelColumn: "GTM/VVM SMOP", fieldName: "gtmVvmSmop", type: 'string' },
  { excelColumn: "LCM Network Deletes", fieldName: "lcmNetworkDeletes", type: 'string' },
  { excelColumn: "Other Routing", fieldName: "otherRouting", type: 'string' },
  { excelColumn: "Mylogins Request", fieldName: "myloginsRequest", type: 'string' },
  { excelColumn: "Publish PEP", fieldName: "publishPep", type: 'string' },
  { excelColumn: "Ticket Notification Email", fieldName: "ticketNotificationEmail", type: 'string' },
  { excelColumn: "LCM Complete", fieldName: "lcmComplete", type: 'string' },
  { excelColumn: "Preload Complete", fieldName: "preloadComplete", type: 'string' },
]

// Helper function to get field name from Excel column
export function getFieldNameFromExcelColumn(excelColumn: string): string | undefined {
  const mapping = EXCEL_COLUMN_MAPPINGS.find(m => m.excelColumn === excelColumn);
  return mapping?.fieldName;
}

// Helper to return the full mapping by Excel column
export function getMappingFromExcelColumn(excelColumn: string): ExcelColumnMapping | undefined {
  return EXCEL_COLUMN_MAPPINGS.find(m => m.excelColumn === excelColumn);
}

// Helper function to get Excel column from field name
export function getExcelColumnFromFieldName(fieldName: string): string | undefined {
  const mapping = EXCEL_COLUMN_MAPPINGS.find(m => m.fieldName === fieldName);
  return mapping?.excelColumn;
}

// Get all required fields
export function getRequiredFields(): string[] {
  return EXCEL_COLUMN_MAPPINGS
    .filter(m => m.required)
    .map(m => m.fieldName);
} 