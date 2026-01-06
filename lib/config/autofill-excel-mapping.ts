// Excel column mapping configuration for Autofill Excel
export interface AutofillExcelColumnMapping {
  excelColumn: string;
  fieldName: string;
  required?: boolean;
}

export const AUTOFILL_EXCEL_COLUMN_MAPPINGS: AutofillExcelColumnMapping[] = [
  { excelColumn: "POD", fieldName: "pod", required: true },
  { excelColumn: "Internal POD ID", fieldName: "internalPodId", required: false },
  { excelColumn: "POD Type", fieldName: "podTypeOriginal", required: false },
  { excelColumn: "POD Program Type", fieldName: "podProgramType", required: false },
  { excelColumn: "Project Managers", fieldName: "projectManagers", required: false },
  { excelColumn: "CLLI", fieldName: "clli", required: false },
  { excelColumn: "City", fieldName: "city", required: false },
  { excelColumn: "State", fieldName: "state", required: false },
  { excelColumn: "Router Type", fieldName: "routerType", required: false },
  { excelColumn: "Router 1", fieldName: "router1", required: false },
  { excelColumn: "Router 2", fieldName: "router2", required: false },
  { excelColumn: "Tenant Name", fieldName: "tenantName", required: false },
];

// Helper function to get field name from Excel column
export function getAutofillFieldNameFromExcelColumn(excelColumn: string): string | undefined {
  const mapping = AUTOFILL_EXCEL_COLUMN_MAPPINGS.find(m => m.excelColumn === excelColumn);
  return mapping?.fieldName;
}

// Helper function to get all available field names
export function getAllAutofillFieldNames(): string[] {
  return AUTOFILL_EXCEL_COLUMN_MAPPINGS.map(m => m.fieldName);
}

// Helper function to get display name for a field
export function getDisplayNameForField(fieldName: string): string {
  const mapping = AUTOFILL_EXCEL_COLUMN_MAPPINGS.find(m => m.fieldName === fieldName);
  return mapping?.excelColumn || fieldName;
} 