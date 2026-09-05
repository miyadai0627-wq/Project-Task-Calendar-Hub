import { format } from "date-fns";

import { CalendarEventBlock } from "@/components/calendar/CalendarEventBlock";
import {
  formatHourLabel,
  formatWeekday,
  gridHeightPx,
  hourLabels,
  isSameDateKey,
  toDateKey,
} from "@/lib/calendar";
import { CALENDAR_START_HOUR, HOUR_HEIGHT_PX } from "@/lib/constants";
import type { Project, Task } from "@/types";

const scheduledStatuses = new Set(["scheduled", "in_progress"]);

export function WeekCalendar({
  weekDays,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
}: {
  weekDays: Date[];
  tasks: Task[];
  projects: Project[];
  onToggleComplete?: (id: string) => void;
  onSelectTask?: (task: Task) => void;
}) {
  const hours = hourLabels();
  const todayKey = toDateKey(new Date());

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] border-b border-slate-200">
        <div className="border-r border-slate-200" />
        {weekDays.map((day) => {
          const dateKey = toDateKey(day);
          const isToday = dateKey === todayKey;
          return (
            <div
              key={dateKey}
              className={`border-r border-slate-200 px-2 py-2 last:border-r-0 ${
                isToday ? "bg-blue-50" : ""
              }`}
            >
              <p className="text-[11px] font-medium text-slate-500">
                {formatWeekday(day)}
              </p>
              <p
                className={`text-sm font-semibold ${
                  isToday ? "text-blue-700" : "text-slate-900"
                }`}
              >
                {format(day, "d")}
              </p>
            </div>
          );
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]"
          style={{ height: gridHeightPx() }}
        >
          <div className="relative border-r border-slate-200">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 pt-0.5 text-[10px] text-slate-400"
                style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>
          {weekDays.map((day) => {
            const dateKey = toDateKey(day);
            const dayTasks = tasks.filter(
              (task) =>
                task.scheduledDate === dateKey &&
                scheduledStatuses.has(task.status) &&
                Boolean(task.startTime && task.endTime),
            );
            return (
              <div
                key={dateKey}
                className={`relative border-r border-slate-200 last:border-r-0 ${
                  isSameDateKey(day, todayKey) ? "bg-blue-50/40" : ""
                }`}
              >
                {hours.map((hour) => (
                  <div
                    key={`${dateKey}-${hour}`}
                    className="border-b border-slate-100"
                    style={{ height: HOUR_HEIGHT_PX }}
                  />
                ))}
                {dayTasks.map((task) => (
                  <CalendarEventBlock
                    key={task.id}
                    task={task}
                    projects={projects}
                    onToggleComplete={onToggleComplete}
                    onSelect={onSelectTask}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
