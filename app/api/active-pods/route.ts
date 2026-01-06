import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active PODs (no filtering on backend)
    const pods = await prisma.pod.findMany({
      where: {
        isHistory: false,
        isDeleted: false,
      },
      select: {
        id: true,
        pod: true,
        status: true,
        subStatus: true,
        assignedEngineer: true,
        org: true,
        podProgramType: true,
        podTypeOriginal: true,
        creationTimestamp: true,
        slaCalculatedNbd: true,
      },
      orderBy: { pod: "asc" },
    })

    // Get unique values for filters from the same data
    const uniqueOrgs = [...new Set(pods.map(p => p.org).filter(Boolean))]
    const uniquePodProgramTypes = [...new Set(pods.map(p => p.podProgramType).filter(Boolean))]
    const uniquePodTypes = [...new Set(pods.map(p => p.podTypeOriginal).filter(Boolean))]
    const uniqueEngineers = [...new Set(pods.map(p => p.assignedEngineer).filter(Boolean))]

    return NextResponse.json({
      pods,
      filters: {
        orgs: uniqueOrgs,
        podProgramTypes: uniquePodProgramTypes,
        podTypes: uniquePodTypes,
        engineers: uniqueEngineers,
      },
    })
  } catch (error) {
    console.error("Error fetching active PODs:", error)
    return NextResponse.json({ error: "Failed to fetch active PODs" }, { status: 500 })
  }
}
