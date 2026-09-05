export type ProjectId = string;

export type ProjectStatus = "active" | "archived";

export interface Project {
  id: ProjectId;
  name: string;
  color: string;
  status: ProjectStatus;
  order: number;
}
