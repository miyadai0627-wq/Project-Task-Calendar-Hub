"use client";

import { useEffect, useState } from "react";

import type { TaskDraft } from "@/store/useTaskStore";
import type { Project, Task, TaskPriority, TaskStatus } from "@/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  scheduled: "スケジュール済み",
  in_progress: "進行中",
  completed: "完了",
  archived: "アーカイブ",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const SCHEDULE_STATUSES = new Set<TaskStatus>(["scheduled", "in_progress"]);

const inputClass =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300";
const labelClass = "text-xs font-medium text-slate-600";

function toNumberOrUndefined(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function TaskFormDialog({
  mode,
  task,
  projects,
  defaultProjectId,
  onClose,
  onSubmit,
  onDelete,
}: {
  mode: "create" | "edit";
  task?: Task;
  projects: Project[];
  defaultProjectId?: string;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
  onDelete?: (id: string) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState(
    task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "",
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "backlog");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    task?.estimatedMinutes?.toString() ?? "",
  );
  const [actualMinutes, setActualMinutes] = useState(
    task?.actualMinutes?.toString() ?? "",
  );
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [scheduledDate, setScheduledDate] = useState(task?.scheduledDate ?? "");
  const [startTime, setStartTime] = useState(task?.startTime ?? "");
  const [endTime, setEndTime] = useState(task?.endTime ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const needsSchedule = SCHEDULE_STATUSES.has(status);

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
    if (needsSchedule && (!scheduledDate || !startTime || !endTime)) {
      setError("このステータスには日付・開始時刻・終了時刻が必要です");
      return;
    }

    onSubmit({
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      estimatedMinutes: toNumberOrUndefined(estimatedMinutes),
      actualMinutes: toNumberOrUndefined(actualMinutes),
      dueDate: dueDate || undefined,
      scheduledDate: needsSchedule ? scheduledDate : undefined,
      startTime: needsSchedule ? startTime : undefined,
      endTime: needsSchedule ? endTime : undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-slate-900">
          {mode === "create" ? "新規タスク" : "タスクを編集"}
        </h2>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className={labelClass} htmlFor="task-title">
              タイトル
            </label>
            <input
              id="task-title"
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="task-description">
              説明
            </label>
            <textarea
              id="task-description"
              className={`${inputClass} h-16 resize-none py-1.5`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass} htmlFor="task-project">
                プロジェクト
              </label>
              <select
                id="task-project"
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
            <div className="space-y-1">
              <label className={labelClass} htmlFor="task-priority">
                優先度
              </label>
              <select
                id="task-priority"
                className={inputClass}
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
              >
                {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="task-status">
              ステータス
            </label>
            <select
              id="task-status"
              className={inputClass}
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass} htmlFor="task-estimate">
                見積もり時間 (分)
              </label>
              <input
                id="task-estimate"
                type="number"
                min={0}
                className={inputClass}
                value={estimatedMinutes}
                onChange={(event) => setEstimatedMinutes(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass} htmlFor="task-actual">
                実績時間 (分)
              </label>
              <input
                id="task-actual"
                type="number"
                min={0}
                className={inputClass}
                value={actualMinutes}
                onChange={(event) => setActualMinutes(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="task-due">
              締め切り日
            </label>
            <input
              id="task-due"
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          {needsSchedule ? (
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="space-y-1">
                <label className={labelClass} htmlFor="task-scheduled-date">
                  配置日
                </label>
                <input
                  id="task-scheduled-date"
                  type="date"
                  className={inputClass}
                  value={scheduledDate}
                  onChange={(event) => setScheduledDate(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass} htmlFor="task-start">
                    開始時刻
                  </label>
                  <input
                    id="task-start"
                    type="time"
                    className={inputClass}
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass} htmlFor="task-end">
                    終了時刻
                  </label>
                  <input
                    id="task-end"
                    type="time"
                    className={inputClass}
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {error ? <p className="text-xs text-rose-600">{error}</p> : null}

          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              {mode === "edit" && task && onDelete ? (
                confirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">削除しますか？</span>
                    <button
                      type="button"
                      className="h-8 rounded-md bg-rose-600 px-2 text-xs font-medium text-white"
                      onClick={() => onDelete(task.id)}
                    >
                      削除する
                    </button>
                    <button
                      type="button"
                      className="h-8 rounded-md border border-slate-200 px-2 text-xs text-slate-600"
                      onClick={() => setConfirmingDelete(false)}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="h-8 rounded-md border border-rose-200 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50"
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
                className="h-8 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="h-8 rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800"
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
