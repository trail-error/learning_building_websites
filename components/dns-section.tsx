"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/date-field";

interface DnsSectionProps {
  date: string | null;
  isNA: boolean;
  ticketAddsDeletes: string;
  ticketChanges: string;
  onDateChange: (value: string | null, isNA: boolean) => void;
  onTicketAddsDeletesChange: (value: string) => void;
  onTicketChangesChange: (value: string) => void;
  isRequired?: boolean;
  error?: string;
}

export function DnsSection({
  date,
  isNA,
  ticketAddsDeletes,
  ticketChanges,
  onDateChange,
  onTicketAddsDeletesChange,
  onTicketChangesChange,
  isRequired = false,
  error,
}: DnsSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          DNS {isRequired && <span className="text-red-500">*</span>}
          {error && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="dnsIsNA"
            checked={isNA}
            onCheckedChange={(checked) => onDateChange(null, checked as boolean)}
          />
          <Label htmlFor="dnsIsNA" className="text-sm">
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
            placeholder="DNS Adds/Deletes"
            value={ticketAddsDeletes}
            onChange={(e) => onTicketAddsDeletesChange(e.target.value)}
            disabled={isNA}
          />
          <Input
            placeholder="DNS Changes"
            value={ticketChanges}
            onChange={(e) => onTicketChangesChange(e.target.value)}
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