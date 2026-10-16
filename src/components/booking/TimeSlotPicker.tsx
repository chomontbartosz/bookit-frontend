import { useI18n } from '../../i18n/I18nContext';
import { fromDateKey } from '../../lib/date';
import { StatusMessage } from '../StatusMessage';

interface Props {
  date: string;
  times: string[];
  onSelect: (time: string) => void;
}

/** Step 3: choose a time. */
export function TimeSlotPicker({ date, times, onSelect }: Props) {
  const { t, formatDate } = useI18n();

  return (
    <div className="space-y-3">
      <div>
        <h3 className="section-title">{formatDate(fromDateKey(date), 'long')}</h3>
        <p className="subheading">{t('times.title')}</p>
      </div>

      {times.length === 0 ? (
        <StatusMessage>{t('times.empty')}</StatusMessage>
      ) : (
        <div className="flex flex-wrap gap-2">
          {times.map((time) => (
            <button key={time} type="button" className="chip" onClick={() => onSelect(time)}>
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
