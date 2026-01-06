import { NextResponse } from "next/server"
import { removeAuthCookie, getAuthToken } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST() {
  try {
    const token = await getAuthToken()

    if (token) {
      // Remove token from database
      await prisma.token.deleteMany({
        where: { token },
      })
    }

    // Remove auth cookie
    await removeAuthCookie()

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 })
  }
}
