"use client";

import { create } from "zustand";

import type { Project } from "@/types";

interface ProjectStore {
  projects: Project[];
  hasLoaded: boolean;
  fetchProjects: () => Promise<void>;
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
}));
