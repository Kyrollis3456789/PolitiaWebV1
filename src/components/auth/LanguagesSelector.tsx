'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Search,
  Check,
  X,
  Plus,
  Globe2,
  RotateCcw,
} from 'lucide-react';
import {
  POPULAR_LANGUAGES,
  ALL_GLOBAL_LANGUAGES,
  LanguageItem,
} from '@/lib/constants/languagesData';

interface LanguagesSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  isRtl?: boolean;
}

export default function LanguagesSelector({
  selectedLanguages,
  onChange,
  isRtl = false,
}: LanguagesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customLanguageInput, setCustomLanguageInput] = useState('');
  const [customLanguagesList, setCustomLanguagesList] = useState<{ code: string; name: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle language selection
  const handleToggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      onChange(selectedLanguages.filter((c) => c !== code));
    } else {
      onChange([...selectedLanguages, code]);
    }
  };

  // Add from dropdown search
  const handleSelectFromDropdown = (lang: LanguageItem) => {
    if (!selectedLanguages.includes(lang.code)) {
      onChange([...selectedLanguages, lang.code]);
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  // Add custom unlisted language
  const handleAddCustomLanguage = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const clean = customLanguageInput.trim();
    if (!clean) return;

    const customCode = `custom_${Date.now()}_${clean.toLowerCase().replace(/\s+/g, '_')}`;
    setCustomLanguagesList((prev) => [...prev, { code: customCode, name: clean }]);
    onChange([...selectedLanguages, customCode]);
    setCustomLanguageInput('');
    setIsDropdownOpen(false);
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };

  // Filter global languages by search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return ALL_GLOBAL_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_GLOBAL_LANGUAGES.filter((l) => {
      return (
        l.nameEn.toLowerCase().includes(q) ||
        l.nameAr.includes(q) ||
        (l.nativeName && l.nativeName.toLowerCase().includes(q)) ||
        l.code.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // Selected language items metadata
  const selectedItemsDetails = useMemo(() => {
    return selectedLanguages.map((code) => {
      const predefined = ALL_GLOBAL_LANGUAGES.find((l) => l.code === code);
      if (predefined) {
        return {
          code: predefined.code,
          flag: predefined.flag || '🌐',
          name: isRtl ? predefined.nameAr : predefined.nameEn,
        };
      }
      const custom = customLanguagesList.find((c) => c.code === code);
      return {
        code,
        flag: '🗣️',
        name: custom ? custom.name : code,
      };
    });
  }, [selectedLanguages, isRtl, customLanguagesList]);

  return (
    <div ref={containerRef} className="w-full space-y-3.5">
      {/* 1. Header & Counter */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{isRtl ? 'اللغات المتقنة' : 'Languages Spoken'}</span>
        </label>

        {selectedLanguages.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
              {isRtl ? `تم اختيار ${selectedLanguages.length}` : `${selectedLanguages.length} selected`}
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition cursor-pointer flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isRtl ? 'مسح' : 'Clear'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Selected Languages Display Tags */}
      {selectedItemsDetails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 animate-fadeIn">
          {selectedItemsDetails.map((item) => (
            <span
              key={item.code}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 transition"
            >
              <span>{item.flag}</span>
              <span className="truncate max-w-[130px]">{item.name}</span>
              <button
                type="button"
                onClick={() => handleToggleLanguage(item.code)}
                className="w-3.5 h-3.5 rounded-full hover:bg-blue-200/80 dark:hover:bg-blue-800 inline-flex items-center justify-center text-blue-400 hover:text-rose-500 transition cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 3. Section 1: Quick Select (Popular Languages) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {isRtl ? 'اللغات الشائعة:' : 'Popular Languages:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleToggleLanguage(lang.code)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none transform active:scale-95",
                  isSelected
                    ? "bg-blue-600 text-white border border-blue-600 shadow-xs font-semibold"
                    : "border border-slate-300/80 dark:border-slate-700/80 bg-transparent text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
                )}
              >
                <span>{lang.flag}</span>
                <span>{isRtl ? lang.nameAr : lang.nameEn}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Section 2: Search & Add (All Other Global Languages) */}
      <div className="relative pt-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder={isRtl ? 'ابحث في أكثر من 60 لغة حول العالم أو أضف لغة...' : 'Search 60+ global languages or add...'}
            className="w-full ps-9 pe-8 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Floating Dropdown Menu for Search Results */}
        {isDropdownOpen && (
          <div className="absolute z-30 start-0 end-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-fadeIn p-1">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectFromDropdown(lang)}
                  className={clsx(
                    "w-full text-start px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{isRtl ? lang.nameAr : lang.nameEn}</span>
                    {lang.nativeName && (
                      <span className="text-[11px] text-slate-400">({lang.nativeName})</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-400">
                {isRtl ? 'لم نجد لغة مطابقة' : 'No language found'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Custom Unlisted Language Write-in Bar */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={customLanguageInput}
            onChange={(e) => setCustomLanguageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomLanguage();
              }
            }}
            placeholder={isRtl ? 'أضف لغة أو لهجة خاصة غير موجودة...' : 'Add a custom unlisted language/dialect...'}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => handleAddCustomLanguage()}
            disabled={!customLanguageInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إضافة' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
