import { useDraggable } from "@dnd-kit/core";
import { Clock } from "lucide-react";

import { PriorityBadge } from "@/components/todo/PriorityBadge";
import type { Project, Task } from "@/types";

function formatMinutes(minutes?: number): string | null {
  if (!minutes) {
    return null;
  }
  if (minutes < 60) {
    return `${minutes}分`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}時間` : `${hours}時間${rest}分`;
}

export function TaskCard({
  task,
  project,
  onSelect,
}: {
  task: Task;
  project?: Project;
  onSelect?: (task: Task) => void;
}) {
  const estimate = formatMinutes(task.estimatedMinutes);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tray-${task.id}`,
    data: { source: "tray", task },
  });

  return (
    <article
      ref={setNodeRef}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing transition-colors hover:border-sky-300 hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      }`}
      onClick={() => onSelect?.(task)}
      onKeyDown={(event) => {
        if (onSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect(task);
        }
      }}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: project?.color ?? "#94A3B8" }}
              aria-hidden
            />
            <p className="truncate text-[11px] font-medium text-slate-500">
              {project?.name ?? "未分類"}
            </p>
          </div>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">{task.title}</h3>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        {estimate ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {estimate}
          </span>
        ) : null}
        {task.dueDate ? <span>期限 {task.dueDate}</span> : null}
      </div>
    </article>
  );
}
