interface CalendarEvent {
  title: string;
  details: string;
  start: Date;
  end: Date;
}

/** "Add to Google Calendar" link. Pure URL template: no OAuth, no API key. */
export function buildGoogleCalendarUrl({ title, details, start, end }: CalendarEvent): string {
  const toUtcStamp = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('details', details);
  url.searchParams.set('dates', `${toUtcStamp(start)}/${toUtcStamp(end)}`);
  return url.toString();
}
