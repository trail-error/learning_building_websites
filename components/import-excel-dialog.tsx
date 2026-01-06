"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { Pod, Status, SubStatus, Org, PodType } from "@/lib/types"
import { EXCEL_COLUMN_MAPPINGS, getFieldNameFromExcelColumn, getMappingFromExcelColumn } from "@/lib/config/excel-mapping"

interface ImportExcelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (pods: Pod[]) => Promise<void> // Changed to return Promise
  isHistory: boolean
  existingPods?: Pod[]
}

interface ExcelRow {
  pod: string
  internalPodId?: string
  podTypeOriginal?: string
  podProgramType?: string
  assignedEngineer?: string
  status?: string
  subStatus?: string
  org?: string
  creationTimestamp?: string | null
  projectManagers?: string
  priority?: number | ''
  slaCalculatedNbd?: string | null
  podWorkableDate?: string | null
  totalElapsedCycleTime?: number | ''
  workableCycleTime?: number | ''
  timeInCurrentStatus?: string
  clli?: string
  city?: string
  state?: string
  routerType?: string
  router1?: string
  router2?: string
  tenantName?: string
  currentLepVersion?: string
  lepVersionToBeApplied?: string
  podType?: string
  notes?: string
  linkToActiveTds?: string
  linkToActivePreloads?: string
  lepAssessment?: string
  dlpTemplateUpdates?: string
  ipAcquisition?: string
  ipAllocation?: string
  conversionFileUpdate?: string
  conversionFileValidation?: string
  pepGeneration?: string
  checklistCreation?: string
  connectitTdsCreation?: string
  connectitPreloadCreation?: string
  vmDeleteList?: string
  vmDeletesComplete?: string
  lcmNetworkDeleteCompletion?: string
  dlpUploads?: string
  cdmLoad?: string
  inServiceVavAudit?: string
  globalCvaasAudit?: string
  dns?: string
  macdCreation?: string
  atsMacdApproval?: string
  lcmAddTicket?: string
  preloadTicketSubmitted?: string
  ixcRoamingSmop?: string
  gtmVvmSmop?: string
  lcmNetworkDeletes?: string
  otherRouting?: string
  myloginsRequest?: string
  publishPep?: string
  ticketNotificationEmail?: string
  lcmComplete?: string
  preloadComplete?: string

  // Allow any extra fields
  [key: string]: any
}

// Parse helpers
const parseBoolean = (val: any): boolean | string => {
  if (val === null || val === undefined || val === '') return ''
  const s = String(val).trim().toLowerCase()
  if (['true', 'yes', 'y', '1'].includes(s)) return true
  if (['false', 'no', 'n', '0'].includes(s)) return false
  return String(val)
}

const parseNumber = (val: any): number | '' => {
  if (val === null || val === undefined || val === '') return ''
  const n = Number(val)
  return Number.isNaN(n) ? '' : n
}

const parseDateToISO = (val: any): string | null => {
  if (val === null || val === undefined || val === '') return null
  // If it's already an ISO string or Date
  if (typeof val === 'string') {
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d.toISOString()
    // fallback: return as-is
    return val
  }
  if (typeof val === 'number') {
    // Excel serial date -> convert to JS Date (approx)
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + Math.round(val) * 24 * 60 * 60 * 1000)
    return date.toISOString()
  }
  if (val instanceof Date) return val.toISOString()
  return null
}

const determineRouterType = (router1?: string, router2?: string): string => {
  if (!router1 || !router2) return ''
  
  const router1EndsWithJl1 = router1.toLowerCase().endsWith('jl1')
  const router2EndsWithJl1 = router2.toLowerCase().endsWith('jl1')
  const router1EndsWithJl3 = router1.toLowerCase().endsWith('jl3')
  const router2EndsWithJl3 = router2.toLowerCase().endsWith('jl3')
  
  if (router1EndsWithJl1 && router2EndsWithJl1) {
    return 'Rleaf'
  } else if (router1EndsWithJl3 && router2EndsWithJl3) {
    return 'NCX'
  }
  
  return ''
}

const readExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const XLSX = await import('xlsx')
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length < 2) {
            reject(new Error("Excel file must have at least a header row and one data row"))
            return
          }

          const headers = jsonData[0] as string[]
          const rows = jsonData.slice(1) as any[][]

          const processedData: ExcelRow[] = rows.map((row, index) => {
            const rowData: ExcelRow = { pod: '' }
            headers.forEach((header, colIndex) => {
              const mapping = getMappingFromExcelColumn(header)
              if (mapping) {
                const raw = row[colIndex]
                if (raw === undefined || raw === null || raw === '') {
                  rowData[mapping.fieldName] = mapping.type === 'date' ? null : ''
                } else {
                  switch (mapping.type) {
                    case 'number':
                      rowData[mapping.fieldName] = parseNumber(raw)
                      break
                    case 'boolean':
                      rowData[mapping.fieldName] = parseBoolean(raw)
                      break
                    case 'date':
                      rowData[mapping.fieldName] = parseDateToISO(raw)
                      break
                    default:
                      rowData[mapping.fieldName] = String(raw).trim()
                  }
                }
              }
            })
            // Determine router type based on router1 and router2 endings
            rowData.routerType = determineRouterType(rowData.router1, rowData.router2)
            return rowData
          })
          resolve(processedData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsArrayBuffer(file)
    } catch (error) {
      reject(new Error("Failed to load xlsx library. Please install it: npm install xlsx"))
    }
  })
}

export function ImportExcelDialog({ open, onOpenChange, onImport, isHistory, existingPods }: ImportExcelDialogProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [invalidRows, setInvalidRows] = useState<number[]>([]) // Rows without POD
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [duplicateStatus, setDuplicateStatus] = useState<boolean[]>([])

  // Check for duplicates on file upload (server-side)
  useEffect(() => {
    if (!open || excelData.length === 0 || isHistory) {
      setDuplicateStatus([])
      return
    }
    // Identify invalid rows (missing POD)
    const invalid = excelData
      .map((row, idx) => (!row.pod || row.pod.trim() === '') ? idx : -1)
      .filter(idx => idx !== -1)
    setInvalidRows(invalid)

    // Batch check all pod IDs with backend (only valid rows)
    const checkDuplicates = async () => {
      const ids = excelData
        .map((row, idx) => (row.pod && row.pod.trim() !== '') ? row.pod : null)
        .filter((id): id is string => id !== null)
      
      if (ids.length === 0) {
        setDuplicateStatus([])
        return
      }
      try {
        const res = await fetch("/api/pods/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        })
        if (!res.ok) {
          setDuplicateStatus([])
          return
        }
        const data = await res.json()
        const duplicatesSet = new Set(data.duplicates || [])
        setDuplicateStatus(excelData.map(row => duplicatesSet.has(row.pod)))
      } catch {
        setDuplicateStatus([])
      }
    }
    checkDuplicates()
  }, [excelData, open, isHistory])

  // Remove row from preview
  const handleRemoveRow = (rowIndex: number) => {
    setExcelData((prev) => prev.filter((_, i) => i !== rowIndex))
    setDuplicateStatus((prev) => prev.filter((_, i) => i !== rowIndex))
    setInvalidRows((prev) => {
      const newInvalid = prev.filter(idx => idx !== rowIndex)
      // Adjust indices after deletion
      return newInvalid.map(idx => idx > rowIndex ? idx - 1 : idx)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setInvalidRows([])
    try {
      const data = await readExcelFile(file)
      setExcelData(data)
    } catch (error) {
      console.error("Error reading Excel file:", error)
      toast({
        title: "Error",
        description: "Failed to read Excel file. Please check the file format.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    const updatedData = [...excelData]
    updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: value }
    
    // Recalculate router type if router1 or router2 changed
    if (field === 'router1' || field === 'router2') {
      updatedData[rowIndex].routerType = determineRouterType(
        updatedData[rowIndex].router1,
        updatedData[rowIndex].router2
      )
    }
    
    setExcelData(updatedData)
  }

  const handleImport = async () => {
    // Filter out invalid rows (rows without POD)
    const validRows = excelData.filter((row, idx) => !invalidRows.includes(idx))
    
    if (validRows.length === 0) {
      toast({
        title: "No Valid Data",
        description: "No rows with a valid POD identifier. Please check your Excel file.",
        variant: "destructive",
      })
      return
    }

    // On main page, filter out duplicates automatically
    let rowsToImport = validRows
    if (!isHistory) {
      rowsToImport = validRows.filter((row, idx) => {
        const excelIdx = excelData.findIndex((r, i) => r === row)
        return !duplicateStatus[excelIdx]
      })
      
      const skippedCount = validRows.length - rowsToImport.length
      if (skippedCount > 0) {
        toast({
          title: "Duplicates Skipped",
          description: `${skippedCount} row(s) with existing POD identifiers were skipped. Only new PODs will be imported.`,
        })
      }
    }

    if (rowsToImport.length === 0) {
      toast({
        title: "No New PODs",
        description: "All rows are duplicates. No new PODs to import.",
        variant: "destructive",
      })
      return
    }
    
    setIsProcessing(true)
    try {
      // Convert Excel data to Pod format - only include non-empty fields
      const pods: any[] = rowsToImport.map(row => {
        const pod: any = {
          pod: row.pod, // Always include POD
        }
        
        // Only add fields that have actual values
        if (row.internalPodId) pod.internalPodId = row.internalPodId
        if (row.assignedEngineer) pod.assignedEngineer = row.assignedEngineer
        if (row.status) pod.status = row.status
        if (row.subStatus) pod.subStatus = row.subStatus
        if (row.org) pod.org = row.org
        if (row.priority !== '' && row.priority !== undefined) pod.priority = row.priority
        if (row.creationTimestamp) pod.creationTimestamp = row.creationTimestamp
        if (row.slaCalculatedNbd) pod.slaCalculatedNbd = row.slaCalculatedNbd
        if (row.podWorkableDate) pod.podWorkableDate = row.podWorkableDate
        if (row.totalElapsedCycleTime !== '' && row.totalElapsedCycleTime !== undefined) pod.totalElapsedCycleTime = row.totalElapsedCycleTime
        if (row.workableCycleTime !== '' && row.workableCycleTime !== undefined) pod.workableCycleTime = row.workableCycleTime
        if (row.timeInCurrentStatus) pod.timeInCurrentStatus = row.timeInCurrentStatus
        if (row.clli) pod.clli = row.clli
        if (row.city) pod.city = row.city
        if (row.state) pod.state = row.state
        if (row.routerType) pod.routerType = row.routerType
        if (row.router1) pod.router1 = row.router1
        if (row.router2) pod.router2 = row.router2
        if (row.podProgramType) pod.podProgramType = row.podProgramType
        if (row.tenantName) pod.tenantName = row.tenantName
        if (row.currentLepVersion) pod.currentLepVersion = row.currentLepVersion
        if (row.lepVersionToBeApplied) pod.lepVersionToBeApplied = row.lepVersionToBeApplied
        if (row.podType) pod.podType = row.podType
        if (row.podTypeOriginal) pod.podTypeOriginal = row.podTypeOriginal
        if (row.notes) pod.notes = row.notes
        if (row.projectManagers) pod.projectManagers = row.projectManagers
        if (row.linkToActiveTds) pod.linkToActiveTds = row.linkToActiveTds
        if (row.linkToActivePreloads) pod.linkToActivePreloads = row.linkToActivePreloads
        if (row.lepAssessment) pod.lepAssessment = row.lepAssessment
        if (row.dlpTemplateUpdates) pod.dlpTemplateUpdates = row.dlpTemplateUpdates
        if (row.ipAcquisition) pod.ipAcquisition = row.ipAcquisition
        if (row.ipAllocation) pod.ipAllocation = row.ipAllocation
        if (row.conversionFileUpdate) pod.conversionFileUpdate = row.conversionFileUpdate
        if (row.conversionFileValidation) pod.conversionFileValidation = row.conversionFileValidation
        if (row.pepGeneration) pod.pepGeneration = row.pepGeneration
        if (row.checklistCreation) pod.checklistCreation = row.checklistCreation
        if (row.connectitTdsCreation) pod.connectitTdsCreation = row.connectitTdsCreation
        if (row.connectitPreloadCreation) pod.connectitPreloadCreation = row.connectitPreloadCreation
        if (row.vmDeleteList) pod.vmDeleteList = row.vmDeleteList
        if (row.vmDeletesComplete) pod.vmDeletesComplete = row.vmDeletesComplete
        if (row.lcmNetworkDeletes) pod.lcmNetworkDeletes = row.lcmNetworkDeletes
        if (row.lcmNetworkDeleteCompletion) pod.lcmNetworkDeleteCompletion = row.lcmNetworkDeleteCompletion
        if (row.dlpUploads) pod.dlpUploads = row.dlpUploads
        if (row.cdmLoad) pod.cdmLoad = row.cdmLoad
        if (row.inServiceVavAudit) pod.inServiceVavAudit = row.inServiceVavAudit
        if (row.globalCvaasAudit) pod.globalCvaasAudit = row.globalCvaasAudit
        if (row.dns) pod.dns = row.dns
        if (row.macdCreation) pod.macdCreation = row.macdCreation
        if (row.atsMacdApproval) pod.atsMacdApproval = row.atsMacdApproval
        if (row.lcmAddTicket) pod.lcmAddTicket = row.lcmAddTicket
        if (row.preloadTicketSubmitted) pod.preloadTicketSubmitted = row.preloadTicketSubmitted
        if (row.ixcRoamingSmop) pod.ixcRoamingSmop = row.ixcRoamingSmop
        if (row.gtmVvmSmop) pod.gtmVvmSmop = row.gtmVvmSmop
        if (row.otherRouting) pod.otherRouting = row.otherRouting
        if (row.publishPep) pod.publishPep = row.publishPep
        if (row.ticketNotificationEmail) pod.ticketNotificationEmail = row.ticketNotificationEmail
        if (row.myloginsRequest) pod.myloginsRequest = row.myloginsRequest
        if (row.lcmComplete) pod.lcmComplete = row.lcmComplete
        if (row.preloadComplete) pod.preloadComplete = row.preloadComplete
        
        return pod
      })
      
      console.log("Dialog: About to import pods:", pods);
      
      // Wait for the actual import to complete
      await onImport(pods as Pod[])
      
      // Only close and clear if import was successful
      onOpenChange(false)
      setExcelData([])
      setInvalidRows([])
      setDuplicateStatus([])
    } catch (error) {
      console.error("Dialog: Error importing data:", error)
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setExcelData([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import PODs from Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center space-x-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading || excelData.length === 0}
            >
              Clear
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <p>Loading Excel file...</p>
            </div>
          )}

          {excelData.length > 0 && (
            <div className="space-y-4 flex-1 min-h-0">
              <div className="text-sm text-muted-foreground">
                Preview ({excelData.length} rows total, {excelData.length - invalidRows.length} valid). Double-click cells to edit.
              </div>
              {/* Warning if invalid rows found */}
              {invalidRows.length > 0 && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-3 mb-2 rounded">
                  {invalidRows.length} row(s) missing POD identifier will be skipped during import. You can remove them manually.
                </div>
              )}
              {/* Inline warning if duplicates found */}
              {!isHistory && duplicateStatus.some(Boolean) && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-2 rounded">
                  {duplicateStatus.filter(Boolean).length} row(s) match existing PODs and will be skipped during import. You can remove them if needed.
                </div>
              )}
              <div className="border rounded-md overflow-x-auto overflow-y-auto flex-1 min-h-0 max-h-[40vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {EXCEL_COLUMN_MAPPINGS.map((mapping) => (
                        <TableHead key={mapping.fieldName}>
                          {mapping.excelColumn}
                        </TableHead>
                      ))}
                      {!isHistory && duplicateStatus.some(Boolean) && <TableHead>Duplicate</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelData.map((row, rowIndex) => {
                      const isInvalid = invalidRows.includes(rowIndex)
                      const isDuplicate = !isHistory && duplicateStatus[rowIndex]
                      const rowClass = isInvalid 
                        ? "bg-red-50" 
                        : isDuplicate 
                        ? "bg-yellow-50" 
                        : ""
                      
                      return (
                        <TableRow key={rowIndex} className={rowClass}>
                          {EXCEL_COLUMN_MAPPINGS.map((mapping) => (
                            <TableCell key={mapping.fieldName}>
                              <Input
                                value={row[mapping.fieldName] || ''}
                                onChange={(e) => handleCellEdit(rowIndex, mapping.fieldName, e.target.value)}
                                className={`border-none p-0 h-auto min-h-[20px] ${isInvalid ? 'opacity-50' : ''}`}
                                onDoubleClick={(e) => e.currentTarget.focus()}
                                disabled={isInvalid}
                              />
                            </TableCell>
                          ))}
                          {(isInvalid || isDuplicate) && (
                            <TableCell className="whitespace-nowrap">
                              {isInvalid && (
                                <>
                                  <span className="text-red-700 font-semibold text-xs">No POD</span>
                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveRow(rowIndex)} className="ml-2">
                                    Remove
                                  </Button>
                                </>
                              )}
                              {isDuplicate && !isInvalid && (
                                <>
                                  <span className="text-yellow-700 font-semibold text-xs">Duplicate</span>
                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveRow(rowIndex)} className="ml-2">
                                    Remove
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-white z-10 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={excelData.length === 0 || isProcessing}
          >
            {isProcessing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 