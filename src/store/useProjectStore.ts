"use client";

import { create } from "zustand";

import type { Project, ProjectId } from "@/types";

export type ProjectDraft = Omit<Project, "id" | "order">;

interface ProjectStore {
  projects: Project[];
  hasLoaded: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (draft: ProjectDraft) => Promise<void>;
  updateProject: (id: ProjectId, patch: Partial<ProjectDraft & { order: number }>) => Promise<void>;
  deleteProject: (id: ProjectId) => Promise<{ ok: true } | { ok: false; error: string }>;
}

async function parseJsonOrThrow(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  hasLoaded: false,

  fetchProjects: async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const projects = (await response.json()) as Project[];
      set({ projects, hasLoaded: true });
    } catch {
      set({ hasLoaded: true });
    }
  },

  addProject: async (draft) => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const project = (await parseJsonOrThrow(response)) as Project;
    set((state) => ({ projects: [...state.projects, project] }));
  },

  updateProject: async (id, patch) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const project = (await parseJsonOrThrow(response)) as Project;
    set((state) => ({
      projects: state.projects.map((existing) =>
        existing.id === id ? project : existing,
      ),
    }));
  },

  deleteProject: async (id) => {
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      return { ok: false, error: body?.error ?? "unknown_error" };
    }
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    }));
    return { ok: true };
  },
}));
