import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { ids } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ duplicates: [] })
    }
    const foundPods = await prisma.pod.findMany({
      where: {
        pod: { in: ids },
        isHistory: false,
        isDeleted: false,
      },
      select: { pod: true },
    })
    const duplicates = foundPods.map((p) => p.pod)
    return NextResponse.json({ duplicates })
  } catch (error) {
    console.error("Duplicate check error:", error)
    return NextResponse.json({ error: "An error occurred while checking duplicates" }, { status: 500 })
  }
} 