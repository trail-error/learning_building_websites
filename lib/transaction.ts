import prisma from "@/lib/db"

export async function createTransaction({
  entityType,
  entityId,
  action,
  details,
  podId,
  logIssueId,
  createdById,
}: {
  entityType: string
  entityId: string
  action: string
  details: string
  podId?: string
  logIssueId?: string
  createdById: string
}) {
  try {
    // Create the transaction without relations
    const transaction = await prisma.transaction.create({
      data: {
        entityType,
        entityId,
        action,
        details,
        podId,
        logIssueId,
        createdById,
      },
    })

    // Create notifications for relevant users
    // (Notification logic removed; now handled in actions)

    return transaction
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

// Function to get transactions with manual lookups for related entities
export async function getTransactions(entityType?: string, entityId?: string, page = 1, pageSize = 10) {
  try {
    // Build where conditions
    let whereCondition = {}

    if (entityType) {
      whereCondition = { ...whereCondition, entityType }
    }

    if (entityId) {
      whereCondition = { ...whereCondition, entityId }
    }

    // Get total count
    const totalCount = await prisma.transaction.count({
      where: whereCondition,
    })

    // Get paginated data
    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    // Manually fetch related user data
    const userIds = transactions.map((t) => t.createdById).filter(Boolean)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds as string[],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Create a map for quick lookup
    const userMap = new Map(users.map((user) => [user.id, user]))

    // Enrich transactions with user data
    const enrichedTransactions = transactions.map((transaction) => ({
      ...transaction,
      createdBy: userMap.get(transaction.createdById) || null,
    }))

    return {
      transactions: enrichedTransactions,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return {
      transactions: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    }
  }
}
