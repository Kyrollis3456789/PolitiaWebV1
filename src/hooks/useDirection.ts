'use client';

import { useLocale } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';

/**
 * Hook to retrieve current locale directional metadata.
 */
export function useDirection() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  return {
    locale,
    isRtl,
    direction: isRtl ? ('rtl' as const) : ('ltr' as const),
  };
}
