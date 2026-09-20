"use client";

import { useEffect } from "react";
import { Pencil, Plus } from "lucide-react";

import type { Project } from "@/types";

const STATUS_LABELS: Record<Project["status"], string> = {
  active: "有効",
  archived: "アーカイブ",
};

export function ProjectManagerDialog({
  projects,
  onClose,
  onNew,
  onEdit,
}: {
  projects: Project[];
  onClose: () => void;
  onNew: () => void;
  onEdit: (project: Project) => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const sorted = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-zinc-900">
            プロジェクト管理
          </h2>
          <button
            type="button"
            onClick={onNew}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            新規プロジェクト
          </button>
        </div>

        <ul className="mt-4 space-y-1.5">
          {sorted.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="flex w-full items-center gap-2.5 rounded-lg border border-zinc-100 px-3 py-2 text-left hover:bg-indigo-50"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800">
                  {project.name}
                </span>
                {project.status === "archived" ? (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                    {STATUS_LABELS.archived}
                  </span>
                ) : null}
                <Pencil className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              </button>
            </li>
          ))}
          {sorted.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-zinc-400">
              プロジェクトがありません
            </li>
          ) : null}
        </ul>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-600 hover:bg-indigo-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
