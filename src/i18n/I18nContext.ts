import { createContext, useContext } from 'react';
import type { DateFormat } from '../lib/date';
import type { Locale, MessageKey } from './locales';

export interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  /** Translated message for any error (API codes included). */
  tError: (error: unknown) => string;
  formatDate: (date: Date, format: DateFormat) => string;
  intlLocale: string;
  weekStartsOn: number;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}
