export const CALENDAR_START_HOUR = 6;
export const CALENDAR_END_HOUR = 24;
export const HOUR_HEIGHT_PX = 48;
export const WEEK_STARTS_ON = 1 as const;

export const TODO_TRAY_TABS = [
  { id: "backlog", label: "Backlog", statuses: ["backlog"] },
  { id: "ready", label: "Ready To Schedule", statuses: ["todo"] },
  { id: "done", label: "完了済み", statuses: ["completed"] },
] as const;

export type TodoTrayTabId = (typeof TODO_TRAY_TABS)[number]["id"];

export const ROUTINE_TEMPLATES = [
  {
    id: "morning-review",
    title: "朝のルーティン：今日の予定確認",
    projectId: "prj-ops",
    priority: "low",
    startTime: "06:00",
    endTime: "06:30",
  },
  {
    id: "night-review",
    title: "夜間ルーティン：翌日の枠を確認",
    projectId: "prj-ops",
    priority: "low",
    startTime: "21:00",
    endTime: "22:00",
  },
  {
    id: "deep-work",
    title: "集中作業ブロック",
    projectId: "prj-hub",
    priority: "medium",
    startTime: "22:00",
    endTime: "23:30",
  },
] as const;

export type RoutineTemplateId = (typeof ROUTINE_TEMPLATES)[number]["id"];
