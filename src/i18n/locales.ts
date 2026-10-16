import { ApiError } from '../api/clinicApi';
import { APP_CONFIG } from '../config';
import en from './locales/en.json';
import pl from './locales/pl.json';

/** English is the reference: every other locale must have the same keys (checked by `satisfies`). */
export type Messages = typeof en;

/** Every translation key as a dotted path, e.g. `"form.submit"`. */
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
export type MessageKey = Leaves<Messages>;

interface LocaleDefinition {
  label: string;
  short: string;
  flag: string;
  /** BCP 47 tag for Intl date formatting. */
  intl: string;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn: number;
  messages: Messages;
}

/** The only list of supported languages. Add one here + a JSON file in ./locales. */
export const LOCALES = {
  en: { label: 'English', short: 'EN', flag: '/flags/gb.svg', intl: 'en-GB', weekStartsOn: 1, messages: en },
  pl: { label: 'Polski', short: 'PL', flag: '/flags/pl.svg', intl: 'pl-PL', weekStartsOn: 1, messages: pl satisfies Messages },
} satisfies Record<string, LocaleDefinition>;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'en';

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && value in LOCALES;

/** Saved choice → browser language → default. */
export function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(APP_CONFIG.localeStorageKey);
    if (isLocale(saved)) return saved;
  } catch {
    /* storage blocked: fall through */
  }
  const browser = navigator.languages.map((tag) => tag.slice(0, 2)).find(isLocale);
  return browser ?? DEFAULT_LOCALE;
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(APP_CONFIG.localeStorageKey, locale);
  } catch {
    /* storage blocked: choice lasts for this visit only */
  }
}

export function translate(
  messages: Messages,
  key: MessageKey,
  vars: Record<string, string | number> = {},
): string {
  const text = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);
  if (typeof text !== 'string') return key;
  return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => String(vars[name] ?? match));
}

/** Maps any error to its `errors.*` key. API error codes are the keys themselves. */
export function errorKey(error: unknown): MessageKey {
  const code = error instanceof ApiError ? error.code : 'unknown_error';
  return (code in en.errors ? `errors.${code}` : 'errors.unknown_error') as MessageKey;
}
