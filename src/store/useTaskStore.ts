"use client";

import { create } from "zustand";

import { mockTasks } from "@/lib/mock-data";
import type { Task, TaskId } from "@/types";

export type TaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">;

interface TaskStore {
  tasks: Task[];
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: TaskId, patch: Partial<TaskDraft>) => void;
  deleteTask: (id: TaskId) => void;
  toggleCompletion: (id: TaskId) => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: mockTasks,

  addTask: (draft) =>
    set((state) => {
      const timestamp = nowIso();
      const task: Task = {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: draft.status === "completed" ? timestamp : undefined,
      };
      return { tasks: [...state.tasks, task] };
    }),

  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }
        const nextStatus = patch.status ?? task.status;
        const becomingCompleted = nextStatus === "completed";
        const wasCompleted = task.status === "completed";
        return {
          ...task,
          ...patch,
          status: nextStatus,
          updatedAt: nowIso(),
          completedAt: becomingCompleted
            ? (wasCompleted ? task.completedAt : nowIso())
            : undefined,
        };
      }),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  toggleCompletion: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }
        if (task.status === "completed") {
          return {
            ...task,
            status: "scheduled",
            completedAt: undefined,
            updatedAt: nowIso(),
          };
        }
        return {
          ...task,
          status: "completed",
          completedAt: nowIso(),
          updatedAt: nowIso(),
        };
      }),
    })),
}));
