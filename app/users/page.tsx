"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserManagement } from "@/components/user-management"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { redirect } from "next/navigation"

export default function UsersPage() {
  const { toast } = useToast()
  const { hasPermission } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Redirect if user doesn't have permission
  if (!hasPermission("manage_users")) {
    redirect("/main")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  return (
    <div className="container mx-auto py-8">
      <Header title="User Management" />
      <div className="flex justify-end mb-6">
        <Link href="/main">
          <Button variant="outline">Back to Main</Button>
        </Link>
      </div>

      <UserManagement
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
