'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Church as ChurchIcon,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Search,
  X,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Diocese, Church, Step6ChurchPayload } from '@/types/database.types';
import { searchChurchesDatabaseAction } from '@/app/actions/location-data';

export interface Step6ChurchCommitmentProps {
  primaryCityId?: string;
  secondaryCityId?: string;
  dioceses?: Diocese[];
  churches?: Church[];
  defaultValues?: Partial<Step6ChurchPayload>;
  isRtl?: boolean;
  onSubmitAction: (payload: Step6ChurchPayload) => Promise<void> | void;
  onBack: () => void;
}

// Comprehensive offline fallback dataset for Dioceses across Egypt
const DEFAULT_DIOCESES: Diocese[] = [
  { id: 'dio-assiut-1', name_ar: 'إيبارشية أسيوط وساحل سليم والبداري', name_en: 'Diocese of Assiut & Dar El Salam' },
  { id: 'dio-assiut-2', name_ar: 'إيبارشية ديروط وصنبو', name_en: 'Diocese of Dairut & Sanabu' },
  { id: 'dio-assiut-3', name_ar: 'إيبارشية القوصية ومير', name_en: 'Diocese of El Quseyya & Meir' },
  { id: 'dio-cairo-1', name_ar: 'إيبارشية مصر الجديدة وشرق القاهرة', name_en: 'Diocese of Heliopolis & East Cairo' },
  { id: 'dio-cairo-2', name_ar: 'إيبارشية شبرا الخيمة وتوابعها', name_en: 'Diocese of Shoubra El Kheima' },
  { id: 'dio-cairo-3', name_ar: 'إيبارشية المعادي والبساتين', name_en: 'Diocese of Maadi & El Basateen' },
  { id: 'dio-alex-1', name_ar: 'بطريركية الإسكندرية للأقباط الأرثوذكس', name_en: 'Coptic Orthodox Patriarchate of Alexandria' },
  { id: 'dio-giza-1', name_ar: 'إيبارشية الجيزة وتوابعها', name_en: 'Diocese of Giza & Affiliates' },
  { id: 'dio-giza-2', name_ar: 'إيبارشية 6 أكتوبر والشيخ زايد', name_en: 'Diocese of 6th October & Sheikh Zayed' },
  { id: 'dio-minya-1', name_ar: 'إيبارشية المنيا وتوابعها', name_en: 'Diocese of Minya & Affiliates' },
  { id: 'dio-sohag-1', name_ar: 'إيبارشية سوهاج والمنشاة والمراغة', name_en: 'Diocese of Sohag' },
  { id: 'dio-qena-1', name_ar: 'إيبارشية قنا وتوابعها', name_en: 'Diocese of Qena & Affiliates' },
  { id: 'dio-luxor-1', name_ar: 'إيبارشية الأقصر وتوابعها', name_en: 'Diocese of Luxor' },
  { id: 'dio-aswan-1', name_ar: 'إيبارشية أسوان وتوابعها', name_en: 'Diocese of Aswan' },
  { id: 'dio-redsea-1', name_ar: 'إيبارشية البحر الأحمر (الغردقة)', name_en: 'Diocese of Red Sea (Hurghada)' },
  { id: 'dio-portsaid-1', name_ar: 'إيبارشية بورسعيد وتوابعها', name_en: 'Diocese of Port Said' },
  { id: 'dio-gharbia-1', name_ar: 'إيبارشية طنطا وتوابعها', name_en: 'Diocese of Tanta & Gharbia' },
  { id: 'dio-dakahlia-1', name_ar: 'إيبارشية المنصورة وتوابعها', name_en: 'Diocese of Mansoura' },
];

// Comprehensive offline fallback dataset for famous Coptic Churches in Egypt
const DEFAULT_CHURCHES: Church[] = [
  // Assiut
  { id: 'ch-assiut-1', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333321', name_ar: 'كاتدرائية رئيس الملائكة ميخائيل (الجمهورية)', name_en: 'Archangel Michael Cathedral (Al Gomhoureya)' },
  { id: 'ch-assiut-2', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333321', name_ar: 'كنيسة الشهيد العظيم مارمرقس (حي السادات)', name_en: 'St. Mark Church (Nasser / Al Sadat)' },
  { id: 'ch-assiut-3', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333321', name_ar: 'كنيسة الشهيد مارجرجس (يسري راغب والجلاء)', name_en: 'St. George Church (El Galaa / Yousri Ragheb)' },
  { id: 'ch-assiut-4', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333321', name_ar: 'كنيسة الشهيد أبانوب النهيسي (حي النميس)', name_en: 'St. Abanoub Church (El Nemis)' },
  { id: 'ch-new-assiut-1', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333322', name_ar: 'كاتدرائية السيدة العذراء وملاك ميخائيل (أسيوط الجديدة)', name_en: 'Virgin Mary & Archangel Michael Cathedral' },
  { id: 'ch-dairut-1', diocese_id: 'dio-assiut-2', city_id: '33333333-3333-3333-3333-333333333323', name_ar: 'كنيسة السيدة العذراء بديروط', name_en: 'Virgin Mary Church (Dairut)' },
  { id: 'ch-quseyya-1', diocese_id: 'dio-assiut-3', city_id: '33333333-3333-3333-3333-333333333324', name_ar: 'دير المحرق (السيدة العذراء مريم - القوصية)', name_en: 'Al-Muharraq Monastery (Virgin Mary - El Quseyya)' },

  // Cairo & Heliopolis
  { id: 'ch-cairo-1', diocese_id: 'dio-cairo-1', city_id: '11111111-1111-1111-1111-111133333301', name_ar: 'الكاتدرائية المرقسية بالعباسية (القاهرة)', name_en: 'St. Mark Coptic Orthodox Cathedral (Abbassia)' },
  { id: 'ch-cairo-2', diocese_id: 'dio-cairo-1', city_id: '11111111-1111-1111-1111-111133333301', name_ar: 'كنيسة السيدة العذراء بالزيتون (القاهرة)', name_en: 'Virgin Mary Church (El Zeitoun)' },
  { id: 'ch-cairo-3', diocese_id: 'dio-cairo-1', city_id: '11111111-1111-1111-1111-111133333301', name_ar: 'كنيسة الشهيد مارجرجس بمصر الجديدة', name_en: 'St. George Church (Heliopolis)' },
  { id: 'ch-cairo-4', diocese_id: 'dio-cairo-1', city_id: '11111111-1111-1111-1111-111133333301', name_ar: 'كنيسة العذراء والقديس أثناسيوس بمدينة نصر', name_en: 'Virgin Mary & St. Athanasius (Nasr City)' },
  { id: 'ch-cairo-5', diocese_id: 'dio-cairo-3', city_id: '11111111-1111-1111-1111-111133333301', name_ar: 'كنيسة المعلقة (مصر القديمة)', name_en: 'The Hanging Church (Old Cairo)' },
  { id: 'ch-cairo-6', diocese_id: 'dio-cairo-3', city_id: '11111111-1111-1111-1111-111133333301', name_ar: 'كنيسة السيدة العذراء بالمعادي', name_en: 'Virgin Mary Church (Maadi)' },

  // Giza & 6th October
  { id: 'ch-giza-1', diocese_id: 'dio-giza-1', city_id: '44444444-4444-4444-4444-444433333301', name_ar: 'كنيسة الشهيد مارمينا بالدقي (الجيزة)', name_en: 'St. Mina Church (Dokki)' },
  { id: 'ch-giza-2', diocese_id: 'dio-giza-1', city_id: '44444444-4444-4444-4444-444433333301', name_ar: 'كنيسة العذراء والملاك بالدقي', name_en: 'Virgin Mary & Archangel (Dokki)' },
  { id: 'ch-october-1', diocese_id: 'dio-giza-2', city_id: '44444444-4444-4444-4444-444433333302', name_ar: 'كنيسة السيدة العذراء ومارمرقس (6 أكتوبر)', name_en: 'Virgin Mary & St. Mark (6th of October)' },

  // Alexandria
  { id: 'ch-alex-1', diocese_id: 'dio-alex-1', city_id: '22222222-2222-2222-2222-222233333301', name_ar: 'الكاتدرائية المرقسية بمحطة الرمل (الإسكندرية)', name_en: 'St. Mark Cathedral (Ramleh, Alexandria)' },
  { id: 'ch-alex-2', diocese_id: 'dio-alex-1', city_id: '22222222-2222-2222-2222-222233333301', name_ar: 'كنيسة الشهيد العظيم مارمرقس بكليوباترا', name_en: 'St. Mark Church (Cleopatra, Alexandria)' },
  { id: 'ch-alex-3', diocese_id: 'dio-alex-1', city_id: '22222222-2222-2222-2222-222233333301', name_ar: 'دير الشهيد العظيم مارمينا العجائبي (بمريوط)', name_en: 'St. Mina Monastery (Mariout, Alexandria)' },

  // Upper Egypt (Minya, Sohag, Qena, Luxor, Aswan)
  { id: 'ch-minya-1', diocese_id: 'dio-minya-1', city_id: '55555555-5555-5555-5555-555533333301', name_ar: 'كنيسة الام سارافيم والشهيد مارجرجس بالمنيا', name_en: 'St. George Cathedral (Minya)' },
  { id: 'ch-sohag-1', diocese_id: 'dio-sohag-1', city_id: '66666666-6666-6666-6666-666633333301', name_ar: 'كنيسة السيدة العذراء بسوهاج', name_en: 'Virgin Mary Church (Sohag)' },
  { id: 'ch-qena-1', diocese_id: 'dio-qena-1', city_id: '77777777-7777-7777-7777-777733333301', name_ar: 'كنيسة مارجرجس بقنا', name_en: 'St. George Church (Qena)' },
  { id: 'ch-luxor-1', diocese_id: 'dio-luxor-1', city_id: '88888888-8888-8888-8888-888833333301', name_ar: 'كاتدرائية السيدة العذراء بالأقصر', name_en: 'Virgin Mary Cathedral (Luxor)' },
  { id: 'ch-aswan-1', diocese_id: 'dio-aswan-1', city_id: '99999999-9999-9999-9999-999933333301', name_ar: 'كاتدرائية رئيس الملائكة ميخائيل بأسوان', name_en: 'Archangel Michael Cathedral (Aswan)' },

  // Coastal & Canal (Red Sea, Port Said, Tanta, Mansoura)
  { id: 'ch-redsea-1', diocese_id: 'dio-redsea-1', city_id: '10101010-1010-1010-1010-101033333301', name_ar: 'كنيسة الأنبا شنودة بالغردقة', name_en: 'St. Shenouda Church (Hurghada)' },
  { id: 'ch-portsaid-1', diocese_id: 'dio-portsaid-1', city_id: '12121212-1212-1212-1212-121233333301', name_ar: 'كاتدرائية العذراء والملاك ببورسعيد', name_en: 'Virgin Mary & Archangel Cathedral (Port Said)' },
  { id: 'ch-tanta-1', diocese_id: 'dio-gharbia-1', city_id: '13131313-1313-1313-1313-131333333301', name_ar: 'كنيسة الشهيد مارجرجس بطنطا', name_en: 'St. George Cathedral (Tanta)' },
  { id: 'ch-mansoura-1', diocese_id: 'dio-dakahlia-1', city_id: '14141414-1414-1414-1414-141433333301', name_ar: 'كنيسة العذراء بالمنصورة', name_en: 'Virgin Mary Church (Mansoura)' },
];

const MAX_SECONDARY_CHURCHES = 10;

/* Custom Account-Picker Dropdown for Churches with Location-Priority Search */
interface ChurchDropdownProps {
  id: string;
  label: string;
  labelAr: string;
  required?: boolean;
  value: string;
  onChange: (churchId: string) => void;
  churches: Church[];
  primaryCityId?: string;
  secondaryCityId?: string;
  isRtl?: boolean;
  placeholder?: string;
  placeholderAr?: string;
  error?: string;
}

function AccountPickerChurchDropdown({
  id,
  label,
  labelAr,
  required = false,
  value,
  onChange,
  churches,
  primaryCityId,
  secondaryCityId,
  isRtl = false,
  placeholder = 'Select church...',
  placeholderAr = 'اختر الكنيسة...',
  error,
}: ChurchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbResults, setDbResults] = useState<Church[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Live Supabase Database Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        const res = await searchChurchesDatabaseAction(searchQuery);
        if (res.success && res.churches) {
          setDbResults(res.churches as Church[]);
        }
      } catch (e) {
        console.warn('DB church search notice:', e);
      } finally {
        setIsSearchingDb(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Merge passed churches with live DB search results
  const combinedChurches = useMemo(() => {
    const map = new Map<string, Church>();
    churches.forEach((c) => map.set(c.id, c));
    dbResults.forEach((c) => map.set(c.id, c));
    return Array.from(map.values());
  }, [churches, dbResults]);

  const selectedChurch = useMemo(() => {
    return combinedChurches.find((c) => c.id === value);
  }, [combinedChurches, value]);

  // Location-Priority Sorting & Query Filtering
  const filteredAndSortedChurches = useMemo(() => {
    let list = combinedChurches;

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) => c.name_en.toLowerCase().includes(q) || c.name_ar.includes(q)
      );
    }

    // 2. Priority Sorting by Location
    return [...list].sort((a, b) => {
      const aIsPrimary = primaryCityId && a.city_id === primaryCityId ? 1 : 0;
      const bIsPrimary = primaryCityId && b.city_id === primaryCityId ? 1 : 0;
      if (aIsPrimary !== bIsPrimary) return bIsPrimary - aIsPrimary;

      const aIsSecondary = secondaryCityId && a.city_id === secondaryCityId ? 1 : 0;
      const bIsSecondary = secondaryCityId && b.city_id === secondaryCityId ? 1 : 0;
      if (aIsSecondary !== bIsSecondary) return bIsSecondary - aIsSecondary;

      return (isRtl ? a.name_ar : a.name_en).localeCompare(isRtl ? b.name_ar : b.name_en);
    });
  }, [combinedChurches, searchQuery, primaryCityId, secondaryCityId, isRtl]);

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        <span>{isRtl ? labelAr : label}</span>
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          "w-full px-3.5 py-2.5 rounded-xl border text-start flex items-center justify-between transition-all duration-200 cursor-pointer bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          error ? "border-rose-500 bg-rose-50/20" : isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-300 dark:border-slate-700"
        )}
      >
        {selectedChurch ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
              <ChurchIcon className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate leading-snug">
                {isRtl ? selectedChurch.name_ar : selectedChurch.name_en}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-snug flex items-center gap-1.5">
                <span>{isRtl ? selectedChurch.name_en : selectedChurch.name_ar}</span>
                {primaryCityId && selectedChurch.city_id === primaryCityId && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    <MapPin className="w-2.5 h-2.5" />
                    <bdi>{isRtl ? 'الرئيسي' : 'Primary Area'}</bdi>
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            {isRtl ? placeholderAr : placeholder}
          </span>
        )}

        <ChevronDown
          className={clsx(
            "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ms-2",
            isOpen && "rotate-180 text-blue-600 dark:text-blue-400"
          )}
        />
      </button>

      {error && <p className="text-xs text-rose-500 font-medium pt-0.5">{error}</p>}

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
            {/* Live Search Input at top of menu */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث في كافة كنائس مصر...' : 'Search all churches in Egypt...'}
                  autoFocus
                  className="w-full ps-8 pe-7 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {isSearchingDb ? (
                  <Loader2 className="w-3 h-3 absolute top-1/2 -translate-y-1/2 end-2.5 text-blue-500 animate-spin" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 -translate-y-1/2 end-2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Account-Picker Tile List with Location-Priority Badges */}
            <div className="overflow-y-auto p-1.5 space-y-1 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredAndSortedChurches.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {isRtl ? 'لم يتم العثور على كنائس بهذا الاسم' : 'No churches found'}
                </div>
              ) : (
                filteredAndSortedChurches.map((ch) => {
                  const isSelected = ch.id === value;
                  const isPrimaryMatch = primaryCityId && ch.city_id === primaryCityId;
                  const isSecondaryMatch = secondaryCityId && ch.city_id === secondaryCityId;

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        onChange(ch.id);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={clsx(
                        "w-full p-2 rounded-xl border text-start flex items-center justify-between transition-all duration-150 cursor-pointer group",
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                          : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200"
                      )}
                    >
                      {/* Account-Picker Tile Content */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-xs",
                            isSelected
                              ? "bg-blue-600 text-white"
                              : isPrimaryMatch
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          )}
                        >
                          <ChurchIcon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate flex items-center gap-1.5">
                            <span>{isRtl ? ch.name_ar : ch.name_en}</span>
                            {isPrimaryMatch && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                                <bdi>{isRtl ? 'منطقتك الأساسية' : 'Primary Area'}</bdi>
                              </span>
                            )}
                            {isSecondaryMatch && !isPrimaryMatch && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                                <MapPin className="w-2.5 h-2.5 text-purple-500" />
                                <bdi>{isRtl ? 'عنوانك الثانوي' : 'Secondary Area'}</bdi>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {isRtl ? ch.name_en : ch.name_ar}
                          </div>
                        </div>
                      </div>

                      {/* Checkmark Indicator */}
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ms-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Step6ChurchCommitment({
  primaryCityId,
  secondaryCityId,
  dioceses = [],
  churches = [],
  defaultValues,
  isRtl = false,
  onSubmitAction,
  onBack,
}: Step6ChurchCommitmentProps) {
  const allDioceses = dioceses.length > 0 ? dioceses : DEFAULT_DIOCESES;
  const allChurches = churches.length > 0 ? churches : DEFAULT_CHURCHES;

  // --- Primary Church State ---
  const [primaryChurchId, setPrimaryChurchId] = useState<string>(defaultValues?.primary_church_id || '');
  const [primaryDioceseId, setPrimaryDioceseId] = useState<string>(defaultValues?.primary_diocese_id || '');
  const [showAllPrimaryChurches, setShowAllPrimaryChurches] = useState<boolean>(false);

  // --- Secondary Churches List State (up to 10) ---
  const initialSecondaryList: string[] = useMemo(() => {
    if (defaultValues?.additional_churches && defaultValues.additional_churches.length > 0) {
      return defaultValues.additional_churches.map((c) => c.id).slice(0, MAX_SECONDARY_CHURCHES);
    }
    if (defaultValues?.secondary_church_id) {
      return [defaultValues.secondary_church_id];
    }
    return [];
  }, [defaultValues]);

  const [secondaryChurchIds, setSecondaryChurchIds] = useState<string[]>(initialSecondaryList);
  const [showAllSecondaryChurches, setShowAllSecondaryChurches] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter & Rank Primary Churches by Location
  const primaryFilteredChurches = useMemo(() => {
    if (showAllPrimaryChurches || !primaryCityId) {
      return allChurches;
    }
    const filtered = allChurches.filter((c) => c.city_id === primaryCityId);
    return filtered.length > 0 ? filtered : allChurches;
  }, [allChurches, primaryCityId, showAllPrimaryChurches]);

  // Filter & Rank Secondary Churches by Location
  const secondaryFilteredChurches = useMemo(() => {
    if (showAllSecondaryChurches || !secondaryCityId) {
      return allChurches;
    }
    const filtered = allChurches.filter((c) => c.city_id === secondaryCityId);
    return filtered.length > 0 ? filtered : allChurches;
  }, [allChurches, secondaryCityId, showAllSecondaryChurches]);

  // Auto-detect & sync Diocese when Primary Church changes
  const handlePrimaryChurchChange = (churchId: string) => {
    setPrimaryChurchId(churchId);
    setErrors((prev) => ({ ...prev, primaryChurchId: '' }));

    const selectedChurch = allChurches.find((c) => c.id === churchId);
    if (selectedChurch && selectedChurch.diocese_id) {
      setPrimaryDioceseId(selectedChurch.diocese_id);
    }
  };

  // Add Secondary Church Entry (up to 10)
  const handleAddSecondaryChurch = () => {
    if (secondaryChurchIds.length < MAX_SECONDARY_CHURCHES) {
      setSecondaryChurchIds([...secondaryChurchIds, '']);
    }
  };

  // Update Secondary Church Entry by Index
  const handleSecondaryChurchChangeAt = (index: number, churchId: string) => {
    setSecondaryChurchIds((prev) => {
      const copy = [...prev];
      copy[index] = churchId;
      return copy;
    });
  };

  // Remove Secondary Church Entry by Index
  const handleRemoveSecondaryChurchAt = (index: number) => {
    setSecondaryChurchIds((prev) => prev.filter((_, i) => i !== index));
  };

  // Lookup Diocese objects for display
  const primaryDioceseObj = useMemo(() => {
    return allDioceses.find((d) => d.id === primaryDioceseId);
  }, [allDioceses, primaryDioceseId]);

  // Selected Primary Church object
  const selectedPrimaryChurchObj = useMemo(() => {
    return allChurches.find((c) => c.id === primaryChurchId);
  }, [allChurches, primaryChurchId]);

  const handleNext = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!primaryChurchId) {
      setErrors({
        primaryChurchId: isRtl ? 'يرجى اختيار الكنيسة الأساسية' : 'Please select your primary church',
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const validSecondaryIds = secondaryChurchIds.filter((id) => Boolean(id.trim()));
    const firstSecondaryId = validSecondaryIds[0];
    const firstSecondaryChurchObj = allChurches.find((c) => c.id === firstSecondaryId);
    const firstSecondaryDioceseObj = firstSecondaryChurchObj?.diocese_id
      ? allDioceses.find((d) => d.id === firstSecondaryChurchObj.diocese_id)
      : undefined;

    const additionalChurchesPayload = validSecondaryIds.map((id) => {
      const ch = allChurches.find((c) => c.id === id);
      return {
        id,
        name: ch ? (isRtl ? ch.name_ar : ch.name_en) : undefined,
      };
    });

    const payload: Step6ChurchPayload = {
      primary_church_id: primaryChurchId,
      primary_diocese_id: primaryDioceseId || undefined,
      primary_church_name: selectedPrimaryChurchObj
        ? isRtl
          ? selectedPrimaryChurchObj.name_ar
          : selectedPrimaryChurchObj.name_en
        : undefined,
      primary_diocese_name: primaryDioceseObj
        ? isRtl
          ? primaryDioceseObj.name_ar
          : primaryDioceseObj.name_en
        : undefined,

      secondary_church_id: firstSecondaryId || undefined,
      secondary_diocese_id: firstSecondaryDioceseObj?.id || undefined,
      secondary_church_name: firstSecondaryChurchObj
        ? isRtl
          ? firstSecondaryChurchObj.name_ar
          : firstSecondaryChurchObj.name_en
        : undefined,
      secondary_diocese_name: firstSecondaryDioceseObj
        ? isRtl
          ? firstSecondaryDioceseObj.name_ar
          : firstSecondaryDioceseObj.name_en
        : undefined,
      additional_churches: additionalChurchesPayload,
    };

    try {
      await onSubmitAction(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
      {/* Vertically Centered Form Container */}
      <div className="flex-grow flex flex-col justify-center min-h-[300px] w-full py-2 animate-fadeIn">
        <div className="space-y-4 max-w-xl mx-auto w-full">

          {/* PRIMARY CHURCH CARD */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ChurchIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isRtl ? 'الكنيسة الأساسية (كنيسة الحي / محل الإقامة)' : 'Primary Church (Parish)'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </span>

              {primaryCityId && (
                <button
                  type="button"
                  onClick={() => setShowAllPrimaryChurches(!showAllPrimaryChurches)}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {showAllPrimaryChurches
                    ? isRtl
                      ? 'عرض كنائس منطقتي فقط'
                      : 'Show my area only'
                    : isRtl
                    ? 'عرض جميع الكنائس'
                    : 'Show all churches'}
                </button>
              )}
            </div>

            {/* Primary Church Custom Account-Picker Dropdown */}
            <AccountPickerChurchDropdown
              id="primary-church-select"
              label="Select Primary Church"
              labelAr="اختر الكنيسة التابع لها"
              required
              value={primaryChurchId}
              onChange={handlePrimaryChurchChange}
              churches={primaryFilteredChurches}
              primaryCityId={primaryCityId}
              secondaryCityId={secondaryCityId}
              isRtl={isRtl}
              placeholder="Search database for primary church..."
              placeholderAr="ابحث في قاعدة البيانات عن الكنيسة..."
              error={errors.primaryChurchId}
            />
          </div>

          {/* SECONDARY CHURCHES LIST SECTION (UP TO 10) */}
          <div className="space-y-3">
            {secondaryChurchIds.map((secId, idx) => (
              <div
                key={`secondary-church-${idx}`}
                className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-blue-200 dark:border-blue-900/40 p-4 shadow-xs space-y-3.5 animate-fadeIn"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ChurchIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {isRtl
                        ? `الكنيسة الثانوية ${idx + 1} (اختياري)`
                        : `Secondary Church ${idx + 1} (Optional)`}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveSecondaryChurchAt(idx)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-2 py-1 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isRtl ? 'حذف' : 'Remove'}</span>
                  </button>
                </div>

                <AccountPickerChurchDropdown
                  id={`secondary-church-select-${idx}`}
                  label={`Select Secondary Church ${idx + 1}`}
                  labelAr={`اختر الكنيسة الثانوية ${idx + 1}`}
                  value={secId}
                  onChange={(chId) => handleSecondaryChurchChangeAt(idx, chId)}
                  churches={secondaryFilteredChurches}
                  primaryCityId={primaryCityId}
                  secondaryCityId={secondaryCityId}
                  isRtl={isRtl}
                  placeholder="Search database for secondary church..."
                  placeholderAr="ابحث في قاعدة البيانات عن الكنيسة الثانوية..."
                />
              </div>
            ))}

            {/* Add Secondary Church Button (Max 10) */}
            {secondaryChurchIds.length < MAX_SECONDARY_CHURCHES && (
              <button
                type="button"
                onClick={handleAddSecondaryChurch}
                className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 text-xs font-semibold text-blue-600 dark:text-blue-400 transition flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>
                  {isRtl
                    ? `+ إضافة كنيسة ثانوية أخرى (${secondaryChurchIds.length} من ${MAX_SECONDARY_CHURCHES})`
                    : `+ Add Secondary Church (${secondaryChurchIds.length} of ${MAX_SECONDARY_CHURCHES})`}
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Action Buttons (Pinned to bottom) */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-4 py-2 rounded-full cursor-pointer"
        >
          {isRtl ? 'السابق' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm bg-[#0B57D0] hover:bg-[#0842A0] text-white cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>{isRtl ? 'التالي' : 'Next'}</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default Step6ChurchCommitment;
