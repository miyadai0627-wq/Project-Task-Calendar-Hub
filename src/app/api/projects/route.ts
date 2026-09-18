import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/serialize-project";

export async function GET() {
  const session = await auth();
  if (!session?.googleAccountId) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.googleAccountId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(projects.map(serializeProject));
}
