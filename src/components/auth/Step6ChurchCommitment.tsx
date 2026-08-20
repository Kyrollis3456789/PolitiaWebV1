'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Church as ChurchIcon,
  MapPin,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Building,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';
import { Diocese, Church, Step6ChurchPayload } from '@/types/database.types';

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

export default function Step6ChurchCommitment({
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

  // --- Secondary Church State ---
  const [hasSecondaryChurch, setHasSecondaryChurch] = useState<boolean>(
    Boolean(defaultValues?.secondary_church_id) || Boolean(secondaryCityId)
  );
  const [secondaryChurchId, setSecondaryChurchId] = useState<string>(defaultValues?.secondary_church_id || '');
  const [secondaryDioceseId, setSecondaryDioceseId] = useState<string>(defaultValues?.secondary_diocese_id || '');
  const [showAllSecondaryChurches, setShowAllSecondaryChurches] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter Primary Churches by primaryCityId
  const primaryFilteredChurches = useMemo(() => {
    if (showAllPrimaryChurches || !primaryCityId) {
      return allChurches;
    }
    const filtered = allChurches.filter((c) => c.city_id === primaryCityId);
    return filtered.length > 0 ? filtered : allChurches;
  }, [allChurches, primaryCityId, showAllPrimaryChurches]);

  // Filter Secondary Churches by secondaryCityId
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

  // Auto-detect & sync Diocese when Secondary Church changes
  const handleSecondaryChurchChange = (churchId: string) => {
    setSecondaryChurchId(churchId);

    const selectedChurch = allChurches.find((c) => c.id === churchId);
    if (selectedChurch && selectedChurch.diocese_id) {
      setSecondaryDioceseId(selectedChurch.diocese_id);
    }
  };

  // Lookup Diocese names for display
  const primaryDioceseObj = useMemo(() => {
    return allDioceses.find((d) => d.id === primaryDioceseId);
  }, [allDioceses, primaryDioceseId]);

  const secondaryDioceseObj = useMemo(() => {
    return allDioceses.find((d) => d.id === secondaryDioceseId);
  }, [allDioceses, secondaryDioceseId]);

  // Selected Church objects for descriptive payload
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

            {/* Primary Church Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <span>{isRtl ? 'اختر الكنيسة التابع لها' : 'Select Primary Church'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={primaryChurchId}
                onChange={(e) => handlePrimaryChurchChange(e.target.value)}
                className={clsx(
                  "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer",
                  errors.primaryChurchId ? "border-red-500 bg-red-50/20" : "border-slate-300 dark:border-slate-700"
                )}
              >
                <option value="" className="bg-white dark:bg-slate-900">
                  {isRtl ? 'اختر كنيستك الأساسية...' : 'Select your primary church...'}
                </option>
                {primaryFilteredChurches.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-white dark:bg-slate-900">
                    {isRtl ? ch.name_ar : ch.name_en}
                  </option>
                ))}
              </select>
              {errors.primaryChurchId && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.primaryChurchId}</p>
              )}
            </div>

            {/* Auto-detected Diocese (Read-only / Synced) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRtl ? 'الإيبارشية / المطرانية' : 'Diocese / Region'}</span>
              </label>
              <select
                value={primaryDioceseId}
                onChange={(e) => setPrimaryDioceseId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-slate-900">
                  {isRtl ? 'يتم التحديد تلقائياً مع اختيار الكنيسة' : 'Auto-detected with church selection'}
                </option>
                {allDioceses.map((d) => (
                  <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900">
                    {isRtl ? d.name_ar : d.name_en}
                  </option>
                ))}
              </select>
              {primaryDioceseObj && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>
                    {isRtl
                      ? `تم ربط الإيبارشية تلقائياً: ${primaryDioceseObj.name_ar}`
                      : `Auto-linked Diocese: ${primaryDioceseObj.name_en}`}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* SECONDARY CHURCH SECTION */}
          {!hasSecondaryChurch ? (
            <button
              type="button"
              onClick={() => setHasSecondaryChurch(true)}
              className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 text-xs font-semibold text-blue-600 dark:text-blue-400 transition flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{isRtl ? 'إضافة كنيسة ثانوية (كنيسة العمل / كنيسة أخرى تتردد عليها)' : '+ Add Secondary Church (Workplace / Vacation Parish)'}</span>
            </button>
          ) : (
            <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-blue-200 dark:border-blue-900/40 p-4 shadow-xs space-y-3.5 animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <ChurchIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{isRtl ? 'الكنيسة الثانوية (اختياري)' : 'Secondary Church (Optional)'}</span>
                </span>

                <div className="flex items-center gap-3">
                  {secondaryCityId && (
                    <button
                      type="button"
                      onClick={() => setShowAllSecondaryChurches(!showAllSecondaryChurches)}
                      className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {showAllSecondaryChurches
                        ? isRtl
                          ? 'عرض كنائس العنوان الثانوي'
                          : 'Secondary area only'
                        : isRtl
                        ? 'عرض كل الكنائس'
                        : 'Show all'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setHasSecondaryChurch(false);
                      setSecondaryChurchId('');
                      setSecondaryDioceseId('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-2 py-1 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isRtl ? 'إلغاء' : 'Remove'}</span>
                  </button>
                </div>
              </div>

              {/* Secondary Church Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'اختر الكنيسة الثانوية' : 'Select Secondary Church'}
                </label>
                <select
                  value={secondaryChurchId}
                  onChange={(e) => handleSecondaryChurchChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-slate-900">
                    {isRtl ? 'اختر كنيسة أخرى تتردد عليها (اختياري)...' : 'Select another church you attend (optional)...'}
                  </option>
                  {secondaryFilteredChurches.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-white dark:bg-slate-900">
                      {isRtl ? ch.name_ar : ch.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Diocese */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? 'إيبارشية الكنيسة الثانوية' : 'Secondary Diocese'}</span>
                </label>
                <select
                  value={secondaryDioceseId}
                  onChange={(e) => setSecondaryDioceseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-slate-900">
                    {isRtl ? 'يتم التحديد تلقائياً مع اختيار الكنيسة' : 'Auto-detected with church selection'}
                  </option>
                  {allDioceses.map((d) => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900">
                      {isRtl ? d.name_ar : d.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
