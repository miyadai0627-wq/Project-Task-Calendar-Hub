"use client";

import { useEffect, useState } from "react";

import type { ProjectDraft } from "@/store/useProjectStore";
import type { Project, ProjectStatus } from "@/types";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "有効",
  archived: "アーカイブ",
};

const COLOR_PRESETS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#71717A",
];

const inputClass =
  "h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-300";
const labelClass = "text-xs font-medium text-zinc-600";

export function ProjectFormDialog({
  mode,
  project,
  onClose,
  onSubmit,
  onDelete,
  deleteError,
}: {
  mode: "create" | "edit";
  project?: Project;
  onClose: () => void;
  onSubmit: (draft: ProjectDraft) => void;
  onDelete?: (id: string) => void;
  deleteError?: string | null;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(project?.color ?? COLOR_PRESETS[0]);
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim() === "") {
      setError("プロジェクト名を入力してください");
      return;
    }

    onSubmit({ name: name.trim(), color, status });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-display text-sm font-semibold text-zinc-900">
          {mode === "create" ? "新規プロジェクト" : "プロジェクトを編集"}
        </h2>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className={labelClass} htmlFor="project-name">
              プロジェクト名
            </label>
            <input
              id="project-name"
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <span className={labelClass}>カラー</span>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={`h-7 w-7 rounded-full ring-offset-2 transition-shadow ${
                    color.toLowerCase() === preset.toLowerCase()
                      ? "ring-2 ring-indigo-500"
                      : ""
                  }`}
                  style={{ backgroundColor: preset }}
                  aria-label={preset}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-7 w-9 cursor-pointer rounded border border-zinc-200 bg-white p-0.5"
                aria-label="カスタムカラー"
              />
            </div>
          </div>

          {mode === "edit" ? (
            <div className="space-y-1">
              <label className={labelClass} htmlFor="project-status">
                ステータス
              </label>
              <select
                id="project-status"
                className={inputClass}
                value={status}
                onChange={(event) => setStatus(event.target.value as ProjectStatus)}
              >
                {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          {deleteError ? <p className="text-xs text-rose-600">{deleteError}</p> : null}

          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              {mode === "edit" && project && onDelete ? (
                confirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">削除しますか？</span>
                    <button
                      type="button"
                      className="h-8 rounded-lg bg-rose-500 px-2 text-xs font-medium text-white hover:bg-rose-600"
                      onClick={() => onDelete(project.id)}
                    >
                      削除する
                    </button>
                    <button
                      type="button"
                      className="h-8 rounded-lg border border-zinc-200 px-2 text-xs text-zinc-600"
                      onClick={() => setConfirmingDelete(false)}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="h-8 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    削除
                  </button>
                )
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-8 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-600 hover:bg-indigo-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="h-8 rounded-lg bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700"
              >
                {mode === "create" ? "作成" : "保存"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
