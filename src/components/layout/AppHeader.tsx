"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { formatWeekRange } from "@/lib/calendar";
import type { Project } from "@/types";

export function AppHeader({
  projects,
  selectedProjectId,
  onProjectChange,
  weekDays,
  onPrevWeek,
  onThisWeek,
  onNextWeek,
  onNewTask,
}: {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  weekDays: Date[];
  onPrevWeek: () => void;
  onThisWeek: () => void;
  onNextWeek: () => void;
  onNewTask: () => void;
}) {
  const activeProjects = projects.filter((project) => project.status === "active");

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
          Project Task & Calendar Hub
        </p>
        <label className="sr-only" htmlFor="project-filter">
          プロジェクト絞り込み
        </label>
        <select
          id="project-filter"
          value={selectedProjectId}
          onChange={(event) => onProjectChange(event.target.value)}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700"
        >
          <option value="all">すべてのプロジェクト</option>
          {activeProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md border border-slate-200">
          <button
            type="button"
            onClick={onPrevWeek}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50"
            aria-label="前週"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onThisWeek}
            className="h-8 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            今週
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50"
            aria-label="翌週"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="hidden text-sm text-slate-600 md:block">{formatWeekRange(weekDays)}</p>
        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex h-8 items-center gap-1 rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          新規タスク
        </button>
      </div>
    </header>
  );
}
