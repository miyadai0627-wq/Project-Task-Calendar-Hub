import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeMilestone } from "@/lib/serialize-milestone";
import type { MilestoneStatus } from "@/types";

interface MilestonePatchInput {
  projectId?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  status?: MilestoneStatus;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.googleAccountId) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.milestone.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.googleAccountId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const patch = (await request.json()) as MilestonePatchInput;

  const milestone = await prisma.milestone.update({
    where: { id },
    data: patch,
  });

  return NextResponse.json(serializeMilestone(milestone));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.googleAccountId) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.milestone.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.googleAccountId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.milestone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
