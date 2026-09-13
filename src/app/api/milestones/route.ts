import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeMilestone } from "@/lib/serialize-milestone";
import type { MilestoneStatus } from "@/types";

interface MilestoneInput {
  projectId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: MilestoneStatus;
}

export async function GET() {
  const session = await auth();
  if (!session?.googleAccountId) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const milestones = await prisma.milestone.findMany({
    where: { userId: session.googleAccountId },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(milestones.map(serializeMilestone));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.googleAccountId) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as MilestoneInput;
  if (!body.title || !body.projectId || !body.startDate || !body.endDate || !body.status) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const milestone = await prisma.milestone.create({
    data: {
      userId: session.googleAccountId,
      projectId: body.projectId,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
    },
  });

  return NextResponse.json(serializeMilestone(milestone), { status: 201 });
}
