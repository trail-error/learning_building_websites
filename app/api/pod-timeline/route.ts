import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import moment from "moment"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const podId = searchParams.get("podId")

    if (!podId) {
      return NextResponse.json({ error: "Pod ID is required" }, { status: 400 })
    }

    // Get POD details
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
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
    })

    if (!pod) {
      return NextResponse.json({ error: "POD not found" }, { status: 404 })
    }

    // Get status history for this POD
    const statusHistory = await prisma.podStatusHistory.findMany({
      where: { podId },
      orderBy: { createdAt: "asc" },
      include: {
        changedBy: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    // Calculate timeline data
    const timelineData = calculateTimelineData(pod, statusHistory)

    return NextResponse.json({
      pod,
      statusHistory,
      timelineData,
    })
  } catch (error) {
    console.error("Error fetching POD timeline:", error)
    return NextResponse.json({ error: "Failed to fetch POD timeline" }, { status: 500 })
  }
}

// Helper function to calculate timeline data
function calculateTimelineData(pod: any, statusHistory: any[]) {
  const timeline: any[] = []
  
  // Process status history - only consider statuses from database
  statusHistory.forEach((history) => {
    if (history.status) {
      // Find the previous status entry and update its end date
      const previousStatusEntry = timeline
        .filter(entry => entry.type === "status")
        .pop()
      
      if (previousStatusEntry) {
        previousStatusEntry.endDate = history.createdAt
        previousStatusEntry.duration = calculateDuration(previousStatusEntry.startDate, history.createdAt)
      }

      // Add new status entry
      timeline.push({
        type: "status",
        value: history.status,
        startDate: history.createdAt,
        endDate: null,
        duration: "0m",
        previousValue: history.previousStatus,
        changedBy: history.changedBy,
        createdAt: history.createdAt,
      })
    }

    if (history.subStatus) {
      // Find the previous substatus entry and update its end date
      const previousSubStatusEntry = timeline
        .filter(entry => entry.type === "substatus")
        .pop()
      
      if (previousSubStatusEntry) {
        previousSubStatusEntry.endDate = history.createdAt
        previousSubStatusEntry.duration = calculateDuration(previousSubStatusEntry.startDate, history.createdAt)
      }

      // Add new substatus entry
      timeline.push({
        type: "substatus",
        value: history.subStatus,
        startDate: history.createdAt,
        endDate: null,
        duration: "0m",
        previousValue: history.previousSubStatus,
        changedBy: history.changedBy,
        createdAt: history.createdAt,
      })
    }
  })

  // Calculate duration for the last entry (current status/substatus)
  const today = new Date()
  const lastStatusEntry = timeline.filter(entry => entry.type === "status").pop()
  const lastSubStatusEntry = timeline.filter(entry => entry.type === "substatus").pop()

  if (lastStatusEntry && !lastStatusEntry.endDate) {
    lastStatusEntry.endDate = today
    lastStatusEntry.duration = calculateDuration(lastStatusEntry.startDate, today)
  }

  if (lastSubStatusEntry && !lastSubStatusEntry.endDate) {
    lastSubStatusEntry.endDate = today
    lastSubStatusEntry.duration = calculateDuration(lastSubStatusEntry.startDate, today)
  }

  return timeline
}

// Helper function to calculate duration between two dates using moment.js
function calculateDuration(startDate: Date, endDate: Date): string {
  const start = moment(startDate)
  const end = moment(endDate)
  
  const duration = moment.duration(end.diff(start))
  
  const days = Math.floor(duration.asDays())
  const hours = duration.hours()
  const minutes = duration.minutes()
  
  let result = ""
  
  if (days > 0) {
    result += `${days}d `
  }
  if (hours > 0) {
    result += `${hours}h `
  }
  if (minutes > 0) {
    result += `${minutes}m`
  }
  
  // If duration is less than a minute, show seconds
  if (result === "" && duration.asSeconds() > 0) {
    result = `${Math.floor(duration.asSeconds())}s`
  }
  
  // If duration is 0, show "0m"
  if (result === "") {
    result = "0m"
  }
  
  return result.trim()
}
