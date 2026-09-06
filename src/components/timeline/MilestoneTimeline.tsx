import { Fragment } from "react";

import { format } from "date-fns";
import { ja } from "date-fns/locale";

import {
  getMilestoneDateRange,
  timelineOffsetPercent,
  timelineTotalDays,
  timelineWeekMarkers,
  timelineWidthPercent,
} from "@/lib/timeline";
import type { Milestone, MilestoneStatus, Project } from "@/types";

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: "予定",
  in_progress: "進行中",
  completed: "完了",
};

export function MilestoneTimeline({
  milestones,
  projects,
}: {
  milestones: Milestone[];
  projects: Project[];
}) {
  const activeProjects = projects.filter((project) => project.status === "active");
  const visibleMilestones = milestones.filter((milestone) =>
    activeProjects.some((project) => project.id === milestone.projectId),
  );

  const { start, end } = getMilestoneDateRange(visibleMilestones);
  const totalDays = timelineTotalDays(start, end);
  const weekMarkers = timelineWeekMarkers(start, end);
  const todayOffset = timelineOffsetPercent(new Date(), start, totalDays);
  const showToday = todayOffset >= 0 && todayOffset <= 100;

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
                <div className="relative h-14 border-b border-slate-100">
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
                      const milestoneStart = new Date(milestone.startDate);
                      const milestoneEnd = new Date(milestone.endDate);
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
                        <div
                          key={milestone.id}
                          className={`absolute top-1/2 flex h-6 -translate-y-1/2 items-center overflow-hidden rounded-full px-2 text-[11px] font-medium shadow-sm ${
                            isPlanned ? "border-2 border-dashed" : "border border-white/50"
                          } ${milestone.status === "completed" ? "opacity-70" : ""}`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 4)}%`,
                            backgroundColor: isPlanned ? "transparent" : project.color,
                            borderColor: project.color,
                            color: isPlanned ? project.color : "white",
                          }}
                          title={`${milestone.title}（${STATUS_LABELS[milestone.status]}）: ${milestone.startDate} 〜 ${milestone.endDate}`}
                        >
                          <span className="truncate">{milestone.title}</span>
                        </div>
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
