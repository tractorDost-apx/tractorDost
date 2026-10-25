import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from './routing';

export function getClientLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  try {
    const saved = localStorage.getItem('td_locale');
    if (saved && isSupportedLocale(saved)) {
      return saved;
    }
  } catch (_) {}
  return DEFAULT_LOCALE;
}

export function setClientLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('td_locale', locale);
    window.dispatchEvent(new CustomEvent('td:locale_change', { detail: locale }));
  } catch (_) {}
}
