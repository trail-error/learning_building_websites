"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Pod } from "@/lib/types"
import { getStatusColor, formatDateInCentralTime } from "@/lib/utils"

interface PodDetailsDialogProps {
  pod: Pod | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PodDetailsDialog({ pod, open, onOpenChange }: PodDetailsDialogProps) {
  if (!pod) return null

  const formatDate = (date: string | null, isNA?: boolean) => {
    if (isNA) return "N/A"
    return formatDateInCentralTime(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>POD Details: {pod.pod}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="details">POD Details</TabsTrigger>
            <TabsTrigger value="dates">Date Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">POD</h3>
                <p>{pod.pod}</p>
              </div>

              <div>
                <h3 className="font-medium">Internal POD ID</h3>
                <p>{pod.internalPodId}</p>
              </div>

              <div>
                <h3 className="font-medium">Priority</h3>
                <p>{pod.priority === 9999 ? "-" : pod.priority}</p>
              </div>

              <div>
                <h3 className="font-medium">POD Type</h3>
                <p>{pod.podTypeOriginal || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">POD Program Type</h3>
                <p>{pod.podProgramType || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Assigned Engineer</h3>
                <p>{pod.assignedEngineer || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Status</h3>
                <Badge className={getStatusColor(pod.status)}>{pod.status}</Badge>
              </div>

              <div>
                <h3 className="font-medium">Sub Status</h3>
                <p>{pod.subStatus || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Org</h3>
                <p>{pod.org || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Creation Timestamp</h3>
                <p>{formatDate(pod.creationTimestamp, pod.creationTimestampIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">POD Workable Date</h3>
                <p>{formatDate(pod.podWorkableDate, pod.podWorkableDateIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Total Elapsed Cycle Time</h3>
                <p>{pod.totalElapsedCycleTime || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Workable Cycle Time</h3>
                <p>{pod.workableCycleTime || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">CLLI</h3>
                <p>{pod.clli || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">City</h3>
                <p>{pod.city || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">State</h3>
                <p>{pod.state || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Router Type</h3>
                <p>{pod.routerType || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Router 1</h3>
                <p>{pod.router1 || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Router 2</h3>
                <p>{pod.router2 || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Tenant Name</h3>
                <p>{pod.tenantName || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Current LEP Version</h3>
                <p>{pod.currentLepVersion || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">LEP Version To Be Applied</h3>
                <p>{pod.lepVersionToBeApplied || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Tenant Requirements</h3>
                <p>{pod.podType || "Not Set"}</p>
              </div>

              <div>
                <h3 className="font-medium">Special</h3>
                <p>{pod.special ? "Yes" : "No"}</p>
              </div>

              <div>
                <h3 className="font-medium">Special</h3>
                <p>{pod.special ? "Yes" : "No"}</p>
              </div>

              <div className="col-span-2">
                <h3 className="font-medium">Notes</h3>
                <p className="whitespace-pre-wrap">{pod.notes || "Not Set"}</p>
              </div>

              <div className="col-span-2">
                <h3 className="font-medium">Project Managers</h3>
                <p>{pod.projectManagers || "Not Set"}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">SLA Calculated NBD</h3>
                <p>{formatDate(pod.slaCalculatedNbd, pod.slaCalculatedNbdIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">POD Workable Date</h3>
                <p>{formatDate(pod.podWorkableDate, pod.podWorkableDateIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Total Elapsed Cycle Time</h3>
                <p>{pod.totalElapsedCycleTime}</p>
              </div>

              <div>
                <h3 className="font-medium">Workable Cycle Time</h3>
                <p>{pod.workableCycleTime}</p>
              </div>

              <div>
                <h3 className="font-medium">Time In Current Status</h3>
                <p>{pod.timeInCurrentStatus || "N/A"}</p>
              </div>

              <div>
                <h3 className="font-medium">CLLI</h3>
                <p>{pod.clli}</p>
              </div>

              <div>
                <h3 className="font-medium">City</h3>
                <p>{pod.city}</p>
              </div>

              <div>
                <h3 className="font-medium">State</h3>
                <p>{pod.state}</p>
              </div>

              <div>
                <h3 className="font-medium">Router Type</h3>
                <p>{pod.routerType}</p>
              </div>

              <div>
                <h3 className="font-medium">Router 1</h3>
                <p>{pod.router1}</p>
              </div>

              <div>
                <h3 className="font-medium">Router 2</h3>
                <p>{pod.router2}</p>
              </div>


              <div>
                <h3 className="font-medium">Tenant Name</h3>
                <p>{pod.tenantName}</p>
              </div>

              <div>
                <h3 className="font-medium">Current LEP Version</h3>
                <p>{pod.currentLepVersion}</p>
              </div>

              <div>
                <h3 className="font-medium">LEP Version To Be Applied</h3>
                <p>{pod.lepVersionToBeApplied}</p>
              </div>



              <div>
                <h3 className="font-medium">Special?</h3>
                <p>{pod.special ? "Yes" : "No"}</p>
              </div>

              <div>
                <h3 className="font-medium">Notes</h3>
                <p>{pod.notes}</p>
              </div>

              <div>
                <h3 className="font-medium">Link to Active TDS</h3>
                <p>{pod.linkToActiveTds || 'Not Set'}</p>
              </div>

              <div>
                <h3 className="font-medium">Link to Active Preloads</h3>
                <p>{pod.linkToActivePreloads || 'Not Set'}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">LEP Assessment (FFA only)</h3>
                <p>{formatDate(pod.lepAssessment, pod.lepAssessmentIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">DLP Template Updates</h3>
                <p>{formatDate(pod.dlpTemplateUpdates, pod.dlpTemplateUpdatesIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">IP Acquisition</h3>
                <p>{formatDate(pod.ipAcquisition, pod.ipAcquisitionIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">IP Allocation</h3>
                <p>{formatDate(pod.ipAllocation, pod.ipAllocationIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Conversion File Update</h3>
                <p>{formatDate(pod.conversionFileUpdate, pod.conversionFileUpdateIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Conversion File Validation</h3>
                <p>{formatDate(pod.conversionFileValidation, pod.conversionFileValidationIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">PEP Generation</h3>
                <p>{formatDate(pod.pepGeneration, pod.pepGenerationIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">ConnectIT TDS Creation</h3>
                <p>{formatDate(pod.connectitTdsCreation, pod.connectitTdsCreationIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">ConnectIT Preload Creation</h3>
                <p>{formatDate(pod.connectitPreloadCreation, pod.connectitPreloadCreationIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Checklist Creation</h3>
                <p>{formatDate(pod.checklistCreation, pod.checklistCreationIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">VM Delete List</h3>
                <p>{formatDate(pod.vmDeleteList, pod.vmDeleteListIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">VM Deletes Complete</h3>
                <p>{formatDate(pod.vmDeletesComplete, pod.vmDeletesCompleteIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">LCM Network Deletes</h3>
                <p>{formatDate(pod.lcmNetworkDeletes, pod.lcmNetworkDeletesIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">MACD Creation</h3>
                <p>{formatDate(pod.macdCreation, pod.macdCreationIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">ATS MACD Approval</h3>
                <p>{formatDate(pod.atsMacdApproval, pod.atsMacdApprovalIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">LCM Network Delete Completion</h3>
                <p>{formatDate(pod.lcmNetworkDeleteCompletion, pod.lcmNetworkDeleteCompletionIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">DLP Uploads</h3>
                <p>{formatDate(pod.dlpUploads, pod.dlpUploadsIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">CDM Load</h3>
                <p>{formatDate(pod.cdmLoad, pod.cdmLoadIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">In-Service VAV Audit</h3>
                <p>{formatDate(pod.inServiceVavAudit, pod.inServiceVavAuditIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Global CVaaS Audit</h3>
                <p>{formatDate(pod.globalCvaasAudit, pod.globalCvaasAuditIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">DNS Deletes</h3>
                <p>{formatDate(pod.dns, pod.dnsIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">DNS Adds</h3>
                <p>{formatDate(pod.dns, pod.dnsIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">LCM Add Ticket</h3>
                <p>{formatDate(pod.lcmAddTicket, pod.lcmAddTicketIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Preload Ticket Submitted</h3>
                <p>{formatDate(pod.preloadTicketSubmitted, pod.preloadTicketSubmittedIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">IXC Roaming SMOP</h3>
                <p>{formatDate(pod.ixcRoamingSmop, pod.ixcRoamingSmopIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">GTM/VVM SMOP</h3>
                <p>{formatDate(pod.gtmVvmSmop, pod.gtmVvmSmopIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Other Routing</h3>
                <p>{formatDate(pod.otherRouting, pod.otherRoutingIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Publish PEP</h3>
                <p>{formatDate(pod.publishPep, pod.publishPepIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Ticket Notification Email</h3>
                <p>{formatDate(pod.ticketNotificationEmail, pod.ticketNotificationEmailIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Mylogins Request</h3>
                <p>{formatDate(pod.myloginsRequest, pod.myloginsRequestIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">LCM Complete</h3>
                <p>{formatDate(pod.lcmComplete, pod.lcmCompleteIsNA)}</p>
              </div>

              <div>
                <h3 className="font-medium">Preload Complete</h3>
                <p>{formatDate(pod.preloadComplete, pod.preloadCompleteIsNA)}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
