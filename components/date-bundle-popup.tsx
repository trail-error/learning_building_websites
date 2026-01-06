"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface DateBundleField {
  key: string;
  label: string;
  isFilled: boolean;
}

interface DateBundlePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: DateBundleField[];
  selectedDate: string;
  onApply: (selectedFields: string[]) => void;
}

export function DateBundlePopup({
  open,
  onOpenChange,
  title,
  fields,
  selectedDate,
  onApply,
}: DateBundlePopupProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Initialize selected fields when popup opens
  React.useEffect(() => {
    if (open) {
      // Pre-select all unfilled fields
      const unfilledFields = fields.filter(field => !field.isFilled).map(field => field.key);
      setSelectedFields(unfilledFields);
    }
  }, [open, fields]);

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, fieldKey]);
    } else {
      setSelectedFields(prev => prev.filter(key => key !== fieldKey));
    }
  };

  const handleApply = () => {
    onApply(selectedFields);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the same date for:
          </p>
          
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={selectedFields.includes(field.key)}
                  onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                  disabled={field.isFilled}
                />
                <Label 
                  htmlFor={field.key} 
                  className={`text-sm ${field.isFilled ? 'text-muted-foreground line-through' : ''}`}
                >
                  {field.label}
                  {field.isFilled && <span className="ml-2 text-xs text-muted-foreground">(already filled)</span>}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={selectedFields.length === 0}>
              Apply ({selectedFields.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 