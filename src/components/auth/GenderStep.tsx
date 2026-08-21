'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { tapScale } from '@/lib/animations/transitions';

export type GenderValue = 'male' | 'female' | 'prefer-not-to-say';
export type GenderOptionValue = GenderValue;

interface GenderCardData {
  id: GenderValue;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
}

/* Minimalist Line-Art Gender Icons */
function MaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="14" r="5" />
      <path d="M19 5l-5.4 5.4" />
      <path d="M15 5h4v4" />
    </svg>
  );
}

function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7" />
      <path d="M9 18h6" />
    </svg>
  );
}

const GENDER_CARDS: GenderCardData[] = [
  {
    id: 'male',
    label: 'Male',
    labelAr: 'ذكر',
    icon: <MaleIcon className="w-6 h-6" />,
  },
  {
    id: 'female',
    label: 'Female',
    labelAr: 'أنثى',
    icon: <FemaleIcon className="w-6 h-6" />,
  },
  {
    id: 'prefer-not-to-say',
    label: 'Prefer not to say',
    labelAr: 'أفضل عدم الإجابة',
    icon: <ShieldCheck className="w-6 h-6" />,
  },
];

interface GenderStepProps {
  onNext?: (selected: GenderValue) => void;
  onBack?: () => void;
  onNavigateLogin?: () => void;
  initialValue?: GenderValue | null;
  isRtl?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export function GenderStep({
  onNext,
  onBack,
  onNavigateLogin,
  initialValue = null,
  isRtl = false,
  currentStep = 1,
  totalSteps = 7,
}: GenderStepProps) {
  const [selected, setSelected] = useState<GenderValue | null>(initialValue);

  const handleNext = () => {
    if (selected && onNext) {
      onNext(selected);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, val: GenderValue) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setSelected(val);
    }
  };

  // Accurate 14% progress bar for Step 1 of 7
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 flex flex-col justify-between items-center p-4 sm:p-6"
    >
      {/* Centered Onboarding Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-2xl mt-6 sm:mt-12"
      >
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 md:p-10">
          {/* ── Progress Header ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              {/* Left: App Emblem */}
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-1.5 shrink-0">
                <Image
                  src="/logo.webp"
                  alt="Politia"
                  width={28}
                  height={28}
                  priority
                  style={{ height: 'auto' }}
                  className="object-contain"
                />
              </div>

              {/* Right: Unified Step & Progress Badge */}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <bdi>
                  {isRtl
                    ? `الخطوة ${currentStep} من ${totalSteps} • المعلومات الشخصية`
                    : `Step ${currentStep} of ${totalSteps} • Personal Info`}
                </bdi>
              </span>
            </div>

            {/* Slim Animated Progress Bar (14% width for Step 1 of 7) */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              />
            </div>
          </div>

          {/* ── Typography & Subtext ── */}
          <div className="mt-7 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              <bdi>{isRtl ? 'اختر الجنس' : 'Select your gender'}</bdi>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              <bdi>
                {isRtl
                  ? 'اختر الخيار الذي يصفك بشكل أفضل.'
                  : 'Choose the option that best describes you.'}
              </bdi>
            </p>
          </div>

          {/* ── Interactive Selection Cards Grid (Accessible Radio Group) ── */}
          <div
            role="radiogroup"
            aria-label={isRtl ? 'اختيار الجنس' : 'Select your gender'}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8"
          >
            {GENDER_CARDS.map((card) => {
              const isSelected = selected === card.id;

              return (
                <div
                  key={card.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => setSelected(card.id)}
                  onKeyDown={(e) => handleKeyDown(e, card.id)}
                  className={`relative p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-sm'
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/70'
                    }`}
                >
                  {/* Icon Container */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                  >
                    {card.icon}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${isSelected ? 'text-blue-700' : 'text-slate-800'
                      }`}
                  >
                    <bdi>{isRtl ? card.labelAr : card.label}</bdi>
                  </span>

                  {/* Top-Right Indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-3 end-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-100" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* ── Navigation Controls ── */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
            {/* Back Button */}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-600 border border-slate-200 hover:bg-slate-100 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={!selected}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Auxiliary Page Footer ── */}
      <footer className="w-full max-w-2xl mt-8 mb-3 flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
        {/* Language Switcher Dropdown */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-slate-200/50"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{isRtl ? 'العربية' : 'English (US)'}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Auxiliary Links */}
        <nav className="flex items-center gap-4 text-xs text-slate-500">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="hover:text-blue-600 transition-colors cursor-pointer font-medium"
          >
            {isRtl ? 'تسجيل الدخول بدلاً من ذلك' : 'Sign in instead'}
          </button>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <a href="#" className="hover:text-slate-700 transition-colors">
            {isRtl ? 'المساعدة' : 'Help'}
          </a>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <a href="#" className="hover:text-slate-700 transition-colors">
            {isRtl ? 'الخصوصية' : 'Privacy'}
          </a>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <a href="#" className="hover:text-slate-700 transition-colors">
            {isRtl ? 'الشروط' : 'Terms'}
          </a>
        </nav>
      </footer>
    </div>
  );
}
