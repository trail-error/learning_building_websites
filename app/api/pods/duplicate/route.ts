import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addDuplicatePod } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pod = await request.json();
    const result = await addDuplicatePod(pod, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.message || "Failed to duplicate pod" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error duplicating pod:", error);
    return NextResponse.json({ error: "An error occurred while duplicating pod" }, { status: 500 });
  }
} 