import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getAllUsers } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is SuperAdmin
    // if (user.role !== "SUPER_ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")

    const result = await getAllUsers(page, pageSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 })
  }
}
