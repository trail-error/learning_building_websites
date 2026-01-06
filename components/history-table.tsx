"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PodDetailsDialog } from "@/components/pod-details-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import type { Pod } from "@/lib/types"
import { getStatusColor, getRowColor, formatDateInCentralTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { moveToActive } from "@/lib/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"

import crypto from "crypto"

interface HistoryTableProps {
  pods: Pod[]
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  refreshData: () => void
  userId?: string
}

export function HistoryTable({
  pods,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  refreshData,
  userId,
}: HistoryTableProps) {
  const { toast } = useToast()
  const { user,hasPermission } = useAuth()
  const [viewingPod, setViewingPod] = useState<Pod | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isMoving, setIsMoving] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [podToMove, setPodToMove] = useState<string | null>(null)
  const [podToDuplicate, setPodToDuplicate] = useState<Pod | null>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleViewDetails = (pod: Pod) => {
    setViewingPod(pod)
    setIsDetailsDialogOpen(true)
  }

  const handleMoveToActiveClick = (podId: string) => {
    setPodToMove(podId)
    setConfirmDialogOpen(true)
  }

  const handleConfirmMove = async () => {
    if (!podToMove || !userId) return

    setIsMoving(podToMove)
    try {
      const result = await moveToActive(podToMove, userId)

      if (result.success) {
        toast({
          title: "POD Moved",
          description: `POD ${podToMove} has been moved back to active PODs.`,
        })

        refreshData()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to move POD",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error moving pod to active:", error)
      toast({
        title: "Error",
        description: "Failed to move POD to active",
        variant: "destructive",
      })
    } finally {
      setIsMoving(null)
      setConfirmDialogOpen(false)
      setPodToMove(null)
    }
  }

  const handleDuplicateClick = (pod: Pod) => {
    setPodToDuplicate(pod)
  }

  const handleDuplicateConfirm = async () => {
    if (!podToDuplicate || !user) return

    setIsDuplicating(true)
    try {
      // Create new pod with only the specified columns from history
      const newPod:Pod = {
        pod: podToDuplicate.pod,
        internalPodId: podToDuplicate.internalPodId || "",
        podTypeOriginal: podToDuplicate.podTypeOriginal || "",
        podProgramType: podToDuplicate.podProgramType || "",
        clli: podToDuplicate.clli || "",
        city: podToDuplicate.city || "",
        state: podToDuplicate.state || "",
        routerType: podToDuplicate.routerType || "",
        router1: podToDuplicate.router1 || "",
        router2: podToDuplicate.router2 || "",
        tenantName: podToDuplicate.tenantName || "",
        // Map "LEP Version To Be Applied" from history to "Current LEP Version" in main
        currentLepVersion: podToDuplicate.lepVersionToBeApplied || "",
        // Initialize other required fields with defaults
        type: "",
        assignedEngineer: "",
        status: "Initial",
        subStatus: "Assignment",
        org: "ENG",
        priority: 9999,
        creationTimestamp: new Date().toISOString().split("T")[0],
        creationTimestampIsNA: false,
        slaCalculatedNbd: null,
        slaCalculatedNbdIsNA: false,
        podWorkableDate: null,
        podWorkableDateIsNA: false,
        totalElapsedCycleTime: 0,
        workableCycleTime: 0,
        timeInCurrentStatus: "",
        lepVersionToBeApplied: "",
        podType: "eUPF",
        special: false,
        projectManagers: "",
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
      }

      const response = await fetch("/api/pods/duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPod),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "POD Duplicated",
          description: `POD ${newPod.pod} has been duplicated successfully.`,
        })
        refreshData()
      } else {
        toast({
          title: "Error",
          description: result.error || result.message || "Failed to duplicate POD",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error duplicating pod:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate POD",
        variant: "destructive",
      })
    } finally {
      setIsDuplicating(false)
      setPodToDuplicate(null)
    }
  }



  const pageSizeOptions = [10, 25, 50, 100]
  const canMovePod = hasPermission("move_pod")
  const canDuplicatePod = hasPermission("duplicate_pod")
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            items
          </div>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number.parseInt(value))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm">per page</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[150px]">Actions</TableHead>
                <TableHead>POD</TableHead>
                <TableHead>Internal POD ID</TableHead>
                <TableHead>POD Type</TableHead>
                <TableHead>Assigned Engineer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>LCM Complete Date</TableHead>
                <TableHead>Creation Date</TableHead>
                <TableHead>Total Cycle Time</TableHead>
                <TableHead>Tenant Name</TableHead>
                <TableHead>LEP Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    No completed PODs found.
                  </TableCell>
                </TableRow>
              ) : (
                pods.map((pod) => (
                  <TableRow key={pod.id} className={getRowColor(pod.status)}>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(pod)}>
                          View Details
                        </Button>
                        {canMovePod && <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMoveToActiveClick(pod.pod)}
                          disabled={isMoving === pod.pod}
                        >
                          {isMoving === pod.pod ? "Moving..." : "Move to Active"}
                        </Button>}
                        {canDuplicatePod && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateClick(pod)}
                            disabled={isDuplicating}
                          >
                            {isDuplicating && podToDuplicate?.id === pod.id ? "Duplicating..." : "Duplicate"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pod.pod}</TableCell>
                    <TableCell>{pod.internalPodId}</TableCell>
                    <TableCell>{pod.podTypeOriginal || "Not Set"}</TableCell>
                    <TableCell>{pod.assignedEngineer}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pod.status)}>{pod.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {pod.lcmCompleteIsNA
                        ? "N/A"
                        : pod.lcmComplete
                          ? formatDateInCentralTime(pod.lcmComplete)
                          : "Not Set"}
                    </TableCell>
                    <TableCell>
                      {pod.creationTimestampIsNA
                        ? "N/A"
                        : pod.creationTimestamp
                          ? formatDateInCentralTime(pod.creationTimestamp)
                          : "Not Set"}
                    </TableCell>
                    <TableCell>{pod.totalElapsedCycleTime}</TableCell>
                    <TableCell>{pod.tenantName}</TableCell>
                    <TableCell>{pod.lepVersionToBeApplied}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PodDetailsDialog pod={viewingPod} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmMove}
        title="Move to Active PODs"
        description={`Are you sure you want to move POD ${podToMove} back to the active PODs list?`}
        confirmText="Move to Active"
        isLoading={isMoving !== null}
      />

      <AlertDialog open={!!podToDuplicate} onOpenChange={() => setPodToDuplicate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate POD</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to duplicate POD {podToDuplicate?.pod}? This will create a new POD with the same basic information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateConfirm} disabled={isDuplicating}>
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
