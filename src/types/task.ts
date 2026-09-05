import type { ProjectId } from "./project";

export type TaskId = string;

export type TaskStatus =
  | "backlog"
  | "todo"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "archived";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: TaskId;
  projectId: ProjectId;
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
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
