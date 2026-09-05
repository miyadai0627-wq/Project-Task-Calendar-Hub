"use client";

import { useMemo, useState } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { WeekCalendar } from "@/components/calendar/WeekCalendar";
import { AppHeader } from "@/components/layout/AppHeader";
import { TaskFormDialog } from "@/components/todo/TaskFormDialog";
import { TodoTray } from "@/components/todo/TodoTray";
import {
  clampMinutesToGrid,
  getWeekDays,
  minutesToTime,
  parseTimeToMinutes,
  pxToMinutesFromGridStart,
  shiftWeek,
  snapMinutes,
} from "@/lib/calendar";
import type { ROUTINE_TEMPLATES, TodoTrayTabId } from "@/lib/constants";
import { mockProjects } from "@/lib/mock-data";
import { useTaskStore } from "@/store/useTaskStore";
import type { Task } from "@/types";

type TaskModalState = { mode: "create" | "edit"; task?: Task };
type DragData = { source: "tray" | "event"; task: Task };

const DEFAULT_DURATION_MINUTES = 30;
const MIN_DURATION_MINUTES = 15;

export function AppShell() {
  const [anchorDate, setAnchorDate] = useState(() => new Date(2026, 8, 5));
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [activeTab, setActiveTab] = useState<TodoTrayTabId>("ready");
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null);
  const [activeDrag, setActiveDrag] = useState<Task | null>(null);

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleCompletion = useTaskStore((state) => state.toggleCompletion);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);

  const visibleTasks = useMemo(() => {
    if (selectedProjectId === "all") {
      return tasks;
    }
    return tasks.filter((task) => task.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  function closeModal() {
    setTaskModal(null);
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
    const dayData = over.data.current as { dateKey: string } | undefined;
    if (!data || !dayData) {
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
      <div className="flex h-screen flex-col bg-slate-100 text-slate-900">
        <AppHeader
          projects={mockProjects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          weekDays={weekDays}
          onPrevWeek={() => setAnchorDate((current) => shiftWeek(current, -1))}
          onThisWeek={() => setAnchorDate(new Date(2026, 8, 5))}
          onNextWeek={() => setAnchorDate((current) => shiftWeek(current, 1))}
          onNewTask={() => setTaskModal({ mode: "create" })}
        />
        <div className="flex min-h-0 flex-1">
          <TodoTray
            tasks={visibleTasks}
            projects={mockProjects}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSelectTask={(task) => setTaskModal({ mode: "edit", task })}
          />
          <WeekCalendar
            weekDays={weekDays}
            tasks={visibleTasks}
            projects={mockProjects}
            onToggleComplete={toggleCompletion}
            onSelectTask={(task) => setTaskModal({ mode: "edit", task })}
            onResize={(id, endTime) => updateTask(id, { endTime })}
            onApplyTemplate={handleApplyTemplate}
          />
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
              deleteTask(id);
              closeModal();
            }}
          />
        ) : null}
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="w-64 rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg">
            <p className="truncate text-sm font-semibold text-slate-900">
              {activeDrag.title}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
