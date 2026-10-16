import { useDoctors } from '../../hooks/useClinicData';
import { useI18n } from '../../i18n/I18nContext';
import type { Doctor } from '../../types';
import { StatusMessage } from '../StatusMessage';

/** Step 1: choose an expert. */
export function DoctorList({ onSelect }: { onSelect: (doctor: Doctor) => void }) {
  const { t, tError } = useI18n();
  const { data: doctors, error, loading, reload } = useDoctors();

  return (
    <section>
      <h2 className="heading">{t('doctors.title')}</h2>
      <p className="subheading mb-6">{t('doctors.subtitle')}</p>

      {!doctors && loading && <StatusMessage>{t('doctors.loading')}</StatusMessage>}
      {!doctors && !loading && error !== undefined && (
        <StatusMessage tone="error" onRetry={reload}>
          {tError(error)}
        </StatusMessage>
      )}
      {doctors?.length === 0 && <StatusMessage>{t('doctors.empty')}</StatusMessage>}

      {doctors && doctors.length > 0 && (
        <ul className="space-y-3">
          {doctors.map((doctor) => (
            <li key={doctor.id}>
              <button type="button" className="option-card" onClick={() => onSelect(doctor)}>
                <div className="option-card-title">{doctor.name}</div>
                <div className="option-card-meta">
                  {doctor.specialization} · {t('doctors.duration', { minutes: doctor.visitDuration })}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
