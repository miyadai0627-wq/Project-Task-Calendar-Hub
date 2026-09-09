"use client";

import { create } from "zustand";

import type { Task, TaskId } from "@/types";

export type TaskDraft = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "completedAt" | "googleEventId"
>;

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  hasLoaded: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<void>;
  updateTask: (id: TaskId, patch: Partial<TaskDraft & { googleEventId?: string }>) => Promise<void>;
  deleteTask: (id: TaskId) => Promise<void>;
  toggleCompletion: (id: TaskId) => Promise<void>;
}

async function parseJsonOrThrow(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  hasLoaded: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/tasks");
      const tasks = (await parseJsonOrThrow(response)) as Task[];
      set({ tasks, isLoading: false, hasLoaded: true });
    } catch {
      set({ isLoading: false, hasLoaded: true });
    }
  },

  addTask: async (draft) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const task = (await parseJsonOrThrow(response)) as Task;
    set((state) => ({ tasks: [...state.tasks, task] }));
  },

  updateTask: async (id, patch) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const task = (await parseJsonOrThrow(response)) as Task;
    set((state) => ({
      tasks: state.tasks.map((existing) => (existing.id === id ? task : existing)),
    }));
  },

  deleteTask: async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },

  toggleCompletion: async (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }
    const nextStatus = task.status === "completed" ? "scheduled" : "completed";
    await get().updateTask(id, { status: nextStatus });
  },
}));
