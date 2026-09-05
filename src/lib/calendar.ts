import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
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
