/**
 * App-wide settings: the only place for constants and environment values.
 */
export const APP_CONFIG = {
  /** REST API base. Production uses `/api`, proxied by Vercel (see vercel.json). */
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
  /** Used when an expert has no visit length set. */
  defaultVisitMinutes: 30,
  /** localStorage key for the chosen language. */
  localeStorageKey: 'bookit.locale',
} as const;
