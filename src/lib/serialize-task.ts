import type { Task as PrismaTask } from "@/generated/prisma/client";
import type { Task } from "@/types";

export function serializeTask(task: PrismaTask): Task {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description ?? undefined,
    status: task.status as Task["status"],
    priority: task.priority as Task["priority"],
    estimatedMinutes: task.estimatedMinutes ?? undefined,
    actualMinutes: task.actualMinutes ?? undefined,
    dueDate: task.dueDate ?? undefined,
    scheduledDate: task.scheduledDate ?? undefined,
    startTime: task.startTime ?? undefined,
    endTime: task.endTime ?? undefined,
    googleEventId: task.googleEventId ?? undefined,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  };
}
