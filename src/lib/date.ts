/**
 * Date helpers. All dates are LOCAL calendar dates.
 * Never use `toISOString()` for date keys: it converts to UTC and shifts the day.
 */

/** Intl presets, the only place where date display formats are defined. */
export const DATE_FORMATS = {
  monthYear: { month: 'long', year: 'numeric' },
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  weekdayShort: { weekday: 'short' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateFormat = keyof typeof DATE_FORMATS;

export function formatDate(date: Date, intlLocale: string, format: DateFormat): string {
  return new Intl.DateTimeFormat(intlLocale, DATE_FORMATS[format]).format(date);
}

/** `Date` → `YYYY-MM-DD` (the API date format). */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `YYYY-MM-DD` (+ optional `HH:MM`) → local `Date`. */
export function fromDateKey(dateKey: string, time = '00:00'): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60_000);

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const isSameDay = (a: Date, b: Date): boolean => toDateKey(a) === toDateKey(b);

export const isInPast = (dateKey: string, time: string, now = new Date()): boolean =>
  fromDateKey(dateKey, time) <= now;

/** Month view cells: `null` = padding outside the month. Always full weeks. */
export function buildMonthGrid(month: Date, weekStartsOn: number): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() - weekStartsOn + 7) % 7;

  const cells: (Date | null)[] = Array(leadingBlanks).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, monthIndex, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Localized short weekday names, starting from `weekStartsOn` (0 = Sunday). */
export function getWeekdayNames(intlLocale: string, weekStartsOn: number): string[] {
  const KNOWN_SUNDAY = 7; // 7 Jan 2024
  return Array.from({ length: 7 }, (_, i) =>
    formatDate(new Date(2024, 0, KNOWN_SUNDAY + weekStartsOn + i), intlLocale, 'weekdayShort'),
  );
}
