'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';
import { Step1Substeps, Step1Data } from './steps/Step1Substeps';
import { Step2Substeps, Step2Data } from './steps/Step2Substeps';
import { validateEnglishName, validateArabicName } from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';
import { createAccountAction, CreateAccountPayload } from '@/app/actions/create-account';

export function CreateAccountWizard() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [mainStep, setMainStep] = useState<1 | 2>(1);
  const [substep1, setSubstep1] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [substep2, setSubstep2] = useState<1 | 2 | 3 | 4>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
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
          return true; // Optional email
        case 3:
          return true; // Optional landline
        case 4:
          return true; // Optional socials
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      let avatarBase64: string | undefined;
      let avatarFileName: string | undefined;

      if (step1Data.avatarFile) {
        avatarBase64 = await fileToBase64(step1Data.avatarFile);
        avatarFileName = step1Data.avatarFile.name;
      }

      const payload: CreateAccountPayload = {
        englishName: step1Data.englishName,
        hasNameCollision: step1Data.hasNameCollision,
        arabicName: step1Data.arabicName,
        dob: step1Data.dob,
        gender: step1Data.gender || 'Male',
        nationalId: step1Data.nationalId,
        avatarBase64,
        avatarFileName,
        photoSkippedGracePeriod: step1Data.photoSkippedGracePeriod,
        phones: step2Data.phones,
        emails: step2Data.emails,
        landlineAreaCode: step2Data.landlineAreaCode,
        landlineNumber: step2Data.landlineNumber,
        socials: step2Data.socials,
      };

      const result = await createAccountAction(payload);

      if (!result.success) {
        setSubmissionError(result.error || (isRtl ? 'حدث خطأ أثناء إنشاء الحساب' : 'Failed to create account.'));
        setIsSubmitting(false);
        return;
      }

      setSubmissionSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSubmissionError(msg);
      setIsSubmitting(false);
    }
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
    creatingAccount: isRtl ? 'جاري إنشاء وتوثيق الحساب...' : 'Creating and verifying account...',
    alreadyHaveAccount: isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    signInLink: isRtl ? 'تسجيل الدخول' : 'Sign In',
    successTitle: isRtl ? 'تم إنشاء وتوثيق الحساب بنجاح!' : 'Account Created & Verified!',
    successSubtitle: isRtl
      ? 'تم تسجيل ملفك الشخصي الشامل في قاعدة البيانات وجاري نقلك تلقائياً إلى لوحة التحكم...'
      : 'Your universal lifetime profile has been registered in Supabase. Redirecting to your dashboard...',
    proceedToDashboard: isRtl ? 'الانتقال المباشر للوحة التحكم' : 'Go to Dashboard',
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
            href="/dashboard"
            className="inline-flex items-center justify-center py-3.5 px-8 rounded-2xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow-lg cursor-pointer"
          >
            <bdi>{t.proceedToDashboard}</bdi>
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

      {submissionError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-3 text-start"
        >
          <span className="text-base">⚠️</span>
          <span className="flex-1"><bdi>{submissionError}</bdi></span>
        </div>
      )}

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
            disabled={isSubmitting}
            className="py-3 px-5 rounded-2xl text-sm font-semibold border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] active:scale-95 transition disabled:opacity-40 cursor-pointer"
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
            className="py-3 px-7 rounded-2xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span><bdi>{t.creatingAccount}</bdi></span>
              </>
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