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
