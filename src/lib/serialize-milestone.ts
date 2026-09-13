import type { Milestone as PrismaMilestone } from "@/generated/prisma/client";
import type { Milestone } from "@/types";

export function serializeMilestone(milestone: PrismaMilestone): Milestone {
  return {
    id: milestone.id,
    projectId: milestone.projectId,
    title: milestone.title,
    startDate: milestone.startDate,
    endDate: milestone.endDate,
    status: milestone.status as Milestone["status"],
  };
}
