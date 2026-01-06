"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogIssuesTable } from "@/components/log-issues-table"
import { AddLogIssueDialog } from "@/components/add-log-issue-dialog"
import type { LogIssue } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"

export default function LogIssuesPage() {
  const { toast } = useToast()
  const [logIssues, setLogIssues] = useState<LogIssue[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load log issues from API on component mount or when page changes
  useEffect(() => {
    fetchLogIssues()
  }, [currentPage])

  const fetchLogIssues = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/log-issues?page=${currentPage}&pageSize=10`)

      if (!response.ok) {
        throw new Error("Failed to fetch log issues")
      }

      const data = await response.json()
      setLogIssues(data.logIssues)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Error fetching log issues:", error)
      toast({
        title: "Error",
        description: "Failed to load log issues",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLogIssue = async (newLogIssue: LogIssue) => {
    try {
      const response = await fetch("/api/log-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLogIssue),
      })

      if (!response.ok) {
        throw new Error("Failed to add log issue")
      }

      // Refresh the log issues list
      fetchLogIssues()

      toast({
        title: "Issue Added",
        description: `Log issue for POD ${newLogIssue.pod} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding log issue:", error)
      toast({
        title: "Error",
        description: "Failed to add log issue",
        variant: "destructive",
      })
    }

    setIsAddDialogOpen(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto py-8">
      <Header title="Log & Issues" />
      <div className="flex justify-end mb-6 gap-4">
        <Button onClick={() => setIsAddDialogOpen(true)}>Add New Issue</Button>
        <Link href="/main">
          <Button variant="outline">Back to Main</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading issues...</p>
        </div>
      ) : (
        <LogIssuesTable
          logIssues={logIssues}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <AddLogIssueDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddLogIssue} />
    </div>
  )
}
