import type { Slot } from '../types';
import { isInPast } from './date';

/** Free, future slots grouped by date: `Map<"YYYY-MM-DD", ["08:00", "08:30"]>`, both sorted. */
export function groupFreeTimesByDate(slots: Slot[], now = new Date()): Map<string, string[]> {
  const byDate = new Map<string, string[]>();
  const free = slots
    .filter((slot) => !slot.booked && !isInPast(slot.date, slot.time, now))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  for (const { date, time } of free) {
    byDate.set(date, [...(byDate.get(date) ?? []), time]);
  }
  return byDate;
}
