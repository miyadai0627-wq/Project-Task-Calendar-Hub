import type { Project } from "@/types";

export function getProjectById(
  projectId: string,
  projects: Project[],
): Project | undefined {
  return projects.find((project) => project.id === projectId);
}
