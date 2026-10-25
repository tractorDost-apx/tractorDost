export const SUPPORTED_LOCALES = [
  'en',
  'hi',
  'mr',
  'gu',
  'pa',
  'te',
  'ta',
  'kn',
  'bn',
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
};

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
