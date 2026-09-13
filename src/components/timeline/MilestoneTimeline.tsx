"use client";

import { Fragment, useRef, useState } from "react";

import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";

import {
  formatDateOnly,
  getMilestoneDateRange,
  parseDateOnly,
  timelineOffsetPercent,
  timelineTotalDays,
  timelineWeekMarkers,
  timelineWidthPercent,
} from "@/lib/timeline";
import type { Milestone, MilestoneId, MilestoneStatus, Project } from "@/types";

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: "予定",
  in_progress: "進行中",
  completed: "完了",
};

const LONG_PRESS_MS = 350;
const MOVE_CANCEL_PX = 8;
const ROW_HIGHLIGHT_CLASSES = ["bg-sky-50", "ring-2", "ring-inset", "ring-sky-300"];
const BAR_ACTIVE_CLASSES = ["shadow-lg", "ring-2", "ring-sky-400", "scale-105"];

type MoveDraft = {
  id: MilestoneId;
  projectId: string;
  startDate: string;
  endDate: string;
};

type DragState = {
  id: MilestoneId;
  pointerId: number;
  phase: "pending" | "active";
  startClientX: number;
  startClientY: number;
  timer: ReturnType<typeof setTimeout> | null;
  originProjectId: string;
  originStart: Date;
  originEnd: Date;
  rowWidth: number;
  totalDays: number;
  hoveredProjectId: string;
};

export function MilestoneTimeline({
  milestones,
  projects,
  onSelectMilestone,
  onMoveMilestone,
}: {
  milestones: Milestone[];
  projects: Project[];
  onSelectMilestone?: (milestone: Milestone) => void;
  onMoveMilestone?: (
    id: MilestoneId,
    patch: { projectId: string; startDate: string; endDate: string },
  ) => void | Promise<void>;
}) {
  const [pendingMove, setPendingMove] = useState<MoveDraft | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const barRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const suppressClickRef = useRef<MilestoneId | null>(null);

  const activeProjects = projects.filter((project) => project.status === "active");

  const visualMilestones = milestones.map((milestone) =>
    pendingMove && pendingMove.id === milestone.id
      ? {
          ...milestone,
          projectId: pendingMove.projectId,
          startDate: pendingMove.startDate,
          endDate: pendingMove.endDate,
        }
      : milestone,
  );
  const visibleMilestones = visualMilestones.filter((milestone) =>
    activeProjects.some((project) => project.id === milestone.projectId),
  );

  const { start, end } = getMilestoneDateRange(visibleMilestones);
  const totalDays = timelineTotalDays(start, end);
  const weekMarkers = timelineWeekMarkers(start, end);
  const todayOffset = timelineOffsetPercent(new Date(), start, totalDays);
  const showToday = todayOffset >= 0 && todayOffset <= 100;

  function clearRowHighlight(projectId: string | null) {
    if (!projectId) return;
    rowRefs.current.get(projectId)?.classList.remove(...ROW_HIGHLIGHT_CLASSES);
  }

  function resetBarVisual(id: string) {
    const el = barRefs.current.get(id);
    if (!el) return;
    el.style.transform = "";
    el.style.zIndex = "";
    el.classList.remove(...BAR_ACTIVE_CLASSES, "opacity-80", "cursor-grabbing");
  }

  function findHoveredProjectId(clientY: number): string {
    let closestId = "";
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const [projectId, el] of rowRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return projectId;
      }
      const distance =
        clientY < rect.top ? rect.top - clientY : clientY - rect.bottom;
      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = projectId;
      }
    }
    return closestId;
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    milestone: Milestone,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (dragRef.current) return;

    const rowEl = rowRefs.current.get(milestone.projectId);
    const barEl = barRefs.current.get(milestone.id);
    if (!rowEl || !barEl) return;

    barEl.classList.add("opacity-80");

    const state: DragState = {
      id: milestone.id,
      pointerId: event.pointerId,
      phase: "pending",
      startClientX: event.clientX,
      startClientY: event.clientY,
      timer: null,
      originProjectId: milestone.projectId,
      originStart: parseDateOnly(milestone.startDate),
      originEnd: parseDateOnly(milestone.endDate),
      rowWidth: rowEl.getBoundingClientRect().width,
      totalDays,
      hoveredProjectId: milestone.projectId,
    };

    state.timer = setTimeout(() => {
      if (dragRef.current !== state) return;
      state.phase = "active";
      try {
        barEl.setPointerCapture(state.pointerId);
      } catch {
        // pointer may already be released; ignore
      }
      barEl.classList.remove("opacity-80");
      barEl.classList.add(...BAR_ACTIVE_CLASSES, "cursor-grabbing");
      barEl.style.zIndex = "50";
      rowRefs.current.get(state.hoveredProjectId)?.classList.add(...ROW_HIGHLIGHT_CLASSES);
    }, LONG_PRESS_MS);

    dragRef.current = state;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.currentTarget.dataset.milestoneId) return;

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;

    if (drag.phase === "pending") {
      if (Math.hypot(deltaX, deltaY) > MOVE_CANCEL_PX) {
        if (drag.timer) clearTimeout(drag.timer);
        barRefs.current.get(drag.id)?.classList.remove("opacity-80");
        dragRef.current = null;
      }
      return;
    }

    event.preventDefault();
    const barEl = barRefs.current.get(drag.id);
    if (barEl) {
      barEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    const hovered = findHoveredProjectId(event.clientY);
    if (hovered && hovered !== drag.hoveredProjectId) {
      clearRowHighlight(drag.hoveredProjectId);
      drag.hoveredProjectId = hovered;
      rowRefs.current.get(hovered)?.classList.add(...ROW_HIGHLIGHT_CLASSES);
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (drag.timer) clearTimeout(drag.timer);

    if (drag.phase !== "active") {
      barRefs.current.get(drag.id)?.classList.remove("opacity-80");
      return;
    }

    const deltaX = event.clientX - drag.startClientX;
    resetBarVisual(drag.id);
    clearRowHighlight(drag.hoveredProjectId);
    suppressClickRef.current = drag.id;

    try {
      event.currentTarget.releasePointerCapture(drag.pointerId);
    } catch {
      // ignore
    }

    const pxPerDay = drag.rowWidth / drag.totalDays;
    const deltaDays = pxPerDay > 0 ? Math.round(deltaX / pxPerDay) : 0;
    const newStart = addDays(drag.originStart, deltaDays);
    const newEnd = addDays(drag.originEnd, deltaDays);
    const newProjectId = drag.hoveredProjectId || drag.originProjectId;

    const patch: MoveDraft = {
      id: drag.id,
      projectId: newProjectId,
      startDate: formatDateOnly(newStart),
      endDate: formatDateOnly(newEnd),
    };

    const original = milestones.find((milestone) => milestone.id === drag.id);
    const unchanged =
      original &&
      patch.projectId === original.projectId &&
      patch.startDate === original.startDate &&
      patch.endDate === original.endDate;

    if (unchanged) return;

    setPendingMove(patch);
    Promise.resolve(
      onMoveMilestone?.(patch.id, {
        projectId: patch.projectId,
        startDate: patch.startDate,
        endDate: patch.endDate,
      }),
    )
      .then(() => setPendingMove(null))
      .catch(() => setPendingMove(null));
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (drag.timer) clearTimeout(drag.timer);
    resetBarVisual(drag.id);
    clearRowHighlight(drag.hoveredProjectId);
    try {
      event.currentTarget.releasePointerCapture(drag.pointerId);
    } catch {
      // ignore
    }
  }

  if (activeProjects.length === 0) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-white text-sm text-slate-400">
        表示できるプロジェクトがありません
      </section>
    );
  }

  return (
    <section className="min-w-0 flex-1 overflow-auto bg-white">
      <div className="min-w-[720px] p-4">
        <div className="grid grid-cols-[10rem_1fr]">
          <div />
          <div className="relative h-8 border-b border-slate-200">
            {weekMarkers.map((date) => (
              <div
                key={date.toISOString()}
                className="absolute top-0 border-l border-slate-200 pl-1 text-[10px] text-slate-400"
                style={{ left: `${timelineOffsetPercent(date, start, totalDays)}%` }}
              >
                {format(date, "M/d", { locale: ja })}
              </div>
            ))}
            {showToday ? (
              <div
                className="absolute bottom-0 top-0 w-px bg-rose-500"
                style={{ left: `${todayOffset}%` }}
              />
            ) : null}
          </div>

          {activeProjects.map((project) => {
            const projectMilestones = visibleMilestones.filter(
              (milestone) => milestone.projectId === project.id,
            );
            return (
              <Fragment key={project.id}>
                <div className="flex items-center gap-1.5 border-b border-slate-100 pr-2 text-xs font-medium text-slate-600">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                    aria-hidden
                  />
                  <span className="truncate">{project.name}</span>
                </div>
                <div
                  ref={(el) => {
                    if (el) rowRefs.current.set(project.id, el);
                    else rowRefs.current.delete(project.id);
                  }}
                  className="relative h-14 border-b border-slate-100 transition-colors"
                >
                  {showToday ? (
                    <div
                      className="absolute bottom-0 top-0 w-px bg-rose-500/60"
                      style={{ left: `${todayOffset}%` }}
                    />
                  ) : null}
                  {projectMilestones.length === 0 ? (
                    <p className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-300">
                      マイルストーンなし
                    </p>
                  ) : (
                    projectMilestones.map((milestone) => {
                      const milestoneStart = parseDateOnly(milestone.startDate);
                      const milestoneEnd = parseDateOnly(milestone.endDate);
                      const left = timelineOffsetPercent(
                        milestoneStart,
                        start,
                        totalDays,
                      );
                      const width = timelineWidthPercent(
                        milestoneStart,
                        milestoneEnd,
                        totalDays,
                      );
                      const isPlanned = milestone.status === "planned";
                      return (
                        <button
                          key={milestone.id}
                          type="button"
                          data-milestone-id={milestone.id}
                          onClick={() => {
                            if (suppressClickRef.current === milestone.id) {
                              suppressClickRef.current = null;
                              return;
                            }
                            onSelectMilestone?.(milestone);
                          }}
                          onPointerDown={(event) => handlePointerDown(event, milestone)}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerCancel}
                          onContextMenu={(event) => event.preventDefault()}
                          ref={(el) => {
                            if (el) barRefs.current.set(milestone.id, el);
                            else barRefs.current.delete(milestone.id);
                          }}
                          className={`absolute top-1/2 flex h-6 -translate-y-1/2 touch-none select-none items-center overflow-hidden rounded-full px-2 text-[11px] font-medium shadow-sm transition-shadow hover:shadow-md ${
                            isPlanned ? "border-2 border-dashed" : "border border-white/50"
                          } ${milestone.status === "completed" ? "opacity-70" : ""} cursor-grab`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 4)}%`,
                            backgroundColor: isPlanned ? "transparent" : project.color,
                            borderColor: project.color,
                            color: isPlanned ? project.color : "white",
                            touchAction: "none",
                          }}
                          title={`${milestone.title}（${STATUS_LABELS[milestone.status]}）: ${milestone.startDate} 〜 ${milestone.endDate}`}
                        >
                          <span className="truncate">{milestone.title}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
