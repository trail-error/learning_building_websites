import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import type { SearchCriteria } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { Prisma, Pod } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const field = searchParams.get("field")
    const isHistory = searchParams.get("isHistory") === "true"
    const filtersParam = searchParams.get("filters")

    if (!field) {
      return NextResponse.json({ success: false, message: "Field parameter is required" }, { status: 400 })
    }

    // Parse filters
    let filters: SearchCriteria[] = []
    if (filtersParam) {
      try {
        filters = JSON.parse(decodeURIComponent(filtersParam))
      } catch (error) {
        console.error("Error parsing filters:", error)
      }
    }

    // Build where conditions
    const whereConditions: Prisma.PodWhereInput = {
      isHistory,
      isDeleted: false,
    }

    // Add cascade filters
    if (filters.length > 0) {
      const andConditions: Prisma.PodWhereInput[] = []

      // Handle special case for priority
      const priorityFilter = filters.find((f) => f.field === "priority")
      const otherFilters = filters.filter((f) => f.field !== "priority")

      if (otherFilters.length > 0) {
        otherFilters.forEach((filter) => {
          andConditions.push({
            [filter.field]: { contains: filter.value, mode: "insensitive" as const },
          })
        })
      }

      if (priorityFilter) {
        andConditions.push({ priority: { lt: 9999 } })
      }

      if (andConditions.length > 0) {
        whereConditions.AND = andConditions
      }
    }

    // Validate field is a valid Pod field
    const validFields = Object.keys(Prisma.PodScalarFieldEnum)
    if (!validFields.includes(field)) {
      return NextResponse.json({ success: false, message: "Invalid field" }, { status: 400 })
    }

    // Get distinct values for the requested field
    const fieldValues = await prisma.pod.findMany({
      where: whereConditions,
      select: {
        [field]: true,
      } as Prisma.PodSelect,
      distinct: [field as Prisma.PodScalarFieldEnum],
      orderBy: {
        [field]: "asc",
      } as Prisma.PodOrderByWithRelationInput,
    })

    // Extract values and filter out nulls and empty strings
    const options = fieldValues
      .map((item) => item[field as keyof Pod] as string)
      .filter((value) => value !== null && value !== "")

    return NextResponse.json({ success: true, options })
  } catch (error) {
    console.error("Error fetching field options:", error)
    return NextResponse.json({ success: false, message: "Error fetching field options" }, { status: 500 })
  }
}
