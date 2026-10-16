import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { formatDate } from '../lib/date';
import { I18nContext, type I18nValue } from './I18nContext';
import { LOCALES, detectInitialLocale, errorKey, saveLocale, translate, type Locale } from './locales';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  const value = useMemo<I18nValue>(() => {
    const { messages, intl, weekStartsOn } = LOCALES[locale];
    const t: I18nValue['t'] = (key, vars) => translate(messages, key, vars);
    return {
      locale,
      setLocale: (next) => {
        saveLocale(next);
        setLocaleState(next);
      },
      t,
      tError: (error) => t(errorKey(error)),
      formatDate: (date, format) => formatDate(date, intl, format),
      intlLocale: intl,
      weekStartsOn,
    };
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = value.t('app.pageTitle');
  }, [locale, value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
