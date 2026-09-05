import { getProjectById } from "@/lib/mock-data";
import { eventHeightPx, eventOffsetPx } from "@/lib/calendar";
import type { Project, Task } from "@/types";

export function CalendarEventBlock({
  task,
  projects,
  onToggleComplete,
  onSelect,
}: {
  task: Task;
  projects: Project[];
  onToggleComplete?: (id: string) => void;
  onSelect?: (task: Task) => void;
}) {
  if (!task.startTime || !task.endTime) {
    return null;
  }

  const project = getProjectById(task.projectId, projects);
  const top = eventOffsetPx(task.startTime);
  const height = eventHeightPx(task.startTime, task.endTime);

  return (
    <div
      className="absolute inset-x-1 overflow-hidden rounded-md border border-white/40 px-2 py-1 text-white shadow-sm cursor-pointer"
      style={{
        top,
        height,
        backgroundColor: project?.color ?? "#64748B",
      }}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(task)}
    >
      <div className="flex items-start gap-1.5">
        <input
          type="checkbox"
          checked={task.status === "completed"}
          onChange={(event) => {
            event.stopPropagation();
            onToggleComplete?.(task.id);
          }}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 h-3 w-3 accent-white"
          aria-label={`${task.title} を完了にする`}
        />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold leading-4">{task.title}</p>
          <p className="text-[10px] opacity-90">
            {task.startTime}–{task.endTime}
          </p>
        </div>
      </div>
    </div>
  );
}
