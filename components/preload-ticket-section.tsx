"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DateField } from "@/components/date-field";
import { Checkbox } from "@/components/ui/checkbox";

interface PreloadTicketSectionProps {
  date: string | null;
  isNA: boolean;
  ticket1: string;
  ticket2: string;
  ticket3: string;
  onDateChange: (value: string | null, isNA: boolean) => void;
  onTicket1Change: (value: string) => void;
  onTicket2Change: (value: string) => void;
  onTicket3Change: (value: string) => void;
  isRequired?: boolean;
  error?: string;
}

export function PreloadTicketSection({
  date,
  isNA,
  ticket1,
  ticket2,
  ticket3,
  onDateChange,
  onTicket1Change,
  onTicket2Change,
  onTicket3Change,
  isRequired = false,
  error,
}: PreloadTicketSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          Preload Ticket Submitted {isRequired && <span className="text-red-500">*</span>}
          {error && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="preloadTicketSubmittedIsNA"
            checked={isNA}
            onCheckedChange={(checked) => onDateChange(null, checked as boolean)}
          />
          <Label htmlFor="preloadTicketSubmittedIsNA" className="text-sm">
            N/A
          </Label>
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <DateField
            value={date}
            isNA={isNA}
            onChange={onDateChange}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Preloads Initial"
            value={ticket1}
            onChange={(e) => onTicket1Change(e.target.value)}
            disabled={isNA}
          />
          <Input
            placeholder="Preloads Re-Spin"
            value={ticket2}
            onChange={(e) => onTicket2Change(e.target.value)}
            disabled={isNA}
          />
          <Input
            placeholder="Preloads Delete"
            value={ticket3}
            onChange={(e) => onTicket3Change(e.target.value)}
            disabled={isNA}
          />
        </div>
      </div>
      
      {error && (
        <div className="text-xs text-red-500 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </div>
      )}
    </div>
  );
} 