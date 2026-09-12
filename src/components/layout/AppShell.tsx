"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { VerticalCalendar } from "@/components/calendar/VerticalCalendar";
import { AppHeader } from "@/components/layout/AppHeader";
import { MilestoneTimeline } from "@/components/timeline/MilestoneTimeline";
import { TaskFormDialog } from "@/components/todo/TaskFormDialog";
import { TodoTray } from "@/components/todo/TodoTray";
import {
  clampMinutesToGrid,
  formatDayRange,
  formatMonthRange,
  formatWeekRange,
  getMonthGridDays,
  getWeekDays,
  minutesToTime,
  parseTimeToMinutes,
  pxToMinutesFromGridStart,
  shiftDay,
  shiftMonth,
  shiftWeek,
  snapMinutes,
} from "@/lib/calendar";
import type {
  CalendarViewMode,
  ROUTINE_TEMPLATES,
  TodoTrayTabId,
} from "@/lib/constants";
import { mockMilestones, mockProjects } from "@/lib/mock-data";
import { useTaskStore } from "@/store/useTaskStore";
import type { Task } from "@/types";

type TaskModalState = { mode: "create" | "edit"; task?: Task };
type DragData = { source: "tray" | "event"; task: Task };
type ViewMode = "calendar" | "timeline";

const DEFAULT_DURATION_MINUTES = 30;
const MIN_DURATION_MINUTES = 15;
const DEFAULT_START_TIME = "09:00";

export function AppShell() {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [activeTab, setActiveTab] = useState<TodoTrayTabId>("ready");
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null);
  const [activeDrag, setActiveDrag] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [calendarView, setCalendarView] = useState<CalendarViewMode>("week");
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const hasLoaded = useTaskStore((state) => state.hasLoaded);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleCompletion = useTaskStore((state) => state.toggleCompletion);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const visibleDays = useMemo(() => {
    if (calendarView === "day") {
      return [anchorDate];
    }
    if (calendarView === "month") {
      return getMonthGridDays(anchorDate);
    }
    return getWeekDays(anchorDate);
  }, [anchorDate, calendarView]);

  const dateRangeLabel = useMemo(() => {
    if (calendarView === "day") {
      return formatDayRange(anchorDate);
    }
    if (calendarView === "month") {
      return formatMonthRange(anchorDate);
    }
    return formatWeekRange(visibleDays);
  }, [anchorDate, calendarView, visibleDays]);

  const todayLabel =
    calendarView === "day" ? "今日" : calendarView === "month" ? "今月" : "今週";

  const visibleTasks = useMemo(() => {
    if (selectedProjectId === "all") {
      return tasks;
    }
    return tasks.filter((task) => task.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const visibleProjects = useMemo(() => {
    if (selectedProjectId === "all") {
      return mockProjects;
    }
    return mockProjects.filter((project) => project.id === selectedProjectId);
  }, [selectedProjectId]);

  function closeModal() {
    setTaskModal(null);
  }

  function handlePrev() {
    setAnchorDate((current) => {
      if (calendarView === "day") return shiftDay(current, -1);
      if (calendarView === "month") return shiftMonth(current, -1);
      return shiftWeek(current, -1);
    });
  }

  function handleNext() {
    setAnchorDate((current) => {
      if (calendarView === "day") return shiftDay(current, 1);
      if (calendarView === "month") return shiftMonth(current, 1);
      return shiftWeek(current, 1);
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragData | undefined;
    setActiveDrag(data?.task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);

    const { active, over, delta, activatorEvent } = event;
    if (!over) {
      return;
    }

    const data = active.data.current as DragData | undefined;
    const dayData = over.data.current as
      | { dateKey: string; isMonthCell?: boolean }
      | undefined;
    if (!data || !dayData) {
      return;
    }

    if (dayData.isMonthCell) {
      const startTime =
        data.source === "event" ? (data.task.startTime ?? DEFAULT_START_TIME) : DEFAULT_START_TIME;
      const durationMinutes =
        data.source === "tray"
          ? (data.task.estimatedMinutes ?? DEFAULT_DURATION_MINUTES)
          : Math.max(
              parseTimeToMinutes(data.task.endTime ?? "00:00") -
                parseTimeToMinutes(data.task.startTime ?? "00:00"),
              MIN_DURATION_MINUTES,
            );
      const startMinutes = clampMinutesToGrid(parseTimeToMinutes(startTime));
      const endMinutes = clampMinutesToGrid(startMinutes + durationMinutes);

      updateTask(data.task.id, {
        scheduledDate: dayData.dateKey,
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
        status: data.source === "tray" ? "scheduled" : data.task.status,
      });
      return;
    }

    const pointerY =
      "clientY" in activatorEvent
        ? (activatorEvent as PointerEvent).clientY + delta.y
        : over.rect.top;
    const offsetInColumn = pointerY - over.rect.top;
    const startMinutes = clampMinutesToGrid(
      snapMinutes(pxToMinutesFromGridStart(offsetInColumn)),
    );

    const durationMinutes =
      data.source === "tray"
        ? (data.task.estimatedMinutes ?? DEFAULT_DURATION_MINUTES)
        : Math.max(
            parseTimeToMinutes(data.task.endTime ?? "00:00") -
              parseTimeToMinutes(data.task.startTime ?? "00:00"),
            MIN_DURATION_MINUTES,
          );

    const endMinutes = clampMinutesToGrid(startMinutes + durationMinutes);

    updateTask(data.task.id, {
      scheduledDate: dayData.dateKey,
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(endMinutes),
      status: data.source === "tray" ? "scheduled" : data.task.status,
    });
  }

  function handleApplyTemplate(
    dateKey: string,
    template: (typeof ROUTINE_TEMPLATES)[number],
  ) {
    addTask({
      projectId: template.projectId,
      title: template.title,
      priority: template.priority,
      status: "scheduled",
      estimatedMinutes:
        parseTimeToMinutes(template.endTime) -
        parseTimeToMinutes(template.startTime),
      scheduledDate: dateKey,
      startTime: template.startTime,
      endTime: template.endTime,
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className="flex h-screen flex-col bg-sky-50 text-slate-900">
        <AppHeader
          projects={mockProjects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          dateRangeLabel={dateRangeLabel}
          onPrev={handlePrev}
          onToday={() => setAnchorDate(new Date())}
          onNext={handleNext}
          todayLabel={todayLabel}
          onNewTask={() => {
            setTaskModal({ mode: "create" });
            setIsTrayOpen(false);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          calendarView={calendarView}
          onCalendarViewChange={setCalendarView}
          onToggleTray={() => setIsTrayOpen((current) => !current)}
        />
        <div className="relative flex min-h-0 flex-1">
          {!hasLoaded ? (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              読み込み中…
            </div>
          ) : (
            <>
              <TodoTray
                tasks={visibleTasks}
                projects={mockProjects}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSelectTask={(task) => {
                  setTaskModal({ mode: "edit", task });
                  setIsTrayOpen(false);
                }}
                isOpen={isTrayOpen}
                onClose={() => setIsTrayOpen(false)}
              />
              {viewMode === "timeline" ? (
                <MilestoneTimeline milestones={mockMilestones} projects={visibleProjects} />
              ) : calendarView === "month" ? (
                <MonthCalendar
                  days={visibleDays}
                  anchorDate={anchorDate}
                  tasks={visibleTasks}
                  projects={mockProjects}
                  onSelectTask={(task) => setTaskModal({ mode: "edit", task })}
                  onSelectDay={(date) => {
                    setAnchorDate(date);
                    setCalendarView("day");
                  }}
                />
              ) : (
                <VerticalCalendar
                  days={visibleDays}
                  tasks={visibleTasks}
                  projects={mockProjects}
                  onToggleComplete={toggleCompletion}
                  onSelectTask={(task) => setTaskModal({ mode: "edit", task })}
                  onResize={(id, endTime) => updateTask(id, { endTime })}
                  onApplyTemplate={handleApplyTemplate}
                />
              )}
            </>
          )}
        </div>

        {taskModal ? (
          <TaskFormDialog
            mode={taskModal.mode}
            task={taskModal.task}
            projects={mockProjects}
            defaultProjectId={
              selectedProjectId !== "all" ? selectedProjectId : undefined
            }
            onClose={closeModal}
            onSubmit={(draft) => {
              if (taskModal.mode === "create") {
                addTask(draft);
              } else if (taskModal.task) {
                updateTask(taskModal.task.id, draft);
              }
              closeModal();
            }}
            onDelete={(id) => {
              const googleEventId = taskModal.task?.googleEventId;
              if (googleEventId) {
                fetch("/api/calendar/sync", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ googleEventId }),
                }).catch(() => {
                  // ベストエフォート: Google側の削除に失敗してもローカル削除は続行する
                });
              }
              deleteTask(id);
              closeModal();
            }}
            onSynced={(eventId) => {
              if (taskModal.task) {
                updateTask(taskModal.task.id, { googleEventId: eventId });
              }
            }}
          />
        ) : null}
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="w-64 rounded-xl border border-sky-200 bg-white p-2.5 shadow-lg">
            <p className="truncate text-sm font-semibold text-slate-900">
              {activeDrag.title}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
