"use client";

import { Inbox, X } from "lucide-react";

import { TaskCard } from "@/components/todo/TaskCard";
import { TODO_TRAY_TABS, type TodoTrayTabId } from "@/lib/constants";
import { getProjectById } from "@/lib/mock-data";
import type { Project, Task, TaskStatus } from "@/types";

export function TodoTray({
  tasks,
  projects,
  activeTab,
  onTabChange,
  onSelectTask,
  isOpen = false,
  onClose,
}: {
  tasks: Task[];
  projects: Project[];
  activeTab: TodoTrayTabId;
  onTabChange: (tab: TodoTrayTabId) => void;
  onSelectTask?: (task: Task) => void;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const visibleStatuses = TODO_TRAY_TABS.find((tab) => tab.id === activeTab)
    ?.statuses as readonly TaskStatus[] | undefined;
  const visibleTasks = tasks.filter(
    (task) => visibleStatuses?.includes(task.status),
  );

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="閉じる"
          className="absolute inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`absolute inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-slate-50 shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:h-full lg:w-80 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">TODOトレイ</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              日程未確定のタスクをここに置きます
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 lg:hidden"
              aria-label="TODOトレイを閉じる"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="flex gap-1 border-b border-slate-200 px-2 py-2">
          {TODO_TRAY_TABS.map((tab) => {
            const selected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  selected
                    ? "bg-white text-sky-700 shadow-sm ring-1 ring-sky-200"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-10 text-center">
              <Inbox className="h-5 w-5 text-slate-400" aria-hidden />
              <p className="text-xs text-slate-500">このタブにタスクはありません</p>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                project={getProjectById(task.projectId, projects)}
                onSelect={onSelectTask}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}
