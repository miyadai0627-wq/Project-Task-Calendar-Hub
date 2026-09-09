import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";

import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  HOUR_HEIGHT_PX,
  WEEK_STARTS_ON,
} from "@/lib/constants";

export function getWeekDays(anchorDate: Date): Date[] {
  const start = startOfWeek(anchorDate, { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(anchorDate, { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end });
}

export function shiftWeek(anchorDate: Date, weeks: number): Date {
  return addWeeks(anchorDate, weeks);
}

export function shiftDay(anchorDate: Date, days: number): Date {
  return addDays(anchorDate, days);
}

export function shiftMonth(anchorDate: Date, months: number): Date {
  return addMonths(anchorDate, months);
}

export function getMonthGridDays(anchorDate: Date): Date[] {
  const monthStart = startOfMonth(anchorDate);
  const monthEnd = endOfMonth(anchorDate);
  const start = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end });
}

export function isInAnchorMonth(date: Date, anchorDate: Date): boolean {
  return isSameMonth(date, anchorDate);
}

export function formatDayRange(date: Date): string {
  return format(date, "yyyy年M月d日 (E)", { locale: ja });
}

export function formatMonthRange(date: Date): string {
  return format(date, "yyyy年M月", { locale: ja });
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatWeekRange(days: Date[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) {
    return "";
  }
  return `${format(first, "yyyy年M月d日", { locale: ja })} – ${format(last, "M月d日", { locale: ja })}`;
}

export function formatWeekday(date: Date): string {
  return format(date, "E", { locale: ja });
}

export function hourLabels(): number[] {
  const hours: number[] = [];
  for (let hour = CALENDAR_START_HOUR; hour < CALENDAR_END_HOUR; hour += 1) {
    hours.push(hour);
  }
  return hours;
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function parseTimeToMinutes(time: string): number {
  const [hourPart, minutePart] = time.split(":");
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  return hours * 60 + minutes;
}

export function eventOffsetPx(startTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const gridStartMinutes = CALENDAR_START_HOUR * 60;
  return ((startMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT_PX;
}

export function eventHeightPx(startTime: string, endTime: string): number {
  const durationMinutes =
    parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
  return Math.max((durationMinutes / 60) * HOUR_HEIGHT_PX, HOUR_HEIGHT_PX / 2);
}

export function gridHeightPx(): number {
  return (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX;
}

export function isSameDateKey(date: Date, dateKey: string): boolean {
  return toDateKey(date) === dateKey;
}

export function pxToMinutesFromGridStart(offsetPx: number): number {
  const gridStartMinutes = CALENDAR_START_HOUR * 60;
  return gridStartMinutes + (offsetPx / HOUR_HEIGHT_PX) * 60;
}

export function snapMinutes(minutes: number, step = 15): number {
  return Math.round(minutes / step) * step;
}

export function clampMinutesToGrid(minutes: number): number {
  const min = CALENDAR_START_HOUR * 60;
  const max = CALENDAR_END_HOUR * 60;
  return Math.min(Math.max(minutes, min), max);
}

export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
