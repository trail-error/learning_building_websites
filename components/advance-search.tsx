"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { SearchCriteria } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, X, Plus, ChevronsUpDown, Check, Trash2, Loader2 } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface AdvancedSearchProps {
  isHistory: boolean
  onSearch: (criteria: SearchCriteria[]) => void
  onClear: () => void
}

export function AdvancedSearch({ isHistory, onSearch, onClear }: AdvancedSearchProps) {
  const { toast } = useToast()
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([{ field: "", value: "" }])
  const [availableValues, setAvailableValues] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingFields, setLoadingFields] = useState<string[]>([])
  const [openPopover, setOpenPopover] = useState<number | null>(null)

  // Updated search fields - removed "internalPodId" and "tenantName", added "priority"
  const searchFields = [
    { id: "pod", label: "POD" },
    { id: "type", label: "Type" },
    { id: "assignedEngineer", label: "Assigned Engineer" },
    { id: "subStatus", label: "Sub Status" },
    { id: "org", label: "Organization" },
    ...(!isHistory?[{ id: "status", label: "Status" }]:[]),
    ...(!isHistory?[{ id: "priority", label: "Priority", specialHandling: true }]:[]), // Added with special handling flag
  ]

  useEffect(() => {
    const fetchValuesForFields = async () => {
      const selectedFields = searchCriteria
        .map((criteria) => criteria.field)
        .filter((field) => field !== "")
        .filter((field, index, self) => self.indexOf(field) === index)

      for (const field of selectedFields) {
        if (!availableValues[field] && !isSpecialHandlingField(field)) {
          await fetchFieldValues(field)
        }
      }
    }

    fetchValuesForFields()
  }, [searchCriteria])

  console.log(
    "availableValues",
    availableValues
  )

  // Helper to check if a field has special handling
  const isSpecialHandlingField = (field: string): boolean => {
    return searchFields.some((f) => f.id === field && f.specialHandling === true)
  }

  // Update the fetchFieldValues function to include previous criteria
  const fetchFieldValues = async (field: string) => {
    setLoadingFields((prev) => [...prev, field])
    try {
      // Get all previous criteria except the current field
      const previousCriteria = searchCriteria
        .filter((c) => c.field && c.value && c.field !== field)
        .map((c) => ({
          field: c.field,
          value: c.value
        }))

      // Build URL with base parameters
      let url = `/api/search/options?field=${field}&isHistory=${isHistory}`
      
      // Add filters as JSON string
      if (previousCriteria.length > 0) {
        url += `&filters=${encodeURIComponent(JSON.stringify(previousCriteria))}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch options")
      const data = await response.json()
      setAvailableValues((prev) => ({
        ...prev,
        [field]: data.options || [],
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load search options",
        variant: "destructive",
      })
    } finally {
      setLoadingFields((prev) => prev.filter((f) => f !== field))
    }
  }

  const handleSearch = () => {
    const validCriteria = searchCriteria.filter((c) => {
      // For special handling fields like priority, we don't need a value
      if (isSpecialHandlingField(c.field)) {
        return c.field !== ""
      }
      // For regular fields, we need both field and value
      return c.field && c.value
    })

    if (validCriteria.length === 0) {
      toast({
        title: "Search Error",
        description: "Please select at least one field and value",
        variant: "destructive",
      })
      return
    }

    // For special handling fields, set a placeholder value if none exists
    const processedCriteria = validCriteria.map((c) => {
      if (isSpecialHandlingField(c.field) && !c.value) {
        return { ...c, value: "has_value" }
      }
      return c
    })

    onSearch(processedCriteria)
  }

  const handleClear = () => {
    setSearchCriteria([{ field: "", value: "" }])
    onClear()
  }

  const handleAddCriteria = () => {
    setSearchCriteria([...searchCriteria, { field: "", value: "" }])
  }

  const handleRemoveCriteria = (index: number) => {
    if (searchCriteria.length > 1) {
      const newCriteria = [...searchCriteria]
      newCriteria.splice(index, 1)
      setSearchCriteria(newCriteria)
    }
  }

  const updateCriteria = (index: number, field: keyof SearchCriteria, value: string) => {
    const newCriteria = [...searchCriteria]
    newCriteria[index] = { ...newCriteria[index], [field]: value }

    // If selecting a special handling field, automatically set a placeholder value
    if (field === "field" && isSpecialHandlingField(value)) {
      newCriteria[index].value = "has_value"
    } else if (field === "field" && !isSpecialHandlingField(value)) {
      newCriteria[index].value = ""
    }

    setSearchCriteria(newCriteria)
  }

  const isFieldLoading = (field: string) => {
    return loadingFields.includes(field)
  }

  return (
    <TooltipProvider>
      <fieldset className="mb-4 border">
        <legend className="p-2 text-base font-semibold">Search</legend>
        <div className="p-2 pt-1">
          <div className="space-y-3">
            {searchCriteria.map((criteria, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                {/* Field Selector */}
                <div className="sm:col-span-2">
                  <Select value={criteria.field} onValueChange={(value) => updateCriteria(index, "field", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value Selector - Hidden for special handling fields */}
                <div className="sm:col-span-3">
                  {criteria.field && !isSpecialHandlingField(criteria.field) ? (
                    <Popover open={openPopover === index} onOpenChange={(open) => setOpenPopover(open ? index : null)}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-8"
                          disabled={isFieldLoading(criteria.field)}
                        >
                          {isFieldLoading(criteria.field) ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Loading options...</span>
                            </div>
                          ) : (
                            criteria.value || "Value"
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Type value..." />
                          <CommandList>
                            <CommandEmpty>No value found.</CommandEmpty>
                            <CommandGroup>
                              {availableValues[criteria.field]?.map((value) => (
                                <CommandItem
                                  key={value}
                                  value={value}
                                  onSelect={(currentValue) => {
                                    updateCriteria(index, "value", currentValue)
                                    setOpenPopover(null)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      criteria.value === value ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {value}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : criteria.field && isSpecialHandlingField(criteria.field) ? (
                    <div className="text-sm text-muted-foreground p-2 border rounded-md h-8 flex items-center">
                      {criteria.field === "priority"
                        ? "Show all PODs with priority assigned"
                        : "Special filter applied"}
                    </div>
                  ) : (
                    <Input disabled placeholder="Select field" className="h-8" />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="sm:col-span-1 flex justify-end gap-1 min-w-[90px]">
                  {/* Delete (only if more than 1 row) */}
                  {searchCriteria.length > 1 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCriteria(index)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="w-8 h-8" />
                  )}

                  {/* Add (only on last row) */}
                  {index === searchCriteria.length - 1 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleAddCriteria} className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Search & Clear (only on first row) */}
                  {index === 0 && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" onClick={handleSearch} className="h-8 w-8">
                            <Search className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Search</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={handleClear} className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </fieldset>
    </TooltipProvider>
  )
}
  