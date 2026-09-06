import { addDays, differenceInCalendarDays, eachWeekOfInterval, max, min } from "date-fns";

import { WEEK_STARTS_ON } from "@/lib/constants";
import type { Milestone } from "@/types";

const RANGE_PADDING_DAYS = 3;
const DEFAULT_RANGE_DAYS = 21;

export function getMilestoneDateRange(milestones: Milestone[]): {
  start: Date;
  end: Date;
} {
  if (milestones.length === 0) {
    const today = new Date();
    return {
      start: addDays(today, -RANGE_PADDING_DAYS),
      end: addDays(today, DEFAULT_RANGE_DAYS),
    };
  }
  const starts = milestones.map((milestone) => new Date(milestone.startDate));
  const ends = milestones.map((milestone) => new Date(milestone.endDate));
  return {
    start: addDays(min(starts), -RANGE_PADDING_DAYS),
    end: addDays(max(ends), RANGE_PADDING_DAYS),
  };
}

export function timelineTotalDays(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1;
}

export function timelineOffsetPercent(
  date: Date,
  rangeStart: Date,
  totalDays: number,
): number {
  const offsetDays = differenceInCalendarDays(date, rangeStart);
  return (offsetDays / totalDays) * 100;
}

export function timelineWidthPercent(
  startDate: Date,
  endDate: Date,
  totalDays: number,
): number {
  const durationDays = differenceInCalendarDays(endDate, startDate) + 1;
  return (durationDays / totalDays) * 100;
}

export function timelineWeekMarkers(start: Date, end: Date): Date[] {
  return eachWeekOfInterval({ start, end }, { weekStartsOn: WEEK_STARTS_ON });
}
