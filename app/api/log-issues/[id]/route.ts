import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { updateLogIssue } from "@/lib/actions"
import prisma from "@/lib/db"
import { createTransaction } from "@/lib/transaction"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const logIssue = await request.json()

    // Ensure the ID in the URL matches the ID in the request body
    if (id !== logIssue.id) {
      return NextResponse.json({ error: "ID mismatch between URL and request body" }, { status: 400 })
    }

    const result = await updateLogIssue(logIssue, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.message || "Failed to update log issue" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating log issue:", error)
    return NextResponse.json({ error: "An error occurred while updating log issue" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Find the log issue
    const logIssue = await prisma.logIssue.findUnique({
      where: { id },
    })

    if (!logIssue) {
      return NextResponse.json({ error: "Log issue not found" }, { status: 404 })
    }

    // Record transaction before soft deletion
    await createTransaction({
      entityType: "LogIssue",
      entityId: id,
      action: "delete",
      details: JSON.stringify(logIssue),
      logIssueId: id,
      createdById: user.id,
    })

    // Soft delete the log issue
    await prisma.logIssue.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting log issue:", error)
    return NextResponse.json({ error: "An error occurred while deleting log issue" }, { status: 500 })
  }
}
