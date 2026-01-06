import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, updateUserRole } from "@/lib/auth"
import { createTransaction } from "@/lib/transaction"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is SuperAdmin
    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userId = params.id
    const { role } = await request.json()

    if (!["REGULAR", "ADMIN", "PRIORITY", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const result = await updateUserRole(userId, role)

    if (!result.success) {
      return NextResponse.json({ error: result.message || "Failed to update user role" }, { status: 400 })
    }

    // Log transaction
    await createTransaction({
      entityType: "User",
      entityId: userId,
      action: "update_role",
      details: JSON.stringify({ oldRole: null, newRole: role }),
      createdById: currentUser.id,
    })

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "An error occurred while updating user role" }, { status: 500 })
  }
}
