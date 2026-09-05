import type { ProjectId } from "./project";

export type MilestoneId = string;

export type MilestoneStatus = "planned" | "in_progress" | "completed";

export interface Milestone {
  id: MilestoneId;
  projectId: ProjectId;
  title: string;
  startDate: string;
  endDate: string;
  status: MilestoneStatus;
}
