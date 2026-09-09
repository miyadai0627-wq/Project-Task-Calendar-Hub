import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/serialize-task";
import type { TaskPriority, TaskStatus } from "@/types";

interface TaskPatchInput {
  projectId?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedMinutes?: number;
  actualMinutes?: number;
  dueDate?: string;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  googleEventId?: string;
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

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.googleAccountId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const patch = (await request.json()) as TaskPatchInput;
  const nextStatus = patch.status ?? existing.status;
  const becomingCompleted = nextStatus === "completed";
  const wasCompleted = existing.status === "completed";

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...patch,
      status: nextStatus,
      completedAt: becomingCompleted
        ? (wasCompleted ? existing.completedAt : new Date())
        : null,
    },
  });

  return NextResponse.json(serializeTask(task));
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

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.googleAccountId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
