import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get page and filter from query params
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const showMyLogIssues = url.searchParams.get("showMyLogIssues") === "true"
    const pageSize = 10

    // Build where clause based on filter
    const whereClause = showMyLogIssues
      ? {
          createdForId: user.id,
        
        }
      : {
          userId: user.id
        }

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: whereClause
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        read: false,
      },
    })

    // Get paginated notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        createdAt: notification.createdAt,
        read: notification.read,
        podId: notification.podId,
        logIssueId: notification.logIssueId,
        createdByEmail: notification.createdBy?.email || "System",
      })),
      totalCount,
      unreadCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
