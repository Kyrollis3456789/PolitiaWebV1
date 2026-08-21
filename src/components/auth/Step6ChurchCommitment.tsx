'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Church as ChurchIcon,
  ChevronDown,
  Check,
  Plus,
  ArrowLeft,
  ArrowRight,
  Search,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import { Diocese, Church, Step6ChurchPayload } from '@/types/database.types';
import { tapScale } from '@/lib/animations/transitions';

export interface Step6ChurchCommitmentProps {
  primaryCityId?: string;
  secondaryCityId?: string;
  dioceses?: Diocese[];
  churches?: Church[];
  defaultValues?: Partial<Step6ChurchPayload>;
  isRtl?: boolean;
  onSubmitAction: (payload: Step6ChurchPayload) => Promise<void> | void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// Built-in offline fallback data
const DEFAULT_DIOCESES: Diocese[] = [
  { id: 'dio-assiut-1', name_ar: 'إيبارشية أسيوط وساحل سليم والبداري', name_en: 'Diocese of Assiut & Dar El Salam' },
  { id: 'dio-cairo-1', name_ar: 'إيبارشية مصر الجديدة وشرق القاهرة', name_en: 'Diocese of Heliopolis & East Cairo' },
  { id: 'dio-alex-1', name_ar: 'بطريركية الإسكندرية للأقباط الأرثوذكس', name_en: 'Coptic Orthodox Patriarchate of Alexandria' },
];

const DEFAULT_CHURCHES: Church[] = [
  { id: 'ch-assiut-1', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333321', name_ar: 'كاتدرائية رئيس الملائكة ميخائيل (الجمهورية)', name_en: 'Archangel Michael Cathedral (Al Gomhoureya)' },
  { id: 'ch-assiut-2', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333321', name_ar: 'كنيسة الشهيد العظيم مارمرقس (حي السادات)', name_en: 'St. Mark Church (Nasser / Al Sadat)' },
  { id: 'ch-assiut-3', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333321', name_ar: 'كنيسة الشهيد مارجرجس (يسري راغب والجلاء)', name_en: 'St. George Church (El Galaa / Yousri Ragheb)' },
  { id: 'ch-new-assiut-1', diocese_id: 'dio-assiut-1', city_id: '33333333-3333-3333-3333-333333333322', name_ar: 'كاتدرائية السيدة العذراء وملاك ميخائيل (أسيوط الجديدة)', name_en: 'Virgin Mary & Archangel Michael Cathedral' },
];

/* Custom Account-Picker Dropdown for Churches */
interface ChurchDropdownProps {
  id: string;
  label: string;
  labelAr: string;
  required?: boolean;
  value: string;
  onChange: (churchId: string) => void;
  churches: Church[];
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
  isRtl = false,
  placeholder = 'Select church...',
  placeholderAr = 'اختر الكنيسة...',
  error,
}: ChurchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const selectedChurch = useMemo(() => {
    return churches.find((c) => c.id === value);
  }, [churches, value]);

  const filteredChurches = useMemo(() => {
    if (!searchQuery.trim()) return churches;
    const q = searchQuery.toLowerCase().trim();
    return churches.filter(
      (c) => c.name_en.toLowerCase().includes(q) || c.name_ar.includes(q)
    );
  }, [churches, searchQuery]);

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
        <span>{isRtl ? labelAr : label}</span>
        {required && <span className="text-rose-400 font-bold">*</span>}
      </label>

      {/* Selected Value Trigger */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          "w-full px-4 py-3 rounded-2xl border text-start flex items-center justify-between transition-all duration-200 cursor-pointer bg-[#182234] text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          error ? "border-rose-500/80" : isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-700/80 hover:border-slate-600"
        )}
      >
        {selectedChurch ? (
          <div className="flex items-center gap-3 min-w-0">
            {/* Church Thumbnail Avatar Tile */}
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0 shadow-xs">
              <ChurchIcon className="w-5 h-5" />
            </div>

            {/* 2-Line Account-Picker Tile Typography */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-100 truncate leading-snug">
                {selectedChurch.name_en}
              </div>
              <div className="text-xs text-slate-400 truncate leading-snug">
                {selectedChurch.name_ar}
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
            isOpen && "rotate-180 text-blue-400"
          )}
        />
      </button>

      {error && <p className="text-xs text-rose-400 font-medium pt-0.5">{error}</p>}

      {/* Dropdown Menu Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full start-0 end-0 mt-2 z-50 rounded-2xl bg-[#131B2A] border border-slate-700/80 shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-72"
          >
            {/* Live Search Input */}
            <div className="p-2.5 border-b border-slate-800/80 bg-[#182234]">
              <div className="relative">
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث عن اسم الكنيسة...' : 'Search church name...'}
                  autoFocus
                  className="w-full ps-9 pe-8 py-2 text-xs rounded-xl bg-[#0F1623] border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 -translate-y-1/2 end-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tile List */}
            <div className="overflow-y-auto p-1.5 space-y-1 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredChurches.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {isRtl ? 'لم يتم العثور على نتائج' : 'No churches found'}
                </div>
              ) : (
                filteredChurches.map((ch) => {
                  const isSelected = ch.id === value;
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
                        "w-full p-2.5 rounded-xl border text-start flex items-center justify-between transition-all duration-150 cursor-pointer group",
                        isSelected
                          ? "bg-blue-950/60 border-blue-600/80 text-blue-300"
                          : "bg-transparent border-transparent hover:bg-[#182234] text-slate-200"
                      )}
                    >
                      {/* Account-Picker Tile Content */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={clsx(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-800 text-slate-400 group-hover:bg-blue-950 group-hover:text-blue-400"
                          )}
                        >
                          <ChurchIcon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-100 group-hover:text-white truncate">
                            {ch.name_en}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {ch.name_ar}
                          </div>
                        </div>
                      </div>

                      {/* Checkmark Indicator */}
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-400 shrink-0 ms-2" />
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
  currentStep = 6,
  totalSteps = 7,
}: Step6ChurchCommitmentProps) {
  const allDioceses = dioceses.length > 0 ? dioceses : DEFAULT_DIOCESES;
  const allChurches = churches.length > 0 ? churches : DEFAULT_CHURCHES;

  // Primary Church State
  const [primaryChurchId, setPrimaryChurchId] = useState<string>(defaultValues?.primary_church_id || '');
  const [primaryDioceseId, setPrimaryDioceseId] = useState<string>(defaultValues?.primary_diocese_id || '');

  // Secondary Church State
  const [hasSecondaryChurch, setHasSecondaryChurch] = useState<boolean>(
    Boolean(defaultValues?.secondary_church_id) || Boolean(secondaryCityId)
  );
  const [secondaryChurchId, setSecondaryChurchId] = useState<string>(defaultValues?.secondary_church_id || '');
  const [secondaryDioceseId, setSecondaryDioceseId] = useState<string>(defaultValues?.secondary_diocese_id || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-detect & sync Diocese when Primary Church changes
  const handlePrimaryChurchChange = (churchId: string) => {
    setPrimaryChurchId(churchId);
    setErrors((prev) => ({ ...prev, primaryChurchId: '' }));

    const selectedChurch = allChurches.find((c) => c.id === churchId);
    if (selectedChurch && selectedChurch.diocese_id) {
      setPrimaryDioceseId(selectedChurch.diocese_id);
    }
  };

  // Auto-detect & sync Diocese when Secondary Church changes
  const handleSecondaryChurchChange = (churchId: string) => {
    setSecondaryChurchId(churchId);

    const selectedChurch = allChurches.find((c) => c.id === churchId);
    if (selectedChurch && selectedChurch.diocese_id) {
      setSecondaryDioceseId(selectedChurch.diocese_id);
    }
  };

  // Lookup Diocese objects for display
  const primaryDioceseObj = useMemo(() => {
    return allDioceses.find((d) => d.id === primaryDioceseId);
  }, [allDioceses, primaryDioceseId]);

  const secondaryDioceseObj = useMemo(() => {
    return allDioceses.find((d) => d.id === secondaryDioceseId);
  }, [allDioceses, secondaryDioceseId]);

  const selectedPrimaryChurchObj = useMemo(() => {
    return allChurches.find((c) => c.id === primaryChurchId);
  }, [allChurches, primaryChurchId]);

  const selectedSecondaryChurchObj = useMemo(() => {
    return allChurches.find((c) => c.id === secondaryChurchId);
  }, [allChurches, secondaryChurchId]);

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

      secondary_church_id: hasSecondaryChurch && secondaryChurchId ? secondaryChurchId : undefined,
      secondary_diocese_id: hasSecondaryChurch && secondaryDioceseId ? secondaryDioceseId : undefined,
      secondary_church_name:
        hasSecondaryChurch && selectedSecondaryChurchObj
          ? isRtl
            ? selectedSecondaryChurchObj.name_ar
            : selectedSecondaryChurchObj.name_en
          : undefined,
      secondary_diocese_name:
        hasSecondaryChurch && secondaryDioceseObj
          ? isRtl
            ? secondaryDioceseObj.name_ar
            : secondaryDioceseObj.name_en
          : undefined,
    };

    try {
      await onSubmitAction(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0B0F17] flex flex-col justify-between items-center p-4 sm:p-6"
    >
      {/* Centered Onboarding Card Surface */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-2xl sm:max-w-3xl mt-6 sm:mt-10"
      >
        <div className="bg-[#131B2A] rounded-3xl border border-slate-800 shadow-2xl shadow-black/60 p-6 sm:p-8 md:p-10 space-y-6">
          {/* ── Progress Header ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              {/* Left: App Emblem */}
              <div className="w-9 h-9 rounded-xl bg-[#182234] border border-slate-700/80 shadow-xs flex items-center justify-center p-1.5 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Politia"
                  width={28}
                  height={28}
                  priority
                  style={{ height: 'auto' }}
                  className="object-contain"
                />
              </div>

              {/* Right: Unified Step Badge */}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-800/60 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <bdi>
                  {isRtl
                    ? `الخطوة ${currentStep} من ${totalSteps} • الإلتزام الكنسي`
                    : `Step ${currentStep} of ${totalSteps} • Church Commitment`}
                </bdi>
              </span>
            </div>

            {/* Progress Bar (86% width for Step 6 of 7) */}
            <div className="h-1.5 w-full bg-[#182234] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* ── Header Typography ── */}
          <div className="space-y-1.5 pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
              <ChurchIcon className="w-7 h-7 text-blue-500 shrink-0" />
              <span>{isRtl ? 'الكنائس التابع لها' : 'Primary & Secondary Churches'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              <bdi>
                {isRtl
                  ? 'اختر كنيستك الأساسية والإيبارشية التابع لها لتنظيم خدماتك الكنسية.'
                  : 'Select your primary parish and diocese to structure your ecclesiastical record.'}
              </bdi>
            </p>
          </div>

          {/* ── PRIMARY CHURCH SECTION ── */}
          <div className="p-5 rounded-2xl bg-[#182234]/80 border border-slate-700/80 space-y-4">
            <AccountPickerChurchDropdown
              id="primary-church-select"
              label="Primary Church (Parish)"
              labelAr="الكنيسة الأساسية (كنيسة الإقامة)"
              required
              value={primaryChurchId}
              onChange={handlePrimaryChurchChange}
              churches={allChurches}
              isRtl={isRtl}
              placeholder="Select primary church..."
              placeholderAr="اختر الكنيسة الأساسية..."
              error={errors.primaryChurchId}
            />

            {/* Auto-Linked Diocese Display */}
            {primaryDioceseObj && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <bdi>
                  {isRtl
                    ? `✓ تم ربط الإيبارشية تلقائياً: ${primaryDioceseObj.name_ar}`
                    : `✓ Auto-linked Diocese: ${primaryDioceseObj.name_en}`}
                </bdi>
              </motion.div>
            )}
          </div>

          {/* ── SECONDARY CHURCH SECTION ── */}
          {!hasSecondaryChurch ? (
            <motion.button
              whileHover={tapScale.hover}
              whileTap={tapScale.tap}
              type="button"
              onClick={() => setHasSecondaryChurch(true)}
              className="w-full py-3.5 px-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500/80 bg-[#182234]/40 hover:bg-blue-950/30 text-xs font-semibold text-blue-400 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>
                {isRtl
                  ? '+ إضافة كنيسة ثانوية (كنيسة العمل / كنيسة أخرى تتردد عليها)'
                  : '+ Add Secondary Church (Workplace / Vacation Parish)'}
              </span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#182234]/80 border border-blue-900/60 space-y-4"
            >
              {/* Secondary Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <ChurchIcon className="w-4 h-4" />
                  <span>{isRtl ? 'الكنيسة الثانوية (اختياري)' : 'Secondary Church (Optional)'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setHasSecondaryChurch(false);
                    setSecondaryChurchId('');
                    setSecondaryDioceseId('');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إزالة' : 'Remove'}</span>
                </button>
              </div>

              {/* Secondary Church Account-Picker */}
              <AccountPickerChurchDropdown
                id="secondary-church-select"
                label="Secondary Church"
                labelAr="الكنيسة الثانوية"
                value={secondaryChurchId}
                onChange={handleSecondaryChurchChange}
                churches={allChurches}
                isRtl={isRtl}
                placeholder="Select secondary church (optional)..."
                placeholderAr="اختر كنيسة أخرى تتردد عليها (اختياري)..."
              />

              {/* Secondary Auto-Linked Diocese */}
              {secondaryDioceseObj && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <bdi>
                    {isRtl
                      ? `✓ تم ربط إيبارشية الكنيسة الثانوية: ${secondaryDioceseObj.name_ar}`
                      : `✓ Auto-linked Secondary Diocese: ${secondaryDioceseObj.name_en}`}
                  </bdi>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Navigation Controls ── */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
            {/* Ghost Back Button */}
            <motion.button
              whileTap={tapScale.tap}
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-300 border border-slate-700/80 hover:bg-slate-800/80 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer active:scale-[0.98]"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
            </motion.button>

            {/* High-Contrast Primary Next Button */}
            <motion.button
              whileHover={!isSubmitting ? tapScale.hover : undefined}
              whileTap={!isSubmitting ? tapScale.tap : undefined}
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <bdi>{isRtl ? 'جارٍ الحفظ...' : 'Saving...'}</bdi>
                </>
              ) : (
                <>
                  <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Step6ChurchCommitment;
