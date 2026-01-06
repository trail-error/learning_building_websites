"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import type { Pod, Status, SubStatus, Org, PodType, AutofillPod } from "@/lib/types"
import { DateField } from "@/components/date-field"
import { useToast } from "@/hooks/use-toast"
import { cn, isCompletable, determineRouterType } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { useRef } from "react"
import { PreloadTicketSection } from "./preload-ticket-section"
import { DnsSection } from "./dns-section"
import { DateFieldWithBundle } from "./date-field-with-bundle"

const POD_PROGRAM_TYPE_OPTIONS: string[] = [
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

interface AddPodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (pod: Pod) => void
  existingPods: Pod[]
  checkPodExists: (podId: string) => Promise<boolean>
}

export function AddPodDialog({ open, onOpenChange, onAdd, existingPods, checkPodExists }: AddPodDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isChecking, setIsChecking] = useState(false)
  const [searchUserPopoverOpen, setSearchUserPopoverOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  // Initialize with default values
  const [newPod, setNewPod] = useState<Pod>({
    pod: "",
    internalPodId: "",
    type: "",
    assignedEngineer: "",
    status: "Initial",
    subStatus: "Assignment",
    org: "ENG",
    priority: 9999, // Default priority for new PODs
    creationTimestamp: new Date().toISOString().split("T")[0],
    creationTimestampIsNA: false,
    slaCalculatedNbd: null,
    slaCalculatedNbdIsNA: false,
    podWorkableDate: null,
    podWorkableDateIsNA: false,
    totalElapsedCycleTime: 0,
    workableCycleTime: 0,
    timeInCurrentStatus: "",
    clli: "",
    city: "",
    state: "",
    routerType: "",
    router1: "",
    router2: "",
    podProgramType: "",
    tenantName: "",
    currentLepVersion: "",
    lepVersionToBeApplied: "",
    podType: "eUPF",
    podTypeOriginal: "",
    special: false,
    lepAssessment: null,
    lepAssessmentIsNA: false,
    dlpTemplateUpdates: null,
    dlpTemplateUpdatesIsNA: false,
    ipAcquisition: null,
    ipAcquisitionIsNA: false,
    ipAllocation: null,
    ipAllocationIsNA: false,
    conversionFileUpdate: null,
    conversionFileUpdateIsNA: false,
    conversionFileValidation: null,
    conversionFileValidationIsNA: false,
    pepGeneration: null,
    pepGenerationIsNA: false,
    connectitTdsCreation: null,
    connectitTdsCreationIsNA: false,
    connectitPreloadCreation: null,
    connectitPreloadCreationIsNA: false,
    checklistCreation: null,
    checklistCreationIsNA: false,
    vmDeleteList: null,
    vmDeleteListIsNA: false,
    vmDeletesComplete: null,
    vmDeletesCompleteIsNA: false,
    lcmNetworkDeletes: null,
    lcmNetworkDeletesIsNA: false,
    macdCreation: null,
    macdCreationIsNA: false,
    atsMacdApproval: null,
    atsMacdApprovalIsNA: false,
    lcmNetworkDeleteCompletion: null,
    lcmNetworkDeleteCompletionIsNA: false,
    dlpUploads: null,
    dlpUploadsIsNA: false,
    cdmLoad: null,
    cdmLoadIsNA: false,
    inServiceVavAudit: null,
    inServiceVavAuditIsNA: false,
    globalCvaasAudit: null,
    globalCvaasAuditIsNA: false,
    dns: null,
    dnsIsNA: false,
    dnsTicketAddsDeletes: "",
    dnsTicketChanges: "",
    lcmAddTicket: null,
    lcmAddTicketIsNA: false,
    preloadTicketSubmitted: null,
    preloadTicketSubmittedIsNA: false,
    preloadTicketNumber1: "",
    preloadTicketNumber2: "",
    preloadTicketNumber3: "",
    ixcRoamingSmop: null,
    ixcRoamingSmopIsNA: false,
    gtmVvmSmop: null,
    gtmVvmSmopIsNA: false,
    otherRouting: null,
    otherRoutingIsNA: true,
    publishPep: null,
    publishPepIsNA: false,
    ticketNotificationEmail: null,
    ticketNotificationEmailIsNA: false,
    myloginsRequest: null,
    myloginsRequestIsNA: true,
    lcmComplete: null,
    lcmCompleteIsNA: false,
    preloadComplete: null,
    preloadCompleteIsNA: false,
    notes: null,
  })

  const handleInputChange = (field: keyof Pod, value: any) => {
    setNewPod((prev) => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (field: keyof Pod, value: string | null, isNA: boolean) => {
    const naField = `${field}IsNA` as keyof Pod
    setNewPod((prev) => ({
      ...prev,
      [field]: value,
      [naField]: isNA,
    }))
  }

  const handleBundleApply = (fields: string[], selectedDate: string) => {
    // Apply the selected date to all selected fields
    setNewPod((prev) => {
      const updated = { ...prev };
      fields.forEach(field => {
        (updated as any)[field] = selectedDate;
        (updated as any)[`${field}IsNA`] = false;
      });
      return updated;
    });
  }

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation logic similar to edit-pod-dialog
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Additional validations for Complete status
    if (
      (newPod.lcmAddTicket && !newPod.lcmAddTicketNumber) ||
      (newPod.lcmNetworkDeletes && !newPod.lcmNetworkDeletesTicket) ||
      (newPod.dns && !newPod.dnsTicketAddsDeletes && !newPod.dnsTicketChanges) ||
      (newPod.preloadTicketSubmitted && !newPod.preloadTicketNumber1 && !newPod.preloadTicketNumber2 && !newPod.preloadTicketNumber3) ||
      (newPod.ixcRoamingSmop && !newPod.ixcRoamingSmopTicket) ||
      (newPod.gtmVvmSmop && !newPod.gtmVvmSmopTicket)
    ) { }

    if (newPod.lcmAddTicket && !newPod.lcmAddTicketNumber) {
      newErrors["lcmAddTicket"] = "Please Fill Ticket Number";
    }
    if (newPod.lcmNetworkDeletes && !newPod.lcmNetworkDeletesTicket) {
      newErrors["lcmNetworkDeletes"] = "Please Fill Ticket Number";
    }
    if (newPod.dns && !newPod.dnsTicketAddsDeletes && !newPod.dnsTicketChanges) {
      newErrors["dns"] = "Please Fill At Least One Ticket Number";
    }
    if (newPod.preloadTicketSubmitted && !newPod.preloadTicketNumber1 && !newPod.preloadTicketNumber2 && !newPod.preloadTicketNumber3) {
      newErrors["preloadTicketSubmitted"] = "Please Fill At Least One Ticket Number";
    }
    if (newPod.ixcRoamingSmop && !newPod.ixcRoamingSmopTicket) {
      newErrors["ixcRoamingSmop"] = "Please Fill Ticket Number";
    }
    if (newPod.gtmVvmSmop && !newPod.gtmVvmSmopTicket) {
      newErrors["gtmVvmSmop"] = "Please Fill Ticket Number";
    }
    if (newPod.status === "Complete") {
      // Check all required fields for Complete status
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
      REQUIRED_FIELDS_FOR_COMPLETE.forEach((field) => {
        const fieldKey = field as keyof Pod;
        const isNAField = `${field}IsNA` as keyof Pod;
        // Skip fields that are marked as N/A
        if (newPod[isNAField] === true) {
          return;
        }
        // Check if the field is empty
        if (!newPod[fieldKey] && fieldKey !== "special") {
          newErrors[field] = `${field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
            } is required for Complete status`;
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to get the tab with errors
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
    "dns",
    "lcmAddTicket",
    "preloadTicketSubmitted",
    "ixcRoamingSmop",
    "gtmVvmSmop",
    "otherRouting",
    "publishPep",
    "ticketNotificationEmail",
    "myloginsRequest",
  ];
  const getTabWithErrors = (): string => {
    if (Object.keys(errors).some((key) => BASIC_TAB_FIELDS.includes(key))) {
      return "basic";
    }
    if (Object.keys(errors).some((key) => DETAILS_TAB_FIELDS.includes(key))) {
      return "details";
    }
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

    // Validate required fields
    if (!newPod.pod) {
      toast({
        title: "Missing Required Field",
        description: "POD (Unique Identifier) is a required field",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate POD in database
    setIsChecking(true)
    try {
      const exists = await checkPodExists(newPod.pod)
      if (exists || existingPods.some((pod) => pod.pod === newPod.pod)) {
        toast({
          title: "Duplicate POD",
          description: `A POD with ID "${newPod.pod}" already exists. POD IDs must be unique.`,
          variant: "destructive",
        })
        setIsChecking(false)
        return
      }
    } catch (error) {
      console.error("Error checking POD existence:", error)
    } finally {
      setIsChecking(false)
    }

    // Check if status is Complete, validate all fields are filled
    if (newPod.status === "Complete" && !isCompletable(newPod)) {
      toast({
        title: "Cannot Complete POD",
        description: "All required fields must be filled before a POD can be marked as Complete.",
        variant: "destructive",
      })
      return
    }

    onAdd(newPod)

    // Reset form
    setNewPod({
      pod: "",
      internalPodId: "",
      type: "",
      assignedEngineer: "",
      status: "Initial",
      subStatus: "Assignment",
      org: "ENG",
      priority: 9999, // Default priority for new PODs
      creationTimestamp: new Date().toISOString().split("T")[0],
      creationTimestampIsNA: false,
      slaCalculatedNbd: null,
      slaCalculatedNbdIsNA: false,
      podWorkableDate: null,
      podWorkableDateIsNA: false,
      totalElapsedCycleTime: 0,
      workableCycleTime: 0,
      timeInCurrentStatus: "",
      clli: "",
      city: "",
      state: "",
      routerType: "",
      router1: "",
      router2: "",
      podProgramType: "",
      tenantName: "",
      currentLepVersion: "",
      lepVersionToBeApplied: "",
      podType: "eUPF",
      podTypeOriginal: "",
      special: false,
      lepAssessment: null,
      lepAssessmentIsNA: false,
      dlpTemplateUpdates: null,
      dlpTemplateUpdatesIsNA: false,
      ipAcquisition: null,
      ipAcquisitionIsNA: false,
      ipAllocation: null,
      ipAllocationIsNA: false,
      conversionFileUpdate: null,
      conversionFileUpdateIsNA: false,
      conversionFileValidation: null,
      conversionFileValidationIsNA: false,
      pepGeneration: null,
      pepGenerationIsNA: false,
      connectitTdsCreation: null,
      connectitTdsCreationIsNA: false,
      connectitPreloadCreation: null,
      connectitPreloadCreationIsNA: false,
      checklistCreation: null,
      checklistCreationIsNA: false,
      vmDeleteList: null,
      vmDeleteListIsNA: false,
      vmDeletesComplete: null,
      vmDeletesCompleteIsNA: false,
      lcmNetworkDeletes: null,
      lcmNetworkDeletesIsNA: false,
      macdCreation: null,
      macdCreationIsNA: false,
      atsMacdApproval: null,
      atsMacdApprovalIsNA: false,
      lcmNetworkDeleteCompletion: null,
      lcmNetworkDeleteCompletionIsNA: false,
      dlpUploads: null,
      dlpUploadsIsNA: false,
      cdmLoad: null,
      cdmLoadIsNA: false,
      inServiceVavAudit: null,
      inServiceVavAuditIsNA: false,
      globalCvaasAudit: null,
      globalCvaasAuditIsNA: false,
      dns: null,
      dnsIsNA: false,
      dnsTicketAddsDeletes: "",
      dnsTicketChanges: "",
      lcmAddTicket: null,
      lcmAddTicketIsNA: false,
      preloadTicketSubmitted: null,
      preloadTicketSubmittedIsNA: false,
      preloadTicketNumber1: "",
      preloadTicketNumber2: "",
      preloadTicketNumber3: "",
      ixcRoamingSmop: null,
      ixcRoamingSmopIsNA: false,
      gtmVvmSmop: null,
      gtmVvmSmopIsNA: false,
      otherRouting: null,
      otherRoutingIsNA: true,
      publishPep: null,
      publishPepIsNA: false,
      ticketNotificationEmail: null,
      ticketNotificationEmailIsNA: false,
      myloginsRequest: null,
      myloginsRequestIsNA: true,
      lcmComplete: null,
      lcmCompleteIsNA: false,
      preloadComplete: null,
      preloadCompleteIsNA: false,
      notes: null,
    })
    setActiveTab("basic")
  }

  const autofillFetched = useRef<string | null>(null)
  const [autofillSuggestions, setAutofillSuggestions] = useState<Array<{
    pod: string;
    city: string | null;
    state: string | null;
    clli: string | null;
    podProgramType: string | null;
    tenantName: string | null;
  }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isLoadingAutofillData, setIsLoadingAutofillData] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [lastSelectedPod, setLastSelectedPod] = useState<string | null>(null)

  // Search for autofill suggestions as user types (optimized for speed)
  useEffect(() => {
    if (!newPod.pod || newPod.pod.length < 2) {
      setAutofillSuggestions([])
      setShowSuggestions(false)
      setIsUserTyping(false)
      return
    }

    // Only search if user is actively typing and hasn't selected the same POD from dropdown
    if (!isUserTyping || lastSelectedPod === newPod.pod) {
      return
    }

    const handler = setTimeout(() => {
      (async () => {
        try {
          setIsLoadingSuggestions(true)
          const res = await fetch(`/api/autofill-pods/search?q=${encodeURIComponent(newPod.pod)}`)
          if (!res.ok) return
          const suggestions = await res.json()
          setAutofillSuggestions(suggestions)
          setShowSuggestions(suggestions.length > 0)
        } catch (error) {
          console.error("Error fetching autofill suggestions:", error)
          setAutofillSuggestions([])
          setShowSuggestions(false)
        } finally {
          setIsLoadingSuggestions(false)
        }
      })()
    }, 150) // Reduced debounce time for faster response
    return () => clearTimeout(handler)
  }, [newPod.pod, isUserTyping, lastSelectedPod])

  // Fetch full autofill data when a POD is selected
  const fetchAutofillData = async (podId: string) => {
    // Prevent duplicate fetches for the same POD
    if (autofillFetched.current === podId) return
    
    try {
      setIsLoadingAutofillData(true)
      autofillFetched.current = podId
      setLastSelectedPod(podId) // Track that this POD was selected from dropdown
      setIsUserTyping(false) // User is not typing anymore
      
      const res = await fetch(`/api/autofill-pods/${encodeURIComponent(podId)}`)
      if (!res.ok) return
      const autofill: AutofillPod = await res.json()
      setNewPod((prev) => {
        let updated = { ...prev }
        const fields: (keyof AutofillPod)[] = [
          "internalPodId",
          "type",
          "assignedEngineer",
          "status",
          "subStatus",
          "org",
          "priority",
          "totalElapsedCycleTime",
          "workableCycleTime",
          "timeInCurrentStatus",
          "city",
          "state",
          "clli",
          "router1",
          "router2",
          "routerType",
          "podProgramType",
          "tenantName",
          "currentLepVersion",
          "lepVersionToBeApplied",
          "podType",
          "podTypeOriginal",
          "special",
        ]
        let changed = false
        for (const field of fields) {
          const podField = field as keyof Pod
          if ((autofill as any)[field] !== null && (autofill as any)[field] !== undefined) {
            ;(updated as any)[podField] = (autofill as any)[field]
            changed = true
          }
        }
        return changed ? updated : prev
      })
      setShowSuggestions(false)
      setAutofillSuggestions([]) // Clear suggestions after selection
    } catch (error) {
      console.error("Error fetching autofill data:", error)
      autofillFetched.current = null // Reset on error
      setLastSelectedPod(null) // Reset on error
    } finally {
      setIsLoadingAutofillData(false)
    }
  }

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
      // Reset autofill states when dialog opens
      setAutofillSuggestions([]);
      setShowSuggestions(false);
      setIsUserTyping(false);
      setLastSelectedPod(null);
      autofillFetched.current = null;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New POD</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="details">POD Details</TabsTrigger>
            <TabsTrigger value="dates">Date Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pod">POD (Unique Identifier) *</Label>
                <div className="relative">
                  <Input
                    id="pod"
                    value={newPod.pod}
                    onChange={(e) => {
                      handleInputChange("pod", e.target.value)
                      setIsUserTyping(true) // Mark that user is actively typing
                      setLastSelectedPod(null) // Reset selected POD when user types
                      setShowSuggestions(true)
                    }}
                    onFocus={() => {
                      // Only show suggestions if user has typed something and not selected from dropdown
                      if (isUserTyping && lastSelectedPod !== newPod.pod) {
                        setShowSuggestions(autofillSuggestions.length > 0)
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowSuggestions(false), 200)
                    }}
                    required
                    placeholder="Type to search for available PODs..."
                  />
                  {(isLoadingSuggestions || isLoadingAutofillData) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  {showSuggestions && autofillSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {autofillSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            handleInputChange("pod", suggestion.pod)
                            fetchAutofillData(suggestion.pod)
                            setShowSuggestions(false)
                            setAutofillSuggestions([]) // Clear suggestions immediately
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{suggestion.pod}</div>
                            <div className="text-xs text-gray-500">
                              {suggestion.city && suggestion.state ? `${suggestion.city}, ${suggestion.state}` : 
                               suggestion.clli ? suggestion.clli : 
                               suggestion.podProgramType ? suggestion.podProgramType : 
                               suggestion.tenantName ? suggestion.tenantName : ''}
                            </div>
                          </div>
                          {suggestion.podProgramType && (
                            <div className="text-xs text-gray-400 mt-1">
                              {suggestion.podProgramType}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {isLoadingAutofillData && (
                  <p className="text-xs text-blue-600">
                    🔄 Loading autofill data...
                  </p>
                )}
                {!isLoadingAutofillData && autofillSuggestions.length > 0 && showSuggestions && (
                  <p className="text-xs text-blue-600">
                    💡 {autofillSuggestions.length} POD{autofillSuggestions.length > 1 ? 's' : ''} with autofill data available
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalPodId">Internal POD ID</Label>
                <Input
                  id="internalPodId"
                  value={newPod.internalPodId}
                  onChange={(e) => handleInputChange("internalPodId", e.target.value)}
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  value={newPod.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  required
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="podTypeOriginal">Pod Type</Label>
                <Select
                  value={newPod.podTypeOriginal || ''}
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
              <div className="space-y-2">
                <Label htmlFor="podProgramType">POD Program Type</Label>
                <Select
                  value={newPod.podProgramType || ''}
                  onValueChange={(value) => handleInputChange('podProgramType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select POD Program Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POD_PROGRAM_TYPE_OPTIONS.map((option: string) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              <div className="space-y-2">
                <Label htmlFor="assignedEngineer">Assigned Engineer</Label>
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
                      {newPod?.assignedEngineer
                        ? newPod?.assignedEngineer
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
                                  newPod.assignedEngineer === user.email
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newPod.status} onValueChange={(value) => handleInputChange("status", value as Status)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial">Initial</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Data Management">Data Management</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Revision">Revision</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Reject">Reject</SelectItem>
                    <SelectItem value="Decom">Decom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subStatus">Sub Status</Label>
                <Select
                  value={newPod.subStatus}
                  onValueChange={(value) => handleInputChange("subStatus", value as SubStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                    <SelectItem value="Conversion File">Conversion File</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Normalization Required">Normalization Required</SelectItem>
                    <SelectItem value="PEP Generation">PEP Generation</SelectItem>
                    <SelectItem value="TDS Generation">TDS Generation</SelectItem>
                    <SelectItem value="Preload Generation">Preload Generation</SelectItem>
                    <SelectItem value="Services Connectivity">Services Connectivity</SelectItem>
                    <SelectItem value="NPB">NPB</SelectItem>
                    <SelectItem value="VM Deletes">VM Deletes</SelectItem>
                    <SelectItem value="Network Deletes">Network Deletes</SelectItem>
                    <SelectItem value="MACD Approval">MACD Approval</SelectItem>
                    <SelectItem value="DLP">DLP</SelectItem>
                    <SelectItem value="CDM">CDM</SelectItem>
                    <SelectItem value="CVaaS">CVaaS</SelectItem>
                    <SelectItem value="DNS Deletes">DNS Deletes</SelectItem>
                    <SelectItem value="DNS Adds">DNS Adds</SelectItem>
                    <SelectItem value="Network Adds/MACD">Network Adds/MACD</SelectItem>
                    <SelectItem value="Preload Deletes">Preload Deletes</SelectItem>
                    <SelectItem value="Preload Adds">Preload Adds</SelectItem>
                    <SelectItem value="LEP Update">LEP Update</SelectItem>
                    <SelectItem value="PEP Update">PEP Update</SelectItem>
                    <SelectItem value="ORT Not Complete">ORT Not Complete</SelectItem>
                    <SelectItem value="Tenant Definition">Tenant Definition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org">Org</Label>
                <Select value={newPod.org} onValueChange={(value) => handleInputChange("org", value as Org)}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label>Creation Timestamp</Label>
                <DateField
                  value={newPod.creationTimestamp}
                  isNA={newPod.creationTimestampIsNA}
                  onChange={(value, isNA) => handleDateChange("creationTimestamp", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectManagers">Project Managers</Label>
                <Input
                  id="projectManagers"
                  value={newPod.projectManagers || ''}
                  onChange={(e) => handleInputChange('projectManagers', e.target.value)}
                  placeholder="Enter project manager names"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4 h-[65vh] overflow-y-scroll">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SLA Calculated NBD</Label>
                <DateField
                  value={newPod.slaCalculatedNbd}
                  isNA={newPod.slaCalculatedNbdIsNA}
                  onChange={(value, isNA) => handleDateChange("slaCalculatedNbd", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>POD Workable Date</Label>
                <DateField
                  value={newPod.podWorkableDate}
                  isNA={newPod.podWorkableDateIsNA}
                  onChange={(value, isNA) => handleDateChange("podWorkableDate", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalElapsedCycleTime">Total Elapsed Cycle Time</Label>
                <Input
                  id="totalElapsedCycleTime"
                  type="number"
                  value={newPod.totalElapsedCycleTime.toString()}
                  onChange={(e) => handleInputChange("totalElapsedCycleTime", Number.parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workableCycleTime">Workable Cycle Time</Label>
                <Input
                  id="workableCycleTime"
                  type="number"
                  value={newPod.workableCycleTime.toString()}
                  onChange={(e) => handleInputChange("workableCycleTime", Number.parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeInCurrentStatus">Time In Current Status</Label>
                <Input
                  id="timeInCurrentStatus"
                  value={newPod.timeInCurrentStatus}
                  disabled
                  onChange={(e) => handleInputChange("timeInCurrentStatus", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clli">CLLI</Label>
                <Input id="clli" value={newPod.clli} onChange={(e) => handleInputChange("clli", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={newPod.city} onChange={(e) => handleInputChange("city", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={newPod.state} onChange={(e) => handleInputChange("state", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routerType">Router Type</Label>
                <Input
                  id="routerType"
                  value={newPod.routerType}
                  onChange={(e) => handleInputChange("routerType", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="router1">Router 1</Label>
                <Input
                  id="router1"
                  value={newPod.router1}
                  onChange={(e) => handleInputChange("router1", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="router2">Router 2</Label>
                <Input
                  id="router2"
                  value={newPod.router2}
                  onChange={(e) => handleInputChange("router2", e.target.value)}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="tenantName">Tenant Name</Label>
                <Input
                  id="tenantName"
                  value={newPod.tenantName}
                  onChange={(e) => handleInputChange("tenantName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLepVersion">Current LEP Version</Label>
                <Input
                  id="currentLepVersion"
                  value={newPod.currentLepVersion}
                  onChange={(e) => handleInputChange("currentLepVersion", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lepVersionToBeApplied">LEP Version To Be Applied</Label>
                <Input
                  id="lepVersionToBeApplied"
                  value={newPod.lepVersionToBeApplied}
                  onChange={(e) => handleInputChange("lepVersionToBeApplied", e.target.value)}
                />
              </div>



              <div className="space-y-2">
                <Label htmlFor="podType">Tenant Requirements</Label>
                <Select
                  value={newPod.podType || ''}
                  onValueChange={(value) => handleInputChange('podType', value as PodType)}
                >
                  <SelectTrigger>
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
                          checked={!!newPod.special}
                          onChange={() => handleInputChange('special', !newPod.special)}
                        />
                        <span>Special</span>
                      </label>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={newPod.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter any additional notes or comments about this POD..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkToActiveTds">Link to Active TDS</Label>
                <Input
                  id="linkToActiveTds"
                  value={newPod.linkToActiveTds || ''}
                  onChange={(e) => handleInputChange('linkToActiveTds', e.target.value)}
                  placeholder="Enter TDS link"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkToActivePreloads">Link to Active Preloads</Label>
                <Input
                  id="linkToActivePreloads"
                  value={newPod.linkToActivePreloads || ''}
                  onChange={(e) => handleInputChange('linkToActivePreloads', e.target.value)}
                  placeholder="Enter preloads link"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4 pt-4 h-[65vh] overflow-y-scroll">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LEP Assessment (FFA only)</Label>
                <DateField
                  value={newPod.lepAssessment}
                  isNA={newPod.lepAssessmentIsNA}
                  onChange={(value, isNA) => handleDateChange("lepAssessment", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>DLP Template Updates</Label>
                <DateField
                  value={newPod.dlpTemplateUpdates}
                  isNA={newPod.dlpTemplateUpdatesIsNA}
                  onChange={(value, isNA) => handleDateChange("dlpTemplateUpdates", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>IP Acquisition</Label>
                <DateField
                  value={newPod.ipAcquisition}
                  isNA={newPod.ipAcquisitionIsNA}
                  onChange={(value, isNA) => handleDateChange("ipAcquisition", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>IP Allocation</Label>
                <DateField
                  value={newPod.ipAllocation}
                  isNA={newPod.ipAllocationIsNA}
                  onChange={(value, isNA) => handleDateChange("ipAllocation", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>Conversion File Update</Label>
                <DateField
                  value={newPod.conversionFileUpdate}
                  isNA={newPod.conversionFileUpdateIsNA}
                  onChange={(value, isNA) => handleDateChange("conversionFileUpdate", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>Conversion File Validation</Label>
                <DateField
                  value={newPod.conversionFileValidation}
                  isNA={newPod.conversionFileValidationIsNA}
                  onChange={(value, isNA) => handleDateChange("conversionFileValidation", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>PEP Generation</Label>
                <DateFieldWithBundle
                  value={newPod.pepGeneration}
                  isNA={newPod.pepGenerationIsNA}
                  onChange={(value, isNA) => handleDateChange("pepGeneration", value, isNA)}
                  name="pepGeneration"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>
              <div className="space-y-2">
                <Label>Checklist Creation</Label>
                <DateFieldWithBundle
                  value={newPod.checklistCreation}
                  isNA={newPod.checklistCreationIsNA}
                  onChange={(value, isNA) => handleDateChange("checklistCreation", value, isNA)}
                  name="checklistCreation"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>
              <div className="space-y-2">
                <Label>ConnectIT TDS Creation</Label>
                <DateFieldWithBundle
                  value={newPod.connectitTdsCreation}
                  isNA={newPod.connectitTdsCreationIsNA}
                  onChange={(value, isNA) => handleDateChange("connectitTdsCreation", value, isNA)}
                  name="connectitTdsCreation"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>

              <div className="space-y-2">
                <Label>ConnectIT Preload Creation</Label>
                <DateFieldWithBundle
                  value={newPod.connectitPreloadCreation}
                  isNA={newPod.connectitPreloadCreationIsNA}
                  onChange={(value, isNA) => handleDateChange("connectitPreloadCreation", value, isNA)}
                  name="connectitPreloadCreation"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>


              <div className="space-y-2">
                <Label>VM Delete List</Label>
                <DateField
                  value={newPod.vmDeleteList}
                  isNA={newPod.vmDeleteListIsNA}
                  onChange={(value, isNA) => handleDateChange("vmDeleteList", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>VM Deletes Complete</Label>
                <DateField
                  value={newPod.vmDeletesComplete}
                  isNA={newPod.vmDeletesCompleteIsNA}
                  onChange={(value, isNA) => handleDateChange("vmDeletesComplete", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>LCM Network Deletes</Label>
                <DateField
                  value={newPod.lcmNetworkDeletes}
                  isNA={newPod.lcmNetworkDeletesIsNA}
                  onChange={(value, isNA) => handleDateChange("lcmNetworkDeletes", value, isNA)}
                />
              </div>
              <div className="space-y-2">
                <Label>DLP Uploads</Label>
                <DateFieldWithBundle
                  value={newPod.dlpUploads}
                  isNA={newPod.dlpUploadsIsNA}
                  onChange={(value, isNA) => handleDateChange("dlpUploads", value, isNA)}
                  name="dlpUploads"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>






              <div className="space-y-2">
                <Label>CDM Load</Label>
                <DateFieldWithBundle
                  value={newPod.cdmLoad}
                  isNA={newPod.cdmLoadIsNA}
                  onChange={(value, isNA) => handleDateChange("cdmLoad", value, isNA)}
                  name="cdmLoad"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>

              <div className="space-y-2">
                <Label>In-Service VAV Audit</Label>
                <DateFieldWithBundle
                  value={newPod.inServiceVavAudit}
                  isNA={newPod.inServiceVavAuditIsNA}
                  onChange={(value, isNA) => handleDateChange("inServiceVavAudit", value, isNA)}
                  name="inServiceVavAudit"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>

              <div className="space-y-2">
                <Label>Global CVaaS Audit</Label>
                <DateFieldWithBundle
                  value={newPod.globalCvaasAudit}
                  isNA={newPod.globalCvaasAuditIsNA}
                  onChange={(value, isNA) => handleDateChange("globalCvaasAudit", value, isNA)}
                  name="globalCvaasAudit"
                  pod={newPod}
                  onBundleApply={(fields, selectedDate) => handleBundleApply(fields, selectedDate)}
                />
              </div>

              <DnsSection
                date={newPod.dns}
                isNA={newPod.dnsIsNA || false}
                ticketAddsDeletes={newPod.dnsTicketAddsDeletes || ""}
                ticketChanges={newPod.dnsTicketChanges || ""}
                onDateChange={(value, isNA) => handleDateChange("dns", value, isNA)}
                onTicketAddsDeletesChange={(value) => handleInputChange("dnsTicketAddsDeletes", value)}
                onTicketChangesChange={(value) => handleInputChange("dnsTicketChanges", value)}
              />
              <div className="space-y-2">
                <Label>MACD Creation</Label>
                <DateField
                  value={newPod.macdCreation}
                  isNA={newPod.macdCreationIsNA}
                  onChange={(value, isNA) => handleDateChange("macdCreation", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>ATS MACD Approval</Label>
                <DateField
                  value={newPod.atsMacdApproval}
                  isNA={newPod.atsMacdApprovalIsNA}
                  onChange={(value, isNA) => handleDateChange("atsMacdApproval", value, isNA)}
                />
              </div>
              <div className="space-y-2">
                <Label>LCM Add Ticket</Label>
                <DateField
                  value={newPod.lcmAddTicket}
                  isNA={newPod.lcmAddTicketIsNA}
                  onChange={(value, isNA) => handleDateChange("lcmAddTicket", value, isNA)}
                />
              </div>

              <PreloadTicketSection
                date={newPod.preloadTicketSubmitted}
                isNA={newPod.preloadTicketSubmittedIsNA || false}
                ticket1={newPod.preloadTicketNumber1 || ""}
                ticket2={newPod.preloadTicketNumber2 || ""}
                ticket3={newPod.preloadTicketNumber3 || ""}
                onDateChange={(value, isNA) => handleDateChange("preloadTicketSubmitted", value, isNA)}
                onTicket1Change={(value) => handleInputChange("preloadTicketNumber1", value)}
                onTicket2Change={(value) => handleInputChange("preloadTicketNumber2", value)}
                onTicket3Change={(value) => handleInputChange("preloadTicketNumber3", value)}
              />

              <div className="space-y-2">
                <Label>IXC Roaming SMOP</Label>
                <DateField
                  value={newPod.ixcRoamingSmop}
                  isNA={newPod.ixcRoamingSmopIsNA}
                  onChange={(value, isNA) => handleDateChange("ixcRoamingSmop", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>GTM/VVM SMOP</Label>
                <DateField
                  value={newPod.gtmVvmSmop}
                  isNA={newPod.gtmVvmSmopIsNA}
                  onChange={(value, isNA) => handleDateChange("gtmVvmSmop", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>Other Routing</Label>
                <DateField
                  value={newPod.otherRouting}
                  isNA={newPod.otherRoutingIsNA}
                  onChange={(value, isNA) => handleDateChange("otherRouting", value, isNA)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mylogins Request</Label>
                <DateField
                  value={newPod.myloginsRequest}
                  isNA={newPod.myloginsRequestIsNA}
                  onChange={(value, isNA) => handleDateChange("myloginsRequest", value, isNA)}
                />
              </div>
              <div className="space-y-2">
                <Label>Publish PEP</Label>
                <DateField
                  value={newPod.publishPep}
                  isNA={newPod.publishPepIsNA}
                  onChange={(value, isNA) => handleDateChange("publishPep", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ticket Notification Email</Label>
                <DateField
                  value={newPod.ticketNotificationEmail}
                  isNA={newPod.ticketNotificationEmailIsNA}
                  onChange={(value, isNA) => handleDateChange("ticketNotificationEmail", value, isNA)}
                />
              </div>



              <div className="space-y-2">
                <Label>LCM Network Delete Completion</Label>
                <DateField
                  value={newPod.lcmNetworkDeleteCompletion}
                  isNA={newPod.lcmNetworkDeleteCompletionIsNA}
                  onChange={(value, isNA) => handleDateChange("lcmNetworkDeleteCompletion", value, isNA)}
                />
              </div>
              <div className="space-y-2">
                <Label>LCM Complete</Label>
                <DateField
                  value={newPod.lcmComplete}
                  isNA={newPod.lcmCompleteIsNA}
                  onChange={(value, isNA) => handleDateChange("lcmComplete", value, isNA)}
                />
              </div>

              <div className="space-y-2">
                <Label>Preload Complete</Label>
                <DateField
                  value={newPod.preloadComplete}
                  isNA={newPod.preloadCompleteIsNA}
                  onChange={(value, isNA) => handleDateChange("preloadComplete", value, isNA)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isChecking}>
            {isChecking ? "Checking..." : "Add POD"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
