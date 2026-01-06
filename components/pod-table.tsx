"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { EditPodDialog } from "@/components/edit-pod-dialog"
import { PodDetailsDialog } from "@/components/pod-details-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import type { Pod } from "@/lib/types"
import { getStatusColor, getRowColor, isCompletable, getMissingFields, formatDateInCentralTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { updatePodPriority, deletePod, togglePodVisibility } from "@/lib/actions"
import { Edit, CheckCircle, Trash2, Mail, Users } from "lucide-react"

interface PodTableProps {
  pods: Pod[]
  onComplete: (podId: string) => void
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  refreshData: () => void
}

export function PodTable({
  pods,
  onComplete,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  refreshData,
}: PodTableProps) {
  const { toast } = useToast()
  const { user, hasPermission } = useAuth()
  const [editingPod, setEditingPod] = useState<Pod | null>(null)
  const [viewingPod, setViewingPod] = useState<Pod | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [editingPriority, setEditingPriority] = useState<{ id: string; value: number } | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [podToDelete, setPodToDelete] = useState<string | null>(null)
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingVisibility, setIsTogglingVisibility] = useState<string | null>(null)

  const handleEdit = (pod: Pod) => {
    setEditingPod(pod)
    setIsEditDialogOpen(true)
  }

  const handleViewDetails = (pod: Pod) => {
    setViewingPod(pod)
    setIsDetailsDialogOpen(true)
  }

  const handleComplete = (pod: Pod) => {
    // Check if status is "Complete" first
    if (pod.status !== "Complete") {
      toast({
        title: "Status Not Complete",
        description: "Please change the status to 'Complete' before moving to history.",
        variant: "destructive",
      })
      return
    }

    // Then check if all required fields are filled
    if (isCompletable(pod)) {
      onComplete(pod.pod)
    } else {
      const missingFields = getMissingFields(pod)
      const fieldsList = missingFields.length > 0 
        ? missingFields.slice(0, 10).join(", ") + (missingFields.length > 10 ? ` and ${missingFields.length - 10} more...` : "")
        : "required fields"
      
      toast({
        title: "Cannot Complete POD",
        description: `Missing fields: ${fieldsList}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (podId: string) => {
    setPodToDelete(podId)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!podToDelete || !user) return

    setIsDeleting(true)
    try {
      const result = await deletePod(podToDelete, user.id)

      if (result.success) {
        toast({
          title: "POD Deleted",
          description: "The POD has been deleted successfully.",
        })
        refreshData()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete POD",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting pod:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setConfirmDialogOpen(false)
      setPodToDelete(null)
    }
  }

  const handleToggleVisibility = async (podId: string) => {
    if (!user) return

    setIsTogglingVisibility(podId)
    try {
      const result = await togglePodVisibility(podId, user.id)

      if (result.success) {
        toast({
          title: "Visibility Updated",
          description: "Pod visibility has been updated successfully.",
        })
        refreshData()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update pod visibility",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling pod visibility:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTogglingVisibility(null)
    }
  }

  const handlePriorityEditStart = (pod: Pod) => {
    if (hasPermission("edit_priority")) {
      setEditingPriority({ id: pod.id!, value: pod.priority })
    }
  }

  const handlePriorityChange = (value: string) => {
    if (editingPriority) {
      setEditingPriority({ ...editingPriority, value: Number.parseInt(value, 10) })
    }
  }

  const handlePrioritySave = async () => {
    if (!editingPriority || !user) return

    // Validate that priority is not 9999 (reserved for new PODs)
    if (editingPriority.value === 9999) {
      toast({
        title: "Invalid Priority",
        description: "The priority value 9999 is reserved for new PODs. Please choose a different value.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPriority(true)
    try {
      const result = await updatePodPriority(editingPriority.id, editingPriority.value, user.id)

      if (result.success) {
        toast({
          title: "Priority Updated",
          description: "The priority has been updated successfully.",
        })
        refreshData()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update priority",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating priority:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPriority(false)
      setEditingPriority(null)
    }
  }

  // Email configuration variables
  const ANTS_EMAIL_TO = "ants@company.com"
  const ANTS_EMAIL_CC = "manager@company.com,supervisor@company.com"
  
  const PM_EMAIL_TO = "pm@company.com"
  const PM_EMAIL_CC = "manager@company.com,project.lead@company.com"

  // Email functions
  const handleANTSEmail = (pod: Pod) => {
    const subject = `"${pod.pod}" Request for ANTS Approval Consideration`
    const body = `Please review the attached "${pod.pod}" MACD, and reply to let me know if it may proceed for implementation via ticket to LCM.

Thank you,
${user?.email || 'Engineer Name'}.`

    const mailtoLink = `mailto:${ANTS_EMAIL_TO}?cc=${encodeURIComponent(ANTS_EMAIL_CC)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const handlePMEmail = (pod: Pod) => {
    const subject = `"${pod.pod}" ticket numbers and PEP Link`
    const body = `"${pod.pod}:"
LCM Front Door ADD and/or MACD Ticket: "${pod.lcmAddTicketNumber || 'N/A'}"
Initial Network Preload Ticket: "${pod.preloadTicketNumber1 || 'N/A'}"
Respin Network Preload Ticket: "${pod.preloadTicketNumber2 || 'N/A'}"
Delete Network Preload Ticket: "${pod.preloadTicketNumber3 || 'N/A'}"
DNS Add/Deletes Ticket: "${pod.dnsTicketAddsDeletes || 'N/A'}"
DNS Changes Ticket: "${pod.dnsTicketChanges || 'N/A'}"
Link to PEP: ${pod.linkToActivePreloads || 'N/A'}

Thank you,
${user?.email || 'Engineer Name'}`

    const mailtoLink = `mailto:${PM_EMAIL_TO}?cc=${encodeURIComponent(PM_EMAIL_CC)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const canEditPriority = hasPermission("edit_priority")
  const canDeletePod = hasPermission("delete_pod")
  const canEditPod = hasPermission("edit_pod");
  const canMovePod = hasPermission("move_pod")
  const canToggleVisibility = hasPermission("toggle_visibility")

  const pageSizeOptions = [10, 25, 50, 100]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            items
          </div>
          <Select value={pageSize.toString()} onValueChange={(value: string) => onPageSizeChange(Number.parseInt(value))}>
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
        <div className="overflow-x-auto max-w-full">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[150px]">Actions</TableHead>
                <TableHead>POD</TableHead>
                <TableHead>POD Type</TableHead>
                <TableHead>POD Program Type</TableHead>
                <TableHead>Assigned Engineer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sub Status</TableHead>
                <TableHead>Priority</TableHead>
                {canToggleVisibility && <TableHead className="w-[100px]">Visibility</TableHead>}
                <TableHead>SLA Calculated NBD</TableHead>
                <TableHead>Time In Current Status</TableHead>
                <TableHead className="sticky right-0 bg-muted/100 z-10">More Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canToggleVisibility ? 5 : 4} className="h-24 text-center">
                    No PODs found. Add a new POD to get started.
                  </TableCell>
                </TableRow>
              ) : (
                pods.map((pod) => {
                  return (
                    <TableRow key={pod.id} className={getRowColor(pod.status)}>
                      <TableCell>
                        <div className="flex items-center gap-1 overflow-x-auto">
                          <Button 
                            variant="outline" 
                            disabled={!canEditPod} 
                            size="sm" 
                            onClick={() => handleEdit(pod)}
                            title="Edit POD"
                            className="shrink-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {canMovePod && (
                            <Button
                              variant={pod.status === "Complete" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleComplete(pod)}
                              title="Complete POD"
                              className="shrink-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeletePod && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(pod.id!)}
                              title="Delete POD"
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleANTSEmail(pod)}
                            title="Send ANTS Email"
                            className="shrink-0"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePMEmail(pod)}
                            title="Send PM Email"
                            className="shrink-0"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{pod.pod}</TableCell>
                      <TableCell>{pod.podTypeOriginal || "Not Set"}</TableCell>
                      <TableCell>{pod.podProgramType || "Not Set"}</TableCell>
                      <TableCell>{pod.assignedEngineer || "Not Set"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pod.status)}>{pod.status}</Badge>
                      </TableCell>
                      <TableCell>{pod.subStatus || "Not Set"}</TableCell>
                      <TableCell>{pod.priority === 9999 ? "-" : pod.priority}</TableCell>
                      {canToggleVisibility && (
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Checkbox
                              checked={pod.shouldDisplay}
                              onCheckedChange={() => handleToggleVisibility(pod.id!)}
                              disabled={isTogglingVisibility === pod.id}
                            />
                            {/* <span className="text-sm text-muted-foreground">
                              {isTogglingVisibility === pod.id ? "Updating..." : (pod.shouldDisplay ? "Visible" : "Hidden")}
                            </span> */}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {pod.slaCalculatedNbdIsNA
                          ? "N/A"
                          : pod.slaCalculatedNbd
                            ? formatDateInCentralTime(pod.slaCalculatedNbd)
                            : "Not Set"}
                      </TableCell>
                      <TableCell>{pod.timeInCurrentStatus}</TableCell>
                      <TableCell className="sticky right-0 bg-white z-10">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(pod)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingPod && <EditPodDialog pod={editingPod} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} refreshData={refreshData} />}

      <PodDetailsDialog pod={viewingPod} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete POD"
        description="Are you sure you want to delete this POD? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  )
}
