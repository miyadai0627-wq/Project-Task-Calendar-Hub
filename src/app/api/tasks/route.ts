import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/serialize-task";
import type { TaskPriority, TaskStatus } from "@/types";

interface TaskInput {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes?: number;
  actualMinutes?: number;
  dueDate?: string;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.googleAccountId) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.googleAccountId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(tasks.map(serializeTask));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.googleAccountId) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as TaskInput;
  if (!body.title || !body.projectId || !body.status || !body.priority) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      userId: session.googleAccountId,
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      estimatedMinutes: body.estimatedMinutes,
      actualMinutes: body.actualMinutes,
      dueDate: body.dueDate,
      scheduledDate: body.scheduledDate,
      startTime: body.startTime,
      endTime: body.endTime,
      completedAt: body.status === "completed" ? new Date() : null,
    },
  });

  return NextResponse.json(serializeTask(task), { status: 201 });
}
