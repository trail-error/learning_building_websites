import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { hashPassword, verifyPassword, getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { newPassword } = await request.json()

    if (!newPassword) {
      return NextResponse.json({ error: "New password is required" }, { status: 400 })
    }

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow self or admin
    if (currentUser.id !== userId && currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // No current password check for admins
    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Update password error:", error)
    return NextResponse.json({ error: "An error occurred while updating password" }, { status: 500 })
  }
} 