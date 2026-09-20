import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/serialize-project";
import type { ProjectStatus } from "@/types";

interface ProjectPatchInput {
  name?: string;
  color?: string;
  status?: ProjectStatus;
  order?: number;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const patch = (await request.json()) as ProjectPatchInput;

  const project = await prisma.project.update({
    where: { id },
    data: patch,
  });

  return NextResponse.json(serializeProject(project));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [taskCount, milestoneCount] = await Promise.all([
    prisma.task.count({ where: { projectId: id } }),
    prisma.milestone.count({ where: { projectId: id } }),
  ]);

  if (taskCount > 0 || milestoneCount > 0) {
    return NextResponse.json(
      {
        error: "project_not_empty",
        taskCount,
        milestoneCount,
      },
      { status: 409 },
    );
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
