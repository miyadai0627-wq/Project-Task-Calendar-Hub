import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/serialize-project";
import type { ProjectStatus } from "@/types";

interface ProjectInput {
  name: string;
  color: string;
  status?: ProjectStatus;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(projects.map(serializeProject));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as ProjectInput;
  if (!body.name || !body.color) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const last = await prisma.project.findFirst({
    where: { userId: session.user.id },
    orderBy: { order: "desc" },
  });

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      name: body.name,
      color: body.color,
      status: body.status ?? "active",
      order: (last?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(serializeProject(project), { status: 201 });
}
