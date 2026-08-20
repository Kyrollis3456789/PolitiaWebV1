'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Globe,
} from 'lucide-react';

type GenderOption = 'male' | 'female' | 'other' | 'prefer-not-to-say';

interface GenderOptionItem {
  id: GenderOption;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  emoji: string;
}

const GENDER_OPTIONS: GenderOptionItem[] = [
  {
    id: 'male',
    label: 'Male',
    labelAr: 'ذكر',
    icon: <User className="w-5 h-5" />,
    emoji: '👨',
  },
  {
    id: 'female',
    label: 'Female',
    labelAr: 'أنثى',
    icon: <User className="w-5 h-5" />,
    emoji: '👩',
  },
  {
    id: 'other',
    label: 'Non-binary / Other',
    labelAr: 'غير ثنائي / أخرى',
    icon: <Users className="w-5 h-5" />,
    emoji: '🌈',
  },
  {
    id: 'prefer-not-to-say',
    label: 'Prefer not to say',
    labelAr: 'أفضل عدم الإجابة',
    icon: <ShieldCheck className="w-5 h-5" />,
    emoji: '🔒',
  },
];

interface GenderStepProps {
  onNext?: (selected: GenderOption) => void;
  onBack?: () => void;
  initialValue?: GenderOption | null;
  isRtl?: boolean;
}

export function GenderStep({
  onNext,
  onBack,
  initialValue = null,
  isRtl = false,
}: GenderStepProps) {
  const [selected, setSelected] = useState<GenderOption | null>(initialValue);

  const handleNext = () => {
    if (selected && onNext) {
      onNext(selected);
    }
  };

  const progressPercent = 50; // Step 3 of 6

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 flex flex-col justify-between items-center p-4 sm:p-6"
    >
      {/* Main Card */}
      <div className="w-full max-w-2xl mt-6 sm:mt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 md:p-10">
          {/* Progress Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Brand Icon */}
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-1 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Politia"
                  width={24}
                  height={24}
                  style={{ height: 'auto' }}
                  className="object-contain"
                />
              </div>

              {/* Consolidated Progress Badge */}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <span className="w-1 h-1 rounded-full bg-blue-500" />
                <bdi>
                  {isRtl
                    ? 'الخطوة 3 من 6 • المعلومات الشخصية'
                    : 'Step 3 of 6 • Personal Info'}
                </bdi>
              </span>
            </div>

            {/* Slim Animated Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Header Typography */}
          <div className="mt-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              <bdi>{isRtl ? 'اختر جنسك' : 'Select your gender'}</bdi>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              <bdi>
                {isRtl
                  ? 'ساعدنا في تخصيص ملفك الشخصي وتجربتك.'
                  : 'Help us personalize your profile and experience.'}
              </bdi>
            </p>
          </div>

          {/* Interactive Option Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
            {GENDER_OPTIONS.map((option) => {
              const isSelected = selected === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected(option.id)}
                  className={`relative p-5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
                  }`}
                >
                  {/* Left: Icon + Label */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                    >
                      <span>{option.emoji}</span>
                    </div>
                    <div className="text-start">
                      <span
                        className={`text-sm font-semibold block transition-colors ${
                          isSelected
                            ? 'text-blue-700'
                            : 'text-slate-800 group-hover:text-slate-900'
                        }`}
                      >
                        <bdi>{isRtl ? option.labelAr : option.label}</bdi>
                      </span>
                    </div>
                  </div>

                  {/* Right: Checkmark */}
                  <div
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-75'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
            {/* Back Button */}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer active:scale-[0.98]"
            >
              {isRtl ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={!selected}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <bdi>{isRtl ? 'التالي' : 'Continue'}</bdi>
              {isRtl ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="w-full max-w-2xl mt-8 mb-2 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        {/* Language Selector */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isRtl ? 'العربية' : 'English (US)'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Footer Links */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <a href="#" className="hover:text-slate-600 transition-colors">
            {isRtl ? 'الشروط' : 'Terms'}
          </a>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <a href="#" className="hover:text-slate-600 transition-colors">
            {isRtl ? 'الخصوصية' : 'Privacy'}
          </a>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <a href="#" className="hover:text-slate-600 transition-colors">
            {isRtl ? 'المساعدة' : 'Help'}
          </a>
        </div>
      </footer>
    </div>
  );
}
