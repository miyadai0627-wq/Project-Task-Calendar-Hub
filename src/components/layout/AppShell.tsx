"use client";

import { useMemo, useState } from "react";

import { WeekCalendar } from "@/components/calendar/WeekCalendar";
import { AppHeader } from "@/components/layout/AppHeader";
import { TaskFormDialog } from "@/components/todo/TaskFormDialog";
import { TodoTray } from "@/components/todo/TodoTray";
import { getWeekDays, shiftWeek } from "@/lib/calendar";
import type { TodoTrayTabId } from "@/lib/constants";
import { mockProjects } from "@/lib/mock-data";
import { useTaskStore } from "@/store/useTaskStore";
import type { Task } from "@/types";

type TaskModalState = { mode: "create" | "edit"; task?: Task };

export function AppShell() {
  const [anchorDate, setAnchorDate] = useState(() => new Date(2026, 8, 5));
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [activeTab, setActiveTab] = useState<TodoTrayTabId>("ready");
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null);

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleCompletion = useTaskStore((state) => state.toggleCompletion);

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

  return (
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
  );
}
