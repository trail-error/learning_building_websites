"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogIssue } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { DateField } from "@/components/date-field";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "./multi-select";
import { useAuth } from "@/contexts/auth-context";

interface AddLogIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (logIssue: LogIssue) => void;
}

export function AddLogIssueDialog({
  open,
  onOpenChange,
  onAdd,
}: AddLogIssueDialogProps) {
  const { toast } = useToast();
  const {user} =  useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [pods,setPods] = useState<any[]>([]);
  const [openResolutionOwner, setOpenResolutionOwner] = useState(false);
  const [openRootCauseOwner, setOpenRootCauseOwner] = useState(false);

  const [newLogIssue, setNewLogIssue] = useState<LogIssue>({
    id: generateId(),
    pod: "",
    dateOpened: new Date().toISOString().split("T")[0],
    lepVersionBeingApplied: "",
    status: "Open",
    rootCauseOwner: user?.email ?? "", 
    resolutionOwner: [], // Initialize as empty array
    description: "",
    notes: "",
  });




  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchPods =  async () => {
      try {
        const response = await fetch("/api/pods");
        const data = await response.json();
        if (data.pods) {
          setPods(data.pods);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    if (open) {
      fetchUsers();
      fetchPods()
    }
  }, [open]);

  const handleInputChange = (field: keyof LogIssue, value: any) => {
    setNewLogIssue((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddResolutionOwner = (email: string) => {
    if (!newLogIssue.resolutionOwner.includes(email)) {
      handleInputChange("resolutionOwner", [
        ...newLogIssue.resolutionOwner,
        email,
      ]);
    }
    setOpenResolutionOwner(false);
  };

  const handleRemoveResolutionOwner = (email: string) => {
    handleInputChange(
      "resolutionOwner",
      newLogIssue.resolutionOwner.filter((owner) => owner !== email)
    );
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!newLogIssue.pod) {
      toast({
        title: "Missing Required Field",
        description: "POD is a required field",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(newLogIssue);

      // Reset form
      setNewLogIssue({
        id: generateId(),
        pod: "",
        dateOpened: new Date().toISOString().split("T")[0],
        lepVersionBeingApplied: "",
        status: "Open",
        rootCauseOwner: "",
        resolutionOwner: [],
        description: "",
        notes: "",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error adding log issue:", error);
      toast({
        title: "Error",
        description: "Failed to add log issue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(()=>{
    if(user?.email){
      handleInputChange("rootCauseOwner",user?.email)
    }
  },[user?.email])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Log & Issue</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 h-[70vh] overflow-y-scroll">
        

          <div className="space-y-2">
            <Label htmlFor="status">Select POD</Label>
            <Select
          
              value={newLogIssue.pod}
              onValueChange={(value) => handleInputChange("pod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select POD" />
              </SelectTrigger>
              <SelectContent>
                {pods.map(x=><SelectItem value={x.pod}>{x.pod}</SelectItem>)}
               
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Opened</Label>
            <DateField
              value={newLogIssue.dateOpened}
              onChange={(value) => handleInputChange("dateOpened", value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lepVersionBeingApplied">
              LEP Version Being Applied
            </Label>
            <Input
              id="lepVersionBeingApplied"
              value={newLogIssue.lepVersionBeingApplied}
              onChange={(e) =>
                handleInputChange("lepVersionBeingApplied", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
          
              value={newLogIssue.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
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

            <Input
              id="pod"
              value={newLogIssue.rootCauseOwner}
              disabled={true}
            />
            {/* <Popover
              open={openRootCauseOwner}
              modal={true}
              onOpenChange={setOpenRootCauseOwner}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openRootCauseOwner}
                  className="w-full justify-between"
                >
                  {newLogIssue.rootCauseOwner
                    ? newLogIssue.rootCauseOwner
                    : "Select root cause owner..."}
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
                            handleInputChange("rootCauseOwner", user.email);
                            setOpenRootCauseOwner(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              newLogIssue.rootCauseOwner === user.email
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {user.email}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover> */}
          </div>

         

          <div className="space-y-2">
            <Label htmlFor="resolutionOwner">Resolution Owners</Label>

            <MultiSelect
              
              options={users.map((x) => ({
                label: x.email,
                value: x.email,
              }))}
              value={newLogIssue.resolutionOwner}
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
              value={newLogIssue.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newLogIssue.notes}
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
            {isSubmitting ? "Adding..." : "Add Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
