"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { AutofillPod, AutofillExcelRow } from "@/lib/types"
import { AUTOFILL_EXCEL_COLUMN_MAPPINGS, getAutofillFieldNameFromExcelColumn, getDisplayNameForField } from "@/lib/config/autofill-excel-mapping"

interface AutofillExcelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AutofillExcelDialog({ open, onOpenChange }: AutofillExcelDialogProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [excelData, setExcelData] = useState<AutofillExcelRow[]>([])
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsLoading(true)
    try {
      const { data, fields } = await readExcelFile(file)
      
      if(Array.isArray(data)){
        setExcelData(data.filter(x=>x.pod.length>0))
        setAvailableFields(fields)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read Excel file. Please check the file format.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const readExcelFile = (file: File): Promise<{ data: AutofillExcelRow[], fields: string[] }> => {
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
            
            // Get available fields from headers - only include mapped columns
            const availableFields = headers
              .map(header => getAutofillFieldNameFromExcelColumn(header))
              .filter((field): field is string => field !== undefined)
            
            const processedData: AutofillExcelRow[] = rows.map((row) => {
              const rowData: AutofillExcelRow = { pod: '' }
              headers.forEach((header, colIndex) => {
                const fieldName = getAutofillFieldNameFromExcelColumn(header)
                if (fieldName) {
                  const value = row[colIndex]
                  // Handle different data types
                  if (fieldName === 'priority' || fieldName === 'totalElapsedCycleTime' || fieldName === 'workableCycleTime') {
                    rowData[fieldName] = value ? Number(value) : undefined
                  } else if (fieldName === 'special') {
                    rowData[fieldName] = value ? Boolean(value) : undefined
                  } else {
                    rowData[fieldName] = value || ''
                  }
                }
              })
              // Auto-determine router type if not provided
              if (!rowData.routerType && (rowData.router1 || rowData.router2)) {
                rowData.routerType = determineRouterType(rowData.router1, rowData.router2)
              }
              return rowData
            })
            resolve({ data: processedData, fields: availableFields })
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

  const determineRouterType = (router1?: string, router2?: string): string => {
    if (!router1 || !router2) return ''
    const r1 = router1.toLowerCase()
    const r2 = router2.toLowerCase()
    if (r1.endsWith('jl1') && r2.endsWith('jl1')) return 'Rleaf'
    if (r1.endsWith('jl3') && r2.endsWith('jl3')) return 'NCX'
    return ''
  }

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    const updatedData = [...excelData]
    // Handle different data types
    let processedValue: any = value
    if (field === 'priority' || field === 'totalElapsedCycleTime' || field === 'workableCycleTime') {
      processedValue = value ? Number(value) : undefined
    } else if (field === 'special') {
      processedValue = value ? Boolean(value) : undefined
    }
    
    updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: processedValue }
    
    // Auto-determine router type if router fields are changed
    if (field === 'router1' || field === 'router2') {
      updatedData[rowIndex].routerType = determineRouterType(
        updatedData[rowIndex].router1,
        updatedData[rowIndex].router2
      )
    }
    setExcelData(updatedData)
  }

  const handleRemoveRow = (rowIndex: number) => {
    setExcelData((prev) => prev.filter((_, i) => i !== rowIndex))
  }

  const handleImport = async () => {
    if (excelData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload an Excel file with data to import.",
        variant: "destructive",
      })
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch("/api/autofill-pods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pods: excelData }),
      })
      if (!res.ok) throw new Error("Failed to import autofill pods")
      toast({
        title: "Import Successful",
        description: `Successfully imported ${excelData.length} autofill pods.`,
      })
      setExcelData([])
      setAvailableFields([])
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import autofill pods. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Autofill Excel Upload</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileUpload} disabled={isLoading || isProcessing} />
          {excelData.length > 0 && (
            <div className="overflow-x-auto max-h-96 border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    {availableFields.map((field) => (
                      <TableHead key={field}>{getDisplayNameForField(field)}</TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {availableFields.map((field) => (
                        <TableCell key={field} onDoubleClick={() => {}}>
                          <input
                            className="w-full bg-transparent border-none outline-none"
                            value={row[field] || ''}
                            onChange={e => handleCellEdit(rowIndex, field, e.target.value)}
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveRow(rowIndex)}>Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isProcessing || excelData.length === 0}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 