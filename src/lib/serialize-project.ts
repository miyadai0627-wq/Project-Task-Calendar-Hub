import type { Project as PrismaProject } from "@/generated/prisma/client";
import type { Project } from "@/types";

export function serializeProject(project: PrismaProject): Project {
  return {
    id: project.id,
    name: project.name,
    color: project.color,
    status: project.status as Project["status"],
    order: project.order,
  };
}
