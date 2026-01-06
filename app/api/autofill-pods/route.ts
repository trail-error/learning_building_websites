import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all autofill pods
export async function GET() {
  const pods = await prisma.autofillPod.findMany();
  return NextResponse.json(pods);
}

// POST: Bulk upload autofill pods (expects array of pods in req body)
export async function POST(req: NextRequest) {
  try {
    const { pods } = await req.json();
    if (!Array.isArray(pods)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }
    // Upsert each pod by pod (unique)
    const results = await Promise.all(
      pods.map(async (pod: any) => {
        // RouterType logic
        let routerType = pod.routerType;
        if (pod.router1?.toLowerCase().endsWith("jl1") && pod.router2?.toLowerCase().endsWith("jl1")) {
          routerType = "Rleaf";
        } else if (pod.router1?.toLowerCase().endsWith("jl3") && pod.router2?.toLowerCase().endsWith("jl3")) {
          routerType = "NCX";
        }
        
        // Only save the 12 allowed columns
        const updateData: any = {
          internalPodId: pod.internalPodId,
          podTypeOriginal: pod.podTypeOriginal,
          podProgramType: pod.podProgramType,
          projectManagers: pod.projectManagers,
          clli: pod.clli,
          city: pod.city,
          state: pod.state,
          router1: pod.router1,
          router2: pod.router2,
          routerType,
          tenantName: pod.tenantName,
        };
        
        const createData: any = {
          pod: pod.pod,
          ...updateData,
        };
        
        return prisma.autofillPod.upsert({
          where: { pod: pod.pod },
          update: updateData,
          create: createData,
        });
      })
    );
    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
} 