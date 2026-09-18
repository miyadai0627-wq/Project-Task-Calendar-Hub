"use client";

import { useEffect, useRef, useState } from "react";

import { useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";
import { Repeat } from "lucide-react";

import { CalendarEventBlock } from "@/components/calendar/CalendarEventBlock";
import {
  formatHourLabel,
  formatWeekday,
  gridHeightPx,
  hourLabels,
  isSameDateKey,
  toDateKey,
} from "@/lib/calendar";
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  HOUR_HEIGHT_PX,
  ROUTINE_TEMPLATES,
} from "@/lib/constants";
import type { Project, Task } from "@/types";

const scheduledStatuses = new Set(["scheduled", "in_progress"]);
const INITIAL_SCROLL_HOUR = 6;
const BOUNDARY_THRESHOLD_PX = 24;
const RESET_OFFSET_PX = 96;

function CurrentTimeIndicator() {
  const [minutesSinceMidnight, setMinutesSinceMidnight] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setMinutesSinceMidnight(now.getHours() * 60 + now.getMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (
    minutesSinceMidnight < CALENDAR_START_HOUR * 60 ||
    minutesSinceMidnight > CALENDAR_END_HOUR * 60
  ) {
    return null;
  }

  const top =
    ((minutesSinceMidnight - CALENDAR_START_HOUR * 60) / 60) * HOUR_HEIGHT_PX;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
      style={{ top }}
    >
      <div className="h-1.5 w-1.5 -translate-x-0.5 rounded-full bg-rose-500" />
      <div className="h-px flex-1 bg-rose-500" />
    </div>
  );
}

function CalendarDayColumn({
  dateKey,
  isToday,
  hours,
  dayTasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onResize,
}: {
  dateKey: string;
  isToday: boolean;
  hours: number[];
  dayTasks: Task[];
  projects: Project[];
  onToggleComplete?: (id: string) => void;
  onSelectTask?: (task: Task) => void;
  onResize?: (id: string, endTime: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateKey}`,
    data: { dateKey },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative border-r border-zinc-200 last:border-r-0 ${
        isToday ? "bg-indigo-50/50" : ""
      } ${isOver ? "bg-indigo-100/60" : ""}`}
    >
      {hours.map((hour) => (
        <div
          key={`${dateKey}-${hour}`}
          className="border-b border-zinc-100"
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
          onResize={onResize}
        />
      ))}
      {isToday ? <CurrentTimeIndicator /> : null}
    </div>
  );
}

export function VerticalCalendar({
  days,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onResize,
  onApplyTemplate,
  onBoundaryScroll,
}: {
  days: Date[];
  tasks: Task[];
  projects: Project[];
  onToggleComplete?: (id: string) => void;
  onSelectTask?: (task: Task) => void;
  onResize?: (id: string, endTime: string) => void;
  onApplyTemplate?: (
    dateKey: string,
    template: (typeof ROUTINE_TEMPLATES)[number],
  ) => void;
  onBoundaryScroll?: (direction: "prev" | "next") => void;
}) {
  const hours = hourLabels();
  const todayKey = toDateKey(new Date());
  const [openTemplateFor, setOpenTemplateFor] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isShiftingRef = useRef(false);
  const shiftDirectionRef = useRef<"prev" | "next" | null>(null);
  const minColumnWidth = days.length > 1 ? "4.5rem" : "0px";
  const gridTemplateColumns = `3.5rem repeat(${days.length}, minmax(${minColumnWidth}, 1fr))`;
  const isSingleDay = days.length === 1;
  const dayKey = days[0] ? toDateKey(days[0]) : "";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        (INITIAL_SCROLL_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX;
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!isShiftingRef.current || !el) {
      return;
    }
    if (shiftDirectionRef.current === "prev") {
      el.scrollTop = el.scrollHeight - el.clientHeight - RESET_OFFSET_PX;
    } else if (shiftDirectionRef.current === "next") {
      el.scrollTop = RESET_OFFSET_PX;
    }
    isShiftingRef.current = false;
    shiftDirectionRef.current = null;
  }, [dayKey]);

  function handleScroll() {
    if (!isSingleDay || !onBoundaryScroll || isShiftingRef.current) {
      return;
    }
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    if (el.scrollTop <= BOUNDARY_THRESHOLD_PX) {
      isShiftingRef.current = true;
      shiftDirectionRef.current = "prev";
      onBoundaryScroll("prev");
    } else if (
      el.scrollTop + el.clientHeight >=
      el.scrollHeight - BOUNDARY_THRESHOLD_PX
    ) {
      isShiftingRef.current = true;
      shiftDirectionRef.current = "next";
      onBoundaryScroll("next");
    }
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      {openTemplateFor ? (
        <button
          type="button"
          aria-label="閉じる"
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setOpenTemplateFor(null)}
        />
      ) : null}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-auto"
      >
        <div style={{ minWidth: days.length > 1 ? "32rem" : undefined }}>
          <div
            className="sticky top-0 z-20 grid border-b border-zinc-200 bg-white"
            style={{ gridTemplateColumns }}
          >
            <div className="border-r border-zinc-200" />
            {days.map((day) => {
              const dateKey = toDateKey(day);
              const isToday = dateKey === todayKey;
              const isTemplateOpen = openTemplateFor === dateKey;
              return (
                <div
                  key={dateKey}
                  className={`relative border-r border-zinc-200 px-2 py-2 last:border-r-0 ${
                    isToday ? "bg-indigo-50" : ""
                  } ${isTemplateOpen ? "z-30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500">
                        {formatWeekday(day)}
                      </p>
                      <p
                        className={`font-display text-sm font-semibold tabular-nums ${
                          isToday ? "text-indigo-700" : "text-zinc-900"
                        }`}
                      >
                        {format(day, "d")}
                      </p>
                    </div>
                    {onApplyTemplate ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenTemplateFor((current) =>
                            current === dateKey ? null : dateKey,
                          )
                        }
                        className="mt-0.5 rounded-md p-0.5 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label="定型枠を追加"
                      >
                        <Repeat className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  {isTemplateOpen ? (
                    <div className="absolute right-1 top-full z-30 mt-1 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
                      {ROUTINE_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => {
                            onApplyTemplate?.(dateKey, template);
                            setOpenTemplateFor(null);
                          }}
                          className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-indigo-50"
                        >
                          <span className="block font-medium">{template.title}</span>
                          <span className="text-zinc-400 tabular-nums">
                            {template.startTime}–{template.endTime}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="grid" style={{ gridTemplateColumns, height: gridHeightPx() }}>
            <div className="relative border-r border-zinc-200">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-1 pt-0.5 text-[10px] tabular-nums text-zinc-400"
                  style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX }}
                >
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>
            {days.map((day) => {
              const dateKey = toDateKey(day);
              const dayTasks = tasks.filter(
                (task) =>
                  task.scheduledDate === dateKey &&
                  scheduledStatuses.has(task.status) &&
                  Boolean(task.startTime && task.endTime),
              );
              return (
                <CalendarDayColumn
                  key={dateKey}
                  dateKey={dateKey}
                  isToday={isSameDateKey(day, todayKey)}
                  hours={hours}
                  dayTasks={dayTasks}
                  projects={projects}
                  onToggleComplete={onToggleComplete}
                  onSelectTask={onSelectTask}
                  onResize={onResize}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
