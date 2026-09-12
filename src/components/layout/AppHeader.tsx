"use client";

import { ChevronLeft, ChevronRight, ListTodo, Plus } from "lucide-react";

import { GoogleConnectButton } from "@/components/auth/GoogleConnectButton";
import { CALENDAR_VIEW_MODES, type CalendarViewMode } from "@/lib/constants";
import type { Project } from "@/types";

export function AppHeader({
  projects,
  selectedProjectId,
  onProjectChange,
  dateRangeLabel,
  onPrev,
  onToday,
  onNext,
  todayLabel,
  onNewTask,
  viewMode,
  onViewModeChange,
  calendarView,
  onCalendarViewChange,
  onToggleTray,
}: {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  dateRangeLabel: string;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  todayLabel: string;
  onNewTask: () => void;
  viewMode: "calendar" | "timeline";
  onViewModeChange: (mode: "calendar" | "timeline") => void;
  calendarView: CalendarViewMode;
  onCalendarViewChange: (mode: CalendarViewMode) => void;
  onToggleTray?: () => void;
}) {
  const activeProjects = projects.filter((project) => project.status === "active");

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        {onToggleTray ? (
          <button
            type="button"
            onClick={onToggleTray}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-sky-50 lg:hidden"
            aria-label="TODOトレイを開く"
          >
            <ListTodo className="h-5 w-5" />
          </button>
        ) : null}
        <p className="hidden truncate text-sm font-semibold tracking-tight text-slate-900 sm:block">
          Project Task & Calendar Hub
        </p>
        <label className="sr-only" htmlFor="project-filter">
          プロジェクト絞り込み
        </label>
        <select
          id="project-filter"
          value={selectedProjectId}
          onChange={(event) => onProjectChange(event.target.value)}
          className="h-8 w-28 shrink rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 sm:w-auto sm:text-sm"
        >
          <option value="all">すべてのプロジェクト</option>
          {activeProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
        <div className="flex shrink-0 items-center whitespace-nowrap rounded-lg border border-slate-200 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("calendar")}
            className={`h-7 rounded-md px-3 text-xs font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-sky-500 text-white"
                : "text-slate-600 hover:bg-sky-50"
            }`}
          >
            カレンダー
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("timeline")}
            className={`h-7 rounded-md px-3 text-xs font-medium transition-colors ${
              viewMode === "timeline"
                ? "bg-sky-500 text-white"
                : "text-slate-600 hover:bg-sky-50"
            }`}
          >
            タイムライン
          </button>
        </div>
        {viewMode === "calendar" ? (
          <div className="flex shrink-0 items-center whitespace-nowrap rounded-lg border border-slate-200 p-0.5">
            {CALENDAR_VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onCalendarViewChange(mode.id)}
                className={`h-7 rounded-md px-2.5 text-xs font-medium transition-colors ${
                  calendarView === mode.id
                    ? "bg-sky-500 text-white"
                    : "text-slate-600 hover:bg-sky-50"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        ) : null}
        {viewMode === "calendar" ? (
          <>
            <div className="flex shrink-0 items-center whitespace-nowrap rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-sky-50"
                aria-label="前へ"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onToday}
                className="h-7 rounded-md px-3 text-xs font-medium text-slate-700 hover:bg-sky-50"
              >
                {todayLabel}
              </button>
              <button
                type="button"
                onClick={onNext}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-sky-50"
                aria-label="次へ"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="hidden whitespace-nowrap text-sm text-slate-600 xl:block">
              {dateRangeLabel}
            </p>
          </>
        ) : null}
        <GoogleConnectButton />
        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-sky-500 px-3 text-sm font-medium text-white transition-colors hover:bg-sky-600"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">新規タスク</span>
        </button>
      </div>
    </header>
  );
}
