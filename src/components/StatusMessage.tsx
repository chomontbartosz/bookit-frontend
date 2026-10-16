import type { ReactNode } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { cx } from '../lib/cx';

type Tone = 'muted' | 'error' | 'success';

const TONE_CLASS: Record<Tone, string> = {
  muted: 'notice-muted',
  error: 'notice-error',
  success: 'notice-success',
};

interface Props {
  tone?: Tone;
  children: ReactNode;
  onRetry?: () => void;
}

/** Loading, empty, error and success messages: one component for all of them. */
export function StatusMessage({ tone = 'muted', children, onRetry }: Props) {
  const { t } = useI18n();
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('notice', TONE_CLASS[tone], 'flex items-center justify-between gap-4')}
    >
      <span>{children}</span>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
