import { useI18n } from '../../i18n/I18nContext';
import { addMonths, buildMonthGrid, getWeekdayNames, isSameDay, toDateKey } from '../../lib/date';
import { cx } from '../../lib/cx';
import { ChevronLeft, ChevronRight } from '../icons';

interface Props {
  month: Date;
  minMonth: Date;
  maxMonth: Date;
  /** Date keys (`YYYY-MM-DD`) that have at least one free slot. */
  availableDates: ReadonlySet<string>;
  onMonthChange: (month: Date) => void;
  onSelect: (dateKey: string) => void;
}

/** Step 2: choose a day. */
export function MonthCalendar({ month, minMonth, maxMonth, availableDates, onMonthChange, onSelect }: Props) {
  const { t, formatDate, intlLocale, weekStartsOn } = useI18n();
  const today = new Date();
  const cells = buildMonthGrid(month, weekStartsOn);
  const hasSlotsThisMonth = cells.some((day) => day && availableDates.has(toDateKey(day)));

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="btn-icon"
          aria-label={t('calendar.prevMonth')}
          disabled={month <= minMonth}
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeft />
        </button>
        <span className="section-title" aria-live="polite">
          {formatDate(month, 'monthYear')}
        </span>
        <button
          type="button"
          className="btn-icon"
          aria-label={t('calendar.nextMonth')}
          disabled={month >= maxMonth}
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {getWeekdayNames(intlLocale, weekStartsOn).map((name) => (
          <div key={name} className="calendar-weekday">
            {name}
          </div>
        ))}

        {cells.map((day, index) => {
          if (!day) return <div key={`blank-${index}`} />;
          const dateKey = toDateKey(day);
          const available = availableDates.has(dateKey);
          return (
            <button
              key={dateKey}
              type="button"
              disabled={!available}
              aria-label={formatDate(day, 'long')}
              className={cx(
                'calendar-day',
                available ? 'calendar-day-available' : 'calendar-day-unavailable',
                isSameDay(day, today) && 'calendar-day-today',
              )}
              onClick={() => onSelect(dateKey)}
            >
              {day.getDate()}
              {available && <span className="calendar-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {!hasSlotsThisMonth && (
        <p className="notice notice-muted mt-3 text-center">{t('calendar.noSlotsThisMonth')}</p>
      )}
    </div>
  );
}
