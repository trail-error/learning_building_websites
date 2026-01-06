"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PodTable } from "@/components/pod-table"
import { AddPodDialog } from "@/components/add-pod-dialog"
import { AdvancedSearch } from "@/components/advance-search";
import { ExportExcel } from "@/components/export-excel"
import { ImportExcelDialog } from "@/components/import-excel-dialog"
import Link from "next/link"
import type { Pod, SearchCriteria } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { completePod, addPod, checkPodExists, getPods } from "@/lib/actions"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { AutofillExcelDialog } from "@/components/autofill-excel-dialog"

export default function MainPage() {
  const { toast } = useToast()
  const { user, hasPermission } = useAuth()
  const [pods, setPods] = useState<Pod[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([])
  const [isAutofillDialogOpen, setIsAutofillDialogOpen] = useState(false)

  // Load data from API on component mount or when search/page changes
  useEffect(() => {
    fetchPods()
  }, [currentPage, pageSize, searchCriteria,user?.id])

  const fetchPods = async () => {
    if(!user?.id) return;
    setIsLoading(true)
    try {
      
      const data = await getPods(currentPage, pageSize, searchCriteria, user?.id)
      
      setPods(data.pods)
      setTotalPages(data.totalPages)
      setTotalItems(data.totalCount)
    } catch (error) {
      console.error("Error fetching pods:", error)
      toast({
        title: "Error",
        description: "Failed to load PODs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPod = async (newPod: Pod) => {
    if (!user) return

    console.log("new pod",newPod);
    try {
      const result = await addPod({ ...newPod, createdById: user.id }, user.id)

      if (result.success) {
        if (newPod.status === "Complete") {
          toast({
            title: "POD Added to History",
            description: `POD ${newPod.pod} has been added directly to history.`,
          })
        } else {
          // Refresh the pods list
          fetchPods()

          toast({
            title: "POD Added",
            description: `POD ${newPod.pod} has been added successfully.`,
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add POD",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding pod:", error)
      toast({
        title: "Error",
        description: "Failed to add POD",
        variant: "destructive",
      })
    }

    setIsAddDialogOpen(false)
  }

  const handleComplete = async (podId: string) => {
    if (!user) return

    try {
      const result = await completePod(podId, user.id)

      if (result.success) {
        // Refresh the pods list
        fetchPods()

        toast({
          title: "POD Completed",
          description: `POD ${podId} has been moved to history.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to complete POD",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error completing pod:", error)
      toast({
        title: "Error",
        description: "Failed to complete POD",
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleSearch = (criteria: SearchCriteria[]) => {
    setSearchCriteria(criteria)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleClearSearch = () => {
    setSearchCriteria([])
    setCurrentPage(1)
  }

  const handleImportPods = async (pods: Pod[]) => {
    if (!user) return;

    try {
      console.log("Attempting to import pods:", pods);
      const response = await fetch("/api/pods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pods: pods.map(pod => ({ ...pod, createdById: user.id })), isHistory: false }),
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to import pods");
      }

      fetchPods(); // Refresh the pods list

      toast({
        title: "Import Successful",
        description: `Successfully imported ${pods.length} PODs.`,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error importing pods:", errorMsg);
      toast({
        title: "Import Failed",
        description: errorMsg || "Failed to import pods. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw so dialog knows it failed
    }
  }

  const canCreatePod = hasPermission("create_pod")

  const handleEmailClick = () => {
    // Generate email content with POD information
    const emailSubject = `POD Status Report - ${pods.length} PODs`
    
    // Create email body with POD details
    const emailBody = `Dear Team,

Please find below the current POD status report:



Best regards,
${user?.name || 'User'}`

    // Create mailto URL
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    // Open default email client
    window.open(mailtoUrl,"snwork@gmail.com")
  }

  return (
    <div className="container mx-auto py-8">
      <Header title="Internal Analytics Platform" />
      <div className="flex justify-end mb-3 gap-4 flex-wrap">
        {canCreatePod && <Button onClick={() => setIsAddDialogOpen(true)}>Add New POD</Button>}
        {hasPermission("import_excel") && (
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            Import from Excel
          </Button>
        )}
        {hasPermission("autofill_excel") && (
          <Button variant="outline" onClick={() => setIsAutofillDialogOpen(true)}>
            Autofill Excel
          </Button>
        )}
        <Link href="/history">
          <Button variant="outline">View History</Button>
        </Link>
        <Link href="/log-issues">
          <Button variant="outline">Log & Issues</Button>
        </Link>
        <Link href="/analytics">
          <Button variant="outline">Analytics</Button>
        </Link>
        {/* <Button variant="outline" onClick={handleEmailClick}>Email</Button> */}
        {hasPermission("manage_users") && (
          <Link href="/users">
            <Button variant="outline">Manage Users</Button>
          </Link>
        )}
        <ExportExcel isHistory={false} searchCriteria={searchCriteria} userId={user?.id} />
      </div>

      <AdvancedSearch isHistory={false} onSearch={handleSearch} onClear={handleClearSearch} />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading PODs...</p>
        </div>
      ) : (
        <PodTable
          pods={pods}
          onComplete={handleComplete}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          refreshData={fetchPods}
        />
      )}

      {canCreatePod && (
        <AddPodDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddPod}
          existingPods={pods}
          checkPodExists={checkPodExists}
        />
      )}

      {hasPermission("import_excel") && (
        <ImportExcelDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onImport={handleImportPods}
          existingPods={pods}
          isHistory={false}
        />
      )}

      {hasPermission("autofill_excel") && (
        <AutofillExcelDialog
          open={isAutofillDialogOpen}
          onOpenChange={setIsAutofillDialogOpen}
        />
      )}
    </div>
  )
}
