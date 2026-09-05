import type { TaskPriority } from "@/types";

const labels: Record<TaskPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const classNames: Record<TaskPriority, string> = {
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${classNames[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}
