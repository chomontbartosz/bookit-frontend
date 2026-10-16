import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { LOCALES, type Locale } from '../i18n/locales';
import { cx } from '../lib/cx';
import { ChevronDown } from './icons';

const LOCALE_CODES = Object.keys(LOCALES) as Locale[];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES[locale];

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="btn btn-ghost px-2"
        aria-label={t('language.label')}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <img src={current.flag} alt="" className="flag" />
        {current.short}
        <ChevronDown className={cx('transition', open && 'rotate-180')} />
      </button>

      {open && (
        <ul className="dropdown">
          {LOCALE_CODES.map((code) => (
            <li key={code}>
              <button
                type="button"
                lang={code}
                aria-current={code === locale}
                className={cx('dropdown-item', code === locale && 'dropdown-item-active')}
                onClick={() => choose(code)}
              >
                <img src={LOCALES[code].flag} alt="" className="flag" />
                {LOCALES[code].label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
