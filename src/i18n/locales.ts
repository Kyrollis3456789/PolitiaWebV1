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

export const LOCALE_DISPLAY_NAMES: Record<SupportedLocale, string> = {
  'af-ZA': 'Afrikaans (Suid-Afrika)',
  'am-ET': 'አማርኛ (ኢትዮጵያ)',
  'ar-AE': 'العربية (الإمارات)',
  'ar-BH': 'العربية (البحرين)',
  'ar-DZ': 'العربية (الجزائر)',
  'ar-EG': 'العربية (مصر)',
  'ar-IQ': 'العربية (العراق)',
  'ar-JO': 'العربية (الأردن)',
  'ar-KW': 'العربية (الكويت)',
  'ar-LB': 'العربية (لبنان)',
  'ar-LY': 'العربية (ليبيا)',
  'ar-MA': 'العربية (المغرب)',
  'ar-OM': 'العربية (عُمان)',
  'ar-QA': 'العربية (قطر)',
  'ar-SA': 'العربية (المملكة العربية السعودية)',
  'ar-SY': 'العربية (سوريا)',
  'ar-TN': 'العربية (تونس)',
  'ar-YE': 'العربية (اليمن)',
  'arc': 'ܐܪܡܝܐ (Aramaic)',
  'az-AZ': 'Azərbaycan dili (Azərbaycan)',
  'be-BY': 'Беларуская (Беларусь)',
  'bg-BG': 'Български (България)',
  'bn-BD': 'বাংলা (বাংলাদেশ)',
  'bn-IN': 'বাংলা (ভারত)',
  'bs-BA': 'Bosanski (Bosna i Hercegovina)',
  'ca-ES': 'Català (Espanya)',
  'cop-EG-bohair': 'Ϯⲁⲥⲡⲓ ⲛ̀Ⲣⲉⲙⲛ̀Ⲭⲏⲙⲓ (Coptic Bohairic)',
  'cop-EG-sahid': 'Ⲧⲁⲥⲡⲉ ⲛ̄Ⲣⲙ̄ⲛ̄Ⲕⲏⲙⲉ (Coptic Sahidic)',
  'cs-CZ': 'Čeština (Česká republika)',
  'cy-GB': 'Cymraeg (Y Deyrnas Unedig)',
  'da-DK': 'Dansk (Danmark)',
  'de-AT': 'Deutsch (Österreich)',
  'de-CH': 'Deutsch (Schweiz)',
  'de-DE': 'Deutsch (Deutschland)',
  'el-GR': 'Ελληνικά (Ελλάδα)',
  'en-AU': 'English (Australia)',
  'en-CA': 'English (Canada)',
  'en-GB': 'English (United Kingdom)',
  'en-IE': 'English (Ireland)',
  'en-IN': 'English (India)',
  'en-NZ': 'English (New Zealand)',
  'en-SG': 'English (Singapore)',
  'en-US': 'English (United States)',
  'en-ZA': 'English (South Africa)',
  'es-AR': 'Español (Argentina)',
  'es-BO': 'Español (Bolivia)',
  'es-CL': 'Español (Chile)',
  'es-CO': 'Español (Colombia)',
  'es-CR': 'Español (Costa Rica)',
  'es-DO': 'Español (República Dominicana)',
  'es-EC': 'Español (Ecuador)',
  'es-ES': 'Español (España)',
  'es-GT': 'Español (Guatemala)',
  'es-HN': 'Español (Honduras)',
  'es-MX': 'Español (México)',
  'es-NI': 'Español (Nicaragua)',
  'es-PA': 'Español (Panamá)',
  'es-PE': 'Español (Perú)',
  'es-PR': 'Español (Puerto Rico)',
  'es-PY': 'Español (Paraguay)',
  'es-SV': 'Español (El Salvador)',
  'es-US': 'Español (Estados Unidos)',
  'es-UY': 'Español (Uruguay)',
  'es-VE': 'Español (Venezuela)',
  'et-EE': 'Eesti (Eesti)',
  'eu-ES': 'Euskara (Espainia)',
  'fa-IR': 'فارسی (ایران)',
  'fi-FI': 'Suomi (Suomi)',
  'fil-PH': 'Filipino (Pilipinas)',
  'fr-BE': 'Français (Belgique)',
  'fr-CA': 'Français (Canada)',
  'fr-CH': 'Français (Suisse)',
  'fr-FR': 'Français (France)',
  'fr-LU': 'Français (Luxembourg)',
  'gl-ES': 'Galego (España)',
  'gu-IN': 'ગુજરાતી (ભારત)',
  'he-IL': 'עברית (ישראל)',
  'hi-IN': 'हिन्दी (भारत)',
  'hr-HR': 'Hrvatski (Hrvatska)',
  'hu-HU': 'Magyar (Magyarország)',
  'hy-AM': 'Հայերեն (Հայաստան)',
  'id-ID': 'Bahasa Indonesia (Indonesia)',
  'is-IS': 'Íslenska (Ísland)',
  'it-CH': 'Italiano (Svizzera)',
  'it-IT': 'Italiano (Italia)',
  'ja-JP': '日本語 (日本)',
  'ka-GE': 'ქართული (საქართველო)',
  'kk-KZ': 'Қазақ тілі (Қазақстан)',
  'km-KH': 'ភាសាខ្មែរ (កម្ពុជា)',
  'kn-IN': 'ಕನ್ನಡ (ಭಾರತ)',
  'ko-KR': '한국어 (대한민국)',
  'lo-LA': 'ພາສາລາວ (ລາວ)',
  'lt-LT': 'Lietuvių (Lietuva)',
  'lv-LV': 'Latviešu (Latvija)',
  'mk-MK': 'Македонски (Северна Македонија)',
  'ml-IN': 'മലയാളം (ഇന്ത്യ)',
  'mn-MN': 'Монгол (Монгол)',
  'mr-IN': 'मराठी (भारत)',
  'ms-MY': 'Bahasa Melayu (Malaysia)',
  'my-MM': 'မြန်မာ (မြန်မာ)',
  'nb-NO': 'Norsk bokmål (Norge)',
  'ne-NP': 'नेपाली (नेपाल)',
  'nl-BE': 'Nederlands (België)',
  'nl-NL': 'Nederlands (Nederland)',
  'pa-IN': 'ਪੰਜਾਬੀ (ਭਾਰਤ)',
  'pl-PL': 'Polski (Polska)',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  'ro-RO': 'Română (România)',
  'ru-RU': 'Русский (Россия)',
  'si-LK': 'සිංහල (ශ්‍රී ලංකාව)',
  'sk-SK': 'Slovenčina (Slovensko)',
  'sl-SI': 'Slovenščina (Slovenija)',
  'sq-AL': 'Shqip (Shqipëri)',
  'sr-RS': 'Српски (Србија)',
  'sv-SE': 'Svenska (Sverige)',
  'sw-KE': 'Kiswahili (Kenya)',
  'syc': 'ܣܘܪܝܝܐ (Syriac)',
  'ta-IN': 'தமிழ் (இந்தியா)',
  'ta-LK': 'தமிழ் (இலங்கை)',
  'te-IN': 'తెలుగు (భారతదేశం)',
  'th-TH': 'ไทย (ไทย)',
  'tr-TR': 'Türkçe (Türkiye)',
  'uk-UA': 'Українська (Україна)',
  'ur-PK': 'اردو (پاکستان)',
  'uz-UZ': "O'zbek (O'zbekiston)",
  'vi-VN': 'Tiếng Việt (Việt Nam)',
  'zh-CN': '中文 (简体, 中国)',
  'zh-HK': '中文 (繁體, 香港)',
  'zh-SG': '中文 (简体, 新加坡)',
  'zh-TW': '中文 (繁體, 台灣)',
};

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

export function getLocaleDisplayName(locale: string): string {
  if (isSupportedLocale(locale)) {
    return LOCALE_DISPLAY_NAMES[locale] || locale;
  }
  return locale;
}

export function getLocaleMetadata(locale: string): LocaleMetadata {
  const direction = getLocaleDirection(locale);
  return {
    code: locale,
    name: getLocaleDisplayName(locale),
    direction,
  };
}