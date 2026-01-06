import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { isSameHour } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

   

    // Get paginated data
    const pods = await prisma.pod.findMany({
      where: {
        isHistory:false
      },
      select:{
        pod:true,
        assignedEngineer:true
      }
    })

    return NextResponse.json({
     pods
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "An error occurred while searching" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const { pods, isHistory } = body

    console.log("Importing body with",pods.length,"pods, isHistory:",isHistory);
    if (!Array.isArray(pods)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    
    const results = []
    for (const pod of pods) {
      // Validate required POD field
      if (!pod.pod || typeof pod.pod !== 'string' || pod.pod.trim() === '') {
        console.log("Skipping pod - missing POD identifier")
        continue
      }

      // Define default values for required fields (non-nullable in schema)
      const defaultValues: any = {
        type: '',
        internalPodId: '',
        assignedEngineer: '',
        status: 'Initial',
        subStatus: 'Assignment',
        org: 'ENG',
        priority: 9999,
        clli: '',
        city: '',
        state: '',
        routerType: '',
        router1: '',
        router2: '',
        podProgramType: '',
        tenantName: '',
        currentLepVersion: '',
        lepVersionToBeApplied: '',
        podType: 'eUPF',
        podTypeOriginal: '',
        special: false,
        totalElapsedCycleTime: 0,
        workableCycleTime: 0,
      }

      // Merge provided values with defaults - prioritize provided values, fall back to defaults
      let cleanedPod: any = { ...defaultValues }
      
      for (const [key, value] of Object.entries(pod)) {
        // Only include the value if it's not empty string or null (unless it's explicitly set)
        if (value === '' || value === null || value === undefined) {
          // Keep the default value
          if (!(key in defaultValues)) {
            cleanedPod[key] = null
          }
        } else {
          cleanedPod[key] = value
        }
      }
      
      console.log("Creating/updating pod:", cleanedPod.pod)
      
      // For history page, always create a new row (allow duplicates)
      // For main page, only create if doesn't exist (skip duplicates, no update)
      if (isHistory) {
        // Always create a new entry for history
        console.log("Creating new history entry for pod")
        await prisma.pod.create({
          data: { ...cleanedPod, isHistory: true },
        })
        results.push({ pod: cleanedPod.pod, action: "created" })
      } else {
        // For main page, only create if doesn't exist (skip duplicates)
        const exists = await prisma.pod.findFirst({
          where: { pod: cleanedPod.pod, isHistory: false, isDeleted: false },
        })
        
        if (exists) {
          // Skip duplicate on main page - don't update, just skip
          console.log("Skipping duplicate pod:", cleanedPod.pod)
          results.push({ pod: cleanedPod.pod, action: "skipped" })
        } else {
          // Create new pod with defaults
          console.log("Creating new pod")
          await prisma.pod.create({
            data: { ...cleanedPod, isHistory: false },
          })
          results.push({ pod: cleanedPod.pod, action: "created" })
        }
      }
    }

    console.log("Import completed, results:", results)
    return NextResponse.json({ success: true, results })
  } catch (error) {
    const errMsg = (error as any)?.message || String(error) || "An error occurred while importing"
    console.error("Import error:", errMsg, "Full error:", error)
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
