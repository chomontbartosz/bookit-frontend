import { useI18n } from '../../i18n/I18nContext';
import { addMinutes, fromDateKey } from '../../lib/date';
import { buildGoogleCalendarUrl } from '../../lib/googleCalendar';
import type { Doctor } from '../../types';
import { CalendarPlus, Check } from '../icons';

interface Props {
  doctor: Doctor;
  date: string;
  time: string;
  onFinish: () => void;
}

/** Step 5: success + "Add to Google Calendar". */
export function BookingConfirmation({ doctor, date, time, onFinish }: Props) {
  const { t, formatDate } = useI18n();
  const start = fromDateKey(date, time);
  const calendarUrl = buildGoogleCalendarUrl({
    title: t('confirmation.eventTitle', { name: doctor.name }),
    details: t('confirmation.eventDetails'),
    start,
    end: addMinutes(start, doctor.visitDuration),
  });

  return (
    <section className="space-y-4 text-center" role="status">
      <div className="success-badge">
        <Check width={24} height={24} />
      </div>
      <h2 className="heading">{t('confirmation.title')}</h2>
      <p className="lead">
        {t('confirmation.details', { date: formatDate(start, 'long'), time, name: doctor.name })}
      </p>
      <div className="flex flex-col items-center gap-2">
        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          <CalendarPlus /> {t('confirmation.addToCalendar')}
        </a>
        <button type="button" className="btn btn-ghost" onClick={onFinish}>
          {t('confirmation.home')}
        </button>
      </div>
    </section>
  );
}
