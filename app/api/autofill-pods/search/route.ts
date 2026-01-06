import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search for POD IDs in autofill table that match the query
    // Only fetch minimal data for fast response during typing
    const autofillPods = await prisma.autofillPod.findMany({
      where: {
        pod: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        pod: true,
        city: true,
        state: true,
        clli: true,
        podProgramType: true,
        tenantName: true,
      },
      take: 15, // Increased limit since we're only fetching basic info
      orderBy: {
        pod: "asc",
      },
    });

    return NextResponse.json(autofillPods);
  } catch (error) {
    console.error("Error searching autofill pods:", error);
    return NextResponse.json([], { status: 500 });
  }
}
