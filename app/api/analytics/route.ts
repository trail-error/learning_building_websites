import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { differenceInDays } from "date-fns"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active (non-history) pods - no filtering, let frontend handle it
    const pods = await prisma.pod.findMany({
      where: {
        isHistory: false,
        isDeleted: false,
      },
      select: {
        pod: true,
        assignedEngineer: true,
        priority: true,
        status: true,
        subStatus: true,
        podTypeOriginal: true,
        podProgramType: true,
        slaCalculatedNbd: true,
        creationTimestamp: true,
        totalElapsedCycleTime: true,
        workableCycleTime: true,
        timeInCurrentStatus: true,
        clli: true,
        city: true,
        state: true,
        routerType: true,
        router1: true,
        router2: true,
        tenantName: true,
        currentLepVersion: true,
        lepVersionToBeApplied: true,
        podType: true,
        special: true,
        notes: true,
        projectManagers: true,
        linkToActiveTds: true,
        linkToActivePreloads: true,
      },
    })

    console.log(`Fetched ${pods.length} active PODs for frontend analytics`)

    return NextResponse.json({
      pods,
      totalPods: pods.length,
    })
  } catch (error) {
    console.error("Error fetching PODs for analytics:", error)
    return NextResponse.json({ error: "Failed to fetch PODs" }, { status: 500 })
  }
}
