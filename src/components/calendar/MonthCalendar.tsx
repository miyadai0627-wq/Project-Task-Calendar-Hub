"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";

import { formatWeekday, isInAnchorMonth, toDateKey } from "@/lib/calendar";
import { getProjectById } from "@/lib/mock-data";
import type { Project, Task } from "@/types";

const scheduledStatuses = new Set(["scheduled", "in_progress"]);
const MAX_VISIBLE_CHIPS = 3;

function MonthEventChip({
  task,
  projects,
  onSelect,
}: {
  task: Task;
  projects: Project[];
  onSelect?: (task: Task) => void;
}) {
  const project = getProjectById(task.projectId, projects);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `event-${task.id}`,
    data: { source: "event", task },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onSelect?.(task)}
      className={`flex w-full items-center gap-1 truncate rounded-md px-1 py-0.5 text-left text-[10px] font-medium text-white cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
      style={{ backgroundColor: project?.color ?? "#64748B" }}
      {...listeners}
      {...attributes}
    >
      {task.startTime ? (
        <span className="opacity-80">{task.startTime}</span>
      ) : null}
      <span className="truncate">{task.title}</span>
    </button>
  );
}

function MonthDayCell({
  day,
  anchorDate,
  dayTasks,
  projects,
  onSelectTask,
  onSelectDay,
}: {
  day: Date;
  anchorDate: Date;
  dayTasks: Task[];
  projects: Project[];
  onSelectTask?: (task: Task) => void;
  onSelectDay?: (date: Date) => void;
}) {
  const dateKey = toDateKey(day);
  const todayKey = toDateKey(new Date());
  const isToday = dateKey === todayKey;
  const inMonth = isInAnchorMonth(day, anchorDate);
  const { setNodeRef, isOver } = useDroppable({
    id: `month-day-${dateKey}`,
    data: { dateKey, isMonthCell: true },
  });

  const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = dayTasks.length - visibleTasks.length;

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-0 flex-col gap-1 border-b border-r border-slate-100 p-1.5 last:border-r-0 ${
        inMonth ? "bg-white" : "bg-slate-50"
      } ${isOver ? "bg-sky-100/60" : ""}`}
    >
      <button
        type="button"
        onClick={() => onSelectDay?.(day)}
        className={`self-start rounded-md px-1 text-xs font-semibold hover:bg-sky-50 ${
          isToday
            ? "bg-sky-500 text-white hover:bg-sky-500"
            : inMonth
              ? "text-slate-900"
              : "text-slate-300"
        }`}
      >
        {format(day, "d")}
      </button>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
        {visibleTasks.map((task) => (
          <MonthEventChip
            key={task.id}
            task={task}
            projects={projects}
            onSelect={onSelectTask}
          />
        ))}
        {hiddenCount > 0 ? (
          <p className="px-1 text-[10px] text-slate-400">他{hiddenCount}件</p>
        ) : null}
      </div>
    </div>
  );
}

export function MonthCalendar({
  days,
  anchorDate,
  tasks,
  projects,
  onSelectTask,
  onSelectDay,
}: {
  days: Date[];
  anchorDate: Date;
  tasks: Task[];
  projects: Project[];
  onSelectTask?: (task: Task) => void;
  onSelectDay?: (date: Date) => void;
}) {
  const weekdayLabels = days.slice(0, 7).map((day) => formatWeekday(day));

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {weekdayLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="border-r border-slate-100 px-2 py-1.5 text-center text-[11px] font-medium text-slate-500 last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>
      <div
        className="grid min-h-0 flex-1 grid-cols-7"
        style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const dayTasks = tasks
            .filter(
              (task) =>
                task.scheduledDate === dateKey &&
                scheduledStatuses.has(task.status) &&
                Boolean(task.startTime),
            )
            .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
          return (
            <MonthDayCell
              key={dateKey}
              day={day}
              anchorDate={anchorDate}
              dayTasks={dayTasks}
              projects={projects}
              onSelectTask={onSelectTask}
              onSelectDay={onSelectDay}
            />
          );
        })}
      </div>
    </section>
  );
}
