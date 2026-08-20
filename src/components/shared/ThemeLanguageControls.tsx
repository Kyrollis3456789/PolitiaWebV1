'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { SUPPORTED_LOCALES } from '@/i18n/locales';
import { Sun, Moon, Laptop, Globe, Check, ChevronDown } from 'lucide-react';

const POPULAR_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'ar-EG', name: 'العربية (مصر)', flag: '🇪🇬' },
  { code: 'ar-SA', name: 'العربية (السعودية)', flag: '🇸🇦' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
];

export function ThemeLanguageControls({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (localeCode: string) => {
    setIsLangOpen(false);
    router.replace(pathname, { locale: localeCode });
  };

  const filteredLocales = searchQuery
    ? SUPPORTED_LOCALES.filter((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase()))
    : SUPPORTED_LOCALES;

  return (
    <div
      className={`flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}
      dir="ltr"
    >
      {mounted && (
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Light mode"
            aria-label="Light mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Dark mode"
            aria-label="Dark mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-700 text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="System theme"
            aria-label="System theme"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          aria-expanded={isLangOpen}
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="uppercase">{currentLocale.split('-')[0]}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isLangOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 max-h-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 overflow-hidden flex flex-col">
              <div className="p-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="Search locales..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="overflow-y-auto flex-1 py-1 space-y-0.5 text-xs">
                {!searchQuery && (
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Popular languages
                  </div>
                )}

                {!searchQuery &&
                  POPULAR_LANGUAGES.map((lang) => {
                    const isSelected = currentLocale === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLocaleChange(lang.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    );
                  })}

                <div className="px-2 py-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  {searchQuery ? 'Matching locales' : 'All locales'}
                </div>

                {filteredLocales.map((loc) => {
                  const isSelected = currentLocale === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocaleChange(loc)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left font-mono cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{loc}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
