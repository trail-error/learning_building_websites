"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HistoryTable } from "@/components/history-table"
import { AdvancedSearch } from "@/components/advance-search"
import { ExportExcel } from "@/components/export-excel"
import type { Pod, SearchCriteria } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { ImportExcelDialog } from "@/components/import-excel-dialog"

export default function HistoryPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [historyPods, setHistoryPods] = useState<Pod[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  // Load history data from API on component mount or when search/page changes
  useEffect(() => {
    fetchHistoryPods()
  }, [currentPage, pageSize, searchCriteria])

  const fetchHistoryPods = async () => {
    setIsLoading(true)
    try {
      let url = `/api/search/pods?page=${currentPage}&pageSize=${pageSize}&isHistory=true`

      // Append search criteria if available
      if (searchCriteria.length > 0) {
        const queryParams = searchCriteria
          .map(
            (criteria, index) =>
              `&field${index}=${encodeURIComponent(criteria.field)}&value${index}=${encodeURIComponent(criteria.value)}`,
          )
          .join("")

        url += queryParams
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch history pods")
      }

      const data = await response.json()
      setHistoryPods(data.pods)
      setTotalPages(data.totalPages)
      setTotalItems(data.totalCount)
    } catch (error) {
      console.error("Error fetching history pods:", error)
      toast({
        title: "Error",
        description: "Failed to load history PODs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
    try {
      const response = await fetch("/api/pods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pods, isHistory: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to import pods")
      }

      toast({
        title: "Success",
        description: "PODs imported successfully!",
      })
      fetchHistoryPods() // Refresh history after import
    } catch (error) {
      console.error("Error importing pods:", error)
      toast({
        title: "Error",
        description: "Failed to import PODs",
        variant: "destructive",
      })
      throw error; // Re-throw so dialog knows it failed
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Header title="POD History" />
      <div className="flex justify-end mb-6 gap-4">
        <Link href="/main">
          <Button variant="outline">Back to Main</Button>
        </Link>
        <Link href="/log-issues">
          <Button variant="outline">Log & Issues</Button>
        </Link>
        <ExportExcel isHistory={true} searchCriteria={searchCriteria} />
        {user?.role === "SUPER_ADMIN" && (
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            Import from Excel
          </Button>
        )}
      </div>

      <AdvancedSearch isHistory={true} onSearch={handleSearch} onClear={handleClearSearch} />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading history...</p>
        </div>
      ) : (
        <HistoryTable
          pods={historyPods}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          refreshData={fetchHistoryPods}
          userId={user?.id}
        />
      )}
      {user?.role === "SUPER_ADMIN" && (
        <ImportExcelDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onImport={handleImportPods}
          isHistory={true}
        />
      )}
    </div>
  )
}
