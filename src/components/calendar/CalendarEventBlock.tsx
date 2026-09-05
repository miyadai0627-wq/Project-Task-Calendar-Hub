"use client";

import { useState } from "react";

import { useDraggable } from "@dnd-kit/core";

import {
  eventHeightPx,
  eventOffsetPx,
  minutesToTime,
  parseTimeToMinutes,
  snapMinutes,
} from "@/lib/calendar";
import { CALENDAR_END_HOUR, HOUR_HEIGHT_PX } from "@/lib/constants";
import { getProjectById } from "@/lib/mock-data";
import type { Project, Task } from "@/types";

const MIN_DURATION_MINUTES = 15;

export function CalendarEventBlock({
  task,
  projects,
  onToggleComplete,
  onSelect,
  onResize,
}: {
  task: Task;
  projects: Project[];
  onToggleComplete?: (id: string) => void;
  onSelect?: (task: Task) => void;
  onResize?: (id: string, endTime: string) => void;
}) {
  const [previewEndMinutes, setPreviewEndMinutes] = useState<number | null>(null);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `event-${task.id}`,
    data: { source: "event", task },
  });

  if (!task.startTime || !task.endTime) {
    return null;
  }

  const project = getProjectById(task.projectId, projects);
  const top = eventOffsetPx(task.startTime);
  const startMinutes = parseTimeToMinutes(task.startTime);
  const height =
    previewEndMinutes !== null
      ? Math.max(
          ((previewEndMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX,
          HOUR_HEIGHT_PX / 2,
        )
      : eventHeightPx(task.startTime, task.endTime);
  const displayEndTime =
    previewEndMinutes !== null ? minutesToTime(previewEndMinutes) : task.endTime;

  function handleResizeStart(event: React.PointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    const startY = event.clientY;
    const initialEndMinutes = parseTimeToMinutes(task.endTime!);

    function computeClampedMinutes(clientY: number): number {
      const deltaMinutes = ((clientY - startY) / HOUR_HEIGHT_PX) * 60;
      const next = snapMinutes(initialEndMinutes + deltaMinutes);
      return Math.min(
        Math.max(next, startMinutes + MIN_DURATION_MINUTES),
        CALENDAR_END_HOUR * 60,
      );
    }

    function handleMove(moveEvent: PointerEvent) {
      setPreviewEndMinutes(computeClampedMinutes(moveEvent.clientY));
    }

    function handleUp(upEvent: PointerEvent) {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      onResize?.(task.id, minutesToTime(computeClampedMinutes(upEvent.clientY)));
      setPreviewEndMinutes(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div
      ref={setNodeRef}
      className={`absolute inset-x-1 overflow-hidden rounded-md border border-white/40 px-2 py-1 text-white shadow-sm cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
      style={{
        top,
        height,
        backgroundColor: project?.color ?? "#64748B",
        zIndex: previewEndMinutes !== null ? 20 : undefined,
      }}
      onClick={() => onSelect?.(task)}
      {...listeners}
      {...attributes}
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
          onPointerDown={(event) => event.stopPropagation()}
          className="mt-0.5 h-3 w-3 accent-white"
          aria-label={`${task.title} を完了にする`}
        />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold leading-4">{task.title}</p>
          <p className="text-[10px] opacity-90">
            {task.startTime}–{displayEndTime}
          </p>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
        onPointerDown={handleResizeStart}
      />
    </div>
  );
}
