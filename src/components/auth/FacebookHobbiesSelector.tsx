'use client';

import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  Search,
  Check,
  X,
  Plus,
  Heart,
  RotateCcw,
} from 'lucide-react';
import {
  COMPREHENSIVE_HOBBIES,
  HOBBY_CATEGORIES,
} from '@/lib/constants/hobbiesData';

interface FacebookHobbiesSelectorProps {
  selectedHobbies: string[];
  onChange: (hobbies: string[]) => void;
  isRtl?: boolean;
}

export default function FacebookHobbiesSelector({
  selectedHobbies,
  onChange,
  isRtl = false,
}: FacebookHobbiesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customHobbyInput, setCustomHobbyInput] = useState('');
  const [customHobbiesList, setCustomHobbiesList] = useState<{ id: string; name: string }[]>([]);

  // Toggle selection
  const handleToggleHobby = (hobbyId: string) => {
    if (selectedHobbies.includes(hobbyId)) {
      onChange(selectedHobbies.filter((id) => id !== hobbyId));
    } else {
      onChange([...selectedHobbies, hobbyId]);
    }
  };

  // Add custom hobby
  const handleAddCustomHobby = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const clean = customHobbyInput.trim();
    if (!clean) return;

    const customId = `custom_${Date.now()}_${clean.toLowerCase().replace(/\s+/g, '_')}`;
    setCustomHobbiesList((prev) => [...prev, { id: customId, name: clean }]);
    onChange([...selectedHobbies, customId]);
    setCustomHobbyInput('');
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };

  // Filter hobbies by category and search query
  const filteredHobbies = useMemo(() => {
    return COMPREHENSIVE_HOBBIES.filter((h) => {
      const matchesCategory = activeCategory === 'all' || h.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        h.labelEn.toLowerCase().includes(q) ||
        h.labelAr.includes(q) ||
        h.id.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  // Selected items with metadata
  const selectedItemsDetails = useMemo(() => {
    return selectedHobbies.map((id) => {
      const predefined = COMPREHENSIVE_HOBBIES.find((h) => h.id === id);
      if (predefined) {
        return {
          id: predefined.id,
          emoji: predefined.emoji,
          label: isRtl ? predefined.labelAr : predefined.labelEn,
        };
      }
      const custom = customHobbiesList.find((c) => c.id === id);
      return {
        id,
        emoji: '⭐',
        label: custom ? custom.name : id,
      };
    });
  }, [selectedHobbies, isRtl, customHobbiesList]);

  return (
    <div className="w-full space-y-3.5">
      {/* 1. Header & Counter */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>{isRtl ? 'الهوايات والأنشطة المفضلة' : 'Hobbies & Church Activities'}</span>
        </label>

        {selectedHobbies.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
              {isRtl ? `تم اختيار ${selectedHobbies.length}` : `${selectedHobbies.length} selected`}
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

      {/* 2. Selected Items Chip Tray (Borderless, Hidden Scrollbar) */}
      {selectedItemsDetails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 animate-fadeIn">
          {selectedItemsDetails.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 transition"
            >
              <span className="text-xs">{item.emoji}</span>
              <span className="truncate max-w-[140px]">{item.label}</span>
              <button
                type="button"
                onClick={() => handleToggleHobby(item.id)}
                className="w-3.5 h-3.5 rounded-full hover:bg-blue-200/80 dark:hover:bg-blue-800 inline-flex items-center justify-center text-blue-400 hover:text-rose-500 transition cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 3. Streamlined Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isRtl ? 'ابحث في أكثر من 80 هواية ونشاط...' : 'Search 80+ hobbies & activities...'}
          className="w-full ps-9 pe-8 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. Sleek Borderless Category Tabs Slider (Hidden Scrollbar) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-[11px]">
        {HOBBY_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                "px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                isActive
                  ? "bg-slate-200/90 dark:bg-white/10 text-slate-900 dark:text-white font-semibold shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
              )}
            >
              <span>{cat.emoji}</span>
              <span>{isRtl ? cat.labelAr : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Flat & Airy Hobbies Badges Grid (Hidden Scrollbar, Outline Style) */}
      <div className="max-h-[220px] overflow-y-auto py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-wrap gap-1.5">
          {filteredHobbies.map((h) => {
            const isSelected = selectedHobbies.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => handleToggleHobby(h.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none transform active:scale-95",
                  isSelected
                    ? "bg-blue-600 text-white border border-blue-600 shadow-xs font-semibold"
                    : "border border-slate-300/80 dark:border-slate-700/80 bg-transparent text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
                )}
              >
                <span>{h.emoji}</span>
                <span>{isRtl ? h.labelAr : h.labelEn}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5 stroke-[2.5]" />}
              </button>
            );
          })}

          {filteredHobbies.length === 0 && (
            <div className="w-full py-6 text-center text-xs text-slate-400">
              {isRtl ? 'لم نجد هواية مطابقة للبحث' : 'No hobbies found matching search'}
            </div>
          )}
        </div>
      </div>

      {/* 6. Streamlined Custom Hobby Write-in Bar */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={customHobbyInput}
            onChange={(e) => setCustomHobbyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomHobby();
              }
            }}
            placeholder={isRtl ? 'أضف نشاط أو هواية خاصة بك غير موجودة...' : 'Add your own custom hobby...'}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => handleAddCustomHobby()}
            disabled={!customHobbyInput.trim()}
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
