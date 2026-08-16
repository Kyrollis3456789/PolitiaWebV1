'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function LanguageSyncProvider({ children }: { children: React.ReactNode }) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLanguageChange = () => {
      const browserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
      const targetLocale = browserLang.startsWith('ar') ? 'ar' : 'en';

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