import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get historical PODs (isHistory: true, isDeleted: false)
    const historicalPods = await prisma.pod.findMany({
      where: {
        isHistory: true,
        isDeleted: false,
        lcmComplete: {
          not: null
        }
      },
      select: {
        id: true,
        pod: true,
        lcmComplete: true,
        slaCalculatedNbd: true,
        org: true,
        podProgramType: true,
        podTypeOriginal: true,
        completedDate: true,
        totalElapsedCycleTime: true,
        workableCycleTime: true,
      },
      orderBy: {
        lcmComplete: 'asc'
      }
    })

    // Process data for charts
    const lcmCompleteByMonth = processLcmCompleteByMonth(historicalPods)
    const lcmVsSlaData = processLcmVsSlaData(historicalPods)

    return NextResponse.json({
      historicalPods,
      lcmCompleteByMonth,
      lcmVsSlaData,
      totalCount: historicalPods.length
    })
  } catch (error) {
    console.error("Error fetching performance analytics:", error)
    return NextResponse.json({ error: "Failed to fetch performance analytics" }, { status: 500 })
  }
}

// Process LCM Complete data by month/year
function processLcmCompleteByMonth(pods: any[]) {
  const monthData: { [key: string]: number } = {}
  
  pods.forEach(pod => {
    if (pod.lcmComplete) {
      const date = new Date(pod.lcmComplete)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthData[monthYear]) {
        monthData[monthYear] = 0
      }
      monthData[monthYear]++
    }
  })

  // Convert to array and sort by date
  return Object.entries(monthData)
    .map(([monthYear, count]) => ({
      monthYear,
      count,
      displayName: formatMonthYear(monthYear)
    }))
    .sort((a, b) => a.monthYear.localeCompare(b.monthYear))
}

// Process LCM Complete vs SLA NBD data
function processLcmVsSlaData(pods: any[]) {
  return pods
    .filter(pod => pod.lcmComplete && pod.slaCalculatedNbd)
    .map(pod => ({
      pod: pod.pod,
      lcmComplete: new Date(pod.lcmComplete).getTime(), // Convert to timestamp for chart
      slaNbd: new Date(pod.slaCalculatedNbd).getTime(), // Convert to timestamp for chart
      lcmCompleteDate: pod.lcmComplete, // Keep original date for display
      slaNbdDate: pod.slaCalculatedNbd, // Keep original date for display
      daysDifference: calculateDaysDifference(pod.lcmComplete, pod.slaCalculatedNbd), // Fixed: LCM - SLA
      org: pod.org,
      podProgramType: pod.podProgramType,
      totalElapsedCycleTime: pod.totalElapsedCycleTime,
      workableCycleTime: pod.workableCycleTime,
      // Add formatted dates for better chart display
      lcmCompleteFormatted: new Date(pod.lcmComplete).toLocaleDateString(),
      slaNbdFormatted: new Date(pod.slaCalculatedNbd).toLocaleDateString()
    }))
    .sort((a, b) => a.lcmComplete - b.lcmComplete)
}

// Helper function to format month/year for display
function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Helper function to calculate days difference (LCM - SLA)
// Positive = completed after deadline (late), Negative = completed before deadline (early)
function calculateDaysDifference(lcmDate: Date, slaDate: Date): number {
  const lcm = new Date(lcmDate)
  const sla = new Date(slaDate)
  const diffTime = lcm.getTime() - sla.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
