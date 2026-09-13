"use client";

import { useEffect, useState } from "react";

import type { MilestoneDraft } from "@/store/useMilestoneStore";
import type { Milestone, MilestoneStatus, Project } from "@/types";

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: "予定",
  in_progress: "進行中",
  completed: "完了",
};

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300";
const labelClass = "text-xs font-medium text-slate-600";

export function MilestoneFormDialog({
  mode,
  milestone,
  projects,
  defaultProjectId,
  onClose,
  onSubmit,
  onDelete,
}: {
  mode: "create" | "edit";
  milestone?: Milestone;
  projects: Project[];
  defaultProjectId?: string;
  onClose: () => void;
  onSubmit: (draft: MilestoneDraft) => void;
  onDelete?: (id: string) => void;
}) {
  const [title, setTitle] = useState(milestone?.title ?? "");
  const [projectId, setProjectId] = useState(
    milestone?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "",
  );
  const [startDate, setStartDate] = useState(milestone?.startDate ?? "");
  const [endDate, setEndDate] = useState(milestone?.endDate ?? "");
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status ?? "planned");
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

    if (title.trim() === "") {
      setError("タイトルを入力してください");
      return;
    }
    if (!projectId) {
      setError("プロジェクトを選択してください");
      return;
    }
    if (!startDate || !endDate) {
      setError("開始日・終了日を入力してください");
      return;
    }
    if (startDate > endDate) {
      setError("終了日は開始日以降の日付にしてください");
      return;
    }

    onSubmit({
      projectId,
      title: title.trim(),
      startDate,
      endDate,
      status,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-slate-900">
          {mode === "create" ? "新規マイルストーン" : "マイルストーンを編集"}
        </h2>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className={labelClass} htmlFor="milestone-title">
              タイトル
            </label>
            <input
              id="milestone-title"
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="milestone-project">
              プロジェクト
            </label>
            <select
              id="milestone-project"
              className={inputClass}
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass} htmlFor="milestone-start">
                開始日
              </label>
              <input
                id="milestone-start"
                type="date"
                className={inputClass}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass} htmlFor="milestone-end">
                終了日
              </label>
              <input
                id="milestone-end"
                type="date"
                className={inputClass}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="milestone-status">
              ステータス
            </label>
            <select
              id="milestone-status"
              className={inputClass}
              value={status}
              onChange={(event) => setStatus(event.target.value as MilestoneStatus)}
            >
              {(Object.keys(STATUS_LABELS) as MilestoneStatus[]).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="text-xs text-rose-600">{error}</p> : null}

          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              {mode === "edit" && milestone && onDelete ? (
                confirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">削除しますか？</span>
                    <button
                      type="button"
                      className="h-8 rounded-lg bg-rose-500 px-2 text-xs font-medium text-white hover:bg-rose-600"
                      onClick={() => onDelete(milestone.id)}
                    >
                      削除する
                    </button>
                    <button
                      type="button"
                      className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600"
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
                className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-sky-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="h-8 rounded-lg bg-sky-500 px-3 text-xs font-medium text-white hover:bg-sky-600"
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
