"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { LogIssue } from "@/lib/types"
import { EditLogIssueDialog } from "@/components/edit-log-issue-dialog"
import { getStatusColor, getRowColor, formatDateInCentralTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface LogIssuesTableProps {
  logIssues: LogIssue[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function LogIssuesTable({ logIssues, currentPage, totalPages, onPageChange }: LogIssuesTableProps) {
  const { toast } = useToast()
  const [editingIssue, setEditingIssue] = useState<LogIssue | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEdit = (issue: LogIssue) => {
    setEditingIssue(issue)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (updatedIssue: LogIssue) => {
    try {
      const response = await fetch(`/api/log-issues/${updatedIssue.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedIssue),
      })

      if (!response.ok) {
        throw new Error("Failed to update log issue")
      }

      toast({
        title: "Issue Updated",
        description: `Log issue for POD ${updatedIssue.pod} has been updated successfully.`,
      })

      // Force a refresh of the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating log issue:", error)
      toast({
        title: "Error",
        description: "Failed to update log issue",
        variant: "destructive",
      })
    }
  }

  

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center space-x-2">
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

      <div className="rounded-md border dark:border-gray-700">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[100px]">Actions</TableHead>
                <TableHead>POD</TableHead>
                <TableHead>Date Opened</TableHead>
                <TableHead>LEP Version Being Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Root Cause Owner</TableHead>
                <TableHead>Resolution Owner</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No issues found.
                  </TableCell>
                </TableRow>
              ) : (
                logIssues.map((issue) => (
                  <TableRow key={issue.id} className={getRowColor(issue.status)}>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(issue)}>
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>{issue.pod}</TableCell>
                    <TableCell>
                      {issue.dateOpened
                          ? formatDateInCentralTime(issue.dateOpened)
                          : "Not Set"}
                    </TableCell>
                    <TableCell>{issue.lepVersionBeingApplied}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                    </TableCell>
                    <TableCell>{issue.rootCauseOwner}</TableCell>
                    <TableCell>{issue.resolutionOwner.join(" ")}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{issue.description}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{issue.notes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingIssue && (
        <EditLogIssueDialog
          logIssue={editingIssue}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
