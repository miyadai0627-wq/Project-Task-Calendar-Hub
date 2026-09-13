"use client";

import { create } from "zustand";

import type { Milestone, MilestoneId } from "@/types";

export type MilestoneDraft = Omit<Milestone, "id">;

interface MilestoneStore {
  milestones: Milestone[];
  hasLoaded: boolean;
  fetchMilestones: () => Promise<void>;
  addMilestone: (draft: MilestoneDraft) => Promise<void>;
  updateMilestone: (id: MilestoneId, patch: Partial<MilestoneDraft>) => Promise<void>;
  deleteMilestone: (id: MilestoneId) => Promise<void>;
}

async function parseJsonOrThrow(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export const useMilestoneStore = create<MilestoneStore>((set) => ({
  milestones: [],
  hasLoaded: false,

  fetchMilestones: async () => {
    try {
      const response = await fetch("/api/milestones");
      const milestones = (await parseJsonOrThrow(response)) as Milestone[];
      set({ milestones, hasLoaded: true });
    } catch {
      set({ hasLoaded: true });
    }
  },

  addMilestone: async (draft) => {
    const response = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const milestone = (await parseJsonOrThrow(response)) as Milestone;
    set((state) => ({ milestones: [...state.milestones, milestone] }));
  },

  updateMilestone: async (id, patch) => {
    const response = await fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const milestone = (await parseJsonOrThrow(response)) as Milestone;
    set((state) => ({
      milestones: state.milestones.map((existing) =>
        existing.id === id ? milestone : existing,
      ),
    }));
  },

  deleteMilestone: async (id) => {
    await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    set((state) => ({
      milestones: state.milestones.filter((milestone) => milestone.id !== id),
    }));
  },
}));
