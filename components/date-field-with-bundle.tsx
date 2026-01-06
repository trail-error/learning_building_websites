"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DateBundlePopup } from "./date-bundle-popup"
import { useDateBundle } from "@/hooks/use-date-bundle"
import moment from "moment"

interface DateFieldWithBundleProps {
  value: string | null
  isNA?: boolean
  onChange: (value: string | null, isNA: boolean) => void
  name?: string
  pod?: any // The pod object to check for bundling
  onBundleApply?: (fields: string[], selectedDate: string) => void // Callback when bundle is applied
}

export function DateFieldWithBundle({ 
  value, 
  isNA = false, 
  onChange, 
  name, 
  pod, 
  onBundleApply 
}: DateFieldWithBundleProps) {
  const [open, setOpen] = useState(false)
  const { 
    bundlePopupOpen, 
    setBundlePopupOpen, 
    currentBundle, 
    selectedDate, 
    showBundlePopup, 
    handleBundleApply: hookHandleBundleApply 
  } = useDateBundle()

  // Create a wrapper for the bundle apply that calls the prop callback
  const handleBundleApply = (selectedFields: string[]) => {
    if (onBundleApply) {
      // Pass both the selected fields and the selected date
      onBundleApply(selectedFields, selectedDate);
    }
    hookHandleBundleApply(selectedFields);
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Use moment to format date as YYYY-MM-DD without timezone issues
      const dateString = moment(date).format("YYYY-MM-DD")
      onChange(dateString, false)
      setOpen(false)
      
      // Check for bundle popup if pod is provided
      if (pod && onBundleApply && name) {
        // Create a temporary pod object with the new date to check for bundles
        const tempPod = { ...pod, [name]: dateString, [`${name}IsNA`]: false }
        showBundlePopup(name, tempPod, onBundleApply)
      }
    }
  }

  const handleNA = () => {
    onChange(null, true)
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null, false)
    setOpen(false)
  }

  // Determine what to display in the button
  const getDisplayValue = () => {
    if (isNA) return "N/A"
    if (value) {
      try {
        // Use moment to parse and format the date
        const momentDate = moment(value, "YYYY-MM-DD")
        if (momentDate.isValid()) {
          return momentDate.format("MMMM D, YYYY")
        }
        return format(new Date(value), "PPP")
      } catch (e) {
        return value
      }
    }
    return <span>Pick a date</span>
  }

  return (
    <>
      <div className="flex gap-2">
        <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !value && !isNA && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayValue()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value && !isNA ? (() => {
                try {
                  const momentDate = moment(value, "YYYY-MM-DD")
                  return momentDate.isValid() ? momentDate.toDate() : new Date(value)
                } catch (e) {
                  return undefined
                }
              })() : undefined}
              onSelect={handleSelect}
              initialFocus
            />
            <div className="flex justify-between p-3 border-t">
              <Button variant="outline" size="sm" onClick={handleNA}>
                N/A
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Bundle Popup */}
      {currentBundle && (
        <DateBundlePopup
          open={bundlePopupOpen}
          onOpenChange={setBundlePopupOpen}
          title={currentBundle.name}
          fields={currentBundle.fields.map(field => ({
            key: field.key,
            label: field.label,
            isFilled: !!(pod?.[field.key] && !pod?.[`${field.key}IsNA`]),
          }))}
          selectedDate={selectedDate}
          onApply={handleBundleApply}
        />
      )}
    </>
  )
} 