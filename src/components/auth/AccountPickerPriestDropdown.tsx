'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, Check, Search, X, PlusCircle } from 'lucide-react';
import { Priest } from '@/types/database.types';

export const MOCK_PRIESTS: Priest[] = [
  { id: 'pr-1', name_en: 'Fr. Michael Abdelmalek', name_ar: 'القمص ميخائيل عبد الملك', title_en: 'Hegumen', title_ar: 'القمص' },
  { id: 'pr-2', name_en: 'Fr. Markos Shafik', name_ar: 'القس مرقس شفيق', title_en: 'Priest', title_ar: 'القس' },
  { id: 'pr-3', name_en: 'Fr. Bishoy Youssef', name_ar: 'القمص بيشوي يوسف', title_en: 'Hegumen', title_ar: 'القمص' },
  { id: 'pr-4', name_en: 'Fr. Shenouda Hanna', name_ar: 'القس شنودة حنا', title_en: 'Priest', title_ar: 'القس' },
  { id: 'pr-5', name_en: 'Fr. Mina Aziz', name_ar: 'القس مينا عزيز', title_en: 'Priest', title_ar: 'القس' },
  { id: 'pr-6', name_en: 'Fr. Youhanna Makram', name_ar: 'القمص يوحنا مكرم', title_en: 'Hegumen', title_ar: 'القمص' },
  { id: 'pr-7', name_en: 'Fr. Karas Nagy', name_ar: 'القس كاراس ناجي', title_en: 'Priest', title_ar: 'القس' },
];

export interface AccountPickerPriestDropdownProps {
  id?: string;
  value: string; // priestId or '__custom__' or ''
  priestName: string;
  isCustomPriest: boolean;
  priests?: Priest[];
  churchName?: string;
  isRtl?: boolean;
  onChange: (priestId: string, priestName: string, isCustom: boolean) => void;
}

export function AccountPickerPriestDropdown({
  id = 'priest-dropdown',
  value,
  priestName,
  isCustomPriest,
  priests = MOCK_PRIESTS,
  churchName,
  isRtl = false,
  onChange,
}: AccountPickerPriestDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const priestList = useMemo(() => {
    return priests && priests.length > 0 ? priests : MOCK_PRIESTS;
  }, [priests]);

  // Click Outside Handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPriest = useMemo(() => {
    if (isCustomPriest) return null;
    return priestList.find((p) => p.id === value);
  }, [priestList, value, isCustomPriest]);

  const filteredPriests = useMemo(() => {
    if (!searchQuery.trim()) return priestList;
    const q = searchQuery.toLowerCase().trim();
    return priestList.filter(
      (p) =>
        p.name_en.toLowerCase().includes(q) ||
        p.name_ar.includes(q) ||
        (p.title_en && p.title_en.toLowerCase().includes(q)) ||
        (p.title_ar && p.title_ar.includes(q))
    );
  }, [priestList, searchQuery]);

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {isRtl ? 'اختر أب الاعتراف من قائمة كاهني الكنيسة' : 'Select Father of Confession from clergy list'}
      </label>

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        data-testid="priest-select-dropdown"
        aria-label={isRtl ? 'اختر أب الاعتراف' : 'Select Father of Confession'}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          "w-full px-3.5 py-2.5 rounded-xl border text-start flex items-center justify-between transition-all duration-200 cursor-pointer bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-300 dark:border-slate-700"
        )}
      >
        {isCustomPriest ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {priestName || (isRtl ? 'كاهن آخر (إدخال يدوي)' : 'Other Priest (Manual Entry)')}
              </div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                {isRtl ? 'كاهن آخر خارجي' : 'Other External Priest'}
              </div>
            </div>
          </div>
        ) : selectedPriest ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {isRtl ? selectedPriest.name_ar : selectedPriest.name_en}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {isRtl ? selectedPriest.name_en : selectedPriest.name_ar}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            {isRtl ? 'اختر أب الاعتراف (اختياري)...' : 'Select Father of Confession (optional)...'}
          </span>
        )}

        <ChevronDown
          className={clsx(
            "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ms-2",
            isOpen && "rotate-180 text-blue-600 dark:text-blue-400"
          )}
        />
      </button>

      {/* Manual Name Entry Input when "Other" is selected */}
      {isCustomPriest && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-1.5 space-y-1"
        >
          <label className="block text-[11px] font-semibold text-purple-700 dark:text-purple-300">
            {isRtl ? 'اكتب اسم الكاهن / أب الاعتراف يدويًا:' : 'Type Priest / Father of Confession Name Manually:'}
          </label>
          <input
            type="text"
            value={priestName}
            onChange={(e) => onChange('__custom__', e.target.value, true)}
            placeholder={isRtl ? 'أدخل اسم القمص / القس هنا...' : 'Enter priest name here...'}
            autoFocus
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </motion.div>
      )}

      {/* Account-Picker Suggestions Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full start-0 end-0 mt-1.5 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-72"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث باسم أب الاعتراف...' : 'Search priest by name...'}
                  autoFocus
                  className="w-full ps-8 pe-7 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 -translate-y-1/2 end-2 p-0.5 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Priests Tile List */}
            <div className="overflow-y-auto p-1.5 space-y-1 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* Reset / None Option */}
              <button
                type="button"
                onClick={() => {
                  onChange('', '', false);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full p-2 rounded-xl text-start text-xs font-semibold transition-colors cursor-pointer",
                  !value && !isCustomPriest
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}
              >
                {isRtl ? 'بدون إدخال / لا يوجد كاهن محدد' : 'None / Not specified'}
              </button>

              {filteredPriests.map((p) => {
                const isSelected = !isCustomPriest && p.id === value;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.id, isRtl ? p.name_ar : p.name_en, false);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "w-full p-2 rounded-xl border text-start flex items-center justify-between transition-all duration-150 cursor-pointer group",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                        : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-colors",
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        )}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {isRtl ? p.name_ar : p.name_en}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {isRtl ? p.name_en : p.name_ar}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ms-2" />}
                  </button>
                );
              })}

              {/* Explicit "Other / آخر" Option */}
              <button
                type="button"
                onClick={() => {
                  onChange('__custom__', priestName || '', true);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full p-2.5 rounded-xl border border-dashed text-start flex items-center justify-between transition-all duration-150 cursor-pointer mt-1",
                  isCustomPriest
                    ? "bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                    : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold truncate">
                    {isRtl ? 'آخر / إدخال كاهن آخر غير مدرج بالقائمة' : 'Other / Enter priest name manually'}
                  </div>
                </div>
                {isCustomPriest && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 ms-2" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AccountPickerPriestDropdown;
