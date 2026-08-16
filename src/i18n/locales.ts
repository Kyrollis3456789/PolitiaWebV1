export interface LocaleMetadata {
  code: string;
  name: string;
  nativeName?: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LOCALES = [
  'af-ZA', 'am-ET', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO',
  'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-OM', 'ar-QA', 'ar-SA', 'ar-SY',
  'ar-TN', 'ar-YE', 'arc', 'az-AZ', 'be-BY', 'bg-BG', 'bn-BD', 'bn-IN',
  'bs-BA', 'ca-ES', 'cop-EG-bohair', 'cop-EG-sahid', 'cs-CZ', 'cy-GB',
  'da-DK', 'de-AT', 'de-CH', 'de-DE', 'el-GR', 'en-AU', 'en-CA', 'en-GB',
  'en-IE', 'en-IN', 'en-NZ', 'en-SG', 'en-US', 'en-ZA', 'es-AR', 'es-BO',
  'es-CL', 'es-CO', 'es-CR', 'es-DO', 'es-EC', 'es-ES', 'es-GT', 'es-HN',
  'es-MX', 'es-NI', 'es-PA', 'es-PE', 'es-PR', 'es-PY', 'es-SV', 'es-US',
  'es-UY', 'es-VE', 'et-EE', 'eu-ES', 'fa-IR', 'fi-FI', 'fil-PH', 'fr-BE',
  'fr-CA', 'fr-CH', 'fr-FR', 'fr-LU', 'gl-ES', 'gu-IN', 'he-IL', 'hi-IN',
  'hr-HR', 'hu-HU', 'hy-AM', 'id-ID', 'is-IS', 'it-CH', 'it-IT', 'ja-JP',
  'ka-GE', 'kk-KZ', 'km-KH', 'kn-IN', 'ko-KR', 'lo-LA', 'lt-LT', 'lv-LV',
  'mk-MK', 'ml-IN', 'mn-MN', 'mr-IN', 'ms-MY', 'my-MM', 'nb-NO', 'ne-NP',
  'nl-BE', 'nl-NL', 'pa-IN', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU',
  'si-LK', 'sk-SK', 'sl-SI', 'sq-AL', 'sr-RS', 'sv-SE', 'sw-KE', 'syc',
  'ta-IN', 'ta-LK', 'te-IN', 'th-TH', 'tr-TR', 'uk-UA', 'ur-PK', 'uz-UZ',
  'vi-VN', 'zh-CN', 'zh-HK', 'zh-SG', 'zh-TW'
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

export const RTL_LOCALES: readonly string[] = [
  'arc',
  'syc',
  'fa-IR',
  'he-IL',
  'ur-PK',
  'ar-AE',
  'ar-BH',
  'ar-DZ',
  'ar-EG',
  'ar-IQ',
  'ar-JO',
  'ar-KW',
  'ar-LB',
  'ar-LY',
  'ar-MA',
  'ar-OM',
  'ar-QA',
  'ar-SA',
  'ar-SY',
  'ar-TN',
  'ar-YE',
];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export function isRtlLocale(locale: string): boolean {
  if (locale.startsWith('ar-') || locale === 'ar') return true;
  return RTL_LOCALES.includes(locale);
}

export function getLocaleDirection(locale: string): 'rtl' | 'ltr' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}

export function getLocaleMetadata(locale: string): LocaleMetadata {
  const direction = getLocaleDirection(locale);
  return {
    code: locale,
    name: locale,
    direction,
  };
}