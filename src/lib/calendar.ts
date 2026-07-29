import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarView = "week" | "month";

export function parseAnchorDate(dateParam?: string): Date {
  if (dateParam) {
    const d = new Date(dateParam + "T00:00:00");
    if (!isNaN(d.getTime())) return d;
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getRange(view: CalendarView, anchor: Date): Date[] {
  if (view === "week") {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const end = endOfWeek(anchor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  return eachDayOfInterval({ start, end });
}

export function shiftAnchor(view: CalendarView, anchor: Date, dir: 1 | -1): Date {
  return view === "week" ? addWeeks(anchor, dir) : addMonths(anchor, dir);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dayCoversDate(dayStart: Date, resStart: Date, resEnd: Date): boolean {
  const dayEnd = addDays(dayStart, 1);
  return resStart < dayEnd && dayStart < resEnd;
}
