"use client";

import { useMemo, useState } from "react";

import { WeekCalendar } from "@/components/calendar/WeekCalendar";
import { AppHeader } from "@/components/layout/AppHeader";
import { TodoTray } from "@/components/todo/TodoTray";
import { getWeekDays, shiftWeek } from "@/lib/calendar";
import type { TodoTrayTabId } from "@/lib/constants";
import { mockProjects, mockTasks } from "@/lib/mock-data";

export function AppShell() {
  const [anchorDate, setAnchorDate] = useState(() => new Date(2026, 8, 5));
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [activeTab, setActiveTab] = useState<TodoTrayTabId>("ready");

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);

  const visibleTasks = useMemo(() => {
    if (selectedProjectId === "all") {
      return mockTasks;
    }
    return mockTasks.filter((task) => task.projectId === selectedProjectId);
  }, [selectedProjectId]);

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
      />
      <div className="flex min-h-0 flex-1">
        <TodoTray
          tasks={visibleTasks}
          projects={mockProjects}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <WeekCalendar
          weekDays={weekDays}
          tasks={visibleTasks}
          projects={mockProjects}
        />
      </div>
    </div>
  );
}
