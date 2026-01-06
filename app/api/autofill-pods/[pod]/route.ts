import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { pod: string } }) {
  const pod = params.pod;
  if (!pod) {
    return NextResponse.json({ error: "Pod is required" }, { status: 400 });
  }
  const autofill = await prisma.autofillPod.findUnique({ where: { pod } });
  if (!autofill) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(autofill);
} 