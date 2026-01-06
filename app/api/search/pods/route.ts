import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

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
    const isHistory = searchParams.get("isHistory") === "true"

    // Get search filters - Handle multiple criteria
    const searchCriteria = []
    for (let i = 0; searchParams.has(`field${i}`); i++) {
      const field = searchParams.get(`field${i}`)
      const value = searchParams.get(`value${i}`)
      if (field && value) {
        searchCriteria.push({ field, value })
      }
    }

    // Build search condition with proper typing
    const whereConditions: {
      isHistory: boolean
      isDeleted: boolean // Add isDeleted condition
      AND?: Array<Record<string, any>>
    } = {
      isHistory,
      isDeleted: false, // Only return non-deleted pods
    }

    // Filter based on shouldDisplay field and user role
    if (user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN can see all pods
    } else if (user.role === "PRIORITY") {
      // PRIORITY users can see pods where shouldDisplay is false (created by PRIORITY users)
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        { shouldDisplay: false }
      ];
    } else {
      // Other roles (REGULAR, ADMIN) can only see pods where shouldDisplay is true
      whereConditions.AND = [
        ...(whereConditions.AND || []),
        { shouldDisplay: true }
      ];
    }

    if (searchCriteria.length > 0) {
      whereConditions.AND = searchCriteria.map((criteria) => {
        // Special handling for priority field
        if (criteria.field === "priority" && criteria.value === "has_value") {
          return {
            priority: {
              not: 9999, // Show all pods with priority not equal to 9999 (default)
            },
          }
        }

        // Default handling for other fields
        return {
          [criteria.field]: { contains: criteria.value, mode: "insensitive" },
        }
      })
    }

    // Get total count for pagination
    const totalCount = await prisma.pod.count({
      where: whereConditions,
    })

    // Get paginated data
    const pods = await prisma.pod.findMany({
      where: whereConditions,
      orderBy: isHistory ? { completedDate: "desc" } : [{ priority: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      pods,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "An error occurred while searching" }, { status: 500 })
  }
}
