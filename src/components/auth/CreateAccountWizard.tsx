'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';
import { Step1Substeps, Step1Data } from './steps/Step1Substeps';
import { Step2Substeps, Step2Data } from './steps/Step2Substeps';
import { validateEnglishName, validateArabicName } from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';

export function CreateAccountWizard() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [mainStep, setMainStep] = useState<1 | 2>(1);
  const [substep1, setSubstep1] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [substep2, setSubstep2] = useState<1 | 2 | 3 | 4>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Step 1 State
  const [step1Data, setStep1Data] = useState<Step1Data>({
    englishName: '',
    hasNameCollision: false,
    arabicName: '',
    dob: '',
    gender: null,
    nationalId: '',
    avatarFile: null,
    avatarPreview: null,
    photoSkippedGracePeriod: false,
  });

  // Step 2 State
  const [step2Data, setStep2Data] = useState<Step2Data>({
    phones: [{ countryCode: '+20', number: '', isPrimary: true }],
    emails: [{ email: '', isPrimary: true }],
    landlineAreaCode: '',
    landlineNumber: '',
    socials: {
      facebook: { url: '' },
      instagram: { url: '' },
      tiktok: { url: '' },
      snapchat: { url: '' },
      threads: { url: '' },
      x: { url: '' },
      github: { url: '' },
      linkedin: { url: '' },
    },
  });

  // Sub-step Validation Gates
  const isCurrentSubstepValid = (): boolean => {
    if (mainStep === 1) {
      switch (substep1) {
        case 1:
          return validateEnglishName(step1Data.englishName, step1Data.hasNameCollision).isValid;
        case 2:
          return validateArabicName(
            step1Data.arabicName,
            step1Data.hasNameCollision ? 5 : 4
          ).isValid;
        case 3:
          return !!step1Data.dob;
        case 4:
          return step1Data.gender !== null;
        case 5:
          return validateEgyptianNationalId(
            step1Data.nationalId,
            step1Data.dob || undefined,
            step1Data.gender || undefined
          ).isValid;
        case 6:
          return !!step1Data.avatarFile || !!step1Data.avatarPreview || step1Data.photoSkippedGracePeriod;
        default:
          return false;
      }
    } else {
      switch (substep2) {
        case 1:
          return step2Data.phones[0]?.number.trim().length >= 8;
        case 2:
          // Optional email
          return true;
        case 3:
          // Optional landline
          return true;
        case 4:
          // Optional socials
          return true;
        default:
          return false;
      }
    }
  };

  const handleNext = () => {
    if (!isCurrentSubstepValid()) return;

    if (mainStep === 1) {
      if (substep1 < 6) {
        setSubstep1((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5 | 6);
      } else {
        setMainStep(2);
        setSubstep2(1);
      }
    } else {
      if (substep2 < 4) {
        setSubstep2((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (mainStep === 1) {
      if (substep1 > 1) {
        setSubstep1((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5 | 6);
      }
    } else {
      if (substep2 > 1) {
        setSubstep2((prev) => (prev - 1) as 1 | 2 | 3 | 4);
      } else {
        setMainStep(1);
        setSubstep1(6);
      }
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
    }, 1200);
  };

  // Progress Calculations
  const totalSubsteps = 10;
  const currentSubstepIndex = mainStep === 1 ? substep1 : 6 + substep2;
  const progressPercent = Math.round((currentSubstepIndex / totalSubsteps) * 100);

  const t = {
    wizardHeader: isRtl ? 'إنشاء حساب جديد' : 'Create Your Lifetime Profile',
    step1Title: isRtl ? 'الخطوة 1: المعلومات الأساسية' : 'Step 1: Basic Information',
    step2Title: isRtl ? 'الخطوة 2: بيانات الاتصال والتواصل' : 'Step 2: Contact & Social Media',
    substepProgress: isRtl
      ? `المرحلة ${currentSubstepIndex} من ${totalSubsteps}`
      : `Step ${currentSubstepIndex} of ${totalSubsteps}`,
    nextBtn: isRtl ? 'المتابعة ←' : 'Continue →',
    backBtn: isRtl ? '→ السابق' : '← Back',
    completeBtn: isRtl ? 'إتمام التسجيل وتأكيد الحساب' : 'Complete Registration',
    alreadyHaveAccount: isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    signInLink: isRtl ? 'تسجيل الدخول' : 'Sign In',
    successTitle: isRtl ? 'تم التحقق من البيانات وتجهيز الحساب!' : 'Lifetime Profile Verified!',
    successSubtitle: isRtl
      ? 'تم مطابقة الاسم، وتأكيد تاريخ الميلاد، والتحقق التلقائي من الرقم القومي، وحفظ بيانات الاتصال بنجاح.'
      : 'All basic identity, bilingual name, age derivation, National ID cross-checks, and contact records have been validated.',
    proceedToLogin: isRtl ? 'الانتقال إلى تسجيل الدخول' : 'Proceed to Sign In',
  };

  if (submissionSuccess) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-4xl mx-auto shadow-md">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            <bdi>{t.successTitle}</bdi>
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
            <bdi>{t.successSubtitle}</bdi>
          </p>
        </div>
        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            href="/login"
            className="inline-flex items-center justify-center py-3.5 px-8 rounded-2xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow-lg cursor-pointer"
          >
            <bdi>{t.proceedToLogin}</bdi>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl transition-all">
      {/* Header & Main Step Indicator */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] mb-3 font-bold text-xl shadow">
          P
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          <bdi>{t.wizardHeader}</bdi>
        </h1>
        <p className="text-xs font-semibold text-[var(--primary)] mt-1 uppercase tracking-wider">
          <bdi>{mainStep === 1 ? t.step1Title : t.step2Title}</bdi>
        </p>
      </div>

      {/* Progress Bar & Substep Counter */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
          <span><bdi>{t.substepProgress}</bdi></span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dynamic Sub-step Card */}
      <div className="min-h-[280px] flex flex-col justify-center">
        {mainStep === 1 ? (
          <Step1Substeps
            substep={substep1}
            data={step1Data}
            onChange={(updated) => setStep1Data((prev) => ({ ...prev, ...updated }))}
            isRtl={isRtl}
          />
        ) : (
          <Step2Substeps
            substep={substep2}
            data={step2Data}
            onChange={(updated) => setStep2Data((prev) => ({ ...prev, ...updated }))}
            isRtl={isRtl}
          />
        )}
      </div>

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-[var(--border)]">
        {mainStep > 1 || substep1 > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="py-3 px-5 rounded-2xl text-sm font-semibold border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] active:scale-95 transition cursor-pointer"
          >
            <bdi>{t.backBtn}</bdi>
          </button>
        ) : (
          <div />
        )}

        {mainStep === 2 && substep2 === 4 ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!isCurrentSubstepValid() || isSubmitting}
            className="py-3 px-7 rounded-2xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span>...</span>
            ) : (
              <bdi>{t.completeBtn}</bdi>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentSubstepValid()}
            className="py-3 px-7 rounded-2xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <bdi>{t.nextBtn}</bdi>
          </button>
        )}
      </div>

      {/* Link to Sign In */}
      <div className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        <span><bdi>{t.alreadyHaveAccount}</bdi> </span>
        <Link href="/login" className="font-semibold text-[var(--foreground)] hover:underline">
          <bdi>{t.signInLink}</bdi>
        </Link>
      </div>
    </div>
  );
}