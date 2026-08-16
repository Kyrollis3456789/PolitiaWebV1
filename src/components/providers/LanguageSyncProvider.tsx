'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from '@/i18n/locales';

export function LanguageSyncProvider({ children }: { children: React.ReactNode }) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLanguageChange = () => {
      const navLang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
      if (!navLang) return;

      let targetLocale = DEFAULT_LOCALE;

      // 1. Direct exact match
      if (isSupportedLocale(navLang)) {
        targetLocale = navLang;
      } else {
        // 2. Base language prefix match (e.g. "ar" -> "ar-EG", "fr" -> "fr-FR", "en" -> "en-US")
        const base = navLang.split('-')[0].toLowerCase();
        const matched = SUPPORTED_LOCALES.find(
          (loc) => loc.toLowerCase() === base || loc.toLowerCase().startsWith(`${base}-`)
        );
        if (matched) {
          targetLocale = matched;
        }
      }

      if (targetLocale !== currentLocale) {
        router.replace(pathname, { locale: targetLocale });
      }
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [currentLocale, pathname, router]);

  return <>{children}</>;
}