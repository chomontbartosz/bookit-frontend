import { useMemo, useState } from 'react';
import { useAvailability } from '../../hooks/useClinicData';
import { useI18n } from '../../i18n/I18nContext';
import type { MessageKey } from '../../i18n/locales';
import { fromDateKey, startOfMonth } from '../../lib/date';
import { groupFreeTimesByDate } from '../../lib/slots';
import type { Doctor } from '../../types';
import { BackButton } from '../BackButton';
import { StatusMessage } from '../StatusMessage';
import { BookingConfirmation } from './BookingConfirmation';
import { BookingForm } from './BookingForm';
import { MonthCalendar } from './MonthCalendar';
import { TimeSlotPicker } from './TimeSlotPicker';

type Step =
  | { name: 'date' }
  | { name: 'time'; date: string }
  | { name: 'form'; date: string; time: string }
  | { name: 'done'; date: string; time: string };

interface Props {
  doctor: Doctor;
  onExit: () => void;
}

/** Steps 2–5 for one expert. Owns the step state; each step is its own component. */
export function BookingFlow({ doctor, onExit }: Props) {
  const { t, tError } = useI18n();
  const { data: slots, error, loading, reload } = useAvailability(doctor.id);
  const [step, setStep] = useState<Step>({ name: 'date' });
  const [month, setMonth] = useState<Date | null>(null);
  const [notice, setNotice] = useState<MessageKey | null>(null);

  const freeTimes = useMemo(() => groupFreeTimesByDate(slots ?? []), [slots]);
  const availableDates = useMemo(() => new Set(freeTimes.keys()), [freeTimes]);
  const dateKeys = [...freeTimes.keys()];
  const minMonth = startOfMonth(new Date());
  const maxMonth = dateKeys.length ? startOfMonth(fromDateKey(dateKeys[dateKeys.length - 1])) : minMonth;
  const visibleMonth = month ?? (dateKeys.length ? startOfMonth(fromDateKey(dateKeys[0])) : minMonth);

  const goTo = (next: Step) => {
    setNotice(null);
    setStep(next);
  };

  if (step.name === 'done') {
    return <BookingConfirmation doctor={doctor} date={step.date} time={step.time} onFinish={onExit} />;
  }

  const back =
    step.name === 'date'
      ? { label: t('calendar.backToExperts'), action: onExit }
      : step.name === 'time'
        ? { label: t('times.backToCalendar'), action: () => goTo({ name: 'date' }) }
        : { label: t('form.backToTimes'), action: () => goTo({ name: 'time', date: step.date }) };

  const renderStep = () => {
    if (!slots && loading) return <StatusMessage>{t('calendar.loading')}</StatusMessage>;
    if (!slots) return <StatusMessage tone="error" onRetry={reload}>{tError(error)}</StatusMessage>;

    switch (step.name) {
      case 'date':
        return availableDates.size === 0 ? (
          <StatusMessage>{t('calendar.noSlotsAtAll')}</StatusMessage>
        ) : (
          <MonthCalendar
            month={visibleMonth}
            minMonth={minMonth}
            maxMonth={maxMonth}
            availableDates={availableDates}
            onMonthChange={setMonth}
            onSelect={(date) => goTo({ name: 'time', date })}
          />
        );
      case 'time':
        return (
          <TimeSlotPicker
            date={step.date}
            times={freeTimes.get(step.date) ?? []}
            onSelect={(time) => goTo({ name: 'form', date: step.date, time })}
          />
        );
      case 'form':
        return (
          <BookingForm
            doctor={doctor}
            date={step.date}
            time={step.time}
            onBooked={() => {
              reload();
              goTo({ name: 'done', date: step.date, time: step.time });
            }}
            onSlotTaken={() => {
              reload();
              setStep({ name: 'time', date: step.date });
              setNotice('errors.slot_taken');
            }}
          />
        );
    }
  };

  return (
    <section className="space-y-6">
      <BackButton onClick={back.action}>{back.label}</BackButton>
      <div>
        <h2 className="heading">{t('calendar.title')}</h2>
        <p className="subheading">{t('calendar.with', { name: doctor.name })}</p>
      </div>
      {notice && <StatusMessage tone="error">{t(notice)}</StatusMessage>}
      {renderStep()}
    </section>
  );
}
