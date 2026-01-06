import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { addLogIssue, getLogIssues } from "@/lib/actions"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const searchQuery = searchParams.get("search") || ""

    const result = await getLogIssues(page, pageSize, searchQuery)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching log issues:", error)
    return NextResponse.json({ error: "An error occurred while fetching log issues" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logIssue = await request.json()
    const result = await addLogIssue(logIssue, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.message || "Failed to add log issue" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding log issue:", error)
    return NextResponse.json({ error: "An error occurred while adding log issue" }, { status: 500 })
  }
}
