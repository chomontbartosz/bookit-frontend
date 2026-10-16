import { useId, useState, type FormEvent } from 'react';
import { ApiError, bookAppointment } from '../../api/clinicApi';
import { useI18n } from '../../i18n/I18nContext';
import { fromDateKey } from '../../lib/date';
import { cx } from '../../lib/cx';
import { isFilled, isValidEmail } from '../../lib/validation';
import type { Doctor } from '../../types';
import { StatusMessage } from '../StatusMessage';

interface Props {
  doctor: Doctor;
  date: string;
  time: string;
  onBooked: () => void;
  onSlotTaken: () => void;
}

/** Step 4: patient details + submit. */
export function BookingForm({ doctor, date, time, onBooked, onSlotTaken }: Props) {
  const { t, tError, formatDate } = useI18n();
  const nameId = useId();
  const emailId = useId();
  const emailErrorId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const showEmailError = emailTouched && isFilled(email) && !isValidEmail(email);
  const canSubmit = isFilled(name) && isValidEmail(email) && !submitting;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await bookAppointment({
        doctor_id: doctor.id,
        date,
        time,
        patient_name: name.trim(),
        patient_email: email.trim(),
      });
      onBooked();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'slot_taken') return onSlotTaken();
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <h3 className="section-title">
          {formatDate(fromDateKey(date), 'long')} · {time}
        </h3>
        <p className="subheading">{t('form.title')}</p>
      </div>

      <div>
        <label htmlFor={nameId} className="field-label">
          {t('form.name')}
        </label>
        <input
          id={nameId}
          className="input"
          autoComplete="name"
          placeholder={t('form.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor={emailId} className="field-label">
          {t('form.email')}
        </label>
        <input
          id={emailId}
          type="email"
          className={cx('input', showEmailError && 'input-invalid')}
          autoComplete="email"
          placeholder={t('form.emailPlaceholder')}
          value={email}
          aria-invalid={showEmailError}
          aria-describedby={showEmailError ? emailErrorId : undefined}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
        />
        {showEmailError && (
          <p id={emailErrorId} className="field-error">
            {t('form.invalidEmail')}
          </p>
        )}
      </div>

      {error !== null && <StatusMessage tone="error">{tError(error)}</StatusMessage>}

      <button type="submit" className="btn btn-primary w-full" disabled={!canSubmit}>
        {submitting ? t('form.submitting') : t('form.submit')}
      </button>
    </form>
  );
}
