"use client";

import type React from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Pod, Status, SubStatus, Org, PodType } from "@/lib/types";
import { DateField } from "@/components/date-field";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { updatePod } from "@/lib/actions";
import { useAuth } from "@/contexts/auth-context";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "./ui/command";
import { cn, determineRouterType } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PreloadTicketSection } from "./preload-ticket-section";
import { DnsSection } from "./dns-section";
import { DateFieldWithBundle } from "./date-field-with-bundle";

interface EditPodDialogProps {
  pod: Pod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshData?: () => void;
}

// Define all required fields for Complete status
const REQUIRED_FIELDS_FOR_COMPLETE = [
  "pod",
  "internalPodId",
  // "type",
  "assignedEngineer",
  "status",
  "subStatus",
  "org",
  "creationTimestamp",
  "lcmComplete",
  "preloadComplete",
  "clli",
  "city",
  "state",
  "routerType",
  "router1",
  "router2",
  "podProgramType",
  "tenantName",
  "currentLepVersion",
  "lepVersionToBeApplied",
  "podType",
  // Date fields
  "lepAssessment",
  "dlpTemplateUpdates",
  "ipAcquisition",
  "ipAllocation",
  "conversionFileUpdate",
  "conversionFileValidation",
  "pepGeneration",
  "connectitTdsCreation",
  "connectitPreloadCreation",
  "checklistCreation",
  "vmDeleteList",
  "vmDeletesComplete",
  "lcmNetworkDeletes",
  "macdCreation",
  "atsMacdApproval",
  "lcmNetworkDeleteCompletion",
  "dlpUploads",
  "cdmLoad",
  "inServiceVavAudit",
  "globalCvaasAudit",
  // "dnsDeletes",
  // "dnsAdds",
  "lcmAddTicket",
  "preloadTicketSubmitted",
  "ixcRoamingSmop",
  "gtmVvmSmop",
  "otherRouting",
  "publishPep",
  "ticketNotificationEmail",
  "myloginsRequest",
  "projectManagers",
  "linkToActiveTds",
  "linkToActivePreloads",
  "notes",
  "routerType"
];

// Group fields by tab for easier navigation
const BASIC_TAB_FIELDS = [
  "pod",
  "internalPodId",
  "type",
  "assignedEngineer",
  "status",
  "subStatus",
  "org",
  "creationTimestamp",
];

const DETAILS_TAB_FIELDS = [
  "clli",
  "city",
  "state",
  "routerType",
  "router1",
  "router2",
  "podProgramType",
  "tenantName",
  "currentLepVersion",
  "lepVersionToBeApplied",
  "podType",
];

const DATES_TAB_FIELDS = [
  "lcmComplete",
  "preloadComplete",
  "lepAssessment",
  "dlpTemplateUpdates",
  "ipAcquisition",
  "ipAllocation",
  "conversionFileUpdate",
  "conversionFileValidation",
  "pepGeneration",
  "connectitTdsCreation",
  "connectitPreloadCreation",
  "checklistCreation",
  "vmDeleteList",
  "vmDeletesComplete",
  "lcmNetworkDeletes",
  "macdCreation",
  "atsMacdApproval",
  "lcmNetworkDeleteCompletion",
  "dlpUploads",
  "cdmLoad",
  "inServiceVavAudit",
  "globalCvaasAudit",
  "dnsDeletes",
  "dnsAdds",
  "lcmAddTicket",
  "preloadTicketSubmitted",
  "ixcRoamingSmop",
  "gtmVvmSmop",
  "otherRouting",
  "publishPep",
  "ticketNotificationEmail",
  "myloginsRequest",
];

const POD_PROGRAM_TYPE_OPTIONS = [
  "BB UP + NR (2208) Brownfield",
  "BB UP + NR (2208) Greenfield",
  "BB UP + NR (2304) Brownfield - No eUPF",
  "BB UP + NR (2304) Brownfield w/ eUPF",
  "BB UP + NR (2304) Greenfield - No eUPF",
  "BB UP + NR (2304) Greenfield w/ eUPF",
  "BB UP + NR (24.06) Brownfield w/ cUPF - No eUPF",
  "BB UP + NR(24.06) Brownfield w/ cUPF + eUPF",
  "BB UP + NR(24.06) Brownfield w/ eUPF",
  "BB UP + NR (24.06) Greenfield w/ cUPF - No eUPF",
  "BB UP + NR (24.06) Greenfield w/eUPF",
  "BB UP + NR Brownfield",
  "BF FN 5G",
  "BF FN 5G (2303)",
  "BF FN 5G (2405)",
  "BlackBird CP",
  "Cookie 2 (2502 v8.3)",
  "Cookie 4 (2403)",
  "Enterprise (2304)",
  "Enterprise (2310)",
  "Enterprise (2407)",
  "FN eMBMS",
  "FN eMBMS (2401)",
  "FN eMBMS(2401) SI Rebuilds",
  "FN Radcom NGxP RBE (2304)",
  "NGNI NBE vProbe",
  "NGxP NBE Type 1 (2304)",
  "NGxP NBE Type 2 (2304)",
  "NGxP RBE NRT2 (2304)",
  "NGxP vProbe FN Regional Backend FRT2",
  "NGxP vProbe Regional Backends - Type 2",
  "NorthRim CP CHF",
  "NorthRim CP Local(2304)",
  "NorthRim CP Local(2406)",
  "NorthRim CP National (2304)",
  "NorthRim CP National (2402)",
  "NorthRim CP Regional (2403)",
  "NorthRim CP SZ (23.04)",
  "NorthRim cp SZ (2304)",
  "Radcom NGxP NBE (2304)",
  "Radcom NGxP RBE (2304)"
];


export function EditPodDialog({ pod, open, onOpenChange, refreshData }: EditPodDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [editedPod, setEditedPod] = useState<Pod>(pod);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchUserPopoverOpen, setSearchUserPopoverOpen] = useState(false);

  // Update local state when pod prop changes
  useEffect(() => {
    setEditedPod(pod);
    setErrors({});
  }, [pod]);

  // Auto-determine router type when router1 or router2 changes (only if routerType is empty)
  useEffect(() => {
    const determinedRouterType = determineRouterType(editedPod.router1, editedPod.router2);
    if (determinedRouterType && !editedPod.routerType) {
      setEditedPod((prev) => ({ ...prev, routerType: determinedRouterType }));
    }
  }, [editedPod.router1, editedPod.router2]);



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

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleInputChange = (field: keyof Pod, value: any) => {
    console.log("handleInpput Change called", value, field);
    setEditedPod((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when it's changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBundleApply = (fields: string[], selectedDate: string) => {
    // Apply the selected date to all selected fields
    setEditedPod((prev) => {
      const updated = { ...prev };
      fields.forEach(field => {
        (updated as any)[field] = selectedDate;
        (updated as any)[`${field}IsNA`] = false;
      });
      return updated;
    });
  };

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields for all statuses
    // if (!editedPod.pod) newErrors.pod = "POD ID is required";
    // if (!editedPod.internalPodId)
    //   newErrors.internalPodId = "Internal POD ID is required";
    // if (!editedPod.type) newErrors.type = "Type is required";
    // if (!editedPod.assignedEngineer)
    //   newErrors.assignedEngineer = "Assigned Engineer is required";
    // if (!editedPod.status) newErrors.status = "Status is required";
    // if (!editedPod.subStatus) newErrors.subStatus = "Sub Status is required";
    // if (!editedPod.org) newErrors.org = "Org is required";

    // Additional validations for Complete status

    if (
      (editedPod.lcmAddTicket && !editedPod.lcmAddTicketNumber) ||
      (editedPod.lcmNetworkDeletes && !editedPod.lcmNetworkDeletesTicket) ||
      (editedPod.dns && !editedPod.dnsTicketAddsDeletes && !editedPod.dnsTicketChanges) ||
      (editedPod.preloadTicketSubmitted && !editedPod.preloadTicketNumber1 && !editedPod.preloadTicketNumber2 && !editedPod.preloadTicketNumber3) ||
      (editedPod.ixcRoamingSmop && !editedPod.ixcRoamingSmopTicket) ||
      (editedPod.gtmVvmSmop && !editedPod.gtmVvmSmopTicket)
    ) {
    }

    if (editedPod.lcmAddTicket && !editedPod.lcmAddTicketNumber) {
      newErrors["lcmAddTicket"] = "Please Fill Ticket Number";
    }

    if (editedPod.lcmNetworkDeletes && !editedPod.lcmNetworkDeletesTicket) {
      newErrors["lcmNetworkDeletes"] = "Please Fill Ticket Number";
    }
    if (editedPod.dns && !editedPod.dnsTicketAddsDeletes && !editedPod.dnsTicketChanges) {
      newErrors["dns"] = "Please Fill At Least One Ticket Number";
    }
    if (editedPod.preloadTicketSubmitted && !editedPod.preloadTicketNumber1 && !editedPod.preloadTicketNumber2 && !editedPod.preloadTicketNumber3) {
      newErrors["preloadTicketSubmitted"] = "Please Fill At Least One Ticket Number";
    }
    if (editedPod.ixcRoamingSmop && !editedPod.ixcRoamingSmopTicket) {
      newErrors["ixcRoamingSmop"] = "Please Fill Ticket Number";
    }
    if (editedPod.gtmVvmSmop && !editedPod.gtmVvmSmopTicket) {
      newErrors["gtmVvmSmop"] = "Please Fill Ticket Number";
    }
    if (editedPod.status === "Complete") {
      // Check all required fields for Complete status
      REQUIRED_FIELDS_FOR_COMPLETE.forEach((field) => {
        const fieldKey = field as keyof Pod;
        const isNAField = `${field}IsNA` as keyof Pod;

        // Skip fields that are marked as N/A
        if (editedPod[isNAField] === true) {
          return;
        }

        // Check if the field is empty
        if (!editedPod[fieldKey] && fieldKey !== "special") {
          newErrors[field] = `${field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
            } is required for Complete status`;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTabWithErrors = (): string => {
    // Check if there are errors in the basic tab
    if (Object.keys(errors).some((key) => BASIC_TAB_FIELDS.includes(key))) {
      return "basic";
    }

    // Check if there are errors in the details tab
    if (Object.keys(errors).some((key) => DETAILS_TAB_FIELDS.includes(key))) {
      return "details";
    }

    // Check if there are errors in the dates tab
    if (Object.keys(errors).some((key) => DATES_TAB_FIELDS.includes(key))) {
      return "dates";
    }

    return activeTab;
  };

  const handleSubmit = async () => {
    // Validate fields
    if (!validateFields()) {
      // If there are errors, switch to the tab containing the first error
      const tabWithErrors = getTabWithErrors();
     
      setActiveTab(tabWithErrors);

      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Ensure the id field is included
    if (!editedPod.id) {
      console.error("Missing POD ID for update");
      toast({
        title: "Error",
        description: "Missing POD ID for update",
        variant: "destructive",
      });
      return;
    }

    // Ensure user is authenticated
    if (!user || !user.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update a POD",
        variant: "destructive",
      });
      return;
    }

    // Make a copy of the pod to ensure we're not sending null values
    const podToUpdate: any = { ...editedPod };

    // Ensure all fields have valid values (not null or undefined)
    Object.keys(podToUpdate).forEach((key) => {
      const fieldKey = key as keyof Pod;
      if (
        podToUpdate[fieldKey] === null ||
        podToUpdate[fieldKey] === undefined
      ) {
        // For string fields, use empty string instead of null
        if (typeof pod[fieldKey] === "string") {
          podToUpdate[fieldKey] = "" as any;
        }
        // For number fields, use 0 instead of null
        else if (typeof pod[fieldKey] === "number") {
          podToUpdate[fieldKey] = 0 as any;
        }
      }
    });

    setIsSubmitting(true);
    try {

      const result = await updatePod(podToUpdate, user.id);
      
      if (result.success) {
        if (editedPod.status === "Complete") {
          toast({
            title: "POD Completed",
            description: `POD ${editedPod.pod} has been marked as Complete.`,
          });
        } else {
          toast({
            title: "POD Updated",
            description: `POD ${editedPod.pod} has been updated successfully.`,
          });
        }

        onOpenChange(false);

        // Refresh data silently if refreshData function is provided
        if (refreshData) {
          refreshData();
        } else {
          // Fallback to page reload if no refresh function is provided
          window.location.reload();
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update POD",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating pod:", error);
      toast({
        title: "Error",
        description: "Failed to update POD.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render date field with ticket number
  const renderDateWithTicket = (
    dateField: keyof Pod,
    ticketField: keyof Pod,
    label: string
  ) => {
    const isRequired =
      editedPod.status === "Complete" &&
      !editedPod[`${dateField}IsNA` as keyof Pod];
    const isNA = editedPod[`${dateField}IsNA` as keyof Pod] as boolean;

    return (
      <div className="space-y-2">
        <Label>
          {label} {isRequired && <span className="text-red-500">*</span>}
          {errors[dateField as string] && (
            <span className="text-red-500">*</span>
          )}
        </Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <DateField
              value={editedPod[dateField] as string | null}
              isNA={isNA}
              onChange={(value, isNA) => {
                handleInputChange(dateField, value);
                handleInputChange(`${dateField}IsNA` as keyof Pod, isNA);
              }}

            // className={errors[dateField as string] ? "border-red-500" : ""}
            />
            {errors[dateField as string] && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors[dateField as string]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <Input
              placeholder="Ticket #"
              value={(editedPod[ticketField] as string) || ""}
              onChange={(e) => handleInputChange(ticketField, e.target.value)}
              disabled={isNA}
            />
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render a date field with error message
  const renderDateField = (field: keyof Pod, label: string) => {
    const isRequired =
      editedPod.status === "Complete" &&
      !editedPod[`${field}IsNA` as keyof Pod];

    return (
      <div className="space-y-2 relative">
        <Label>
          {label} {isRequired && <span className="text-red-500">*</span>}
          {errors[field as string] && <span className="text-red-500">*</span>}
        </Label>
        <DateField
          value={editedPod[field] as string | null}
          isNA={editedPod[`${field}IsNA` as keyof Pod] as boolean}
          onChange={(value, isNA) => {
            handleInputChange(field, value);
            handleInputChange(`${field}IsNA` as keyof Pod, isNA);
          }}
          name={field}
        // className={errors[field as string] ? "border-red-500" : ""}
        />
        {errors[field as string] && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors[field as string]}
          </div>
        )}
      </div>
    );
  };

  // Helper function to render a field with error message
  const renderFieldWithError = (
    field: keyof Pod,
    label: string,
    children: React.ReactNode
  ) => {
    const isRequired = editedPod.status === "Complete";

    return (
      <div className="space-y-2 relative">
        <Label htmlFor={field as string}>
          {label} {isRequired && <span className="text-red-500">*</span>}
          {errors[field as string] && <span className="text-red-500">*</span>}
        </Label>
        {children}
        {errors[field as string] && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors[field as string]}
          </div>
        )}
      </div>
    );
  };

  // Helper function to render a bundled date field
  const renderBundledDateField = (field: keyof Pod, label: string) => {
    const isRequired =
      editedPod.status === "Complete" &&
      !editedPod[`${field}IsNA` as keyof Pod];

    return (
      <div className="space-y-2 relative">
        <Label>
          {label} {isRequired && <span className="text-red-500">*</span>}
          {errors[field as string] && <span className="text-red-500">*</span>}
        </Label>
        <DateFieldWithBundle
          value={editedPod[field] as string | null}
          isNA={editedPod[`${field}IsNA` as keyof Pod] as boolean}
          onChange={(value, isNA) => {
            handleInputChange(field, value);
            handleInputChange(`${field}IsNA` as keyof Pod, isNA);
          }}
          name={field as string}
          pod={editedPod}
          onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
        />
        {errors[field as string] && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors[field as string]}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit POD: {pod.pod}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger
              value="basic"
              className={
                Object.keys(errors).some((key) =>
                  BASIC_TAB_FIELDS.includes(key)
                )
                  ? "text-red-500 font-bold"
                  : ""
              }
            >
              Basic Information
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className={
                Object.keys(errors).some((key) =>
                  DETAILS_TAB_FIELDS.includes(key)
                )
                  ? "text-red-500 font-bold"
                  : ""
              }
            >
              POD Details
            </TabsTrigger>
            <TabsTrigger
              value="dates"
              className={
                Object.keys(errors).some((key) =>
                  DATES_TAB_FIELDS.includes(key)
                )
                  ? "text-red-500 font-bold"
                  : ""
              }
            >
              Date Fields
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {renderFieldWithError(
                "pod",
                "POD (Unique Identifier) *",
                <Input
                  id="pod"
                  value={editedPod.pod}
                  onChange={(e) => handleInputChange("pod", e.target.value)}
                  required
                  disabled // POD is the unique identifier and shouldn't be changed
                  className={errors.pod ? "border-red-500" : ""}
                />
              )}

              {renderFieldWithError(
                "internalPodId",
                "Internal POD ID *",
                <Input
                  id="internalPodId"
                  value={editedPod.internalPodId}
                  onChange={(e) =>
                    handleInputChange("internalPodId", e.target.value)
                  }
                  required
                  className={errors.internalPodId ? "border-red-500" : ""}
                />
              )}

              {/* {renderFieldWithError(
                "type",
                "Type *",
                <Input
                  id="type"
                  value={editedPod.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  required
                  className={errors.type ? "border-red-500" : ""}
                />
              )} */}

              <div className="space-y-2">
                <Label htmlFor="podTypeOriginal">Pod Type</Label>
                <Select
                  value={editedPod.podTypeOriginal || ''}
                  onValueChange={(value) => handleInputChange('podTypeOriginal', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pod Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FFA">FFA</SelectItem>
                    <SelectItem value="Greenfield">Greenfield</SelectItem>
                    <SelectItem value="Brownfield Upgrades">Brownfield Upgrades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderFieldWithError(
                "podProgramType",
                "POD Program Type",
                <Select
                  value={editedPod.podProgramType || ''}
                  onValueChange={(value) => handleInputChange('podProgramType', value)}
                >
                  <SelectTrigger className={errors.podProgramType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select POD Program Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POD_PROGRAM_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderFieldWithError(
                "assignedEngineer",
                "Assigned Engineer *",
                // <Input
                //   id="assignedEngineer"
                //   value={editedPod.assignedEngineer}
                //   onChange={(e) => handleInputChange("assignedEngineer", e.target.value)}
                //   required
                //   className={errors.assignedEngineer ? "border-red-500" : ""}
                // />

                <Popover
                  open={searchUserPopoverOpen}
                  modal={true}
                  onOpenChange={setSearchUserPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchUserPopoverOpen}
                      className="w-full justify-between"
                    >
                      {editedPod?.assignedEngineer
                        ? editedPod?.assignedEngineer
                        : "Select Engineer..."}
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
                                handleInputChange(
                                  "assignedEngineer",
                                  user.email
                                );
                                setSearchUserPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  pod.assignedEngineer === user.email
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
                </Popover>
              )}

              {renderFieldWithError(
                "status",
                "Status *",
                <Select
                  value={editedPod.status}
                  onValueChange={(value) =>
                    handleInputChange("status", value as Status)
                  }
                >
                  <SelectTrigger
                    className={errors.status ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial">Initial</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Data Management">
                      Data Management
                    </SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Revision">Revision</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Reject">Reject</SelectItem>
                    <SelectItem value="Decom">Decom</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {renderFieldWithError(
                "subStatus",
                "Sub Status *",
                <Select
                  value={editedPod.subStatus}
                  onValueChange={(value) =>
                    handleInputChange("subStatus", value as SubStatus)
                  }
                >
                  <SelectTrigger
                    className={errors.subStatus ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select sub status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                    <SelectItem value="Conversion File">
                      Conversion File
                    </SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Normalization Required">
                      Normalization Required
                    </SelectItem>
                    <SelectItem value="PEP Generation">
                      PEP Generation
                    </SelectItem>
                    <SelectItem value="TDS Generation">
                      TDS Generation
                    </SelectItem>
                    <SelectItem value="Preload Generation">
                      Preload Generation
                    </SelectItem>
                    <SelectItem value="Services Connectivity">
                      Services Connectivity
                    </SelectItem>
                    <SelectItem value="NPB">NPB</SelectItem>
                    <SelectItem value="VM Deletes">VM Deletes</SelectItem>
                    <SelectItem value="Network Deletes">
                      Network Deletes
                    </SelectItem>
                    <SelectItem value="MACD Approval">MACD Approval</SelectItem>
                    <SelectItem value="DLP">DLP</SelectItem>
                    <SelectItem value="CDM">CDM</SelectItem>
                    <SelectItem value="CVaaS">CVaaS</SelectItem>
                    <SelectItem value="DNS Deletes">DNS Deletes</SelectItem>
                    <SelectItem value="DNS Adds">DNS Adds</SelectItem>
                    <SelectItem value="Network Adds/MACD">
                      Network Adds/MACD
                    </SelectItem>
                    <SelectItem value="Preload Deletes">
                      Preload Deletes
                    </SelectItem>
                    <SelectItem value="Preload Adds">Preload Adds</SelectItem>
                    <SelectItem value="LEP Update">LEP Update</SelectItem>
                    <SelectItem value="PEP Update">PEP Update</SelectItem>
                    <SelectItem value="ORT Not Complete">
                      ORT Not Complete
                    </SelectItem>
                    <SelectItem value="Tenant Definition">
                      Tenant Definition
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {renderFieldWithError(
                "org",
                "Org *",
                <Select
                  value={editedPod.org}
                  onValueChange={(value) =>
                    handleInputChange("org", value as Org)
                  }
                >
                  <SelectTrigger className={errors.org ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATS">ATS</SelectItem>
                    <SelectItem value="DNS Ops">DNS Ops</SelectItem>
                    <SelectItem value="ENG">ENG</SelectItem>
                    <SelectItem value="LABS">LABS</SelectItem>
                    <SelectItem value="LCM">LCM</SelectItem>
                    <SelectItem value="VNF Ops">VNF Ops</SelectItem>
                    <SelectItem value="PMO">PMO</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {renderDateField("creationTimestamp", "Creation Timestamp *")}

              <div className="space-y-2">
                <Label htmlFor="projectManagers">Project Managers</Label>
                <Input
                  id="projectManagers"
                  value={editedPod.projectManagers || ''}
                  onChange={(e) => handleInputChange('projectManagers', e.target.value)}
                  placeholder="Enter project manager names"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="details"
            className="space-y-4 pt-4 h-[65vh] overflow-y-scroll"
          >
            <div className="grid grid-cols-2 gap-4">
              {renderDateField("slaCalculatedNbd", "SLA Calculated NBD")}

              {renderDateField("podWorkableDate", "POD Workable Date")}

              <div className="space-y-2">
                <Label htmlFor="totalElapsedCycleTime">
                  Total Elapsed Cycle Time
                </Label>
                <Input
                  id="totalElapsedCycleTime"
                  type="text"
                  value={`${editedPod.totalElapsedCycleTime} days`}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Automatically calculated from Assigned Engineer date to LCM
                  Complete date (or current date)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workableCycleTime">Workable Cycle Time</Label>
                <Input
                  id="workableCycleTime"
                  type="number"
                  value={editedPod.workableCycleTime.toString()}
                  onChange={(e) =>
                    handleInputChange(
                      "workableCycleTime",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeInCurrentStatus">
                  Time In Current Status
                </Label>
                <Input
                  id="timeInCurrentStatus"
                  value={editedPod.timeInCurrentStatus}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Automatically calculated based on current sub-status and last
                  change date
                </p>
              </div>

              {renderFieldWithError(
                "clli",
                "CLLI",
                <Input
                  id="clli"
                  value={editedPod.clli}
                  onChange={(e) => handleInputChange("clli", e.target.value)}
                  className={errors.clli ? "border-red-500" : ""}
                />
              )}

              {renderFieldWithError(
                "city",
                "City",
                <Input
                  id="city"
                  value={editedPod.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={errors.city ? "border-red-500" : ""}
                />
              )}

              {renderFieldWithError(
                "state",
                "State",
                <Input
                  id="state"
                  value={editedPod.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className={errors.state ? "border-red-500" : ""}
                />
              )}

              <div className="space-y-2">
                <Label htmlFor="routerType">Router Type</Label>
                <Input
                  id="routerType"
                  value={editedPod.routerType}
                  onChange={(e) => handleInputChange("routerType", e.target.value)}
                  className={errors.routerType ? "border-red-500" : ""}
                  placeholder="Auto-determined from Router 1 & 2 (or enter manually)"
                />
                <p className="text-xs text-muted-foreground">
                  Automatically determined based on Router 1 and Router 2 endings, or enter manually
                </p>
              </div>

              {renderFieldWithError(
                "router1",
                "Router 1",
                <Input
                  id="router1"
                  value={editedPod.router1}
                  onChange={(e) => handleInputChange("router1", e.target.value)}
                  className={errors.router1 ? "border-red-500" : ""}
                />
              )}

              {renderFieldWithError(
                "router2",
                "Router 2",
                <Input
                  id="router2"
                  value={editedPod.router2}
                  onChange={(e) => handleInputChange("router2", e.target.value)}
                  className={errors.router2 ? "border-red-500" : ""}
                />
              )}




              {renderFieldWithError(
                "tenantName",
                "Tenant Name",
                <Input
                  id="tenantName"
                  value={editedPod.tenantName}
                  onChange={(e) =>
                    handleInputChange("tenantName", e.target.value)
                  }
                  className={errors.tenantName ? "border-red-500" : ""}
                />
              )}

              {renderFieldWithError(
                "currentLepVersion",
                "Current LEP Version",
                <Input
                  id="currentLepVersion"
                  value={editedPod.currentLepVersion}
                  onChange={(e) =>
                    handleInputChange("currentLepVersion", e.target.value)
                  }
                  className={errors.currentLepVersion ? "border-red-500" : ""}
                />
              )}

              {renderFieldWithError(
                "lepVersionToBeApplied",
                "LEP Version To Be Applied",
                <Input
                  id="lepVersionToBeApplied"
                  value={editedPod.lepVersionToBeApplied}
                  onChange={(e) =>
                    handleInputChange("lepVersionToBeApplied", e.target.value)
                  }
                  className={
                    errors.lepVersionToBeApplied ? "border-red-500" : ""
                  }
                />
              )}



              {renderFieldWithError(
                "podType",
                "Tenant Requirements",
                <Select
                  value={editedPod.podType || ''}
                  onValueChange={(value) => handleInputChange('podType', value as PodType)}
                >
                  <SelectTrigger className={errors.podType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Tenant Requirements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eUPF">eUPF</SelectItem>
                    <SelectItem value="MS UPF">MS UPF</SelectItem>
                    <SelectItem value="AIA">AIA</SelectItem>
                    <div className="px-2 py-1 border-t mt-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editedPod.special}
                          onChange={() => handleInputChange('special', !editedPod.special)}
                        />
                        <span>Special</span>
                      </label>
                    </div>
                  </SelectContent>
                </Select>
              )}

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={editedPod.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter any additional notes or comments about this POD..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkToActiveTds">Link to Active TDS</Label>
                <Input
                  id="linkToActiveTds"
                  value={editedPod.linkToActiveTds || ''}
                  onChange={(e) => handleInputChange('linkToActiveTds', e.target.value)}
                  placeholder="Enter TDS link"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkToActivePreloads">Link to Active Preloads</Label>
                <Input
                  id="linkToActivePreloads"
                  value={editedPod.linkToActivePreloads || ''}
                  onChange={(e) => handleInputChange('linkToActivePreloads', e.target.value)}
                  placeholder="Enter preloads link"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="dates"
            className="space-y-4 pt-4 h-[65vh] overflow-y-scroll"
          >
            <div className="grid grid-cols-2 gap-4">
              {renderDateField("lepAssessment", "LEP Assessment (FFA only)")}
              {renderDateField("dlpTemplateUpdates", "DLP Template Updates")}
              {renderDateField("ipAcquisition", "IP Acquisition")}
              {renderDateField("ipAllocation", "IP Allocation")}

              {renderDateField(
                "conversionFileUpdate",
                "Conversion File Update"
              )}
              {renderDateField(
                "conversionFileValidation",
                "Conversion File Validation"
              )}
              {renderBundledDateField("pepGeneration", "PEP Generation")}
              {renderBundledDateField("checklistCreation", "Checklist Creation")}
              {renderBundledDateField(
                "connectitTdsCreation",
                "ConnectIT TDS Creation"
              )}
              {renderBundledDateField(
                "connectitPreloadCreation",
                "ConnectIT Preload Creation"
              )}
              {renderDateField("vmDeleteList", "VM Delete List")}
              {renderDateField("vmDeletesComplete", "VM Deletes Complete")}
              {renderDateField(
                "lcmNetworkDeleteCompletion",
                "LCM Network Delete Completion"
              )}
              {renderBundledDateField("dlpUploads", "DLP Uploads")}
              {renderBundledDateField("cdmLoad", "CDM Load")}
              {renderBundledDateField("inServiceVavAudit", "In-Service VAV Audit")}
              {renderBundledDateField("globalCvaasAudit", "Global CVaaS Audit")}
              <DnsSection
                date={editedPod.dns}
                isNA={editedPod.dnsIsNA || false}
                ticketAddsDeletes={editedPod.dnsTicketAddsDeletes || ""}
                ticketChanges={editedPod.dnsTicketChanges || ""}
                onDateChange={(value, isNA) => {
                  handleInputChange("dns", value);
                  handleInputChange("dnsIsNA", isNA);
                }}
                onTicketAddsDeletesChange={(value) => handleInputChange("dnsTicketAddsDeletes", value)}
                onTicketChangesChange={(value) => handleInputChange("dnsTicketChanges", value)}
                isRequired={editedPod.status === "Complete"}
                error={errors.dns}
              />
              {renderDateField("macdCreation", "MACD Creation")}
              {renderDateField("atsMacdApproval", "ATS MACD Approval")}
              {renderDateWithTicket(
                "lcmAddTicket",
                "lcmAddTicketNumber",
                "LCM Add Ticket"
              )}

              <PreloadTicketSection
                date={editedPod.preloadTicketSubmitted}
                isNA={editedPod.preloadTicketSubmittedIsNA || false}
                ticket1={editedPod.preloadTicketNumber1 || ""}
                ticket2={editedPod.preloadTicketNumber2 || ""}
                ticket3={editedPod.preloadTicketNumber3 || ""}
                onDateChange={(value, isNA) => {
                  handleInputChange("preloadTicketSubmitted", value);
                  handleInputChange("preloadTicketSubmittedIsNA", isNA);
                }}
                onTicket1Change={(value) => handleInputChange("preloadTicketNumber1", value)}
                onTicket2Change={(value) => handleInputChange("preloadTicketNumber2", value)}
                onTicket3Change={(value) => handleInputChange("preloadTicketNumber3", value)}
                isRequired={editedPod.status === "Complete"}
                error={errors.preloadTicketSubmitted}
              />
              {renderDateWithTicket(
                "ixcRoamingSmop",
                "ixcRoamingSmopTicket",
                "IXC Roaming SMOP"
              )}
              {renderDateWithTicket(
                "gtmVvmSmop",
                "gtmVvmSmopTicket",
                "GTM/VVM SMOP"
              )}

              {/* Use the new renderDateWithTicket helper for fields that need ticket numbers */}

              {renderDateWithTicket(
                "lcmNetworkDeletes",
                "lcmNetworkDeletesTicket",
                "LCM Network Deletes"
              )}
              {renderDateField("otherRouting", "Other Routing")}
              {renderDateField("publishPep", "Publish PEP")}
              {renderDateField(
                "ticketNotificationEmail",
                "Ticket Notification Email"
              )}
              {renderDateField("myloginsRequest", "Mylogins Request")}
              {renderDateField("lcmComplete", "LCM Complete")}
              {renderDateField("preloadComplete", "Preload Complete")}
            </div>
          </TabsContent>
        </Tabs>

        {/* {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <h3 className="text-red-800 font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Please fix the following errors:
            </h3>
            <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )} */}

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
  );
}
