import { getRequestConfig } from 'next-intl/server';
import { isSupportedLocale, DEFAULT_LOCALE } from './locales';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isSupportedLocale(locale)) {
    locale = DEFAULT_LOCALE;
  }

  let commonMessages;
  try {
    commonMessages = (await import(`../../messages/${locale}/common.json`)).default;
  } catch {
    commonMessages = (await import(`../../messages/${DEFAULT_LOCALE}/common.json`)).default;
  }

  return {
    locale,
    messages: {
      common: commonMessages,
    },
  };
});