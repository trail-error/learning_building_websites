"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LogIssue } from "@/lib/types"
import { DateField } from "@/components/date-field"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "./multi-select"

interface EditLogIssueDialogProps {
  logIssue: LogIssue
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (logIssue: LogIssue) => Promise<void>
}

export function EditLogIssueDialog({ logIssue, open, onOpenChange, onUpdate }: EditLogIssueDialogProps) {
  const { toast } = useToast()
  const [editedLogIssue, setEditedLogIssue] = useState<LogIssue>({
    ...logIssue,
    resolutionOwner: Array.isArray(logIssue.resolutionOwner)
      ? logIssue.resolutionOwner
      : [logIssue.resolutionOwner].filter(Boolean),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [openResolutionOwner, setOpenResolutionOwner] = useState(false)
  const [openRootCauseOwner, setOpenRootCauseOwner] = useState(false)

  // Update local state when logIssue prop changes
  useEffect(() => {
    setEditedLogIssue({
      ...logIssue,
      resolutionOwner: Array.isArray(logIssue.resolutionOwner)
        ? logIssue.resolutionOwner
        : [logIssue.resolutionOwner].filter(Boolean),
    })
  }, [logIssue])

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        const data = await response.json()
        if (data.users) {
          setUsers(data.users)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (open) {
      fetchUsers()
    }
  }, [open])

  const handleInputChange = (field: keyof LogIssue, value: any) => {
    setEditedLogIssue((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddResolutionOwner = (email: string) => {
    if (!editedLogIssue.resolutionOwner.includes(email)) {
      handleInputChange("resolutionOwner", [...editedLogIssue.resolutionOwner, email])
    }
    setOpenResolutionOwner(false)
  }

  const handleRemoveResolutionOwner = (email: string) => {
    handleInputChange(
      "resolutionOwner",
      editedLogIssue.resolutionOwner.filter((owner) => owner !== email),
    )
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!editedLogIssue.pod) {
      toast({
        title: "Missing Required Field",
        description: "POD is a required field",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate(editedLogIssue)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating log issue:", error)
      toast({
        title: "Error",
        description: "Failed to update log issue",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log("editing log issue resolotuin owner",editedLogIssue)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Log & Issue</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 h-[70vh] overflow-y-scroll">
          <div className="space-y-2">
            <Label htmlFor="pod">POD *</Label>
            <Input
              id="pod"
              value={editedLogIssue.pod}
              onChange={(e) => handleInputChange("pod", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date Opened</Label>
            <DateField value={editedLogIssue.dateOpened} onChange={(value) => handleInputChange("dateOpened", value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lepVersionBeingApplied">LEP Version Being Applied</Label>
            <Input
              id="lepVersionBeingApplied"
              value={editedLogIssue.lepVersionBeingApplied}
              onChange={(e) => handleInputChange("lepVersionBeingApplied", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={editedLogIssue.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rootCauseOwner">Root Cause Owner</Label>
            <Popover open={openRootCauseOwner} onOpenChange={setOpenRootCauseOwner}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openRootCauseOwner}
                  className="w-full justify-between"
                >
                  {editedLogIssue.rootCauseOwner ? editedLogIssue.rootCauseOwner : "Select root cause owner..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {users.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.email}
                          onSelect={() => {
                            handleInputChange("rootCauseOwner", user.email)
                            setOpenRootCauseOwner(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              editedLogIssue.rootCauseOwner === user.email ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {user.email}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="resolutionOwner">Resolution Owners</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedLogIssue.resolutionOwner.map((owner) => (
                <Badge key={owner} variant="secondary" className="flex items-center gap-1">
                  {owner}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveResolutionOwner(owner)} />
                </Badge>
              ))}
            </div>
            <Popover open={openResolutionOwner} onOpenChange={setOpenResolutionOwner}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openResolutionOwner}
                  className="w-full justify-between"
                >
                  Select resolution owners...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {users.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.email}
                          onSelect={() => handleAddResolutionOwner(user.email)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              editedLogIssue.resolutionOwner.includes(user.email) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {user.email}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="resolutionOwner">Resolution Owners</Label>

            <MultiSelect

              options={users.map((x) => ({
                label: x.email,
                value: x.email,
              }))}
              defaultValue={editedLogIssue.resolutionOwner}
          
              modalPopover={true}
              onValueChange={(e) => {
          
                handleInputChange("resolutionOwner", e);
              }}
              placeholder="Select Resolution Owners"
              variant="inverted"
              animation={2}
              maxCount={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedLogIssue.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={editedLogIssue.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
